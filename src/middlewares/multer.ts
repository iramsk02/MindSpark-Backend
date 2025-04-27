import multer from "multer";
import path from "path";

// Define storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Or any path you use
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter (optional)
const fileFilter = (req:Request, file:any, cb:any) => {
  if (file.fieldname === "video" || file.fieldname === "thumbnail") {
    cb(null, true);
  } else {
    cb(new Error("Invalid field name"), false);
  }
};

export const upload = multer({
  storage,
  //@ts-ignore
  fileFilter,
});
