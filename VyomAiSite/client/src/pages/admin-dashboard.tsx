import { useEffect, lazy, Suspense } from "react";
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
import SocialMediaAdmin from "@/pages/admin/social-media";
import EmailSettingsAdmin from "@/pages/admin/email-settings";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AdminDashboardRouter() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("vyomai-admin-token");
    if (!token) {
      setLocation("/admin");
    }
  }, [setLocation]);

  return (
    <Switch>
      <Route path="/admin/social-media">
        <SocialMediaAdmin />
      </Route>
      <Route path="/admin/email-settings">
        <EmailSettingsAdmin />
      </Route>
      <Route>
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
      </Route>
    </Switch>
  );
}
