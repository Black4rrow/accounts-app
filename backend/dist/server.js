"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const port = 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
app_1.default.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/src')));
app_1.default.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../frontend/src', 'index.html'));
});
app_1.default.listen(port, () => {
});
