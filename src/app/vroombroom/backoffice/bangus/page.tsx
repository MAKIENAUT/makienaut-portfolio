import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaArrowLeft, FaDatabase, FaFish } from "react-icons/fa";
import { BangusDashboard } from "@/components/bangus/BangusDashboard";
import { OrbWeaverLogoutButton } from "@/components/orb-weaver/LogoutButton";
import {
  listBangusDeliveryTables,
  listBangusSupplierOrderView,
} from "@/lib/bangus/orders";
import {
  listBangusCatalog,
  listBangusSupplierCatalog,
} from "@/lib/bangus/products";
import {
  ORB_WEAVER_SESSION_COOKIE,
  verifyOrbWeaverSession,
} from "@/lib/orb-weaver/session";
import type { BangusCatalogRecord, BangusDeliveryTableRecord } from "@/types/bangus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BangusBackofficePage() {
  const token = (await cookies()).get(ORB_WEAVER_SESSION_COOKIE)?.value;
  const session = await verifyOrbWeaverSession(token);

  if (!session || (session.role !== "ADMIN" && session.role !== "SUPPLIER")) {
    redirect("/vroombroom/backoffice/login");
  }

  const isSupplier = session.role === "SUPPLIER";

  let databaseError = "";
  let catalog: BangusCatalogRecord = { products: [], categories: [] };
  let deliveryTables: BangusDeliveryTableRecord[] = [];

  try {
    if (isSupplier) {
      [catalog, deliveryTables] = await Promise.all([
        listBangusSupplierCatalog(),
        listBangusSupplierOrderView(),
      ]);
    } else {
      [catalog, deliveryTables] = await Promise.all([
        listBangusCatalog(),
        listBangusDeliveryTables(),
      ]);
    }
  } catch (error) {
    console.error("Unable to load Bangus catalog", error);
    databaseError =
      "The Bangus page is ready, but its product tables are not available yet.";
  }

  return (
    <div className="min-h-svh overflow-x-hidden bg-[#080c0b] text-stone-100">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0b100f]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-3 px-3 py-2.5 sm:px-8 sm:py-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300 text-lg text-[#071211] sm:h-12 sm:w-12 sm:text-xl">
              <FaFish aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cyan-300 sm:text-xs sm:tracking-[0.2em]">
                Bangus business
              </p>
              <h1 className="truncate text-base font-semibold text-white sm:mt-1 sm:text-xl">
                Orders
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {!isSupplier && (
              <Link
                href="/vroombroom/backoffice"
                aria-label="Back to VroomBroom"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold text-stone-400 transition hover:bg-white/[0.04] hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:w-auto sm:gap-2 sm:px-3"
              >
                <FaArrowLeft aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">VroomBroom</span>
              </Link>
            )}
            <OrbWeaverLogoutButton compactOnMobile />
          </div>
        </div>
      </header>

      <main className="mx-auto min-w-0 max-w-[96rem] px-3 pb-24 pt-3 sm:px-8 sm:py-10">
        <div className="mb-8 hidden sm:block">
          <p className="text-sm text-stone-500">
            {isSupplier ? "Read-only supplier access" : "Back-office overview"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {isSupplier ? "Orders to prepare." : "Products and orders, kept simple."}
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-stone-400">
            {isSupplier
              ? "Review customer order quantities and repacking progress."
              : "Maintain the products, pack sizes, flavors, and pricing used by your Bangus business."}
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
            accessMode={isSupplier ? "supplier" : "admin"}
          />
        )}
      </main>
    </div>
  );
}
