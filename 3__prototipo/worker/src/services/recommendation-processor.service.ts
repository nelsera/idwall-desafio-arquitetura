import axios from "axios";
import { redisClient } from "../infra/redis.js";
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

type Expense = {
  categoryId: string;
  categoryName: string;
  purchaseId: string;
  moneySpent: number;
  purchaseDate: string;
};

function mapCategory(category: string): { categoryId: string; categoryName: string } {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory === "food") {
    return {
      categoryId: "cat-food",
      categoryName: "Food",
    };
  }

  if (normalizedCategory === "transport") {
    return {
      categoryId: "cat-transport",
      categoryName: "Transport",
    };
  }

  if (normalizedCategory === "entertainment") {
    return {
      categoryId: "cat-entertainment",
      categoryName: "Entertainment",
    };
  }

  if (normalizedCategory === "fuel") {
    return {
      categoryId: "cat-fuel",
      categoryName: "Fuel",
    };
  }

  return {
    categoryId: "cat-other",
    categoryName: "Other",
  };
}

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
      {
        params: {
          initialDate: job.initialDate,
          finalDate: job.finalDate,
        },
      },
    );

    const transactions = bankResponse.data.transactions;

    const classificationResponse = await axios.post<{ transactions: ClassifiedTransaction[] }>(
      `${classificationApiUrl}/classify`,
      { transactions },
    );

    const classifiedTransactions = classificationResponse.data.transactions;

    const expenses: Expense[] = classifiedTransactions.map((transaction) => {
      const mappedCategory = mapCategory(transaction.category);

      return {
        categoryId: mappedCategory.categoryId,
        categoryName: mappedCategory.categoryName,
        purchaseId: transaction.id,
        moneySpent: transaction.amount,
        purchaseDate: transaction.date,
      };
    });

    const result = {
      id: job.userId,
      expenses,
    };

    await this.recommendationRequestRepository.markAsCompleted(job.requestId, result);

    await redisClient.set(
      `recommendation:${job.requestId}`,
      JSON.stringify({
        requestId: job.requestId,
        id: job.userId,
        initialDate: job.initialDate,
        finalDate: job.finalDate,
        status: "completed",
        requestedAt: job.requestedAt,
        processedAt: new Date().toISOString(),
        result,
        source: "redis",
      }),
      {
        EX: 3600,
      },
    );

    console.log(`Job ${job.requestId} processed successfully`);
  }
}