"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter, Search } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("quotations");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await api.get(`/reports/${reportType}`, {
        params: { startDate, endDate, status },
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (status) params.append("status", status);
    params.append("export", "csv");

    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportType}?${params.toString()}`,
      "_blank",
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Advanced Reports</h1>
        <Button
          onClick={handleExport}
          disabled={data.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" /> Export to CSV
        </Button>
      </div>

      <Card className="bg-white shadow-sm border-gray-100">
        <CardHeader className="bg-gray-50/50 border-b pb-4">
          <div className="flex items-center text-gray-800 font-semibold">
            <Filter className="w-4 h-4 mr-2 text-gray-500" /> Filters
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">
                Report Type
              </label>
              <select
                className="w-full border rounded p-2"
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setData([]);
                }}
              >
                <option value="quotations">Quotations Report</option>
                <option value="invoices">Invoices Report</option>
                <option value="customers">Customers Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Status Filter
              </label>
              <select
                className="w-full border rounded p-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {reportType === "quotations" && (
                  <>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="APPROVED">Approved</option>
                    <option value="ACCEPTED">Accepted</option>
                  </>
                )}
                {reportType === "invoices" && (
                  <>
                    <option value="ISSUED">Issued</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="OVERDUE">Overdue</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleGenerate}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              <Search className="w-4 h-4 mr-2" />{" "}
              {loading ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 text-sm">
                {data.length > 0 ? (
                  Object.keys(data[0]).map((key) => (
                    <th
                      key={key}
                      className="p-4 font-medium uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))
                ) : (
                  <th className="p-4 font-medium uppercase tracking-wider">
                    Data Preview
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50/50">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="p-4 text-sm text-gray-800">
                        {typeof val === "object" && val !== null
                          ? JSON.stringify(val)
                          : String(val)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-8 text-center text-gray-400" colSpan={10}>
                    {loading
                      ? "Fetching data..."
                      : "Select filters and generate report to see preview here."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data.length > 0 && (
          <div className="p-4 border-t bg-gray-50 text-xs text-gray-500 text-right">
            Showing {data.length} records.
          </div>
        )}
      </Card>
    </div>
  );
}
