import { createClient } from "redis";

import { io } from "../server.js";

export async function startRecommendationEventsListener(): Promise<void> {
  const redisUrl = process.env.REDIS_URL ?? "redis://redis:6379";

  const subscriber = createClient({
    url: redisUrl,
  });

  subscriber.on("error", (error) => {
    console.error("Redis subscriber error", error);
  });

  await subscriber.connect();

  console.log("Redis PubSub subscriber connected");

  await subscriber.subscribe("recommendation.completed", (message) => {
    try {
      const data = JSON.parse(message);

      const room = `recommendation:${data.requestId}`;

      io.to(room).emit("recommendation:completed", data);

      console.log(
        `Recommendation completed event sent via WebSocket to room ${room}`,
      );
    } catch (error) {
      console.error("Failed to process recommendation.completed event", error);
    }
  });

  await subscriber.subscribe("recommendation.failed", (message) => {
    try {
      const data = JSON.parse(message);

      const room = `recommendation:${data.requestId}`;

      io.to(room).emit("recommendation:failed", data);

      console.log(
        `Recommendation failed event sent via WebSocket to room ${room}`,
      );
    } catch (error) {
      console.error("Failed to process recommendation.failed event", error);
    }
  });
}