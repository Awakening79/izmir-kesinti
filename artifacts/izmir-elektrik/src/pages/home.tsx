import { useState, useMemo } from "react";
import {
  useListOutages,
  useGetOutageSummary,
  useListDistricts,
  getListOutagesQueryKey,
} from "@workspace/api-client-react";
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  Search,
  CalendarDays,
  X,
  List,
  Map,
  ExternalLink,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { OutageCard } from "@/components/outage-card";
import { EmergencyTips } from "@/components/emergency-tips";
import { AddressCheck } from "@/components/address-check";
import { isSameDay, addDays, parseISO } from "date-fns";

type DateFilter = "bugun" | "yarin" | null;
type ActiveTab = "liste" | "harita";

const MAP_SHARE_URL = "https://share.google/uW2zatmZZPIqKlfuS";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("liste");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("bugun");

  const { data: summary, isLoading: isLoadingSummary } = useGetOutageSummary();
  const { data: districts, isLoading: isLoadingDistricts } = useListDistricts();

  const queryParams =
    selectedDistrict && selectedDistrict !== "all"
      ? { district: selectedDistrict }
      : undefined;

  const { data: outages, isLoading: isLoadingOutages } = useListOutages(
    queryParams,
    { query: { queryKey: getListOutagesQueryKey(queryParams) } },
  );

  const filteredOutages = useMemo(() => {
    if (!outages) return [];
    let result = outages;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (o) =>
          o.neighborhoods.some((n) => n.toLowerCase().includes(q)) ||
          o.reason.toLowerCase().includes(q) ||
          o.district.toLowerCase().includes(q),
      );
    }

    if (dateFilter) {
      const today = new Date();
      const targetDate = dateFilter === "bugun" ? today : addDays(today, 1);
      result = result.filter((o) => {
        const start = parseISO(o.startTime);
        const end = parseISO(o.endTime);
        return isSameDay(start, targetDate) || isSameDay(end, targetDate);
      });
    }

    return result;
  }, [outages, searchQuery, dateFilter]);

  const hasActiveFilters =
    (selectedDistrict && selectedDistrict !== "all") ||
    searchQuery.trim() !== "" ||
    dateFilter !== null;

  const hasActiveOrPlanned = filteredOutages.some(
    (o) => o.status === "active" || o.status === "planned",
  );
  const isActive = filteredOutages.some((o) => o.status === "active");

  function clearAllFilters() {
    setSelectedDistrict("");
    setSearchQuery("");
    setDateFilter(null);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-12 pb-5 px-6 shadow-md relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">İzmir Elektrik</h1>
            <p className="text-primary-foreground/80 text-sm font-medium">
              Kesinti Takip Merkezi
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center">
            {isLoadingSummary ? (
              <Skeleton className="h-6 w-10 bg-white/20 mb-1" />
            ) : (
              <span className="text-xl font-bold text-white">
                {summary?.totalActive || 0}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-foreground/80 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Aktif
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center">
            {isLoadingSummary ? (
              <Skeleton className="h-6 w-10 bg-white/20 mb-1" />
            ) : (
              <span className="text-xl font-bold text-white">
                {summary?.totalPlanned || 0}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-foreground/80 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Planlı
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center">
            {isLoadingSummary ? (
              <Skeleton className="h-6 w-10 bg-white/20 mb-1" />
            ) : (
              <span className="text-xl font-bold text-white">
                {summary?.totalCompleted || 0}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-foreground/80 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Biten
            </span>
          </div>
        </div>

        {/* Tab Bar — lives inside header so it overlaps the content edge */}
        <div className="mt-5 -mx-6 -mb-5 px-6 pt-1 pb-0 flex border-t border-white/10">
          <button
            onClick={() => setActiveTab("liste")}
            data-testid="tab-liste"
            className={`flex items-center gap-2 px-4 pb-4 pt-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "liste"
                ? "border-white text-white"
                : "border-transparent text-primary-foreground/55 hover:text-primary-foreground/80"
            }`}
          >
            <List className="h-4 w-4" />
            Kesinti Listesi
          </button>
          <button
            onClick={() => setActiveTab("harita")}
            data-testid="tab-harita"
            className={`flex items-center gap-2 px-4 pb-4 pt-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "harita"
                ? "border-white text-white"
                : "border-transparent text-primary-foreground/55 hover:text-primary-foreground/80"
            }`}
          >
            <Map className="h-4 w-4" />
            Canlı Harita
          </button>
        </div>
      </header>

      {/* Tab: Liste */}
      {activeTab === "liste" && (
        <main className="flex-1 px-4 py-6 flex flex-col gap-4">
          {/* Address Check */}
          <AddressCheck />

          {/* District Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-muted-foreground px-1">
              İlçe Seçin
            </label>
            <Select
              value={selectedDistrict}
              onValueChange={setSelectedDistrict}
              disabled={isLoadingDistricts}
            >
              <SelectTrigger
                className="w-full bg-white h-12 shadow-sm border-border/50 text-base"
                data-testid="select-district"
              >
                <SelectValue placeholder="Tüm İlçeler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İlçeler</SelectItem>
                {districts?.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name}{" "}
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({d.activeCount + d.plannedCount})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none h-[18px] w-[18px]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mahalle veya sokak ara..."
              data-testid="input-search"
              className="w-full h-12 pl-10 pr-10 rounded-lg border border-border/50 bg-white shadow-sm text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                data-testid="button-clear-search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Date Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDateFilter(dateFilter === "bugun" ? null : "bugun")
              }
              data-testid="button-filter-bugun"
              className={`flex-1 h-11 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                dateFilter === "bugun"
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-white text-foreground border-border/50 hover:border-primary/40 hover:bg-primary/5 shadow-sm"
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Bugün
            </button>
            <button
              onClick={() =>
                setDateFilter(dateFilter === "yarin" ? null : "yarin")
              }
              data-testid="button-filter-yarin"
              className={`flex-1 h-11 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                dateFilter === "yarin"
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-white text-foreground border-border/50 hover:border-primary/40 hover:bg-primary/5 shadow-sm"
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Yarın
            </button>
          </div>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              data-testid="button-clear-all-filters"
              className="self-start flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/15 px-3 py-1.5 rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Filtreleri Temizle
            </button>
          )}

          {/* Emergency Tips */}
          {!isLoadingOutages && (
            <EmergencyTips
              hasActiveOrPlanned={hasActiveOrPlanned}
              isActive={isActive}
            />
          )}

          {/* Outage List */}
          <div className="flex flex-col gap-4 pb-12">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-semibold text-lg">Güncel Kesintiler</h2>
              {!isLoadingOutages && (
                <span className="text-sm text-muted-foreground font-medium">
                  {filteredOutages.length} Kayıt
                </span>
              )}
            </div>

            {isLoadingOutages ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))
            ) : filteredOutages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-border/50 border-dashed">
                <div className="bg-primary/5 p-4 rounded-full mb-4">
                  <Search className="h-8 w-8 text-primary/40" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Kayıt Bulunamadı</h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery
                    ? `"${searchQuery}" için sonuç bulunamadı.`
                    : "Seçili filtreler için planlı veya aktif bir kesinti bulunmuyor."}
                </p>
              </div>
            ) : (
              filteredOutages.map((outage) => (
                <OutageCard key={outage.id} outage={outage} />
              ))
            )}
          </div>
        </main>
      )}

      {/* Tab: Harita */}
      {activeTab === "harita" && (
        <div className="flex-1 flex flex-col" data-testid="tab-panel-harita">
          {/* Map iframe — fills all remaining space */}
          <div className="flex-1 relative bg-slate-100">
            <iframe
              src={MAP_SHARE_URL}
              title="GDZ Elektrik Canlı Kesinti Haritası"
              data-testid="iframe-map"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>

          {/* Footer strip with external link */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-border/40 shrink-0">
            <span className="text-xs text-muted-foreground font-medium">
              GDZ Elektrik — Resmi Kesinti Haritası
            </span>
            <a
              href={MAP_SHARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-open-map"
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Haritayı Aç
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
