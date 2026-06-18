"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function LoginPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    fetch("/api/auth/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => toast("Couldn't load accounts", "error"))
      .finally(() => setUsersLoading(false));
  }, [toast]);

  const handleLogin = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selected }),
      });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
    } catch {
      toast("Sign in failed. Please try again.", "error");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ajaia Docs</h1>
          <p className="text-sm text-gray-500 mt-2">Collaborative Document Editor</p>
        </div>
        <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">
          Select account
        </p>
        <div className="space-y-2 mb-6">
          {usersLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full p-4 rounded-xl border-2 border-gray-100 flex items-center gap-3"
                >
                  <div className="skeleton w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 w-24 rounded" />
                    <div className="skeleton h-3 w-32 rounded" />
                  </div>
                </div>
              ))
            : users.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelected(u.id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selected === u.id
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  selected === u.id ? "bg-blue-500" : "bg-gray-300"
                }`}>
                  {u.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={handleLogin}
          disabled={!selected || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Signing in..." : "Continue"}
        </button>
      </div>
    </main>
  );
}