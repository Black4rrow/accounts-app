import { Request, Response } from "express";
import prisma from "../config/db";

export async function getAllBudgetAtDate(req: Request, res: Response) {
    const { month, year } = req.params;
    const userId = req.user!.userId;

    try {
        const budget = await prisma.budget.findMany({
            where: {
                userId: userId,
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

export async function getAllBudgetAtRange(req: Request, res: Response) {
    const userId = req.user!.userId;
    const start = req.query.start as string;
    const end = req.query.end as string;

    if (!Number.isFinite(userId)) {
        return res.status(400).json({ message: "Invalid userId" });
    }

    const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
        return res.status(400).json({ message: "start and end must be in format yyyy-mm-dd" });
    }

    const [sY, sM] = start.split('-').map(Number);
    const [eY, eM] = end.split('-').map(Number);

    if (![sY, sM, eY, eM].every(Number.isFinite)) {
        return res.status(400).json({ message: "Invalid start or end date parts" });
    }

    if (sY > eY || (sY === eY && sM > eM)) {
        return res.status(400).json({ message: "start must be before or equal to end" });
    }

    try {
        const whereClause = {
            userId,
            AND: [
                {
                    OR: [
                        { year: { gt: sY } },
                        { year: sY, month: { gte: sM } },
                    ],
                },
                {
                    OR: [
                        { year: { lt: eY } },
                        { year: eY, month: { lte: eM } },
                    ],
                },
            ],
        };

        const grouped = await prisma.budget.groupBy({
            by: ['categoryId'],
            where: whereClause,
            _sum: {
                amount: true,
            },
        });

        const categoryIds = grouped.map(g => g.categoryId);

        const categories = await prisma.category.findMany({
            where: { categoryId: { in: categoryIds } },
            select: { categoryId: true, categoryLabel: true },
        });

        const result = grouped.map(g => {
            const cat = categories.find(c => c.categoryId === g.categoryId);
            return {
                categoryId: g.categoryId,
                categoryLabel: cat?.categoryLabel ?? "Unknown",
                amount: g._sum.amount ?? 0,
            };
        });

        result.sort((a, b) => a.amount - b.amount);

        return res.status(200).json(result);
    } catch (error) {
        console.error("getBudgetSumByCategoryInRange error:", error);
        return res.status(500).json({ message: "Error retrieving budget sums", error });
    }
}

export async function createBudget(req: Request, res: Response) {
    const { categoryId, amount, month, year, extendMonth } = req.body;
    const userId = req.user!.userId;
    let budgetsToCreate = [];
    const totalMonths = extendMonth || 0;

    try {
        for (let i = 0; i <= totalMonths; i++) {
            const m = ((month - 1 + i) % 12) + 1;
            const y = year + Math.floor((month - 1 + i) / 12);

            budgetsToCreate.push({
                userId: userId,
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
    const { categoryId, amount, month, year, all } = req.params;
    const userId = req.user!.userId;

    try {
        if (all === 'true') {
            await prisma.budget.deleteMany({
                where: {
                    userId: userId,
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
                    userId: userId,
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
    const { categoryId, month, year, all } = req.params;
    const userId = req.user!.userId;
    const { amount } = req.body;

    try {
        let updatedBudget;
        if (all === 'true') {
            updatedBudget = await prisma.budget.updateMany({
                where: {
                    userId: userId,
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
                    userId: userId,
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