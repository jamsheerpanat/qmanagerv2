"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Building2, Mail, Bell, HardDrive, Cpu, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [companyData, setCompanyData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const { data } = await api.get("/settings/company");
      setCompanyData(data);
    } catch (e) {
      console.error("Failed to load company settings:", e);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch("/settings/company", companyData);
      alert("Settings saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500 text-sm">Manage your application configuration and integrations.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          <Button variant={activeTab === "company" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("company")}><Building2 className="w-4 h-4 mr-2" /> Company Profile</Button>
          <Button variant={activeTab === "branding" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("branding")}><Palette className="w-4 h-4 mr-2" /> Branding & PDF</Button>
          <Button variant={activeTab === "email" ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("email")}><Mail className="w-4 h-4 mr-2" /> Email Integration</Button>
          <Button variant="ghost" className="w-full justify-start"><Bell className="w-4 h-4 mr-2" /> Notifications</Button>
          <Button variant="ghost" className="w-full justify-start"><HardDrive className="w-4 h-4 mr-2" /> Storage (MinIO)</Button>
          <Button variant={activeTab === "ai" ? "secondary" : "ghost"} className="w-full justify-start text-purple-600" onClick={() => setActiveTab("ai")}><Cpu className="w-4 h-4 mr-2" /> AI Assistant</Button>
        </div>
        
        <div className="md:col-span-3 space-y-6">
          {activeTab === "company" && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Main company details used in documents and portal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Name</label>
                    <Input value={companyData.name || ""} onChange={e => setCompanyData({...companyData, name: e.target.value})} placeholder="Q-Manager Inc." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tax / VAT Number</label>
                    <Input value={companyData.taxNumber || ""} onChange={e => setCompanyData({...companyData, taxNumber: e.target.value})} placeholder="TRN-1234567890" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Main Address</label>
                    <Input value={companyData.address || ""} onChange={e => setCompanyData({...companyData, address: e.target.value})} placeholder="123 Business Avenue, Tech District, Dubai, UAE" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <Input value={companyData.email || ""} onChange={e => setCompanyData({...companyData, email: e.target.value})} placeholder="info@qmanager.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Phone</label>
                    <Input value={companyData.phone || ""} onChange={e => setCompanyData({...companyData, phone: e.target.value})} placeholder="+971 50 123 4567" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "branding" && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Branding & PDF Configuration</CardTitle>
                <CardDescription>Configure how your documents appear to customers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Brand Color (Hex)</label>
                    <div className="flex gap-2 items-center">
                      <Input type="color" className="w-16 h-10 p-1" value={companyData.brandColor || "#3B82F6"} onChange={e => setCompanyData({...companyData, brandColor: e.target.value})} />
                      <Input className="w-32" value={companyData.brandColor || "#3B82F6"} onChange={e => setCompanyData({...companyData, brandColor: e.target.value})} placeholder="#3B82F6" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Logo URL (MinIO public link)</label>
                    <Input value={companyData.logoUrl || ""} onChange={e => setCompanyData({...companyData, logoUrl: e.target.value})} placeholder="https://s3.yourdomain.com/assets/logo.png" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Default Footer Text</label>
                    <Input value={companyData.footerText || ""} onChange={e => setCompanyData({...companyData, footerText: e.target.value})} placeholder="Thank you for doing business with us." />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "email" && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>SMTP Email Integration</CardTitle>
                <CardDescription>Configure your SMTP server to send documents to clients directly from QManager.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">SMTP Host</label>
                    <Input value={companyData.smtpHost || ""} onChange={e => setCompanyData({...companyData, smtpHost: e.target.value})} placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Port</label>
                    <Input type="number" value={companyData.smtpPort || ""} onChange={e => setCompanyData({...companyData, smtpPort: Number(e.target.value)})} placeholder="587" />
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">SMTP Username</label>
                      <Input value={companyData.smtpUser || ""} onChange={e => setCompanyData({...companyData, smtpUser: e.target.value})} placeholder="your-email@domain.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SMTP Password / App Password</label>
                      <Input type="password" value={companyData.smtpPass || ""} onChange={e => setCompanyData({...companyData, smtpPass: e.target.value})} placeholder="••••••••••••••••" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "ai" && (
            <Card className="shadow-sm border-purple-100 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center">
                  <Cpu className="w-5 h-5 mr-2" />
                  AI Assistant Settings
                </CardTitle>
                <CardDescription>Configure AI capabilities for document generation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-md border text-sm text-gray-600 mb-4">
                  AI functionalities are currently disabled. You will need to provide an OpenAI API key or configure a custom local LLM endpoint before these features become available in the Quotation Builder.
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">AI Provider</label>
                  <select className="w-full border rounded-md p-2 bg-white" disabled>
                    <option>OpenAI (Coming Soon)</option>
                    <option>Local / Ollama (Coming Soon)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">API Key</label>
                  <Input type="password" value="****************" disabled />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
