import { postgresPool } from "../infra/postgres.js";

export type CreateRecommendationRequestInput = {
  requestId: string;
  userId: string;
  initialDate: string;
  finalDate: string;
  status: string;
  requestedAt: string;
};

export type RecommendationRequestRecord = {
  requestId: string;
  userId: string;
  initialDate: string;
  finalDate: string;
  status: string;
  requestedAt: string;
  processedAt: string | null;
};

export class RecommendationRequestRepository {
  async create(input: CreateRecommendationRequestInput): Promise<void> {
    await postgresPool.query(
      `
      INSERT INTO recommendation_requests (
        request_id,
        user_id,
        initial_date,
        final_date,
        status,
        requested_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        input.requestId,
        input.userId,
        input.initialDate,
        input.finalDate,
        input.status,
        input.requestedAt,
      ],
    );
  }

  async findByRequestId(
    requestId: string,
  ): Promise<RecommendationRequestRecord | null> {
    const result = await postgresPool.query(
      `
      SELECT
        request_id,
        user_id,
        initial_date,
        final_date,
        status,
        requested_at,
        processed_at
      FROM recommendation_requests
      WHERE request_id = $1
      `,
      [requestId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      requestId: row.request_id,
      userId: row.user_id,
      initialDate: row.initial_date,
      finalDate: row.final_date,
      status: row.status,
      requestedAt: row.requested_at,
      processedAt: row.processed_at,
    };
  }
}