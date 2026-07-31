import { NextRequest, NextResponse } from "next/server";
import { createBangusOrder } from "@/lib/bangus/orders";
import {
  isBangusUuid,
  validateBangusOrder,
} from "@/lib/bangus/order-validation";
import {
  isOrbWeaverAuthenticated,
  isSameOriginRequest,
} from "@/lib/orb-weaver/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!(await isOrbWeaverAuthenticated(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Request rejected." }, { status: 403 });
  }

  const { id } = await context.params;
  if (!isBangusUuid(id)) {
    return NextResponse.json(
      { message: "Choose a valid delivery table." },
      { status: 400 }
    );
  }

  const validation = validateBangusOrder(
    await request.json().catch(() => null)
  );
  if (!validation.ok) {
    return NextResponse.json(
      { message: validation.message },
      { status: 400 }
    );
  }

  try {
    const order = await createBangusOrder(id, validation.order);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "P2003" || code === "P2025") {
      return NextResponse.json(
        { message: "Delivery table not found." },
        { status: 404 }
      );
    }
    if ((error as Error).message === "INVALID_PRODUCTS") {
      return NextResponse.json(
        { message: "One or more selected products no longer exist." },
        { status: 400 }
      );
    }

    console.error("Unable to create Bangus order", error);
    return NextResponse.json(
      { message: "Order could not be created." },
      { status: 503 }
    );
  }
}
