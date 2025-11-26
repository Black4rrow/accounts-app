import { Router } from "express";
import { createTransaction, getUserTransactions, deleteTransaction } from "../controllers/transaction.controller";

const router = Router();

router.post("/transactions", createTransaction);
router.get("/transactions/:userId/:limit?/:offset?", getUserTransactions);
router.delete("/transactions/:transactionId", deleteTransaction);

export default router;