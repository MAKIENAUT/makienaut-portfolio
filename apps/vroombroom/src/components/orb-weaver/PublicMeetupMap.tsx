"use client";

import { useState } from "react";

interface PublicMeetupMapProps {
  src: string;
  title: string;
}

export function PublicMeetupMap({ src, title }: PublicMeetupMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded) {
    return (
      <iframe
        title={title}
        src={src}
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0 grayscale-[0.25]"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.13),transparent_36%),linear-gradient(145deg,#191b17,#0c0d0b)] px-4 text-center sm:px-6">
      <div>
        <span
          aria-hidden="true"
          className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300/10 text-base text-amber-300 sm:h-12 sm:w-12 sm:text-xl"
        >
          ◎
        </span>
        <p className="mt-2 text-sm font-semibold text-white sm:mt-4 sm:text-base">
          Public meetup map
        </p>
        <p className="mx-auto mt-1.5 hidden max-w-xs text-xs leading-5 text-stone-500 sm:block">
          The interactive Google Map loads only when you ask for it.
        </p>
        <button
          type="button"
          onClick={() => setIsLoaded(true)}
          className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-xs font-semibold text-black transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black sm:mt-5 sm:min-h-11 sm:px-5 sm:py-2.5 sm:text-sm"
        >
          Load interactive map
        </button>
      </div>
    </div>
  );
}
