import axios from "axios";

import { RecommendationRequestRepository } from "../repositories/recommendation-request.repository.js";
import type { RecommendationJob } from "../types/recommendation-job.js";

type Transaction = {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: string;
};

type ClassifiedTransaction = Transaction & {
  category: string;
};

export class RecommendationProcessorService {
  constructor(
    private readonly recommendationRequestRepository: RecommendationRequestRepository,
  ) {}

  async process(job: RecommendationJob): Promise<void> {
    const bankApiUrl = process.env.BANK_API_URL ?? "http://bank-api-dev:3001";
    const classificationApiUrl =
      process.env.CLASSIFICATION_API_URL ?? "http://classification-api-dev:3002";

    const bankResponse = await axios.get<{ userId: string; transactions: Transaction[] }>(
      `${bankApiUrl}/transactions/${job.userId}`,
    );

    const transactions = bankResponse.data.transactions;

    const classificationResponse = await axios.post<{ transactions: ClassifiedTransaction[] }>(
      `${classificationApiUrl}/classify`,
      { transactions },
    );

    const classifiedTransactions = classificationResponse.data.transactions;

    const result = {
      userId: job.userId,
      totalTransactions: classifiedTransactions.length,
      transactions: classifiedTransactions,
    };

    await this.recommendationRequestRepository.markAsCompleted(job.requestId, result);

    console.log(`Job ${job.requestId} processed successfully`);
  }
}