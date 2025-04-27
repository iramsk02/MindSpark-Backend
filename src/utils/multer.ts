// utils/multer.ts
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    //@ts-ignore
    folder: 'course_videos',
    resource_type: 'video',
    format: async () => 'mp4',
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    //@ts-ignore
    folder: 'course_thumbnails',
    resource_type: 'image',
    format: async () => 'jpg', // or 'png', etc.
  },
});


// Combine both using fields (in the route)
//@ts-ignore
export const uploadBoth = multer({ storage: cloudinary }).fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

