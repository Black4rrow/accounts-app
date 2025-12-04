import { Router } from "express";
import { createTransaction, getUserTransactions, deleteTransaction, getMonthlyTransactions } from "../controllers/transaction.controller";

const router = Router();

router.get("/transactions/monthly/:userId", getMonthlyTransactions)
router.post("/transactions", createTransaction);
router.get("/transactions/:userId", getUserTransactions);
router.delete("/transactions/:transactionId", deleteTransaction);

export default router;