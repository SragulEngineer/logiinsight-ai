const express = require('express');
const router = express.Router();
const { ingestLogs, getMetricsSummary } = require('../controllers/log.controller');
const { getInsightByLog } = require('../controllers/insight.controller');

// Log Ingestion Endpoint
router.post('/logs/ingest', ingestLogs);

// Visualization Analytics Endpoint
router.get('/analytics/:serviceId', getMetricsSummary);

// Diagnostics Retreival Endpoint
router.get('/insights/:logId', getInsightByLog);

module.exports = router;