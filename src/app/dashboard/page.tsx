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

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Ajaia Docs</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.name} ({user?.email})</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">My Documents</h2>
          <div className="flex gap-2">
            <label className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 cursor-pointer">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              + New Document
            </button>
          </div>
        </div>

        {owned.length === 0 ? (
          <p className="text-gray-400 text-sm mb-8">No documents yet. Create one to get started.</p>
        ) : (
          <div className="grid gap-3 mb-8">
            {owned.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 rounded-lg border hover:shadow-sm flex justify-between items-center"
              >
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => router.push(`/docs/${doc.id}`)}
                >
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-xs text-gray-400">
                    Updated {new Date(doc.updatedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteDoc(doc.id)}
                  className="text-red-400 hover:text-red-600 text-sm ml-4"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-lg font-semibold mb-4">Shared with Me</h2>
        {shared.length === 0 ? (
          <p className="text-gray-400 text-sm">No shared documents.</p>
        ) : (
          <div className="grid gap-3">
            {shared.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 rounded-lg border hover:shadow-sm cursor-pointer"
                onClick={() => router.push(`/docs/${doc.id}`)}
              >
                <div className="flex items-center gap-2">
                  <p className="font-medium">{doc.title}</p>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">
                    {doc.shares?.[0]?.permission || "view"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  By {doc.owner.name} · Updated {new Date(doc.updatedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}