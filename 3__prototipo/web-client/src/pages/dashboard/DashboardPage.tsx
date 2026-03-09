import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createRecommendation } from "@/services/recommendation.service";
import { useAuthStore } from "@/store/auth.store";

export function DashboardPage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const logout = useAuthStore((state) => state.logout);

  const [initialDate, setInitialDate] = useState("2026-03-01");

  const [finalDate, setFinalDate] = useState("2026-03-31");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    setIsSubmitting(true);

    try {
      const response = await createRecommendation({
        initialDate,
        finalDate,
      });

      navigate(`/recommendations/${response.requestId}`);
    } catch (error) {
      console.error("Create recommendation error:", error);

      setErrorMessage("Não foi possível gerar a recomendação.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    logout();

    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#f5f4f8] px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Bem-vindo,{" "}
              <span className="font-semibold text-violet-700">
                {user?.name ?? "usuário"}
              </span>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-violet-200 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-50"
          >
            Sair
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">
            Buscar recomendações por período
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="initialDate"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Data inicial
                </label>

                <input
                  id="initialDate"
                  type="date"
                  value={initialDate}
                  onChange={(event) => setInitialDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="finalDate"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Data final
                </label>

                <input
                  id="finalDate"
                  type="date"
                  value={finalDate}
                  onChange={(event) => setFinalDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  required
                />
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Processando..." : "Gerar recomendação"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}