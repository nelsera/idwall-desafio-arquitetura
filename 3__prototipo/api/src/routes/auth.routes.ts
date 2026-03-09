import { Router } from "express";

import { AuthController } from "../controllers/auth.controller.js";
import { AuthService } from "../services/auth.service.js";
import { UserRepository } from "../repositories/user.repository.js";

const router = Router();

const userRepository = new UserRepository();

const authService = new AuthService(userRepository);

const controller = new AuthController(authService);

router.post("/auth/login", controller.login.bind(controller));

export { router as authRoutes };