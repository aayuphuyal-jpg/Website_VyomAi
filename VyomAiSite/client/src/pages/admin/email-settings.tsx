import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, Send, Check, X, RefreshCw, Settings, Inbox,
  CheckCircle2, Server, Zap, Shield, AlertTriangle
} from "lucide-react";

export default function EmailSettingsAdmin() {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const { data: emailStatus, isLoading, refetch } = useQuery<{ connected: boolean; email?: string }>({
    queryKey: ["/api/admin/email-status"],
    queryFn: async () => {
      const token = localStorage.getItem("vyomai-admin-token");
      try {
        const res = await fetch("/api/admin/email-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return { connected: false };
        return res.json();
      } catch {
        return { connected: false };
      }
    },
  });

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({ title: "Error", description: "Please enter an email address", variant: "destructive" });
      return;
    }
    
    setIsTesting(true);
    try {
      const token = localStorage.getItem("vyomai-admin-token");
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: testEmail }),
      });
      
      if (res.ok) {
        toast({ title: "Success", description: "Test email sent successfully!" });
      } else {
        toast({ title: "Error", description: "Failed to send test email", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send test email", variant: "destructive" });
    } finally {
      setIsTesting(false);
    }
  };

  const features = [
    {
      icon: Send,
      title: "Contact Form Notifications",
      description: "Receive emails when visitors submit the contact form",
      status: emailStatus?.connected ? "active" : "inactive",
    },
    {
      icon: Inbox,
      title: "Booking Confirmations",
      description: "Send confirmation emails for new bookings",
      status: emailStatus?.connected ? "active" : "inactive",
    },
    {
      icon: Shield,
      title: "Password Reset Emails",
      description: "Send secure password reset codes to admins",
      status: emailStatus?.connected ? "active" : "inactive",
    },
    {
      icon: Zap,
      title: "Pricing Inquiry Notifications",
      description: "Get notified when customers request custom pricing",
      status: emailStatus?.connected ? "active" : "inactive",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-6 h-6 text-purple-600" />
              Email Integration
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Gmail integration for automated notifications
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                Connection Status
              </CardTitle>
              <CardDescription className="text-gray-500">
                Gmail API connection via Replit Connectors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                emailStatus?.connected 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-center gap-3">
                  {emailStatus?.connected ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  )}
                  <div>
                    <p className={`font-semibold ${emailStatus?.connected ? "text-green-700" : "text-red-700"}`}>
                      {emailStatus?.connected ? "Connected" : "Not Connected"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {emailStatus?.connected 
                        ? `Using ${emailStatus.email || "Gmail API"}`
                        : "Gmail integration needs to be connected"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {!emailStatus?.connected && (
                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    To enable email notifications, please connect Gmail via the Replit Connectors panel (Tools - Connections).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-600" />
                Test Email
              </CardTitle>
              <CardDescription className="text-gray-500">
                Send a test email to verify the connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Recipient Email</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={sendTestEmail}
                disabled={isTesting || !emailStatus?.connected}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isTesting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Test Email
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-600" />
              Email Features
            </CardTitle>
            <CardDescription className="text-gray-500">
              Automated email notifications powered by Gmail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="p-2 rounded-lg bg-purple-100">
                    <feature.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{feature.title}</h4>
                      <Badge 
                        variant="secondary"
                        className={feature.status === "active" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-500"
                        }
                      >
                        {feature.status === "active" ? (
                          <><Check className="w-3 h-3 mr-1" /> Active</>
                        ) : (
                          <><X className="w-3 h-3 mr-1" /> Inactive</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
