"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/roles")
      .then((res) => setRoles(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Roles & Permissions</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <div
            key={r.id}
            className="p-4 border rounded-lg bg-white shadow-sm flex flex-col h-full"
          >
            <h3 className="font-bold text-lg">{r.name}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {r.description || "System role"}
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              {r.permissions?.map((p: any) => (
                <span
                  key={p.permission.id}
                  className="px-2 py-1 bg-gray-100 text-xs rounded-full border"
                >
                  {p.permission.action}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
