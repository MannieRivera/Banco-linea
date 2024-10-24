const express = require('express');
const router = express.Router();
const { getConnection } = require('../db/database');

// Ruta GET para obtener los datos
router.get('/datos', async (req, res) => {
    let connection;

    try {
        console.log('Connecting to the database...');
        connection = await getConnection();

        console.log('Executing query...');
        const result = await connection.execute('SELECT ID, NOMBRE, CORREO, TELEFONO FROM cliente');

        console.log('Query executed successfully:', result);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error in database query');
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

// Add this PUT route to your router file
router.put('/cliente/:id', async (req, res) => {
    const { id } = req.params; // Get the ID from the URL
    const { nombre, correo, telefono } = req.body; // Get the new data from the body
    let connection;

    try {
        console.log('Connecting to the database...');
        connection = await getConnection();

        console.log('Updating client...');
        const result = await connection.execute(
            `UPDATE cliente SET nombre = :nombre, correo = :correo, telefono = :telefono WHERE id = :id`,
            [nombre, correo, telefono, id],
            { autoCommit: true } // Commit the transaction automatically
        );

        console.log('Client updated successfully:', result);
        res.json({ message: 'Cliente modificado correctamente', result }); // Return success message
    } catch (err) {
        console.error('Error updating client:', err);
        res.status(500).json({ error: 'Error al modificar el cliente' }); // Return error if failed
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
