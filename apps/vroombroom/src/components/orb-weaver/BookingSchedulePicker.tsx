"use client";

import { useMemo, useState } from "react";
import {
  ORB_WEAVER_TIME_WINDOWS,
  type OrbWeaverHandoffMethod,
  type OrbWeaverTimeWindow,
} from "@/types/orb-weaver";

interface BookingSchedulePickerProps {
  error: string;
  handoffMethod: OrbWeaverHandoffMethod;
  minimumDate: string;
  onDateChange: (value: string) => void;
  onWindowChange: (value: OrbWeaverTimeWindow | "") => void;
  selectedDate: string;
  selectedWindow: OrbWeaverTimeWindow | "";
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const parseDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateValue = (date: Date) =>
  [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");

const formatMonthValue = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;

const isWeekendDate = (value: string) => {
  const day = parseDate(value).getUTCDay();
  return day === 0 || day === 6;
};

const getManilaMinuteOfDay = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((item) => item.type === type)?.value ?? 0);

  return part("hour") * 60 + part("minute");
};

export function BookingSchedulePicker({
  error,
  handoffMethod,
  minimumDate,
  onDateChange,
  onWindowChange,
  selectedDate,
  selectedWindow,
}: BookingSchedulePickerProps) {
  const [visibleMonth, setVisibleMonth] = useState(minimumDate.slice(0, 7));
  const currentManilaMinute = useMemo(getManilaMinuteOfDay, []);
  const maximumDate = useMemo(() => {
    const date = parseDate(minimumDate);
    date.setUTCDate(date.getUTCDate() + 180);
    return formatDateValue(date);
  }, [minimumDate]);
  const maximumMonth = maximumDate.slice(0, 7);
  const calendarDays = useMemo(() => {
    const firstDay = parseDate(`${visibleMonth}-01`);
    const year = firstDay.getUTCFullYear();
    const month = firstDay.getUTCMonth();
    const leadingDays = firstDay.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const dayValues: Array<string | null> = [
      ...Array.from({ length: leadingDays }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) =>
        formatDateValue(new Date(Date.UTC(year, month, index + 1)))
      ),
    ];

    while (dayValues.length % 7 !== 0) {
      dayValues.push(null);
    }

    return dayValues;
  }, [visibleMonth]);
  const selectedAvailability = selectedDate
    ? isWeekendDate(selectedDate)
      ? "weekend"
      : "weekday"
    : null;
  const availableWindows = selectedAvailability
    ? ORB_WEAVER_TIME_WINDOWS.filter(
        (window) =>
          window.availability === selectedAvailability &&
          (selectedDate !== minimumDate ||
            window.handoffEndMinutes > currentManilaMinute)
      )
    : [];
  const handoffLabel =
    handoffMethod === "pickup_return" ? "pickup" : "drop-off";
  const completionLabel =
    handoffMethod === "pickup_return" ? "Return" : "Claim";

  const changeMonth = (offset: number) => {
    const nextMonth = parseDate(`${visibleMonth}-01`);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + offset);
    setVisibleMonth(formatMonthValue(nextMonth));
  };

  const chooseDate = (date: string) => {
    onDateChange(date);
    const availability = isWeekendDate(date) ? "weekend" : "weekday";
    const currentWindowStillAvailable = ORB_WEAVER_TIME_WINDOWS.some(
      (window) =>
        window.id === selectedWindow &&
        window.availability === availability &&
        (date !== minimumDate ||
          window.handoffEndMinutes > currentManilaMinute)
    );

    if (!currentWindowStillAvailable) {
      onWindowChange("");
    }
  };

  return (
    <div className="mt-4">
      <input type="hidden" name="preferredDate" value={selectedDate} />
      <input type="hidden" name="preferredWindow" value={selectedWindow} />

      <div className="mb-3">
        <p className="text-sm font-medium text-stone-200">Preferred date</p>
        <p className="mt-1 text-xs leading-5 text-stone-500">
          Pick a date, then choose one of the available {handoffLabel} windows.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-3 py-2.5">
          <button
            type="button"
            aria-label="Previous month"
            disabled={visibleMonth <= minimumDate.slice(0, 7)}
            onClick={() => changeMonth(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-stone-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
          >
            ‹
          </button>
          <p className="text-sm font-semibold text-white">
            {new Intl.DateTimeFormat("en-PH", {
              timeZone: "UTC",
              month: "long",
              year: "numeric",
            }).format(parseDate(`${visibleMonth}-01`))}
          </p>
          <button
            type="button"
            aria-label="Next month"
            disabled={visibleMonth >= maximumMonth}
            onClick={() => changeMonth(1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-stone-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 px-2 pt-2 text-center text-[0.62rem] font-semibold uppercase tracking-wide text-stone-600">
          {weekdayLabels.map((day) => (
            <span key={day} className="py-1.5">
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 px-2 pb-3">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <span key={`empty-${index}`} aria-hidden="true" />;
            }

            const dateAvailability = isWeekendDate(date)
              ? "weekend"
              : "weekday";
            const hasRemainingWindow =
              date !== minimumDate ||
              ORB_WEAVER_TIME_WINDOWS.some(
                (window) =>
                  window.availability === dateAvailability &&
                  window.handoffEndMinutes > currentManilaMinute
              );
            const isDisabled =
              date < minimumDate || date > maximumDate || !hasRemainingWindow;

            return (
              <button
                key={date}
                type="button"
                disabled={isDisabled}
                aria-pressed={selectedDate === date}
                aria-label={new Intl.DateTimeFormat("en-PH", {
                  timeZone: "UTC",
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(parseDate(date))}
                onClick={() => chooseDate(date)}
                className={`flex aspect-square min-h-9 items-center justify-center rounded-lg text-xs font-medium transition ${
                  selectedDate === date
                    ? "bg-amber-400 font-semibold text-black"
                    : isDisabled
                    ? "cursor-not-allowed text-stone-800"
                    : isWeekendDate(date)
                    ? "bg-amber-300/[0.06] text-amber-100 hover:bg-amber-300/15"
                    : "text-stone-300 hover:bg-white/[0.07]"
                }`}
              >
                {Number(date.slice(-2))}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
        {selectedDate ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                  Available {handoffLabel} time options
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {selectedAvailability === "weekday"
                    ? "Weekday availability"
                    : "Weekend availability"}
                </p>
              </div>
              <p className="text-xs font-medium text-stone-300">
                {new Intl.DateTimeFormat("en-PH", {
                  timeZone: "UTC",
                  month: "short",
                  day: "numeric",
                }).format(parseDate(selectedDate))}
              </p>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {availableWindows.map((window) => (
                <label
                  key={window.id}
                  className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-xs transition ${
                    selectedWindow === window.id
                      ? "border-amber-300 bg-amber-400 text-black"
                      : "border-white/10 bg-black/20 text-stone-300 hover:border-amber-300/35"
                  }`}
                >
                  <input
                    type="radio"
                    name="scheduleWindowChoice"
                    value={window.id}
                    checked={selectedWindow === window.id}
                    onChange={() => onWindowChange(window.id)}
                    className="sr-only"
                  />
                  <span className="block font-semibold">
                    {handoffMethod === "pickup_return" ? "Pickup" : "Drop-off"}{" "}
                    · {window.shortName}
                  </span>
                  <span
                    className={`mt-1 block text-[0.65rem] font-medium ${
                      selectedWindow === window.id
                        ? "text-black/65"
                        : "text-stone-500"
                    }`}
                  >
                    {completionLabel} · {window.completionTime}
                  </span>
                </label>
              ))}
            </div>

            <p className="mt-3 text-xs leading-5 text-stone-500">
              {selectedAvailability === "weekday"
                ? `${completionLabel} is scheduled the next day from 6:00–7:30 AM.`
                : `Weekend ${completionLabel.toLowerCase()} times include the 2-hour cleaning buffer and finish by 11:00 PM.`}
            </p>
          </>
        ) : (
          <p className="text-xs leading-5 text-stone-500">
            Choose a calendar date to see its available handoff times.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs leading-5 text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
