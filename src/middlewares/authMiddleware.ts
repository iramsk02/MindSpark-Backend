import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {

    // const {token}=req.body
    const token = req.headers.authorization
    console.log(token)
    if (!token) {
      res.status(401).json({ message: "Access denied. No token provided." });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!,) as { userId: string; role: string };

    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}



// export const verifySocketToken = (req:string) => {
//   const url = new URL(req.url, `http://${req.headers.host}`);
//   const token = url.searchParams.get("token");
//   console.log(token)

//   if (!token) throw new Error("Token missing");

//   const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//   return decoded;
// };
// import jwt from "jsonwebtoken";
import { IncomingMessage } from "http";
import { parse } from "url";

export const verifySocketToken = (req: IncomingMessage) => {
  const parsedUrl = parse(req.url!, true);
  const token = parsedUrl.query.token as string;

  if (!token) throw new Error("Token missing");

  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  return decoded;
};


export default authMiddleware;
