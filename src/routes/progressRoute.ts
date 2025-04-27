import express from "express";
import { updateCourseProgress, updateQuizProgress,getLeaderBoard } from "../controllers/progressController";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/quiz/complete", authMiddleware, updateQuizProgress);
router.post("/course/complete", authMiddleware, updateCourseProgress);
router.get("/leaderboard", authMiddleware,getLeaderBoard );


export default router;
