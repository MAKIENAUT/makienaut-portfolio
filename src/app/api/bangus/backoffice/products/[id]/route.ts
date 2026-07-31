import { NextRequest, NextResponse } from "next/server";
import {
  deleteBangusProduct,
  updateBangusProduct,
} from "@/lib/bangus/products";
import { validateBangusProduct } from "@/lib/bangus/validation";
import {
  isOrbWeaverAuthenticated,
  isSameOriginRequest,
} from "@/lib/orb-weaver/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

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
  if (!isUuid(id)) {
    return NextResponse.json(
      { message: "Choose a valid product." },
      { status: 400 }
    );
  }

  const validation = validateBangusProduct(
    await request.json().catch(() => null)
  );
  if (!validation.ok) {
    return NextResponse.json(
      { message: validation.message },
      { status: 400 }
    );
  }

  try {
    const product = await updateBangusProduct(id, validation.product);
    return NextResponse.json({ product });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    console.error("Unable to update Bangus product", error);
    return NextResponse.json(
      { message: "Product could not be updated." },
      { status: 503 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const authorizationError = await authorizeMutation(request);
  if (authorizationError) return authorizationError;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json(
      { message: "Choose a valid product." },
      { status: 400 }
    );
  }

  try {
    await deleteBangusProduct(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        {
          message:
            "This product is used by an order. Mark it inactive instead of removing it.",
        },
        { status: 409 }
      );
    }

    console.error("Unable to delete Bangus product", error);
    return NextResponse.json(
      { message: "Product could not be removed." },
      { status: 503 }
    );
  }
}
