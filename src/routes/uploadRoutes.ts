// routes/videoRoutes.ts
import express from 'express';
import { uploadBoth } from '../utils/multer';
import { uploadCourseAssets } from '../controllers/uploadController';

const router = express.Router();
//@ts-ignore
router.post('/files', uploadBoth, uploadCourseAssets);

export default router;
