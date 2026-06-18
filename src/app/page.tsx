"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const USERS = [
  { id: "hemanth-test", name: "Hemanth", email: "hemanth@ajaia.ai" },
  { id: "user-bob", name: "Bob", email: "bob@ajaia.ai" },
  { id: "user-carol", name: "Carol", email: "carol@ajaia.ai" },
];

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function LoginPage() {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!selected) return;
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selected }),
    });

    if (res.ok) {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl ring-1 ring-slate-900/5 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white text-xl font-bold shadow-sm">
            A
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Ajaia Docs</h1>
          <p className="text-sm text-slate-500 mt-1">Select a user to continue</p>
        </div>
        <div className="space-y-2 mb-6">
          {USERS.map((u, i) => (
            <button
              key={u.id}
              onClick={() => setSelected(u.id)}
              className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                selected === u.id
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
                  AVATAR_COLORS[i % AVATAR_COLORS.length]
                }`}
              >
                {initials(u.name)}
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-slate-900">{u.name}</span>
                <span className="block truncate text-sm text-slate-400">{u.email}</span>
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={handleLogin}
          disabled={!selected || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium shadow-sm transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Continue"}
        </button>
      </div>
    </main>
  );
}