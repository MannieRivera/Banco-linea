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
    const { id, nombre, correo, telefono } = req.body; // Now handling the ID field too
    let connection;

    try {
        console.log('Connecting to the database...');
        connection = await getConnection();

        console.log('Inserting new client...');
        const result = await connection.execute(
            `INSERT INTO cliente (id, nombre, correo, telefono) VALUES (:id, :nombre, :correo, :telefono)`,
            [id, nombre, correo, telefono],
            { autoCommit: true } // Commit the transaction automatically
        );

        console.log('Client inserted successfully:', result);
        res.json({ message: 'Cliente agregado correctamente', result }); // Return success message
    } catch (err) {
        console.error('Error inserting client:', err);
        res.status(500).json({ error: 'Error al agregar el cliente' }); // Return error if failed
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
        console.log('Connecting to the database...');
        connection = await getConnection();

        console.log('Updating client...');
        const result = await connection.execute(
            `UPDATE cliente SET nombre = :nombre, correo = :correo, telefono = :telefono WHERE id = :id`,
            [nombre, correo, telefono, id],
            { autoCommit: true } 
        );

        console.log('Client updated successfully:', result);
        res.json({ message: 'Cliente modificado correctamente', result }); 
    } catch (err) {
        console.error('Error updating client:', err);
        res.status(500).json({ error: 'Error al modificar el cliente' }); 
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


module.exports = router;
