import app from './app.js';
import connectDB from './config/database.js';

const PORT = Number(process.env.PORT) || 4000;
// Use 0.0.0.0 in production so Railway's health checker can reach the server;
// fall back to 127.0.0.1 locally to avoid EPERM issues on macOS.
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(PORT, HOST, () => {
        console.log(`🚀 Server running on http://${HOST}:${PORT}`);
        console.log(`📚 API Documentation: http://${HOST}:${PORT}/api-docs`);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to connect to database:', err.message);
      process.exit(1);
    });
}

export default app;
