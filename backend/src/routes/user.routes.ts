import { Router } from "express";
import { getAllusers, getUserById, createUser } from "../controllers/user.controller";

const router = Router();

router.get("/users", getAllusers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);

export default router;