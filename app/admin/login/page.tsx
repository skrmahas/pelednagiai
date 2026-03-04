"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Klaida");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Klaida prisijungiant");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-card-bg rounded-lg border border-border overflow-hidden">
        <div className="bg-primary text-black px-6 py-4">
          <h1 className="text-xl font-black text-center">ADMIN</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-text-muted">
              Slaptažodis
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-danger text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black py-3 px-4 rounded-lg font-black hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "PRISIJUNGTI"}
          </button>

          <p className="text-center text-text-muted text-sm mt-4">
            Hint: password is <span className="text-primary font-mono">AugisBaugis123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
