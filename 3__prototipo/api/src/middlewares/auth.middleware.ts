import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type AuthRequest = Request & {
  user?: {
    sub: string;
    email: string;
    name: string;
  };
};

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "missing token",
    });
  }

  const token = authorization.replace("Bearer ", "");

  const secret = process.env.JWT_SECRET ?? "dev-secret";

  try {
    const payload = jwt.verify(token, secret) as AuthRequest["user"];

    req.user = payload;

    return next();
  } catch {
    return res.status(401).json({
      message: "invalid token",
    });
  }
}