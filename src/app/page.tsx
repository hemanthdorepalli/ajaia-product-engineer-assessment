"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const USERS = [
  { id: "user-alice", name: "Alice", email: "alice@ajaia.ai" },
  { id: "user-bob", name: "Bob", email: "bob@ajaia.ai" },
  { id: "user-carol", name: "Carol", email: "carol@ajaia.ai" },
];

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
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Ajaia Docs</h1>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Select a user to continue
        </p>
        <div className="space-y-2 mb-6">
          {USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelected(u.id)}
              className={`w-full p-3 rounded-lg border text-left transition ${
                selected === u.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="font-medium">{u.name}</span>
              <span className="text-sm text-gray-400 ml-2">{u.email}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleLogin}
          disabled={!selected || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Continue"}
        </button>
      </div>
    </main>
  );
}