const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swaggerConfig');
const apiRoutes = require('./routes/api');
const { verifyToken } = require('./routes/authMiddleware');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api/protected-route', verifyToken, apiRoutes);


// Swagger configuracion
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
