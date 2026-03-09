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
      const {
        id,
        initialDate,
        finalDate,
      } = req.body as {
        id?: string;
        initialDate?: string;
        finalDate?: string;
      };

      if (!id) {
        return res.status(400).json({
          message: "id is required",
        });
      }

      if (!initialDate || !finalDate) {
        return res.status(400).json({
          message: "initialDate and finalDate are required",
        });
      }

      const result =
        await this.recommendationService.createRecommendationRequest({
          userId: id,
          initialDate,
          finalDate,
        });

      return res.status(202).json(result);
    } catch (error) {
      console.error("Failed to create recommendation request", error);

      return res.status(500).json({
        message: "failed to create recommendation request",
      });
    }
  }

  async getRecommendationByRequestId(
    req: Request<{ requestId: string }>,
    res: Response
  ) {
    try {
      const { requestId } = req.params;

      const result =
        await this.recommendationService.getRecommendationByRequestId(requestId);

      if (!result) {
        return res.status(404).json({
          message: "recommendation request not found",
        });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Failed to get recommendation by requestId", error);

      return res.status(500).json({
        message: "failed to get recommendation",
      });
    }
  }
}