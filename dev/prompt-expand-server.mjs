import http from 'node:http';
import { handlePromptExpandRequest, getPromptExpandErrorMessage } from '../api/_prompt-expand-service.js';

const port = Number(process.env.LOCAL_PROMPT_EXPAND_PORT || 3010);

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Missing request URL.' }));
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/prompt-expand') {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Not found.' }));
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }

    const rawBody = Buffer.concat(chunks).toString('utf8');
    const body = rawBody ? JSON.parse(rawBody) : {};
    const { draftPrompt } = body ?? {};

    if (!draftPrompt || typeof draftPrompt !== 'string' || !draftPrompt.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'draftPrompt is required.' }));
      return;
    }

    const items = await handlePromptExpandRequest(draftPrompt);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ items }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: getPromptExpandErrorMessage(error) }));
  }
});

server.listen(port, () => {
  console.log(`Prompt expansion local API listening on http://localhost:${port}`);
});
