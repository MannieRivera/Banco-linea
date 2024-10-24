const oracledb = require('oracledb');

async function getConnection() {
    try {
        const connection = await oracledb.getConnection({
            user: 'UTH202403CC03',
            password: 'UTH202403CC03',
            connectString: '173.249.59.89:1521/ORCLCDB'
        });

        console.log('Database connection established');
        return connection;
    } catch (err) {
        console.error('Error establishing database connection:', err);
        throw err; // Rethrow the error for handling later
    }
}

module.exports = { getConnection };
