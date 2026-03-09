import { RecommendationConsumer } from "./consumers/recommendation.consumer.js";
import {
  getRabbitChannel,
  recommendationDlqName,
  recommendationQueueName,
} from "./infra/rabbitmq.js";
import { connectRedis } from "./infra/redis.js";
import { RecommendationRequestRepository } from "./repositories/recommendation-request.repository.js";
import { RecommendationProcessorService } from "./services/recommendation-processor.service.js";
import { RetryHandlerService } from "./services/retry-handler.service.js";

async function bootstrap() {
  await connectRedis();
  console.log("Redis connection is ready");

  const channel = await getRabbitChannel();

  await channel.assertQueue(recommendationQueueName, {
    durable: true,
  });

  await channel.assertQueue(recommendationDlqName, {
    durable: true,
  });

  channel.prefetch(1);

  const repository = new RecommendationRequestRepository();

  const processorService = new RecommendationProcessorService(repository);

  const retryHandlerService = new RetryHandlerService(3);

  const consumer = new RecommendationConsumer(
    processorService,
    repository,
    retryHandlerService,
  );

  await channel.consume(recommendationQueueName, async (message) => {
    await consumer.handle(channel, message);
  });

  console.log(`Worker started and consuming queue "${recommendationQueueName}"`);
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap worker", error);

  process.exit(1);
});