import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

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

// Get route between two points
export function getRouteBetween(params: {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  mode: TravelMode;
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
