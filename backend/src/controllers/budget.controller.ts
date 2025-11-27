import { Request, Response } from "express";
import prisma from "../config/db";

export async function getAllBudgetAtDate(req: Request, res: Response) {
    const { userId, month, year } = req.params;

    try {
        const budget = await prisma.budget.findMany({
            where: {
                userId: parseInt(userId),
                month: parseInt(month),
                year: parseInt(year),
            },
            include: {
                category: {
                    select: { categoryLabel: true }
                }
            }
        });

        const formatted = budget.map(b => ({
            ...b,
            categoryLabel: b.category.categoryLabel
        }));

        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving budget", error });
    }
}

export async function createBudget(req: Request, res: Response) {
    const { userId, categoryId, amount, month, year, extendMonth } = req.body;
    let budgetsToCreate = [];
    const totalMonths = extendMonth || 0;

    try {
        for (let i = 0; i <= totalMonths; i++) {
            const m = ((month - 1 + i) % 12) + 1;
            const y = year + Math.floor((month - 1 + i) / 12);

            budgetsToCreate.push({
                userId: parseInt(userId),
                categoryId: parseInt(categoryId),
                amount: parseFloat(amount),
                month: m,
                year: y,
            });
        }
        await prisma.budget.createMany({
            data: budgetsToCreate,
        });
        res.status(201).json({ message: "Budgets created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error creating budget", error });
    }
}

export async function deleteBudget(req: Request, res: Response) {
    const { userId, categoryId, amount, month, year, all } = req.params;
    try {
        if (all === 'true') {
            await prisma.budget.deleteMany({
                where: {
                    userId: parseInt(userId),
                    categoryId: parseInt(categoryId),
                    month: {
                        gte: parseInt(month),
                    },
                    year: {
                        gte: parseInt(year),
                    },
                },
            });
        } else {
            await prisma.budget.deleteMany({
                where: {
                    userId: parseInt(userId),
                    categoryId: parseInt(categoryId),
                    amount: parseFloat(amount),
                    month: parseInt(month),
                    year: parseInt(year),
                },
            });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error deleting budget", error });
    }
}

export async function updateBudget(req: Request, res: Response) {
    const { userId, categoryId, month, year, all } = req.params;
    const { amount } = req.body;

    try {
        let updatedBudget;
        if (all === 'true') {
            updatedBudget = await prisma.budget.updateMany({
                where: {
                    userId: parseInt(userId),
                    categoryId: parseInt(categoryId),
                    month: {
                        gte: parseInt(month),
                    },
                    year: {
                        gte: parseInt(year),
                    },
                },
                data: {
                    amount,
                },
            });
        } else {
            updatedBudget = await prisma.budget.updateMany({
                where: {
                    userId: parseInt(userId),
                    categoryId: parseInt(categoryId),
                    month: parseInt(month),
                    year: parseInt(year),
                },
                data: {
                    amount,
                },
            });
        }
        res.status(200).json(updatedBudget);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating budget", error });
    }
}