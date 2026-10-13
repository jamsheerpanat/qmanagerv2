"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewLeadPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerId: "",
    projectTitle: "",
    source: "WEBSITE",
    priority: "MEDIUM",
    expectedBudget: "",
  });

  useEffect(() => {
    api.get("/customers").then((res) => setCustomers(res.data));
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        expectedBudget: formData.expectedBudget
          ? parseFloat(formData.expectedBudget)
          : undefined,
      };
      const { data } = await api.post("/leads", payload);
      router.push(`/dashboard/leads/${data.id}`);
    } catch (error) {
      alert("Error creating lead");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">New Lead / Enquiry</h1>
      <Card>
        <CardHeader>
          <CardTitle>Enquiry Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <select
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.customerId}
                onChange={(e) =>
                  setFormData({ ...formData, customerId: e.target.value })
                }
              >
                <option value="">Select Customer...</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName} ({c.customerCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input
                required
                value={formData.projectTitle}
                onChange={(e) =>
                  setFormData({ ...formData, projectTitle: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                >
                  <option value="WEBSITE">Website</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="PHONE_CALL">Phone Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="REFERRAL">Referral</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Expected Budget ($)</Label>
                <Input
                  type="number"
                  value={formData.expectedBudget}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedBudget: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit">Create Enquiry</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
