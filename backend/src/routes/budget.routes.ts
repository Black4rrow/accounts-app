import { Router } from "express";
import { getAllBudgetAtDate, createBudget, deleteBudget, updateBudget, getAllBudgetAtRange } from "../controllers/budget.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/budget/range/", authenticateToken, getAllBudgetAtRange);
router.get("/budget/:month/:year", authenticateToken, getAllBudgetAtDate);
router.post("/budget", authenticateToken, createBudget);
router.delete("/budget/:categoryId/:amount/:month/:year/:all", authenticateToken, deleteBudget);
router.put("/budget/:categoryId/:month/:year/:all", authenticateToken, updateBudget);

export default router;