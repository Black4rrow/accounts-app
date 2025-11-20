import { Request, Response } from "express";
import prisma from "../config/db";

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export async function login(req: Request, res: Response) {
  const { mail, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { mail } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.userId, mail: user.mail },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      data: { userId: user.userId, mail: user.mail, token },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function register(req: Request, res: Response) {
  const { firstname, lastname, mail, password, phoneNumber } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { mail } });
    if (existing)
      return res.status(409).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { firstname, lastname, mail, password: hashed, phoneNumber },
    });

    const token = jwt.sign(
      { userId: user.userId, mail: user.mail },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      success: true,
      data: { userId: user.userId, mail: user.mail, token },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}