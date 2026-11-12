require('dotenv').config();

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3003;
const registrationUrl = process.env.REGISTRATION_SERVICE_URL || 'http://localhost:3001';
const studentUrl = process.env.STUDENT_SERVICE_URL || 'http://localhost:3002';

app.get('/health', (_req, res) => res.json({ service: 'api-gateway', status: 'ok' }));

app.use('/api/register', createProxyMiddleware({
  target: registrationUrl,
  changeOrigin: true
}));

app.use('/api/students', createProxyMiddleware({
  target: studentUrl,
  changeOrigin: true
}));

app.use((_req, res) => res.status(404).json({ message: 'Route not found. Use the API gateway routes.' }));

app.listen(port, () => console.log(`API Gateway running on port ${port}`));
