import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type SiteSettings } from "@shared/schema";
import { Save, Loader2 } from "lucide-react";

export function SettingsPage() {
  const { toast } = useToast();
  const [footerEmail, setFooterEmail] = useState("info@vyomai.cloud");
  const [footerMobile, setFooterMobile] = useState("");
  const [footerAddress, setFooterAddress] = useState("Tokha, Kathmandu, Nepal");
  const [publishFooter, setPublishFooter] = useState(false);

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings?.footerContactEmail) setFooterEmail(settings.footerContactEmail);
    if (settings?.footerMobileNumber) setFooterMobile(settings.footerMobileNumber);
    if (settings?.footerAddress) setFooterAddress(settings.footerAddress);
    if (settings?.publishFooter !== undefined) setPublishFooter(settings.publishFooter);
  }, [settings]);

  const updateFooterMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("vyomai-admin-token");
      return apiRequest("PUT", "/api/admin/footer", data, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved successfully" });
    },
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Footer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
            <input 
              type="checkbox"
              checked={publishFooter}
              onChange={(e) => setPublishFooter(e.target.checked)}
              id="publish-footer"
              className="w-4 h-4"
              data-testid="checkbox-publish-footer"
            />
            <label htmlFor="publish-footer" className="text-sm font-medium cursor-pointer">
              Publish Footer to Website
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Contact Email</label>
              <Input 
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                type="email"
                data-testid="input-footer-email"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Mobile Number</label>
              <Input 
                value={footerMobile}
                onChange={(e) => setFooterMobile(e.target.value)}
                type="tel"
                data-testid="input-footer-mobile"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Address</label>
            <Input 
              value={footerAddress}
              onChange={(e) => setFooterAddress(e.target.value)}
              data-testid="input-footer-address"
            />
          </div>

          <Button 
            onClick={() => {
              updateFooterMutation.mutate({ 
                footerContactEmail: footerEmail, 
                footerMobileNumber: footerMobile, 
                footerAddress: footerAddress, 
                publishFooter 
              });
            }} 
            disabled={updateFooterMutation.isPending}
            data-testid="button-save-settings"
          >
            {updateFooterMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
