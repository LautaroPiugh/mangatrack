const express = require('express');

const { getHealthStatus, getSmtpDiagnostics } = require('../controllers/health.controller');

const router = express.Router();

router.get('/', getHealthStatus);
router.get('/smtp', getSmtpDiagnostics);

module.exports = router;
