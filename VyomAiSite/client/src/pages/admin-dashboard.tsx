import { useEffect } from "react";
import { useLocation, Route, Switch } from "wouter";
import { AdminLayout } from "@/pages/admin/layout";
import { AdminDashboard } from "@/pages/admin/dashboard";
import { ArticlesPage } from "@/pages/admin/articles";
import { TeamPage } from "@/pages/admin/team";
import { PricingPage } from "@/pages/admin/pricing";
import { BookingsPage } from "@/pages/admin/bookings";
import { InquiriesPage } from "@/pages/admin/inquiries";
import { SettingsPage } from "@/pages/admin/settings";
import { HomepageContentPage } from "@/pages/admin/homepage-content";

export default function AdminDashboardRouter() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("vyomai-admin-token");
    if (!token) {
      setLocation("/admin");
    }
  }, [setLocation]);

  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/homepage-content" component={HomepageContentPage} />
        <Route path="/admin/articles" component={ArticlesPage} />
        <Route path="/admin/team" component={TeamPage} />
        <Route path="/admin/pricing" component={PricingPage} />
        <Route path="/admin/bookings" component={BookingsPage} />
        <Route path="/admin/inquiries" component={InquiriesPage} />
        <Route path="/admin/settings" component={SettingsPage} />
        <Route path="/admin" component={AdminDashboard} />
      </Switch>
    </AdminLayout>
  );
}
