// middleware.ts - bản cho Amplify, KHÔNG dùng Clerk

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  // Không làm gì, chỉ cho request đi tiếp
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Giữ nguyên matcher cũ để Next.js biết route nào chạy middleware
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
