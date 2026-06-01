const mongoose = require('mongoose');
const aiInsightSchema = new mongoose.Schema({
  logId: { type: mongoose.Schema.Types.ObjectId, ref: 'Log', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  analysis: { 
    rootCause: { type: String },
    impactScore: { type: Number, min: 1, max: 10 },
    suggestedFix: { type: String } // Markdown string from LLM
  },
  rawPrompt: { type: String, select: false }, // Hide from standard queries
  tokensUsed: { type: Number },
  modelUsed: { type: String, default: 'gpt-4o' }
}, { timestamps: true });

// Ensure we don't generate duplicate insights for the same log
aiInsightSchema.index({ logId: 1 }, { unique: true });

module.exports = mongoose.model('AIInsight', aiInsightSchema);