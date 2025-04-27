import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: String,
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "educator", "admin"], default: "student" },

    // Learning Progress
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    createdQuiz: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
    completedQuiz: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],

    // Gamification
    xp: { type: Number, default: 0 },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null }
    },
    
    badges: [{ type: String }], // Example: ["Streak Master", "Quiz Champion"]

    // Profile Details
    avatar: { type: String }, // Profile Image URL
    bio: { type: String },
  },
  { timestamps: true }
);

export const userModel = mongoose.model("User", userSchema);



const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    // educator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Course Meta
    videoUrl: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, default: 0 }, // 0 = Free
    thumbnailUrl: { type: String }, // Course Thumbnail URL
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subURl_hi:{ type: String },
    hindivideoUrl:{ type: String }
,

    // Gamification
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    xpReward: { type: Number, default: 100 }, // XP awarded on course completion
  },
  { timestamps: true }
);

export const courseModel = mongoose.model("Course", courseSchema);



const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});


const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [optionSchema], required: true }
});

// Quiz schema
const quizSchema = new mongoose.Schema({
  xpReward: { type: Number, default: 100 },
  category: { type: String },
  questions: { type: [questionSchema], required: true }
});


export const QuizModel = mongoose.model("Quiz", quizSchema)

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course"}],
    quiz:[{type:mongoose.Schema.Types.ObjectId,ref:"Quiz"}],
    xp: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    lastActiveDate:{type: Date, default: Date.now()}
  },
  { timestamps: true }
);

export const ProgressModel = mongoose.model("Progress", progressSchema);



const messageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now() },
  }
);

export const Messagemodel = mongoose.model("Message", messageSchema);


