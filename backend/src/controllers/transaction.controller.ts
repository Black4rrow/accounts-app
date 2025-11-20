import { Request, Response } from "express";
import prisma from "../config/db";

export async function getAllCategories(req: Request, res: Response) {
    const userId = parseInt(req.params.userId);
    try {
        const categories = await prisma.category.findMany(
            { where: { userId: userId } }
        );
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving categories", error });
    }
}

export async function createCategory(req: Request, res: Response) {
    const { userId, categoryLabel } = req.body;
    try {
        const newCategory = await prisma.category.create({
            data: {
                userId,
                categoryLabel,
            },
        });
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: "Error creating category", error });
    }
}

export async function createTransaction(req: Request, res: Response) {
    const { userId, amount, categoryLabel, description, date } = req.body;

    // Find category
    let category = await prisma.category.findFirst({
        where: {
            userId,
            categoryLabel,
        },
    });
    let categoryId: number;
    if (category) {
        categoryId = category.categoryId;
        console.log(`Found existing category '${categoryLabel}' with ID ${categoryId}`);

        try {
            const newTransaction = await prisma.transaction.create({
                data: {
                    userId,
                    amount,
                    categoryId,
                    description,
                    date: new Date(date),
                },
            });
            res.status(201).json(newTransaction);
        } catch (error) {
            res.status(500).json({ message: "Error creating transaction", error });
        }
    } else {
        res.status(500).json({ message: "Error creating transaction (category was not created)" });
    }
}

export async function getUserTransactions(req: Request, res: Response) {
    const { userId, limit, offset } = req.params;
    const userIdInt = parseInt(userId);
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: userIdInt },
            orderBy: { date: 'desc' },
            take: limit ? parseInt(limit) : undefined,
            skip: offset ? parseInt(offset) : undefined,
            include: {
                category: true,
            },
        });
        res.status(200).json(transactions.map(t => ({
            transactionId: t.transactionId,
            userId: t.userId,
            amount: t.amount,
            date: t.date,
            description: t.description,
            categoryLabel: t.category.categoryLabel
        })));
    } catch (error) {
        res.status(500).json({ message: "Error retrieving transactions", error });
    }
} 