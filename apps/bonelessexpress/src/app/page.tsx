import { FaDatabase, FaFish } from "react-icons/fa";
import { BangusDashboard } from "@/components/bangus/BangusDashboard";
import {
  listBangusDeliveryTables,
} from "@/lib/bangus/orders";
import {
  listBangusCatalog,
} from "@/lib/bangus/products";
import type { BangusCatalogRecord, BangusDeliveryTableRecord } from "@/types/bangus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BangusHomePage() {
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
      "The Bangus catalog is ready, but its product tables are not available yet.";
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
                Boneless Express
              </p>
              <h1 className="truncate text-base font-semibold text-white sm:mt-1 sm:text-xl">
                Wholesale Orders & Logistics
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto min-w-0 max-w-[96rem] px-3 pb-24 pt-3 sm:px-8 sm:py-10">
        <div className="mb-8 hidden sm:block">
          <p className="text-sm text-stone-500">Back-office overview</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Products and orders, kept simple.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-stone-400">
            Maintain the products, pack sizes, flavors, shortages, and pricing used by your Bangus business.
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
            accessMode="admin"
          />
        )}
      </main>
    </div>
  );
}
