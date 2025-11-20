import { Request, Response } from "express";
import prisma from "../config/db";

const bcrypt = require('bcrypt');

export async function getAllusers(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
}

export async function getUserById(req: Request, res: Response) {
    const userId = parseInt(req.params.id);
    try {
        const user = await prisma.user.findUnique({
            where: { userId: userId },
        });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
}

export async function createUser(req: Request, res: Response) {
    const { firstname, lastname, mail, password, phoneNumber } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                firstname,
                lastname,
                mail,
                password: hashedPassword,
                phoneNumber,
            },
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: "Failed to create user" });
    }
}