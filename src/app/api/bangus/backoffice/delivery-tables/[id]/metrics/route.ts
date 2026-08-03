import { NextRequest, NextResponse } from "next/server";
import {
  listBangusProductMetrics,
  updateBangusProductShortages,
} from "@/lib/bangus/product-metrics";
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

export async function PUT(request: NextRequest, context: RouteContext) {
  const authorizationError = await authorize(request, true);
  if (authorizationError) return authorizationError;

  const { id } = await context.params;
  if (!isBangusUuid(id)) {
    return NextResponse.json(
      { message: "Choose a valid delivery table." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const rawShortQuantities =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as { shortQuantities?: unknown }).shortQuantities
      : null;

  if (
    !rawShortQuantities ||
    typeof rawShortQuantities !== "object" ||
    Array.isArray(rawShortQuantities)
  ) {
    return NextResponse.json(
      { message: "Enter valid supplier shortages." },
      { status: 400 }
    );
  }

  const shortQuantities: Record<string, number> = {};
  for (const [productId, shortQuantity] of Object.entries(rawShortQuantities)) {
    if (
      !isBangusUuid(productId) ||
      typeof shortQuantity !== "number" ||
      !Number.isInteger(shortQuantity) ||
      shortQuantity < 0 ||
      shortQuantity > 1_000_000
    ) {
      return NextResponse.json(
        { message: "Enter valid supplier shortages." },
        { status: 400 }
      );
    }
    shortQuantities[productId] = shortQuantity;
  }

  try {
    const metrics = await updateBangusProductShortages(id, shortQuantities);
    if (!metrics) {
      return NextResponse.json(
        { message: "Delivery table not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ metrics });
  } catch (error) {
    if ((error as Error).message === "INVALID_SHORTAGE") {
      return NextResponse.json(
        { message: "A shortage cannot exceed the ordered quantity." },
        { status: 400 }
      );
    }

    console.error("Unable to update Bangus product shortages", error);
    return NextResponse.json(
      { message: "Product metrics could not be saved." },
      { status: 503 }
    );
  }
}
