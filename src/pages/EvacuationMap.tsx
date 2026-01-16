import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

import { getNearestWithRoute, getRouteBetween, getAllEvacuationCenters } from '../services/evacuationCenters.api';
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
  capacity_current?: number;
  capacity_total?: number;
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

  // Store all available routes and which one is selected
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);

  const [hasRouted, setHasRouted] = useState(false);
  const [pinMode, setPinMode] = useState(false);

  const [origin, setOrigin] = useState<Origin | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const [routeInfo, setRouteInfo] = useState<{
  distanceKm: number;
  durationMin: number;
} | null>(null);

const [capacityFilter, setCapacityFilter] = useState<
  'all' | 'open' | 'half-full' | 'near-full' | 'full' | 'closed'
>('all');
// ============================
// TEMP HAZARD TEST TOGGLES
// ============================
const [testFloodActive, setTestFloodActive] = useState(false);
const [testEarthquakeActive, setTestEarthquakeActive] = useState(false);


  // Track current routing intent
  const routingIntentRef = useRef<RoutingIntent | null>(null);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const mapInitializedRef = useRef(false);

  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routeLabelMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const routeLayerIdsRef = useRef<string[]>([]);
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

        setRouteInfo(null);

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
      setRouteInfo(null);
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
        setRouteInfo(null);
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
  // SELECT ROUTE (for clicking alternate routes)
  // ============================
  const selectRoute = useCallback((index: number) => {
    if (!mapRef.current || !mapReady || availableRoutes.length === 0) return;
    if (index === selectedRouteIndex) return; // Already selected

    const map = mapRef.current;
    const routes = availableRoutes;

    setSelectedRouteIndex(index);

    // Update line widths and opacities based on new selection
    routes.forEach((_route: any, i: number) => {
      // Use index-based layer IDs to match what we created
      const layerId = `route-${i}`;
      const isSelected = i === index;

      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'line-width', isSelected ? 6 : 4);
        map.setPaintProperty(layerId, 'line-opacity', isSelected ? 0.9 : 0.6);

        // Move selected route to top
        if (isSelected) {
          map.moveLayer(layerId);
        }
      }
    });

    // Update label markers styling using stored route index
    routeLabelMarkersRef.current.forEach((marker) => {
      const el = marker.getElement();
      const markerIndex = parseInt(el.dataset.routeIndex || '0', 10);
      if (markerIndex === index) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });

    // Update route info display with defensive null checks
    const selectedRoute = routes[index];
    if (!selectedRoute) {
      console.warn('No route found at index:', index);
      return;
    }
    
    const rawDistance = selectedRoute.distanceMeters ?? selectedRoute.distance ?? selectedRoute.legs?.[0]?.distance;
    const rawDuration = selectedRoute.durationSeconds ?? selectedRoute.duration ?? selectedRoute.legs?.[0]?.duration;

    if (typeof rawDistance === 'number' && typeof rawDuration === 'number') {
      setRouteInfo({
        distanceKm: rawDistance / 1000,
        durationMin: rawDuration / 60,
      });
    } else {
      console.warn('Route missing distance/duration data:', {
        index,
        route: selectedRoute,
        rawDistance,
        rawDuration
      });
      // Keep previous route info or show N/A
      setRouteInfo(null);
    }
  }, [mapReady, availableRoutes, selectedRouteIndex]);

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
      let routes: any[];
      let eventStatus: { flood?: boolean; earthquake?: boolean };
      let evacuationCenter: EvacuationCenter;

      if (intent.type === 'nearest') {
        // Use combined endpoint - single API call
        console.log('Finding nearest center with route from:', currentOrigin);
        const res = await getNearestWithRoute({
          lat: currentOrigin.lat,
          lng: currentOrigin.lng,
          mode,
          testFlood: testFloodActive,
          testEarthquake: testEarthquakeActive,
        });

        console.log('Nearest with route response:', res.data);

        const data = res.data;
        routes = data.routes;
        eventStatus = data.eventStatus || {};
        evacuationCenter = {
          id: data.evacuationCenter.id,
          name: data.evacuationCenter.name,
          status: data.evacuationCenter.status,
          latitude: data.evacuationCenter.latitude,
          longitude: data.evacuationCenter.longitude,
        };
      } else {
        // Route to specific center
        const center = intent.center;
        const destLat = center.latitude ?? center.location?.coordinates?.[1]!;
        const destLng = center.longitude ?? center.location?.coordinates?.[0]!;
        
        console.log('Routing to specific center:', center.name);
        const routeRes = await getRouteBetween({
          originLat: currentOrigin.lat,
          originLng: currentOrigin.lng,
          destLat,
          destLng,
          mode,
          testFlood: testFloodActive,
          testEarthquake: testEarthquakeActive,
        });

        console.log('Route response:', routeRes.data);

        routes = routeRes.data.routes;
        eventStatus = routeRes.data.eventStatus || {};
        evacuationCenter = center;
      }

      if (!routes || routes.length === 0) {
        alert('No route found. The destination may be unreachable.');
        setLoading(false);
        return;
      }

      // Store routes in state for interactive selection
      setAvailableRoutes(routes);
      setSelectedRouteIndex(0); // Default to first route (safest)

      console.log('Available routes:', routes.map((r: any) => r.label || r.type || 'unlabeled'));

      const selectedRoute = routes[0];
      const coords = selectedRoute?.geometry?.coordinates;
      
      if (!coords || coords.length === 0) {
        console.error('No coordinates in route:', selectedRoute);
        alert('Route found but no path data available.');
        setLoading(false);
        return;
      }

      const map = mapRef.current;

      // Clear existing routes using tracked layer IDs
      routeLayerIdsRef.current.forEach(layerId => {
        // Remove event listeners
        map.off('click', layerId, () => {});
        map.off('mouseenter', layerId, () => {});
        map.off('mouseleave', layerId, () => {});
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(layerId)) map.removeSource(layerId);
      });
      routeLayerIdsRef.current = [];

      // Clear route label markers
      routeLabelMarkersRef.current.forEach(m => m.remove());
      routeLabelMarkersRef.current = [];

      // Add routes in reverse order so selected is on top, then re-order
      const routesWithIndex = routes.map((r: any, i: number) => ({ route: r, index: i }));
      
      // Display non-selected routes first (bottom), then selected on top
      routesWithIndex
        .sort((a: { route: any; index: number }) => (a.index === 0 ? 1 : -1))
        .forEach(({ route, index }: { route: any; index: number }) => {
          const label = route.label || route.type || `route-${index}`;
          // Use index-based ID to ensure uniqueness even when labels are duplicated
          const layerId = `route-${index}`;
          const isSelected = index === 0;
          // Assign colors based on index: 0=safest(orange), 1=fastest(green), 2=shortest(blue)
          const colorByIndex = ['#f59e0b', '#22c55e', '#3b82f6'];
          const color = colorByIndex[index] || '#6b7280';
          
          if (route.geometry?.coordinates) {
            map.addSource(layerId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: route.geometry.coordinates },
                properties: { index, label },
              },
            });

            map.addLayer({
              id: layerId,
              type: 'line',
              source: layerId,
              paint: { 
                'line-color': color,
                'line-width': isSelected ? 6 : 4,
                'line-opacity': isSelected ? 0.9 : 0.6,
              },
            });

            // Track this layer ID for cleanup
            routeLayerIdsRef.current.push(layerId);

            // Add click handler for route selection
            map.on('click', layerId, () => {
              selectRoute(index);
            });

            // Change cursor on hover
            map.on('mouseenter', layerId, () => {
              map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', layerId, () => {
              map.getCanvas().style.cursor = '';
            });

            // Add floating label marker at midpoint of route
            const routeCoords = route.geometry.coordinates;
            const midIndex = Math.floor(routeCoords.length / 2);
            const midpoint = routeCoords[midIndex];

            // Use display labels based on index
            const displayLabels = ['🛡️ Safest', '⚡ Fastest', '📏 Shortest'];
            const labelClasses = ['safest', 'fastest', 'shortest'];

            const labelEl = document.createElement('div');
            labelEl.className = `route-label route-label-${labelClasses[index] || 'default'}${isSelected ? ' selected' : ''}`;
            labelEl.innerHTML = displayLabels[index] || label;
            labelEl.dataset.routeIndex = String(index); // Store original route index
            labelEl.onclick = () => selectRoute(index);

            const labelMarker = new mapboxgl.Marker({ element: labelEl, anchor: 'center' })
              .setLngLat(midpoint)
              .addTo(map);
            
            routeLabelMarkersRef.current.push(labelMarker);
          }
        });

      // Update origin marker color to blue (routed)
      setOriginMarker(currentOrigin.lng, currentOrigin.lat, '#2563eb');

      // Set destination marker using evacuation center coordinates
      setDestinationMarker(evacuationCenter.longitude, evacuationCenter.latitude);

      // Update selected center state to match what was routed to
      if (evacuationCenter) {
        const routedCenter = centers.find(c => c.id === evacuationCenter.id) || evacuationCenter;
        setSelectedCenter(routedCenter);
      }

      console.log('Route object:', selectedRoute);

      const rawDistance =
        selectedRoute.distanceMeters ??
        selectedRoute.distance ??
        selectedRoute.legs?.[0]?.distance;

      const rawDuration =
        selectedRoute.durationSeconds ??
        selectedRoute.duration ??
        selectedRoute.legs?.[0]?.duration;

      if (typeof rawDistance === 'number' && typeof rawDuration === 'number') {
        setRouteInfo({
          distanceKm: rawDistance / 1000,
          durationMin: rawDuration / 60,
        });
      } else {
        console.warn('Route missing distance or duration:', selectedRoute);
        setRouteInfo(null);
      }

      // Fit map to show route
      const bounds = new mapboxgl.LngLatBounds();
      coords.forEach((coord: [number, number]) => bounds.extend(coord));
      map.fitBounds(bounds, { padding: 60, duration: 500 });

      // Handle hazard layers based on active events
      if (eventStatus?.flood || testFloodActive) {
        try {
          const flood = await getFloodHazards();
          addHazardLayer('flood', flood.data, '#3b82f6');
        } catch (e) {
          console.warn('Failed to load flood hazards:', e);
        }
      } else {
        // Remove flood layer if not active
        if (map.getLayer('flood')) map.removeLayer('flood');
        if (map.getSource('flood')) map.removeSource('flood');
      }

      if (eventStatus?.earthquake || testEarthquakeActive) {
        try {
          const eq = await getEarthquakeHazards();
          addHazardLayer('earthquake', eq.data, '#ef4444');
        } catch (e) {
          console.warn('Failed to load earthquake hazards:', e);
        }
      } else {
        // Remove earthquake layer if not active
        if (map.getLayer('earthquake')) map.removeLayer('earthquake');
        if (map.getSource('earthquake')) map.removeSource('earthquake');
      }

      setHasRouted(true);
      routingIntentRef.current = intent;

    } catch (error) {
      console.error('Routing error:', error);
      alert('Failed to calculate route. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [centers, mapReady, testFloodActive, testEarthquakeActive, setOriginMarker, setDestinationMarker, selectRoute]);

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
// STATUS & CAPACITY HELPERS
// ============================
const getCenterStatus = (center: any) => {
  if (center.status?.toLowerCase() === 'closed') return 'closed';

  if (!center.capacity_total || center.capacity_total === 0) return 'open';

  const ratio = center.capacity_current / center.capacity_total;

  if (ratio >= 1) return 'full';
  if (ratio >= 0.7) return 'near-full';
  if (ratio >= 0.4) return 'half-full';

  return 'open';
};


  // ============================
  // FILTERED CENTERS
  // ============================
  const filteredCenters = centers.filter(c => {
  const matchesSearch = c.name
    .toLowerCase()
    .includes(searchQuery.toLowerCase());

  const status = getCenterStatus(c);

  const matchesCapacity =
    capacityFilter === 'all' || capacityFilter === status;

  return matchesSearch && matchesCapacity;
});


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

              {/* Hazard Test Toggles */}
              <div className="hazard-test-panel">
                <strong>⚠️ Test Hazard Scenarios</strong>
                <label>
                  <input
                    type="checkbox"
                    checked={testFloodActive}
                    onChange={e => setTestFloodActive(e.target.checked)}
                  />
                  Flood Risk
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={testEarthquakeActive}
                    onChange={e => setTestEarthquakeActive(e.target.checked)}
                  />
                  Earthquake Risk
                </label>
              </div>

              {/* Travel Mode Selector */}
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

              {/* Route Info Legend */}
              {routeInfo && availableRoutes.length > 0 && (
                <div className="route-legend">
                  <div className="route-legend-label">
                    {(() => {
                      // Use index-based labels since backend labels are descriptive (e.g., "Flood-risk path")
                      const displayLabels = ['🛡️ Safest Route', '⚡ Fastest Route', '📏 Shortest Route'];
                      return displayLabels[selectedRouteIndex] || '📍 Route';
                    })()}
                  </div>
                  <div className="route-risk-info">
                    {availableRoutes[selectedRouteIndex]?.label && (
                      <small>Path type: {availableRoutes[selectedRouteIndex].label}</small>
                    )}
                  </div>
                  <h4>📍 Route Info</h4>
                  <p>Distance: {routeInfo.distanceKm.toFixed(2)} km</p>
                  <p>Estimated Time: {Math.ceil(routeInfo.durationMin)} mins</p>
                  <p>Mode: {travelMode}</p>
                  <small className="route-hint">Click alternate routes on map to switch</small>
                </div>
              )}

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
                <div className="capacity-filter">
                {['all', 'open', 'half-full', 'near-full', 'full', 'closed'].map(f => (
                    <button
                    key={f}
                    className={capacityFilter === f ? 'active' : ''}
                    onClick={() => setCapacityFilter(f as any)}
                    >
                    {f === 'all' ? 'ALL' : f.replace('-', ' ').toUpperCase()}
                    </button>
                ))}
                </div>

              <div className="centers-list">
                {filteredCenters.length === 0 ? (
                  <p className="muted">No evacuation centers found.</p>
                ) : (
                  filteredCenters.map(center => {
                    const status = getCenterStatus(center);
                    const statusLabel = status === 'half-full' ? 'Half-Full' 
                      : status === 'near-full' ? 'Near-Full'
                      : status.charAt(0).toUpperCase() + status.slice(1);
                    
                    return (
                      <div
                        key={center.id}
                        className={`center-item ${selectedCenter?.id === center.id ? 'active' : ''}`}
                        onClick={() => handleSelectCenter(center)}
                      >
                        <h4>{center.name}</h4>
                        <div className="center-meta">
                          <span className={`status-badge ${status}`}>
                            {statusLabel}
                          </span>
                          <span className="capacity-text">
                            Capacity: {center.capacity_current ?? 0}/{center.capacity_total ?? '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })
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
