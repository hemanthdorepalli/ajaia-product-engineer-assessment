"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useToast } from "@/components/Toast";
import { EditorSkeleton } from "@/components/Skeleton";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface DocData {
  id: string;
  title: string;
  content: Record<string, unknown>;
  permission: string;
}

interface ShareUser {
  id: string;
  name: string;
  email: string;
}

interface ShareEntry {
  id: string;
  permission: string;
  user: ShareUser;
}

export default function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const [doc, setDoc] = useState<DocData | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [users, setUsers] = useState<ShareUser[]>([]);
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [sharePerm, setSharePerm] = useState("view");
  const [shareLoading, setShareLoading] = useState(false);
  const [busyShareId, setBusyShareId] = useState<string | null>(null);
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
      try {
        const res = await fetch(`/api/documents/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error();
        setSavedAt(new Date());
      } catch {
        toast("Couldn't save changes", "error");
      } finally {
        setSaving(false);
      }
    },
    [id, toast]
  );

  const saveTitle = async () => {
    if (title === doc?.title) return;
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      setDoc((prev) => (prev ? { ...prev, title } : prev));
      toast("Title updated", "success");
    } catch {
      toast("Couldn't update title", "error");
    }
  };

  const openShareModal = async () => {
    setShowShare(true);
    setSharesLoading(true);
    try {
      const [u, s] = await Promise.all([
        fetch("/api/users").then((r) => r.json()),
        fetch(`/api/documents/${id}/share`).then((r) => r.json()),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setShares(Array.isArray(s) ? s : []);
    } catch {
      toast("Couldn't load sharing details", "error");
    } finally {
      setSharesLoading(false);
    }
  };

  const addShare = async () => {
    if (!selectedUser) return;
    setShareLoading(true);
    try {
      const res = await fetch(`/api/documents/${id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, permission: sharePerm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShares((prev) => {
        const filtered = prev.filter((s) => s.user.id !== data.user.id);
        return [...filtered, data];
      });
      setSelectedUser("");
      toast(`Shared with ${data.user.name}`, "success");
    } catch (e) {
      toast((e as Error).message || "Couldn't share document", "error");
    } finally {
      setShareLoading(false);
    }
  };

  const changePermission = async (entry: ShareEntry, permission: string) => {
    if (entry.permission === permission) return;
    setBusyShareId(entry.id);
    try {
      const res = await fetch(`/api/documents/${id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: entry.user.id, permission }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShares((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      toast(`${data.user.name} can now ${permission}`, "success");
    } catch (e) {
      toast((e as Error).message || "Couldn't update permission", "error");
    } finally {
      setBusyShareId(null);
    }
  };

  const removeShare = async (userId: string, name: string) => {
    setBusyShareId(userId);
    try {
      const res = await fetch(`/api/documents/${id}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error();
      setShares((prev) => prev.filter((s) => s.user.id !== userId));
      toast(`Removed ${name}`, "info");
    } catch {
      toast("Couldn't remove access", "error");
    } finally {
      setBusyShareId(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4 font-medium">{error}</p>
          <button onClick={() => router.push("/dashboard")} className="text-blue-600 hover:underline text-sm">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="skeleton h-4 w-12 rounded" />
            <div className="w-px h-5 bg-gray-200" />
            <div className="skeleton h-6 w-48 rounded" />
          </div>
          <div className="skeleton h-8 w-20 rounded-lg" />
        </nav>
        <div className="max-w-4xl mx-auto p-6">
          <EditorSkeleton />
        </div>
      </main>
    );
  }

  const canEdit = doc.permission === "owner" || doc.permission === "edit";

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-blue-600 transition text-sm whitespace-nowrap"
          >
            ← Back
          </button>
          <div className="w-px h-5 bg-gray-200" />
          {canEdit ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              className="text-lg font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none px-1 py-0.5 transition min-w-0"
            />
          ) : (
            <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          {saving ? (
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Saving…
            </span>
          ) : savedAt ? (
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              Saved
            </span>
          ) : null}
          {doc.permission === "owner" && (
            <button
              onClick={openShareModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              Share
            </button>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            doc.permission === "owner"
              ? "bg-blue-50 text-blue-600"
              : doc.permission === "edit"
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"
          }`}>
            {doc.permission}
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <Editor content={doc.content} onSave={saveContent} editable={canEdit} />
      </div>

      {showShare && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowShare(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-900">Share Document</h2>
              <button
                onClick={() => setShowShare(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-5">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white min-w-0"
              >
                <option value="">Select user…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <select
                value={sharePerm}
                onChange={(e) => setSharePerm(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
              </select>
              <button
                onClick={addShare}
                disabled={!selectedUser || shareLoading}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {shareLoading ? "…" : "Share"}
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sharesLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="skeleton w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-24 rounded" />
                      <div className="skeleton h-2.5 w-32 rounded" />
                    </div>
                  </div>
                ))
              ) : shares.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Not shared with anyone yet.
                </p>
              ) : (
                shares.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                        {s.user.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{s.user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{s.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select
                        value={s.permission}
                        disabled={busyShareId === s.user.id || busyShareId === s.id}
                        onChange={(e) => changePermission(s, e.target.value)}
                        className={`text-xs font-medium rounded-full pl-2.5 pr-1 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 ${
                          s.permission === "edit"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        <option value="view">view</option>
                        <option value="edit">edit</option>
                      </select>
                      <button
                        onClick={() => removeShare(s.user.id, s.user.name)}
                        disabled={busyShareId === s.user.id || busyShareId === s.id}
                        className="text-gray-300 hover:text-red-500 text-sm transition disabled:opacity-50"
                        aria-label={`Remove ${s.user.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
