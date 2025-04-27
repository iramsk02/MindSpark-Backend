
import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { courseModel } from "../models/schema";
import fs from "fs";
import FormData from "form-data"; // Make sure this is installed
import { Buffer } from "buffer";  // Node built-in

// import { handleBase64VideoWithSubtitles } from "../utils/handleBase64";
import { handleBase64VideoWithDubbing } from "../utils/handleBase64";
// import { uploadThumbnail } from "../utils/multer";
import axios from "axios";

export const uploadCourseAssets = async (req: Request, res: Response) => {
  try {
    const { title, category, description, video, thumbnail, userId, role, lan = "en" } = req.body;

    console.log("Received video:", video?.slice(0, 100)); // log part of base64
    console.log("Received thumbnail:", thumbnail?.slice(0, 100));
    if (role !== "educator") {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }



    if (!video || !thumbnail) {
      return res.status(400).json({ error: "Both video and thumbnail are required." });
    }

    const uploadedVideo = await cloudinary.uploader.upload(video, {
      resource_type: "video",
      folder: "course-videos",
    });

    // Upload thumbnail

    const uploadedThumbnail = await cloudinary.uploader.upload(thumbnail, {
      folder: "course-thumbnails",
    });


    // console.log("uploaded", uploadedThumbnail, uploadedVideo)

    const course = await courseModel.create({
      title,
      description,
      category,
      videoUrl: uploadedVideo.secure_url,
      thumbnailUrl: uploadedThumbnail.secure_url,
      createdBy: userId,
      // subURl_hi:suburl,
      xpReward: 1000,
      // hindivideoUrl: dubbedurl

    });
    await course.save()

    console.log(course)


    return res.status(201).json({ message: "Course uploaded", course });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Upload failed" });
  }
};
// import axios from "axios";
