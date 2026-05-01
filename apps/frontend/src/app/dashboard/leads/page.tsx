"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LayoutGrid, List } from "lucide-react";
import { useRouter } from "next/navigation";

const STATUSES = [
  "NEW",
  "CONTACTED",
  "QUOTATION_IN_PROGRESS",
  "QUOTATION_SENT",
  "WON",
  "LOST",
];

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const router = useRouter();

  async function fetchLeads() {
    try {
      const { data } = await api.get("/leads");
      setLeads(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leads & Enquiries</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView("kanban")}
            className={view === "kanban" ? "bg-gray-100" : ""}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView("list")}
            className={view === "list" ? "bg-gray-100" : ""}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button onClick={() => router.push("/dashboard/leads/new")}>
            <Plus className="w-4 h-4 mr-2" /> New Lead
          </Button>
        </div>
      </div>

      {view === "list" ? (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                <tr>
                  <th className="px-6 py-3">Enquiry No</th>
                  <th className="px-6 py-3">Project Title</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l: any) => (
                  <tr
                    key={l.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/leads/${l.id}`)}
                  >
                    <td className="px-6 py-4 font-medium">{l.enquiryNumber}</td>
                    <td className="px-6 py-4">{l.projectTitle}</td>
                    <td className="px-6 py-4">{l.customer?.displayName}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(l.enquiryDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => (
            <div key={status} className="w-80 flex-shrink-0">
              <div className="bg-gray-50 rounded-lg p-4 min-h-[500px]">
                <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
                  {status.replace(/_/g, " ")}
                  <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {leads.filter((l: any) => l.status === status).length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {leads
                    .filter((l: any) => l.status === status)
                    .map((l: any) => (
                      <Card
                        key={l.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push(`/dashboard/leads/${l.id}`)}
                      >
                        <CardContent className="p-4">
                          <p className="text-xs text-blue-600 font-bold mb-1">
                            {l.enquiryNumber}
                          </p>
                          <p className="font-semibold text-sm line-clamp-2 mb-2">
                            {l.projectTitle}
                          </p>
                          <p className="text-xs text-gray-500">
                            {l.customer?.displayName}
                          </p>
                          <div className="mt-3 flex justify-between items-center border-t pt-2">
                            <span className="text-xs text-gray-400">
                              {new Date(l.enquiryDate).toLocaleDateString()}
                            </span>
                            {l.expectedBudget && (
                              <span className="text-xs font-medium text-green-600">
                                ${l.expectedBudget}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
