"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchCustomer();
    fetchTimeline();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const { data } = await api.get(`/customers/${id}`);
      setCustomer(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTimeline = async () => {
    try {
      const { data } = await api.get(`/customers/${id}/timeline`);
      setTimeline(data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!customer)
    return (
      <div className="p-8 text-center text-gray-500">Loading profile...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{customer.displayName}</h1>
          <p className="text-gray-500">
            {customer.customerCode} • {customer.customerType}
          </p>
        </div>
        <Button variant="outline">Edit Customer</Button>
      </div>

      <div className="flex space-x-4 border-b">
        {["overview", "contacts", "leads", "timeline"].map((tab) => (
          <button
            key={tab}
            className={`pb-2 px-4 capitalize font-medium transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-900"}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-500">Email</Label>
                <p className="font-medium mt-1">{customer.email || "-"}</p>
              </div>
              <div>
                <Label className="text-gray-500">Phone</Label>
                <p className="font-medium mt-1">{customer.phone || "-"}</p>
              </div>
              <div>
                <Label className="text-gray-500">Status</Label>
                <p className="font-medium mt-1">{customer.status}</p>
              </div>
              <div>
                <Label className="text-gray-500">Created At</Label>
                <p className="font-medium mt-1">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "contacts" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contacts</CardTitle>
            <Button size="sm">Add Contact</Button>
          </CardHeader>
          <CardContent>
            {customer.contacts.length === 0 ? (
              <p className="text-gray-500">No contacts added.</p>
            ) : (
              <ul className="space-y-4">
                {customer.contacts.map((c: any) => (
                  <li
                    key={c.id}
                    className="p-4 border rounded hover:border-blue-200 transition-colors"
                  >
                    <p className="font-bold">
                      {c.name}{" "}
                      {c.isPrimary && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                          Primary
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {c.email} | {c.phone}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "leads" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Leads & Enquiries</CardTitle>
            <Button size="sm">New Lead</Button>
          </CardHeader>
          <CardContent>
            {customer.leads.length === 0 ? (
              <p className="text-gray-500">No leads found.</p>
            ) : (
              <ul className="space-y-4">
                {customer.leads.map((l: any) => (
                  <li
                    key={l.id}
                    className="p-4 border rounded flex justify-between hover:border-blue-200 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-lg">
                        {l.enquiryNumber} - {l.projectTitle}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Received: {new Date(l.enquiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {l.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "timeline" && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-gray-200 ml-3 mt-4 space-y-8">
              {timeline.map((event: any) => (
                <div key={event.id} className="mb-8 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </span>
                  <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                    {new Date(event.createdAt).toLocaleString()} by{" "}
                    {event.user?.name || "System"}
                  </time>
                  {event.description && (
                    <p className="text-base font-normal text-gray-600 bg-gray-50 p-3 rounded-lg mt-2 border">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {timeline.length === 0 && (
              <p className="text-gray-500 ml-4">No activity recorded.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
