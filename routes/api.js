const express = require('express');
const router = express.Router();
const { getConnection } = require('../db/database');
const { verifyToken } = require('./authMiddleware');






/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Obtiene la lista de los cliente asociados a una cuenta.
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes exitosa.
 *       500:
 *         description: Error al obtener la lista de clientes.
 */
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

const axios = require('axios'); // Asegúrate de tener axios instalado: npm install axios

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

        // Primera ruta de  Pipedream
        const pipedreamData1 = {
            table: "cliente",
            data: {
                id,
                nombre,
                correo,
                telefono
            }
        };

        // segunda ruta de Pipedream
        const pipedreamData2 = {
            operacion: "INSERTAR",
            table: "cliente",
            data: {
                id,
                nombre,
                correo,
                telefono
            }
        };

        // Enviar datos a la primera ruta de Pipedream
        console.log('Mandando la información a la primera ruta de Pipedream...');
        await axios.post('https://eo2pkwqau6mfnmf.m.pipedream.net', pipedreamData1);
        console.log('Información enviada con éxito a la primera ruta de Pipedream.');

        // Enviar datos a la segunda ruta de Pipedream
        console.log('Mandando la información a la segunda ruta de Pipedream...');
        await axios.post('https://eomu44vlydsoye1.m.pipedream.net', pipedreamData2);
        console.log('Información enviada con éxito a la segunda ruta de Pipedream.');

        res.json({ message: 'Cliente agregado correctamente y datos enviados a Pipedream', result }); 
    } catch (err) {
        console.error('Error inserting client or sending data to Pipedream:', err);
        res.status(500).json({ error: 'Error al agregar el cliente o enviar datos a Pipedream' });
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

        console.log('MODIFICANDO CLIENTE EN LA BASE DE DATOS...');
        const result = await connection.execute(
            `UPDATE cliente SET nombre = :nombre, correo = :correo, telefono = :telefono WHERE id = :id`,
            [nombre, correo, telefono, id],
            { autoCommit: true }
        );

        console.log('Cliente modificado correctamente en la base de datos:', result);

        // Preparar datos para la primera ruta de Pipedream
        const pipedreamData1 = {
            table: "cliente",
            data: {
                telefono
            },
            condition: `id=${id}`
        };

        // Preparar datos para la segunda ruta de Pipedream
        const pipedreamData2 = {
            operacion: "ACTUALIZAR",
            table: "cliente",
            data: {
                telefono: "00000000" // 
            },
            conditions: `id=${id}`
        };

        // primera ruta de Pipedream
        console.log('ENVIANDO INFORMACIÓN A LA PRIMERA RUTA DE PIPEDREAM...');
        await axios.put('https://eo2pkwqau6mfnmf.m.pipedream.net', pipedreamData1);
        console.log('Información enviada con éxito a la primera ruta de Pipedream.');

        // segunda ruta de Pipedream
        console.log('ENVIANDO INFORMACIÓN A LA SEGUNDA RUTA DE PIPEDREAM...');
        await axios.put('https://eomu44vlydsoye1.m.pipedream.net', pipedreamData2);
        console.log('Información enviada con éxito a la segunda ruta de Pipedream.');

        res.json({ message: 'Cliente modificado correctamente y datos enviados a Pipedream', result });
    } catch (err) {
        console.error('Error al modificar cliente o enviar datos a Pipedream:', err);
        res.status(500).json({ error: 'Error al modificar el cliente o enviar datos a Pipedream' });
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

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        console.log('Cliente eliminado correctamente de la base de datos:', result);

       
        const route1Data = {
            table: "cliente",
            condition: `id=${id}`
        };

        console.log('Eliminando cliente en la primera ruta...');
        await axios.delete('https://eo2pkwqau6mfnmf.m.pipedream.net', route1Data);
        console.log('Cliente eliminado correctamente en la primera ruta.');

       
        const route2Data = {
            operacion: "BORRAR",
            table: "cliente",
            conditions: `id=${id}`
        };

        console.log('Eliminando cliente en la segunda ruta...');
        await axios.delete('https://eomu44vlydsoye1.m.pipedream.net', route2Data);
        console.log('Cliente eliminado correctamente en la segunda ruta.');

        res.json({ message: 'Cliente eliminado correctamente en todas las rutas' });
    } catch (err) {
        console.error('Error al eliminar cliente:', err);
        res.status(500).json({ error: 'Error al eliminar el cliente' });
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
 * /tipos-de-cuenta:
 *   get:
 *     summary: Obtiene la lista de tipos de cuenta.
 *     tags: [Tipos de Cuentas]
 *     responses:
 *       200:
 *         description: Lista de tipos de cuenta.
 *       500:
 *         description: Error al obtener tipos de cuenta.
 */
router.get('/tipos-de-cuenta', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute('SELECT id, descripcion FROM tipos_de_cuenta');
        
        // Transformar los datos en el formato deseado
        const transformedData = result.rows.map(row => ({
            id: row[0],          // ID del tipo de cuenta
            descripcion: row[1]  // Descripción del tipo de cuenta
        }));

        res.json(transformedData);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener tipos de cuenta' });
    } finally {
        if (connection) await connection.close();
    }
});
/**
 * @swagger
 * /tipos-de-cuenta:
 *   post:
 *     summary: Crea un nuevo tipo de cuenta.
 *     tags: [Tipos de Cuentas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tipo de cuenta creado correctamente.
 *       500:
 *         description: Error al crear tipo de cuenta.
 */
router.post('/tipos-de-cuenta', async (req, res) => {
    const { id, descripcion } = req.body;
    let connection;

    try {
        console.log('Conectando a la base de datos...');
        connection = await getConnection();

        console.log('Insertando tipo de cuenta...');
        const result = await connection.execute(
            `INSERT INTO tipos_de_cuenta (id, descripcion) VALUES (:id, :descripcion)`,
            [id, descripcion],
            { autoCommit: true }
        );

        console.log('Tipo de cuenta creado correctamente:', result);

        // Datos para la primera ruta de Pipedream
        const pipedreamData1 = {
            table: "tipos_de_cuenta",
            data: {
                id,
                descripcion
            }
        };

        // segunda ruta de Pipedream
        const pipedreamData2 = {
            operacion: "INSERTAR",
            table: "tipos_de_cuenta",
            data: {
                id,
                descripcion
            }
        };

        // primera ruta de Pipedream
        console.log('Mandando la información a la primera ruta de Pipedream...');
        await axios.post('https://eo2pkwqau6mfnmf.m.pipedream.net', pipedreamData1);
        console.log('Información enviada con éxito a la primera ruta de Pipedream.');

        // Enviar datos a la segunda ruta de Pipedream
        console.log('Mandando la información a la segunda ruta de Pipedream...');
        await axios.post('https://eomu44vlydsoye1.m.pipedream.net', pipedreamData2);
        console.log('Información enviada con éxito a la segunda ruta de Pipedream.');

        res.json({ message: 'Tipo de cuenta creado correctamente y datos enviados a Pipedream', result });
    } catch (err) {
        console.error('Error al crear tipo de cuenta o enviar datos a Pipedream:', err);
        res.status(500).json({ error: 'Error al crear tipo de cuenta o enviar datos a Pipedream' });
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
 * /tipos-de-cuenta/{id}:
 *   put:
 *     summary: Actualiza un tipo de cuenta existente.
 *     tags: [Tipos de Cuentas]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del tipo de cuenta a actualizar.
 *         schema:
 *           type: integer
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             descripcion:
 *               type: string
 *     responses:
 *       200:
 *         description: Tipo de cuenta actualizado correctamente.
 *       500:
 *         description: Error al actualizar tipo de cuenta.
 */
router.put('/tipos-de-cuenta/:id', async (req, res) => {
    const { id } = req.params;
    const { descripcion } = req.body;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `UPDATE tipos_de_cuenta SET descripcion = :descripcion WHERE id = :id`,
            { descripcion, id },
            { autoCommit: true }
        );
        res.json({ message: 'Tipo de cuenta actualizado correctamente', result });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar tipo de cuenta' });
    } finally {
        if (connection) await connection.close();
    }
});

/**
 * @swagger
 * /tipos-de-cuenta/{id}:
 *   delete:
 *     summary: Elimina un tipo de cuenta existente.
 *     tags: [Tipos de Cuentas]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del tipo de cuenta a eliminar.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de cuenta eliminado correctamente.
 *       500:
 *         description: Error al eliminar tipo de cuenta.
 */
router.delete('/tipos-de-cuenta/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `DELETE FROM tipos_de_cuenta WHERE id = :id`,
            [id],
            { autoCommit: true }
        );
        res.json({ message: 'Tipo de cuenta eliminado correctamente', result });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar tipo de cuenta' });
    } finally {
        if (connection) await connection.close();
    }
});

/**
 * @swagger
 * /cuentas:
 *   post:
 *     summary: Crea una nueva cuenta.
 *     tags: [Cuentas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               no_cuenta:
 *                 type: string
 *               id_tipo:
 *                 type: integer
 *               fecha_apertura:
 *                 type: string
 *                 format: date
 *               id_moneda:
 *                 type: integer
 *               id_cliente:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cuenta creada correctamente.
 *       500:
 *         description: Error al crear cuenta.
 */

router.post('/cuentas', async (req, res) => {
    const { id, no_cuenta, id_tipo, fecha_apertura, id_moneda, id_cliente } = req.body;
    let connection;

    try {
        console.log('Conectando a la base de datos...');
        connection = await getConnection();

        console.log('Insertando cuenta...');
        const result = await connection.execute(
            `INSERT INTO cuenta (id, no_cuenta, id_tipo, fecha_apertura, id_moneda, id_cliente)
             VALUES (:id, :no_cuenta, :id_tipo, :fecha_apertura, :id_moneda, :id_cliente)`,
            [id, no_cuenta, id_tipo, fecha_apertura, id_moneda, id_cliente],
            { autoCommit: true }
        );

        console.log('Cuenta creada correctamente:', result);

        // Datos para la primera ruta de Pipedream
        const pipedreamData1 = {
            table: "cuenta",
            data: {
                id,
                no_cuenta,
                id_tipo,
                fecha_apertura,
                id_moneda,
                id_cliente
            }
        };

        // Datos para la segunda ruta de Pipedream
        const pipedreamData2 = {
            operacion: "INSERTAR",
            table: "cuenta",
            data: {
                id,
                no_cuenta,
                id_tipo,
                fecha_apertura,
                id_moneda,
                id_cliente
            }
        };

        // Enviar datos a la primera ruta de Pipedream
        console.log('Mandando la información a la primera ruta de Pipedream...');
        await axios.post('https://eo2pkwqau6mfnmf.m.pipedream.net', pipedreamData1);
        console.log('Información enviada con éxito a la primera ruta de Pipedream.');

        // segunda ruta de Pipedream
        console.log('Mandando la información a la segunda ruta de Pipedream...');
        await axios.post('https://eomu44vlydsoye1.m.pipedream.net', pipedreamData2);
        console.log('Información enviada con éxito a la segunda ruta de Pipedream.');

        res.json({ message: 'Cuenta creada correctamente y datos enviados a Pipedream', result });
    } catch (err) {
        console.error('Error al crear cuenta o enviar datos a Pipedream:', err);
        res.status(500).json({ error: 'Error al crear cuenta o enviar datos a Pipedream' });
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
 * /cuentas:
 *   get:
 *     summary: Obtiene la lista de cuentas.
 *     tags: [Cuentas]
 *     responses:
 *       200:
 *         description: Lista de cuentas.
 *       500:
 *         description: Error al obtener cuentas.
 */
router.get('/cuentas', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT c.id, c.no_cuenta, tc.descripcion AS tipo_cuenta, c.fecha_apertura, m.descripcion AS moneda, cl.nombre AS cliente
             FROM cuenta c
             JOIN tipos_de_cuenta tc ON c.id_tipo = tc.id
             JOIN moneda m ON c.id_moneda = m.id
             JOIN cliente cl ON c.id_cliente = cl.id`
        );

        
        const cuentas = result.rows.map(row => ({
            id: row[0],                   
            noCuenta: row[1],             
            tipoCuenta: row[2],            
            fechaApertura: row[3],        
            moneda: row[4],                
            cliente: row[5]                
        }));

        res.json(cuentas);
    } catch (err) {
        console.error('Error al obtener cuentas:', err);
        res.status(500).json({ error: 'Error al obtener cuentas' });
    } finally {
        if (connection) await connection.close();
    }
});

/**
 * @swagger
 * /cuentas/{no_cuenta}:
 *   get:
 *     summary: Obtiene información de una cuenta por número de cuenta.
 *     tags: [Cuentas]
 *     parameters:
 *       - in: path
 *         name: no_cuenta
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Información de la cuenta.
 *       500:
 *         description: Error al obtener la cuenta.
 */
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

/**
 * @swagger
 * /cuentas/{no_cuenta}:
 *   put:
 *     summary: Actualiza una cuenta existente.
 *     tags: [Cuentas]
 *     parameters:
 *       - name: no_cuenta
 *         in: path
 *         required: true
 *         description: Número de cuenta a actualizar.
 *         schema:
 *           type: string
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id_tipo:
 *               type: integer
 *             fecha_apertura:
 *               type: string
 *               format: date
 *             id_moneda:
 *               type: integer
 *             id_cliente:
 *               type: integer
 *     responses:
 *       200:
 *         description: Cuenta actualizada correctamente.
 *       500:
 *         description: Error al actualizar cuenta.
 */
router.put('/cuentas/:no_cuenta', async (req, res) => {
    const { no_cuenta } = req.params;
    const { id_tipo, fecha_apertura, id_moneda, id_cliente } = req.body;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `UPDATE cuenta SET id_tipo = :id_tipo, fecha_apertura = :fecha_apertura, id_moneda = :id_moneda, id_cliente = :id_cliente 
             WHERE no_cuenta = :no_cuenta`,
            [id_tipo, fecha_apertura, id_moneda, id_cliente, no_cuenta],
            { autoCommit: true }
        );
        res.json({ message: 'Cuenta actualizada correctamente', result });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar cuenta' });
    } finally {
        if (connection) await connection.close();
    }
});

/**
 * @swagger
 * /cuentas/{no_cuenta}:
 *   delete:
 *     summary: Elimina una cuenta existente.
 *     tags: [Cuentas]
 *     parameters:
 *       - name: no_cuenta
 *         in: path
 *         required: true
 *         description: Número de cuenta a eliminar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cuenta eliminada correctamente.
 *       500:
 *         description: Error al eliminar cuenta.
 */
router.delete('/cuentas/:no_cuenta', async (req, res) => {
    const { no_cuenta } = req.params;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `DELETE FROM cuenta WHERE no_cuenta = :no_cuenta`,
            [no_cuenta],
            { autoCommit: true }
        );
        res.json({ message: 'Cuenta eliminada correctamente', result });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar cuenta' });
    } finally {
        if (connection) await connection.close();
    }
});




/**
 * @swagger
 * /movimientos/{no_cuenta}:
 *   get:
 *     summary: Obtiene la lista de movimientos de una cuenta específica.
 *     tags: [Cuentas]
 *     parameters:
 *       - name: no_cuenta
 *         in: path
 *         required: true
 *         description: Número de cuenta para obtener movimientos.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de movimientos.
 *       500:
 *         description: Error al obtener movimientos.
 */
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

      
        const transformedData = result.rows.map(row => ({
            descripcion: row[0],  
            fecha: row[1],       
            ingresos: row[2],     
            egresos: row[3]      
        }));

        res.json(transformedData);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener movimientos' });
    } finally {
        if (connection) await connection.close();
    }
});

/**
 * @swagger
 * /cliente-informacion/{no_cuenta}:
 *   get:
 *     summary: Obtiene información del cliente y movimientos relacionados.
 *     tags: [Cuentas]
 *     parameters:
 *       - name: no_cuenta
 *         in: path
 *         required: true
 *         description: Número de cuenta para obtener información del cliente.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Información del cliente y movimientos.
 *       500:
 *         description: Error al obtener información del cliente.
 */
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

        const transformedData = result.rows.map(row => ({
            noCuenta: row[0],                // Número de cuenta
            fechaApertura: row[1],           // Fecha de apertura
            tipoCuenta: row[2],              // Tipo de cuenta
            nombreCliente: row[3],           // Nombre del cliente
            correoCliente: row[4],           // Correo del cliente
            telefonoCliente: row[5],         // Teléfono del cliente
            descripcionMovimiento: row[6],   // Descripción del movimiento
            fechaMovimiento: row[7],         // Fecha del movimiento
            ingresos: row[8],                // Ingresos
            egresos: row[9]                  // Egresos
        }));

        res.json(transformedData);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener información del cliente' });
    } finally {
        if (connection) await connection.close();
    }
});

/**
 * @swagger
 * /movimientos:
 *   post:
 *     summary: Crea un nuevo movimiento.
 *     tags: [Movimientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date
 *               id_cuenta:
 *                 type: integer
 *               ingresos:
 *                 type: number
 *               egresos:
 *                 type: number
 *     responses:
 *       200:
 *         description: Movimiento creado correctamente.
 *       500:
 *         description: Error al crear movimiento.
 */
router.post('/movimientos', async (req, res) => {
    const { id, descripcion, fecha, id_cuenta, ingresos, egresos } = req.body;
    let connection;

    try {
        console.log('Connecting to the database...');
        connection = await getConnection();

        console.log('Inserting new movement...');
        const result = await connection.execute(
            `INSERT INTO movimientos (id, descripcion, fecha, id_cuenta, ingresos, egresos) 
             VALUES (:id, :descripcion, :fecha, :id_cuenta, :ingresos, :egresos)`,
            [id, descripcion, fecha, id_cuenta, ingresos, egresos],
            { autoCommit: true }
        );

        console.log('Movement inserted successfully:', result);

        // Primera ruta de Pipedream
        const pipedreamData1 = {
            table: "movimientos",
            data: {
                id,
                descripcion,
                fecha,
                id_cuenta,
                ingresos,
                egresos
            }
        };

        // Segunda ruta de Pipedream
        const pipedreamData2 = {
            operacion: "INSERTAR",
            table: "movimientos",
            data: {
                id,
                descripcion,
                fecha,
                id_cuenta,
                ingresos,
                egresos
            }
        };


       
        console.log('Mandando la información a la primera ruta de Pipedream...');
        await axios.post('https://eo2pkwqau6mfnmf.m.pipedream.net', pipedreamData1);
        console.log('Información enviada con éxito a la primera ruta de Pipedream.');

        console.log('Mandando la información a la segunda ruta de Pipedream...');
        await axios.post('https://eomu44vlydsoye1.m.pipedream.net', pipedreamData2);
        console.log('Información enviada con éxito a la segunda ruta de Pipedream.');

        res.json({ message: 'Movimiento creado correctamente y datos enviados a Pipedream', result });
    } catch (err) {
        console.error('Error inserting movement or sending data to Pipedream:', err);
        res.status(500).json({ error: 'Error al crear movimiento o enviar datos a Pipedream' });
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
 * /movimientos:
 *   get:
 *     summary: Obtiene todos los movimientos.
 *     tags: [Movimientos] 
 *     responses:
 *       200:
 *         description: Lista de movimientos.
 *       500:
 *         description: Error al obtener movimientos.
 */
router.get('/movimientos', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(`SELECT id, descripcion, fecha, id_cuenta, ingresos, egresos FROM movimientos`);

       
        const transformedData = result.rows.map(row => ({
            id: row[0],          // ID del movimiento
            descripcion: row[1],  // Descripción del movimiento
            fecha: row[2],        // Fecha del movimiento
            idCuenta: row[3],     // ID de la cuenta asociada
            ingresos: row[4],     // Monto de ingresos
            egresos: row[5]       // Monto de egresos
        }));

       
        res.json(transformedData);
    } catch (err) {
        console.error('Error al obtener movimientos:', err);
        res.status(500).json({ error: 'Error al obtener movimientos' });
    } finally {
        if (connection) await connection.close();
    }
});


/**
 * @swagger
 * /movimientos/{id_cuenta}:
 *   get:
 *     summary: Obtiene movimientos de una cuenta específica.
 *     tags: [Movimientos]
 *     parameters:
 *       - name: id_cuenta
 *         in: path
 *         required: true
 *         description: ID de la cuenta para obtener movimientos.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de movimientos de la cuenta.
 *       500:
 *         description: Error al obtener movimientos de la cuenta.
 */
router.get('/movimientos/:id_cuenta', async (req, res) => {
    const { id_cuenta } = req.params;  
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT * FROM movimientos WHERE id_cuenta = :id_cuenta`,
            { id_cuenta: id_cuenta } 
        );
        res.json(result.rows); 
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener movimientos de la cuenta' });
    } finally {
        if (connection) await connection.close();
    }
});


/**
 * @swagger
 * /movimientos/{id}:
 *   put:
 *     summary: Actualiza un movimiento existente.
 *     tags: [Movimientos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del movimiento a actualizar.
 *         schema:
 *           type: integer
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             descripcion:
 *               type: string
 *             fecha:
 *               type: string
 *               format: date
 *             id_cuenta:
 *               type: integer
 *             ingresos:
 *               type: number
 *             egresos:
 *               type: number
 *     responses:
 *       200:
 *         description: Movimiento actualizado correctamente.
 *       500:
 *         description: Error al actualizar movimiento.
 */
router.put('/movimientos/:id', async (req, res) => {
    const { id } = req.params;
    const { descripcion, fecha, id_cuenta, ingresos, egresos } = req.body;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `UPDATE movimientos SET descripcion = :descripcion, fecha = :fecha, id_cuenta = :id_cuenta, 
             ingresos = :ingresos, egresos = :egresos WHERE id = :id`,
            [descripcion, fecha, id_cuenta, ingresos, egresos, id],
            { autoCommit: true }
        );
        res.json({ message: 'Movimiento actualizado correctamente', result });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar movimiento' });
    } finally {
        if (connection) await connection.close();
    }
});

/**
 * @swagger
 * /movimientos/{id}:
 *   delete:
 *     summary: Elimina un movimiento existente.
 *     tags: [Movimientos]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del movimiento a eliminar.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Movimiento eliminado correctamente.
 *       500:
 *         description: Error al eliminar movimiento.
 */
router.delete('/movimientos/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `DELETE FROM movimientos WHERE id = :id`,
            [id],
            { autoCommit: true }
        );
        res.json({ message: 'Movimiento eliminado correctamente', result });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar movimiento' });
    } finally {
        if (connection) await connection.close();
    }
});

/**
 * @swagger
 * /monedas:
 *   get:
 *     summary: Obtiene la lista de monedas.
 *     tags: [Monedas]
 *     responses:
 *       200:
 *         description: Lista de monedas.
 *       500:
 *         description: Error al obtener monedas.
 */
router.get('/monedas', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute('SELECT id, descripcion FROM moneda');
        
       
        const transformedData = result.rows.map(row => ({
            id: row[0],          
            descripcion: row[1]  
        }));

        res.json(transformedData);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener monedas' });
    } finally {
        if (connection) await connection.close();
    }
});
/**
 * @swagger
 * /monedas:
 *   post:
 *     summary: Crea una nueva moneda.
 *     tags: [Monedas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Moneda creada correctamente.
 *       500:
 *         description: Error al crear moneda.
 */
router.post('/monedas', async (req, res) => {
    const { id, descripcion } = req.body;
    let connection;

    try {
        console.log('Connecting to the database...');
        connection = await getConnection();

        console.log('Ingresando moneda...');
        const result = await connection.execute(
            `INSERT INTO moneda (id, descripcion) VALUES (:id, :descripcion)`,
            [id, descripcion],
            { autoCommit: true }
        );

        console.log('moneda creada exitosamente:', result);

        // Primera ruta de Pipedream
        const pipedreamData1 = {
            table: "moneda",
            data: {
                id,
                descripcion
            }
        };

        // Segunda ruta de Pipedream
        const pipedreamData2 = {
            operacion: "INSERTAR",
            table: "moneda",
            data: {
                id,
                descripcion
            }
        };

       

       
        console.log('Mandando la información a la primera ruta de Pipedream...');
        await axios.post('https://eo2pkwqau6mfnmf.m.pipedream.net', pipedreamData1);
        console.log('Información enviada con éxito a la primera ruta de Pipedream.');

     
        console.log('Mandando la información a la segunda ruta de Pipedream...');
        await axios.post('https://eomu44vlydsoye1.m.pipedream.net', pipedreamData2);
        console.log('Información enviada con éxito a la segunda ruta de Pipedream.');


        res.json({ message: 'Moneda creada correctamente y datos enviados a Pipedream', result });
    } catch (err) {
        console.error('Error inserting currency or sending data to Pipedream:', err);
        res.status(500).json({ error: 'Error al crear moneda o enviar datos a Pipedream' });
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
 * /monedas/{id}:
 *   delete:
 *     summary: Elimina una moneda existente.
 *     tags: [Monedas]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la moneda a eliminar.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Moneda eliminada correctamente.
 *       500:
 *         description: Error al eliminar moneda.
 */
router.delete('/monedas/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `DELETE FROM moneda WHERE id = :id`,
            [id],
            { autoCommit: true }
        );
        res.json({ message: 'Moneda eliminada correctamente', result });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar moneda' });
    } finally {
        if (connection) await connection.close();
    }
});

/**
 * @swagger
 * /monedas/{id}:
 *   put:
 *     summary: Actualiza una moneda existente.
 *     tags: [Monedas]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la moneda a actualizar.
 *         schema:
 *           type: integer
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             descripcion:
 *               type: string
 *     responses:
 *       200:
 *         description: Moneda actualizada correctamente.
 *       500:
 *         description: Error al actualizar moneda.
 */
router.put('/monedas/:id', async (req, res) => {
    const { id } = req.params;
    const { descripcion } = req.body;
    let connection;

    console.log(`Received ID: ${id}`); 
    console.log(`Received descripcion: ${descripcion}`); 
    try {
        connection = await getConnection();

        const result = await connection.execute(
            `UPDATE moneda SET descripcion = :descripcion WHERE id = :id`,
            { descripcion: descripcion, id: id }, 
            { autoCommit: true }
        );

        
        console.log('Update result:', result);

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Moneda no encontrada' });
        }

        res.json({ message: 'Moneda actualizada correctamente', result });
    } catch (err) {
        console.error('Error al actualizar moneda:', err); 
        res.status(500).json({ error: 'Error al actualizar moneda' });
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



module.exports = router;


