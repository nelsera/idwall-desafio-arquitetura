import type { Server, Socket } from "socket.io";

import { RecommendationService } from "../../services/recommendation.service.js";

export function registerRecommendationSocketHandlers(
  io: Server,
  recommendationService: RecommendationService,
): void {
  io.on("connection", (socket: Socket) => {
    console.log("WebSocket client connected", socket.id);

    socket.on("subscribe-recommendation", async (requestId: string) => {
      const room = `recommendation:${requestId}`;

      socket.join(room);

      console.log(`Socket ${socket.id} subscribed to ${room}`);

      try {
        const recommendation =
          await recommendationService.getRecommendationByRequestId(requestId);

        if (!recommendation) {
          socket.emit("recommendation:not-found", { requestId });
          return;
        }

        if (recommendation.status === "completed") {
          socket.emit("recommendation:completed", {
            requestId: recommendation.requestId,
            status: recommendation.status,
            result: recommendation.result,
          });

          console.log(
            `Recommendation ${requestId} was already completed. Hydrated state sent to socket ${socket.id}`,
          );

          return;
        }

        if (recommendation.status === "failed") {
          socket.emit("recommendation:failed", {
            requestId: recommendation.requestId,
            status: recommendation.status,
            result: recommendation.result,
          });

          console.log(
            `Recommendation ${requestId} was already failed. Hydrated state sent to socket ${socket.id}`,
          );

          return;
        }
      } catch (error) {
        console.error(
          `Failed to hydrate recommendation state for request ${requestId}`,
          error,
        );

        socket.emit("recommendation:error", {
          requestId,
          message: "Failed to load recommendation state",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("WebSocket client disconnected", socket.id);
    });
  });
}