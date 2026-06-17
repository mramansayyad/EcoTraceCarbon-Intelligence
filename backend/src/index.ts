import { app } from './app.js';
import { loadSecrets } from './config/secrets.js';

const PORT = process.env.PORT || 8080;

async function startServer() {
  console.log('Loading configuration secrets...');
  await loadSecrets();
  
  app.listen(PORT, () => {
    console.log(`EcoTrace Express API Server successfully started on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
  console.error('Critical Server Startup Failure:', err);
  process.exit(1);
});
