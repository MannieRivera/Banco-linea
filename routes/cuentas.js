/**
 * @swagger
 * tags:
 *   name: Cuentas
 *   description: Gestión de Cuentas de un cliente.        
 */
const express = require('express');
const router = express.Router();
const { getConnection } = require('../db/database');

/**
 * @swagger
 * /tipos-de-cuenta:
 *   get:
 *     summary: Obtiene la lista de tipos de cuenta.
 *     tags: [Cuentas]
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
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener tipos de cuenta' });
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

        // Estructura más descriptiva de los datos
        const cuentas = result.rows.map(row => ({
            id: row[0],                    // ID de la cuenta
            noCuenta: row[1],              // Número de cuenta
            tipoCuenta: row[2],            // Descripción del tipo de cuenta
            fechaApertura: row[3],         // Fecha de apertura
            moneda: row[4],                // Descripción de la moneda
            cliente: row[5]                // Nombre del cliente
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
 * /monedas:
 *   get:
 *     summary: Obtiene la lista de monedas.
 *     tags: [Cuentas]
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
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener monedas' });
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
        res.json(result.rows);
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
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener información del cliente' });
    } finally {
        if (connection) await connection.close();
    }
});


module.exports = router;
