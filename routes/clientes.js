/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Gestión de Clientes.        
 */

const express = require('express');
const router = express.Router();
const { getConnection } = require('../db/database');





/**
 * @swagger
 * /Clientes:
 *   get:
 *     summary: Retorna lista de los clientes.
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID:
 *                     type: integer
 *                   NOMBRE:
 *                     type: string
 *                   CORREO:
 *                     type: string
 *                   TELEFONO:
 *                     type: string
 *     Respuestas:
 *       200:
 *         description: Se retorna la información.
 *       500:
 *         description: Error interno de servidor será necesario de validar errores.
 */
/*router.get('/datos', async (req, res) => {
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
}); */
router.get('/clientes', async (req, res) => {
    let connection;

    try {
        console.log('Conectando a base de datos...');
        connection = await getConnection();

        console.log('Ejecutando el query...');
        const result = await connection.execute('SELECT ID, NOMBRE, CORREO, TELEFONO FROM cliente');

        console.log('Query ejecutada correctamente:', result);

        // Transformar los datos en el formato deseado
        const transformedData = result.rows.map(row => ({
            id: row[0],         // ID
            nombre: row[1],     // NOMBRE
            correo: row[2],     // CORREO
            telefono: row[3]    // TELEFONO
        }));

        // Enviar los datos transformados como respuesta
        res.json(transformedData);
    } catch (err) {
        console.error('Error al ejecutar el query:', err);
        res.status(500).send('Error en la base de datos');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error cerrando conexión:', err);
            }
        }
    }
});

/**
 * @swagger
 * /cliente:
 *   post:
 *     summary: Agrega un nuevo cliente.
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente agregado correctamente.
 *       500:
 *         description: Error al agregar el cliente.
 */
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

/**
 * @swagger
 * /cliente/{id}:
 *   put:
 *     summary: Modifica un cliente existente.
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente modificado correctamente.
 *       500:
 *         description: Error al modificar el cliente.
 */
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
/**
 * @swagger
 * /cliente/{id}:
 *   delete:
 *     summary: Elimina un cliente.
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente.
 *       500:
 *         description: Error al eliminar el cliente.
 */
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


module.exports = router;