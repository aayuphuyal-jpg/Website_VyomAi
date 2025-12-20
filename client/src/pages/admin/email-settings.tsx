import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatedLogo } from "@/components/animated-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Mail, Send, Check, RefreshCw, Settings, Inbox,
  CheckCircle2, Server, Zap, Shield, AlertTriangle, Globe, Key, ArrowLeft
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
  emailFeaturesEnabled?: boolean;
}

interface EmailProvidersResponse {
  providers: Record<EmailProvider, ProviderStatus>;
  config: EmailConfig;
}

export default function EmailSettingsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [config, setConfig] = useState<EmailConfig>({
    provider: "smtp",
    fromName: "VyomAi",
    fromAddress: "info@vyomai.cloud",
    providerPriority: "smtp,gmail,sendgrid",
    emailFeaturesEnabled: true,
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
    mutationFn: async (configToSave: EmailConfig) => {
      const token = localStorage.getItem("vyomai-admin-token");
      const res = await fetch("/api/admin/email-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailProvider: configToSave.provider,
          emailFromName: configToSave.fromName,
          emailFromAddress: configToSave.fromAddress,
          emailReplyTo: configToSave.replyTo,
          smtpHost: configToSave.smtpHost,
          smtpPort: configToSave.smtpPort,
          smtpUser: configToSave.smtpUser,
          smtpSecure: configToSave.smtpSecure,
          sendgridFromEmail: configToSave.sendgridFromEmail,
          emailProviderPriority: configToSave.providerPriority,
          emailFeaturesEnabled: configToSave.emailFeaturesEnabled,
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Playful Background - Same as Admin Login */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-[hsl(262_83%_58%/0.05)] to-[hsl(24_95%_53%/0.08)] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[hsl(262_83%_58%/0.15)] rounded-full blur-3xl animate-float" style={{ animationDuration: "15s" }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[hsl(24_95%_53%/0.12)] rounded-full blur-3xl animate-float" style={{ animationDuration: "20s", animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[hsl(200_80%_50%/0.1)] rounded-full blur-3xl animate-float" style={{ animationDuration: "18s", animationDelay: "4s" }} />
      </div>
      <div className="absolute inset-0 particle-bg opacity-20" />
      <div className="absolute inset-0 mandala-pattern opacity-8" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/admin/dashboard")}
              className="hover-elevate"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading} className="hover-elevate">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>

        {/* Main Title Card */}
        <Card className="glass-card border-0 mb-8">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AnimatedLogo variant="login" showText={true} />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Mail className="w-6 h-6 text-purple-600" />
              Email Integration
            </CardTitle>
            <CardDescription>
              Configure email providers for automated notifications
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Master Email Toggle */}
        <Card className={`glass-card border-2 mb-8 transition-all ${config.emailFeaturesEnabled ? 'border-green-500/50 bg-green-50/30 dark:bg-green-900/10' : 'border-red-500/50 bg-red-50/30 dark:bg-red-900/10'}`}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${config.emailFeaturesEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {config.emailFeaturesEnabled ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Email Features</h3>
                  <p className="text-sm text-muted-foreground">
                    {config.emailFeaturesEnabled 
                      ? "Email notifications are active. All automated emails will be sent." 
                      : "Email notifications are disabled. No emails will be sent."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${config.emailFeaturesEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {config.emailFeaturesEnabled ? "Active" : "Inactive"}
                </span>
                <Switch
                  checked={config.emailFeaturesEnabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, emailFeaturesEnabled: checked }))}
                  className={config.emailFeaturesEnabled ? 'data-[state=checked]:bg-green-500' : ''}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Selection Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {(["smtp", "gmail", "sendgrid"] as EmailProvider[]).map((provider) => {
            const info = providerInfo[provider];
            const Icon = info.icon;
            const status = emailData?.providers?.[provider];
            const isSelected = config.provider === provider;

            return (
              <Card 
                key={provider}
                className={`glass-card border-2 cursor-pointer transition-all hover-elevate ${
                  isSelected ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20' : 'border-transparent hover:border-purple-300'
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
                    <p className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">{status.error}</p>
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

        {/* Configuration Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>From Email Address</Label>
                <Input
                  type="email"
                  value={config.fromAddress}
                  onChange={(e) => setConfig(prev => ({ ...prev, fromAddress: e.target.value }))}
                  placeholder="info@vyomai.cloud"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Reply-To Address (Optional)</Label>
                <Input
                  type="email"
                  value={config.replyTo || ""}
                  onChange={(e) => setConfig(prev => ({ ...prev, replyTo: e.target.value }))}
                  placeholder="support@vyomai.cloud"
                  className="bg-background/50"
                />
              </div>
            </CardContent>
          </Card>

          {config.provider === "smtp" && (
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Port</Label>
                    <Input
                      value={config.smtpPort || "587"}
                      onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                      placeholder="587"
                      className="bg-background/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={config.smtpUser || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                    placeholder="info@vyomai.cloud"
                    className="bg-background/50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Use SSL/TLS</Label>
                    <p className="text-xs text-muted-foreground">Enable for port 465</p>
                  </div>
                  <Switch
                    checked={config.smtpSecure || false}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, smtpSecure: checked }))}
                  />
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Key className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">SMTP Password Required</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Set the environment variable <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">EMAIL_SMTP_PASSWORD</code> in the Secrets tab.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {config.provider === "sendgrid" && (
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">Must be verified in your SendGrid account</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Key className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">API Key Required</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Set the environment variable <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">EMAIL_SENDGRID_API_KEY</code> in the Secrets tab.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {config.provider === "gmail" && (
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-500" />
                  Gmail Configuration
                </CardTitle>
                <CardDescription>Uses Replit's Gmail connector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Replit Connector Required</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        This provider requires the Gmail connector to be set up in Replit. Go to Tools - Connections to connect your Gmail account.
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                        <strong>Note:</strong> This only works on the Replit platform. For external deployments (like Hostinger), use SMTP instead.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={() => saveMutation.mutate(config)}
            disabled={saveMutation.isPending}
            className="px-8 hover-elevate"
          >
            {saveMutation.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </div>

        {/* Test Email and Features */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                  className="bg-background/50"
                />
              </div>
              <Button
                onClick={sendTestEmail}
                disabled={isTesting || !hasAnyProvider}
                className="w-full hover-elevate"
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

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-background/50">
                      <Icon className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
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
    </div>
  );
}
