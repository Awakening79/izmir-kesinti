import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

type OutageStatus = "planned" | "active" | "completed";

interface Outage {
  id: number;
  district: string;
  neighborhoods: string[];
  startTime: string;
  endTime: string;
  reason: string;
  status: OutageStatus;
  affectedCount: number;
  note: string | null;
}

/**
 * Returns midnight (00:00:00.000) of today in local time as a Date.
 */
function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns a Date set to HH:MM on today (offset = 0) or tomorrow (offset = 1).
 */
function dayAt(dayOffset: 0 | 1, hour: number, minute = 0): string {
  const d = startOfToday();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * Derives the correct status for an outage based on current real time.
 * Avoids stale status when the server is long-running.
 */
function deriveStatus(startIso: string, endIso: string): OutageStatus {
  const now = Date.now();
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (now < start) return "planned";
  if (now >= start && now < end) return "active";
  return "completed";
}

/**
 * Generates a fresh outage list on every call, anchored to today/tomorrow
 * calendar days with fixed clock-time slots. This guarantees the "Bugün"
 * and "Yarın" date filters always match the correct outages regardless of
 * what time the server started or how long it has been running.
 */
function generateOutages(): Outage[] {
  const raw: Array<Omit<Outage, "status">> = [
    // ── TODAY ────────────────────────────────────────────────
    {
      id: 1,
      district: "Bornova",
      neighborhoods: ["Ege Mahallesi", "Kazımdirik", "Altındağ"],
      startTime: dayAt(0, 8, 0),
      endTime: dayAt(0, 12, 0),
      reason: "Şebeke bakım ve onarım çalışmaları",
      affectedCount: 3200,
      note: "Çalışmalar süresince müşterilerimizden özür dileriz.",
    },
    {
      id: 2,
      district: "Karşıyaka",
      neighborhoods: ["Mavişehir", "Bostanlı", "Tersane"],
      startTime: dayAt(0, 10, 0),
      endTime: dayAt(0, 14, 0),
      reason: "Trafo yenileme çalışması",
      affectedCount: 1800,
      note: null,
    },
    {
      id: 3,
      district: "Konak",
      neighborhoods: ["Alsancak", "Hatay", "Güzelyalı"],
      startTime: dayAt(0, 6, 0),
      endTime: dayAt(0, 9, 0),
      reason: "Kablo yenileme",
      affectedCount: 950,
      note: "Çalışmalar tamamlanmıştır.",
    },
    {
      id: 4,
      district: "Gaziemir",
      neighborhoods: ["Aktepe", "Emrez", "Limontepe"],
      startTime: dayAt(0, 13, 0),
      endTime: dayAt(0, 17, 30),
      reason: "Arıza giderme ve bakım",
      affectedCount: 700,
      note: null,
    },
    {
      id: 5,
      district: "Buca",
      neighborhoods: ["Adatepe Mahallesi", "Çamlıkule", "Kaynaklar"],
      startTime: dayAt(0, 15, 0),
      endTime: dayAt(0, 19, 0),
      reason: "Hat genişletme çalışması",
      affectedCount: 2100,
      note: null,
    },
    {
      id: 6,
      district: "Konak",
      neighborhoods: ["Basmane", "Çankaya", "Kemeraltı"],
      startTime: dayAt(0, 7, 30),
      endTime: dayAt(0, 11, 30),
      reason: "OG/AG trafo değişimi",
      affectedCount: 2700,
      note: null,
    },
    // ── TOMORROW ─────────────────────────────────────────────
    {
      id: 7,
      district: "Bornova",
      neighborhoods: ["Doğanlar", "Yeşilova", "Işıkkent"],
      startTime: dayAt(1, 8, 0),
      endTime: dayAt(1, 13, 0),
      reason: "Trafo merkezi bakımı",
      affectedCount: 4500,
      note: "Planlı bakım çalışması.",
    },
    {
      id: 8,
      district: "Karşıyaka",
      neighborhoods: ["Alaybey", "Çiçekli", "Salhane"],
      startTime: dayAt(1, 9, 0),
      endTime: dayAt(1, 12, 0),
      reason: "Enerji nakil hattı güçlendirme",
      affectedCount: 600,
      note: null,
    },
    {
      id: 9,
      district: "Balçova",
      neighborhoods: ["İnciraltı", "Teleferik", "Narlıdere"],
      startTime: dayAt(1, 10, 0),
      endTime: dayAt(1, 15, 0),
      reason: "Yer altı kablo döşeme çalışması",
      affectedCount: 1350,
      note: null,
    },
    {
      id: 10,
      district: "Çiğli",
      neighborhoods: ["Küçükçiğli", "Harmandalı", "Balatçık"],
      startTime: dayAt(1, 13, 0),
      endTime: dayAt(1, 18, 0),
      reason: "Şalt tesisi periyodik bakımı",
      affectedCount: 3100,
      note: "Müşterilerimizin mağduriyetini en aza indirmek için çalışmalarımız sürmektedir.",
    },
  ];

  return raw.map((o) => ({
    ...o,
    status: deriveStatus(o.startTime, o.endTime),
  }));
}

router.get("/outages", (req: Request, res: Response) => {
  let result = generateOutages();

  const { district, status } = req.query;

  if (district && typeof district === "string") {
    result = result.filter(
      (o) => o.district.toLowerCase() === district.toLowerCase(),
    );
  }

  if (status && typeof status === "string") {
    result = result.filter((o) => o.status === status);
  }

  result.sort((a, b) => {
    const order: Record<OutageStatus, number> = {
      active: 0,
      planned: 1,
      completed: 2,
    };
    return order[a.status] - order[b.status];
  });

  res.json(result);
});

router.get("/outages/summary", (_req: Request, res: Response) => {
  const outages = generateOutages();

  const districtMap: Record<
    string,
    { activeCount: number; plannedCount: number; completedCount: number }
  > = {};

  for (const o of outages) {
    if (!districtMap[o.district]) {
      districtMap[o.district] = {
        activeCount: 0,
        plannedCount: 0,
        completedCount: 0,
      };
    }
    districtMap[o.district][`${o.status}Count`]++;
  }

  const byDistrict = Object.entries(districtMap).map(([name, counts]) => ({
    name,
    ...counts,
  }));

  const totalActive = outages.filter((o) => o.status === "active").length;
  const totalPlanned = outages.filter((o) => o.status === "planned").length;
  const totalCompleted = outages.filter((o) => o.status === "completed").length;
  const totalAffected = outages
    .filter((o) => o.status !== "completed")
    .reduce((sum, o) => sum + o.affectedCount, 0);

  res.json({
    totalActive,
    totalPlanned,
    totalCompleted,
    totalAffected,
    byDistrict,
  });
});

router.get("/outages/:id", (req: Request, res: Response) => {
  const outages = generateOutages();
  const id = parseInt(String(req.params.id), 10);
  const outage = outages.find((o) => o.id === id);
  if (!outage) {
    res.status(404).json({ error: "Kesinti bulunamadı" });
    return;
  }
  res.json(outage);
});

router.get("/districts", (_req: Request, res: Response) => {
  const outages = generateOutages();

  const districtMap: Record<
    string,
    { activeCount: number; plannedCount: number; completedCount: number }
  > = {};

  for (const o of outages) {
    if (!districtMap[o.district]) {
      districtMap[o.district] = {
        activeCount: 0,
        plannedCount: 0,
        completedCount: 0,
      };
    }
    districtMap[o.district][`${o.status}Count`]++;
  }

  const districts = Object.entries(districtMap).map(([name, counts]) => ({
    name,
    ...counts,
  }));

  districts.sort((a, b) => a.name.localeCompare(b.name, "tr"));

  res.json(districts);
});

export default router;
