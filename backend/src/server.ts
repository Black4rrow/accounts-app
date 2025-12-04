import app from './app';
import express, { Request, Response } from 'express';
import path from 'path';

const port = 3000;
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

app.use(express.static(path.join(__dirname, '../../frontend/src')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/src', 'index.html'));
});

app.listen(port, () => {
});