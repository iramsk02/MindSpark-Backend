import { Request, Response } from "express";
import { userModel,QuizModel } from "../models/schema";



export const getAllQuizes = async (req: Request, res: Response):Promise<void> => {

  try {
    
    const Quizes = await QuizModel.find()

    if (!Quizes){res.status(404).json({ message: "No Quiz Available" }); return }
  

    res.status(200).json({ message: "Quizes", Quiz:Quizes });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

