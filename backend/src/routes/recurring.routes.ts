import { Router } from "express";
import { createRecurringTransaction, deleteRecurringtransaction, getUserRecurringTransactions, updateRecurringTransaction } from "../controllers/recurring.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/recurring", authenticateToken, getUserRecurringTransactions);
router.post("/recurring", authenticateToken, createRecurringTransaction);
router.put("/recurring/:recurringTransactionId", authenticateToken, updateRecurringTransaction);
router.delete("/recurring/:recurringTransactionId", authenticateToken, deleteRecurringtransaction);

export default router;