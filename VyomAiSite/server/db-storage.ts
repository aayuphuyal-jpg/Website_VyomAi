import { db } from "./db";
import { 
  usersTable, articlesTable, teamMembersTable, pricingPackagesTable, 
  projectDiscussionTable, bookingRequestsTable, siteSettingsTable, 
  visitorStatsTable, socialMediaAnalyticsTable, socialMediaIntegrationsTable,
  oneTimePricingRequestsTable, customerInquiriesTable, popupFormsTable
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { type User, type InsertUser, type Article, type InsertArticle, type SiteSettings, type VisitorStats, type TeamMember, type InsertTeamMember, type PricingPackage, type InsertPricingPackage, type ProjectDiscussion, type InsertProjectDiscussion, type BookingRequest, type InsertBookingRequest, type SocialMediaAnalytics, type InsertSocialMediaAnalytics, type SocialMediaIntegration, type InsertSocialMediaIntegration, type OneTimePricingRequest, type InsertOneTimePricingRequest, type CustomerInquiry, type InsertCustomerInquiry, type PopupForm, type InsertPopupForm } from "@shared/schema";
import { randomUUID } from "crypto";
import bcryptjs from "bcryptjs";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined>;
  
  getArticles(): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<boolean>;
  
  getSettings(): Promise<SiteSettings>;
  updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;
  
  getVisitorStats(): Promise<VisitorStats>;
  incrementVisitors(): Promise<VisitorStats>;
  resetHourlyData(): Promise<VisitorStats>;
  resetTrafficSources(): Promise<VisitorStats>;
  resetDeviceTypes(): Promise<VisitorStats>;
  resetTopPages(): Promise<VisitorStats>;
  resetEngagementMetrics(): Promise<VisitorStats>;
  resetSocialMediaStats(): Promise<VisitorStats>;
  resetTotalVisitors(): Promise<VisitorStats>;
  
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;
  
  getPricingPackages(): Promise<PricingPackage[]>;
  getPricingPackage(id: string): Promise<PricingPackage | undefined>;
  createPricingPackage(pkg: InsertPricingPackage): Promise<PricingPackage>;
  updatePricingPackage(id: string, pkg: Partial<InsertPricingPackage>): Promise<PricingPackage | undefined>;
  deletePricingPackage(id: string): Promise<boolean>;
  
  getProjectDiscussion(): Promise<ProjectDiscussion | undefined>;
  updateProjectDiscussion(data: InsertProjectDiscussion): Promise<ProjectDiscussion>;
  
  getBookingRequests(): Promise<BookingRequest[]>;
  createBookingRequest(booking: InsertBookingRequest): Promise<BookingRequest>;
  updateBookingRequest(id: string, booking: Partial<InsertBookingRequest>): Promise<BookingRequest | undefined>;
  deleteBookingRequest(id: string): Promise<boolean>;
  resetBookingRequests(): Promise<void>;
  
  getOneTimePricingRequests(): Promise<OneTimePricingRequest[]>;
  createOneTimePricingRequest(request: InsertOneTimePricingRequest): Promise<OneTimePricingRequest>;
  updateOneTimePricingRequest(id: string, request: Partial<InsertOneTimePricingRequest>): Promise<OneTimePricingRequest | undefined>;
  deleteOneTimePricingRequest(id: string): Promise<boolean>;
  
  getSocialMediaAnalytics(): Promise<SocialMediaAnalytics[]>;
  getSocialMediaAnalytic(platform: string): Promise<SocialMediaAnalytics | undefined>;
  updateSocialMediaAnalytics(platform: string, data: Partial<InsertSocialMediaAnalytics>): Promise<SocialMediaAnalytics>;
  resetSocialMediaAnalytics(): Promise<void>;

  getSocialMediaIntegrations(): Promise<SocialMediaIntegration[]>;
  getSocialMediaIntegration(platform: string): Promise<SocialMediaIntegration | undefined>;
  updateSocialMediaIntegration(platform: string, data: Partial<InsertSocialMediaIntegration>): Promise<SocialMediaIntegration>;
  
  getCustomerInquiries(): Promise<CustomerInquiry[]>;
  createCustomerInquiry(inquiry: InsertCustomerInquiry): Promise<CustomerInquiry>;
  updateCustomerInquiry(id: string, inquiry: Partial<InsertCustomerInquiry>): Promise<CustomerInquiry | undefined>;
  deleteCustomerInquiry(id: string): Promise<boolean>;
  
  storeResetCode(email: string, code: string): Promise<void>;
  verifyResetCode(email: string, code: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultUsers().catch(err => console.error("Failed to initialize users:", err));
    this.initializeDefaultSettings().catch(err => console.error("Failed to initialize settings:", err));
  }

  private async initializeDefaultUsers(): Promise<void> {
    try {
      // Initialize admin user
      const adminUsername = process.env.ADMIN_USERNAME || "admin";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      const adminEmail = process.env.ADMIN_EMAIL || "shekhar@vyomai.cloud";
      
      const existingAdmin = await this.getUserByUsername(adminUsername);
      if (!existingAdmin) {
        const hashedPassword = bcryptjs.hashSync(adminPassword, 10);
        const adminId = randomUUID();
        await db.insert(usersTable).values({
          id: adminId,
          username: adminUsername,
          password: hashedPassword,
          email: adminEmail,
        });
        console.log("✅ Admin user initialized");
      }

      // Initialize test user for development
      const testUserExists = await this.getUserByEmail("aayu.phuyal@gmail.com");
      if (!testUserExists) {
        const testPassword = bcryptjs.hashSync("test123", 10);
        const testUserId = randomUUID();
        await db.insert(usersTable).values({
          id: testUserId,
          username: "aayuphuyal",
          password: testPassword,
          email: "aayu.phuyal@gmail.com",
        });
        console.log("✅ Test user initialized");
      }
    } catch (error) {
      console.error("Error initializing users:", error);
    }
  }

  private async initializeDefaultSettings(): Promise<void> {
    try {
      const existingSettings = await db.select().from(siteSettingsTable).limit(1);
      if (existingSettings.length === 0) {
        const settingsId = randomUUID();
        await db.insert(siteSettingsTable).values({
          id: settingsId,
          companyName: "VyomAi Cloud Pvt. Ltd",
          tagline: "AI Solutions for Business & Personal Growth",
          email: "info@vyomai.cloud",
          address: "Tokha, Kathmandu, Nepal",
          phone: "+977-1-5900000",
          aboutText: "VyomAi is a Nepal-based AI technology startup providing intelligent business solutions.",
          missionText: "To democratize AI technology and make it accessible for businesses of all sizes.",
          socialLinks: JSON.stringify({
            linkedin: "https://linkedin.com/company/vyomai",
            instagram: "https://instagram.com/vyomai",
            facebook: "https://facebook.com/vyomai",
            whatsapp: "https://wa.me/977",
            viber: "https://viber.com/vyomai",
            youtube: "https://youtube.com/@vyomai",
          }),
          showHomeSection: true,
          showAboutSection: true,
          showServicesSection: true,
          showSolutionsSection: true,
          showTeamSection: true,
          showPricingSection: true,
          showMediaSection: true,
          showProjectDiscussionSection: true,
          showContactSection: true,
          bookingBotEnabled: true,
          exchangeRates: JSON.stringify({
            USD: 1,
            EUR: 0.92,
            INR: 83.12,
            NPR: 132.5,
          }),
          defaultCurrency: "NPR",
        });
        console.log("✅ Default site settings initialized");
      }
    } catch (error) {
      console.error("Error initializing settings:", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return user[0] as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    return user[0] as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    return user[0] as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const id = randomUUID();
      const user: User = { ...insertUser, id, password: insertUser.password };
      const result = await db.insert(usersTable).values(user).returning();
      
      if (!result || result.length === 0) {
        throw new Error("Database returned empty result for user creation");
      }
      
      const created = result[0] as User;
      return created;
    } catch (error) {
      console.error("❌ DB: User creation failed:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    const users = await db.select().from(usersTable);
    return users as User[];
  }

  async updateUser(id: string, data: Partial<any>): Promise<User | undefined> {
    const result = await db.update(usersTable).set(data).where(eq(usersTable.id, id)).returning();
    return result[0] as User | undefined;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined> {
    const result = await db.update(usersTable).set({ password: hashedPassword }).where(eq(usersTable.id, id)).returning();
    return result[0] as User | undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    await db.delete(usersTable).where(eq(usersTable.id, id));
    return true;
  }

  async getArticles(): Promise<Article[]> {
    const articles = await db.select().from(articlesTable);
    return articles.map(a => ({
      ...a,
      createdAt: typeof a.createdAt === 'string' ? a.createdAt : (a.createdAt as Date).toISOString()
    })) as Article[];
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const article = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
    if (!article[0]) return undefined;
    return {
      ...article[0],
      createdAt: typeof article[0].createdAt === 'string' ? article[0].createdAt : (article[0].createdAt as Date).toISOString()
    } as Article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(articlesTable).values({ id, ...article, createdAt: now }).returning();
    if (!result || result.length === 0) throw new Error("Article creation failed");
    return {
      ...result[0],
      createdAt: typeof result[0].createdAt === 'string' ? result[0].createdAt : (result[0].createdAt as Date).toISOString()
    } as Article;
  }

  async updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const result = await db.update(articlesTable).set(article).where(eq(articlesTable.id, id)).returning();
    if (!result[0]) return undefined;
    return {
      ...result[0],
      createdAt: typeof result[0].createdAt === 'string' ? result[0].createdAt : (result[0].createdAt as Date).toISOString()
    } as Article;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const result = await db.delete(articlesTable).where(eq(articlesTable.id, id));
    return true;
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    const members = await db.select().from(teamMembersTable);
    return members.map(m => ({
      ...m,
      createdAt: typeof m.createdAt === 'string' ? m.createdAt : (m.createdAt as Date).toISOString()
    })) as TeamMember[];
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const member = await db.select().from(teamMembersTable).where(eq(teamMembersTable.id, id)).limit(1);
    if (!member[0]) return undefined;
    return {
      ...member[0],
      createdAt: typeof member[0].createdAt === 'string' ? member[0].createdAt : (member[0].createdAt as Date).toISOString()
    } as TeamMember;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(teamMembersTable).values({ id, ...member, createdAt: now }).returning();
    if (!result || result.length === 0) throw new Error("Team member creation failed");
    return {
      ...result[0],
      createdAt: typeof result[0].createdAt === 'string' ? result[0].createdAt : (result[0].createdAt as Date).toISOString()
    } as TeamMember;
  }

  async updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const result = await db.update(teamMembersTable).set(member).where(eq(teamMembersTable.id, id)).returning();
    if (!result[0]) return undefined;
    return {
      ...result[0],
      createdAt: typeof result[0].createdAt === 'string' ? result[0].createdAt : (result[0].createdAt as Date).toISOString()
    } as TeamMember;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    await db.delete(teamMembersTable).where(eq(teamMembersTable.id, id));
    return true;
  }

  async getPricingPackages(): Promise<PricingPackage[]> {
    const packages = await db.select().from(pricingPackagesTable);
    return packages.map(pkg => {
      let features: string[] = [];
      if (typeof pkg.features === 'string') {
        try {
          features = JSON.parse(pkg.features);
        } catch {
          try {
            let unescaped = pkg.features;
            if (unescaped.startsWith('"') && unescaped.endsWith('"')) {
              unescaped = unescaped.slice(1, -1);
            }
            unescaped = unescaped.replace(/""/g, '"');
            features = JSON.parse(unescaped);
          } catch {
            features = [];
          }
        }
      } else if (Array.isArray(pkg.features)) {
        features = pkg.features;
      }
      
      return {
        ...pkg,
        features,
        price: typeof pkg.price === 'string' ? parseInt(pkg.price) : pkg.price,
        monthlyPrice: typeof pkg.monthlyPrice === 'string' ? parseInt(pkg.monthlyPrice) : pkg.monthlyPrice,
        yearlyPrice: typeof pkg.yearlyPrice === 'string' ? parseInt(pkg.yearlyPrice) : pkg.yearlyPrice,
        createdAt: typeof pkg.createdAt === 'string' ? pkg.createdAt : (pkg.createdAt as Date).toISOString()
      } as PricingPackage;
    });
  }

  async getPricingPackage(id: string): Promise<PricingPackage | undefined> {
    const pkg = await db.select().from(pricingPackagesTable).where(eq(pricingPackagesTable.id, id)).limit(1);
    if (!pkg[0]) return undefined;
    
    let features: string[] = [];
    if (typeof pkg[0].features === 'string') {
      try {
        features = JSON.parse(pkg[0].features);
      } catch {
        try {
          let unescaped = pkg[0].features;
          if (unescaped.startsWith('"') && unescaped.endsWith('"')) {
            unescaped = unescaped.slice(1, -1);
          }
          unescaped = unescaped.replace(/""/g, '"');
          features = JSON.parse(unescaped);
        } catch {
          features = [];
        }
      }
    } else if (Array.isArray(pkg[0].features)) {
      features = pkg[0].features;
    }
    
    return {
      ...pkg[0],
      features,
      price: typeof pkg[0].price === 'string' ? parseInt(pkg[0].price) : pkg[0].price,
      monthlyPrice: typeof pkg[0].monthlyPrice === 'string' ? parseInt(pkg[0].monthlyPrice) : pkg[0].monthlyPrice,
      yearlyPrice: typeof pkg[0].yearlyPrice === 'string' ? parseInt(pkg[0].yearlyPrice) : pkg[0].yearlyPrice,
      createdAt: typeof pkg[0].createdAt === 'string' ? pkg[0].createdAt : (pkg[0].createdAt as Date).toISOString()
    } as PricingPackage;
  }

  async createPricingPackage(pkg: InsertPricingPackage): Promise<PricingPackage> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(pricingPackagesTable).values({ 
      id, 
      ...pkg, 
      features: JSON.stringify(pkg.features),
      price: String(pkg.price),
      monthlyPrice: pkg.monthlyPrice ? String(pkg.monthlyPrice) : null,
      yearlyPrice: pkg.yearlyPrice ? String(pkg.yearlyPrice) : null,
      createdAt: now 
    }).returning();
    
    if (!result || result.length === 0) throw new Error("Pricing package creation failed");
    
    const created = result[0];
    return {
      ...created,
      features: typeof created.features === 'string' ? JSON.parse(created.features) : created.features,
      price: typeof created.price === 'string' ? parseInt(created.price) : created.price,
      monthlyPrice: created.monthlyPrice ? parseInt(created.monthlyPrice) : undefined,
      yearlyPrice: created.yearlyPrice ? parseInt(created.yearlyPrice) : undefined,
      createdAt: typeof created.createdAt === 'string' ? created.createdAt : (created.createdAt as Date).toISOString()
    } as PricingPackage;
  }

  async updatePricingPackage(id: string, pkg: Partial<InsertPricingPackage>): Promise<PricingPackage | undefined> {
    const updateData: any = { ...pkg };
    if (pkg.features) {
      updateData.features = JSON.stringify(pkg.features);
    }
    if (pkg.price !== undefined) {
      updateData.price = String(pkg.price);
    }
    if (pkg.monthlyPrice !== undefined) {
      updateData.monthlyPrice = pkg.monthlyPrice ? String(pkg.monthlyPrice) : null;
    }
    if (pkg.yearlyPrice !== undefined) {
      updateData.yearlyPrice = pkg.yearlyPrice ? String(pkg.yearlyPrice) : null;
    }
    if (pkg.oneTimePrice !== undefined) {
      updateData.oneTimePrice = pkg.oneTimePrice ? String(pkg.oneTimePrice) : null;
    }
    const result = await db.update(pricingPackagesTable).set(updateData).where(eq(pricingPackagesTable.id, id)).returning();
    if (!result[0]) return undefined;
    return {
      ...result[0],
      features: typeof result[0].features === 'string' ? JSON.parse(result[0].features) : result[0].features,
      price: typeof result[0].price === 'string' ? parseInt(result[0].price) : result[0].price,
      monthlyPrice: result[0].monthlyPrice ? parseInt(result[0].monthlyPrice) : undefined,
      yearlyPrice: result[0].yearlyPrice ? parseInt(result[0].yearlyPrice) : undefined,
      oneTimePrice: result[0].oneTimePrice ? parseInt(result[0].oneTimePrice) : undefined
    } as PricingPackage;
  }

  async deletePricingPackage(id: string): Promise<boolean> {
    await db.delete(pricingPackagesTable).where(eq(pricingPackagesTable.id, id));
    return true;
  }

  async getProjectDiscussion(): Promise<ProjectDiscussion | undefined> {
    const result = await db.select().from(projectDiscussionTable).limit(1);
    return result[0] as ProjectDiscussion | undefined;
  }

  async updateProjectDiscussion(data: InsertProjectDiscussion): Promise<ProjectDiscussion> {
    const existing = await this.getProjectDiscussion();
    if (existing) {
      const result = await db.update(projectDiscussionTable).set(data).where(eq(projectDiscussionTable.id, existing.id)).returning();
      return result[0] as ProjectDiscussion;
    }
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(projectDiscussionTable).values({ id, ...data, createdAt: now }).returning();
    return result[0] as ProjectDiscussion;
  }

  async getBookingRequests(): Promise<BookingRequest[]> {
    return db.select().from(bookingRequestsTable) as Promise<BookingRequest[]>;
  }

  async createBookingRequest(booking: InsertBookingRequest): Promise<BookingRequest> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(bookingRequestsTable).values({ id, ...booking, createdAt: now }).returning();
    return result[0] as BookingRequest;
  }

  async updateBookingRequest(id: string, booking: Partial<InsertBookingRequest>): Promise<BookingRequest | undefined> {
    const result = await db.update(bookingRequestsTable).set(booking).where(eq(bookingRequestsTable.id, id)).returning();
    return result[0] as BookingRequest | undefined;
  }

  async deleteBookingRequest(id: string): Promise<boolean> {
    await db.delete(bookingRequestsTable).where(eq(bookingRequestsTable.id, id));
    return true;
  }

  async resetBookingRequests(): Promise<void> {
    await db.delete(bookingRequestsTable);
  }

  async getOneTimePricingRequests(): Promise<OneTimePricingRequest[]> {
    return db.select().from(oneTimePricingRequestsTable) as Promise<OneTimePricingRequest[]>;
  }

  async createOneTimePricingRequest(request: InsertOneTimePricingRequest): Promise<OneTimePricingRequest> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(oneTimePricingRequestsTable).values({ 
      id, 
      ...request, 
      estimatedPrice: String(request.estimatedPrice),
      createdAt: now 
    }).returning();
    return {
      ...result[0],
      estimatedPrice: typeof result[0].estimatedPrice === 'string' ? parseInt(result[0].estimatedPrice) : result[0].estimatedPrice
    } as OneTimePricingRequest;
  }

  async updateOneTimePricingRequest(id: string, request: Partial<InsertOneTimePricingRequest>): Promise<OneTimePricingRequest | undefined> {
    const updateData: any = { ...request };
    if (request.estimatedPrice !== undefined) {
      updateData.estimatedPrice = String(request.estimatedPrice);
    }
    const result = await db.update(oneTimePricingRequestsTable).set(updateData).where(eq(oneTimePricingRequestsTable.id, id)).returning();
    if (!result[0]) return undefined;
    return {
      ...result[0],
      estimatedPrice: typeof result[0].estimatedPrice === 'string' ? parseInt(result[0].estimatedPrice) : result[0].estimatedPrice
    } as OneTimePricingRequest;
  }

  async deleteOneTimePricingRequest(id: string): Promise<boolean> {
    await db.delete(oneTimePricingRequestsTable).where(eq(oneTimePricingRequestsTable.id, id));
    return true;
  }

  async getSettings(): Promise<SiteSettings> {
    const result = await db.select().from(siteSettingsTable).limit(1);
    if (result[0]) {
      const settings = result[0];
      return {
        ...settings,
        socialLinks: typeof settings.socialLinks === 'string' ? JSON.parse(settings.socialLinks) : settings.socialLinks,
      } as SiteSettings;
    }
    return {} as SiteSettings;
  }

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    try {
      const existing = await this.getSettings();
      
      const dataToSave: any = { ...settings };
      if (settings.socialLinks && typeof settings.socialLinks === 'object') {
        dataToSave.socialLinks = JSON.stringify(settings.socialLinks);
      }
      
      if (existing && existing.id) {
        const result = await db.update(siteSettingsTable).set(dataToSave).where(eq(siteSettingsTable.id, existing.id)).returning();
        if (!result[0]) {
          throw new Error("Update returned no results");
        }
        const updated = result[0];
        return {
          ...updated,
          socialLinks: typeof updated.socialLinks === 'string' ? JSON.parse(updated.socialLinks) : updated.socialLinks,
        } as SiteSettings;
      }
      
      // Create new record with defaults for required fields
      const id = randomUUID();
      const newSettings = {
        id,
        companyName: settings.companyName || "VyomAi Cloud Pvt. Ltd",
        tagline: settings.tagline || "AI Solutions Platform",
        email: settings.email || "info@vyomai.cloud",
        address: settings.address || "Tokha, Kathmandu, Nepal",
        aboutText: settings.aboutText || "Welcome to VyomAi",
        missionText: settings.missionText || "Empowering businesses with AI",
        socialLinks: dataToSave.socialLinks || JSON.stringify({}),
        ...dataToSave,
      };
      
      const result = await db.insert(siteSettingsTable).values(newSettings).returning();
      if (!result[0]) {
        throw new Error("Insert returned no results");
      }
      const created = result[0];
      return {
        ...created,
        socialLinks: typeof created.socialLinks === 'string' ? JSON.parse(created.socialLinks) : created.socialLinks,
      } as SiteSettings;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("DB: updateSettings error:", error);
      }
      throw error;
    }
  }

  async getVisitorStats(): Promise<VisitorStats> {
    const result = await db.select().from(visitorStatsTable).limit(1);
    if (result[0]) {
      const stats = result[0];
      return {
        totalVisitors: typeof stats.totalVisitors === 'string' ? parseInt(stats.totalVisitors) : stats.totalVisitors,
        todayVisitors: typeof stats.todayVisitors === 'string' ? parseInt(stats.todayVisitors) : stats.todayVisitors,
        hourlyData: stats.hourlyData ? JSON.parse(stats.hourlyData) : [],
        trafficSources: stats.trafficSources ? JSON.parse(stats.trafficSources) : [],
        deviceTypes: stats.deviceTypes ? JSON.parse(stats.deviceTypes) : [],
        engagementMetrics: stats.engagementMetrics ? JSON.parse(stats.engagementMetrics) : [],
        topPages: stats.topPages ? JSON.parse(stats.topPages) : [],
        socialMediaStats: stats.socialMediaStats ? JSON.parse(stats.socialMediaStats) : [],
      } as VisitorStats;
    }
    return {} as VisitorStats;
  }

  async updateVisitorStats(data: Partial<VisitorStats>): Promise<VisitorStats> {
    try {
      const existing = await db.select().from(visitorStatsTable).limit(1);
      const updateData: any = {};
      
      if (data.totalVisitors !== undefined) updateData.totalVisitors = String(data.totalVisitors);
      if (data.todayVisitors !== undefined) updateData.todayVisitors = String(data.todayVisitors);
      if (data.hourlyData !== undefined) updateData.hourlyData = JSON.stringify(data.hourlyData);
      if (data.trafficSources !== undefined) updateData.trafficSources = JSON.stringify(data.trafficSources);
      if (data.deviceTypes !== undefined) updateData.deviceTypes = JSON.stringify(data.deviceTypes);
      if (data.engagementMetrics !== undefined) updateData.engagementMetrics = JSON.stringify(data.engagementMetrics);
      if (data.topPages !== undefined) updateData.topPages = JSON.stringify(data.topPages);
      if (data.socialMediaStats !== undefined) updateData.socialMediaStats = JSON.stringify(data.socialMediaStats);

      if (existing.length > 0 && existing[0].id) {
        await db.update(visitorStatsTable).set(updateData).where(eq(visitorStatsTable.id, existing[0].id));
      } else {
        const id = randomUUID();
        await db.insert(visitorStatsTable).values({
          id,
          totalVisitors: updateData.totalVisitors || "0",
          todayVisitors: updateData.todayVisitors || "0",
          hourlyData: updateData.hourlyData || "[]",
          trafficSources: updateData.trafficSources || "[]",
          deviceTypes: updateData.deviceTypes || "[]",
          engagementMetrics: updateData.engagementMetrics || "[]",
          topPages: updateData.topPages || "[]",
          socialMediaStats: updateData.socialMediaStats || "[]",
        });
      }
      return this.getVisitorStats();
    } catch (error) {
      console.error("DB: updateVisitorStats error:", error);
      throw error;
    }
  }

  async incrementVisitors(): Promise<VisitorStats> {
    const stats = await this.getVisitorStats();
    return this.updateVisitorStats({
      totalVisitors: (stats.totalVisitors || 0) + 1,
      todayVisitors: (stats.todayVisitors || 0) + 1,
    });
  }

  async resetHourlyData(): Promise<VisitorStats> {
    return this.updateVisitorStats({ hourlyData: [] });
  }

  async resetTrafficSources(): Promise<VisitorStats> {
    return this.updateVisitorStats({ trafficSources: [] });
  }

  async resetDeviceTypes(): Promise<VisitorStats> {
    return this.updateVisitorStats({ deviceTypes: [] });
  }

  async resetTopPages(): Promise<VisitorStats> {
    return this.updateVisitorStats({ topPages: [] });
  }

  async resetEngagementMetrics(): Promise<VisitorStats> {
    return this.updateVisitorStats({ engagementMetrics: [] });
  }

  async resetSocialMediaStats(): Promise<VisitorStats> {
    return this.updateVisitorStats({ socialMediaStats: [] });
  }

  async resetTotalVisitors(): Promise<VisitorStats> {
    return this.updateVisitorStats({ totalVisitors: 0, todayVisitors: 0 });
  }

  async getSocialMediaAnalytics(): Promise<SocialMediaAnalytics[]> {
    return db.select().from(socialMediaAnalyticsTable) as Promise<SocialMediaAnalytics[]>;
  }

  async getSocialMediaAnalytic(platform: string): Promise<SocialMediaAnalytics | undefined> {
    const result = await db.select().from(socialMediaAnalyticsTable).where(eq(socialMediaAnalyticsTable.platform, platform)).limit(1);
    return result[0] as SocialMediaAnalytics | undefined;
  }

  async updateSocialMediaAnalytics(platform: string, data: Partial<InsertSocialMediaAnalytics>): Promise<SocialMediaAnalytics> {
    const existing = await this.getSocialMediaAnalytic(platform);
    if (existing) {
      const result = await db.update(socialMediaAnalyticsTable).set(data).where(eq(socialMediaAnalyticsTable.platform, platform)).returning();
      return result[0] as SocialMediaAnalytics;
    }
    const id = randomUUID();
    const insertData = {
      id,
      platform,
      engagementRate: data.engagementRate || "0",
      followersCount: data.followersCount || "0",
      postsCount: data.postsCount || "0",
      impressions: data.impressions || "0",
      likes: data.likes || "0",
      shares: data.shares || "0",
      comments: data.comments || "0",
    };
    const result = await db.insert(socialMediaAnalyticsTable).values(insertData as any).returning();
    return result[0] as SocialMediaAnalytics;
  }

  async resetSocialMediaAnalytics(): Promise<void> {
    await db.delete(socialMediaAnalyticsTable);
  }

  async getSocialMediaIntegrations(): Promise<SocialMediaIntegration[]> {
    return db.select().from(socialMediaIntegrationsTable) as Promise<SocialMediaIntegration[]>;
  }

  async getSocialMediaIntegration(platform: string): Promise<SocialMediaIntegration | undefined> {
    const result = await db.select().from(socialMediaIntegrationsTable).where(eq(socialMediaIntegrationsTable.platform, platform)).limit(1);
    return result[0] as SocialMediaIntegration | undefined;
  }

  async updateSocialMediaIntegration(platform: string, data: Partial<InsertSocialMediaIntegration>): Promise<SocialMediaIntegration> {
    const existing = await this.getSocialMediaIntegration(platform);
    if (existing) {
      const result = await db.update(socialMediaIntegrationsTable).set({ ...data, updatedAt: new Date() } as any).where(eq(socialMediaIntegrationsTable.platform, platform)).returning();
      return result[0] as SocialMediaIntegration;
    }
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(socialMediaIntegrationsTable).values({ id, platform: platform as any, ...data, createdAt: now, updatedAt: now } as any).returning();
    return result[0] as SocialMediaIntegration;
  }

  async getCustomerInquiries(): Promise<CustomerInquiry[]> {
    return db.select().from(customerInquiriesTable) as Promise<CustomerInquiry[]>;
  }

  async createCustomerInquiry(inquiry: InsertCustomerInquiry): Promise<CustomerInquiry> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(customerInquiriesTable).values({ id, ...inquiry, createdAt: now } as any).returning();
    return {
      ...result[0],
      createdAt: typeof result[0].createdAt === 'string' ? result[0].createdAt : (result[0].createdAt as Date).toISOString()
    } as CustomerInquiry;
  }

  async updateCustomerInquiry(id: string, inquiry: Partial<InsertCustomerInquiry>): Promise<CustomerInquiry | undefined> {
    const result = await db.update(customerInquiriesTable).set(inquiry).where(eq(customerInquiriesTable.id, id)).returning();
    return result[0] as CustomerInquiry | undefined;
  }

  async deleteCustomerInquiry(id: string): Promise<boolean> {
    await db.delete(customerInquiriesTable).where(eq(customerInquiriesTable.id, id));
    return true;
  }

  private resetCodeMap = new Map<string, { code: string; expiresAt: number }>();

  async storeResetCode(email: string, code: string): Promise<void> {
    const expiresAt = Date.now() + 15 * 60 * 1000;
    this.resetCodeMap.set(email, { code, expiresAt });
    setTimeout(() => this.resetCodeMap.delete(email), 15 * 60 * 1000);
  }

  async verifyResetCode(email: string, code: string): Promise<boolean> {
    const stored = this.resetCodeMap.get(email);
    if (!stored) return false;
    if (Date.now() > stored.expiresAt) {
      this.resetCodeMap.delete(email);
      return false;
    }
    const isValid = stored.code === code;
    if (isValid) {
      this.resetCodeMap.delete(email);
    }
    return isValid;
  }

  // Popup Forms Methods
  async getPopupForms(): Promise<PopupForm[]> {
    return db.select().from(popupFormsTable) as Promise<PopupForm[]>;
  }

  async getPopupForm(id: string): Promise<PopupForm | undefined> {
    const result = await db.select().from(popupFormsTable).where(eq(popupFormsTable.id, id));
    return result[0] as PopupForm | undefined;
  }

  async getActivePopupForm(): Promise<PopupForm | undefined> {
    const result = await db.select().from(popupFormsTable).where(eq(popupFormsTable.enabled, true));
    return result[0] as PopupForm | undefined;
  }

  async createPopupForm(form: InsertPopupForm): Promise<PopupForm> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(popupFormsTable).values({ 
      id, 
      ...form, 
      createdAt: now,
      updatedAt: now 
    } as any).returning();
    return result[0] as PopupForm;
  }

  async updatePopupForm(id: string, form: Partial<InsertPopupForm>): Promise<PopupForm | undefined> {
    const result = await db.update(popupFormsTable)
      .set({ ...form, updatedAt: new Date() } as any)
      .where(eq(popupFormsTable.id, id))
      .returning();
    return result[0] as PopupForm | undefined;
  }

  async deletePopupForm(id: string): Promise<boolean> {
    await db.delete(popupFormsTable).where(eq(popupFormsTable.id, id));
    return true;
  }
}
