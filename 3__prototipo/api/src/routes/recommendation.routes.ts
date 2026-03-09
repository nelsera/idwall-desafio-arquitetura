import { Router } from "express";

import { RecommendationController } from "../controllers/recommendation.controller.js";
import { RecommendationExpenseRepository } from "../repositories/recommendation-expense.repository.js";
import { RecommendationRequestRepository } from "../repositories/recommendation-request.repository.js";
import { RecommendationService } from "../services/recommendation.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const recommendationRoutes = Router();

const requestRepository = new RecommendationRequestRepository();

const expenseRepository = new RecommendationExpenseRepository();

const service = new RecommendationService(
  requestRepository,
  expenseRepository,
);

const controller = new RecommendationController(service);

recommendationRoutes.get("/", controller.healthCheck.bind(controller));

recommendationRoutes.post(
  "/recommendations",
  authMiddleware,
  controller.createRecommendation.bind(controller),
);

recommendationRoutes.get(
  "/recommendations/:requestId",
  authMiddleware,
  controller.getRecommendationByRequestId.bind(controller),
);

export { recommendationRoutes };