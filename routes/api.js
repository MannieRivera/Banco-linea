const express = require('express');
const router = express.Router();
const { getConnection } = require('../db/database');
const clientesRoutes = require('./clientes');
const cuentasRoutes = require('./cuentas');
const movimientosRoutes = require('./movimientos');






router.use('/clientes', clientesRoutes);
router.use('/cuentas', cuentasRoutes);
router.use('/movimientos', movimientosRoutes);


module.exports = router;
