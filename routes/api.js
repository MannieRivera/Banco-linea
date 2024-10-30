const express = require('express');
const router = express.Router();
const { getConnection } = require('../db/database');


router.get('/datos', async (req, res) => {
    let connection;

    try {
        console.log('Conectando a base de datos...');
        connection = await getConnection();

        console.log('Ejecutando el query...');
        const result = await connection.execute('SELECT ID, NOMBRE, CORREO, TELEFONO FROM cliente');

        console.log('Query ejecutada correctamente:', result);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al ejecutar el query:', err);
        res.status(500).send('Error en la base de datos');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error coneccion cerrada:', err);
            }
        }
    }
});

router.post('/cliente', async (req, res) => {
    const { id, nombre, correo, telefono } = req.body;
    let connection;

    try {
        console.log('Connecting to the database...');
        connection = await getConnection();

        console.log('Inserting new client...');
        const result = await connection.execute(
            `INSERT INTO cliente (id, nombre, correo, telefono) VALUES (:id, :nombre, :correo, :telefono)`,
            [id, nombre, correo, telefono],
            { autoCommit: true } 
        );

        console.log('Client inserted successfully:', result);
        res.json({ message: 'Cliente agregado correctamente', result }); 
    } catch (err) {
        console.error('Error inserting client:', err);
        res.status(500).json({ error: 'Error al agregar el cliente' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});


router.put('/cliente/:id', async (req, res) => {
    const { id } = req.params; 
    const { nombre, correo, telefono } = req.body; 
    let connection;

    try {
        console.log('CONECTANDO A BASE DE DATOS...');
        connection = await getConnection();

        console.log('MODIFICANDO CLIENTE...');
        const result = await connection.execute(
            `UPDATE cliente SET nombre = :nombre, correo = :correo, telefono = :telefono WHERE id = :id`,
            [nombre, correo, telefono, id],
            { autoCommit: true } 
        );

        console.log('Cliente creado correctamente:', result);
        res.json({ message: 'Cliente modificado correctamente', result }); 
    } catch (err) {
        console.error('Error al modificar cliente :', err);
        res.status(500).json({ error: 'Error al modificar el cliente' }); 
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error cerrando connection:', err);
            }
        }
    }
});

router.delete('/cliente/:id', async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        console.log('Conectando a base de datos...');
        connection = await getConnection();

        console.log('Eliminando cliente...');
        const result = await connection.execute(
            `DELETE FROM cliente WHERE id = :id`,
            [id],
            { autoCommit: true }
        );

        console.log('Cliente eliminado correctamente:', result);
        res.json({ message: 'Cliente eliminado correctamente', result });
    } catch (err) {
        console.error('Error al eliminar cliente:', err);
        res.status(500).json({ error: 'Error al eliminar el cliente' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error cerrando connection:', err);
            }
        }
    }
});

// CRUD para la tabla tipos_de_cuenta
router.get('/tipos-de-cuenta', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute('SELECT id, descripcion FROM tipos_de_cuenta');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener tipos de cuenta' });
    } finally {
        if (connection) await connection.close();
    }
});

// CRUD para la tabla cuenta
router.post('/cuentas', async (req, res) => {
    const { id, no_cuenta, id_tipo, fecha_apertura, id_moneda, id_cliente } = req.body;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `INSERT INTO cuenta (id, no_cuenta, id_tipo, fecha_apertura, id_moneda, id_cliente)
             VALUES (:id, :no_cuenta, :id_tipo, :fecha_apertura, :id_moneda, :id_cliente)`,
            [id, no_cuenta, id_tipo, fecha_apertura, id_moneda, id_cliente],
            { autoCommit: true }
        );
        res.json({ message: 'Cuenta creada correctamente', result });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear cuenta' });
    } finally {
        if (connection) await connection.close();
    }
});

router.get('/cuentas/:no_cuenta', async (req, res) => {
    const { no_cuenta } = req.params;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT c.no_cuenta, tc.descripcion AS tipo_cuenta, c.fecha_apertura
             FROM cuenta c
             JOIN tipos_de_cuenta tc ON c.id_tipo = tc.id
             WHERE c.no_cuenta = :no_cuenta`,
            [no_cuenta]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener cuentas' });
    } finally {
        if (connection) await connection.close();
    }
});

// CRUD moneda
router.get('/monedas', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute('SELECT id, descripcion FROM moneda');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener monedas' });
    } finally {
        if (connection) await connection.close();
    }
});

// CRUDmovimientos
router.get('/movimientos/:no_cuenta', async (req, res) => {
    const { no_cuenta } = req.params;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT m.descripcion, m.fecha, m.ingresos, m.egresos
             FROM movimientos m
             JOIN cuenta c ON m.id_cuenta = c.id
             WHERE c.no_cuenta = :no_cuenta`,
            [no_cuenta]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener movimientos' });
    } finally {
        if (connection) await connection.close();
    }
});


router.get('/cliente-informacion/:no_cuenta', async (req, res) => {
    const { no_cuenta } = req.params;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT c.no_cuenta, c.fecha_apertura, tc.descripcion AS tipo_cuenta, cl.nombre, cl.correo, cl.telefono, 
                    m.descripcion AS movimiento, m.fecha AS fecha_movimiento, m.ingresos, m.egresos
             FROM cuenta c
             JOIN tipos_de_cuenta tc ON c.id_tipo = tc.id
             JOIN cliente cl ON c.id_cliente = cl.id
             JOIN movimientos m ON m.id_cuenta = c.id
             WHERE c.no_cuenta = :no_cuenta`,
            [no_cuenta]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener información del cliente' });
    } finally {
        if (connection) await connection.close();
    }
});


module.exports = router;
