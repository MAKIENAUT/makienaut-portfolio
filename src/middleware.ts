import { NextRequest, NextResponse } from "next/server";
import {
  ORB_WEAVER_SESSION_COOKIE,
  verifyOrbWeaverSession,
} from "@/lib/orb-weaver/session";

const isLoginPath = (pathname: string) =>
  pathname === "/vroombroom/backoffice/login";

const isBackofficePath = (pathname: string) =>
  pathname === "/vroombroom/backoffice" ||
  pathname.startsWith("/vroombroom/backoffice/");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isBackofficePath(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ORB_WEAVER_SESSION_COOKIE)?.value;
  const hasSession = await verifyOrbWeaverSession(sessionToken);
  const loginPath = "/vroombroom/backoffice/login";
  const dashboardPath = "/vroombroom/backoffice";

  if (isLoginPath(pathname) && hasSession) {
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  if (!isLoginPath(pathname) && !hasSession) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/vroombroom/backoffice/:path*"],
};
