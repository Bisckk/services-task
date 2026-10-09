const { createApp } = require('./app');

const PORT = process.env.PORT || 3000;

const server = createApp().listen(PORT, () => {
  console.log(JSON.stringify({ level: 'info', msg: 'tasks-service escuchando', port: PORT }));
});

// Apagado ordenado: Kubernetes envía SIGTERM antes de eliminar el pod
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
