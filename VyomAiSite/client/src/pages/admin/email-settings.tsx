import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Mail, Send, Check, X, RefreshCw, Settings, Inbox, AlertCircle,
  CheckCircle2, Server, Zap, Shield
} from "lucide-react";

export default function EmailSettingsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-purple-400" />
              Email Integration
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Gmail integration for automated notifications
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-white/10 bg-slate-900/50 backdrop-blur h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  Connection Status
                </CardTitle>
                <CardDescription className="text-white/40">
                  Gmail API connection via Replit Connectors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  emailStatus?.connected 
                    ? "bg-green-500/10 border-green-500/30" 
                    : "bg-red-500/10 border-red-500/30"
                }`}>
                  <div className="flex items-center gap-3">
                    {emailStatus?.connected ? (
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    )}
                    <div>
                      <p className={`font-semibold ${emailStatus?.connected ? "text-green-400" : "text-red-400"}`}>
                        {emailStatus?.connected ? "Connected" : "Not Connected"}
                      </p>
                      <p className="text-sm text-white/60">
                        {emailStatus?.connected 
                          ? `Using ${emailStatus.email || "Gmail API"}`
                          : "Gmail integration needs to be connected"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {!emailStatus?.connected && (
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                    <p className="text-sm text-yellow-300">
                      To enable email notifications, please connect Gmail via the Replit Connectors panel (Tools → Connections).
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-white/10 bg-slate-900/50 backdrop-blur h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-400" />
                  Test Email
                </CardTitle>
                <CardDescription className="text-white/40">
                  Send a test email to verify the connection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/60">Recipient Email</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="bg-slate-800/50 border-white/10 text-white"
                  />
                </div>
                <Button
                  onClick={sendTestEmail}
                  disabled={isTesting || !emailStatus?.connected}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
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
          </motion.div>
        </div>

        <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-400" />
              Email Features
            </CardTitle>
            <CardDescription className="text-white/40">
              Automated email notifications powered by Gmail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <feature.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white text-sm">{feature.title}</h4>
                      <Badge 
                        variant="secondary"
                        className={feature.status === "active" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-white/10 text-white/40"
                        }
                      >
                        {feature.status === "active" ? (
                          <><Check className="w-3 h-3 mr-1" /> Active</>
                        ) : (
                          <><X className="w-3 h-3 mr-1" /> Inactive</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/40">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
