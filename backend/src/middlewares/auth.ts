import { adminAuth } from "../config/firebase";
import type { Request, Response, NextFunction } from "express";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "No token provided", code: "AUTH_ERROR" });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.uid = decoded.uid; // extend Request type in types/index.ts
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token", code: "AUTH_ERROR" });
  }
};
