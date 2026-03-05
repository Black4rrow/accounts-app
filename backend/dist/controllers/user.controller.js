"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllusers = getAllusers;
exports.getUserById = getUserById;
exports.createUser = createUser;
const db_1 = __importDefault(require("../config/db"));
const bcrypt = require('bcrypt');
async function getAllusers(req, res) {
    try {
        const users = await db_1.default.user.findMany();
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
}
async function getUserById(req, res) {
    const userId = req.user.userId;
    try {
        const user = await db_1.default.user.findUnique({
            where: { userId: userId },
        });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
}
async function createUser(req, res) {
    const { firstname, lastname, mail, password, phoneNumber } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db_1.default.user.create({
            data: {
                firstname,
                lastname,
                mail,
                password: hashedPassword,
                phoneNumber,
            },
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create user" });
    }
}
