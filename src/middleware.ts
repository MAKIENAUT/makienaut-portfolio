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
  const session = await verifyOrbWeaverSession(sessionToken);
  const loginPath = "/vroombroom/backoffice/login";
  const dashboardPath = "/vroombroom/backoffice";

  if (isLoginPath(pathname) && session) {
    return NextResponse.redirect(
      new URL(
        session.role === "SUPPLIER"
          ? "/vroombroom/backoffice/bangus"
          : dashboardPath,
        request.url
      )
    );
  }

  if (!isLoginPath(pathname) && !session) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  if (
    session?.role === "SUPPLIER" &&
    pathname !== "/vroombroom/backoffice/bangus"
  ) {
    return NextResponse.redirect(
      new URL("/vroombroom/backoffice/bangus", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/vroombroom/backoffice/:path*"],
};
