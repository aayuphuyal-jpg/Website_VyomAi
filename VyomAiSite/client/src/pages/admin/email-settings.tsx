import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, Send, Check, X, RefreshCw, Settings, Inbox,
  CheckCircle2, Server, Zap, Shield, AlertTriangle, Globe, Key, Lock
} from "lucide-react";

type EmailProvider = "gmail" | "smtp" | "sendgrid";

interface ProviderStatus {
  available: boolean;
  error?: string;
}

interface EmailConfig {
  provider: EmailProvider;
  fromName: string;
  fromAddress: string;
  replyTo?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpSecure?: boolean;
  sendgridFromEmail?: string;
  providerPriority: string;
}

interface EmailProvidersResponse {
  providers: Record<EmailProvider, ProviderStatus>;
  config: EmailConfig;
}

export default function EmailSettingsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [config, setConfig] = useState<EmailConfig>({
    provider: "smtp",
    fromName: "VyomAi",
    fromAddress: "info@vyomai.cloud",
    providerPriority: "smtp,gmail,sendgrid",
  });

  const { data: emailData, isLoading, refetch } = useQuery<EmailProvidersResponse>({
    queryKey: ["/api/admin/email-providers"],
    queryFn: async () => {
      const token = localStorage.getItem("vyomai-admin-token");
      const res = await fetch("/api/admin/email-providers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch email config");
      return res.json();
    },
  });

  useEffect(() => {
    if (emailData?.config) {
      setConfig(emailData.config);
    }
  }, [emailData]);

  const saveMutation = useMutation({
    mutationFn: async (newConfig: Partial<EmailConfig>) => {
      const token = localStorage.getItem("vyomai-admin-token");
      const res = await fetch("/api/admin/email-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailProvider: newConfig.provider,
          emailFromName: newConfig.fromName,
          emailFromAddress: newConfig.fromAddress,
          emailReplyTo: newConfig.replyTo,
          smtpHost: newConfig.smtpHost,
          smtpPort: newConfig.smtpPort,
          smtpUser: newConfig.smtpUser,
          smtpSecure: newConfig.smtpSecure,
          sendgridFromEmail: newConfig.sendgridFromEmail,
          emailProviderPriority: newConfig.providerPriority,
        }),
      });
      if (!res.ok) throw new Error("Failed to save config");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Email configuration saved" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-status"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" });
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
      
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: `Test email sent via ${data.provider}!` });
      } else {
        toast({ title: "Error", description: data.error || "Failed to send test email", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send test email", variant: "destructive" });
    } finally {
      setIsTesting(false);
    }
  };

  const providerInfo: Record<EmailProvider, { name: string; icon: typeof Mail; description: string; color: string }> = {
    gmail: {
      name: "Gmail (Replit Connector)",
      icon: Mail,
      description: "Uses Replit's Gmail connector for OAuth-based email",
      color: "text-red-500",
    },
    smtp: {
      name: "SMTP Server",
      icon: Server,
      description: "Direct SMTP connection (works with Hostinger, Gmail SMTP, etc.)",
      color: "text-blue-500",
    },
    sendgrid: {
      name: "SendGrid API",
      icon: Zap,
      description: "SendGrid transactional email service",
      color: "text-purple-500",
    },
  };

  const features = [
    { icon: Send, title: "Contact Form Notifications", description: "Receive emails when visitors submit the contact form" },
    { icon: Inbox, title: "Booking Confirmations", description: "Send confirmation emails for new bookings" },
    { icon: Shield, title: "Password Reset Emails", description: "Send secure password reset codes to admins" },
    { icon: Zap, title: "Pricing Inquiry Notifications", description: "Get notified when customers request custom pricing" },
  ];

  const hasAnyProvider = emailData?.providers && Object.values(emailData.providers).some(p => p.available);

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
              Configure email providers for automated notifications
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {(["smtp", "gmail", "sendgrid"] as EmailProvider[]).map((provider) => {
            const info = providerInfo[provider];
            const Icon = info.icon;
            const status = emailData?.providers?.[provider];
            const isSelected = config.provider === provider;

            return (
              <Card 
                key={provider}
                className={`border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-purple-500 bg-purple-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setConfig(prev => ({ ...prev, provider }))}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${info.color}`} />
                      <CardTitle className="text-base">{info.name}</CardTitle>
                    </div>
                    {status?.available ? (
                      <Badge className="bg-green-100 text-green-700 border-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Setup Required
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">{info.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {!status?.available && status?.error && (
                    <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">{status.error}</p>
                  )}
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-1 text-purple-600">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-medium">Primary Provider</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>From Name</Label>
                <Input
                  value={config.fromName}
                  onChange={(e) => setConfig(prev => ({ ...prev, fromName: e.target.value }))}
                  placeholder="VyomAi"
                />
              </div>
              <div className="space-y-2">
                <Label>From Email Address</Label>
                <Input
                  type="email"
                  value={config.fromAddress}
                  onChange={(e) => setConfig(prev => ({ ...prev, fromAddress: e.target.value }))}
                  placeholder="info@vyomai.cloud"
                />
              </div>
              <div className="space-y-2">
                <Label>Reply-To Address (Optional)</Label>
                <Input
                  type="email"
                  value={config.replyTo || ""}
                  onChange={(e) => setConfig(prev => ({ ...prev, replyTo: e.target.value }))}
                  placeholder="support@vyomai.cloud"
                />
              </div>
            </CardContent>
          </Card>

          {config.provider === "smtp" && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  SMTP Configuration
                </CardTitle>
                <CardDescription>Configure your SMTP server settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input
                      value={config.smtpHost || ""}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                      placeholder="smtp.hostinger.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Port</Label>
                    <Input
                      value={config.smtpPort || "587"}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                      placeholder="587"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={config.smtpUser || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                    placeholder="info@vyomai.cloud"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Use SSL/TLS</Label>
                    <p className="text-xs text-gray-500">Enable for port 465</p>
                  </div>
                  <Switch
                    checked={config.smtpSecure || false}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, smtpSecure: checked }))}
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Key className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">SMTP Password Required</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Set the environment variable <code className="bg-amber-100 px-1 rounded">EMAIL_SMTP_PASSWORD</code> in the Secrets tab with your SMTP password.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {config.provider === "sendgrid" && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  SendGrid Configuration
                </CardTitle>
                <CardDescription>Configure your SendGrid settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Verified Sender Email</Label>
                  <Input
                    type="email"
                    value={config.sendgridFromEmail || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, sendgridFromEmail: e.target.value }))}
                    placeholder="noreply@vyomai.cloud"
                  />
                  <p className="text-xs text-gray-500">Must be verified in your SendGrid account</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Key className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">API Key Required</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Set the environment variable <code className="bg-amber-100 px-1 rounded">EMAIL_SENDGRID_API_KEY</code> in the Secrets tab with your SendGrid API key.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {config.provider === "gmail" && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-500" />
                  Gmail Configuration
                </CardTitle>
                <CardDescription>Uses Replit's Gmail connector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Replit Connector Required</p>
                      <p className="text-xs text-blue-700 mt-1">
                        This provider requires the Gmail connector to be set up in Replit. Go to Tools → Connections to connect your Gmail account.
                      </p>
                      <p className="text-xs text-blue-700 mt-2">
                        <strong>Note:</strong> This only works on the Replit platform. For external deployments (like Hostinger), use SMTP instead.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={() => saveMutation.mutate(config)}
            disabled={saveMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saveMutation.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-green-600" />
                Test Email
              </CardTitle>
              <CardDescription>Send a test email to verify the connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Email</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={sendTestEmail}
                disabled={isTesting || !hasAnyProvider}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
              {!hasAnyProvider && (
                <p className="text-xs text-orange-600 text-center">
                  Configure at least one email provider to send test emails
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Email Features
              </CardTitle>
              <CardDescription>Automated email notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                      <Icon className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{feature.title}</p>
                        <p className="text-xs text-gray-500">{feature.description}</p>
                        <Badge className={`mt-1 text-xs ${hasAnyProvider ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {hasAnyProvider ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
