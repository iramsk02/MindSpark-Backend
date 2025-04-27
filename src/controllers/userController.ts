import { Request, Response } from "express";
import { ProgressModel, courseModel, userModel } from "../models/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { updateStreak } from "./progressController";

//Get User Progress
// Get User Profile
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const user = await userModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Create / Update User Profile
export const CreateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, bio, avatar } = req.body;
    console.log(req.body)

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    if (typeof bio !== "string" || typeof avatar !== "string") {
      res.status(400).json({ message: "Bio and avatar must be strings" });
      return;
    }

    const user = await userModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.bio = bio;
    user.avatar = avatar;
    await user.save();

    res.status(200).json({ message: "Profile updated successfully", profile: { bio, avatar } });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const CreateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role,username,bio,avatar } = req.body;
    // console.log(req.body)

    const userExists = await userModel.findOne({ email });
    if (userExists) {
      res.status(400).send({ message: "User already exists" });
      console.log("user exits")
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ name:username, email, password: hashedPassword, role,bio,avatar});

    await newUser.save();
    console.log("created")
    const myuser=await userModel.find({email:email})
    if (!myuser) {
       res.status(404).json({ message: 'User not found' });
       return
    }
  
    const id=myuser[0]._id
    console.log(id)

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET!, { expiresIn: "24h" });
    console.log(token, )
       updateStreak(id)
    res.status(200).json({ profile: {id,bio,avatar,role,token} });

    // res.status(200).json({ message: "Profile updated successfully", profile: { bio, avatar } });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/updateProfile/:id
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, avatar, bio } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      { name, avatar, bio },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
}
export const getALlusers = async (req: Request, res: Response) => {
  try {

    const User = await userModel.find({ role: "educator" })
    res.json(User);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
} 