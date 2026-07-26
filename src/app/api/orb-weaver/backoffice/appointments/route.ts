import { NextRequest, NextResponse } from "next/server";
import { listOrbWeaverAppointments } from "@/lib/orb-weaver/appointments";
import { isOrbWeaverAuthenticated } from "@/lib/orb-weaver/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  if (!(await isOrbWeaverAuthenticated(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const appointments = await listOrbWeaverAppointments();
    const response = NextResponse.json({ appointments });
    response.headers.set("Cache-Control", "private, no-store");

    return response;
  } catch (error) {
    console.error("Unable to list VroomBroom appointments", error);

    return NextResponse.json(
      { message: "Appointments could not be loaded." },
      { status: 503 }
    );
  }
}
