require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./src/config/db');
const socketService = require('./src/services/socket');
const apiRoutes = require('./src/routes/api');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

// Database Layer Connection
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());

// API Mounting
app.use('/api/v1', apiRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Exception Layout:', err.stack);
  res.status(500).json({ error: 'A systemic error occurred within core cluster instances.' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 LogiInsight Core Service actively handling bindings on port ${PORT}`);
});