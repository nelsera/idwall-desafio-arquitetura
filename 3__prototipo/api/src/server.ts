import express from "express";

import { recommendationRoutes } from "./routes/recommendation.routes.js";
import { getRabbitChannel } from "./infra/rabbitmq.js";

const app = express();

const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.use(recommendationRoutes);

async function bootstrap() {
  try {
    await getRabbitChannel();

    console.log("RabbitMQ connection is ready");

    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to bootstrap API", error);

    process.exit(1);
  }
}

bootstrap();