import type { Request, Response } from "express";

import { AuthService } from "../services/auth.service.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "email and password are required",
        });
      }

      const result = await this.authService.login({ email, password });

      if (!result) {
        return res.status(401).json({
          message: "invalid credentials",
        });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Failed to login", error);

      return res.status(500).json({
        message: "failed to login",
      });
    }
  }
}