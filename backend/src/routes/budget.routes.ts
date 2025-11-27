import { Router } from "express";
import { getAllBudgetAtDate, createBudget, deleteBudget, updateBudget } from "../controllers/budget.controller";

const router = Router();

router.get("/budget/:userId/:month/:year", getAllBudgetAtDate);
router.post("/budget", createBudget);
router.delete("/budget/:userId/:categoryId/:amount/:month/:year/:all", deleteBudget);
router.put("/budget/:userId/:categoryId/:month/:year/:all", updateBudget);

export default router;