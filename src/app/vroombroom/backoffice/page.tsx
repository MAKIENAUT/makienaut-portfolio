import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaArrowLeft, FaDatabase } from "react-icons/fa";
import { AppointmentsDashboard } from "@/components/orb-weaver/AppointmentsDashboard";
import { OrbWeaverLogoutButton } from "@/components/orb-weaver/LogoutButton";
import { listOrbWeaverAppointments } from "@/lib/orb-weaver/appointments";
import {
  ORB_WEAVER_SESSION_COOKIE,
  verifyOrbWeaverSession,
} from "@/lib/orb-weaver/session";
import type { OrbWeaverAppointmentRecord } from "@/types/orb-weaver";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrbWeaverBackofficePage() {
  const session = (await cookies()).get(ORB_WEAVER_SESSION_COOKIE)?.value;

  if (!(await verifyOrbWeaverSession(session))) {
    redirect("/vroombroom/backoffice/login");
  }

  let databaseError = "";
  let appointments: OrbWeaverAppointmentRecord[] = [];

  try {
    appointments = await listOrbWeaverAppointments();
  } catch (error) {
    console.error("Unable to load VroomBroom dashboard", error);
    databaseError =
      "The dashboard is ready, but the Prisma database is not connected or migrated yet.";
  }

  return (
    <div className="min-h-svh bg-[#090a08] text-stone-100">
      <header className="border-b border-white/[0.08] bg-[#0d0f0c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-20 items-center justify-center">
              <Image
                src="/vroombroom.png"
                alt=""
                width={120}
                height={80}
                className="h-auto w-full object-contain"
              />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                VroomBroom
              </p>
              <h1 className="mt-1 text-xl font-semibold text-white">
                Appointment dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/vroombroom"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-stone-400 transition hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <FaArrowLeft aria-hidden="true" />
              View site
            </Link>
            <OrbWeaverLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[90rem] px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8">
          <p className="text-sm text-stone-500">Back-office overview</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Keep every clean on track.
          </h2>
        </div>

        {databaseError ? (
          <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-6">
            <FaDatabase
              aria-hidden="true"
              className="text-2xl text-amber-300"
            />
            <h2 className="mt-4 text-xl font-semibold text-white">
              Database setup needed
            </h2>
            <p className="mt-2 max-w-2xl leading-7 text-stone-300">
              {databaseError}
            </p>
            <p className="mt-4 rounded-xl bg-black/30 p-4 font-mono text-xs text-stone-400">
              Add OW_MAIN_DB_DATABASE_URL, then run npm run db:deploy.
            </p>
          </section>
        ) : (
          <AppointmentsDashboard initialAppointments={appointments} />
        )}
      </main>
    </div>
  );
}
