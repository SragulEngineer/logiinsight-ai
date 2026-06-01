const AIInsight = require('../models/AIInsight');

const getInsightByLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const insight = await AIInsight.findOne({ logId });
    
    if (!insight) {
      return res.status(404).json({ message: 'No predictive remediation generated for this log entry.' });
    }
    
    res.json(insight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getInsightByLog };