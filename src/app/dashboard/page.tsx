"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { DashboardSkeleton } from "@/components/Skeleton";

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
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const toast = useToast();

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
    setCreating(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled" }),
      });
      if (!res.ok) throw new Error();
      const doc = await res.json();
      router.push(`/docs/${doc.id}`);
    } catch {
      toast("Couldn't create document", "error");
      setCreating(false);
    }
  };

  const deleteDoc = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this document?")) return;
    const prev = owned;
    setOwned((p) => p.filter((d) => d.id !== id));
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Document deleted", "info");
    } catch {
      setOwned(prev);
      toast("Couldn't delete document", "error");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/documents/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast(`Imported “${data.title}”`, "success");
      router.push(`/docs/${data.id}`);
    } catch (err) {
      toast((err as Error).message || "Upload failed", "error");
      setUploading(false);
    }
    e.target.value = "";
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold text-blue-600">Ajaia Docs</h1>
          <div className="flex items-center gap-2">
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="skeleton h-4 w-20 rounded" />
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="skeleton h-6 w-40 rounded mb-6" />
          <DashboardSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">Ajaia Docs</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]}
            </div>
            <span className="text-sm text-gray-600 font-medium">{user?.name}</span>
          </div>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500 transition">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Documents</h2>
          <div className="flex gap-2">
            <label className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer transition">
              {uploading ? "Importing..." : "↑ Import .txt / .md"}
              <input
                type="file"
                accept=".txt,.md"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={createDoc}
              disabled={creating}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating…" : "+ New Document"}
            </button>
          </div>
        </div>

        {owned.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center mb-10">
            <p className="text-gray-400 text-sm">No documents yet.</p>
            <button onClick={createDoc} className="text-blue-600 text-sm font-medium mt-2 hover:underline">
              Create your first document
            </button>
          </div>
        ) : (
          <div className="grid gap-3 mb-10">
            {owned.map((doc) => (
              <div
                key={doc.id}
                onClick={() => router.push(`/docs/${doc.id}`)}
                className="bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm cursor-pointer flex justify-between items-center transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 text-lg">
                    📄
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{doc.title}</p>
                    <p className="text-xs text-gray-400">
                      Edited {new Date(doc.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => deleteDoc(doc.id, e)}
                  className="text-gray-300 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100 transition"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-900 mb-4">Shared with Me</h2>
        {shared.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No shared documents yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {shared.map((doc) => (
              <div
                key={doc.id}
                onClick={() => router.push(`/docs/${doc.id}`)}
                className="bg-white p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-500 text-lg">
                    🔗
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{doc.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        doc.shares?.[0]?.permission === "edit"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {doc.shares?.[0]?.permission || "view"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Shared by {doc.owner.name} · Edited {new Date(doc.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}