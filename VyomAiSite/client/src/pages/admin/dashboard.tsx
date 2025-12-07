import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, MessageSquare, Eye, Share2, Calendar, Clock, ArrowUpRight, ArrowDownRight, Sparkles, Zap, FileText, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type VisitorStats, type SocialMediaAnalytics, type BookingRequest, type Article, type TeamMember, type PricingPackage, type CustomerInquiry } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";
import { Link } from "wouter";

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

  const { data: inquiries = [] } = useQuery<CustomerInquiry[]>({
    queryKey: ["/api/admin/inquiries"],
    enabled: !!localStorage.getItem("vyomai-admin-token"),
  });

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: team = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const { data: pricing = [] } = useQuery<PricingPackage[]>({
    queryKey: ["/api/pricing"],
  });

  const socialMediaChartData = socialAnalytics.map((platform) => ({
    name: platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1),
    followers: Number(platform.followersCount) || 0,
    engagement: Number(platform.engagementRate) || 0,
  }));

  const totalFollowers = socialMediaChartData.reduce((sum, p) => sum + p.followers, 0);
  const avgEngagement = socialMediaChartData.length > 0 
    ? (socialMediaChartData.reduce((sum, p) => sum + p.engagement, 0) / socialMediaChartData.length).toFixed(1)
    : "0";

  const bookingStatusData = [
    { name: "Completed", value: bookings.filter(b => b.status === "completed").length, fill: "#10b981" },
    { name: "Ongoing", value: bookings.filter(b => b.status === "ongoing").length, fill: "#3b82f6" },
    { name: "Open", value: bookings.filter(b => b.status === "open").length, fill: "#f59e0b" },
    { name: "Created", value: bookings.filter(b => b.status === "created").length, fill: "#8b5cf6" },
  ].filter(item => item.value > 0);

  const statsCards = [
    { 
      title: "Total Visitors", 
      value: visitors?.totalVisitors || 0, 
      icon: Eye, 
      color: "from-blue-500 to-cyan-500",
      change: "+12%",
      trend: "up"
    },
    { 
      title: "Today's Visitors", 
      value: visitors?.todayVisitors || 0, 
      icon: Activity, 
      color: "from-green-500 to-emerald-500",
      change: "+5%",
      trend: "up"
    },
    { 
      title: "Active Bookings", 
      value: bookings.filter(b => b.status === "ongoing" || b.status === "open").length, 
      icon: Calendar, 
      color: "from-purple-500 to-pink-500",
      change: `${bookings.length} total`,
      trend: "neutral"
    },
    { 
      title: "New Inquiries", 
      value: inquiries.filter(i => i.status === "new").length, 
      icon: MessageSquare, 
      color: "from-orange-500 to-red-500",
      change: `${inquiries.length} total`,
      trend: "neutral"
    },
  ];

  const quickStats = [
    { label: "Articles", value: articles.length, icon: FileText, href: "/admin/articles" },
    { label: "Team Members", value: team.filter(t => t.enabled).length, icon: Users, href: "/admin/team" },
    { label: "Pricing Plans", value: pricing.filter(p => p.enabled).length, icon: DollarSign, href: "/admin/pricing" },
    { label: "Social Platforms", value: socialAnalytics.length, icon: Share2, href: "/admin/social-media" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Welcome to VyomAi Dashboard
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Here's what's happening with your platform today
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-300">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-white/10 bg-slate-900/50 backdrop-blur overflow-hidden relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{stat.title}</p>
                      <p className="text-3xl font-bold text-white mt-1">{stat.value.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="w-3 h-3 text-green-400" />
                        ) : stat.trend === "down" ? (
                          <ArrowDownRight className="w-3 h-3 text-red-400" />
                        ) : null}
                        <span className={`text-xs ${stat.trend === "up" ? "text-green-400" : stat.trend === "down" ? "text-red-400" : "text-white/40"}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.05 }}
          >
            <Link to={stat.href}>
              <Card className="border-white/10 bg-slate-900/50 backdrop-blur hover:bg-white/5 transition-all cursor-pointer group">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <stat.icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/40">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Booking Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingStatusData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {bookingStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 -mt-4">
                    {bookingStatusData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-xs text-white/60">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-white/40">
                  No bookings yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Social Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {socialMediaChartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={socialMediaChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="followers" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-white/40">
                  No social media data
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-400" />
                Recent Inquiries
              </CardTitle>
              <Link to="/admin/inquiries">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 cursor-pointer">
                  View All
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {inquiries.length > 0 ? (
              <div className="space-y-2">
                {inquiries.slice(0, 5).map((inquiry, index) => (
                  <motion.div
                    key={inquiry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {inquiry.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{inquiry.name}</p>
                        <p className="text-xs text-white/40">{inquiry.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          inquiry.status === "new" ? "bg-green-500/20 text-green-400" :
                          inquiry.status === "contacted" ? "bg-blue-500/20 text-blue-400" :
                          "bg-white/10 text-white/60"
                        }`}
                      >
                        {inquiry.status || "new"}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-white/20 text-white/40">
                        {inquiry.inquiryType}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/40">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No inquiries yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
