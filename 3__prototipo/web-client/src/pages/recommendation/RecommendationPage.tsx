import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

import { getRecommendationById } from "@/services/recommendation.service";
import type {
  RecommendationCompletedEvent,
  RecommendationStatusResponse,
} from "@/types/recommendation";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";

type RecommendationFailedEvent = {
  requestId: string;
  status: "failed";
  result?: unknown;
};

export function RecommendationPage() {
  const { requestId = "" } = useParams();

  const [recommendation, setRecommendation] =
    useState<RecommendationStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const totalAmount = useMemo(() => {
    if (!recommendation?.result || !("expenses" in recommendation.result)) {
      return 0;
    }

    return recommendation.result.expenses.reduce((accumulator, expense) => {
      return accumulator + expense.totalAmount;
    }, 0);
  }, [recommendation]);

  useEffect(() => {
    if (!requestId) {
      setErrorMessage("Request ID inválido.");
      setIsLoading(false);
      return;
    }

    let active = true;
    let socket: Socket | null = null;

    async function setup() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await getRecommendationById(requestId);

        if (!active) {
          return;
        }

        setRecommendation(response);

        if (response.status === "completed" || response.status === "failed") {
          setIsLoading(false);
          return;
        }

        socket = io(SOCKET_URL, {
          transports: ["websocket"],
        });

        socket.on("connect", () => {
          socket?.emit("subscribe-recommendation", requestId);
        });

        socket.on(
          "recommendation:completed",
          (event: RecommendationCompletedEvent) => {
            if (!active || event.requestId !== requestId) {
              return;
            }

            setRecommendation({
              requestId: event.requestId,
              status: event.status,
              result: event.result,
            });

            setIsLoading(false);
            socket?.disconnect();
          },
        );

        socket.on(
          "recommendation:failed",
          (event: RecommendationFailedEvent) => {
            if (!active || event.requestId !== requestId) {
              return;
            }

            setRecommendation({
              requestId: event.requestId,
              status: event.status,
              result: event.result,
            });

            setIsLoading(false);
            socket?.disconnect();
          },
        );

        socket.on("recommendation:not-found", () => {
          if (!active) {
            return;
          }

          setErrorMessage("Recomendação não encontrada.");
          setIsLoading(false);
          socket?.disconnect();
        });

        socket.on("recommendation:error", () => {
          if (!active) {
            return;
          }

          setErrorMessage("Não foi possível acompanhar a recomendação.");
          setIsLoading(false);
          socket?.disconnect();
        });

        socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);

          if (!active) {
            return;
          }

          setErrorMessage("Não foi possível conectar ao WebSocket.");
          setIsLoading(false);
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Get recommendation error:", error);

        if (!active) {
          return;
        }

        setErrorMessage("Não foi possível carregar a recomendação.");
        setIsLoading(false);
      }
    }

    setup();

    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [requestId]);

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f4f8] px-4">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Erro</h1>
          <p className="mt-3 text-slate-600">{errorMessage}</p>

          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-lg bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-700"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (
    isLoading ||
    recommendation?.status === "pending" ||
    recommendation?.status === "processing"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f4f8] px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <h1 className="text-2xl font-bold text-slate-900">
            Gerando recomendação
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Estamos processando sua solicitação. O resultado aparecerá automaticamente.
          </p>

          <p className="mt-4 text-xs text-slate-400">
            Request ID: {requestId}
          </p>
        </div>
      </div>
    );
  }

  if (recommendation?.status === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f4f8] px-4">
        <div className="w-full max-w-xl rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Serviço temporariamente indisponível
          </h1>

          <p className="mt-3 text-slate-600">
            Não foi possível concluir a recomendação neste momento. Tente novamente em instantes.
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Request ID: {requestId}
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-lg bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-700"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f4f8] px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Recomendação</h1>
            <p className="mt-2 text-slate-500">Request ID: {requestId}</p>
          </div>

          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            Status: completed
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Usuário</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {"result" in recommendation && recommendation.result && "id" in recommendation.result
                ? recommendation.result.id
                : "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total de despesas</p>
            <p className="mt-2 text-xl font-semibold text-violet-700">
              R$ {totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-slate-900">
            Despesas por categoria
          </h2>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Valor total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {"result" in recommendation &&
                recommendation.result &&
                "expenses" in recommendation.result
                  ? recommendation.result.expenses.map((expense) => (
                      <tr key={expense.category}>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {expense.category}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          R$ {expense.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <Link
            to="/dashboard"
            className="inline-block rounded-lg border border-violet-200 bg-white px-5 py-3 font-medium text-violet-700 transition hover:bg-violet-50"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}