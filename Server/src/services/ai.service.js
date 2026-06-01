const { GoogleGenAI } = require('@google/genai');
const AIInsight = require('../models/AIInsight');

// Initializing the Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

const generateLogInsight = async (logObject) => {
  try {
    const prompt = `
      You are an expert Principal Systems Architect and DevOps Engineer.
      Analyze the following runtime application crash log and provide structured diagnostic feedback.

      Log Message: ${logObject.message}
      Stack Trace: ${logObject.stackTrace || 'N/A'}
      Host Context: ${JSON.stringify(logObject.metadata)}

      Respond strictly in JSON format with the following keys:
      {
        "rootCause": "Clear explanation of why this crash happened.",
        "impactScore": (An integer from 1 to 10 indicating system severity),
        "suggestedFix": "A markdown-formatted code snippet or architectural resolution."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const resultText = response.text;
    const insightData = JSON.parse(resultText);

    // Save insight to the database linking it to the source log
    const insight = new AIInsight({
      logId: logObject._id,
      serviceId: logObject.metadata.serviceId,
      analysis: {
        rootCause: insightData.rootCause,
        impactScore: insightData.impactScore,
        suggestedFix: insightData.suggestedFix
      },
      modelUsed: 'gemini-2.5-flash'
    });

    await insight.save();
    return insight;

  } catch (error) {
    console.error('AI Insights Generation Failure:', error);
  }
};

module.exports = { generateLogInsight };