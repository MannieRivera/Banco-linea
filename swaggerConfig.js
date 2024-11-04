// swaggerConfig.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Programacion en la Nube Grupo 3',
            version: '1.0.0',
            description: 'API documentacion, sincronizacion de datos a traves de la nube.\n\n\n\nManuel Antonio Fuentes Rivera - 202220060045\n\nKevin Alberto Ponce Ruiz - 202210130217\n\nJorge Alejandro Zuniga Mejia - 202210050187\n\nJosue Dario Cano Hernández 202010070136\n\nEnrique jared santos navarro - 202210010453\n\nJuan Lizandro Garcia Sauceda - 202010060056\n\nWaleska Yamileth Salazar Vasquez - 202120010332\n\nMaryory Elizabeth Rodriguez Medina 202210060694\n\nÁlvaro Luis Cadenas Ramírez 202110110072',
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
            }
        ]
    },
    apis: ['./routes/*.js'] // Specify the path where your route files are located
};

const specs = swaggerJsdoc(options);

module.exports = specs;
