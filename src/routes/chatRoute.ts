import express from "express";
import { generate } from "../controllers/chatController";
import  authMiddleware  from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/ask",authMiddleware,generate)
export default router;
