import { Router } from "express";
import { getAllCategories, createCategory, createTransaction, getUserTransactions } from "../controllers/transaction.controller";

const router = Router();

router.get("/categories/:userId", getAllCategories);
router.post("/categories", createCategory);
router.post("/transactions", createTransaction);
router.get("/transactions/:userId/:limit?/:offset?", getUserTransactions);

export default router;