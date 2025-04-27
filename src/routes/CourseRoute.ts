import express from "express";
import { addCourse,addQuiz,getAllCourses, geteducatorsCourses} from "../controllers/CourseController";
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/add", authMiddleware, addCourse);
router.post("/add/quiz", addQuiz);
router.get("/Allcourses", getAllCourses);
router.get("/educatorCourses/:userId",authMiddleware, geteducatorsCourses);

export default router;
