import { Link, useParams } from "wouter";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  ArrowLeft, MapPin, Clock, Users, Zap, 
  AlertTriangle, CheckCircle2, Info, FileText 
} from "lucide-react";
import { useGetOutage, getGetOutageQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function OutageDetail() {
  const params = useParams();
  const id = params.id ? parseInt(params.id, 10) : 0;

  const { data: outage, isLoading, isError } = useGetOutage(id, {
    query: {
      enabled: !!id,
      queryKey: getGetOutageQueryKey(id)
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-border/50 h-16 flex items-center px-4 shadow-sm">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-32 ml-4" />
        </header>
        <div className="p-4 flex flex-col gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !outage) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Kayıt Bulunamadı</h2>
        <p className="text-muted-foreground mb-6">Aradığınız kesinti kaydına ulaşılamadı veya silinmiş olabilir.</p>
        <Link href="/" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium shadow-sm active:scale-95 transition-transform">
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const startTime = parseISO(outage.startTime);
  const endTime = parseISO(outage.endTime);

  const getStatusDisplay = (status: typeof outage.status) => {
    switch (status) {
      case "active":
        return (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
            <div className="bg-destructive/20 p-2 rounded-full animate-pulse-ring">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm uppercase tracking-wider">Durum</p>
              <p className="font-semibold text-lg">Aktif Kesinti</p>
            </div>
          </div>
        );
      case "planned":
        return (
          <div className="bg-amber-100 text-amber-800 border border-amber-200 rounded-lg p-4 flex items-center gap-3 dark:bg-amber-900/20 dark:text-amber-500">
            <div className="bg-amber-200/50 p-2 rounded-full dark:bg-amber-900/50">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm uppercase tracking-wider opacity-80">Durum</p>
              <p className="font-semibold text-lg">Planlı Kesinti</p>
            </div>
          </div>
        );
      case "completed":
        return (
          <div className="bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg p-4 flex items-center gap-3 dark:bg-emerald-900/20 dark:text-emerald-500">
            <div className="bg-emerald-200/50 p-2 rounded-full dark:bg-emerald-900/50">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm uppercase tracking-wider opacity-80">Durum</p>
              <p className="font-semibold text-lg">Tamamlandı</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-background">
      <header className="bg-white border-b border-border/50 h-16 flex items-center px-4 sticky top-0 z-20 shadow-sm dark:bg-card">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors dark:hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="ml-2 font-semibold text-lg">Kesinti Detayı</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4 pb-12">
        {getStatusDisplay(outage.status)}

        <Card className="border-border/60 shadow-sm overflow-hidden">
          <div className="bg-primary/5 px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-primary text-sm uppercase tracking-wide">Genel Bilgiler</h2>
          </div>
          <CardContent className="p-0 divide-y divide-border/50">
            
            <div className="p-4 flex gap-4">
              <div className="mt-0.5 text-muted-foreground"><MapPin className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">İlçe / Mahalleler</p>
                <p className="font-medium text-base text-foreground mb-1">{outage.district}</p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {outage.neighborhoods.join(", ")}
                </p>
              </div>
            </div>

            <div className="p-4 flex gap-4">
              <div className="mt-0.5 text-muted-foreground"><Clock className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Tarih & Saat</p>
                <p className="font-medium text-base text-foreground">
                  {format(startTime, "dd MMMM yyyy", { locale: tr })}
                </p>
                <p className="text-sm text-foreground/80 mt-0.5">
                  {format(startTime, "HH:mm", { locale: tr })} - {format(endTime, "HH:mm", { locale: tr })}
                </p>
              </div>
            </div>

            <div className="p-4 flex gap-4">
              <div className="mt-0.5 text-muted-foreground"><Users className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Etkilenen Abone</p>
                <p className="font-medium text-base text-foreground">
                  {outage.affectedCount.toLocaleString('tr-TR')} Kişi
                </p>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm overflow-hidden">
          <div className="bg-primary/5 px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-primary text-sm uppercase tracking-wide">Açıklama & Neden</h2>
          </div>
          <CardContent className="p-4">
            <p className="text-sm leading-relaxed font-medium">
              {outage.reason}
            </p>
            {outage.note && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm font-semibold text-muted-foreground mb-1">Ek Not</p>
                <p className="text-sm leading-relaxed text-foreground/80 italic">
                  {outage.note}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}