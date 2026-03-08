import express from "express";
import { randomUUID } from "node:crypto";
import amqp from "amqplib";

const app = express();

app.use(express.json());

const port = Number(process.env.PORT ?? 3000);

const rabbitmqHost = process.env.RABBITMQ_HOST ?? "rabbitmq";

const rabbitmqPort = Number(process.env.RABBITMQ_PORT ?? 5672);

const queueName = "recommendation.requests";

let channel: amqp.Channel | null = null;

async function connectRabbitMQ(): Promise<amqp.Channel> {
  if (channel) {
    return channel;
  }

  const connection = await amqp.connect(`amqp://${rabbitmqHost}:${rabbitmqPort}`);

  const createdChannel = await connection.createChannel();

  await createdChannel.assertQueue(queueName, {
    durable: true,
  });

  channel = createdChannel;

  console.log(`Connected to RabbitMQ and queue "${queueName}" is ready`);

  return createdChannel;
}

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "api",
    message: "Recommendation API is running",
  });
});

app.post("/recommendations", async (req, res) => {
  try {
    const { userId } = req.body as { userId?: string };

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    const requestId = randomUUID();

    const queueChannel = await connectRabbitMQ();

    const payload = {
      requestId,
      userId,
      requestedAt: new Date().toISOString(),
    };

    queueChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });

    return res.status(202).json({
      requestId,
      status: "processing",
    });
  } catch (error) {
    console.error("Failed to publish recommendation request", error);

    return res.status(500).json({
      message: "failed to enqueue recommendation request",
    });
  }
});

app.listen(port, async () => {
  console.log(`API running on port ${port}`);

  try {
    await connectRabbitMQ();
  } catch (error) {
    console.error("Failed to connect to RabbitMQ during startup", error);
  }
});
