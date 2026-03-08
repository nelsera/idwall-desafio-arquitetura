import { randomUUID } from "node:crypto";
import { getRabbitChannel } from "../infra/rabbitmq.js";
import { RecommendationRequestRepository } from "../repositories/recommendation-request.repository.js";

const queueName = "recommendation.requests";

export class RecommendationService {
  constructor(
    private readonly recommendationRequestRepository: RecommendationRequestRepository,
  ) {}

  async createRecommendationRequest(userId: string) {
    const requestId = randomUUID();
    const requestedAt = new Date().toISOString();

    await this.recommendationRequestRepository.create({
      requestId,
      userId,
      status: "pending",
      requestedAt,
    });

    const channel = await getRabbitChannel();

    await channel.assertQueue(queueName, {
      durable: true,
    });

    const payload = {
      requestId,
      userId,
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
}