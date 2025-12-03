import { z } from "zod";

export const users = {
  id: "",
  username: "",
  password: "",
  email: "",
  twoFactorSecret: "",
  twoFactorEnabled: false,
};

export const insertUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email().optional(),
  twoFactorSecret: z.string().optional(),
  twoFactorEnabled: z.boolean().optional().default(false),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email("Valid email required"),
});

export const verifyResetCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type VerifyResetCode = z.infer<typeof verifyResetCodeSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string; email?: string; twoFactorSecret?: string; twoFactorEnabled?: boolean };

export const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.enum(["article", "video", "demo"]),
  mediaUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  published: z.boolean(),
  createdAt: z.string(),
  createdBy: z.string().optional(),
  updatedAt: z.string().optional(),
  updatedBy: z.string().optional(),
});

export const insertArticleSchema = articleSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type Article = z.infer<typeof articleSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export const siteSettingsSchema = z.object({
  companyName: z.string(),
  tagline: z.string(),
  email: z.string(),
  address: z.string(),
  phone: z.string().optional(),
  aboutText: z.string(),
  missionText: z.string(),
  logoUrl: z.string().optional(),
  paymentEnabled: z.boolean(),
  comingSoonEnabled: z.boolean().optional(),
  comingSoonTitle: z.string().optional(),
  comingSoonMessage: z.string().optional(),
  quickLinks: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })).optional(),
  socialLinks: z.object({
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    whatsapp: z.string().optional(),
    viber: z.string().optional(),
    youtube: z.string().optional(),
  }),
  socialMediaEnabled: z.object({
    linkedin: z.boolean().optional().default(true),
    instagram: z.boolean().optional().default(true),
    facebook: z.boolean().optional().default(true),
    whatsapp: z.boolean().optional().default(true),
    viber: z.boolean().optional().default(true),
    youtube: z.boolean().optional().default(true),
  }).optional().default({}),
  // Section visibility toggles
  showHomeSection: z.boolean().optional().default(true),
  showAboutSection: z.boolean().optional().default(true),
  showServicesSection: z.boolean().optional().default(true),
  showSolutionsSection: z.boolean().optional().default(true),
  showMediaSection: z.boolean().optional().default(true),
  showContactSection: z.boolean().optional().default(true),
  // Footer settings
  footerContactEmail: z.string().optional(),
  footerMobileNumber: z.string().optional(),
  footerAddress: z.string().optional(),
  publishFooter: z.boolean().optional().default(false),
  // Section visibility toggles for new sections
  showTeamSection: z.boolean().optional().default(true),
  showPricingSection: z.boolean().optional().default(true),
  showProjectDiscussionSection: z.boolean().optional().default(true),
  // Booking bot toggle
  bookingBotEnabled: z.boolean().optional().default(true),
  // Currency exchange rates (stored as JSON)
  exchangeRates: z.object({
    USD: z.number().default(1),
    EUR: z.number().default(0.92),
    INR: z.number().default(83.12),
    NPR: z.number().default(132.5),
  }).optional().default({
    USD: 1,
    EUR: 0.92,
    INR: 83.12,
    NPR: 132.5,
  }),
  // Last exchange rate update timestamp
  exchangeRatesUpdatedAt: z.string().optional(),
  // Default currency for pricing display
  defaultCurrency: z.enum(["USD", "EUR", "INR", "NPR"]).optional().default("NPR"),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const visitorStatsSchema = z.object({
  totalVisitors: z.number(),
  todayVisitors: z.number(),
  hourlyData: z.array(z.object({
    hour: z.string(),
    visitors: z.number(),
  })).optional(),
  trafficSources: z.array(z.object({
    name: z.string(),
    value: z.number(),
  })).optional(),
  deviceTypes: z.array(z.object({
    name: z.string(),
    value: z.number(),
  })).optional(),
  engagementMetrics: z.array(z.object({
    metric: z.string(),
    value: z.number(),
  })).optional(),
  topPages: z.array(z.object({
    page: z.string(),
    views: z.number(),
  })).optional(),
  socialMediaStats: z.array(z.object({
    platform: z.string(),
    likes: z.number().optional().default(0),
    shares: z.number().optional().default(0),
    comments: z.number().optional().default(0),
    impressions: z.number().optional().default(0),
  })).optional(),
});

export type VisitorStats = z.infer<typeof visitorStatsSchema>;

export const serviceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
});

export type Service = z.infer<typeof serviceSchema>;

export const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  avatarType: z.enum(["custom", "ai-generated"]).optional().default("custom"),
  aiAvatarStyle: z.string().optional(),
  animationEnabled: z.boolean().optional().default(true),
  enabled: z.boolean().optional().default(true),
  createdAt: z.string().optional(),
});

export const insertTeamMemberSchema = teamMemberSchema.omit({ id: true, createdAt: true });

export type TeamMember = z.infer<typeof teamMemberSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export const pricingPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().optional(), // Kept for backwards compatibility
  monthlyPrice: z.number().optional(),
  yearlyPrice: z.number().optional(),
  oneTimeContactEmail: z.string().email().optional(), // Email for one-time pricing inquiries - if set, enables custom pricing
  contactMessage: z.string().optional().default("Contact VyomAi for Premium Package"), // Floating element text
  floatingCloudEnabled: z.boolean().optional().default(true), // Enable/disable floating cloud animation
  baseCurrency: z.enum(["USD", "EUR", "INR", "NPR"]).default("NPR"), // All prices stored in NPR
  description: z.string(),
  features: z.array(z.string()),
  highlighted: z.boolean().optional(),
  enabled: z.boolean().optional().default(true), // Publish toggle
  createdAt: z.string().optional(),
});

export const insertPricingPackageSchema = pricingPackageSchema.omit({ id: true, createdAt: true });

export type PricingPackage = z.infer<typeof pricingPackageSchema>;
export type InsertPricingPackage = z.infer<typeof insertPricingPackageSchema>;

// One-time pricing request schema for storing customer inquiries
export const oneTimePricingRequestSchema = z.object({
  id: z.string(),
  packageId: z.string(),
  packageName: z.string(),
  name: z.string(),
  email: z.string().email(),
  mobileNumber: z.string(),
  request: z.string(),
  estimatedPrice: z.number(),
  currency: z.string(),
  status: z.enum(["pending", "contacted", "converted"]).optional().default("pending"),
  createdAt: z.string().optional(),
});

export const insertOneTimePricingRequestSchema = oneTimePricingRequestSchema.omit({ id: true, createdAt: true });

export type OneTimePricingRequest = z.infer<typeof oneTimePricingRequestSchema>;
export type InsertOneTimePricingRequest = z.infer<typeof insertOneTimePricingRequestSchema>;

export const projectDiscussionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  contactEmail: z.string().optional(),
  createdAt: z.string().optional(),
});

export const insertProjectDiscussionSchema = projectDiscussionSchema.omit({ id: true, createdAt: true });

export type ProjectDiscussion = z.infer<typeof projectDiscussionSchema>;
export type InsertProjectDiscussion = z.infer<typeof insertProjectDiscussionSchema>;

export const bookingRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  companyOrPersonal: z.string(),
  message: z.string().optional(),
  status: z.enum(["created", "open", "ongoing", "completed"]).optional().default("created"),
  dueDate: z.string().optional(),
  createdAt: z.string().optional(),
});

export const insertBookingRequestSchema = bookingRequestSchema.omit({ id: true, createdAt: true });

export type BookingRequest = z.infer<typeof bookingRequestSchema>;
export type InsertBookingRequest = z.infer<typeof insertBookingRequestSchema>;

export const socialMediaAnalyticsSchema = z.object({
  id: z.string(),
  platform: z.enum(["linkedin", "instagram", "facebook", "whatsapp", "viber", "youtube"]),
  engagementRate: z.number().optional().default(0),
  followersCount: z.number().optional().default(0),
  postsCount: z.number().optional().default(0),
  impressions: z.number().optional().default(0),
  likes: z.number().optional().default(0),
  shares: z.number().optional().default(0),
  comments: z.number().optional().default(0),
  createdAt: z.string().optional(),
});

export const insertSocialMediaAnalyticsSchema = socialMediaAnalyticsSchema.omit({ id: true, createdAt: true });

export type SocialMediaAnalytics = z.infer<typeof socialMediaAnalyticsSchema>;
export type InsertSocialMediaAnalytics = z.infer<typeof insertSocialMediaAnalyticsSchema>;

export const socialMediaIntegrationSchema = z.object({
  id: z.string(),
  platform: z.enum(["linkedin", "instagram", "facebook", "whatsapp", "viber", "youtube"]),
  isConnected: z.boolean().optional().default(false),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  accountId: z.string().optional(),
  accountName: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const insertSocialMediaIntegrationSchema = socialMediaIntegrationSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type SocialMediaIntegration = z.infer<typeof socialMediaIntegrationSchema>;
export type InsertSocialMediaIntegration = z.infer<typeof insertSocialMediaIntegrationSchema>;

export const customerInquirySchema = z.object({
  id: z.string(),
  inquiryType: z.enum(["custom_solution", "booking", "project_discussion", "contact"]),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string(),
  company: z.string().optional(),
  status: z.enum(["new", "contacted", "resolved"]).optional().default("new"),
  createdAt: z.string().optional(),
});

export const insertCustomerInquirySchema = customerInquirySchema.omit({ id: true, createdAt: true });

export type CustomerInquiry = z.infer<typeof customerInquirySchema>;
export type InsertCustomerInquiry = z.infer<typeof insertCustomerInquirySchema>;

// Drizzle ORM table definitions
import { pgTable, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: varchar("username").notNull().unique(),
  password: varchar("password").notNull(),
  email: varchar("email"),
  twoFactorSecret: varchar("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
});

export const articlesTable = pgTable("articles", {
  id: varchar("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").notNull(),
  mediaUrl: varchar("media_url"),
  thumbnailUrl: varchar("thumbnail_url"),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teamMembersTable = pgTable("team_members", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  role: varchar("role").notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("image_url").notNull(),
  avatarType: varchar("avatar_type").default("custom"),
  aiAvatarStyle: varchar("ai_avatar_style"),
  animationEnabled: boolean("animation_enabled").default(true),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pricingPackagesTable = pgTable("pricing_packages", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  price: text("price"),
  monthlyPrice: text("monthly_price"),
  yearlyPrice: text("yearly_price"),
  oneTimePrice: text("one_time_price"),
  oneTimeContactEmail: varchar("one_time_contact_email"),
  contactMessage: text("contact_message").default("Contact VyomAi for Premium Package"),
  floatingCloudEnabled: boolean("floating_cloud_enabled").default(true),
  baseCurrency: varchar("base_currency").default("USD"),
  description: varchar("description").notNull(),
  features: text("features").notNull(),
  highlighted: boolean("highlighted").default(false),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const oneTimePricingRequestsTable = pgTable("one_time_pricing_requests", {
  id: varchar("id").primaryKey(),
  packageId: varchar("package_id").notNull(),
  packageName: varchar("package_name").notNull(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  mobileNumber: varchar("mobile_number").notNull(),
  request: text("request").notNull(),
  estimatedPrice: text("estimated_price").notNull(),
  currency: varchar("currency").notNull(),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projectDiscussionTable = pgTable("project_discussion", {
  id: varchar("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  contactEmail: varchar("contact_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookingRequestsTable = pgTable("booking_requests", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  companyOrPersonal: varchar("company_or_personal").notNull(),
  message: text("message"),
  status: varchar("status").default("created"),
  dueDate: varchar("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const siteSettingsTable = pgTable("site_settings", {
  id: varchar("id").primaryKey(),
  companyName: varchar("company_name").notNull(),
  tagline: varchar("tagline").notNull(),
  email: varchar("email").notNull(),
  address: varchar("address").notNull(),
  phone: varchar("phone"),
  aboutText: text("about_text").notNull(),
  missionText: text("mission_text").notNull(),
  logoUrl: varchar("logo_url"),
  paymentEnabled: boolean("payment_enabled").default(false),
  comingSoonEnabled: boolean("coming_soon_enabled").default(false),
  comingSoonTitle: varchar("coming_soon_title"),
  comingSoonMessage: text("coming_soon_message"),
  socialLinks: text("social_links").notNull(),
  showHomeSection: boolean("show_home_section").default(true),
  showAboutSection: boolean("show_about_section").default(true),
  showServicesSection: boolean("show_services_section").default(true),
  showSolutionsSection: boolean("show_solutions_section").default(true),
  showMediaSection: boolean("show_media_section").default(true),
  showContactSection: boolean("show_contact_section").default(true),
  footerLogoUrl: varchar("footer_logo_url"),
  footerContactEmail: varchar("footer_contact_email"),
  footerAddress: varchar("footer_address"),
  showTeamSection: boolean("show_team_section").default(true),
  showPricingSection: boolean("show_pricing_section").default(true),
  showProjectDiscussionSection: boolean("show_project_discussion_section").default(true),
  bookingBotEnabled: boolean("booking_bot_enabled").default(true),
  exchangeRates: text("exchange_rates").default('{"USD":1,"EUR":0.92,"INR":83.12,"NPR":132.5}'),
  exchangeRatesUpdatedAt: varchar("exchange_rates_updated_at"),
  defaultCurrency: varchar("default_currency").default("NPR"),
});

export const visitorStatsTable = pgTable("visitor_stats", {
  id: varchar("id").primaryKey(),
  totalVisitors: text("total_visitors").notNull(),
  todayVisitors: text("today_visitors").notNull(),
  hourlyData: text("hourly_data"),
  trafficSources: text("traffic_sources"),
  deviceTypes: text("device_types"),
  engagementMetrics: text("engagement_metrics"),
  topPages: text("top_pages"),
  socialMediaStats: text("social_media_stats"),
});

export const socialMediaAnalyticsTable = pgTable("social_media_analytics", {
  id: varchar("id").primaryKey(),
  platform: varchar("platform").notNull().unique(),
  engagementRate: text("engagement_rate").default("0"),
  followersCount: text("followers_count").default("0"),
  postsCount: text("posts_count").default("0"),
  impressions: text("impressions").default("0"),
  likes: text("likes").default("0"),
  shares: text("shares").default("0"),
  comments: text("comments").default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const socialMediaIntegrationsTable = pgTable("social_media_integrations", {
  id: varchar("id").primaryKey(),
  platform: varchar("platform").notNull().unique(),
  isConnected: boolean("is_connected").default(false),
  accessToken: varchar("access_token"),
  refreshToken: varchar("refresh_token"),
  accountId: varchar("account_id"),
  accountName: varchar("account_name"),
  profileUrl: varchar("profile_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const customerInquiriesTable = pgTable("customer_inquiries", {
  id: varchar("id").primaryKey(),
  inquiryType: varchar("inquiry_type").notNull(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  subject: varchar("subject"),
  message: text("message").notNull(),
  company: varchar("company"),
  status: varchar("status").default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
