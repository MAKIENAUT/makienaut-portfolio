import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import {
  ORB_WEAVER_SESSION_COOKIE,
  verifyOrbWeaverSession,
} from "@/lib/orb-weaver/session";

export const isSameOriginRequest = (request: NextRequest) => {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    const forwardedHost = request.headers
      .get("x-forwarded-host")
      ?.split(",")[0]
      ?.trim();
    const requestHost =
      forwardedHost || request.headers.get("host") || request.nextUrl.host;

    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
};

export const isOrbWeaverAuthenticated = (request: NextRequest) =>
  verifyOrbWeaverSession(
    request.cookies.get(ORB_WEAVER_SESSION_COOKIE)?.value
  );

export const getOrbWeaverRequestFingerprint = (
  request: NextRequest,
  purpose: "appointment" | "login"
) => {
  const secret = process.env.ORBW_AUTH_SECRET;

  if (!secret || secret.length < 32) {
    return undefined;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const address =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return createHmac("sha256", secret)
    .update(`${purpose}:${address}`)
    .digest("hex");
};
