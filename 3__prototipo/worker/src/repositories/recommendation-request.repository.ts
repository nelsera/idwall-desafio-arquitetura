import { postgresPool } from "../infra/postgres.js";

export class RecommendationRequestRepository {
  async markAsCompleted(requestId: string): Promise<void> {
    await postgresPool.query(
      `
      UPDATE recommendation_requests
      SET
        status = $2,
        processed_at = NOW()
      WHERE request_id = $1
      `,
      [requestId, "completed"],
    );
  }

  async markAsFailed(
    requestId: string,
    _errorMessage: string,
    _retryCount: number,
  ): Promise<void> {
    await postgresPool.query(
      `
      UPDATE recommendation_requests
      SET
        status = $2,
        processed_at = NOW()
      WHERE request_id = $1
      `,
      [requestId, "failed"],
    );
  }
}