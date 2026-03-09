import type amqp from "amqplib";
import { recommendationDlqName, recommendationQueueName } from "../infra/rabbitmq.js";

export class RetryHandlerService {
  constructor(private readonly maxRetries: number) {}

  getRetryCount(message: amqp.ConsumeMessage): number {
    const retryCountHeader = message.properties.headers?.["x-retry-count"];

    if (typeof retryCountHeader === "number") {
      return retryCountHeader;
    }

    if (typeof retryCountHeader === "string") {
      const parsedRetryCount = Number(retryCountHeader);

      return Number.isNaN(parsedRetryCount) ? 0 : parsedRetryCount;
    }

    return 0;
  }

  shouldRetry(retryCount: number): boolean {
    return retryCount < this.maxRetries;
  }

  async publishRetry(
    channel: amqp.Channel,
    message: amqp.ConsumeMessage,
    nextRetryCount: number,
  ): Promise<void> {
    channel.sendToQueue(recommendationQueueName, message.content, {
      persistent: true,
      headers: {
        ...message.properties.headers,
        "x-retry-count": nextRetryCount,
      },
    });
  }

  async publishToDlq(
    channel: amqp.Channel,
    message: amqp.ConsumeMessage,
    errorMessage: string,
    retryCount: number,
  ): Promise<void> {
    channel.sendToQueue(recommendationDlqName, message.content, {
      persistent: true,
      headers: {
        ...message.properties.headers,
        "x-retry-count": retryCount,
        "x-error-message": errorMessage,
      },
    });
  }
}