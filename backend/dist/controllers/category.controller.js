"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = getAllCategories;
exports.createCategory = createCategory;
exports.deleteCategory = deleteCategory;
exports.getSumup = getSumup;
exports.getSumupFromRange = getSumupFromRange;
const db_1 = __importDefault(require("../config/db"));
async function getAllCategories(req, res) {
    const userId = req.user.userId;
    try {
        const categories = await db_1.default.category.findMany({ where: { userId: userId } });
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving categories", error });
    }
}
async function createCategory(req, res) {
    const { categoryLabel } = req.body;
    const userId = req.user.userId;
    try {
        const newCategory = await db_1.default.category.create({
            data: {
                userId,
                categoryLabel,
            },
        });
        res.status(201).json(newCategory);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating category", error });
    }
}
async function deleteCategory(req, res) {
    const categoryId = parseInt(req.params.categoryId);
    try {
        await db_1.default.category.delete({
            where: { categoryId: categoryId },
        });
        res.status(200).json({ message: "Category deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting category", error });
    }
}
async function getSumup(req, res) {
    const userId = req.user.userId;
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);
    try {
        const grouped = await db_1.default.transaction.groupBy({
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
        const categories = await db_1.default.category.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving sumup", error });
    }
}
function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
}
async function getSumupFromRange(req, res) {
    const userId = req.user.userId;
    const start = req.query.start;
    const end = req.query.end;
    const startDate = parseLocalDate(start);
    const endDate = parseLocalDate(end);
    endDate.setDate(endDate.getDate() + 1);
    try {
        const grouped = await db_1.default.transaction.groupBy({
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
        const categories = await db_1.default.category.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving sumup", error });
    }
}
