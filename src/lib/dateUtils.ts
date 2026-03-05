export type PresetKey = "today" | "week" | "month" | "year";

export interface DateRange {
    startDate: string;
    endDate: string;
}

const toISO = (d: Date) => d.toISOString().slice(0, 10);
export const todayISO = () => toISO(new Date());

export const PRESETS: { key: PresetKey; label: string; sublabel: string }[] = [
    { key: "today", label: "Today", sublabel: "Current day only" },
    { key: "week", label: "This Week", sublabel: "Sun \u2192 Sat" },
    { key: "month", label: "This Month", sublabel: "Month to date" },
    { key: "year", label: "This Year", sublabel: "Jan \u2192 Dec" },
];

export const getPresetRange = (preset: PresetKey): DateRange => {
    const now = new Date();
    if (preset === "today") {
        const d = toISO(now);
        return { startDate: d, endDate: d };
    }
    if (preset === "week") {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { startDate: toISO(start), endDate: toISO(end) };
    }
    if (preset === "month") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { startDate: toISO(start), endDate: toISO(end) };
    }
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return { startDate: toISO(start), endDate: toISO(end) };
};

export const fmtDisplay = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
};
