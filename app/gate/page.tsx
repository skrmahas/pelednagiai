"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GatePage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Neteisingas slaptažodis");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Klaida");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black">
            <span className="text-white">PELĖDNAGIŲ</span>
            <span className="bg-[#ff9000] text-black px-3 py-1 rounded ml-2">2x2</span>
          </h1>
          <p className="text-[#999] mt-2">Draugų krepšinio turnyras</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden">
          <div className="bg-[#ff9000] text-black px-6 py-4">
            <h2 className="text-lg font-black text-center">ĮEITI</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-[#999]">
                Slaptažodis
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#333] rounded-lg bg-[#0d0d0d] text-white focus:outline-none focus:border-[#ff9000]"
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-[#f44336] text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff9000] text-black py-3 px-4 rounded-lg font-black hover:bg-[#e07f00] transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "ĮEITI"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
