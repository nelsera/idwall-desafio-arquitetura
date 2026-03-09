import { api } from "@/services/api";
import type {
  CreateRecommendationRequest,
  CreateRecommendationResponse,
  RecommendationStatusResponse,
} from "@/types/recommendation";

export async function createRecommendation(
  payload: CreateRecommendationRequest,
): Promise<CreateRecommendationResponse> {
  const { data } = await api.post<CreateRecommendationResponse>(
    "/recommendations",
    payload,
  );

  return data;
}

export async function getRecommendationById(
  requestId: string,
): Promise<RecommendationStatusResponse> {
  const { data } = await api.get<RecommendationStatusResponse>(
    `/recommendations/${requestId}`,
  );

  return data;
}