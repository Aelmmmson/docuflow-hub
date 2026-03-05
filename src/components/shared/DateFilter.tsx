/**
 * DateFilter Component
 * ====================
 * Shared filter for selecting date ranges (Presets + Custom).
 */

import { useCallback, useEffect, useRef, useState, ReactNode } from "react";
import { ChevronDown, Calendar, CalendarRange, Check, X } from "lucide-react";
import { fmtDisplay, DateRange, PresetKey, getPresetRange, PRESETS, todayISO } from "@/lib/dateUtils";

interface DateFilterProps {
    onFilterChange: (range: DateRange | null) => void;
    className?: string;
    variant?: "default" | "inline";
    allowClear?: boolean;
}

export function DateFilter({ onFilterChange, className = "", variant = "default", allowClear = false }: DateFilterProps) {
    const isInline = variant === "inline";

    const [activePreset, setActivePreset] = useState<PresetKey | null>(allowClear ? null : "today");
    const [activeRange, setActiveRange] = useState<DateRange | null>(allowClear ? null : getPresetRange("today"));
    const [isCustomActive, setIsCustomActive] = useState(false);

    const [periodOpen, setPeriodOpen] = useState(false);
    const [customOpen, setCustomOpen] = useState(false);
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");

    const periodRef = useRef<HTMLDivElement>(null);
    const customRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (periodRef.current && !periodRef.current.contains(e.target as Node)) setPeriodOpen(false);
            if (customRef.current && !customRef.current.contains(e.target as Node)) setCustomOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handlePreset = (preset: PresetKey) => {
        const range = getPresetRange(preset);
        setActivePreset(preset);
        setActiveRange(range);
        setIsCustomActive(false);
        setCustomStart("");
        setCustomEnd("");
        setPeriodOpen(false);
        onFilterChange(range);
    };

    const handleApplyCustom = () => {
        if (!customStart || !customEnd) return;
        const range: DateRange = { startDate: customStart, endDate: customEnd };
        setActiveRange(range);
        setActivePreset(null);
        setIsCustomActive(true);
        setCustomOpen(false);
        onFilterChange(range);
    };

    const handleClearOrCloseCustom = () => {
        // If there are inputs or an active custom filter, clear it.
        if (customStart || customEnd || isCustomActive) {
            setCustomStart("");
            setCustomEnd("");
            setIsCustomActive(false);

            if (allowClear) {
                setActivePreset(null);
                setActiveRange(null);
                onFilterChange(null);
            } else {
                setActivePreset("today");
                const range = getPresetRange("today");
                setActiveRange(range);
                onFilterChange(range);
            }
        }

        // Always close the custom popover when this button is clicked
        setCustomOpen(false);
    };

    const periodLabel = activePreset ? (PRESETS.find((p) => p.key === activePreset)?.label ?? "Period") : "Period";
    let dateLabel = "";
    if (activeRange) {
        dateLabel = (isCustomActive || activeRange.startDate !== activeRange.endDate)
            ? `${fmtDisplay(activeRange.startDate)} \u2013 ${fmtDisplay(activeRange.endDate)}`
            : fmtDisplay(activeRange.startDate);
    } else {
        dateLabel = "All time";
    }

    return (
        <div className={`flex ${isInline ? 'flex-row' : 'flex-col'} items-center gap-2 ${className}`}>
            <div className="flex items-center gap-2">

                {/* Period dropdown (Hidden in inline variant) */}
                {!isInline && (
                    <>
                        <div ref={periodRef} className="relative">
                            <button
                                onClick={() => { setPeriodOpen((v) => !v); setCustomOpen(false); }}
                                className={`
                                  group inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-lg text-[11px] font-semibold
                                  border transition-all duration-150 select-none
                                  ${!isCustomActive && activeRange
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-background/80 text-foreground border-border hover:border-primary/40 hover:bg-muted/50"}
                                `}
                            >
                                <Calendar className="w-3 h-3 shrink-0" />
                                {periodLabel}
                                <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-150 ${periodOpen ? "rotate-180" : ""}`} />
                            </button>

                            {periodOpen && (
                                <div className="absolute top-[calc(100%+5px)] left-1/2 -translate-x-1/2 z-[70]
                                  w-52 py-1.5 rounded-xl border border-border bg-popover/95 backdrop-blur-md shadow-xl
                                  animate-in fade-in-0 zoom-in-95 origin-top duration-100">
                                    <p className="px-3 pt-1 pb-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                        Select period
                                    </p>
                                    {PRESETS.map(({ key, label, sublabel }) => (
                                        <button
                                            key={key}
                                            onClick={() => handlePreset(key)}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-1.5 rounded-lg mx-1
                                                text-xs font-medium transition-colors duration-100 text-left group/item
                                                ${activePreset === key && !isCustomActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-foreground hover:bg-muted/60"}
                                              `}
                                            style={{ width: "calc(100% - 8px)" }}
                                        >
                                            <div>
                                                <span className="block leading-tight">{label}</span>
                                                <span className="block text-[9px] text-muted-foreground leading-tight mt-0.5">{sublabel}</span>
                                            </div>
                                            {activePreset === key && !isCustomActive && (
                                                <Check className="w-3 h-3 text-primary shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                    {allowClear && (
                                        <div className="pt-1 mt-1 border-t border-border">
                                            <button
                                                onClick={() => {
                                                    setActivePreset(null);
                                                    setActiveRange(null);
                                                    setPeriodOpen(false);
                                                    onFilterChange(null);
                                                }}
                                                className="w-[calc(100%-8px)] mx-1 flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/60"
                                            >
                                                Clear Date Filter
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <span className="h-5 w-px bg-border/60" />
                    </>
                )}

                {/* Custom range area */}
                {isInline ? (
                    // INLINE MODE
                    customOpen || isCustomActive ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">From</span>
                            <input
                                type="date"
                                value={customStart}
                                max={customEnd || undefined}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="h-8 text-[11px] px-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                            />
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest pl-1">To</span>
                            <input
                                type="date"
                                value={customEnd}
                                min={customStart || undefined}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="h-8 text-[11px] px-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                            />
                            <button
                                onClick={handleApplyCustom}
                                disabled={!customStart || !customEnd}
                                className="h-8 px-3 ml-1 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
                            >
                                Apply
                            </button>
                            <button
                                onClick={handleClearOrCloseCustom}
                                className="h-8 px-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive transition-colors ml-1 flex items-center gap-1 text-[11px] font-medium"
                            >
                                <X className="w-3.5 h-3.5" />
                                {(customStart || customEnd || isCustomActive) ? "Clear" : "Close"}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setCustomOpen(true)}
                            className="inline-flex items-center gap-1.5 h-8 pl-3 pr-3 rounded-lg text-[11px] font-semibold text-foreground border border-border transition-all duration-150 hover:border-primary/40 hover:bg-muted/50 select-none bg-background/80"
                        >
                            <CalendarRange className="w-3 h-3 shrink-0" />
                            Custom Range
                        </button>
                    )
                ) : (
                    // DEFAULT MODE (Dropdown)
                    <div ref={customRef} className="relative">
                        <button
                            onClick={() => { setCustomOpen((v) => !v); setPeriodOpen(false); }}
                            className={`
                              inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-lg text-[11px] font-semibold
                              border transition-all duration-150 select-none
                              ${isCustomActive
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-background/80 text-foreground border-border hover:border-primary/40 hover:bg-muted/50"}
                            `}
                        >
                            <CalendarRange className="w-3 h-3 shrink-0" />
                            <span className="max-w-[140px] truncate">
                                {isCustomActive && activeRange ? `${fmtDisplay(activeRange.startDate)} \u2013 ${fmtDisplay(activeRange.endDate)}` : "Custom Range"}
                            </span>
                            <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-150 ${customOpen ? "rotate-180" : ""}`} />
                        </button>

                        {customOpen && (
                            <div className="absolute top-[calc(100%+5px)] right-0 z-[70]
                              w-64 rounded-xl border border-border bg-popover/95 backdrop-blur-md shadow-xl
                              animate-in fade-in-0 zoom-in-95 origin-top-right duration-100">
                                <div className="px-4 pt-3.5 pb-2 border-b border-border/60">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                        Custom date range
                                    </p>
                                </div>
                                <div className="px-4 py-3.5 space-y-3">
                                    <div>
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                                            From
                                        </label>
                                        <input
                                            type="date"
                                            value={customStart}
                                            max={customEnd || undefined}
                                            onChange={(e) => setCustomStart(e.target.value)}
                                            className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-border bg-background
                                              text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30
                                              transition-shadow cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                                            To
                                        </label>
                                        <input
                                            type="date"
                                            value={customEnd}
                                            min={customStart || undefined}
                                            onChange={(e) => setCustomEnd(e.target.value)}
                                            className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-border bg-background
                                              text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30
                                              transition-shadow cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="px-4 pb-3.5 flex gap-2">
                                    <button
                                        onClick={handleApplyCustom}
                                        disabled={!customStart || !customEnd}
                                        className="flex-1 h-7 rounded-lg text-[11px] font-semibold
                                          bg-primary text-primary-foreground
                                          hover:opacity-90 active:scale-[0.97]
                                          disabled:opacity-40 disabled:cursor-not-allowed
                                          transition-all duration-100"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        onClick={handleClearOrCloseCustom}
                                        className="h-7 px-3 rounded-lg text-[11px] font-medium
                                              text-muted-foreground hover:text-destructive border border-border
                                              hover:border-destructive/40 hover:bg-destructive/5
                                              transition-all duration-100"
                                    >
                                        {(customStart || customEnd || isCustomActive) ? "Clear" : "Close"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!isInline && (
                <p className="text-[10px] text-muted-foreground">
                    Showing: <span className="font-semibold text-foreground">{dateLabel}</span>
                </p>
            )}
        </div>
    );
}

