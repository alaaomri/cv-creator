import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { memoryUsers, UserRecord, getPrisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "cv_studio_cloud_jwt_super_secret_key_2026";
const COOKIE_NAME = "token";

export interface AuthPayload {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: "USER" | "ADMIN";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// Generate JWT token
export function signToken(user: { id: string; email: string; username: string; fullName: string; role: "USER" | "ADMIN" }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Verify JWT token
export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (err) {
    return null;
  }
}

// Set HttpOnly secure Cookie
export function setAuthCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}

// Clear HttpOnly Cookie
export function clearAuthCookie(res: Response) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
}

// Sanitize user object for client consumption (strip passwordHash)
export function sanitizeUser(user: UserRecord | any) {
  if (!user) return null;
  const { passwordHash, ...clean } = user;
  return clean;
}

// Auth Middleware: extracts JWT from HttpOnly cookie, Authorization Bearer header, or query token
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.[COOKIE_NAME];

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.substring(7).trim();
  }

  if (!token && typeof req.query?.token === "string" && req.query.token) {
    token = req.query.token.trim();
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}

// Guard: Enforce logged in user
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentification requise. Veuillez vous connecter.",
      code: "UNAUTHORIZED",
    });
  }
  next();
}

// Guard: Enforce ADMIN role
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentification requise pour accéder à l'espace d'administration.",
      code: "UNAUTHORIZED",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: "Accès refusé. Privilèges Administrateur (ADMIN) requis.",
      code: "FORBIDDEN_ROLE",
      currentUserRole: req.user.role,
    });
  }

  next();
}

// Helper: Normalize and validate username format
export function isValidUsernameFormat(username: string): boolean {
  if (!username || typeof username !== "string") return false;
  // Length 3-30, lowercase letters, digits, hyphen, underscore
  const re = /^[a-z0-9_-]{3,30}$/;
  return re.test(username.toLowerCase().trim());
}

// Find user by username (Prisma or Memory)
export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const clean = username.toLowerCase().trim();
  const prisma = getPrisma();
  if (prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { username: clean } });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          passwordHash: user.passwordHash,
          fullName: user.fullName,
          role: user.role as "USER" | "ADMIN",
          avatarUrl: user.avatarUrl || undefined,
          isActive: user.isActive ?? true,
          disabledAt: user.disabledAt ? user.disabledAt.toISOString() : undefined,
          disabledReason: user.disabledReason || undefined,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      }
    } catch (e) {
      // Fallback
    }
  }

  for (const user of memoryUsers.values()) {
    if (user.username && user.username.toLowerCase() === clean) {
      return user;
    }
  }
  return null;
}

// Find user by email (Prisma or Memory)
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          username: user.username || user.email.split('@')[0],
          passwordHash: user.passwordHash,
          fullName: user.fullName,
          role: user.role as "USER" | "ADMIN",
          avatarUrl: user.avatarUrl || undefined,
          isActive: user.isActive ?? true,
          disabledAt: user.disabledAt ? user.disabledAt.toISOString() : undefined,
          disabledReason: user.disabledReason || undefined,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      }
    } catch (e) {
      // Fallback
    }
  }

  for (const user of memoryUsers.values()) {
    if (user.email.toLowerCase() === email.toLowerCase().trim()) {
      return user;
    }
  }
  return null;
}

// Find user by ID (Prisma or Memory)
export async function findUserById(id: string): Promise<UserRecord | null> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          username: user.username || user.email.split('@')[0],
          passwordHash: user.passwordHash,
          fullName: user.fullName,
          role: user.role as "USER" | "ADMIN",
          avatarUrl: user.avatarUrl || undefined,
          isActive: user.isActive ?? true,
          disabledAt: user.disabledAt ? user.disabledAt.toISOString() : undefined,
          disabledReason: user.disabledReason || undefined,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      }
    } catch (e) {
      // Fallback
    }
  }

  return memoryUsers.get(id) || null;
}

// Create new user
export async function createUser(data: {
  email: string;
  username?: string;
  password: string;
  fullName: string;
  role?: "USER" | "ADMIN";
  avatarUrl?: string;
}): Promise<UserRecord> {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);
  const now = new Date().toISOString();
  const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const role = data.role || "USER";

  // Clean or derive username
  let cleanUsername = (data.username || data.fullName.toLowerCase().replace(/[^a-z0-9]/g, "-"))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);

  if (cleanUsername.length < 3) {
    cleanUsername = `user-${Math.random().toString(36).substring(2, 7)}`;
  }

  const newUser: UserRecord = {
    id,
    email: data.email.toLowerCase().trim(),
    username: cleanUsername,
    passwordHash,
    fullName: data.fullName.trim(),
    role,
    avatarUrl: data.avatarUrl,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const prisma = getPrisma();
  if (prisma) {
    try {
      const created = await prisma.user.create({
        data: {
          id,
          email: newUser.email,
          username: newUser.username,
          passwordHash: newUser.passwordHash,
          fullName: newUser.fullName,
          role: newUser.role,
          avatarUrl: newUser.avatarUrl,
          isActive: true,
        },
      });
      newUser.createdAt = created.createdAt.toISOString();
      newUser.updatedAt = created.updatedAt.toISOString();
    } catch (e) {
      // Fallback in memory
    }
  }

  memoryUsers.set(id, newUser);
  return newUser;
}
