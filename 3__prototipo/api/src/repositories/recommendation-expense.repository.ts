import { postgresPool } from "../infra/postgres.js";

export type RecommendationExpenseRecord = {
  category: string;
  totalAmount: number;
};

export class RecommendationExpenseRepository {
  async findByRequestId(
    requestId: string,
  ): Promise<RecommendationExpenseRecord[]> {
    const result = await postgresPool.query(
      `
      SELECT
        category,
        total_amount
      FROM recommendation_expenses
      WHERE request_id = $1
      ORDER BY category
      `,
      [requestId],
    );

    return result.rows.map((row) => ({
      category: row.category,
      totalAmount: Number(row.total_amount),
    }));
  }
}