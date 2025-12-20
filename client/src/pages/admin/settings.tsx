import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type SiteSettings } from "@shared/schema";
import { 
  Save, Loader2, Settings, Bell, Image, Type, MousePointer, 
  Eye, Sparkles, Zap, Upload, Trash2, Play
} from "lucide-react";

export function SettingsPage() {
  const { toast } = useToast();
  
  const [popupEnabled, setPopupEnabled] = useState(false);
  const [popupTitle, setPopupTitle] = useState("Welcome to VyomAi");
  const [popupMessage, setPopupMessage] = useState("Experience the future of AI solutions. Let us transform your business with intelligent automation.");
  const [popupButtonText, setPopupButtonText] = useState("Explore Now");
  const [popupImageUrl, setPopupImageUrl] = useState("");
  const [popupAnimationStyle, setPopupAnimationStyle] = useState("fade");
  const [popupDismissable, setPopupDismissable] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings?.welcomePopupEnabled !== undefined) setPopupEnabled(settings.welcomePopupEnabled);
    if (settings?.welcomePopupTitle) setPopupTitle(settings.welcomePopupTitle);
    if (settings?.welcomePopupMessage) setPopupMessage(settings.welcomePopupMessage);
    if (settings?.welcomePopupButtonText) setPopupButtonText(settings.welcomePopupButtonText);
    if (settings?.welcomePopupImageUrl) setPopupImageUrl(settings.welcomePopupImageUrl);
    if (settings?.welcomePopupAnimationStyle) setPopupAnimationStyle(settings.welcomePopupAnimationStyle);
    if (settings?.welcomePopupDismissable !== undefined) setPopupDismissable(settings.welcomePopupDismissable);
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("vyomai-admin-token");
      return apiRequest("PUT", "/api/admin/settings", data, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPopupImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = () => {
    updateSettingsMutation.mutate({
      welcomePopupEnabled: popupEnabled,
      welcomePopupTitle: popupTitle,
      welcomePopupMessage: popupMessage,
      welcomePopupButtonText: popupButtonText,
      welcomePopupImageUrl: popupImageUrl,
      welcomePopupAnimationStyle: popupAnimationStyle,
      welcomePopupDismissable: popupDismissable,
    });
  };

  const animationStyles = [
    { id: "fade", name: "Fade In", icon: Sparkles, description: "Smooth fade effect" },
    { id: "slide", name: "Slide Up", icon: MousePointer, description: "Slides from bottom" },
    { id: "zoom", name: "Zoom In", icon: Zap, description: "Zooms from center" },
    { id: "glow", name: "Glow Effect", icon: Eye, description: "Glowing entrance" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600" />
              Site Settings
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Configure site-wide settings and welcome popup
            </p>
          </div>
          <Button 
            onClick={handleSaveAll}
            disabled={updateSettingsMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All Settings
          </Button>
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  Welcome Popup
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Display an animated message to visitors before they see your website
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {showPreview ? "Hide Preview" : "Preview"}
                </Button>
                <Switch
                  checked={popupEnabled}
                  onCheckedChange={setPopupEnabled}
                />
                <span className={`text-sm font-medium ${popupEnabled ? "text-green-600" : "text-gray-400"}`}>
                  {popupEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {showPreview && (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-8 min-h-[300px] flex items-center justify-center">
                <div 
                  className={`bg-white/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-2xl text-center transform transition-all duration-500 ${
                    popupAnimationStyle === "zoom" ? "scale-100 animate-pulse" : 
                    popupAnimationStyle === "slide" ? "translate-y-0" :
                    popupAnimationStyle === "glow" ? "ring-4 ring-purple-400/50" : ""
                  }`}
                >
                  {popupImageUrl && (
                    <img 
                      src={popupImageUrl} 
                      alt="Popup" 
                      className="w-20 h-20 mx-auto mb-4 rounded-xl object-cover"
                    />
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{popupTitle || "Your Title"}</h3>
                  <p className="text-gray-600 mb-6">{popupMessage || "Your message here..."}</p>
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                    {popupButtonText || "Button Text"}
                  </button>
                  {popupDismissable && (
                    <p className="text-xs text-gray-400 mt-4">Click anywhere to dismiss</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 mb-2 block">
                    <Type className="w-4 h-4 inline mr-2" />
                    Popup Title
                  </Label>
                  <Input
                    value={popupTitle}
                    onChange={(e) => setPopupTitle(e.target.value)}
                    placeholder="Welcome to VyomAi"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 mb-2 block">Message</Label>
                  <Textarea
                    value={popupMessage}
                    onChange={(e) => setPopupMessage(e.target.value)}
                    placeholder="Experience the future of AI solutions..."
                    rows={3}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 mb-2 block">
                    <MousePointer className="w-4 h-4 inline mr-2" />
                    Button Text
                  </Label>
                  <Input
                    value={popupButtonText}
                    onChange={(e) => setPopupButtonText(e.target.value)}
                    placeholder="Explore Now"
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Switch
                    checked={popupDismissable}
                    onCheckedChange={setPopupDismissable}
                  />
                  <Label className="text-gray-700 cursor-pointer">Allow users to dismiss popup</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 mb-2 block">
                    <Image className="w-4 h-4 inline mr-2" />
                    Popup Image/Logo
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-400 transition-colors">
                    {popupImageUrl ? (
                      <div className="relative inline-block">
                        <img 
                          src={popupImageUrl} 
                          alt="Preview" 
                          className="w-24 h-24 rounded-xl object-cover mx-auto"
                        />
                        <button
                          onClick={() => setPopupImageUrl("")}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload image</p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className="mt-2">
                    <Input
                      value={popupImageUrl.startsWith("data:") ? "" : popupImageUrl}
                      onChange={(e) => setPopupImageUrl(e.target.value)}
                      placeholder="Or paste image URL..."
                      className="w-full text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 mb-2 block">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Animation Style
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {animationStyles.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setPopupAnimationStyle(style.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          popupAnimationStyle === style.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <style.icon className={`w-5 h-5 mb-1 ${
                          popupAnimationStyle === style.id ? "text-purple-600" : "text-gray-400"
                        }`} />
                        <p className={`text-sm font-medium ${
                          popupAnimationStyle === style.id ? "text-purple-700" : "text-gray-700"
                        }`}>{style.name}</p>
                        <p className="text-xs text-gray-400">{style.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
