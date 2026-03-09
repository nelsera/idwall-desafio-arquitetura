import { randomUUID } from "node:crypto";
import { postgresPool } from "../infra/postgres.js";

export type RecommendationExpenseInput = {
  category: string;
  totalAmount: number;
};

export class RecommendationExpenseRepository {
  async createMany(
    requestId: string,
    expenses: RecommendationExpenseInput[],
  ): Promise<void> {
    for (const expense of expenses) {
      await postgresPool.query(
        `
        INSERT INTO recommendation_expenses (
          expense_id,
          request_id,
          category,
          total_amount
        )
        VALUES ($1, $2, $3, $4)
        `,
        [
          randomUUID(),
          requestId,
          expense.category,
          expense.totalAmount,
        ],
      );
    }
  }
}