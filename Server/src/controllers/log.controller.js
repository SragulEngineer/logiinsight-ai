const { Worker } = require('worker_threads');
const path = require('path');
const Log = require('../models/Log');
const { getIoInstance } = require('../services/socket');
const { generateLogInsight } = require('../services/ai.service');
const mongoose= require('mongoose');
const ingestLogs = async (req, res) => {
  try {
    const { logs, serviceId } = req.body;

    if (!Array.isArray(logs) || logs.length === 0 || !serviceId) {
      return res.status(400).json({ error: 'Missing log payloads or Service Identification.' });
    }

    const workerPath = path.resolve(__dirname, '../workers/logParser.worker.js');
    const worker = new Worker(workerPath, { workerData: { logs, serviceId } });

    worker.on('message', async (parsedLogs) => {
      // Unordered bulk operation optimizes ingestion throughput 
      const savedLogs = await Log.insertMany(parsedLogs, { ordered: false });
      const io = getIoInstance();

      // Broadcast all newly parsed logs to listening service clients
      io.to(serviceId.toString()).emit('new-logs', savedLogs);

      // Handle critical anomalies asynchronously (Non-blocking for ingestion confirmation)
      const fatalLogs = savedLogs.filter(log => ['ERROR', 'FATAL'].includes(log.metadata.severity));
      
      fatalLogs.forEach(async (log) => {
        // Trigger AI analysis pipeline
        const insight = await generateLogInsight(log);
        if (insight) {
          // Push diagnostic data straight to UI dashboard once generated
          io.to(serviceId.toString()).emit('ai-insight-alert', { logId: log._id, insight });
        }
      });

      return res.status(202).json({ status: 'Accepted', processedCount: savedLogs.length });
    });

    worker.on('error', (err) => {
      throw err;
    });

  } catch (error) {
    console.error('Ingestion Processing Failure:', error);
    res.status(500).json({ error: 'Log parsing worker failed to execute structural mappings.' });
  }
};

const getMetricsSummary = async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    // Aggregation mapping for historical charting dashboard
    const metrics = await Log.aggregate([
      { $match: { 'metadata.serviceId': new mongoose.Types.ObjectId(serviceId) } },
      {
        $group: {
          _id: {
            severity: '$metadata.severity',
            timeBucket: { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.timeBucket': 1 } }
    ]);

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecentLogs = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 200;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ error: 'Invalid serviceId provided.' });
    }

    const logs = await Log.find({ 'metadata.serviceId': new mongoose.Types.ObjectId(serviceId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { ingestLogs, getMetricsSummary, getRecentLogs };