import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import { postgresPool } from "./infra/postgres.js";
import { getRabbitChannel } from "./infra/rabbitmq.js";
import { connectRedis } from "./infra/redis.js";
import { authRoutes } from "./routes/auth.routes.js";
import { recommendationRoutes } from "./routes/recommendation.routes.js";
import { RecommendationExpenseRepository } from "./repositories/recommendation-expense.repository.js";
import { RecommendationRequestRepository } from "./repositories/recommendation-request.repository.js";
import { RecommendationService } from "./services/recommendation.service.js";
import { startRecommendationEventsListener } from "./websocket/recommendation-events.listener.js";
import { registerRecommendationSocketHandlers } from "./websocket/handlers/recommendation.socket.handler.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);

const port = Number(process.env.PORT ?? 3000);

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const recommendationRequestRepository = new RecommendationRequestRepository();

const recommendationExpenseRepository = new RecommendationExpenseRepository();

const recommendationService = new RecommendationService(
  recommendationRequestRepository,
  recommendationExpenseRepository,
);

app.use(express.json());

app.use(authRoutes);

app.use(recommendationRoutes);

registerRecommendationSocketHandlers(io, recommendationService);

async function bootstrap() {
  try {
    await postgresPool.query("SELECT 1");
    console.log("PostgreSQL connection is ready");

    await getRabbitChannel();
    console.log("RabbitMQ connection is ready");

    await connectRedis();
    console.log("Redis connection is ready");

    await startRecommendationEventsListener();
    console.log("Redis PubSub listener started");

    httpServer.listen(port, () => {
      console.log(`API running on port ${port}`);
      console.log(`WebSocket server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to bootstrap API", error);
    process.exit(1);
  }
}

bootstrap();