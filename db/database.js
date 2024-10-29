const oracledb = require('oracledb');

async function getConnection() {
    try {
        const connection = await oracledb.getConnection({
            user: 'UTH202403CC03',
            password: 'UTH202403CC03',
            connectString: '173.249.59.89:1521/ORCLCDB'
        });

        console.log('connection a base de datos exitosa..');
        return connection;
    } catch (err) {
        console.error('Error al establecer coneccion:', err);
        throw err; 
    }
}

module.exports = { getConnection };
