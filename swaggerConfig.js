// swaggerConfig.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Programacion en la Nube Grupo 3',
            version: '1.0.0',
            description: 'API documentacion, sincronizacion de datos a traves de la nube',
        },
        servers: [
            {
                url: 'https://banco-linea.onrender.com/api'
            }
        ]
    },
    apis: ['./routes/*.js'] // Specify the path where your route files are located
};

const specs = swaggerJsdoc(options);

module.exports = specs;
