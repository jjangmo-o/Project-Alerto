import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type WaterStatus = "NORMAL" | "ALERT" | "WARNING" | "CRITICAL";

function parseNumber(value: string | null): number {
  if (!value) return NaN;
  return Number(value.replace(/\(\*\)/g, ""));
}

function getStatus(
  level: number,
  alert?: number,
  alarm?: number,
  critical?: number
): WaterStatus {
  if (critical && level >= critical) return "CRITICAL";
  if (alarm && level >= alarm) return "WARNING";
  if (alert && level >= alert) return "ALERT";
  return "NORMAL";
}

serve(async () => {
  try {
    const res = await fetch(
      "https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/water/table_list.do",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
          "isajax": "true",
          "Origin":
            "https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph",
          "Referer":
            "https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/water/",
          "User-Agent": "Mozilla/5.0 Project-Alerto",
        },
        body: "",
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    interface StationData {
      obsnm: string;
      wl: string | null;
      alertwl?: string | null;
      alarmwl?: string | null;
      criticalwl?: string | null;
      [key: string]: unknown;
    }

    const data: StationData[] = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Unexpected FFWS response format");
    }

    // Use Nangka as Marikina reference station
    const nangka = data.find(
      (row) =>
        typeof row.obsnm === "string" &&
        row.obsnm.toUpperCase() === "NANGKA"
    );

    if (!nangka) {
      throw new Error("Nangka station not found");
    }

    const levelMeters = parseNumber(nangka.wl);
    const alertLevel = parseNumber(nangka.alertwl);
    const alarmLevel = parseNumber(nangka.alarmwl);
    const criticalLevel = parseNumber(nangka.criticalwl);

    const status = getStatus(
      levelMeters,
      alertLevel,
      alarmLevel,
      criticalLevel
    );

    return new Response(
      JSON.stringify({
        levelMeters,
        status,
        station: "Marikina River (Nangka Station)",
        thresholds: {
          alert: alertLevel || null,
          alarm: alarmLevel || null,
          critical: criticalLevel || null,
        },
        source: "PAGASA Pasig–Marikina–Tullahan FFWS",
        timestamp: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PAGASA FFWS API error:", error);

    return new Response(
      JSON.stringify({ error: "Unable to fetch water level data" }),
      { status: 503 }
    );
  }
});
