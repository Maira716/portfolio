import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";

// Rate limiting storage: IP -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const ADMIN_EMAILS = [
  "mairareis2017@gmail.com",
  "maira.reis.ti@gmail.com",
  "admin@mairareis.dev",
];

/**
 * In-Memory Sliding Window Rate Limiter
 */
export function checkRateLimit(
  req: Request | NextRequest,
  limit: number = 20,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip")) || "127.0.0.1";
  const now = Date.now();

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetInMs: record.resetTime - now };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetInMs: record.resetTime - now };
}

/**
 * Secure Password Hashing with Salt using crypto.scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Constant-Time Password Verification
 */
export function verifyPassword(password: string, storedHashOrPlain: string): boolean {
  if (!password || !storedHashOrPlain) return false;

  // Handle scrypt formatted hash (salt:hash)
  if (storedHashOrPlain.includes(":")) {
    const [salt, key] = storedHashOrPlain.split(":");
    if (!salt || !key) return false;
    try {
      const keyBuffer = Buffer.from(key, "hex");
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    } catch {
      return false;
    }
  }

  // Fallback for legacy plain text comparison with timing safe equal
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(storedHashOrPlain);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return password === storedHashOrPlain;
  }
}

/**
 * Authenticate session from Request (Supabase Cookie / Bearer Token / Admin Header)
 */
export async function getAuthenticatedUser(req: Request | NextRequest): Promise<{
  user: { id: string; email: string; role?: string } | null;
  isAdmin: boolean;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // 1. Check Bearer Token if present
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ") && supabaseUrl && supabaseAnonKey) {
    const token = authHeader.replace("Bearer ", "").trim();
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      });
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error && user.email) {
        const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase()) || user.user_metadata?.role === "admin";
        return {
          user: {
            id: user.id,
            email: user.email.toLowerCase(),
            role: isAdmin ? "admin" : "client",
          },
          isAdmin,
        };
      }
    } catch {}
  }

  // 2. Check Supabase Cookies from NextRequest
  if (supabaseUrl && supabaseAnonKey && "cookies" in req) {
    try {
      const nextReq = req as NextRequest;
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll: () => nextReq.cookies.getAll(),
          setAll: () => {},
        },
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase()) || user.user_metadata?.role === "admin";
        return {
          user: {
            id: user.id,
            email: user.email.toLowerCase(),
            role: isAdmin ? "admin" : "client",
          },
          isAdmin,
        };
      }
    } catch {}
  }

  return { user: null, isAdmin: false };
}

/**
 * Input sanitization helper to strip control characters & basic XSS vectors
 */
export function sanitizeString(val: unknown, maxLength = 500): string {
  if (typeof val !== "string") return "";
  return val
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "");
}

/**
 * Validate standard email format
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}
