import { NextRequest, NextResponse } from "next/server";
import { deleteBangusDeliveryTable } from "@/lib/bangus/orders";
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

export async function DELETE(request: NextRequest, context: RouteContext) {
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

  try {
    await deleteBangusDeliveryTable(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { message: "Delivery table not found." },
        { status: 404 }
      );
    }

    console.error("Unable to delete Bangus delivery table", error);
    return NextResponse.json(
      { message: "Delivery table could not be removed." },
      { status: 503 }
    );
  }
}
