import amqp from "amqplib";

const rabbitmqHost = process.env.RABBITMQ_HOST ?? "rabbitmq";
const rabbitmqPort = Number(process.env.RABBITMQ_PORT ?? 5672);

let channel: amqp.Channel | null = null;

export const recommendationQueueName = "recommendation.requests";
export const recommendationDlqName = "recommendation.requests.dlq";

export async function getRabbitChannel(): Promise<amqp.Channel> {
  if (channel) {
    return channel;
  }

  const connection = await amqp.connect(`amqp://${rabbitmqHost}:${rabbitmqPort}`);
  const createdChannel = await connection.createChannel();

  channel = createdChannel;

  return createdChannel;
}