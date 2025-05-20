import { Request, Response } from "express";
import { ProgressModel, userModel, courseModel } from "../models/schema";
import moment from "moment";



export const updateQuizProgress = async (req: Request, res: Response) => {
  try {
    const { userId, quizId, xpEarned } = req.body;

    let progress = await ProgressModel.findOne({ user: userId });

    if (progress && progress.quiz.includes(quizId)) {
      res.json({ message: "already attempted" });
      return
    }

    if (!progress) {
      progress = new ProgressModel({
        user: userId,
        quiz: [quizId],
        xp: xpEarned,
        completed: true,
      });
      await progress.save();
    } else {

      await ProgressModel.updateOne(
        { user: userId },
        {
          $inc: { xp: xpEarned },
          $addToSet: { quiz: quizId },
        }
      );
    }

    const myprogress = await ProgressModel.find({ user: userId })
    await userModel.findByIdAndUpdate(userId, { $inc: { xp: xpEarned }, completedQuiz: quizId });
    const user = await userModel.findById(userId)

    // updateStreak(userId)
    assignBadges(userId)
    res.status(200).json({ message: "Quiz progress saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating quiz progress" });
  }
};

export const updateCourseProgress = async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.body;
    const xpEarned = 1000;

    let progress = await ProgressModel.findOne({ user: userId });

    if (progress && progress.course.includes(courseId)) {
      res.json({ message: "already watched" });
      return
    }

    if (!progress) {
      progress = new ProgressModel({
        user: userId,
        course: [courseId],
        xp: xpEarned,
        completed: true,
      });
      await progress.save();
    } else {
      await ProgressModel.updateOne(
        { user: userId },
        {
          $inc: { xp: xpEarned },
          $addToSet: { course: courseId },
        }
      );
    }

    await userModel.findByIdAndUpdate(userId, { $inc: { xp: xpEarned }, enrolledCourses: courseId });
    await courseModel.findByIdAndUpdate(courseId, {studentsEnrolled:userId });
    const user = await userModel.findById(userId)
    // updateStreak(userId)
    assignBadges(userId)
    res.status(200).json({ message: "Course marked as completed" });
  } catch (err) {
    res.status(500).json({ message: "Error updating course progress" });
  }
};


export const getLeaderBoard = async (req: Request, res: Response) => {
  try {
    const topUsers = await userModel.find({role:"student"})
      .select("name xp avatar") // Or whatever fields you want
      .sort({ xp: -1 })
      .limit(10); // Top 10

    res.status(200).json({ leaderboard: topUsers });
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
}




export const updateStreak = async (userId:any) => {
  const user = await userModel.findById(userId);
  const today = moment().startOf("day");
  const lastActive = moment(user?.streak?.lastActiveDate).startOf("day");

  if (!user?.streak?.lastActiveDate) {
    user!.streak = {
      current: 1,
      longest: 1,
      lastActiveDate: today.toDate(),
    };
  } else {
    const diff = today.diff(lastActive, "days");

    if (diff === 1) {
      user!.streak.current += 1;
      if (user!.streak.current > user!.streak.longest) {
        user!.streak.longest = user!.streak.current;
      }
    } else if (diff > 1) {
      user!.streak.current = 1;
    }

    user!.streak.lastActiveDate = today.toDate();
  }

  await user!.save();
};



const assignBadges = async (userId: string) => {
  const user = await userModel.findById(userId);
  if (!user) return;

  const { xp, badges = [], streak = 0 } = user;
  const badgeSet = new Set(badges);

  // XP-based badges
  if (xp >= 100000) badgeSet.add("Legendary Learner");
  else if (xp >= 50000) badgeSet.add("Platinum Prodigy");
  else if (xp >= 30000) badgeSet.add("Gold Achiever");
  else if (xp >= 3000) badgeSet.add("Silver Explorer");
  else if (xp >= 1000) badgeSet.add("Bronze Beginner");



  // Streak-based badges
  let currentStreak = 0;
  let longestStreak = 0;

  if (typeof streak === 'object' && streak !== null) {
    currentStreak = streak.current;
    longestStreak = streak.longest;
  }

  if (currentStreak >= 90) badgeSet.add("Iron Focus");
  else if (currentStreak >= 60) badgeSet.add("Unstoppable Learner");
  else if (currentStreak >= 30) badgeSet.add("Monthly Master");
  else if (currentStreak >= 14) badgeSet.add("Weekly Warrior");
  else if (currentStreak >= 7) badgeSet.add("Dedicated Scholar");
  else if (currentStreak >= 3) badgeSet.add("Consistency Rookie");
  if (longestStreak >= 100) badgeSet.add("Centurion");


  user.badges = Array.from(badgeSet);
  await user.save();
};
