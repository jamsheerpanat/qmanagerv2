"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/audit-logs")
      .then((res) => setLogs(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <div className="bg-white border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Entity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>{log.actor?.name || "System"}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell>{log.entityType}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
