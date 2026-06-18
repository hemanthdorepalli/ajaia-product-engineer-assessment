"use client";

import { useState, useEffect } from "react";

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
  const [users, setUsers] = useState<ShareUser[]>([]);
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [permission, setPermission] = useState("view");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch(`/api/documents/${docId}/share`).then((r) => r.json()),
    ]).then(([u, s]) => {
      setUsers(u);
      setShares(Array.isArray(s) ? s : []);
    });
  }, [docId]);

  const addShare = async () => {
    if (!selectedUser) return;
    setLoading(true);

    const res = await fetch(`/api/documents/${docId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser, permission }),
    });

    if (res.ok) {
      const newShare = await res.json();
      setShares((prev) => {
        const filtered = prev.filter((s) => s.user.id !== newShare.user.id);
        return [...filtered, newShare];
      });
      setSelectedUser("");
    }
    setLoading(false);
  };

  const removeShare = async (userId: string) => {
    await fetch(`/api/documents/${docId}/share`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setShares((prev) => prev.filter((s) => s.user.id !== userId));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Share Document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select user...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="view">View</option>
            <option value="edit">Edit</option>
          </select>
          <button
            onClick={addShare}
            disabled={!selectedUser || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Share
          </button>
        </div>

        <div className="space-y-2">
          {shares.length === 0 ? (
            <p className="text-sm text-gray-400">Not shared with anyone yet.</p>
          ) : (
            shares.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{s.user.name}</p>
                  <p className="text-xs text-gray-400">{s.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                    {s.permission}
                  </span>
                  <button
                    onClick={() => removeShare(s.user.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Remove
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