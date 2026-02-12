import { Request, Response } from "express";
import prisma from "../config/db";
import { computeNextRunAt } from "../workers/recurringProcessor";

export async function createRecurringTransaction(req: Request, res: Response) {
    var { amount, categoryLabel, description, dayOfMonth, timeOfDay, timezone, isExpense } = req.body;
    const userId = req.user!.userId;

    if (isExpense) {
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
            const newRecurring = await prisma.recurringTransaction.create({
                data: {
                    userId,
                    amount,
                    categoryId,
                    description,
                    dayOfMonth,
                    timeOfDay,
                    timezone,
                    nextRunAt: computeNextRunAt({
                        dayOfMonth,
                        timeOfDay,
                        timezone,
                    }, timezone),
                    active: true,
                },
            });
            res.status(201).json(newRecurring);
        } catch (error) {
            res.status(500).json({ message: "Error creating recurring transaction", error });
        }
    } else {
        res.status(500).json({ message: "Error creating recurring transaction (category was not created)" });
    }
}

export async function updateRecurringTransaction(req: Request, res: Response) {
    var { id, amount, categoryLabel, description, dayOfMonth, timeOfDay, timezone, active, isExpense } = req.body;
    const userId = req.user!.userId;

    if (isExpense) {
        amount = -Math.abs(amount);
    }

    id = parseInt(req.params.recurringTransactionId);
    if (!id) return res.status(400).json({ message: "Missing recurringTransactionId" });

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
            const newRecurring = await prisma.recurringTransaction.update({
                where: {
                    id: id,
                },
                data: {
                    userId,
                    amount,
                    categoryId,
                    description,
                    dayOfMonth,
                    timeOfDay,
                    timezone,
                    active,
                },
            });
            res.status(201).json(newRecurring);
        } catch (error) {
            res.status(500).json({ message: "Error updating recurring transaction", error });
        }
    } else {
        res.status(500).json({ message: "Error updating recurring transaction (category was not created)" });
    }
}

export async function getUserRecurringTransactions(req: Request, res: Response) {
    const userId = req.user!.userId;
    const userIdInt = userId;

    try {
        const recurringTransactions = await prisma.recurringTransaction.findMany({
            where: { userId: userIdInt },
            include: {
                category: true,
            },
        });
        res.status(200).json(recurringTransactions.map(t => ({
            id: t.id,
            userId: t.userId,
            amount: t.amount,
            dayOfMonth: t.dayOfMonth,
            timeOfDay: t.timeOfDay,
            timezone: t.timezone,
            description: t.description,
            categoryLabel: t.category.categoryLabel,
            lastUpdated: t.updatedAt,
            nextRunAt: t.nextRunAt,
            lastRunAt: t.lastRunAt,
            active: t.active,
        })));
    } catch (error) {
        res.status(500).json({ message: "Error retrieving recurring transactions", error });
    }
}

export async function deleteRecurringtransaction(req: Request, res: Response) {
    const recurringTransactionId = parseInt(req.params.recurringTransactionId);
    try {
        await prisma.recurringTransaction.delete({
            where: { id: recurringTransactionId },
        });
        res.status(200).json({ message: "Recurring transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting recurring transaction", error });
    }
}