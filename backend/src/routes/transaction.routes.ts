import { Router } from "express";
import { createTransaction, getUserTransactions, deleteTransaction, getMonthlyTransactions, updateTransaction } from "../controllers/transaction.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/transactions/monthly/", authenticateToken, getMonthlyTransactions)
router.put("/transactions/:transactionId", authenticateToken, updateTransaction);
router.post("/transactions", authenticateToken, createTransaction);
router.get("/transactions/", authenticateToken, getUserTransactions);
router.delete("/transactions/:transactionId", authenticateToken, deleteTransaction);

export default router;