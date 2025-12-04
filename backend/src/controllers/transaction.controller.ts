import { Request, Response } from "express";
import prisma from "../config/db";

export async function createTransaction(req: Request, res: Response) {
    var { userId, amount, categoryLabel, description, date, isExpense } = req.body;

    if(isExpense) {
        amount = -Math.abs(amount);
    }

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
            orderBy: { createdAt: 'desc' },
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

export async function deleteTransaction(req: Request, res: Response) {
    const transactionId = parseInt(req.params.transactionId);
    try {
        await prisma.transaction.delete({
            where: { transactionId: transactionId },
        });
        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting transaction", error });
    }
}