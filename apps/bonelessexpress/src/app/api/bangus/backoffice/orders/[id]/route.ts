import { NextRequest, NextResponse } from "next/server";
import {
  deleteBangusOrder,
  updateBangusOrder,
  updateBangusOrderStatus,
} from "@/lib/bangus/orders";
import {
  isBangusUuid,
  validateBangusOrder,
  validateBangusOrderStatus,
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

const authorizeMutation = async (request: NextRequest) => {
  if (!(await isOrbWeaverAuthenticated(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Request rejected." }, { status: 403 });
  }
  return null;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authorizationError = await authorizeMutation(request);
  if (authorizationError) return authorizationError;

  const { id } = await context.params;
  if (!isBangusUuid(id)) {
    return NextResponse.json(
      { message: "Choose a valid order." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const isDetailsUpdate =
    !!body &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    ("customerName" in body || "quantities" in body);
  const validation = isDetailsUpdate
    ? validateBangusOrder(body)
    : validateBangusOrderStatus(body);

  if (!validation.ok) {
    return NextResponse.json(
      { message: validation.message },
      { status: 400 }
    );
  }

  try {
    const order =
      "order" in validation
        ? await updateBangusOrder(id, validation.order)
        : await updateBangusOrderStatus(id, validation.status);
    return NextResponse.json({ order });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }
    if ((error as Error).message === "INVALID_PRODUCTS") {
      return NextResponse.json(
        { message: "One or more selected products no longer exist." },
        { status: 400 }
      );
    }

    console.error("Unable to update Bangus order", error);
    return NextResponse.json(
      { message: "Order could not be updated." },
      { status: 503 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const authorizationError = await authorizeMutation(request);
  if (authorizationError) return authorizationError;

  const { id } = await context.params;
  if (!isBangusUuid(id)) {
    return NextResponse.json(
      { message: "Choose a valid order." },
      { status: 400 }
    );
  }

  try {
    await deleteBangusOrder(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }

    console.error("Unable to delete Bangus order", error);
    return NextResponse.json(
      { message: "Order could not be removed." },
      { status: 503 }
    );
  }
}
