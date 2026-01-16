import axios from 'axios';

// Use empty string as fallback so relative URLs work in production
const API = import.meta.env.VITE_API_URL || '';

export type TravelMode = 'walking' | 'driving' | 'two-wheeler';

// Get the nearest evacuation center (no route)
export function getNearestEvacuationCenter(params: {
  lat: number;
  lng: number;
  mode: TravelMode;
}) {
  return axios.get(
    `${API}/api/v1/evacuation-centers/nearest`,
    { params }
  );
}

// Get nearest evacuation center with route (combined endpoint)
export function getNearestWithRoute(params: {
  lat: number;
  lng: number;
  mode: TravelMode;
  testFlood?: boolean;
  testEarthquake?: boolean;
}) {
  return axios.get(
    `${API}/api/v1/evacuation-centers/nearest-route`,
    { params }
  );
}

// Get route between two points
export function getRouteBetween(params: {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  mode: TravelMode;
  testFlood?: boolean;
  testEarthquake?: boolean;
}) {
  return axios.get(
    `${API}/api/v1/evacuation-centers/route`,
    { params }
  );
}

// Get all evacuation centers
export function getAllEvacuationCenters() {
  return axios.get(`${API}/api/v1/evacuation-centers`);
}
