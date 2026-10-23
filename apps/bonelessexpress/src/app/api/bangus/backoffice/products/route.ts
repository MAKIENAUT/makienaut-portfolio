import { NextRequest, NextResponse } from "next/server";
import {
  createBangusProduct,
  listBangusCatalog,
} from "@/lib/bangus/products";
import { validateBangusProduct } from "@/lib/bangus/validation";
import {
  isOrbWeaverAuthenticated,
  isSameOriginRequest,
} from "@/lib/orb-weaver/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  if (!(await isOrbWeaverAuthenticated(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const catalog = await listBangusCatalog();
    const response = NextResponse.json(catalog);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    console.error("Unable to list Bangus products", error);
    return NextResponse.json(
      { message: "Products could not be loaded." },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isOrbWeaverAuthenticated(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Request rejected." }, { status: 403 });
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
    const product = await createBangusProduct(validation.product);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Unable to create Bangus product", error);
    return NextResponse.json(
      { message: "Product could not be created." },
      { status: 503 }
    );
  }
}
