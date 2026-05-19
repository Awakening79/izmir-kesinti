import { useState } from "react";
import { 
  useListOutages, 
  useGetOutageSummary, 
  useListDistricts, 
  getListOutagesQueryKey 
} from "@workspace/api-client-react";
import { Zap, AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { OutageCard } from "@/components/outage-card";

export default function Home() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const { data: summary, isLoading: isLoadingSummary } = useGetOutageSummary();
  const { data: districts, isLoading: isLoadingDistricts } = useListDistricts();
  
  const queryParams = selectedDistrict && selectedDistrict !== "all" 
    ? { district: selectedDistrict } 
    : undefined;

  const { data: outages, isLoading: isLoadingOutages } = useListOutages(
    queryParams,
    { query: { queryKey: getListOutagesQueryKey(queryParams) } }
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-12 pb-6 px-6 shadow-md relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">İzmir Elektrik</h1>
            <p className="text-primary-foreground/80 text-sm font-medium">Kesinti Takip Merkezi</p>
          </div>
        </div>

        {/* Summary Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center">
            {isLoadingSummary ? (
              <Skeleton className="h-6 w-10 bg-white/20 mb-1" />
            ) : (
              <span className="text-xl font-bold text-white">{summary?.totalActive || 0}</span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-foreground/80 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Aktif
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center">
            {isLoadingSummary ? (
              <Skeleton className="h-6 w-10 bg-white/20 mb-1" />
            ) : (
              <span className="text-xl font-bold text-white">{summary?.totalPlanned || 0}</span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-foreground/80 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Planlı
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center">
            {isLoadingSummary ? (
              <Skeleton className="h-6 w-10 bg-white/20 mb-1" />
            ) : (
              <span className="text-xl font-bold text-white">{summary?.totalCompleted || 0}</span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-foreground/80 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Biten
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 flex flex-col gap-6">
        
        {/* Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground px-1">İlçe Seçin</label>
          <Select 
            value={selectedDistrict} 
            onValueChange={setSelectedDistrict}
            disabled={isLoadingDistricts}
          >
            <SelectTrigger className="w-full bg-white h-12 shadow-sm border-border/50 text-base">
              <SelectValue placeholder="Tüm İlçeler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm İlçeler</SelectItem>
              {districts?.map((d) => (
                <SelectItem key={d.name} value={d.name}>
                  {d.name} <span className="text-muted-foreground ml-1 text-xs">({d.activeCount + d.plannedCount})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4 pb-12">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-semibold text-lg">Güncel Kesintiler</h2>
            {outages && (
              <span className="text-sm text-muted-foreground font-medium">{outages.length} Kayıt</span>
            )}
          </div>

          {isLoadingOutages ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))
          ) : outages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-border/50 border-dashed">
              <div className="bg-primary/5 p-4 rounded-full mb-4">
                <Search className="h-8 w-8 text-primary/40" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Kayıt Bulunamadı</h3>
              <p className="text-muted-foreground text-sm">
                Seçili bölge için planlı veya aktif bir elektrik kesintisi bulunmuyor.
              </p>
            </div>
          ) : (
            outages?.map((outage) => (
              <OutageCard key={outage.id} outage={outage} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}