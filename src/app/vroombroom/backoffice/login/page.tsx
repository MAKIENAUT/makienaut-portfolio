import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import { OrbWeaverLoginForm } from "@/components/orb-weaver/LoginForm";
import {
  ORB_WEAVER_SESSION_COOKIE,
  verifyOrbWeaverSession,
} from "@/lib/orb-weaver/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrbWeaverBackofficeLoginPage() {
  const session = (await cookies()).get(ORB_WEAVER_SESSION_COOKIE)?.value;

  if (await verifyOrbWeaverSession(session)) {
    redirect("/vroombroom/backoffice");
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#090a08] px-5 py-16 text-stone-100">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,0.12),transparent_32%),linear-gradient(145deg,#11130f,#050605)]"
      />
      <div className="relative w-full max-w-md">
        <Link
          href="/vroombroom"
          className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-stone-400 transition hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <FaArrowLeft aria-hidden="true" />
          Back to VroomBroom
        </Link>

        <section className="rounded-[2rem] border border-amber-300/15 bg-[#10110f]/95 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center">
              <Image
                src="/vroombroom-thumb.webp"
                alt=""
                width={96}
                height={96}
                unoptimized
                className="h-full w-full rounded-xl object-cover"
              />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                VroomBroom
              </p>
              <p className="mt-1 text-sm text-stone-500">Private back-office</p>
            </div>
          </div>

          <h1 className="mt-9 text-3xl font-semibold tracking-tight text-white">
            Owner access
          </h1>
          <p className="mt-3 leading-7 text-stone-400">
            Sign in to review appointment requests and keep each booking up to
            date.
          </p>

          <OrbWeaverLoginForm />

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-600">
            <FaShieldAlt aria-hidden="true" />
            Protected with a signed, private session.
          </p>
        </section>
      </div>
    </main>
  );
}
