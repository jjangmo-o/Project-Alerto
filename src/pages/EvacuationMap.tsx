import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

import { getNearestEvacuationCenter, getRouteBetween, getAllEvacuationCenters } from '../services/evacuationCenters.api';
import type { TravelMode } from '../services/evacuationCenters.api';
import {
  getFloodHazards,
  getEarthquakeHazards,
} from '../services/hazards.api';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { io, Socket } from 'socket.io-client';

import './EvacuationMap.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Types
interface EvacuationCenter {
  id: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
}

interface Origin {
  lat: number;
  lng: number;
}

// Routing intent types
type RoutingIntent = 
  | { type: 'nearest' }
  | { type: 'specific'; center: EvacuationCenter };

const EvacuationMap = () => {
  const { profile } = useAuth();
  const userName = profile?.first_name || 'User';

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<EvacuationCenter | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [travelMode, setTravelMode] = useState<TravelMode>('walking');

  const [hasRouted, setHasRouted] = useState(false);
  const [pinMode, setPinMode] = useState(false);

  const [origin, setOrigin] = useState<Origin | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Track current routing intent
  const routingIntentRef = useRef<RoutingIntent | null>(null);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const mapInitializedRef = useRef(false);

  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // ============================
  // MAP INIT (Marikina default)
  // ============================
  useEffect(() => {
    if (!mapContainerRef.current || mapInitializedRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [121.097, 14.650], // Marikina
      zoom: 12,
    });

    map.on('load', () => {
      map.fitBounds(
        [
          [121.05, 14.62],
          [121.13, 14.69],
        ],
        { padding: 40 }
      );
      setMapReady(true);
    });

    mapRef.current = map;
    mapInitializedRef.current = true;

    return () => {
      map.remove();
      mapRef.current = null;
      mapInitializedRef.current = false;
      setMapReady(false);
    };
  }, []);

  // ============================
  // GEOCODER (SINGLE INSTANCE)
  // ============================
  useEffect(() => {
    const map = mapRef.current;
    const container = geocoderContainerRef.current;
    
    if (!map || !container) return;
    // Prevent duplicate geocoder
    if (geocoderRef.current) return;
    // Wait for map to be loaded
    if (!map.loaded()) {
      const onLoad = () => {
        if (!geocoderRef.current && container) {
          initGeocoder(map, container);
        }
      };
      map.on('load', onLoad);
      return () => {
        map.off('load', onLoad);
      };
    } else {
      initGeocoder(map, container);
    }
  }, []);

  const initGeocoder = (map: mapboxgl.Map, container: HTMLDivElement) => {
    // Clear any existing geocoder content
    container.innerHTML = '';
    
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken!,
      mapboxgl,
      marker: false,
      placeholder: 'Search address or place',
    });

    geocoder.addTo(container);

    geocoder.on('result', (e: { result: { center: [number, number] } }) => {
      const [lng, lat] = e.result.center;
      // Set origin immediately and show marker
      setOriginMarker(lng, lat, '#0ea5e9');
      setOrigin({ lat, lng });
      map.flyTo({ center: [lng, lat], zoom: 15 });
      // NO auto-routing
    });

    geocoderRef.current = geocoder;
  };

  // ============================
  // MARKERS
  // ============================
  const setOriginMarker = useCallback((lng: number, lat: number, color: string) => {
    if (!mapRef.current) return;
    
    // Remove existing origin marker
    originMarkerRef.current?.remove();
    
    // Create and add new marker immediately
    const marker = new mapboxgl.Marker({ color })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);
    
    originMarkerRef.current = marker;
  }, []);

  const setDestinationMarker = useCallback((lng: number, lat: number) => {
    if (!mapRef.current) return;
    
    destinationMarkerRef.current?.remove();
    
    const marker = new mapboxgl.Marker({ color: '#dc2626' })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);
    
    destinationMarkerRef.current = marker;
  }, []);

  // ============================
  // PIN MODE
  // ============================
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const handler = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      
      // Set marker immediately (before state update)
      setOriginMarker(lng, lat, '#f59e0b');
      
      // Update state
      setOrigin({ lat, lng });
      
      // Fly to location with single zoom level (no flicker)
      map.flyTo({ 
        center: [lng, lat], 
        zoom: Math.max(map.getZoom(), 14), // Don't zoom out
        duration: 500 
      });
      
      // Turn off pin mode after placing
      setPinMode(false);
    };

    if (pinMode) {
      map.getCanvas().style.cursor = 'crosshair';
      map.on('click', handler);
    } else {
      map.getCanvas().style.cursor = '';
    }

    return () => {
      map.off('click', handler);
      if (map.getCanvas()) {
        map.getCanvas().style.cursor = '';
      }
    };
  }, [pinMode, mapReady, setOriginMarker]);

  // ============================
  // USE MY LOCATION
  // ============================
  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        
        // Set marker immediately
        setOriginMarker(longitude, latitude, '#16a34a');
        
        // Update state
        setOrigin({ lat: latitude, lng: longitude });
        
        // Center map
        mapRef.current?.flyTo({ 
          center: [longitude, latitude], 
          zoom: 15,
          duration: 1000 
        });
        
        // NO auto-routing
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please enable location services or use pin mode.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [setOriginMarker]);

  // ============================
  // ROUTING FUNCTION
  // ============================
  const executeRoute = useCallback(async (
    currentOrigin: Origin,
    intent: RoutingIntent,
    mode: TravelMode
  ) => {
    if (!mapRef.current || !mapReady) return;

    setLoading(true);

    try {
      let destLat: number;
      let destLng: number;
      let evacuationCenter: EvacuationCenter | null = null;

      // Step 1: Determine destination
      if (intent.type === 'specific') {
        // Use the specific center provided
        const center = intent.center;
        destLat = center.latitude ?? center.location?.coordinates?.[1]!;
        destLng = center.longitude ?? center.location?.coordinates?.[0]!;
        evacuationCenter = center;
        console.log('Routing to specific center:', center.name);
      } else {
        // Find nearest center first
        console.log('Finding nearest center from:', currentOrigin);
        const nearestRes = await getNearestEvacuationCenter({
          lat: currentOrigin.lat,
          lng: currentOrigin.lng,
          mode,
        });
        console.log('Nearest center response:', nearestRes.data);
        
        const nearest = nearestRes.data.evacuationCenter;
        if (!nearest) {
          alert('No evacuation center found nearby.');
          setLoading(false);
          return;
        }
        
        destLat = nearest.latitude;
        destLng = nearest.longitude;
        evacuationCenter = {
          id: nearest.id,
          name: nearest.name,
          status: nearest.status,
          latitude: nearest.latitude,
          longitude: nearest.longitude,
        };
      }

      // Step 2: Get route from origin to destination
      console.log('Getting route from', currentOrigin, 'to', { destLat, destLng });
      const routeRes = await getRouteBetween({
        originLat: currentOrigin.lat,
        originLng: currentOrigin.lng,
        destLat,
        destLng,
        mode,
      });
      console.log('Route response:', routeRes.data);

      const { routes, eventStatus } = routeRes.data;

      if (!routes || routes.length === 0) {
        alert('No route found. The destination may be unreachable.');
        setLoading(false);
        return;
      }

      const coords = routes[0].geometry?.coordinates;
      
      if (!coords || coords.length === 0) {
        console.error('No coordinates in route:', routes[0]);
        alert('Route found but no path data available.');
        setLoading(false);
        return;
      }
      const map = mapRef.current;

      // Clear existing route
      if (map.getLayer('route')) {
        map.removeLayer('route');
      }
      if (map.getSource('route')) {
        map.removeSource('route');
      }

      // Add new route
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords },
          properties: {},
        },
      });

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: { 
          'line-color': '#2563eb', 
          'line-width': 5,
          'line-opacity': 0.8,
        },
      });

      // Update origin marker color to blue (routed)
      setOriginMarker(currentOrigin.lng, currentOrigin.lat, '#2563eb');

      // Set destination marker
      setDestinationMarker(destLng, destLat);

      // Update selected center state to match what was routed to
      if (evacuationCenter) {
        const routedCenter = centers.find(c => c.id === evacuationCenter.id) || evacuationCenter;
        setSelectedCenter(routedCenter);
      }

      // Fit map to show route
      const bounds = new mapboxgl.LngLatBounds();
      coords.forEach((coord: [number, number]) => bounds.extend(coord));
      map.fitBounds(bounds, { padding: 60, duration: 500 });

      // Handle hazard layers
      if (eventStatus?.flood) {
        try {
          const flood = await getFloodHazards();
          addHazardLayer('flood', flood.data, '#3b82f6');
        } catch (e) {
          console.warn('Failed to load flood hazards:', e);
        }
      }

      if (eventStatus?.earthquake) {
        try {
          const eq = await getEarthquakeHazards();
          addHazardLayer('earthquake', eq.data, '#ef4444');
        } catch (e) {
          console.warn('Failed to load earthquake hazards:', e);
        }
      }

      setHasRouted(true);
      routingIntentRef.current = intent;

    } catch (error) {
      console.error('Routing error:', error);
      alert('Failed to calculate route. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [centers, mapReady, setOriginMarker, setDestinationMarker]);

  // ============================
  // FIND NEAREST HANDLER
  // ============================
  const handleFindNearest = useCallback(() => {
    if (!origin) {
      alert('Please set your location first using:\n• "Use My Location" button\n• Pin mode\n• Search bar');
      return;
    }

    // Clear any specific selection
    setSelectedCenter(null);
    
    // Route to nearest
    executeRoute(origin, { type: 'nearest' }, travelMode);
  }, [origin, travelMode, executeRoute]);

  // ============================
  // SELECT CENTER HANDLER
  // ============================
  const handleSelectCenter = useCallback((center: EvacuationCenter) => {
    // Always update selection visually
    setSelectedCenter(center);

    if (!origin) {
      alert('Please set your location first, then click the center again to route.');
      return;
    }

    // Route to specific center
    executeRoute(origin, { type: 'specific', center }, travelMode);
  }, [origin, travelMode, executeRoute]);

  // ============================
  // TRAVEL MODE CHANGE
  // ============================
  const handleTravelModeChange = useCallback((mode: TravelMode) => {
    setTravelMode(mode);

    // Only re-route if we already have a route
    if (hasRouted && origin && routingIntentRef.current) {
      executeRoute(origin, routingIntentRef.current, mode);
    }
  }, [hasRouted, origin, executeRoute]);

  // ============================
  // HAZARD LAYER
  // ============================
  const addHazardLayer = useCallback((
    id: string,
    geojson: GeoJSON.FeatureCollection,
    color: string
  ) => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing layer/source
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
    if (map.getSource(id)) {
      map.removeSource(id);
    }

    map.addSource(id, {
      type: 'geojson',
      data: geojson,
    });

    map.addLayer({
      id,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': color,
        'fill-opacity': 0.3,
      },
    });
  }, []);

  // ============================
  // WEBSOCKET HAZARD UPDATES
  // ============================
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    socketRef.current = socket;

    socket.on('hazard:update', () => {
      // Only re-route if we have an active route
      if (hasRouted && origin && routingIntentRef.current) {
        executeRoute(origin, routingIntentRef.current, travelMode);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [hasRouted, origin, travelMode, executeRoute]);

  // ============================
  // FETCH CENTERS
  // ============================
  useEffect(() => {
    getAllEvacuationCenters()
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          // Map the data to ensure we have lat/lng
          const mapped = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            status: c.status,
            latitude: c.location?.coordinates?.[1],
            longitude: c.location?.coordinates?.[0],
            location: c.location,
            capacity_current: c.capacity_current,
            capacity_total: c.capacity_total,
          }));
          setCenters(mapped);
        } else {
          setCenters([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch evacuation centers:', err);
        setCenters([]);
      });
  }, []);

  // ============================
  // FILTERED CENTERS
  // ============================
  const filteredCenters = centers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================
  // UI
  // ============================
  return (
    <div className="evacuation-map-container">
      <Sidebar isOpen={isSidebarOpen} />

      <main className="evacuation-map-main">
        <Header
          onMenuClick={() => setIsSidebarOpen(v => !v)}
          username={userName}
        />

        <section className="evacuation-map-content">
          <div className="alert-banner">
            ⚠️ ALERT AREA – Prepare for possible evacuation
          </div>

          <div className="map-layout">
            <div className="map-section">
              <div
                ref={geocoderContainerRef}
                className="geocoder-wrapper"
              />
              <div ref={mapContainerRef} className="map-container" />

              <div className="map-controls">
                <button onClick={useMyLocation} className="location-btn">
                  📍 Use My Location
                </button>

                <button
                  className={`pin-btn ${pinMode ? 'active' : ''}`}
                  onClick={() => setPinMode(p => !p)}
                >
                  📌 {pinMode ? 'Pin Mode ON' : 'Pin Location'}
                </button>
              </div>

              <div className="travel-mode-selector">
                {(['walking', 'driving', 'two-wheeler'] as TravelMode[]).map(m => (
                  <button
                    key={m}
                    className={travelMode === m ? 'active' : ''}
                    onClick={() => handleTravelModeChange(m)}
                  >
                    {m === 'two-wheeler' ? '🏍️ Two-wheeler' : m === 'driving' ? '🚗 Driving' : '🚶 Walking'}
                  </button>
                ))}
              </div>

              <button
                className="route-btn"
                onClick={handleFindNearest}
                disabled={loading}
              >
                {loading ? 'Routing…' : 'Find Nearest Evacuation Center'}
              </button>
            </div>

            <div className="evacuation-centers-panel">
              <h3>Evacuation Centers</h3>

              <input
                className="center-search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search evacuation center"
              />

              <div className="centers-list">
                {filteredCenters.length === 0 ? (
                  <p className="muted">No evacuation centers found.</p>
                ) : (
                  filteredCenters.map(center => (
                    <div
                      key={center.id}
                      className={`center-item ${
                        selectedCenter?.id === center.id ? 'active' : ''
                      }`}
                      onClick={() => handleSelectCenter(center)}
                    >
                      <h4>{center.name}</h4>
                      <p>Status: <span className={`status-badge ${center.status?.toLowerCase()}`}>{center.status}</span></p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EvacuationMap;
