const express = require('express');
const router = express.Router();
const { ingestLogs, getMetricsSummary, getRecentLogs } = require('../controllers/log.controller');
const { getInsightByLog } = require('../controllers/insight.controller');

// Log Ingestion Endpoint
router.post('/logs/ingest', ingestLogs);

// Recent log retrieval for dashboard reloads
router.get('/logs/:serviceId', getRecentLogs);

// Visualization Analytics Endpoint
router.get('/analytics/:serviceId', getMetricsSummary);

// Diagnostics Retreival Endpoint
router.get('/insights/:logId', getInsightByLog);

module.exports = router;