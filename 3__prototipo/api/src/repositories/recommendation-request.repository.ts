import { postgresPool } from "../infra/postgres.js";

export type CreateRecommendationRequestInput = {
  requestId: string;
  userId: string;
  status: string;
  requestedAt: string;
};

export class RecommendationRequestRepository {
  async create(input: CreateRecommendationRequestInput): Promise<void> {
    await postgresPool.query(
      `
      INSERT INTO recommendation_requests (
        request_id,
        user_id,
        status,
        requested_at
      )
      VALUES ($1, $2, $3, $4)
      `,
      [input.requestId, input.userId, input.status, input.requestedAt],
    );
  }
}