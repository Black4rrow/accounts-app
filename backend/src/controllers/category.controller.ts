import { Request, Response } from "express";
import prisma from "../config/db";

export async function getAllCategories(req: Request, res: Response) {
    const userId = req.user!.userId;
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
    const { categoryLabel } = req.body;
    const userId = req.user!.userId;
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

export async function deleteCategory(req: Request, res: Response) {
    const categoryId = parseInt(req.params.categoryId);
    try {
        await prisma.category.delete({
            where: { categoryId: categoryId },
        });
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error });
    }
}

export async function getSumup(req: Request, res: Response) {
    const userId = req.user!.userId;
    const year = parseInt(req.query.year as string);
    const month = parseInt(req.query.month as string);

    try {
        const grouped = await prisma.transaction.groupBy({
            by: ['categoryId'],
            where: {
                userId,
                date: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1),
                },
            },
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
                totalAmount: g._sum.amount ?? 0,
            };
        });

        result.sort((a, b) => a.totalAmount - b.totalAmount);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving sumup", error });
    }
}

function parseLocalDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export async function getSumupFromRange(req: Request, res: Response) {
    const userId = req.user!.userId;
    const start = req.query.start as string;
    const end = req.query.end as string;

    const startDate = parseLocalDate(start);
    const endDate = parseLocalDate(end);

    endDate.setDate(endDate.getDate() + 1);

    try {
        const grouped = await prisma.transaction.groupBy({
            by: ['categoryId'],
            where: {
                userId,
                date: {
                    gte: startDate,
                    lt: endDate,
                },
            },
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
                totalAmount: g._sum.amount ?? 0,
            };
        });

        result.sort((a, b) => a.totalAmount - b.totalAmount);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving sumup", error });
    }
}