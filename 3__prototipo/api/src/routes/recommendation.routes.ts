import { Router } from "express";
import { RecommendationController } from "../controllers/recommendation.controller.js";
import { RecommendationRequestRepository } from "../repositories/recommendation-request.repository.js";
import { RecommendationService } from "../services/recommendation.service.js";

const recommendationRoutes = Router();

const repository = new RecommendationRequestRepository();
const service = new RecommendationService(repository);
const controller = new RecommendationController(service);

recommendationRoutes.get("/", controller.healthCheck.bind(controller));
recommendationRoutes.post(
  "/recommendations",
  controller.createRecommendation.bind(controller),
);
recommendationRoutes.get(
  "/recommendations/:requestId",
  controller.getRecommendationByRequestId.bind(controller),
);

export { recommendationRoutes };