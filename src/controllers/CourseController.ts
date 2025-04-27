import { Request, Response } from "express";
import { courseModel, QuizModel, userModel } from "../models/schema";


export const addCourse = async (req: Request, res: Response): Promise<void> => {

  const { role, title, price, category, description, video, thumbnail, userId } = req.body;
  console.log(req.body)

  if (role !== "educator") {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  try {
    const course = new courseModel({
      title,
      price,
      category,
      description,
      videoUrl: video,
      thumbnailUrl: thumbnail,
      createdBy: userId
    });

    await course.save();
    const id = course._id
    await userModel.updateOne(userId, { createdCourses: id })
    res.status(201).json({ message: "Course created", course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




// export const addQuiz = async (req: Request, res: Response): Promise<void> => {
//   const questionsObject = req.body;
//   console.log("hoo")
//   const { xp, category, role, userId } = req.headers;

//   let myarr: any = [];

//   Object.values(questionsObject).forEach((question) => {
//     console.log(question);
//     myarr.push(question);
//   });
//   if (role !== "educator") {
//     res.status(403).json({ message: "Unauthorized" });
//     return;
//   }
//   async function store() {
//     try {
//       const quiz = new QuizModel({
//         xpReward: Number(xp),
//         category,
//         questions: myarr
//       });


//       await quiz.save();
//       const id = quiz._id
//       //@ts-ignore
//       await userModel.updateOne(userId, { createdQuiz: id })
//       console.log("Quiz stored successfully");
//       res.status(201).json({ message: "Quiz created", quiz });
//     } catch (err) {
//       console.error("Error storing quiz:", err);
//       res.status(500).json({ message: "Failed to store quiz" });
//     }
//   }

//   store();
// }
export const addQuiz = async (req: Request, res: Response): Promise<void> => {
  const { xp, category, role = "educator", questions } = req.body;

  // Ensure xp is a valid number
  if (!category || typeof category !== 'string') {
    res.status(400).json({ message: "The 'category' field is required and must be a string." });
  }

  if (!xp || typeof xp !== 'number' || xp <= 0) {
    res.status(400).json({ message: "The 'xp' field is required and must be a positive number." });
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    res.status(400).json({ message: "At least one question is required." });
  }

  // Validate each question and its options
  for (const q of questions) {
    if (!q.questionText || typeof q.questionText !== 'string') {
      res.status(400).json({ message: "Each question must have a valid 'questionText'." });
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      res.status(400).json({ message: "Each question must have exactly 4 options." });
    }

    let correctAnswerCount = 0;
    for (const option of q.options) {
      if (!option.text || typeof option.text !== 'string') {
        res.status(400).json({ message: "Each option must have a valid 'text'." });
      }

      if (option.isCorrect) {
        correctAnswerCount++;
      }
    }

    if (correctAnswerCount !== 1) {
      res.status(400).json({ message: "Each question must have exactly one correct answer." });
    }
  }

  // Check if the user has the "educator" role
  if (role !== "educator") {
    res.status(403).json({ message: "Unauthorized" });
  }

  // Store quiz
  try {
    const quiz = new QuizModel({
      xpReward: xp,
      category,
      questions // Directly use questions here
    });

    await quiz.save();
    // const id = quiz._id;
    // //@ts-ignore
    // await userModel.updateOne({ _id: userId }, { createdQuiz: id });
    console.log("Quiz stored successfully");
    res.status(201).json({ message: "Quiz created", quiz });
  } catch (err) {
    console.error("Error storing quiz:", err);
    res.status(500).json({ message: "Failed to store quiz" });
  }
};

export const getAllCourses = async (req: Request, res: Response) => {

  try {
    const courses = await courseModel.find()
    res.json(courses);
  } catch (error) {
    console.log("couldn't find")
    res.status(500).json({ message: "Server error" });
  }
}




export const geteducatorsCourses = async (req: Request, res: Response) => {
  const { userId } = req.params
  try {
    const courses = await courseModel.find({ createdBy: userId })
    res.json(courses);
  } catch (error) {
    console.log("couldn't find")
    res.status(500).json({ message: "Server error" });
  }
}



