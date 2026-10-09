const express = require('express');

function createApp() {
  const app = express();
  app.use(express.json());

  const tasks = new Map();
  let nextId = 1;

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'tasks-service', uptime: process.uptime() });
  });

  app.get('/tasks', (_req, res) => {
    res.json([...tasks.values()]);
  });

  app.get('/tasks/:id', (req, res) => {
    const task = tasks.get(Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(task);
  });

  app.post('/tasks', (req, res) => {
    const { title } = req.body || {};
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'El campo "title" es obligatorio' });
    }
    const task = { id: nextId++, title: title.trim(), done: false };
    tasks.set(task.id, task);
    res.status(201).json(task);
  });

  app.patch('/tasks/:id', (req, res) => {
    const task = tasks.get(Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    const { title, done } = req.body || {};
    if (typeof title === 'string' && title.trim() !== '') task.title = title.trim();
    if (typeof done === 'boolean') task.done = done;
    res.json(task);
  });

  app.delete('/tasks/:id', (req, res) => {
    if (!tasks.delete(Number(req.params.id))) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(204).end();
  });

  return app;
}

module.exports = { createApp };
