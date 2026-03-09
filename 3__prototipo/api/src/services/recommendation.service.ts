import { randomUUID } from "node:crypto";
import { redisClient } from "../infra/redis.js";
import { getRabbitChannel } from "../infra/rabbitmq.js";
import {
  RecommendationRequestRepository,
  type RecommendationRequestRecord,
} from "../repositories/recommendation-request.repository.js";

const queueName = "recommendation.requests";

type CreateRecommendationInput = {
  userId: string;
  initialDate: string;
  finalDate: string;
};

type RecommendationResponse = {
  requestId: string;
  id: string;
  initialDate: string;
  finalDate: string;
  status: string;
  requestedAt: string;
  processedAt: string | null;
  result: unknown;
  source: "redis" | "postgres";
};

export class RecommendationService {
  constructor(
    private readonly recommendationRequestRepository: RecommendationRequestRepository,
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
    const cachedValue = await redisClient.get(`recommendation:${requestId}`);

    if (cachedValue) {
      return JSON.parse(cachedValue) as RecommendationResponse;
    }

    const request =
      await this.recommendationRequestRepository.findByRequestId(requestId);

    if (!request) {
      return null;
    }

    return this.mapDatabaseRecordToResponse(request);
  }

  private mapDatabaseRecordToResponse(
    request: RecommendationRequestRecord,
  ): RecommendationResponse {
    return {
      requestId: request.requestId,
      id: request.userId,
      initialDate: request.initialDate,
      finalDate: request.finalDate,
      status: request.status,
      requestedAt: request.requestedAt,
      processedAt: request.processedAt,
      result: request.result,
      source: "postgres",
    };
  }
}