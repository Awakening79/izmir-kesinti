import {
  BatteryCharging,
  PlugZap,
  Download,
  Flashlight,
  Droplets,
  NotebookPen,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

interface Tip {
  icon: LucideIcon;
  text: string;
  detail: string;
}

const TIPS: Tip[] = [
  {
    icon: BatteryCharging,
    text: "Powerbanklarınızı şarj edin",
    detail: "Kesinti başlamadan önce tüm taşınabilir şarj cihazlarını doldurun.",
  },
  {
    icon: PlugZap,
    text: "Cihazlarınızı prizden çekin",
    detail: "Akım dalgalanmalarına karşı hassas elektronik aletleri fişten çekin.",
  },
  {
    icon: Download,
    text: "Çevrimdışı harita indirin",
    detail: "Şehir rehberinden bölgenizin haritasını önceden indirin.",
  },
  {
    icon: Flashlight,
    text: "El fenerini hazır tutun",
    detail: "Kesinti süresince güvenlik için bir el feneri erişilebilir yerde bulundurun.",
  },
  {
    icon: Droplets,
    text: "Temel ihtiyaçlarınızı hazırlayın",
    detail: "Su ve temel gıda maddelerini elinizin altında bulundurun.",
  },
  {
    icon: NotebookPen,
    text: "Önemli numaraları not alın",
    detail: "GDZ Elektrik arıza hattı: 186",
  },
];

interface EmergencyTipsProps {
  hasActiveOrPlanned: boolean;
  isActive: boolean;
}

export function EmergencyTips({ hasActiveOrPlanned, isActive }: EmergencyTipsProps) {
  if (!hasActiveOrPlanned) return null;

  return (
    <div
      data-testid="section-emergency-tips"
      className="rounded-xl overflow-hidden border border-amber-200/70 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 dark:border-amber-800/40 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-200/60 dark:border-amber-800/40">
        <div className="bg-amber-500 p-1.5 rounded-lg shrink-0">
          <ShieldAlert className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-amber-900 dark:text-amber-300 leading-tight">
            Acil Durum İpuçları
          </p>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/70 font-medium">
            {isActive
              ? "Bölgenizde aktif bir kesinti var"
              : "Bölgenizde kesinti planlanıyor"}
          </p>
        </div>
      </div>

      {/* Tips list */}
      <ul className="divide-y divide-amber-200/50 dark:divide-amber-800/30">
        {TIPS.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <li
              key={index}
              data-testid={`tip-item-${index}`}
              className="flex items-start gap-3 px-4 py-3"
            >
              <div className="shrink-0 mt-0.5 bg-white dark:bg-white/10 border border-amber-200 dark:border-amber-700/50 rounded-lg p-1.5 shadow-xs">
                <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-semibold text-amber-900 dark:text-amber-200 leading-tight">
                  {tip.text}
                </span>
                <span className="text-[12px] text-amber-700/70 dark:text-amber-400/60 leading-snug">
                  {tip.detail}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
