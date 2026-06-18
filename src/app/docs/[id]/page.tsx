"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ShareModal from "@/components/ShareModal";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface DocData {
  id: string;
  title: string;
  content: Record<string, unknown>;
  permission: string;
}

export default function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doc, setDoc] = useState<DocData | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showShare, setShowShare] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then((r) => {
        if (r.status === 401) { router.push("/"); return null; }
        if (r.status === 404 || r.status === 403) { setError("Document not found or no access"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setDoc(data);
          setTitle(data.title);
        }
      });
  }, [id, router]);

  const saveContent = useCallback(
    async (content: Record<string, unknown>) => {
      setSaving(true);
      await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setSaving(false);
    },
    [id]
  );

  const saveTitle = async () => {
    if (title === doc?.title) return;
    await fetch(`/api/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.push("/dashboard")} className="text-blue-600 hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!doc) return <div className="p-8 text-gray-400">Loading...</div>;

  const canEdit = doc.permission === "owner" || doc.permission === "edit";

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back
          </button>
          {canEdit ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
            />
          ) : (
            <h1 className="text-lg font-semibold">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-gray-400">Saving...</span>}
          {doc.permission === "owner" && (
            <button
              onClick={() => setShowShare(true)}
              className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Share
            </button>
          )}
          <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-500">
            {doc.permission}
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <Editor content={doc.content} onSave={saveContent} editable={canEdit} />
      </div>

      {showShare && (
        <ShareModal docId={id} onClose={() => setShowShare(false)} />
      )}
    </main>
  );
}