"use client";

import { type FormEvent, useState } from "react";
import { FaArrowRight, FaLock } from "react-icons/fa";

export function OrbWeaverLoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/orb-weaver/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        destination?: string;
      };

      if (!response.ok) {
        throw new Error(result.message || "Sign-in failed.");
      }

      window.location.assign(result.destination || "/vroombroom/backoffice");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Sign-in failed."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <label
        htmlFor="orb-backoffice-username"
        className="mb-2 block text-sm font-medium text-stone-200"
      >
        Username
      </label>
      <input
        id="orb-backoffice-username"
        name="username"
        type="text"
        autoComplete="username"
        required
        autoFocus
        maxLength={80}
        className="min-h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-stone-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        placeholder="Enter your username"
      />

      <label
        htmlFor="orb-backoffice-password"
        className="mb-2 mt-5 block text-sm font-medium text-stone-200"
      >
        Back-office password
      </label>
      <div className="relative">
        <FaLock
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
        />
        <input
          id="orb-backoffice-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
          className="min-h-12 w-full rounded-xl border border-white/10 bg-black/35 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-stone-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          placeholder="Enter your password"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#10110f] disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? "Verifying…" : "Enter back-office"}
        {!isSubmitting && <FaArrowRight aria-hidden="true" />}
      </button>
    </form>
  );
}
