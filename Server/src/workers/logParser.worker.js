const { parentPort, workerData } = require('worker_threads');

/**
 * Common regex pattern to parse standard application logs:
 * Example raw log: "[2026-06-01T07:40:00Z] [ERROR] [payment-gateway] Database timeout occurred on connection pooling."
 */
const logRegex = /^\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+(.*)$/;

function parseRawLogs(rawLogs, serviceId) {
  return rawLogs.map(rawString => {
    const match = rawString.match(logRegex);

    if (match) {
      const [_, timestamp, severity, host, message] = match;
      
      // Determine if a message contains a stack trace block
      const hasStackTrace = message.includes('at ') || message.includes('Error:');

      return {
        timestamp: new Date(timestamp),
        metadata: {
          serviceId: serviceId,
          severity: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'].includes(severity) ? severity : 'INFO',
          host: host,
          runtime: 'NodeJS'
        },
        message: hasStackTrace ? message.split('\n')[0] : message,
        stackTrace: hasStackTrace ? message : null,
        statusCode: extractStatusCode(message)
      };
    }

    // Fallback if the log format is unstructured raw text
    return {
      timestamp: new Date(),
      metadata: { serviceId, severity: 'INFO', host: 'unknown', runtime: 'NodeJS' },
      message: rawString
    };
  });
}

function extractStatusCode(message) {
  const codeMatch = message.match(/\b(500|502|504|400|401|403)\b/);
  return codeMatch ? parseInt(codeMatch[0], 10) : null;
}

// Execute the parsing logic with the data provided by the main thread
const result = parseRawLogs(workerData.logs, workerData.serviceId);

// Send the structured array back to the main Express application thread
parentPort.postMessage(result);