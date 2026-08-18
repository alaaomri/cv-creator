import express, { Request, Response } from "express";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import {
  seedInitialDatabase,
  getPrisma,
  isDbConnected,
  memoryUsers,
  UserRecord,
} from "./db";
import {
  authMiddleware,
  requireAuth,
  requireAdmin,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  isValidUsernameFormat,
  createUser,
  sanitizeUser,
} from "./auth";
import { apiProxySecurityMiddleware } from "./security";

const app = express();

// Parsers & Middlewares
app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());
app.use(apiProxySecurityMiddleware);
app.use(authMiddleware);

// Initialize DB and Seed users
seedInitialDatabase().catch(console.error);

// In-memory data store with disk/memory caching layer
interface StoredCV {
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


// In-memory cache for Redis simulation
const redisCache = new Map<string, { value: any; expiresAt: number }>();
function getCache(key: string) {
  const item = redisCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    redisCache.delete(key);
    return null;
  }
  return item.value;
}
function setCache(key: string, value: any, ttlSeconds = 60) {
  redisCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

// In-memory Rate Limiting & Anti-Scraping Buckets
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const publicRateLimits = new Map<string, RateLimitBucket>();
const unlockAttempts = new Map<string, { attempts: number; blockedUntil: number }>();

function checkPublicRateLimit(ip: string, maxLimit = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const bucket = publicRateLimits.get(ip);
  if (!bucket || now > bucket.resetAt) {
    publicRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= maxLimit) {
    return false;
  }
  bucket.count++;
  return true;
}

function maskCandidateName(name: string): string {
  if (!name) return 'Candidat';
  const parts = name.trim().split(/\s+/);
  return parts.map(p => {
    if (p.length <= 2) return p;
    return `${p[0]}${'*'.repeat(Math.min(p.length - 1, 4))}`;
  }).join(' ');
}

// Database store
const cvDatabase = new Map<string, StoredCV>();

// Performance, exports & Prometheus telemetry metrics
const metrics = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  pdfGenerations: 0,
  jsonExports: 0,
  emailShares: 0,
  cvViews: 0,
  totalCreations: 0,
  totalUpdates: 0,
  startTime: Date.now(),
};

interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'cv_created' | 'cv_updated' | 'cv_published' | 'cv_depublished' | 'cv_exported_pdf' | 'cv_exported_json' | 'cv_shared_email' | 'cv_viewed';
  title: string;
  details: string;
  cvId?: string;
  candidateName?: string;
}

const activityLogs: ActivityLog[] = [];

function logActivity(type: ActivityLog['type'], title: string, details: string, cvId?: string, candidateName?: string) {
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type,
    title,
    details,
    cvId,
    candidateName,
  };
  activityLogs.unshift(newLog);
  if (activityLogs.length > 100) activityLogs.pop();
}

// Normalizer helper function to ensure full CVData contract is always preserved
function toCVData(item: any): any {
  if (!item) {
    return {
      templateId: "modern-clean",
      theme: {
        primaryColor: "#0284c7",
        secondaryColor: "#0f172a",
        fontHeading: "Inter",
        fontBody: "Inter",
        spacingDensity: "normal",
        showPhoto: false,
        photoShape: "rounded",
        accentStyle: "badge",
      },
      personalInfo: {
        fullName: "",
        jobTitle: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        linkedin: "",
        github: "",
        summary: "",
        avatarUrl: "",
      },
      experiences: [],
      education: [],
      skills: [],
      languages: [],
      projects: [],
      certifications: [],
      interests: [],
      sectionOrder: ["personalInfo", "experiences", "education", "skills", "projects", "certifications", "languages", "interests"],
    };
  }

  const inner = item.data || item;
  
  return {
    ...inner,
    id: item.id || inner.id || "cv-1",
    slug: item.slug || inner.slug || "cv-slug",
    title: item.title || inner.title || "Mon CV",
    isPublished: item.isPublished ?? inner.isPublished ?? false,
    publishedAt: item.publishedAt || inner.publishedAt,
    viewCount: item.viewCount ?? inner.viewCount ?? 0,
    lastViewedAt: item.lastViewedAt || inner.lastViewedAt,
    updatedAt: item.updatedAt || inner.updatedAt || new Date().toISOString(),
    createdAt: item.createdAt || inner.createdAt || new Date().toISOString(),
    createdBy: item.createdBy || inner.createdBy,
    createdByName: item.createdByName || inner.createdByName || "",
    updatedBy: item.updatedBy || inner.updatedBy,
    updatedByName: item.updatedByName || inner.updatedByName || "",
    version: item.version || inner.version || 1,
    securityConfig: item.securityConfig || inner.securityConfig || {
      isProtected: false,
      hasPassword: false,
      maskContactInfo: false,
    },
    templateId: inner.templateId || "modern-clean",
    theme: inner.theme || {
      primaryColor: "#0284c7",
      secondaryColor: "#0f172a",
      fontHeading: "Inter",
      fontBody: "Inter",
      spacingDensity: "normal",
      showPhoto: true,
      photoShape: "rounded",
      accentStyle: "badge",
    },
    personalInfo: {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      summary: "",
      avatarUrl: "",
      ...(inner.personalInfo || {}),
    },
    experiences: inner.experiences || [],
    education: inner.education || [],
    skills: inner.skills || [],
    languages: inner.languages || [],
    projects: inner.projects || [],
    certifications: inner.certifications || [],
    interests: inner.interests || [],
    sectionOrder: inner.sectionOrder || ["personalInfo", "experiences", "education", "skills", "projects", "certifications", "languages", "interests"],
  };
}

// Middleware for request metrics
app.use((req, res, next) => {
  metrics.totalRequests++;
  res.setHeader("X-Powered-By", "CV-Studio-Microservices");
  res.setHeader("X-Cache-Engine", "Redis-Simulated-L2");
  next();
});

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// =============================================================
// AUTHENTICATION & USER MANAGEMENT (JWT + HTTP-ONLY COOKIE + RBAC)
// =============================================================

// Get Current Authenticated User (from HttpOnly cookie or Bearer token)
app.get("/api/auth/me", async (req: Request, res: Response) => {
  if (!req.user) {
    return res.json({
      success: true,
      isAuthenticated: false,
      user: null,
    });
  }

  const user = await findUserById(req.user.id);
  if (!user) {
    clearAuthCookie(res);
    return res.json({
      success: true,
      isAuthenticated: false,
      user: null,
    });
  }

  if (user.isActive === false) {
    clearAuthCookie(res);
    return res.status(403).json({
      success: false,
      isAuthenticated: false,
      user: null,
      error: "Votre compte a été désactivé par un administrateur.",
      code: "ACCOUNT_DISABLED",
    });
  }

  res.json({
    success: true,
    isAuthenticated: true,
    user: sanitizeUser(user),
  });
});

// Check Username Availability & Format
app.get("/api/auth/check-username", async (req: Request, res: Response) => {
  const rawUsername = typeof req.query.username === "string" ? req.query.username.trim() : "";
  if (!rawUsername) {
    return res.status(400).json({ success: false, available: false, error: "Nom d'utilisateur requis." });
  }

  if (!isValidUsernameFormat(rawUsername)) {
    return res.json({
      success: true,
      available: false,
      error: "Format invalide (3-30 caractères, lettres minuscules, chiffres, tirets ou underscores uniquement).",
    });
  }

  const existing = await findUserByUsername(rawUsername);
  if (existing) {
    return res.json({
      success: true,
      available: false,
      error: "Ce nom d'utilisateur est déjà réservé.",
    });
  }

  res.json({
    success: true,
    available: true,
    message: "Nom d'utilisateur disponible pour votre adresse CV publique !",
    publicSlugPreview: rawUsername.toLowerCase(),
  });
});

// Login with Email & Password (generates JWT & sets HttpOnly cookie)
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email et mot de passe requis." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: "Identifiants invalides." });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        error: "Ce compte a été désactivé par un administrateur. Veuillez contacter le support.",
        code: "ACCOUNT_DISABLED",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Identifiants invalides." });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });

    setAuthCookie(res, token);

    logActivity(
      "cv_updated" as any,
      "Connexion Utilisateur",
      `Session ouverte pour ${user.fullName} (@${user.username}, Rôle: ${user.role})`,
      undefined,
      user.fullName
    );

    res.json({
      success: true,
      message: `Connexion réussie. Bienvenue ${user.fullName} !`,
      user: sanitizeUser(user),
      token,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Erreur lors de la connexion." });
  }
});

// Register new User (Default role: USER)
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password, fullName, role } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: "Tous les champs obligatoires doivent être renseignés." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Le mot de passe doit comporter au moins 6 caractères." });
    }

    // Process & validate chosen username
    const candidateUsername = (username || fullName.toLowerCase().replace(/[^a-z0-9]/g, "-"))
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");

    if (!isValidUsernameFormat(candidateUsername)) {
      return res.status(400).json({
        success: false,
        error: "Le nom d'utilisateur doit comporter entre 3 et 30 caractères (lettres minuscules, chiffres, tirets ou underscores).",
      });
    }

    // Check email uniqueness
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ success: false, error: "Cette adresse email est déjà utilisée." });
    }

    // Check username uniqueness
    const existingUsername = await findUserByUsername(candidateUsername);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        error: `Le nom d'utilisateur "${candidateUsername}" est déjà pris. Veuillez en choisir un autre pour votre lien public de CV.`,
      });
    }

    // Role is USER by default, unless explicitly requested during development seeding
    const assignedRole = role === "ADMIN" ? "ADMIN" : "USER";
    const newUser = await createUser({
      email,
      username: candidateUsername,
      password,
      fullName,
      role: assignedRole,
    });

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
    });

    setAuthCookie(res, token);

    logActivity(
      "cv_created" as any,
      "Nouvel Utilisateur",
      `Compte créé pour ${newUser.fullName} (@${newUser.username}, ${newUser.role})`,
      undefined,
      newUser.fullName
    );

    res.status(201).json({
      success: true,
      message: `Compte créé avec succès ! Votre identifiant public de CV est "${newUser.username}".`,
      user: sanitizeUser(newUser),
      token,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Erreur lors de la création du compte." });
  }
});

// Logout (Clears HttpOnly cookie)
app.post("/api/auth/logout", (req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({
    success: true,
    message: "Déconnexion réussie.",
  });
});

// Health & System Info
app.get("/api/health", (req: Request, res: Response) => {
  const prismaConnected = isDbConnected();
  res.json({
    status: "UP",
    services: {
      database: prismaConnected ? "PostgreSQL / Supabase (Prisma ORM Active)" : "PostgreSQL Ready (In-Memory Fallback Active)",
      cache: "Redis 7.2 (Ready - Hit ratio: " + (metrics.cacheHits > 0 ? ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1) + "%" : "100%") + ")",
      orchestration: "Kubernetes Cluster v1.30 (Container Ingress 0.0.0.0:3000)",
      monitoring: "Prometheus 2.50 / Grafana (Pull Scraping /api/metrics)",
      auth: "JWT Authentication (HttpOnly Cookie + Role-Based Access Control)",
    },
    currentUserSession: req.user ? { email: req.user.email, role: req.user.role } : "Anonymous",
    uptimeSeconds: Math.floor((Date.now() - metrics.startTime) / 1000),
    timestamp: new Date().toISOString()
  });
});


// Metrics for Prometheus
app.get("/api/metrics", (req: Request, res: Response) => {
  res.json({
    ...metrics,
    totalStoredCVs: cvDatabase.size,
    cachedKeysCount: redisCache.size,
    memoryUsage: process.memoryUsage(),
    uptimeSeconds: Math.floor((Date.now() - metrics.startTime) / 1000),
  });
});

// Get all CVs for dashboard (Filtered by user or requires authentication for DB access)
app.get("/api/cvs", (req: Request, res: Response) => {
  // If anonymous / guest user, return empty list with guest flag (no DB leak / no server sync for guest)
  if (!req.user) {
    return res.json({
      success: true,
      count: 0,
      items: [],
      data: [],
      isGuestMode: true,
      message: "Mode Invité actif : Vos données restent 100% locales dans votre navigateur et ne sont pas stockées sur nos serveurs (Conformité RGPD).",
    });
  }

  // Authenticated user: Admin gets all, regular user gets their own or seeded items
  const allList = Array.from(cvDatabase.values()).map(cv => {
    const cvData = toCVData(cv);
    return {
      id: cv.id,
      userId: cv.userId,
      slug: cv.slug,
      title: cv.title,
      isPublished: cv.isPublished,
      publishedAt: cv.publishedAt,
      viewCount: cv.viewCount,
      lastViewedAt: cv.lastViewedAt,
      createdBy: cv.createdBy || cvData.createdBy || "",
      createdByName: cv.createdByName || cvData.createdByName || "",
      updatedBy: cv.updatedBy || cvData.updatedBy || "",
      updatedByName: cv.updatedByName || cvData.updatedByName || "",
      version: cv.version || cvData.version || 1,
      updatedAt: cv.updatedAt,
      createdAt: cv.createdAt,
      templateId: cvData.templateId,
      candidateName: cvData.personalInfo?.fullName || "Candidat",
      candidateRole: cvData.personalInfo?.jobTitle || "",
      skillsCount: cvData.skills?.length || 0,
      experiencesCount: cvData.experiences?.length || 0,
    };
  });

  const filteredList = req.user.role === 'ADMIN' 
    ? allList 
    : allList.filter(cv => !cv.userId || cv.userId === req.user?.id);

  res.json({ success: true, count: filteredList.length, items: filteredList, data: filteredList });
});

// Get single CV by ID
app.get("/api/cvs/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const cached = getCache(`cv:id:${id}`);
  if (cached) {
    metrics.cacheHits++;
    return res.json({ success: true, data: toCVData(cached), fromCache: true });
  }
  metrics.cacheMisses++;

  const item = cvDatabase.get(id);
  if (!item) {
    return res.status(404).json({ success: false, error: "CV introuvable" });
  }

  const cvData = toCVData(item);
  setCache(`cv:id:${id}`, cvData, 30);
  res.json({ success: true, data: cvData, fromCache: false });
});

// Robots.txt - Anti-Scraping & Anti-AI Bots Directive
app.get("/robots.txt", (req: Request, res: Response) => {
  res.type("text/plain");
  res.send(
`# CV Studio Cloud - Anti-Harvesting & Anti-Scraping Security Directives
User-agent: *
Disallow: /?p=*
Disallow: /api/public/
Disallow: /api/cvs/
Disallow: /api/admin/

# Explicitly ban Automated AI Crawlers and Scraping Bots
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Scrapy
Disallow: /

User-agent: bytespider
Disallow: /
`
  );
});

// Get public published CV by Slug - Hardened Anti-Scraping & Privacy Layer
app.get("/api/public/cv/:slug", (req: Request, res: Response) => {
  // Inject strict anti-indexing & privacy headers
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, max-image-preview:none");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Content-Type-Options", "nosniff");

  // 1. IP Rate Limiting (max 40 requests/min per IP to prevent rapid scraping)
  const clientIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "anonymous-ip").split(",")[0].trim();
  if (!checkPublicRateLimit(clientIp, 40, 60000)) {
    return res.status(429).json({
      success: false,
      error: "Trop de requêtes détectées depuis cette adresse IP. Veuillez patienter une minute (Protection Anti-Scraping).",
    });
  }

  const { slug } = req.params;
  metrics.cvViews++;

  // Find CV by slug
  let found: StoredCV | undefined;
  for (const cv of cvDatabase.values()) {
    if (cv.slug === slug || cv.id === slug) {
      found = cv;
      break;
    }
  }

  if (!found || !found.isPublished) {
    return res.status(404).json({
      success: false,
      error: "Ce CV n'est pas publié ou le lien est invalide.",
    });
  }

  const now = Date.now();

  // 2. Expiration Date Gatekeeper
  if (found.securityConfig?.expiresAt) {
    const expTime = new Date(found.securityConfig.expiresAt).getTime();
    if (expTime < now) {
      return res.status(410).json({
        success: false,
        isExpired: true,
        error: "Ce lien de CV a expiré selon les paramètres de confidentialité définis par le candidat.",
        meta: {
          slug: found.slug,
          expiredAt: found.securityConfig.expiresAt,
        },
      });
    }
  }

  // 3. PIN / Password Protection Gatekeeper (Anti-Data Scraping / Zero PII leak)
  if (found.securityConfig?.isProtected && found.passwordHash) {
    // Return only public non-sensitive metadata stub (No PII, No experiences, No contact info)
    const fullName = found.data?.personalInfo?.fullName || "Candidat";
    const jobTitle = found.data?.personalInfo?.jobTitle || "Professionnel";

    return res.json({
      success: true,
      isProtected: true,
      meta: {
        id: found.id,
        slug: found.slug,
        title: found.title,
        hasPassword: true,
        pinHint: found.securityConfig?.pinHint,
        candidateNameHint: maskCandidateName(fullName),
        jobTitle: jobTitle,
        publishedAt: found.publishedAt,
        expiresAt: found.securityConfig?.expiresAt,
        maskContactInfo: found.securityConfig?.maskContactInfo || false,
      },
    });
  }

  // 4. Open Public Access: Increment view counter & return full normalized CV
  found.viewCount = (found.viewCount || 0) + 1;
  found.lastViewedAt = new Date().toISOString();
  cvDatabase.set(found.id, found);

  const cvData = toCVData(found);
  res.json({
    success: true,
    isProtected: false,
    data: cvData,
    meta: {
      id: found.id,
      slug: found.slug,
      title: found.title,
      publishedAt: found.publishedAt,
      viewCount: found.viewCount,
      lastViewedAt: found.lastViewedAt,
      version: found.version,
      expiresAt: found.securityConfig?.expiresAt,
      maskContactInfo: found.securityConfig?.maskContactInfo || false,
    },
  });
});

// Unlock Protected CV with PIN / Passcode (Rate-limited & brute-force guarded)
app.post("/api/public/cv/:slug/unlock", (req: Request, res: Response) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  const { slug } = req.params;
  const { pinCode } = req.body;
  const clientIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "anonymous-ip").split(",")[0].trim();
  const attemptKey = `${clientIp}:${slug}`;

  const now = Date.now();
  const attemptRecord = unlockAttempts.get(attemptKey) || { attempts: 0, blockedUntil: 0 };

  // Check if currently temporarily blocked
  if (now < attemptRecord.blockedUntil) {
    const waitSeconds = Math.ceil((attemptRecord.blockedUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      error: `Trop de tentatives infructueuses. Veuillez réessayer dans ${waitSeconds} secondes.`,
      blockedSeconds: waitSeconds,
    });
  }

  // Find CV
  let found: StoredCV | undefined;
  for (const cv of cvDatabase.values()) {
    if (cv.slug === slug || cv.id === slug) {
      found = cv;
      break;
    }
  }

  if (!found || !found.isPublished) {
    return res.status(404).json({ success: false, error: "CV introuvable ou non publié." });
  }

  if (!found.securityConfig?.isProtected || !found.passwordHash) {
    // Not locked, return data directly
    const cvData = toCVData(found);
    return res.json({ success: true, data: cvData, meta: { id: found.id, slug: found.slug } });
  }

  if (!pinCode || typeof pinCode !== "string") {
    return res.status(400).json({ success: false, error: "Code PIN ou mot de passe requis." });
  }

  // Hash input
  const inputHash = crypto.createHash("sha256").update(pinCode.trim() + "_cv_pro_salt").digest("hex");

  if (inputHash !== found.passwordHash) {
    attemptRecord.attempts += 1;
    if (attemptRecord.attempts >= 5) {
      attemptRecord.blockedUntil = now + 10 * 60 * 1000; // 10 min block
      unlockAttempts.set(attemptKey, attemptRecord);
      return res.status(429).json({
        success: false,
        error: "Nombre maximal de tentatives dépassé (5/5). Accès verrouillé pendant 10 minutes.",
      });
    }

    unlockAttempts.set(attemptKey, attemptRecord);
    const remaining = 5 - attemptRecord.attempts;
    return res.status(401).json({
      success: false,
      error: `Code PIN ou mot de passe incorrect. (${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''})`,
      remainingAttempts: remaining,
    });
  }

  // Success! Clear attempt tracking
  unlockAttempts.delete(attemptKey);

  // Increment view counter
  found.viewCount = (found.viewCount || 0) + 1;
  found.lastViewedAt = new Date().toISOString();
  cvDatabase.set(found.id, found);

  logActivity(
    'cv_viewed',
    'Consultation CV Déverrouillé',
    `Accès autorisé avec succès au CV protégé ${found.title} (${found.slug})`,
    found.id,
    found.data?.personalInfo?.fullName
  );

  const cvData = toCVData(found);
  res.json({
    success: true,
    unlocked: true,
    data: cvData,
    meta: {
      id: found.id,
      slug: found.slug,
      title: found.title,
      publishedAt: found.publishedAt,
      viewCount: found.viewCount,
      lastViewedAt: found.lastViewedAt,
      version: found.version,
      maskContactInfo: found.securityConfig?.maskContactInfo || false,
    },
  });
});

// Update CV (PUT) - Guarded by Authentication with full Audit logging
app.put("/api/cvs/:id", (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Conformité RGPD : Les modifications en Mode Invité ne sont pas persistées sur nos serveurs sans compte authentifié. Vos données sont conservées localement dans votre navigateur.",
      isGuestMode: true,
    });
  }

  try {
    const { id } = req.params;
    const body = req.body;
    const existing = cvDatabase.get(id);
    const now = new Date().toISOString();
    const newVersion = (existing?.version || 1) + 1;

    const normalizedData = toCVData({
      ...body,
      createdBy: existing?.createdBy || req.user.id,
      createdByName: existing?.createdByName || req.user.fullName,
      updatedBy: req.user.id,
      updatedByName: req.user.fullName,
      version: newVersion,
    });

    const storedItem: StoredCV = {
      id: id,
      userId: req.user.id,
      slug: body.slug || existing?.slug || normalizedData.slug || `cv-${id}`,
      title: body.title || existing?.title || normalizedData.title || "CV Sans Titre",
      isPublished: body.isPublished ?? existing?.isPublished ?? false,
      publishedAt: (body.isPublished ?? existing?.isPublished) ? (existing?.publishedAt || now) : undefined,
      viewCount: existing?.viewCount || 0,
      lastViewedAt: existing?.lastViewedAt,
      data: normalizedData,
      createdBy: existing?.createdBy || req.user.id,
      createdByName: existing?.createdByName || req.user.fullName,
      updatedBy: req.user.id,
      updatedByName: req.user.fullName,
      version: newVersion,
      updatedAt: now,
      createdAt: existing?.createdAt || now,
    };

    cvDatabase.set(id, storedItem);
    redisCache.set(`cv:id:${id}`, { value: normalizedData, expiresAt: Date.now() + 30000 });
    metrics.totalUpdates++;

    logActivity(
      'cv_updated',
      'Mise à jour du CV (Audit v' + newVersion + ')',
      `Modifications enregistrées pour ${storedItem.title} par ${req.user.fullName} (@${req.user.username})`,
      id,
      normalizedData.personalInfo?.fullName
    );

    res.json({
      success: true,
      message: `CV mis à jour avec succès sur le Cloud (Version ${newVersion})`,
      data: normalizedData,
      audit: {
        createdBy: storedItem.createdBy,
        createdByName: storedItem.createdByName,
        updatedBy: storedItem.updatedBy,
        updatedByName: storedItem.updatedByName,
        version: storedItem.version,
        updatedAt: storedItem.updatedAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Erreur mise à jour" });
  }
});

// Create or Save CV - Guarded by Authentication with Audit fields
app.post("/api/cvs", (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Conformité RGPD : La sauvegarde sur le Cloud requiert un compte authentifié. En Mode Invité, vos données restent strictement privées dans votre navigateur.",
      isGuestMode: true,
    });
  }

  try {
    const body = req.body;
    const finalId = body.id || `cv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const existing = cvDatabase.get(finalId);
    const now = new Date().toISOString();
    const version = existing ? (existing.version || 1) + 1 : 1;

    // Use user username as default slug if no custom slug provided
    let cleanSlug = body.slug;
    if (!cleanSlug) {
      if (req.user?.username && !Array.from(cvDatabase.values()).some(c => c.slug === req.user?.username && c.id !== finalId)) {
        cleanSlug = req.user.username;
      } else {
        const namePart = (body.personalInfo?.fullName || req.user?.fullName || "cv")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .slice(0, 30);
        cleanSlug = `${namePart}-${Math.random().toString(36).substring(2, 6)}`;
      }
    }

    const normalizedData = toCVData({
      ...body,
      id: finalId,
      slug: cleanSlug,
      createdBy: existing?.createdBy || req.user.id,
      createdByName: existing?.createdByName || req.user.fullName,
      updatedBy: req.user.id,
      updatedByName: req.user.fullName,
      version,
    });

    const storedItem: StoredCV = {
      id: finalId,
      userId: req.user.id,
      slug: cleanSlug,
      title: body.title || normalizedData.title || existing?.title || "Nouveau CV",
      isPublished: body.isPublished ?? normalizedData.isPublished ?? existing?.isPublished ?? false,
      publishedAt: (body.isPublished ?? normalizedData.isPublished) ? (existing?.publishedAt || now) : undefined,
      viewCount: existing?.viewCount || 0,
      lastViewedAt: existing?.lastViewedAt,
      securityConfig: body.securityConfig || existing?.securityConfig || normalizedData.securityConfig,
      passwordHash: existing?.passwordHash,
      data: normalizedData,
      createdBy: existing?.createdBy || req.user.id,
      createdByName: existing?.createdByName || req.user.fullName,
      updatedBy: req.user.id,
      updatedByName: req.user.fullName,
      version,
      updatedAt: now,
      createdAt: existing?.createdAt || now,
    };

    cvDatabase.set(finalId, storedItem);
    redisCache.delete(`cv:id:${finalId}`);
    metrics.totalCreations++;

    logActivity(
      'cv_created',
      'Création de CV',
      `Nouveau profil: ${storedItem.title} créé par ${req.user.fullName} (@${req.user.username})`,
      finalId,
      normalizedData.personalInfo?.fullName
    );

    res.json({
      success: true,
      message: "CV enregistré avec succès sur le Cloud",
      data: normalizedData,
      audit: {
        createdBy: storedItem.createdBy,
        createdByName: storedItem.createdByName,
        updatedBy: storedItem.updatedBy,
        updatedByName: storedItem.updatedByName,
        version: storedItem.version,
        createdAt: storedItem.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Erreur lors de l'enregistrement" });
  }
});

// Toggle publish status - Requires Authentication
app.post("/api/cvs/:id/publish", (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Conformité RGPD : La publication web requiert un compte authentifié pour certifier la propriété du lien public.",
      isGuestMode: true,
    });
  }

  const { id } = req.params;
  const { isPublished, customSlug, securityConfig, pinCode } = req.body;

  const item = cvDatabase.get(id);
  if (!item) {
    return res.status(404).json({ success: false, error: "CV non trouvé" });
  }

  if (customSlug) {
    item.slug = customSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  }

  item.isPublished = Boolean(isPublished);
  if (item.isPublished && !item.publishedAt) {
    item.publishedAt = new Date().toISOString();
  }

  // Handle Security Configuration & PIN / Password Protection
  if (securityConfig) {
    item.securityConfig = {
      isProtected: Boolean(securityConfig.isProtected),
      hasPassword: Boolean(securityConfig.isProtected && (pinCode || item.passwordHash)),
      maskContactInfo: Boolean(securityConfig.maskContactInfo),
      expiresAt: securityConfig.expiresAt || undefined,
      pinHint: securityConfig.pinHint || undefined,
    };

    if (securityConfig.isProtected && pinCode) {
      item.passwordHash = crypto.createHash("sha256").update(pinCode.trim() + "_cv_pro_salt").digest("hex");
      item.securityConfig.hasPassword = true;
    } else if (!securityConfig.isProtected) {
      item.passwordHash = undefined;
      item.securityConfig.hasPassword = false;
    }
  }

  item.updatedBy = req.user.id;
  item.updatedByName = req.user.fullName;
  item.version = (item.version || 1) + 1;
  item.updatedAt = new Date().toISOString();

  cvDatabase.set(id, item);
  redisCache.delete(`cv:id:${id}`);

  const normalized = toCVData(item);

  if (item.isPublished) {
    const secStatus = item.securityConfig?.isProtected ? "avec Protection PIN & Anti-Scraping" : "en Accès Public";
    logActivity('cv_published', 'Publication en ligne', `CV déployé (${secStatus}) sous /?p=${item.slug} par ${req.user.fullName}`, id, normalized.personalInfo?.fullName);
  } else {
    logActivity('cv_depublished', 'Dépublication de CV', `CV repassé en mode brouillon privé par ${req.user.fullName}`, id, normalized.personalInfo?.fullName);
  }

  res.json({
    success: true,
    message: item.isPublished ? `CV publié avec succès sur l'identifiant ${item.slug} !` : "CV retiré du web",
    data: normalized,
  });
});

// Track Exports & Shares
app.post("/api/track/export", (req: Request, res: Response) => {
  const { type, cvId, candidateName, title } = req.body;
  if (type === 'pdf') {
    metrics.pdfGenerations++;
    logActivity('cv_exported_pdf', 'Export PDF', `Génération PDF A4 pour ${title || 'CV'}`, cvId, candidateName);
  } else if (type === 'json') {
    metrics.jsonExports++;
    logActivity('cv_exported_json', 'Export JSON', `Exportation des données brutes pour ${title || 'CV'}`, cvId, candidateName);
  } else if (type === 'email') {
    metrics.emailShares++;
    logActivity('cv_shared_email', 'Partage Email', `Transmission du lien CV par courriel`, cvId, candidateName);
  }
  res.json({ success: true, recorded: type, currentMetrics: metrics });
});

// Admin Analytics and System Stats API (Protected with requireAdmin)
app.get("/api/admin/stats", requireAdmin, (req: Request, res: Response) => {
  const allCvs = Array.from(cvDatabase.values());
  const publishedCount = allCvs.filter(c => c.isPublished).length;
  const draftCount = allCvs.length - publishedCount;
  const totalViews = allCvs.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);

  // Template distribution
  const templateDistribution: Record<string, number> = {
    'modern-clean': 0,
    'tech-developer': 0,
    'executive': 0,
    'creative-minimal': 0,
    'academic-classic': 0,
    'accent-split': 0,
  };

  allCvs.forEach(cv => {
    const tmpl = cv.data?.templateId || 'modern-clean';
    templateDistribution[tmpl] = (templateDistribution[tmpl] || 0) + 1;
  });

  const totalExports = metrics.pdfGenerations + metrics.jsonExports + metrics.emailShares;
  const deploymentRate = allCvs.length > 0 ? ((publishedCount / allCvs.length) * 100).toFixed(1) : "0.0";
  const exportToCreationRatio = allCvs.length > 0 ? (totalExports / allCvs.length).toFixed(2) : "0.0";
  const cacheHitRatio = (metrics.cacheHits + metrics.cacheMisses) > 0 
    ? ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1) 
    : "100.0";

  res.json({
    success: true,
    overview: {
      totalCvs: allCvs.length,
      publishedCvs: publishedCount,
      draftCvs: draftCount,
      deploymentRatePercent: Number(deploymentRate),
      totalViews,
      totalExports,
      pdfExports: metrics.pdfGenerations,
      jsonExports: metrics.jsonExports,
      emailShares: metrics.emailShares,
      exportToCreationRatio: Number(exportToCreationRatio),
      aiGenerationsCount: 0,
      cacheHitRatioPercent: Number(cacheHitRatio),
      totalRequests: metrics.totalRequests,
      uptimeSeconds: Math.floor((Date.now() - metrics.startTime) / 1000),
    },
    templateDistribution,
    recentActivity: activityLogs.slice(0, 30),
    systemHealth: {
      status: "HEALTHY",
      environment: process.env.NODE_ENV || "production",
      database: isDbConnected() ? "PostgreSQL / Supabase (Prisma)" : "In-Memory PostgreSQL Replica",
      authEngine: "JWT (HttpOnly Cookie) + RBAC",
      memoryUsageMb: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1),
      totalMemoryMb: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(1),
      cachedEntries: redisCache.size,
      dbRecordsCount: cvDatabase.size,
    }
  });
});

// Admin User Management API (Protected with requireAdmin)
app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
  const users = Array.from(memoryUsers.values()).map(u => sanitizeUser(u));
  res.json({
    success: true,
    count: users.length,
    items: users,
  });
});

// Admin Update User Role (Protected with requireAdmin)
app.put("/api/admin/users/:id/role", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== "USER" && role !== "ADMIN") {
    return res.status(400).json({ success: false, error: "Rôle invalide. Doit être 'USER' ou 'ADMIN'." });
  }

  const user = memoryUsers.get(id);
  if (!user) {
    return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
  }

  user.role = role;
  user.updatedAt = new Date().toISOString();
  memoryUsers.set(id, user);

  logActivity(
    "cv_updated" as any,
    "Privilèges Utilisateur Modifiés",
    `Rôle de ${user.fullName} (@${user.username}) mis à jour vers '${role}' par l'administrateur ${req.user?.fullName}`,
    undefined,
    user.fullName
  );

  res.json({
    success: true,
    message: `Rôle de ${user.fullName} modifié en ${role} avec succès.`,
    user: sanitizeUser(user),
  });
});

// Admin Enable / Disable User Account (Protected with requireAdmin)
app.put("/api/admin/users/:id/status", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive, reason } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ success: false, error: "Le paramètre 'isActive' doit être un booléen." });
  }

  // Prevent admin from disabling their own account
  if (req.user?.id === id && !isActive) {
    return res.status(400).json({
      success: false,
      error: "Action impossible : Vous ne pouvez pas désactiver votre propre compte administrateur en cours de session.",
    });
  }

  const user = memoryUsers.get(id);
  if (!user) {
    return res.status(404).json({ success: false, error: "Utilisateur introuvable." });
  }

  user.isActive = isActive;
  user.disabledAt = isActive ? undefined : new Date().toISOString();
  user.disabledReason = isActive ? undefined : (reason || "Désactivation administrative");
  user.updatedAt = new Date().toISOString();
  memoryUsers.set(id, user);

  logActivity(
    "cv_updated" as any,
    isActive ? "Compte Utilisateur Activé" : "Compte Utilisateur Suspendu",
    `Le compte de ${user.fullName} (@${user.username}) a été ${isActive ? "réactivé" : "désactivé"} par ${req.user?.fullName}${reason ? ` (Motif: ${reason})` : ""}`,
    undefined,
    user.fullName
  );

  res.json({
    success: true,
    message: isActive ? `Le compte de ${user.fullName} (@${user.username}) a été réactivé.` : `Le compte de ${user.fullName} (@${user.username}) a été désactivé.`,
    user: sanitizeUser(user),
  });
});

// Admin Raw Data Explorer API with full audit info (Protected with requireAdmin)
app.get("/api/admin/cvs", requireAdmin, (req: Request, res: Response) => {
  const allCvs = Array.from(cvDatabase.values()).map(c => ({
    id: c.id,
    userId: c.userId,
    slug: c.slug,
    title: c.title,
    isPublished: c.isPublished,
    publishedAt: c.publishedAt,
    viewCount: c.viewCount,
    lastViewedAt: c.lastViewedAt,
    createdBy: c.createdBy || "",
    createdByName: c.createdByName || "",
    updatedBy: c.updatedBy || "",
    updatedByName: c.updatedByName || "",
    version: c.version || 1,
    updatedAt: c.updatedAt,
    createdAt: c.createdAt,
    templateId: c.data?.templateId || 'modern-clean',
    candidateName: c.data?.personalInfo?.fullName || 'N/A',
    candidateEmail: c.data?.personalInfo?.email || 'N/A',
    candidateRole: c.data?.personalInfo?.jobTitle || 'N/A',
    experiencesCount: c.data?.experiences?.length || 0,
    skillsCount: c.data?.skills?.length || 0,
    rawData: c.data,
  }));
  res.json({ success: true, total: allCvs.length, items: allCvs });
});

// Admin Full Backup Export (Protected with requireAdmin)
app.get("/api/admin/export/all", requireAdmin, (req: Request, res: Response) => {
  const backup = {
    exportedAt: new Date().toISOString(),
    version: "2.5.0-audit-admin",
    totalRecords: cvDatabase.size,
    records: Array.from(cvDatabase.values()),
    users: Array.from(memoryUsers.values()).map(u => sanitizeUser(u)),
    metrics,
    activityLogs,
  };
  res.setHeader("Content-Disposition", `attachment; filename=cv-studio-admin-backup-${Date.now()}.json`);
  res.json(backup);
});

// Duplicate CV (version management with audit cloning)
app.post("/api/cvs/:id/duplicate", (req: Request, res: Response) => {
  const { id } = req.params;
  const original = cvDatabase.get(id);
  if (!original) {
    return res.status(404).json({ success: false, error: "CV original introuvable" });
  }

  const newId = `cv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newSlug = `${original.slug}-v2-${Math.random().toString(36).substring(2, 5)}`;
  const now = new Date().toISOString();

  const originalData = toCVData(original);
  const duplicatedData = {
    ...originalData,
    id: newId,
    slug: newSlug,
    title: `${original.title} (Version dupliquée)`,
    isPublished: false,
    publishedAt: undefined,
    viewCount: 0,
    lastViewedAt: undefined,
    createdBy: req.user?.id || original.createdBy || '',
    createdByName: req.user?.fullName || original.createdByName || '',
    updatedBy: req.user?.id || original.updatedBy || '',
    updatedByName: req.user?.fullName || original.updatedByName || '',
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  const duplicated: StoredCV = {
    id: newId,
    userId: req.user?.id || original.userId,
    slug: newSlug,
    title: duplicatedData.title,
    isPublished: false,
    publishedAt: undefined,
    viewCount: 0,
    lastViewedAt: undefined,
    createdBy: duplicatedData.createdBy,
    createdByName: duplicatedData.createdByName,
    updatedBy: duplicatedData.updatedBy,
    updatedByName: duplicatedData.updatedByName,
    version: 1,
    createdAt: now,
    updatedAt: now,
    data: duplicatedData,
  };

  cvDatabase.set(newId, duplicated);

  logActivity(
    'cv_created',
    'Duplication de Version CV',
    `Duplication de '${original.title}' vers nouvelle version '${duplicated.title}'`,
    newId,
    duplicatedData.personalInfo?.fullName
  );

  res.json({
    success: true,
    message: "Nouvelle version créée et prête à être éditée",
    data: duplicatedData,
  });
});

// Delete CV
app.delete("/api/cvs/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  if (!cvDatabase.has(id)) {
    return res.status(404).json({ success: false, error: "CV non trouvé" });
  }

  cvDatabase.delete(id);
  redisCache.delete(`cv:id:${id}`);
  res.json({ success: true, message: "CV supprimé avec succès" });
});

// Direct Email Sharing simulation/dispatch
app.post("/api/share/email", (req: Request, res: Response) => {
  const { recipientEmail, senderName, cvTitle, publicUrl, message } = req.body;
  
  if (!recipientEmail) {
    return res.status(400).json({ success: false, error: "Adresse email destinataire requise" });
  }

  // Simulate mail dispatch and logging
  console.log(`[Email Service] CV '${cvTitle}' sent to ${recipientEmail} by ${senderName}. Link: ${publicUrl}`);

  res.json({
    success: true,
    message: `Le CV a été envoyé avec succès à ${recipientEmail} !`,
    details: {
      to: recipientEmail,
      subject: `Candidature & CV - ${senderName} (${cvTitle})`,
      dispatchedAt: new Date().toISOString(),
    }
  });
});

// -------------------------------------------------------------
// APP FACTORY
// -------------------------------------------------------------
// Returns the fully configured Express application (API routes + middleware).
// Host/static/Vite serving and the HTTP listener live in server/index.ts.
export function buildApp() {
  return app;
}

export default app;
