import { inputClasses, labelClasses } from "./types";

interface CustomerStepProps {
  hidden: boolean;
}

export function CustomerStep({ hidden }: CustomerStepProps) {
  return (
    <div data-form-step="0" hidden={hidden}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="orb-name" className={labelClasses}>
            Your name
          </label>
          <input
            id="orb-name"
            name="customerName"
            type="text"
            minLength={2}
            maxLength={100}
            autoComplete="name"
            required
            placeholder="Juan Dela Cruz"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="orb-phone" className={labelClasses}>
            Mobile number
          </label>
          <input
            id="orb-phone"
            name="phone"
            type="tel"
            minLength={7}
            maxLength={40}
            autoComplete="tel"
            required
            placeholder="+63 9XX XXX XXXX"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="orb-email" className={labelClasses}>
            Email <span className="text-stone-500">(optional)</span>
          </label>
          <input
            id="orb-email"
            name="email"
            type="email"
            maxLength={160}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>
      </div>
    </div>
  );
}
