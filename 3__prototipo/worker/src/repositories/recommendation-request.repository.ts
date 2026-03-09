import { postgresPool } from "../infra/postgres.js";

export class RecommendationRequestRepository {
  async markAsCompleted(
    requestId: string,
    result: unknown,
  ): Promise<void> {
    await postgresPool.query(
      `
      UPDATE recommendation_requests
      SET
        status = $2,
        processed_at = NOW(),
        result = $3::jsonb
      WHERE request_id = $1
      `,
      [requestId, "completed", JSON.stringify(result)],
    );
  }

  async markAsFailed(
    requestId: string,
    errorMessage: string,
    retryCount: number,
  ): Promise<void> {
    await postgresPool.query(
      `
      UPDATE recommendation_requests
      SET
        status = $2,
        processed_at = NOW(),
        result = $3::jsonb
      WHERE request_id = $1
      `,
      [
        requestId,
        "failed",
        JSON.stringify({
          message: errorMessage,
          retryCount,
        }),
      ],
    );
  }
}