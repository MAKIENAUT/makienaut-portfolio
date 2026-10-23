import { FaCheck, FaChevronDown } from "react-icons/fa";
import {
  ORB_WEAVER_ADD_ONS,
  ORB_WEAVER_SERVICES,
  type OrbWeaverServiceId,
} from "@/types/orb-weaver";
import { formatCurrency } from "@/lib/common/formatters";
import { inputClasses, labelClasses } from "./types";

interface ServiceStepProps {
  hidden: boolean;
  selectedService: OrbWeaverServiceId | "";
  helmetCount: number;
  selectedAddOns: string[];
  onSelectService: (serviceId: OrbWeaverServiceId) => void;
  onHelmetCountChange: (count: number) => void;
  onToggleAddOn: (addOnId: string) => void;
  isAddOnIncluded: (
    addOn: (typeof ORB_WEAVER_ADD_ONS)[number],
    serviceId: OrbWeaverServiceId | ""
  ) => boolean;
}

export function ServiceStep({
  hidden,
  selectedService,
  helmetCount,
  selectedAddOns,
  onSelectService,
  onHelmetCountChange,
  onToggleAddOn,
  isAddOnIncluded,
}: ServiceStepProps) {
  return (
    <div data-form-step="1" hidden={hidden}>
      <fieldset>
        <legend className={labelClasses}>Choose your clean</legend>
        <div className="grid items-start gap-2.5 sm:grid-cols-2">
          {ORB_WEAVER_SERVICES.map((service) => {
            const isSelected = selectedService === service.id;

            return (
              <div
                key={service.id}
                className={`relative h-fit overflow-hidden rounded-xl border transition ${
                  isSelected
                    ? "border-amber-300 bg-amber-300/10 ring-2 ring-amber-300/15"
                    : !service.available
                    ? "border-white/[0.07] bg-white/[0.02] opacity-70"
                    : "border-white/10 bg-black/20 hover:border-amber-300/35"
                }`}
              >
                <label
                  className={`block p-3 ${
                    service.available
                      ? "cursor-pointer"
                      : "cursor-not-allowed"
                  }`}
                >
                  <input
                    type="radio"
                    name="service"
                    value={service.id}
                    checked={isSelected}
                    required
                    disabled={!service.available}
                    onChange={() => onSelectService(service.id)}
                    className="sr-only"
                  />
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold text-white">
                          {service.name}
                        </span>
                        {service.popular && (
                          <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wide text-black">
                            Popular
                          </span>
                        )}
                        {!service.available && (
                          <span className="rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wide text-stone-300">
                            Coming soon
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[0.7rem] leading-4 text-stone-500">
                        {service.shortDescription}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-right text-sm font-semibold text-amber-200">
                      <span>{formatCurrency(service.price)}</span>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[0.55rem] text-black">
                          <FaCheck aria-hidden="true" />
                        </span>
                      )}
                    </span>
                  </span>
                </label>

                <details className="group border-t border-white/[0.08]">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-wide text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 [&::-webkit-details-marker]:hidden">
                    What&apos;s included
                    <FaChevronDown
                      aria-hidden="true"
                      className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <ul className="space-y-2 border-t border-white/[0.06] px-3 py-3 text-xs leading-5 text-stone-400">
                    {service.inclusions.map((inclusion) => (
                      <li key={inclusion} className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-amber-300"
                        >
                          ✓
                        </span>
                        {inclusion}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            );
          })}
        </div>
      </fieldset>

      {selectedService === "multiple_helmets" ? (
        <div className="mt-4">
          <label htmlFor="orb-count" className={labelClasses}>
            Number of helmets
          </label>
          <input
            id="orb-count"
            name="helmetCount"
            type="number"
            min={2}
            max={10}
            value={helmetCount}
            onChange={(event) =>
              onHelmetCountChange(
                Math.min(10, Math.max(2, Number(event.target.value) || 2))
              )
            }
            required
            inputMode="numeric"
            className={inputClasses}
          />
        </div>
      ) : (
        <input type="hidden" name="helmetCount" value="1" />
      )}

      <fieldset className="mt-4">
        <legend className={labelClasses}>
          Add-ons <span className="text-stone-500">(optional)</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ORB_WEAVER_ADD_ONS.map((addOn) => {
            const isSelected = selectedAddOns.includes(addOn.id);
            const isIncluded = isAddOnIncluded(addOn, selectedService);

            return (
              <label
                key={addOn.id}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs transition ${
                  isIncluded
                    ? "cursor-default border-emerald-300/20 bg-emerald-300/[0.06] text-stone-400"
                    : isSelected
                    ? "border-amber-300/50 bg-amber-300/10 text-white"
                    : "cursor-pointer border-white/10 bg-black/20 text-stone-300 hover:border-amber-300/30"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="addOns"
                    value={addOn.id}
                    checked={isSelected}
                    disabled={isIncluded}
                    onChange={() => onToggleAddOn(addOn.id)}
                    className="h-4 w-4 rounded border-white/20 bg-black accent-amber-400"
                  />
                  {addOn.name}
                </span>
                <span
                  className={`shrink-0 font-semibold ${
                    isIncluded ? "text-emerald-300" : "text-amber-200"
                  }`}
                >
                  {isIncluded ? "Included" : `+${formatCurrency(addOn.price)}`}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
