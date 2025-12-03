import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, MessageSquare, Eye, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type VisitorStats, type SocialMediaAnalytics, type BookingRequest } from "@shared/schema";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function AdminDashboard() {
  const { data: visitors } = useQuery<VisitorStats>({
    queryKey: ["/api/visitors"],
  });

  const { data: socialAnalytics = [] } = useQuery<SocialMediaAnalytics[]>({
    queryKey: ["/api/admin/analytics"],
    enabled: !!localStorage.getItem("vyomai-admin-token"),
  });

  const { data: bookings = [] } = useQuery<BookingRequest[]>({
    queryKey: ["/api/bookings"],
    enabled: !!localStorage.getItem("vyomai-admin-token"),
  });

  const { data: inquiries = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/inquiries"],
    enabled: !!localStorage.getItem("vyomai-admin-token"),
  });

  // Prepare social media data for charts
  const socialMediaChartData = socialAnalytics.map((platform) => ({
    name: platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1),
    followers: parseInt(platform.followersCount || "0"),
    engagement: parseFloat(platform.engagementRate || "0"),
    impressions: parseInt(platform.impressions || "0"),
  })) || [];

  // Calculate KPIs
  const totalFollowers = socialMediaChartData.reduce((sum, p) => sum + p.followers, 0);
  const avgEngagement = socialMediaChartData.length > 0 
    ? (socialMediaChartData.reduce((sum, p) => sum + p.engagement, 0) / socialMediaChartData.length).toFixed(1)
    : "0";
  const totalImpressions = socialMediaChartData.reduce((sum, p) => sum + p.impressions, 0);

  const bookingStatusData = [
    { name: "Completed", value: bookings.filter(b => b.status === "completed").length, fill: "#10b981" },
    { name: "Ongoing", value: bookings.filter(b => b.status === "ongoing").length, fill: "#3b82f6" },
    { name: "Open", value: bookings.filter(b => b.status === "open").length, fill: "#f59e0b" },
    { name: "Created", value: bookings.filter(b => b.status === "created").length, fill: "#6366f1" },
  ].filter(item => item.value > 0);

  const inquiryTypeData = [
    { type: "Contact", count: inquiries.filter(i => i.inquiryType === "contact").length },
    { type: "Booking", count: inquiries.filter(i => i.inquiryType === "booking").length },
    { type: "Project Discussion", count: inquiries.filter(i => i.inquiryType === "project_discussion").length },
    { type: "Custom Solution", count: inquiries.filter(i => i.inquiryType === "custom_solution").length },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitors?.totalVisitors || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All time visitors</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Followers</CardTitle>
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFollowers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {socialAnalytics.length} platforms</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement}%</div>
            <p className="text-xs text-muted-foreground mt-1">Social media average</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Inquiries</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiries.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total inquiries received</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Social Media Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {socialMediaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={socialMediaChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="followers" fill="#3b82f6" name="Followers" />
                  <Bar dataKey="engagement" fill="#10b981" name="Engagement %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No social media data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No bookings yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inquiry Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {inquiryTypeData.some(item => item.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inquiryTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No inquiry data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {inquiries.length > 0 ? (
            <div className="space-y-3">
              {inquiries.slice(0, 5).map((inquiry: any) => (
                <div key={inquiry.id} className="p-3 border rounded-lg hover-elevate">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{inquiry.name}</p>
                      <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">{inquiry.inquiryType}</p>
                    </div>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {inquiry.status || "new"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No inquiries yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
