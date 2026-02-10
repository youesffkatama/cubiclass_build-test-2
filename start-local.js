// Temporary startup script to override Redis config for local development
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_PASSWORD = '';

require('./server/server.js');