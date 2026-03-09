import { randomUUID } from "node:crypto";

import { redisClient } from "../infra/redis.js";
import { getRabbitChannel } from "../infra/rabbitmq.js";
import { RecommendationExpenseRepository } from "../repositories/recommendation-expense.repository.js";
import { RecommendationRequestRepository } from "../repositories/recommendation-request.repository.js";

const queueName = "recommendation.requests";

type CreateRecommendationInput = {
  userId: string;
  initialDate: string;
  finalDate: string;
};

type RecommendationResponse = {
  requestId: string;
  status: string;
  result?: unknown;
};

export class RecommendationService {
  constructor(
    private readonly recommendationRequestRepository: RecommendationRequestRepository,
    private readonly recommendationExpenseRepository: RecommendationExpenseRepository,
  ) {}

  async createRecommendationRequest(input: CreateRecommendationInput) {
    const requestId = randomUUID();

    const requestedAt = new Date().toISOString();

    await this.recommendationRequestRepository.create({
      requestId,
      userId: input.userId,
      initialDate: input.initialDate,
      finalDate: input.finalDate,
      status: "pending",
      requestedAt,
    });

    const channel = await getRabbitChannel();

    await channel.assertQueue(queueName, {
      durable: true,
    });

    const payload = {
      requestId,
      userId: input.userId,
      initialDate: input.initialDate,
      finalDate: input.finalDate,
      requestedAt,
    };

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });

    return {
      requestId,
      status: "processing",
    };
  }

  async getRecommendationByRequestId(
    requestId: string,
  ): Promise<RecommendationResponse | null> {
    const cached = await redisClient.get(`recommendation:${requestId}`);

    if (cached) {
      const parsedCached = JSON.parse(cached) as RecommendationResponse;

      return {
        requestId,
        status: parsedCached.status,
        result: parsedCached.result,
      };
    }

    const request =
      await this.recommendationRequestRepository.findByRequestId(requestId);

    if (!request) {
      return null;
    }

    if (request.status === "pending") {
      return {
        requestId,
        status: "pending",
      };
    }

    const expenses =
      await this.recommendationExpenseRepository.findByRequestId(requestId);

    if (request.status === "failed") {
      return {
        requestId,
        status: "failed",
        result: expenses.length > 0 ? expenses : undefined,
      };
    }

    return {
      requestId,
      status: request.status,
      result: {
        id: request.userId,
        expenses,
      },
    };
  }
}
