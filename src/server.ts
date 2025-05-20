// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import { WebSocketServer } from "ws";
// import connectDB from "./config/db";
// import { verifySocketToken } from "./middlewares/authMiddleware";
// import { Request, Response } from "express";
// import { createServer } from "http";
// import { IncomingMessage } from "http";


// // Import Routes
// import authRoutes from "./routes/authRoute";
// import userRoutes from "./routes/userRoute";
// import courseRoutes from "./routes/CourseRoute";
// import gameRoutes from "./routes/gameRoute"
// import progressRoutes from "./routes/progressRoute";
// import uploadRoutes from "./routes/uploadRoutes"
// import geminiRoutes from "./routes/chatRoute"
// import { userModel } from "./models/schema";
// import { Messagemodel } from "./models/schema";


// dotenv.config();
// connectDB();

// const app = express();
// const PORT = process.env.PORT || 5000;
// const WS_PORT = 8089; // WebSocket Server Port

// // app.use(express.json());
// app.use(express.json({ limit: '100mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));

// app.use(cors());

// // API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/courses", courseRoutes);
// app.use("/api/quiz", gameRoutes);
// app.use("/api/progress", progressRoutes);
// app.use('/api/uploads', uploadRoutes);
// app.use('/api/gemini', geminiRoutes);
// app.get('/dashboard', (req, res) => { res.send(`Welcome `); });


// // Start Express Server
//  app.listen(PORT, () => {
//   console.log(` Server running on port ${PORT}`);
// });

// //  WebSocket (Chat) 
// // const wss = new WebSocketServer({ port: WS_PORT });
// // Create the HTTP server from your Express app
// // const server = createServer(app);

// // Now, create the WebSocket server using the same HTTP server
// // const wss = new WebSocketServer({ port: WS_PORT });
// // const clients = new Map(); // Store connected users



// // wss.on("connection", (ws, req: IncomingMessage) => {
// //   console.log("New client connected");
// //   try {
// //     const user = verifySocketToken(req); //  Use your middleware
// //     //@ts-ignore
// //     ws.user = user;   // attach to socket

// //     console.log("WebSocket connected:");
// //     clients.set(ws, {}); // will be updated in join
// //   } catch (err) {
// //     // console.error("WebSocket auth failed:", err);
// //     ws.close(4001, "Unauthorized");
// //     return;
// //   }

// //   ws.on("message", async (data) => {
// //     try {
// //       const parsed = JSON.parse(data.toString());
// //       const { type, courseId, message, user } = parsed;
// //       const userr = await userModel.findById({ _id: user })
// //       const username = userr?.name


// //       if (type === "join") {
// //         // Save client info
// //         clients.set(ws, { courseId, username });

// //         // Fetch previous chat from DB
// //         const chatHistory = await Messagemodel.find({ courseId }).sort({ createdAt: 1 });

// //         // Send chat history to this user only
// //         ws.send(JSON.stringify({ type: "history", data: chatHistory, username }));

// //         console.log(`${user} joined course ${courseId}`);
// //       }

// //       if (type === "message") {
// //         // Save message to DB
// //         await Messagemodel.create({ username, user, courseId, message });


// //         // Broadcast to others


// //         wss.clients.forEach((client) => {
// //           if (
// //             client.readyState === ws.OPEN &&
// //             clients.get(client)?.courseId === courseId
// //           ) {
// //             client.send(JSON.stringify({ type: "message", username, message }));
// //           }
// //         })
// //       }

// //     } catch (error) {
// //       console.error("Invalid message format", error);
// //     }
// //   });

// //   ws.on("close", () => {
// //     clients.delete(ws);
// //     console.log("Client disconnected");
// //   });
// // });


// // console.log(` WebSocket server running on port ${WS_PORT}`);
// // import { WebSocketServer } from "ws";
// // import { IncomingMessage } from "http";
// // import jwt from "jsonwebtoken";
// // import { userModel, Messagemodel } from "./models/schema";
// // import { verifySocketToken } from "./utils/token"; // Your token decoder
// import { WebSocket } from "ws";

// interface ClientInfo {
//   courseId: string;
//   username: string;
// }

// const clients = new Map<WebSocket, ClientInfo>();
// const wss = new WebSocketServer({ port: WS_PORT });

// wss.on("connection", async (ws, req: IncomingMessage) => {
//   console.log("New client connected");

//   try {
//     const decodedUser = verifySocketToken(req);
//     // @ts-ignore
//     ws.user = decodedUser;
//     clients.set(ws, {} as ClientInfo); // initially empty
//   } catch (err) {
//     ws.close(4001, "Unauthorized");
//     return;
//   }

//   ws.on("message", async (data) => {
//     try {
//       const parsed = JSON.parse(data.toString());
//       const { type, courseId, message } = parsed;

//       // @ts-ignore
//       const userId = ws.user?.id;
//       const userr = await userModel.findById(userId);
//       if (!userr || !userr.name) return;
//       const username = userr.name;

//       if (type === "join") {
//         clients.set(ws, { courseId, username });

//         const chatHistory = await Messagemodel.find({ courseId }).sort({ createdAt: 1 });

//         ws.send(JSON.stringify({ type: "history", data: chatHistory, username }));
//         console.log(`${username} joined course ${courseId}`);
//       }

//       if (type === "message") {
//         await Messagemodel.create({ username, user: userId, courseId, message });

//         wss.clients.forEach((client) => {
//           const info = clients.get(client as WebSocket);
//           if (
//             client.readyState === WebSocket.OPEN &&
//             info?.courseId === courseId
//           ) {
//             client.send(JSON.stringify({ type: "message", username, message }));
//           }
//         });
//       }

//     } catch (err) {
//       console.error("Invalid message format", err);
//     }
//   });

//   ws.on("close", () => {
//     clients.delete(ws);
//     console.log("Client disconnected");
//   });
// });

// console.log(`✅ WebSocket server running on port ${WS_PORT}`);
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { WebSocketServer } from "ws";
import connectDB from "./config/db";
import { verifySocketToken } from "./middlewares/authMiddleware";
import { IncomingMessage } from "http";
import { createServer } from "http";

import authRoutes from "./routes/authRoute";
import userRoutes from "./routes/userRoute";
import courseRoutes from "./routes/CourseRoute";
import gameRoutes from "./routes/gameRoute";
import progressRoutes from "./routes/progressRoute";
import uploadRoutes from "./routes/uploadRoutes";
import geminiRoutes from "./routes/chatRoute";

import { userModel, Messagemodel } from "./models/schema";
import { WebSocket } from "ws";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/quiz", gameRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/gemini", geminiRoutes);

app.get("/dashboard", (req, res) => {
  res.send(`Welcome`);
});

// Create HTTP server wrapping Express app
const server = createServer(app);

// Create WebSocket server attached to the same HTTP server
const wss = new WebSocketServer({ server });

interface ClientInfo {
  courseId: string;
  username: string;
}

const clients = new Map<WebSocket, ClientInfo>();

// wss.on("connection", async (ws, req: IncomingMessage) => {
//   console.log("New client connected");

//   try {
//     const decodedUser = verifySocketToken(req);
//     // @ts-ignore
//     ws.user = decodedUser;
//     clients.set(ws, {} as ClientInfo);
//   } catch (err) {
//     ws.close(4001, "Unauthorized");
//     return;
//   }

//   ws.on("message", async (data) => {
//     try {
//       const parsed = JSON.parse(data.toString());
//       const { type, courseId, message } = parsed;

//       // @ts-ignore
//       const userId = ws.user?.id;
//       const userr = await userModel.findById(userId);
//       if (!userr || !userr.name) return;
//       const username = userr.name;

//       if (type === "join") {
//         clients.set(ws, { courseId, username });

//         const chatHistory = await Messagemodel.find({ courseId }).sort({
//           createdAt: 1,
//         });

//         ws.send(
//           JSON.stringify({ type: "history", data: chatHistory, username })
//         );
//         console.log(`${username} joined course ${courseId}`);
//       }

//       if (type === "message") {
//         await Messagemodel.create({ username, user: userId, courseId, message });

//         wss.clients.forEach((client) => {
//           const info = clients.get(client as WebSocket);
//           if (
//             client.readyState === WebSocket.OPEN &&
//             info?.courseId === courseId
//           ) {
//             client.send(
//               JSON.stringify({ type: "message", username, message })
//             );
//           }
//         });
//       }
//     } catch (err) {
//       console.error("Invalid message format", err);
//     }
//   });

//   ws.on("close", () => {
//     clients.delete(ws);
//     console.log("Client disconnected");
//   });
// });

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
wss.on("connection", async (ws, req: IncomingMessage) => {
  console.log("New client connected");

  // Removed token verification; allow all clients to connect
  clients.set(ws, {} as ClientInfo);

  ws.on("message", async (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      const { type, courseId, message, username } = parsed;

      // Instead of getting username from token, expect it from client message

      if (type === "join") {
        if (!username) {
          ws.send(JSON.stringify({ type: "error", message: "Username required to join" }));
          return;
        }
        clients.set(ws, { courseId, username });

        const chatHistory = await Messagemodel.find({ courseId }).sort({
          createdAt: 1,
        });

        ws.send(
          JSON.stringify({ type: "history", data: chatHistory, username })
        );
        console.log(`${username} joined course ${courseId}`);
      }

      if (type === "message") {
        if (!username) {
          ws.send(JSON.stringify({ type: "error", message: "Username required to send message" }));
          return;
        }

        await Messagemodel.create({ username, user: null, courseId, message }); // userId removed since no auth

        wss.clients.forEach((client) => {
          const info = clients.get(client as WebSocket);
          if (
            client.readyState === WebSocket.OPEN &&
            info?.courseId === courseId
          ) {
            client.send(
              JSON.stringify({ type: "message", username, message })
            );
          }
        });
      }
    } catch (err) {
      console.error("Invalid message format", err);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
