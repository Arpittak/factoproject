const app = require('./src/app');
const testDb = require('./src/utils/testDb');

const PORT = process.env.PORT || 5000;

// Test database connection on startup
testDb().then((success) => {
  if (success) {
    app.listen(PORT, () => {
      console.log(`🚀 Facto Clone Server is running on port ${PORT}`);
      console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🌐 CORS enabled for localhost and ngrok domains`);
    });
  } else {
    console.log('⚠️  Server starting without database connection');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (Database offline)`);
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  try {
    const pdfQueue = require('./src/services/PDFQueue');
    await pdfQueue.shutdown();
  } catch (error) {
    console.error('Error during PDF queue shutdown:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  try {
    const pdfQueue = require('./src/services/PDFQueue');
    await pdfQueue.shutdown();
  } catch (error) {
    console.error('Error during PDF queue shutdown:', error);
  }
  process.exit(0);
});