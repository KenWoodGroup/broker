const TASHKENT_TZ = "Asia/Tashkent";

export function formatDateTimeTashkent(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: TASHKENT_TZ,
    });
}

/** `datetime-local` value in Asia/Tashkent wall time (YYYY-MM-DDTHH:mm) */
export function toTashkentDatetimeLocalValue(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";

    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: TASHKENT_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const parts = fmt.formatToParts(d);
    const pick = (type) => parts.find((p) => p.type === type)?.value ?? "";

    const y = pick("year");
    const m = pick("month");
    const day = pick("day");
    const hh = pick("hour");
    const mm = pick("minute");

    if (!y || !m || !day || !hh || !mm) return "";
    return `${y}-${m}-${day}T${hh}:${mm}`;
}
