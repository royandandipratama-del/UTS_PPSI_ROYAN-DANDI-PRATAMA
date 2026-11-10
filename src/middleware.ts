import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    console.warn(
      "[Security Warning] Environment variable AUTH_SECRET belum diatur di production. Menggunakan fallback secret key."
    );
  }
  return new TextEncoder().encode(
    secret || "rahasia_kunci_jwt_laporwarga_bandar_lampung_2026_super_aman_12345"
  );
}

const SECRET_KEY = getJwtSecretKey();

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Proteksi CSRF berbasis Origin vs Host pada endpoint mutasi API
  if (
    pathname.startsWith("/api/") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
  ) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { message: "Permintaan lintas-origin (CSRF) ditolak" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { message: "Header Origin tidak valid" },
          { status: 403 }
        );
      }
    }
  }

  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("laporwarga_token")?.value;

    if (!token) {
      const loginUrl = new URL("/masuk", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;

      if (role !== "petugas" && role !== "admin") {
        // Bukan petugas atau admin -> redirect ke beranda
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch {
      // Token tidak valid atau kedaluwarsa
      const loginUrl = new URL("/masuk", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};

