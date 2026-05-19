import { useState, useRef } from "react";
import { useListOutages, getListOutagesQueryKey } from "@workspace/api-client-react";
import type { Outage } from "@workspace/api-client-react";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Link } from "wouter";

type CheckState = "idle" | "found" | "safe";

export function AddressCheck() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [matchedOutages, setMatchedOutages] = useState<Outage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: allOutages } = useListOutages(
    undefined,
    { query: { queryKey: getListOutagesQueryKey(undefined) } },
  );

  function handleCheck() {
    const q = query.trim().toLowerCase();
    if (!q || !allOutages) return;

    setSubmittedQuery(query.trim());

    const matches = allOutages.filter(
      (o) =>
        (o.status === "active" || o.status === "planned") &&
        (o.neighborhoods.some((n) => n.toLowerCase().includes(q)) ||
          o.district.toLowerCase().includes(q) ||
          o.reason.toLowerCase().includes(q)),
    );

    setMatchedOutages(matches);
    setCheckState(matches.length > 0 ? "found" : "safe");
  }

  function handleReset() {
    setQuery("");
    setSubmittedQuery("");
    setCheckState("idle");
    setMatchedOutages([]);
    inputRef.current?.focus();
  }

  return (
    <div
      data-testid="section-address-check"
      className="rounded-xl border border-border/50 bg-white shadow-sm overflow-hidden"
    >
      {/* Section Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/40 flex items-center gap-2.5">
        <div className="bg-primary/10 p-1.5 rounded-lg">
          <Search className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-tight">
            Adres Kontrolü
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            Mahallenizi veya sokağınızı girin
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (checkState !== "idle") setCheckState("idle");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              placeholder="Örn: Ege Mahallesi, Bornova..."
              data-testid="input-address"
              className="w-full h-11 pl-9 pr-3 rounded-lg border border-border/60 bg-slate-50 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={handleCheck}
            disabled={!query.trim() || !allOutages}
            data-testid="button-kontrol-et"
            className="h-11 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5 shadow-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97] shrink-0"
          >
            Kontrol Et
          </button>
        </div>

        {/* Result: Outage Found */}
        {checkState === "found" && (
          <div
            data-testid="result-found"
            className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
          >
            {/* Warning Banner */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border-b border-red-200/60 dark:border-red-900/50">
              <div className="bg-red-500 p-1.5 rounded-lg shrink-0 animate-pulse">
                <ShieldAlert className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400 leading-tight">
                  Açık Kesinti Var!
                </p>
                <p className="text-[11px] text-red-600/80 dark:text-red-400/70 font-medium">
                  "{submittedQuery}" için {matchedOutages.length} kesinti bulundu
                </p>
              </div>
            </div>

            {/* Matched Outages */}
            <ul className="divide-y divide-red-200/50 dark:divide-red-900/40">
              {matchedOutages.map((o) => (
                <li key={o.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Zap
                        className={`h-3.5 w-3.5 shrink-0 ${
                          o.status === "active"
                            ? "text-red-500"
                            : "text-amber-500"
                        }`}
                      />
                      <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wide">
                        {o.status === "active" ? "Aktif Kesinti" : "Planlı Kesinti"}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-red-600/70 dark:text-red-400/60 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full shrink-0">
                      {o.district}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 mb-1">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs font-semibold">
                      {format(parseISO(o.startTime), "dd MMM, HH:mm", { locale: tr })}
                      {" – "}
                      {format(parseISO(o.endTime), "HH:mm", { locale: tr })}
                    </span>
                  </div>
                  <p className="text-[12px] text-red-600/80 dark:text-red-400/60 mb-2">
                    {o.neighborhoods.join(", ")}
                  </p>
                  <Link
                    href={`/outage/${o.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline underline-offset-2"
                    data-testid={`link-outage-detail-${o.id}`}
                  >
                    Detayları Gör <ChevronRight className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Reset */}
            <div className="px-4 py-2.5 bg-red-500/5 border-t border-red-200/40 flex justify-end">
              <button
                onClick={handleReset}
                data-testid="button-reset-address"
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline underline-offset-2"
              >
                Yeni arama yap
              </button>
            </div>
          </div>
        )}

        {/* Result: Safe */}
        {checkState === "safe" && (
          <div
            data-testid="result-safe"
            className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900/50 px-4 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="bg-emerald-500 p-2 rounded-xl shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
                Güvenli Bölge
              </p>
              <p className="text-[12px] text-emerald-700/80 dark:text-emerald-400/70 leading-snug">
                "{submittedQuery}" için planlı veya aktif kesinti bulunamadı.
              </p>
              <button
                onClick={handleReset}
                data-testid="button-reset-address-safe"
                className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline underline-offset-2"
              >
                Farklı adres sorgula
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
