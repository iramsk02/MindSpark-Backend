import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../models/schema";
import { updateStreak } from "./progressController";
import express from 'express';
import { OAuth2Client } from 'google-auth-library';


const router = express.Router();

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;
        console.log(req.body.role)

        const userExists = await userModel.findOne({ email });
        if (userExists) {
            res.status(400).send({ message: "User already exists" });
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({ name, email, password: hashedPassword, role });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET!, { expiresIn: "24h" });
        console.log(token, newUser._id)
        res.status(200).json({ token: token, user: newUser._id });

        // res.status(200).send({ message: "User registred successfully" })

    } catch (error) {
        res.status(500).send({ message: "Server error" });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
 

    try {
        const { email, password, role } = req.body;
        console.log("hoooo")

        const user = await userModel.findOne({ email });



        if (!user) {
            res.status(400).json({ message: "User not found" });
            return
        }
        const id = user._id
        updateStreak(id)
        //
        // 
        // Check role match
        if (user.role !== role) {
            res.status(403).json({ message: `Access denied. Not a ${role}.` });
            return
        }

        //Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Invalid credentials" });
            return
        }

        //Generate token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: "24h" }
        );

        console.log(token, user._id);
        res.json({ token, user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.body.user._id

    try {
        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};




// Logout by clearing the JWT cookie
export const logout = async (req: Request, res: Response) => {
    console.log("logging out")
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // use secure cookies in production
        sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
};



const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// router.post("/google",
export const googlelogin = async (req: Request, res: Response) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        });

        const payload = ticket.getPayload();
        console.log(payload)
        //@ts-ignore
        const { email, name, picture, sub, role } = payload;

        let user = await userModel.findOne({ email });

        if (!user) {
            user = await userModel.create({
                email,
                username: name,
                avatar: picture,
                googleId: sub,
                role: role, // default role — or show UI to choose
            });
        }
        //@ts-ignore
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({ token: jwtToken, user });
    } catch (err) {
        console.error("Google Login Error", err);
        res.status(500).json({ error: "Authentication Failed" });
    }
}

export default router;
