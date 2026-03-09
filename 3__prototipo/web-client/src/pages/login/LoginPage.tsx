import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { Logo } from "@/components/Logo";

export function LoginPage() {
  const navigate = useNavigate();

  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("nelson@test.com");

  const [password, setPassword] = useState("123456");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await login({ email, password });

      setAuth({
        accessToken: response.accessToken,
        user: response.user,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      alert("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <Logo />

        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Acessar conta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-purple-600 py-3 font-medium text-white transition hover:bg-purple-700"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>

      </div>
    </div>
  );
}
