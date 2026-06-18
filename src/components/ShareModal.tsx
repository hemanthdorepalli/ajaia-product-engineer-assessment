"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

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

interface ShareModalProps {
  docId: string;
  onClose: () => void;
}

export default function ShareModal({ docId, onClose }: ShareModalProps) {
  const toast = useToast();
  const [users, setUsers] = useState<ShareUser[]>([]);
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [permission, setPermission] = useState("view");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch(`/api/documents/${docId}/share`).then((r) => r.json()),
    ])
      .then(([u, s]) => {
        setUsers(Array.isArray(u) ? u : []);
        setShares(Array.isArray(s) ? s : []);
      })
      .catch(() => toast("Couldn't load sharing details", "error"))
      .finally(() => setFetching(false));
  }, [docId, toast]);

  const addShare = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${docId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, permission }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShares((prev) => [
        ...prev.filter((s) => s.user.id !== data.user.id),
        data,
      ]);
      setSelectedUser("");
      toast(`Shared with ${data.user.name}`, "success");
    } catch (e) {
      toast((e as Error).message || "Couldn't share document", "error");
    } finally {
      setLoading(false);
    }
  };

  const changePermission = async (entry: ShareEntry, perm: string) => {
    if (entry.permission === perm) return;
    setBusyId(entry.id);
    try {
      const res = await fetch(`/api/documents/${docId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: entry.user.id, permission: perm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShares((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      toast(`${data.user.name} can now ${perm}`, "success");
    } catch (e) {
      toast((e as Error).message || "Couldn't update permission", "error");
    } finally {
      setBusyId(null);
    }
  };

  const removeShare = async (userId: string, name: string) => {
    setBusyId(userId);
    try {
      const res = await fetch(`/api/documents/${docId}/share`, {
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
      setBusyId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">Share Document</h2>
          <button
            onClick={onClose}
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
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="view">View</option>
            <option value="edit">Edit</option>
          </select>
          <button
            onClick={addShare}
            disabled={!selectedUser || loading}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loading ? "…" : "Share"}
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {fetching ? (
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
                    disabled={busyId === s.user.id || busyId === s.id}
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
                    disabled={busyId === s.user.id || busyId === s.id}
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
  );
}
