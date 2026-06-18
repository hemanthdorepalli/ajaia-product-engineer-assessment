"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Doc {
  id: string;
  title: string;
  updatedAt: string;
  owner: { name: string; email: string };
  shares?: { permission: string }[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const [owned, setOwned] = useState<Doc[]>([]);
  const [shared, setShared] = useState<Doc[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/documents/import", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const doc = await res.json();
      router.push(`/docs/${doc.id}`);
    } else {
      const err = await res.json();
      alert(err.error || "Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/documents").then((r) => (r.ok ? r.json() : null)),
    ]).then(([u, docs]) => {
      if (!u) return router.push("/");
      setUser(u);
      setOwned(docs?.owned || []);
      setShared(docs?.shared || []);
      setLoading(false);
    });
  }, [router]);

  const createDoc = async () => {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled" }),
    });
    if (res.ok) {
      const doc = await res.json();
      router.push(`/docs/${doc.id}`);
    }
  };

  const deleteDoc = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    setOwned((prev) => prev.filter((d) => d.id !== id));
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        Loading...
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Ajaia Docs</h1>
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {user?.name?.[0]?.toUpperCase()}
          </span>
          <span className="hidden text-sm text-slate-600 sm:block">
            {user?.name}{" "}
            <span className="text-slate-400">({user?.email})</span>
          </span>
          <button
            onClick={logout}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h2 className="text-lg font-semibold text-slate-900">My Documents</h2>
          <div className="flex gap-2">
            <label className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100">
              {uploading ? "Importing..." : "Import .txt / .md"}
              <input
                type="file"
                accept=".txt,.md"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={createDoc}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              + New Document
            </button>
          </div>
        </div>

        {owned.length === 0 ? (
          <div className="mb-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
            No documents yet. Create one to get started.
          </div>
        ) : (
          <div className="grid gap-3 mb-8">
            {owned.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div
                  className="flex flex-1 cursor-pointer items-center gap-3"
                  onClick={() => router.push(`/docs/${doc.id}`)}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <DocIcon />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{doc.title}</p>
                    <p className="text-xs text-slate-400">
                      Updated {new Date(doc.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteDoc(doc.id)}
                  className="ml-4 rounded-lg px-3 py-1.5 text-sm font-medium text-red-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-lg font-semibold text-slate-900 mb-4">Shared with Me</h2>
        {shared.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
            No shared documents.
          </div>
        ) : (
          <div className="grid gap-3">
            {shared.map((doc) => (
              <div
                key={doc.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
                onClick={() => router.push(`/docs/${doc.id}`)}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <DocIcon />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-slate-900">{doc.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      {doc.shares?.[0]?.permission || "view"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    By {doc.owner.name} · Updated {new Date(doc.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function DocIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}