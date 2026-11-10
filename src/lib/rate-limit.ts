/**
 * In-Memory Sliding Window Rate Limiter
 * Melindungi endpoint sensitif (Login, Register, Pengajuan Laporan, Upload Foto)
 * dari serangan Brute Force, Credential Stuffing, dan Spam/DoS (OWASP A07:2021 / CWE-307).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Bersihkan entri kedaluwarsa secara berkala jika map membesar
  if (rateLimitStore.size > 5000) {
    rateLimitStore.forEach((val, k) => {
      if (val.resetAt <= now) rateLimitStore.delete(k);
    });
  }

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (entry.count >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: limit - entry.count,
    retryAfterSec: 0,
  };
}

