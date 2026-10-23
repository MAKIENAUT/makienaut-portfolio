import { NextRequest, NextResponse } from "next/server";
import {
  ORB_WEAVER_SESSION_COOKIE,
  verifyOrbWeaverSession,
} from "@/lib/orb-weaver/session";

const isLoginPath = (pathname: string) =>
  pathname === "/backoffice/login" || pathname === "/vroombroom/backoffice/login";

const isBackofficePath = (pathname: string) =>
  pathname === "/backoffice" ||
  pathname.startsWith("/backoffice/") ||
  pathname === "/vroombroom/backoffice" ||
  pathname.startsWith("/vroombroom/backoffice/");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isBackofficePath(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ORB_WEAVER_SESSION_COOKIE)?.value;
  const session = await verifyOrbWeaverSession(sessionToken);
  const prefix = pathname.startsWith("/vroombroom") ? "/vroombroom" : "";
  const loginPath = `${prefix}/backoffice/login`;
  const dashboardPath = `${prefix}/backoffice`;

  if (isLoginPath(pathname) && session) {
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  if (!isLoginPath(pathname) && !session) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/backoffice/:path*",
    "/vroombroom/backoffice/:path*",
  ],
};
