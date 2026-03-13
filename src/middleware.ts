import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // This is a placeholder - actual auth check will be done client-side
  // or via server-side session validation
  return NextResponse.next();
}

export const config = {
  matcher: ["/host/:path*"],
};
