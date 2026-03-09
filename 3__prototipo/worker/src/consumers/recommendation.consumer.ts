import type amqp from "amqplib";

import { redisClient } from "../infra/redis.js";
import { RecommendationRequestRepository } from "../repositories/recommendation-request.repository.js";
import { RecommendationProcessorService } from "../services/recommendation-processor.service.js";
import { RetryHandlerService } from "../services/retry-handler.service.js";
import type { RecommendationJob } from "../types/recommendation-job.js";

export class RecommendationConsumer {
  constructor(
    private readonly processorService: RecommendationProcessorService,
    private readonly repository: RecommendationRequestRepository,
    private readonly retryHandlerService: RetryHandlerService,
  ) {}

  async handle(
    channel: amqp.Channel,
    message: amqp.ConsumeMessage | null,
  ): Promise<void> {
    if (!message) {
      return;
    }

    let payload: RecommendationJob | null = null;

    try {
      payload = JSON.parse(message.content.toString()) as RecommendationJob;

      console.log(`Received job ${payload.requestId} for user ${payload.userId}`);

      await this.processorService.process(payload);

      channel.ack(message);
    } catch (error) {
      const retryCount = this.retryHandlerService.getRetryCount(message);

      const errorMessage =
        error instanceof Error ? error.message : "unknown error";

      console.error(
        `Failed to process message. Retry count: ${retryCount}. Error: ${errorMessage}`,
      );

      if (this.retryHandlerService.shouldRetry(retryCount)) {
        const nextRetryCount = retryCount + 1;

        await this.retryHandlerService.publishRetry(
          channel,
          message,
          nextRetryCount,
        );

        console.warn(`Republished message for retry ${nextRetryCount}`);

        channel.ack(message);
        return;
      }

      if (payload?.requestId) {
        await this.repository.markAsFailed(payload.requestId, errorMessage, retryCount);

        await redisClient.set(
          `recommendation:${payload.requestId}`,
          JSON.stringify({
            requestId: payload.requestId,
            id: payload.userId,
            initialDate: payload.initialDate,
            finalDate: payload.finalDate,
            status: "failed",
            requestedAt: payload.requestedAt,
            processedAt: new Date().toISOString(),
            result: {
              message: errorMessage,
              retryCount,
            },
            source: "redis",
          }),
          {
            EX: 3600,
          },
        );
      }

      await this.retryHandlerService.publishToDlq(
        channel,
        message,
        errorMessage,
        retryCount,
      );

      console.error(
        `Message exceeded retry limit and was sent to DLQ. RequestId: ${payload?.requestId ?? "unknown"}`,
      );

      channel.ack(message);
    }
  }
}