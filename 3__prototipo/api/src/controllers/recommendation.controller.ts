import type { Request, Response } from "express";
import { RecommendationService } from "../services/recommendation.service.js";

export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  healthCheck(_req: Request, res: Response) {
    return res.status(200).json({
      service: "api",
      message: "Recommendation API is running",
    });
  }

  async createRecommendation(req: Request, res: Response) {
    try {
      const { userId } = req.body as { userId?: string };

      if (!userId) {
        return res.status(400).json({
          message: "userId is required",
        });
      }

      const result = await this.recommendationService.createRecommendationRequest(userId);

      return res.status(202).json(result);
    } catch (error) {
      console.error("Failed to create recommendation request", error);

      return res.status(500).json({
        message: "failed to create recommendation request",
      });
    }
  }
}