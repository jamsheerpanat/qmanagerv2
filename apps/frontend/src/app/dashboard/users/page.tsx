"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";

const STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;

interface Role {
  id: string;
  name: string;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  status: "ACTIVE" as (typeof STATUSES)[number],
  roleIds: [] as string[],
};

export default function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      const { data } = await api.get("/users");
      setUsers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // Roles populate the assignment checkboxes. Listing them needs
    // settings.manage, which a Super Admin has; if it is refused the dialog
    // still works for everything except role assignment.
    api
      .get("/roles")
      .then((res) => setRoles(res.data || []))
      .catch(() => setRoles([]));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  }

  function openEdit(u: any) {
    setEditingId(u.id);
    setForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      password: "",
      status: u.status || "ACTIVE",
      roleIds: (u.roles || []).map((r: any) => r.role.id),
    });
    setError("");
    setOpen(true);
  }

  function toggleRole(id: string) {
    setForm((f) => ({
      ...f,
      roleIds: f.roleIds.includes(id)
        ? f.roleIds.filter((r) => r !== id)
        : [...f.roleIds, id],
    }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const payload: any = {
          name: form.name,
          phone: form.phone || null,
          status: form.status,
          roleIds: form.roleIds,
        };
        // Only send a password when one was actually typed, so saving an edit
        // does not silently reset it.
        if (form.password) payload.password = form.password;
        await api.patch(`/users/${editingId}`, payload);
      } else {
        await api.post("/users", {
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          status: form.status,
          roleIds: form.roleIds,
          password: form.password || undefined,
          companyId: currentUser?.companyId,
        });
      }
      setOpen(false);
      await loadUsers();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Could not save the user.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.roles?.map((r: any) => r.role.name).join(", ") || "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={u.status === "ACTIVE" ? "default" : "secondary"}
                  >
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(u)}
                    title="Edit user"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  No users yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit User" : "Add User"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  disabled={!!editingId}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {editingId && (
                  <p className="text-[11px] text-gray-500">
                    Email is the login identifier and cannot be changed here.
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <select
                  className="w-full border rounded-md p-2 bg-white text-sm h-10"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as any })
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>{editingId ? "New Password" : "Password"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={
                  editingId ? "Leave blank to keep current" : "Defaults to Welcome@123"
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Roles</Label>
              {roles.length === 0 ? (
                <p className="text-xs text-gray-500">No roles available.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                  {roles.map((r) => (
                    <label
                      key={r.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.roleIds.includes(r.id)}
                        onChange={() => toggleRole(r.id)}
                      />
                      {r.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
