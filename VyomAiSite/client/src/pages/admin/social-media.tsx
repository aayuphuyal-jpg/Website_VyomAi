import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Linkedin, Instagram, Facebook, Youtube, MessageCircle, Phone,
  Link2, ExternalLink, Check, X, TrendingUp, Users, Heart, Share2,
  Save, RefreshCw
} from "lucide-react";
import type { SiteSettings, SocialMediaIntegration } from "@shared/schema";

const socialPlatforms = [
  { 
    id: "linkedin", 
    name: "LinkedIn", 
    icon: Linkedin, 
    color: "from-blue-600 to-blue-700",
    urlPlaceholder: "https://linkedin.com/company/vyomai",
    description: "Professional networking and B2B connections"
  },
  { 
    id: "instagram", 
    name: "Instagram", 
    icon: Instagram, 
    color: "from-pink-500 to-purple-600",
    urlPlaceholder: "https://instagram.com/vyomai",
    description: "Visual content and brand storytelling"
  },
  { 
    id: "facebook", 
    name: "Facebook", 
    icon: Facebook, 
    color: "from-blue-500 to-blue-600",
    urlPlaceholder: "https://facebook.com/vyomai",
    description: "Community engagement and updates"
  },
  { 
    id: "youtube", 
    name: "YouTube", 
    icon: Youtube, 
    color: "from-red-500 to-red-600",
    urlPlaceholder: "https://youtube.com/@vyomai",
    description: "Video content and tutorials"
  },
  { 
    id: "whatsapp", 
    name: "WhatsApp", 
    icon: MessageCircle, 
    color: "from-green-500 to-green-600",
    urlPlaceholder: "https://wa.me/9779812345678",
    description: "Direct customer communication"
  },
  { 
    id: "viber", 
    name: "Viber", 
    icon: Phone, 
    color: "from-purple-500 to-purple-600",
    urlPlaceholder: "viber://chat?number=9779812345678",
    description: "Alternative messaging platform"
  },
];

export default function SocialMediaAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editedLinks, setEditedLinks] = useState<Record<string, string>>({});
  const [editedEnabled, setEditedEnabled] = useState<Record<string, boolean>>({});

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const { data: integrations } = useQuery<SocialMediaIntegration[]>({
    queryKey: ["/api/integrations"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      const token = localStorage.getItem("vyomai-admin-token");
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Social media settings saved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    const currentLinks = settings?.socialLinks || {};
    const currentEnabled = settings?.socialMediaEnabled || {};
    
    const newLinks = { ...currentLinks, ...editedLinks };
    const newEnabled = { ...currentEnabled, ...editedEnabled } as any;
    
    updateMutation.mutate({
      socialLinks: newLinks,
      socialMediaEnabled: newEnabled,
    });
  };

  const getLink = (platformId: string) => {
    return editedLinks[platformId] ?? (settings?.socialLinks as Record<string, string>)?.[platformId] ?? "";
  };

  const getEnabled = (platformId: string) => {
    return editedEnabled[platformId] ?? (settings?.socialMediaEnabled as Record<string, boolean>)?.[platformId] ?? true;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Share2 className="w-6 h-6 text-purple-400" />
              Social Media Integrations
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Manage your social media links and visibility settings
            </p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {updateMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {socialPlatforms.map((platform, index) => {
            const Icon = platform.icon;
            const isEnabled = getEnabled(platform.id);
            const link = getLink(platform.id);
            
            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-white/10 bg-slate-900/50 backdrop-blur transition-all ${
                  isEnabled ? "ring-1 ring-purple-500/30" : "opacity-60"
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${platform.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-base">{platform.name}</CardTitle>
                          <CardDescription className="text-white/40 text-xs">
                            {platform.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => {
                          setEditedEnabled(prev => ({ ...prev, [platform.id]: checked }));
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-white/60 text-xs">Profile URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={platform.urlPlaceholder}
                          value={link}
                          onChange={(e) => {
                            setEditedLinks(prev => ({ ...prev, [platform.id]: e.target.value }));
                          }}
                          className="bg-slate-800/50 border-white/10 text-white text-sm"
                        />
                        {link && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            onClick={() => window.open(link, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4 text-white/60" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <Badge 
                        variant={link ? "default" : "secondary"}
                        className={link ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}
                      >
                        {link ? (
                          <><Check className="w-3 h-3 mr-1" /> Connected</>
                        ) : (
                          <><X className="w-3 h-3 mr-1" /> Not Set</>
                        )}
                      </Badge>
                      <Badge 
                        variant="secondary"
                        className={isEnabled ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-white/40"}
                      >
                        {isEnabled ? "Visible" : "Hidden"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Analytics Overview
            </CardTitle>
            <CardDescription className="text-white/40">
              Social media performance metrics (coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Followers", value: "—", icon: Users, color: "text-blue-400" },
                { label: "Engagement Rate", value: "—", icon: Heart, color: "text-pink-400" },
                { label: "Total Shares", value: "—", icon: Share2, color: "text-green-400" },
                { label: "Link Clicks", value: "—", icon: Link2, color: "text-purple-400" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs text-white/40">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
