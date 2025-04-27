import express from "express";
import { getAllQuizes} from "../controllers/gamecontroller"
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();


router.get("/Allquiz", authMiddleware,getAllQuizes );

export default router;
