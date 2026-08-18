import { Request, Response, NextFunction } from "express";

// Security headers and API proxy data leak prevention
export function apiProxySecurityMiddleware(req: Request, res: Response, next: NextFunction) {
  // Enhanced Security Headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Intercept and sanitize JSON responses to guarantee no password hashes or secret keys are leaked
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    if (body && typeof body === "object") {
      const sanitized = deepSanitizeData(body);
      return originalJson(sanitized);
    }
    return originalJson(body);
  };

  next();
}

// Deep sanitize data to prevent credentials / secrets leakage
function deepSanitizeData(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(deepSanitizeData);
  }
  if (obj !== null && typeof obj === "object") {
    // If it's a date or buffer, return as is
    if (obj instanceof Date) return obj;

    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Forbidden fields from leaking to client
      if (
        key === "passwordHash" ||
        key === "password" ||
        key === "JWT_SECRET" ||
        key === "GEMINI_API_KEY" ||
        key === "secretKey"
      ) {
        continue; // Strip key
      }
      cleaned[key] = deepSanitizeData(value);
    }
    return cleaned;
  }
  return obj;
}
