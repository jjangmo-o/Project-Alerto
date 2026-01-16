import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Exact Marikina City center (Google Maps)
const MARIKINA_LAT = 14.635356767811384;
const MARIKINA_LON = 121.10170399864334;

type EarthquakeStatus = "INFO" | "ADVISORY" | "WARNING";

// Haversine distance
function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function classifyEarthquake(
  mag: number,
  distanceKm: number
): EarthquakeStatus {
  if (distanceKm <= 10 && mag >= 2.0) return "WARNING";
  if (distanceKm <= 20 && mag >= 3.0) return "WARNING";
  if (distanceKm <= 50 && mag >= 3.5) return "ADVISORY";
  if (distanceKm <= 100 && mag >= 4.0) return "ADVISORY";
  return "INFO";
}

serve(async () => {
  try {
    // PHIVOLCS-like: include smaller quakes
    const res = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"
    );

    if (!res.ok) {
      throw new Error("Failed to fetch earthquake data");
    }

    const json = await res.json();

    if (!json?.features?.length) {
      throw new Error("No earthquake data available");
    }

    let nearest = null;
    let nearestDistance = Infinity;

    for (const feature of json.features) {
      const { mag, place, time } = feature.properties;
      const [lon, lat, depth] = feature.geometry.coordinates;

      const distanceKm = getDistanceKm(
        MARIKINA_LAT,
        MARIKINA_LON,
        lat,
        lon
      );

      if (distanceKm < nearestDistance) {
        nearestDistance = distanceKm;
        nearest = { mag, place, time, depth, distanceKm };
      }
    }

    if (!nearest) {
      throw new Error("No nearby earthquake found");
    }

    return new Response(
      JSON.stringify({
        magnitude: nearest.mag,
        depthKm: nearest.depth,
        distanceKm: Number(nearest.distanceKm.toFixed(1)),
        location: nearest.place,
        status: classifyEarthquake(
          nearest.mag,
          nearest.distanceKm
        ),
        basis:
          "Distance-first logic aligned with PHIVOLCS felt-earthquake criteria",
        source: "USGS Earthquake Feed (PHIVOLCS-referenced)",
        timestamp: new Date(nearest.time).toISOString(),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Earthquake API error:", error);

    return new Response(
      JSON.stringify({ error: "Unable to fetch earthquake data" }),
      { status: 503 }
    );
  }
});
