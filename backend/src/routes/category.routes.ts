import { Router } from "express";
import { getAllCategories, createCategory, deleteCategory, getSumup, getSumupFromRange} from "../controllers/category.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/categories/sumup/range/", authenticateToken, getSumupFromRange);
router.get("/categories/sumup/", authenticateToken, getSumup);
router.get("/categories/", authenticateToken, getAllCategories);
router.post("/categories", authenticateToken, createCategory);
router.delete("/categories/:categoryId", authenticateToken, deleteCategory);

export default router;