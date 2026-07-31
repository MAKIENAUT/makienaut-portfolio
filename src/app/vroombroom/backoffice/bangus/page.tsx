import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaArrowLeft, FaDatabase, FaFish } from "react-icons/fa";
import { BangusDashboard } from "@/components/bangus/BangusDashboard";
import { OrbWeaverLogoutButton } from "@/components/orb-weaver/LogoutButton";
import { listBangusDeliveryTables } from "@/lib/bangus/orders";
import { listBangusCatalog } from "@/lib/bangus/products";
import {
  ORB_WEAVER_SESSION_COOKIE,
  verifyOrbWeaverSession,
} from "@/lib/orb-weaver/session";
import type {
  BangusCatalogRecord,
  BangusDeliveryTableRecord,
} from "@/types/bangus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BangusBackofficePage() {
  const session = (await cookies()).get(ORB_WEAVER_SESSION_COOKIE)?.value;

  if (!(await verifyOrbWeaverSession(session))) {
    redirect("/vroombroom/backoffice/login");
  }

  let databaseError = "";
  let catalog: BangusCatalogRecord = { products: [], categories: [] };
  let deliveryTables: BangusDeliveryTableRecord[] = [];

  try {
    [catalog, deliveryTables] = await Promise.all([
      listBangusCatalog(),
      listBangusDeliveryTables(),
    ]);
  } catch (error) {
    console.error("Unable to load Bangus catalog", error);
    databaseError =
      "The Bangus page is ready, but its product tables are not available yet.";
  }

  return (
    <div className="min-h-svh overflow-x-hidden bg-[#080c0b] text-stone-100">
      <header className="border-b border-white/[0.08] bg-[#0b100f]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[96rem] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-300 text-xl text-[#071211]">
              <FaFish aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Bangus business
              </p>
              <h1 className="mt-1 text-xl font-semibold text-white">
                Bangus order page
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <Link
              href="/vroombroom/backoffice"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-stone-400 transition hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <FaArrowLeft aria-hidden="true" />
              VroomBroom
            </Link>
            <OrbWeaverLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto min-w-0 max-w-[96rem] px-4 py-6 sm:px-8 sm:py-10">
        <div className="mb-8">
          <p className="text-sm text-stone-500">Back-office overview</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Products and orders, kept simple.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-stone-400">
            Maintain the products, pack sizes, flavors, and pricing used by
            your Bangus business.
          </p>
        </div>

        {databaseError ? (
          <section className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-6">
            <FaDatabase aria-hidden="true" className="text-2xl text-cyan-300" />
            <h2 className="mt-4 text-xl font-semibold text-white">
              Catalog setup needed
            </h2>
            <p className="mt-2 max-w-2xl leading-7 text-stone-300">
              {databaseError}
            </p>
            <p className="mt-4 rounded-xl bg-black/30 p-4 font-mono text-xs text-stone-400">
              Run npm run db:deploy to create and seed the Bangus catalog.
            </p>
          </section>
        ) : (
          <BangusDashboard
            initialCatalog={catalog}
            initialDeliveryTables={deliveryTables}
          />
        )}
      </main>
    </div>
  );
}
