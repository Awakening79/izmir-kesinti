import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { MapPin, Clock, Users, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Outage } from "@workspace/api-client-react";

export function OutageCard({ outage }: { outage: Outage }) {
  const getStatusDisplay = (status: Outage["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="destructive" className="animate-pulse-ring gap-1 font-semibold uppercase tracking-wider text-[10px]">
            <Zap className="h-3 w-3" /> Aktif Kesinti
          </Badge>
        );
      case "planned":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 gap-1 font-semibold uppercase tracking-wider text-[10px] dark:bg-amber-900/30 dark:text-amber-500 dark:border-amber-900/50">
            <AlertTriangle className="h-3 w-3" /> Planlı
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 font-semibold uppercase tracking-wider text-[10px] dark:bg-emerald-900/30 dark:text-emerald-500 dark:border-emerald-900/50">
            <CheckCircle2 className="h-3 w-3" /> Tamamlandı
          </Badge>
        );
    }
  };

  const startTime = parseISO(outage.startTime);
  const endTime = parseISO(outage.endTime);

  return (
    <Link href={`/outage/${outage.id}`} className="block transition-transform active:scale-[0.98]">
      <Card className="hover-elevate cursor-pointer border-border/60 shadow-sm overflow-hidden group">
        <div className="bg-primary/5 px-4 py-3 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-primary">{outage.district}</span>
          </div>
          {getStatusDisplay(outage.status)}
        </div>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 min-w-4 text-muted-foreground"><Clock className="h-4 w-4" /></div>
            <div className="text-sm font-medium">
              {format(startTime, "dd MMM yyyy, HH:mm", { locale: tr })} - {format(endTime, "HH:mm", { locale: tr })}
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="mt-0.5 min-w-4 text-muted-foreground"><MapPin className="h-4 w-4" /></div>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {outage.neighborhoods.join(", ")}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">{outage.affectedCount.toLocaleString('tr-TR')} Abone</span>
            </div>
            <span className="text-xs font-semibold text-primary group-hover:underline underline-offset-2">
              Detayları Gör
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}