import express from "express";
import { registerUser, loginUser, getUserProfile, logout } from "../controllers/authController";
import authMiddleware from "../middlewares/authMiddleware";
import passport from 'passport';
import { userModel } from "../models/schema";
import bcrypt from "bcryptjs"
import { updateStreak } from "../controllers/progressController";
import jwt from "jsonwebtoken";


 const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getUserProfile);
router.post("/logout", logout);
export default router;
