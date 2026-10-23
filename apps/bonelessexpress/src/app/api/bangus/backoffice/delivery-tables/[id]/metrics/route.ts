import { NextRequest, NextResponse } from "next/server";
import { listBangusProductMetrics } from "@/lib/bangus/product-metrics";
import { isBangusUuid } from "@/lib/bangus/order-validation";
import {
  isOrbWeaverAuthenticated,
  isSameOriginRequest,
} from "@/lib/orb-weaver/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const authorize = async (request: NextRequest, isMutation = false) => {
  if (!(await isOrbWeaverAuthenticated(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (isMutation && !isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Request rejected." }, { status: 403 });
  }

  return null;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const authorizationError = await authorize(request);
  if (authorizationError) return authorizationError;

  const { id } = await context.params;
  if (!isBangusUuid(id)) {
    return NextResponse.json(
      { message: "Choose a valid delivery table." },
      { status: 400 }
    );
  }

  try {
    const metrics = await listBangusProductMetrics(id);
    if (!metrics) {
      return NextResponse.json(
        { message: "Delivery table not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { metrics },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Unable to load Bangus product metrics", error);
    return NextResponse.json(
      { message: "Product metrics could not be loaded." },
      { status: 503 }
    );
  }
}
