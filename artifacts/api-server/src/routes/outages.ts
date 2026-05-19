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

const now = new Date();

function hoursFromNow(h: number): string {
  return new Date(now.getTime() + h * 3600000).toISOString();
}

function hoursAgo(h: number): string {
  return new Date(now.getTime() - h * 3600000).toISOString();
}

const outages: Outage[] = [
  {
    id: 1,
    district: "Bornova",
    neighborhoods: ["Ege Mahallesi", "Kazımdirik", "Altındağ"],
    startTime: hoursAgo(1),
    endTime: hoursFromNow(3),
    reason: "Şebeke bakım ve onarım çalışmaları",
    status: "active",
    affectedCount: 3200,
    note: "Çalışmalar süresince müşterilerimizden özür dileriz.",
  },
  {
    id: 2,
    district: "Karşıyaka",
    neighborhoods: ["Mavişehir", "Bostanlı", "Tersane"],
    startTime: hoursFromNow(2),
    endTime: hoursFromNow(6),
    reason: "Trafo yenileme çalışması",
    status: "planned",
    affectedCount: 1800,
    note: null,
  },
  {
    id: 3,
    district: "Konak",
    neighborhoods: ["Alsancak", "Hatay", "Güzelyalı"],
    startTime: hoursAgo(3),
    endTime: hoursAgo(1),
    reason: "Kablo yenileme",
    status: "completed",
    affectedCount: 950,
    note: "Çalışmalar tamamlanmıştır.",
  },
  {
    id: 4,
    district: "Buca",
    neighborhoods: ["Adatepe Mahallesi", "Çamlıkule", "Kaynaklar"],
    startTime: hoursFromNow(5),
    endTime: hoursFromNow(9),
    reason: "Hat genişletme çalışması",
    status: "planned",
    affectedCount: 2100,
    note: null,
  },
  {
    id: 5,
    district: "Bornova",
    neighborhoods: ["Doğanlar", "Yeşilova", "Işıkkent"],
    startTime: hoursFromNow(24),
    endTime: hoursFromNow(28),
    reason: "Trafo merkezi bakımı",
    status: "planned",
    affectedCount: 4500,
    note: "Planlı bakım çalışması.",
  },
  {
    id: 6,
    district: "Gaziemir",
    neighborhoods: ["Aktepe", "Emrez", "Limontepe"],
    startTime: hoursAgo(2),
    endTime: hoursFromNow(1),
    reason: "Arıza giderme ve bakım",
    status: "active",
    affectedCount: 700,
    note: null,
  },
  {
    id: 7,
    district: "Karşıyaka",
    neighborhoods: ["Alaybey", "Çiçekli"],
    startTime: hoursAgo(5),
    endTime: hoursAgo(3),
    reason: "Enerji nakil hattı güçlendirme",
    status: "completed",
    affectedCount: 600,
    note: "Çalışmalar planlandığı gibi tamamlanmıştır.",
  },
  {
    id: 8,
    district: "Balçova",
    neighborhoods: ["İnciraltı", "Teleferik", "Narlıdere"],
    startTime: hoursFromNow(10),
    endTime: hoursFromNow(14),
    reason: "Yer altı kablo döşeme çalışması",
    status: "planned",
    affectedCount: 1350,
    note: null,
  },
  {
    id: 9,
    district: "Konak",
    neighborhoods: ["Basmane", "Çankaya", "Kemeraltı"],
    startTime: hoursFromNow(30),
    endTime: hoursFromNow(34),
    reason: "OG/AG trafo değişimi",
    status: "planned",
    affectedCount: 2700,
    note: null,
  },
  {
    id: 10,
    district: "Çiğli",
    neighborhoods: ["Küçükçiğli", "Harmandalı", "Balatçık"],
    startTime: hoursFromNow(48),
    endTime: hoursFromNow(52),
    reason: "Şalt tesisi periyodik bakımı",
    status: "planned",
    affectedCount: 3100,
    note: "Müşterilerimizin mağduriyetini en aza indirmek için çalışmalarımız sürmektedir.",
  },
];

router.get("/outages", (req: Request, res: Response) => {
  let result = [...outages];

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
  const id = parseInt(req.params.id, 10);
  const outage = outages.find((o) => o.id === id);
  if (!outage) {
    res.status(404).json({ error: "Kesinti bulunamadı" });
    return;
  }
  res.json(outage);
});

router.get("/districts", (_req: Request, res: Response) => {
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
