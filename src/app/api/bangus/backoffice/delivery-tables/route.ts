import { NextRequest, NextResponse } from "next/server";
import {
  createBangusDeliveryTable,
  listBangusDeliveryTables,
} from "@/lib/bangus/orders";
import { validateBangusDeliveryTable } from "@/lib/bangus/order-validation";
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
    const deliveryTables = await listBangusDeliveryTables();
    const response = NextResponse.json({ deliveryTables });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    console.error("Unable to list Bangus delivery tables", error);
    return NextResponse.json(
      { message: "Delivery tables could not be loaded." },
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

  const table = validateBangusDeliveryTable(
    await request.json().catch(() => null)
  );

  if (!table) {
    return NextResponse.json(
      { message: "Enter an order table name and a valid delivery date." },
      { status: 400 }
    );
  }

  try {
    const deliveryTable = await createBangusDeliveryTable(
      table.name,
      table.deliveryDate
    );
    return NextResponse.json({ deliveryTable }, { status: 201 });
  } catch (error) {
    console.error("Unable to create Bangus delivery table", error);
    return NextResponse.json(
      { message: "Delivery table could not be created." },
      { status: 503 }
    );
  }
}
