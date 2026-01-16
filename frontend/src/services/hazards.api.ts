import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

// ============================
// HAZARD GEOMETRY (MAP OVERLAYS)
// ============================

export const getFloodHazards = () =>
  axios.get(`${API}/hazards/flood`);

export const getEarthquakeHazards = () =>
  axios.get(`${API}/hazards/earthquake`);

// ============================
// HAZARD STATUS (C2 POLLING)
// ============================

export const getHazardStatus = () =>
  axios.get(`${API}/hazards/status`);

// ============================
// OPTIONAL: ADMIN CONTROLS
// ============================

export const enableFlood = () =>
  axios.post(`${API}/hazards/flood/enable`);

export const disableFlood = () =>
  axios.post(`${API}/hazards/flood/disable`);

export const enableEarthquake = () =>
  axios.post(`${API}/hazards/earthquake/enable`);

export const disableEarthquake = () =>
  axios.post(`${API}/hazards/earthquake/disable`);
