import bcrypt from "bcryptjs";

// In-memory User Interface
export interface UserRecord {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  fullName: string;
  role: "USER" | "ADMIN";
  avatarUrl?: string;
  isActive: boolean;
  disabledAt?: string;
  disabledReason?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory CV Interface
export interface StoredCV {
  id: string;
  userId?: string;
  slug: string;
  title: string;
  isPublished: boolean;
  publishedAt?: string;
  viewCount: number;
  lastViewedAt?: string;
  data: any;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  version: number;
  updatedAt: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  userId?: string;
  type: string;
  title: string;
  details: string;
  cvId?: string;
  candidateName?: string;
  timestamp: string;
}

// Global In-Memory Fallback Stores
export const memoryUsers = new Map<string, UserRecord>();
export const memoryCVs = new Map<string, StoredCV>();
export const memoryLogs: ActivityLogItem[] = [];

// Redis simulation cache
export const redisCache = new Map<string, { value: any; expiresAt: number }>();

export function getCache(key: string) {
  const item = redisCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    redisCache.delete(key);
    return null;
  }
  return item.value;
}

export function setCache(key: string, value: any, ttlSeconds = 60) {
  redisCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function invalidateCache(key: string) {
  redisCache.delete(key);
}

// Prisma Client (PostgreSQL / Supabase) with lazy initialization & resilient typing
let prismaInstance: any = null;
let isPrismaConnected = false;

export function getPrisma(): any {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!prismaInstance) {
    try {
      // Dynamic require to prevent compilation issues when Prisma client has not been generated
      const { PrismaClient } = require("@prisma/client");
      prismaInstance = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
      prismaInstance.$connect()
        .then(() => {
          isPrismaConnected = true;
          console.log("[PostgreSQL / Supabase] Prisma connected successfully.");
        })
        .catch((err: any) => {
          console.warn("[PostgreSQL / Supabase] Could not connect, falling back to memory store:", err.message);
          isPrismaConnected = false;
        });
    } catch (e: any) {
      console.warn("[Prisma] Init warning:", e.message);
    }
  }
  return isPrismaConnected ? prismaInstance : null;
}

export function isDbConnected(): boolean {
  return isPrismaConnected;
}

// Seed initial admin user
export async function seedInitialDatabase() {
  const adminSalt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash("AdminSecret2026!", adminSalt);

  const adminUser: UserRecord = {
    id: "usr-admin-1",
    email: "admin@cvstudio.cloud",
    username: "admin",
    passwordHash: adminHash,
    fullName: "Super Administrateur",
    role: "ADMIN",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryUsers.set(adminUser.id, adminUser);
  console.log("[Auth & DB] Initialized admin security account (admin@cvstudio.cloud)");
}
