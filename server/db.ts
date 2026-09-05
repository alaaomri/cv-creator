import bcrypt from "bcryptjs";
import { createRequire } from "node:module";
import path from "node:path";

// Load CJS-only Prisma packages in both ESM (tsx dev) and the CJS bundle (prod).
// Basing the require on package.json avoids import.meta (invalid in CJS output).
const nodeRequire = createRequire(path.join(process.cwd(), "package.json"));

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
  securityConfig?: {
    isProtected?: boolean;
    hasPassword?: boolean;
    maskContactInfo?: boolean;
    expiresAt?: string;
    pinHint?: string;
  };
  passwordHash?: string;
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
      const { PrismaClient } = nodeRequire("@prisma/client");
      const { PrismaPg } = nodeRequire("@prisma/adapter-pg");
      // Prisma 7 requires a driver adapter; the connection URL is passed here
      // (the `datasources` constructor option was removed in v7).
      const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
      prismaInstance = new PrismaClient({ adapter });
      // Prisma connects lazily on the first query, so the client is usable
      // immediately. We still trigger an eager connection for faster warm-up
      // and clearer logs, but we never gate usage on it (that previously made
      // every early request fall back to the in-memory store and lose data).
      isPrismaConnected = true;
      prismaInstance
        .$connect()
        .then(() => console.log("[PostgreSQL / Supabase] Prisma connected successfully."))
        .catch((err: any) =>
          console.warn("[PostgreSQL / Supabase] Prisma connect warning (queries still attempted):", err.message)
        );
    } catch (e: any) {
      console.warn("[Prisma] Init failed, using in-memory store:", e.message);
      prismaInstance = null;
      isPrismaConnected = false;
      return null;
    }
  }
  return prismaInstance;
}

export function isDbConnected(): boolean {
  return isPrismaConnected;
}

// Map a Prisma user row into the in-memory UserRecord shape
function mapPrismaUser(user: any): UserRecord {
  return {
    id: user.id,
    email: user.email,
    username: user.username || user.email.split("@")[0],
    passwordHash: user.passwordHash,
    fullName: user.fullName,
    role: user.role as "USER" | "ADMIN",
    avatarUrl: user.avatarUrl || undefined,
    isActive: user.isActive ?? true,
    disabledAt: user.disabledAt ? new Date(user.disabledAt).toISOString() : undefined,
    disabledReason: user.disabledReason || undefined,
    createdAt: new Date(user.createdAt).toISOString(),
    updatedAt: new Date(user.updatedAt).toISOString(),
  };
}

// Load every persisted user from Postgres into the in-memory mirror so that
// admin listings and role/status mutations survive rebuilds & redeploys.
async function hydrateUsersFromDb(): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;
  try {
    const rows = await prisma.user.findMany();
    for (const row of rows) {
      const mapped = mapPrismaUser(row);
      memoryUsers.set(mapped.id, mapped);
    }
    console.log(`[DB] Hydrated ${rows.length} user(s) from Postgres.`);
    return true;
  } catch (e: any) {
    console.warn("[DB] User hydration failed (using in-memory store):", e.message);
    return false;
  }
}

// Seed the default admin account ONCE. This is idempotent: if an admin already
// exists (in Postgres or memory) it is never overwritten, so shared-database
// data is preserved across restarts instead of being re-initialized.
export async function seedInitialDatabase() {
  const dbAvailable = await hydrateUsersFromDb();

  const adminAlreadyExists = Array.from(memoryUsers.values()).some(
    (u) => u.email === "admin@cvstudio.cloud" || u.role === "ADMIN"
  );

  if (adminAlreadyExists) {
    console.log("[Auth & DB] Admin account already present — skipping seed (data preserved).");
    return;
  }

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

  const prisma = getPrisma();
  if (dbAvailable && prisma) {
    try {
      await prisma.user.upsert({
        where: { email: adminUser.email },
        update: {},
        create: {
          id: adminUser.id,
          email: adminUser.email,
          username: adminUser.username,
          passwordHash: adminUser.passwordHash,
          fullName: adminUser.fullName,
          role: adminUser.role,
          isActive: true,
        },
      });
    } catch (e: any) {
      console.warn("[DB] Admin persist failed (kept in memory):", e.message);
    }
  }

  memoryUsers.set(adminUser.id, adminUser);
  console.log("[Auth & DB] Initialized admin security account (admin@cvstudio.cloud)");
}
