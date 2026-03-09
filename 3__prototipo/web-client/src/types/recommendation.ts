export type CreateRecommendationRequest = {
  initialDate: string;
  finalDate: string;
};

export type CreateRecommendationResponse = {
  requestId: string;
  status: "processing" | "completed" | "failed";
};

export type Expense = {
  category: string;
  totalAmount: number;
};

export type RecommendationResult = {
  id: string;
  expenses: Expense[];
};

export type RecommendationStatusResponse = {
  requestId: string;
  status: "processing" | "completed" | "failed";
  result?: RecommendationResult;
};

export type RecommendationCompletedEvent = {
  requestId: string;
  status: "completed";
  result: RecommendationResult;
};