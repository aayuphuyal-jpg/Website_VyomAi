import { useLocation, Link } from "wouter";
import { LogOut, BarChart3, FileText, Users, DollarSign, BookOpen, MessageSquare, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("vyomai-admin-token");
    setLocation("/admin");
  };

  const menuItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: BarChart3, emoji: "📊" },
    { label: "Articles & Media", href: "/admin/articles", icon: FileText, emoji: "📝" },
    { label: "Team Members", href: "/admin/team", icon: Users, emoji: "👥" },
    { label: "Pricing Plans", href: "/admin/pricing", icon: DollarSign, emoji: "💰" },
    { label: "Project Bookings", href: "/admin/bookings", icon: BookOpen, emoji: "📅" },
    { label: "Customer Inquiries", href: "/admin/inquiries", icon: MessageSquare, emoji: "💬" },
    { label: "Settings", href: "/admin/settings", icon: Settings, emoji: "⚙️" },
  ];

  const currentPage = menuItems.find(item => location?.includes(item.href));
  
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <Sidebar className="border-r">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                VyomAi Admin
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const isActive = location?.includes(item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          className={isActive ? "bg-primary/10 text-primary" : ""}
                        >
                          <Link to={item.href} className="flex items-center gap-2">
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                            {isActive && <span className="ml-auto text-lg">{item.emoji}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-background to-primary/5 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {currentPage?.emoji} {currentPage?.label || "Admin Dashboard"}
                </h1>
                <p className="text-xs text-muted-foreground">You're currently managing {currentPage?.label?.toLowerCase() || "the admin panel"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
                className="hover-elevate"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-primary/5">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
