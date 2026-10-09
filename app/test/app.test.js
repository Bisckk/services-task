const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test('GET /health responde ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ok');
});

test('POST /tasks crea una tarea', async () => {
  const res = await fetch(`${base}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Desplegar en minikube' }),
  });
  assert.equal(res.status, 201);
  const task = await res.json();
  assert.equal(task.title, 'Desplegar en minikube');
  assert.equal(task.done, false);
});

test('POST /tasks sin título devuelve 400', async () => {
  const res = await fetch(`${base}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 400);
});

test('PATCH /tasks/:id marca la tarea como completada', async () => {
  const created = await (await fetch(`${base}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Configurar pipeline' }),
  })).json();

  const res = await fetch(`${base}/tasks/${created.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: true }),
  });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).done, true);
});

test('DELETE /tasks/:id elimina y luego devuelve 404', async () => {
  const created = await (await fetch(`${base}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Temporal' }),
  })).json();

  assert.equal((await fetch(`${base}/tasks/${created.id}`, { method: 'DELETE' })).status, 204);
  assert.equal((await fetch(`${base}/tasks/${created.id}`)).status, 404);
});
