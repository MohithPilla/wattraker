require('dotenv').config();
const app = require('./app');
const { initDB } = require('./config/db');

// Initialize local database storage (zero external dependencies)
initDB();

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`🚀 NoteSphere Backend Server running on http://127.0.0.1:${PORT}`);
  console.log(`💾 Local Database: Active (No MongoDB service needed!)`);
  console.log(`👉 API Health Endpoint: http://127.0.0.1:${PORT}/api/health`);
  console.log(`=======================================================`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});
