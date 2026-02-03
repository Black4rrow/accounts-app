import { Router } from "express";
import { getAllCategories, createCategory, deleteCategory, getSumup, getSumupFromRange} from "../controllers/category.controller";

const router = Router();

router.get("/categories/sumup/range/:userId", getSumupFromRange);
router.get("/categories/sumup/:userId", getSumup);
router.get("/categories/:userId", getAllCategories);
router.post("/categories", createCategory);
router.delete("/categories/:categoryId", deleteCategory);

export default router;