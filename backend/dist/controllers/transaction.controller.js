"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = createTransaction;
exports.updateTransaction = updateTransaction;
exports.getUserTransactions = getUserTransactions;
exports.getMonthlyTransactions = getMonthlyTransactions;
exports.deleteTransaction = deleteTransaction;
const db_1 = __importDefault(require("../config/db"));
async function createTransaction(req, res) {
    var { amount, categoryLabel, description, date, isExpense } = req.body;
    const userId = req.user.userId;
    if (isExpense) {
        amount = -Math.abs(amount);
    }
    let category = await db_1.default.category.findFirst({
        where: {
            userId,
            categoryLabel,
        },
    });
    let categoryId;
    if (category) {
        categoryId = category.categoryId;
        console.log(`Found existing category '${categoryLabel}' with ID ${categoryId}`);
        try {
            const newTransaction = await db_1.default.transaction.create({
                data: {
                    userId,
                    amount,
                    categoryId,
                    description,
                    date: new Date(date),
                },
            });
            res.status(201).json(newTransaction);
        }
        catch (error) {
            res.status(500).json({ message: "Error creating transaction", error });
        }
    }
    else {
        res.status(500).json({ message: "Error creating transaction (category was not created)" });
    }
}
async function updateTransaction(req, res) {
    var { amount, categoryLabel, description, date, isExpense } = req.body;
    const userId = req.user.userId;
    if (isExpense) {
        amount = -Math.abs(amount);
    }
    let category = await db_1.default.category.findFirst({
        where: {
            userId,
            categoryLabel,
        },
    });
    let categoryId;
    if (category) {
        categoryId = category.categoryId;
        console.log(`Found existing category '${categoryLabel}' with ID ${categoryId}`);
        try {
            const newTransaction = await db_1.default.transaction.update({
                where: {
                    transactionId: req.params.transactionId ? parseInt(req.params.transactionId) : undefined,
                },
                data: {
                    userId,
                    amount,
                    categoryId,
                    description,
                    date: new Date(date),
                },
            });
            res.status(201).json(newTransaction);
        }
        catch (error) {
            res.status(500).json({ message: "Error creating transaction", error });
        }
    }
    else {
        res.status(500).json({ message: "Error creating transaction (category was not created)" });
    }
}
async function getUserTransactions(req, res) {
    const userId = req.user.userId;
    const userIdInt = userId;
    const limit = req.query.limit;
    const offset = req.query.offset;
    try {
        const transactions = await db_1.default.transaction.findMany({
            where: { userId: userIdInt },
            orderBy: [
                { date: 'desc' },
                { createdAt: 'desc' }
            ],
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
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving transactions", error });
    }
}
async function getMonthlyTransactions(req, res) {
    const userId = req.user.userId;
    const userIdInt = userId;
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    try {
        const transactions = await db_1.default.transaction.findMany({
            where: {
                userId: userIdInt,
                date: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1)
                }
            },
            orderBy: { createdAt: 'desc' },
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
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving transactions", error });
    }
}
async function deleteTransaction(req, res) {
    const transactionId = parseInt(req.params.transactionId);
    try {
        await db_1.default.transaction.delete({
            where: { transactionId: transactionId },
        });
        res.status(200).json({ message: "Transaction deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting transaction", error });
    }
}
