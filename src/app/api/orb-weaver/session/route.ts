import { NextRequest, NextResponse } from "next/server";
import {
  clearOrbWeaverLoginFailures,
  isOrbWeaverLoginRateLimited,
  recordOrbWeaverLoginFailure,
} from "@/lib/orb-weaver/login-attempts";
import { verifyOrbWeaverPassword } from "@/lib/orb-weaver/password";
import {
  getOrbWeaverRequestFingerprint,
  isSameOriginRequest,
} from "@/lib/orb-weaver/request";
import {
  createOrbWeaverSession,
  ORB_WEAVER_SESSION_COOKIE,
  ORB_WEAVER_SESSION_MAX_AGE,
} from "@/lib/orb-weaver/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorizedResponse = () =>
  NextResponse.json(
    { message: "The credentials could not be verified." },
    { status: 401 }
  );

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Request rejected." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { password?: unknown };
    const password = typeof body.password === "string" ? body.password : "";
    const sourceFingerprint = getOrbWeaverRequestFingerprint(request, "login");

    if (
      sourceFingerprint &&
      (await isOrbWeaverLoginRateLimited(sourceFingerprint))
    ) {
      return NextResponse.json(
        { message: "Too many attempts. Try again in 15 minutes." },
        { status: 429 }
      );
    }

    if (!(await verifyOrbWeaverPassword(password))) {
      if (sourceFingerprint) {
        await recordOrbWeaverLoginFailure(sourceFingerprint);
      }

      return unauthorizedResponse();
    }

    if (sourceFingerprint) {
      await clearOrbWeaverLoginFailures(sourceFingerprint);
    }

    const session = await createOrbWeaverSession();
    const response = NextResponse.json({ message: "Signed in." });

    response.cookies.set(ORB_WEAVER_SESSION_COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ORB_WEAVER_SESSION_MAX_AGE,
    });
    response.headers.set("Cache-Control", "private, no-store");

    return response;
  } catch (error) {
    console.error("Unable to create VroomBroom session", error);

    return NextResponse.json(
      { message: "Back-office access is not configured yet." },
      { status: 503 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Request rejected." }, { status: 403 });
  }

  const response = NextResponse.json({ message: "Signed out." });

  response.cookies.set(ORB_WEAVER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "private, no-store");

  return response;
}
