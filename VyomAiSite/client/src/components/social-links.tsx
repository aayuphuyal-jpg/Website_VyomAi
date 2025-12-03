import { SiLinkedin, SiInstagram, SiFacebook, SiWhatsapp, SiYoutube } from "react-icons/si";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { type SiteSettings } from "@shared/schema";

export function SocialLinks({ size = "default" }: { size?: "default" | "lg" }) {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const { data: integrations = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/integrations"],
  });

  const isConnected = (platform: string) => {
    return integrations.find((i: any) => i.platform === platform)?.isConnected ?? false;
  };

  const getSocialLinks = () => {
    const links = [
      { icon: SiLinkedin, href: settings?.socialLinks?.linkedin || "#", label: "LinkedIn", platform: "linkedin", color: "hover:text-blue-500" },
      { icon: SiInstagram, href: settings?.socialLinks?.instagram || "#", label: "Instagram", platform: "instagram", color: "hover:text-pink-500" },
      { icon: SiFacebook, href: settings?.socialLinks?.facebook || "#", label: "Facebook", platform: "facebook", color: "hover:text-blue-600" },
      { icon: SiWhatsapp, href: settings?.socialLinks?.whatsapp || "#", label: "WhatsApp", platform: "whatsapp", color: "hover:text-green-500" },
      { icon: SiYoutube, href: settings?.socialLinks?.youtube || "#", label: "YouTube", platform: "youtube", color: "hover:text-red-500" },
      { icon: Phone, href: settings?.socialLinks?.viber || "#", label: "Viber", platform: "viber", color: "hover:text-purple-500" },
    ];
    return links.filter(link => link.href !== "#" && isConnected(link.platform));
  };

  const iconSize = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  const socialLinks = getSocialLinks();
  
  return (
    <div className="flex items-center gap-1" data-testid="social-links">
      {socialLinks.map((link) => (
        <Button
          key={link.label}
          variant="ghost"
          size="icon"
          asChild
          className={`${link.color} transition-colors`}
        >
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            data-testid={`link-social-${link.label.toLowerCase()}`}
          >
            <link.icon className={iconSize} />
          </a>
        </Button>
      ))}
    </div>
  );
}
