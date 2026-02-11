import { Router } from "express";
import { getAllusers, getUserById, createUser } from "../controllers/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/users", authenticateToken, getAllusers);
router.get("/users", authenticateToken, getUserById);
router.post("/users", authenticateToken, createUser);

export default router;