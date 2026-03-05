"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
const db_1 = __importDefault(require("../config/db"));
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
async function login(req, res) {
    const { mail, password } = req.body;
    try {
        const user = await db_1.default.user.findUnique({ where: { mail } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user.userId, mail: user.mail }, JWT_SECRET, { expiresIn: "30d" });
        return res.json({
            success: true,
            data: { userId: user.userId, mail: user.mail, token },
        });
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function register(req, res) {
    const { firstname, lastname, mail, password, phoneNumber } = req.body;
    try {
        const existing = await db_1.default.user.findUnique({ where: { mail } });
        if (existing)
            return res.status(409).json({ message: "User already exists" });
        const hashed = await bcrypt.hash(password, 10);
        const user = await db_1.default.user.create({
            data: { firstname, lastname, mail, password: hashed, phoneNumber },
        });
        const token = jwt.sign({ userId: user.userId, mail: user.mail }, JWT_SECRET, { expiresIn: "30d" });
        return res.status(201).json({
            success: true,
            data: { userId: user.userId, mail: user.mail, token },
        });
    }
    catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
