const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  metadata: {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    severity: { 
      type: String, 
      enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'], 
      index: true 
    },
    host: { type: String },
    runtime: { type: String, default: 'NodeJS' }
  },
  message: { type: String, required: true },
  stackTrace: { type: String }, // Populated if severity is ERROR/FATAL
  statusCode: { type: Number },
  context: { type: Object },    // Flexible JSON for request/user data
}, {
  // MongoDB 5.0+ Time-Series optimization
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata',
    granularity: 'seconds'
  },
  expireAfterSeconds: 2592000 // Auto-delete logs after 30 days (TTL)
});

// Compound index for fast filtering in the dashboard
logSchema.index({ 'metadata.serviceId': 1, timestamp: -1 });

module.exports = mongoose.model('Log', logSchema);