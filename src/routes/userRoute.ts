import express from "express";
import { getUserProfile, CreateUserProfile, updateProfile, getALlusers,CreateUser } from "../controllers/userController";
import  authMiddleware  from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/getProfile/:id", authMiddleware, getUserProfile);
router.get("/geteducators", getALlusers);
router.post("/createProfile", authMiddleware, CreateUserProfile);
router.post("/createUser", CreateUser);
router.put("/updateProfile/:id", authMiddleware, updateProfile);


export default router;
