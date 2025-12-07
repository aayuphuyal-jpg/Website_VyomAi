import { useLocation, Link } from "wouter";
import { 
  LogOut, BarChart3, FileText, Users, DollarSign, BookOpen, MessageSquare, Settings, 
  LayoutDashboard, Share2, Globe, Mail, Image, ChevronDown, Sparkles, Zap, 
  TrendingUp, Bell, Home, Palette, Contact
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnimatedLogo } from "@/components/animated-logo";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuSection {
  title: string;
  icon: React.ElementType;
  items: MenuItem[];
  defaultOpen?: boolean;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["overview", "content", "business"])
  );

  const handleLogout = () => {
    localStorage.removeItem("vyomai-admin-token");
    setLocation("/admin");
  };

  const toggleSection = (sectionTitle: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionTitle)) {
      newExpanded.delete(sectionTitle);
    } else {
      newExpanded.add(sectionTitle);
    }
    setExpandedSections(newExpanded);
  };

  const menuSections: MenuSection[] = [
    {
      title: "overview",
      icon: Zap,
      defaultOpen: true,
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
      ],
    },
    {
      title: "content",
      icon: Palette,
      defaultOpen: true,
      items: [
        { label: "Home Page", href: "/admin/homepage-content", icon: Home },
        { label: "Articles & Media", href: "/admin/articles", icon: FileText },
        { label: "Team Members", href: "/admin/team", icon: Users },
      ],
    },
    {
      title: "business",
      icon: TrendingUp,
      defaultOpen: true,
      items: [
        { label: "Pricing Plans", href: "/admin/pricing", icon: DollarSign },
        { label: "Bookings", href: "/admin/bookings", icon: BookOpen, badge: "New", badgeColor: "bg-green-500" },
        { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
      ],
    },
    {
      title: "integrations",
      icon: Share2,
      items: [
        { label: "Social Media", href: "/admin/social-media", icon: Globe },
        { label: "Email", href: "/admin/email-settings", icon: Mail },
      ],
    },
    {
      title: "system",
      icon: Settings,
      items: [
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const allItems = menuSections.flatMap(section => section.items);
  const currentPage = allItems.find(item => location?.includes(item.href));

  const sidebarStyle = {
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3.5rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
        <Sidebar className="border-r border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <SidebarContent className="p-3">
            <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10">
              <div className="flex items-center gap-2">
                <AnimatedLogo variant="admin" showText={false} className="h-7 w-7" />
                <div className="flex flex-col">
                  <span className="font-bold text-sm bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    VyomAi
                  </span>
                  <span className="text-[10px] text-white/50">Admin Console</span>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {menuSections.map((section) => {
                const isExpanded = expandedSections.has(section.title);
                const SectionIcon = section.icon;
                
                return (
                  <div key={section.title} className="mb-2">
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-white/40 hover:text-white/60 uppercase tracking-wider transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <SectionIcon className="w-3 h-3" />
                        <span>{section.title}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0.5 mt-1">
                            {section.items.map((item) => {
                              const isActive = location?.includes(item.href);
                              const ItemIcon = item.icon;
                              
                              return (
                                <Link key={item.href} to={item.href}>
                                  <motion.div
                                    className={cn(
                                      "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer group",
                                      isActive 
                                        ? "bg-gradient-to-r from-purple-500/30 to-blue-500/20 text-white border border-purple-500/30" 
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                    )}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {isActive && (
                                      <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-400 to-blue-400 rounded-r-full"
                                      />
                                    )}
                                    <div className={cn(
                                      "p-1.5 rounded-md transition-colors",
                                      isActive 
                                        ? "bg-purple-500/20" 
                                        : "bg-white/5 group-hover:bg-white/10"
                                    )}>
                                      <ItemIcon className="w-4 h-4" />
                                    </div>
                                    <span className="flex-1">{item.label}</span>
                                    {item.badge && (
                                      <span className={cn(
                                        "px-1.5 py-0.5 text-[10px] font-medium rounded-full text-white",
                                        item.badgeColor || "bg-purple-500"
                                      )}>
                                        {item.badge}
                                      </span>
                                    )}
                                    {isActive && (
                                      <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                                    )}
                                  </motion.div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            <div className="mt-auto pt-4 border-t border-white/10">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                <div className="flex items-center gap-2 text-xs text-orange-300/80">
                  <Bell className="w-4 h-4" />
                  <span>System Status: Online</span>
                </div>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" className="text-white/60 hover:text-white" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">
                    {currentPage?.label || "Dashboard"}
                  </h1>
                  {currentPage && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30"
                    >
                      <span className="text-[10px] font-medium text-purple-300">Active</span>
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-white/40">
                  Manage your {currentPage?.label?.toLowerCase() || "admin panel"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/60">AI Ready</span>
              </div>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
                className="text-white/60 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/50 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
