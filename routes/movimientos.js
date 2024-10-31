/**
 * @swagger
 * tags:
 *   name: Movimientos
 *   description: Gestión de movimientos en una cuenta de un cliente.        
 */
const express = require('express');
const router = express.Router();
const { getConnection } = require('../db/database');

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
        connection = await getConnection();
        const result = await connection.execute(
            `INSERT INTO movimientos (id, descripcion, fecha, id_cuenta, ingresos, egresos) 
             VALUES (:id, :descripcion, :fecha, :id_cuenta, :ingresos, :egresos)`,
            [id, descripcion, fecha, id_cuenta, ingresos, egresos],
            { autoCommit: true }
        );
        res.json({ message: 'Movimiento creado correctamente', result });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear movimiento' });
    } finally {
        if (connection) await connection.close();
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

        // Transformar los datos en el formato deseado
        const transformedData = result.rows.map(row => ({
            id: row[0],          // ID del movimiento
            descripcion: row[1],  // Descripción del movimiento
            fecha: row[2],        // Fecha del movimiento
            idCuenta: row[3],     // ID de la cuenta asociada
            ingresos: row[4],     // Monto de ingresos
            egresos: row[5]       // Monto de egresos
        }));

        // Enviar los datos transformados como respuesta
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
            [id_cuenta]
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

module.exports = router;