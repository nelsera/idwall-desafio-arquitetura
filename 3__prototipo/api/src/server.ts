import express from "express";
import { postgresPool } from "./infra/postgres.js";
import { getRabbitChannel } from "./infra/rabbitmq.js";
import { connectRedis } from "./infra/redis.js";
import { recommendationRoutes } from "./routes/recommendation.routes.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(recommendationRoutes);

async function bootstrap() {
  try {
    await postgresPool.query("SELECT 1");
    console.log("PostgreSQL connection is ready");

    await getRabbitChannel();
    console.log("RabbitMQ connection is ready");

    await connectRedis();
    console.log("Redis connection is ready");

    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to bootstrap API", error);
    process.exit(1);
  }
}

bootstrap();