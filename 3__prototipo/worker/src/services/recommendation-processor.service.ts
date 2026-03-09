import axios from "axios";

import { redisClient } from "../infra/redis.js";
import { RecommendationExpenseRepository } from "../repositories/recommendation-expense.repository.js";
import { RecommendationRequestRepository } from "../repositories/recommendation-request.repository.js";
import type { RecommendationJob } from "../types/recommendation-job.js";
import { UserBankAccountRepository } from "../repositories/user-bank-account.repository.js";

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

type AggregatedExpense = {
  category: string;
  totalAmount: number;
};

function mapCategoryName(category: string): string {
  switch (category.toLowerCase()) {
    case "food":
      return "Food";

    case "transport":
      return "Transport";

    case "entertainment":
      return "Entertainment";

    case "fuel":
      return "Fuel";

      default:
      return "Other";
  }
}

function aggregateExpenses(
  classifiedTransactions: ClassifiedTransaction[],
): AggregatedExpense[] {
  const totalsByCategory = new Map<string, number>();

  for (const transaction of classifiedTransactions) {
    const category = mapCategoryName(transaction.category);

    const currentTotal = totalsByCategory.get(category) ?? 0;

    totalsByCategory.set(category, currentTotal + transaction.amount);
  }

  return Array.from(totalsByCategory.entries())
    .map(([category, totalAmount]) => ({
      category,
      totalAmount: Number(totalAmount.toFixed(2)),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export class RecommendationProcessorService {
  constructor(
    private readonly recommendationRequestRepository: RecommendationRequestRepository,
    private readonly recommendationExpenseRepository: RecommendationExpenseRepository,
    private readonly userBankAccountRepository: UserBankAccountRepository,
  ) {}

  async process(job: RecommendationJob): Promise<void> {
    const bankApiUrl = process.env.BANK_API_URL ?? "http://bank-api-dev:3001";

    const classificationApiUrl =
      process.env.CLASSIFICATION_API_URL ?? "http://classification-api-dev:3002";

    const bankAccounts =
      await this.userBankAccountRepository.findActiveByUserId(job.userId);

    if (bankAccounts.length === 0) {
      throw new Error("no active bank accounts found for user");
    }

    const allTransactions: Transaction[] = [];

    for (const account of bankAccounts) {
      const bankResponse = await axios.get<{ userId: string; transactions: Transaction[] }>(
        `${bankApiUrl}/transactions/${account.bankUserId}`,
        {
          params: {
            initialDate: job.initialDate,
            finalDate: job.finalDate,
          },
        },
      );

      allTransactions.push(...bankResponse.data.transactions);
    }

    const classificationResponse = await axios.post<{ transactions: ClassifiedTransaction[] }>(
      `${classificationApiUrl}/classify`,
      { transactions: allTransactions },
    );

    const classifiedTransactions = classificationResponse.data.transactions;

    const expenses = aggregateExpenses(classifiedTransactions);

    await this.recommendationExpenseRepository.createMany(job.requestId, expenses);

    await this.recommendationRequestRepository.markAsCompleted(job.requestId);

    await redisClient.set(
      `recommendation:${job.requestId}`,
      JSON.stringify({
        requestId: job.requestId,
        status: "completed",
        result: {
          id: job.userId,
          expenses,
        },
      }),
      {
        EX: 3600,
      },
    );

    console.log(`Job ${job.requestId} processed successfully`);
  }
}