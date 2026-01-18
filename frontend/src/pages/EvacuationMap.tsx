import { useEffect, useRef, useState, useCallback } from 'react';
import type { JSX } from 'react';
import { useLocation } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { getNearestWithRoute, getRouteBetween, getAllEvacuationCenters } from '../services/evacuationCenters.api';
import type { TravelMode } from '../services/evacuationCenters.api';
import {
  getFloodHazards,
} from '../services/hazards.api';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { io, Socket } from 'socket.io-client';

import './EvacuationMap.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface EvacuationCenter {
  id: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
  capacity_current?: number;
  capacity_total?: number;
  address?: string;
  location?: {
    coordinates: [number, number]; 
  };
}

interface Origin {
  lat: number;
  lng: number;
}

type RoutingIntent = 
  | { type: 'nearest' }
  | { type: 'specific'; center: EvacuationCenter };

interface NavigationState {
  origin?: { lat: number; lng: number };
  travelMode?: TravelMode;
  testFloodActive?: boolean;
  autoRoute?: boolean;
}

const EvacuationMap = () => {
  const location = useLocation();
  const navigationState = location.state as NavigationState | null;
  const autoRouteTriggeredRef = useRef(false);

  const [loading, setLoading] = useState(false);

  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<EvacuationCenter | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [travelMode, setTravelMode] = useState<TravelMode>(navigationState?.travelMode || 'walking');

  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);

  const [hasRouted, setHasRouted] = useState(false);
  const [pinMode, setPinMode] = useState(false);

  const [origin, setOrigin] = useState<Origin | null>(navigationState?.origin || null);
  const [mapReady, setMapReady] = useState(false);

  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMin: number;
  } | null>(null);

  const [capacityFilter, setCapacityFilter] = useState<
    'all' | 'open' | 'half-full' | 'near-full' | 'full' | 'closed'
  >('all');

  const [testFloodActive, setTestFloodActive] = useState(navigationState?.testFloodActive || false);
  const [testEarthquakeActive, _setTestEarthquakeActive] = useState(false);

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
  const selectRouteRef = useRef<(index: number) => void>(() => {});
  const centerItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  useEffect(() => {
    const map = mapRef.current;
    const container = geocoderContainerRef.current;
    
    if (!map || !container) return;
    if (geocoderRef.current) return;
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
      setOriginMarker(lng, lat, '#0ea5e9');
      setOrigin({ lat, lng });

      setRouteInfo(null);

      map.flyTo({ center: [lng, lat], zoom: 15 });
    });

    geocoderRef.current = geocoder;
  };

  const setOriginMarker = useCallback((lng: number, lat: number, color: string) => {
    if (!mapRef.current) return;
    
    originMarkerRef.current?.remove();
    
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const handler = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      
      setOriginMarker(lng, lat, '#f59e0b');
      setRouteInfo(null);
      setOrigin({ lat, lng });
      
      map.flyTo({ 
        center: [lng, lat], 
        zoom: Math.max(map.getZoom(), 14), 
        duration: 500 
      });
      
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


  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        
        setOriginMarker(longitude, latitude, '#16a34a');
        setRouteInfo(null);
        setOrigin({ lat: latitude, lng: longitude });
        
        mapRef.current?.flyTo({ 
          center: [longitude, latitude], 
          zoom: 15,
          duration: 1000 
        });
        
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


  const selectRoute = useCallback((index: number) => {
    if (!mapRef.current || !mapReady || availableRoutes.length === 0) return;

    const map = mapRef.current;
    const routes = availableRoutes;

    setSelectedRouteIndex(index);

    routes.forEach((_route: any, i: number) => {
      const layerId = `route-${i}`;
      const isSelected = i === index;

      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'line-width', isSelected ? 6 : 4);
        map.setPaintProperty(layerId, 'line-opacity', isSelected ? 0.9 : 0.6);

        if (isSelected) {
          map.moveLayer(layerId);
        }
      }
    });

    routeLabelMarkersRef.current.forEach((marker) => {
      const el = marker.getElement();
      const markerIndex = parseInt(el.dataset.routeIndex || '0', 10);
      if (markerIndex === index) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });

    const selectedRoute = routes[index];
    if (!selectedRoute) {
      console.warn('No route found at index:', index);
      return;
    }
    
    const rawDistance = selectedRoute.distanceMeters ?? selectedRoute.distance ?? selectedRoute.legs?.[0]?.distance;
    const rawDuration = selectedRoute.durationSeconds ?? selectedRoute.duration ?? selectedRoute.legs?.[0]?.duration;

    if (typeof rawDistance === 'number' && typeof rawDuration === 'number') {
      setRouteInfo({
        distanceKm: Math.round((rawDistance / 1000) * 100) / 100,
        durationMin: Math.round(rawDuration / 60),
      });
    } else {
      console.warn('Route missing distance/duration data:', {
        index,
        route: selectedRoute,
        rawDistance,
        rawDuration
      });
      setRouteInfo(null);
    }
  }, [mapReady, availableRoutes]);

  useEffect(() => {
    selectRouteRef.current = selectRoute;
  }, [selectRoute]);

  useEffect(() => {
    if (selectedCenter?.id) {
      const element = centerItemRefs.current.get(selectedCenter.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedCenter?.id]);


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
        console.log('Finding nearest center with route from:', currentOrigin);
        const res = await getNearestWithRoute({
          lat: currentOrigin.lat,
          lng: currentOrigin.lng,
          mode,
          testFlood: testFloodActive,
        });

        console.log('Nearest with route response:', res.data);

        const data = res.data;
        
        if (typeof data === 'string' || !data.evacuationCenter) {
          console.error('Invalid API response:', data);
          throw new Error('API returned invalid response. Please try again.');
        }
        
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

      setAvailableRoutes(routes);
      setSelectedRouteIndex(0); 

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

      routeLayerIdsRef.current.forEach(layerId => {
        map.off('click', layerId, () => {});
        map.off('mouseenter', layerId, () => {});
        map.off('mouseleave', layerId, () => {});
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(layerId)) map.removeSource(layerId);
      });
      routeLayerIdsRef.current = [];

      routeLabelMarkersRef.current.forEach(m => m.remove());
      routeLabelMarkersRef.current = [];

      const routesWithIndex = routes.map((r: any, i: number) => ({ route: r, index: i }));
      
      routesWithIndex
        .sort((a: { route: any; index: number }) => (a.index === 0 ? 1 : -1))
        .forEach(({ route, index }: { route: any; index: number }) => {
          const label = route.label || route.type || `route-${index}`;
          const layerId = `route-${index}`;
          const isSelected = index === 0;
          const colorByLabel: Record<string, string> = {
            'safest': '#22c55e',           
            'safest & fastest': '#3b82f6', 
            'fastest': '#3b82f6',          
            'alternate': '#6b7280',        
          };
          const color = colorByLabel[route.label] || '#6b7280';
          
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

            routeLayerIdsRef.current.push(layerId);

            map.on('click', layerId, () => {
              selectRouteRef.current(index);
            });

            map.on('mouseenter', layerId, () => {
              map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', layerId, () => {
              map.getCanvas().style.cursor = '';
            });

            const routeCoords = route.geometry.coordinates;
            const midIndex = Math.floor(routeCoords.length / 2);
            const midpoint = routeCoords[midIndex];

            const labelIcons: Record<string, string> = {
              'safest': '<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/></svg> Safest',
              'fastest': '<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09zM4.157 8.5H7a.5.5 0 0 1 .478.647L6.11 13.59l5.732-6.09H9a.5.5 0 0 1-.478-.647L9.89 2.41 4.157 8.5z"/></svg> Fastest',
              'safest & fastest': '<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/></svg> Best',
              'alternate': '<svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"/><path fill-rule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z"/></svg> Alt',
            };
            const displayLabel = labelIcons[route.label] || route.label || 'Route';

            const labelEl = document.createElement('div');
            labelEl.className = `route-label route-label-${route.label?.replace(/ & /g, '-') || 'default'}${isSelected ? ' selected' : ''}`;
            labelEl.innerHTML = displayLabel;
            labelEl.dataset.routeIndex = String(index);
            labelEl.onclick = () => selectRouteRef.current(index);

            const labelMarker = new mapboxgl.Marker({ element: labelEl, anchor: 'center' })
              .setLngLat(midpoint)
              .addTo(map);
            
            routeLabelMarkersRef.current.push(labelMarker);
          }
        });

      setOriginMarker(currentOrigin.lng, currentOrigin.lat, '#2563eb');

      setDestinationMarker(evacuationCenter.longitude, evacuationCenter.latitude);

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
          distanceKm: Math.round((rawDistance / 1000) * 100) / 100,
          durationMin: Math.round(rawDuration / 60),
        });
      } else {
        console.warn('Route missing distance or duration:', selectedRoute);
        setRouteInfo(null);
      }

      const bounds = new mapboxgl.LngLatBounds();
      coords.forEach((coord: [number, number]) => bounds.extend(coord));
      map.fitBounds(bounds, { padding: 60, duration: 500 });

      if (eventStatus?.flood || testFloodActive) {
        try {
          const flood = await getFloodHazards();
          addHazardLayer('flood', flood.data, '#3b82f6');
        } catch (e) {
          console.warn('Failed to load flood hazards:', e);
        }
      } else {
        if (map.getLayer('flood')) map.removeLayer('flood');
        if (map.getSource('flood')) map.removeSource('flood');
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

  useEffect(() => {
    if (
      navigationState?.autoRoute &&
      navigationState?.origin &&
      mapReady &&
      !autoRouteTriggeredRef.current
    ) {
      autoRouteTriggeredRef.current = true;
      
      setOriginMarker(navigationState.origin.lng, navigationState.origin.lat, '#2563eb');
      
      mapRef.current?.flyTo({
        center: [navigationState.origin.lng, navigationState.origin.lat],
        zoom: 14,
        duration: 1000
      });

      setTimeout(() => {
        executeRoute(
          navigationState.origin!,
          { type: 'nearest' },
          navigationState.travelMode || 'walking'
        );
      }, 500);
    }
  }, [mapReady, navigationState, executeRoute, setOriginMarker]);

  const handleFindNearest = useCallback(() => {
    if (!origin) {
      alert('Please set your location first using:\n• "Use My Location" button\n• Pin mode\n• Search bar');
      return;
    }

    setSelectedCenter(null);
    
    executeRoute(origin, { type: 'nearest' }, travelMode);
  }, [origin, travelMode, executeRoute]);

  const handleSelectCenter = useCallback((center: EvacuationCenter) => {
    setSelectedCenter(center);

    if (!origin) {
      alert('Please set your location first, then click the center again to route.');
      return;
    }

    executeRoute(origin, { type: 'specific', center }, travelMode);
  }, [origin, travelMode, executeRoute]);
  const handleTravelModeChange = useCallback((mode: TravelMode) => {
    setTravelMode(mode);

    if (hasRouted && origin && routingIntentRef.current) {
      executeRoute(origin, routingIntentRef.current, mode);
    }
  }, [hasRouted, origin, executeRoute]);

  const addHazardLayer = useCallback((
    id: string,
    geojson: GeoJSON.FeatureCollection,
    color: string
  ) => {
    const map = mapRef.current;
    if (!map) return;

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


  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || window.location.origin);
    socketRef.current = socket;

    socket.on('hazard:update', () => {
      if (hasRouted && origin && routingIntentRef.current) {
        executeRoute(origin, routingIntentRef.current, travelMode);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [hasRouted, origin, travelMode, executeRoute]);

  useEffect(() => {
    getAllEvacuationCenters()
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          const mapped = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            status: c.status,
            latitude: c.location?.coordinates?.[1],
            longitude: c.location?.coordinates?.[0],
            location: c.location,
            capacity_current: c.capacity_current,
            capacity_total: c.capacity_total,
            address: c.address,
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

  const getCenterStatus = (center: EvacuationCenter) => {
    if (center.status?.toLowerCase() === 'closed') return 'closed';

    if (!center.capacity_total || center.capacity_total === 0) return 'open';

    const ratio = center.capacity_current! / center.capacity_total;

    if (ratio >= 1) return 'full';
    if (ratio >= 0.7) return 'near-full';
    if (ratio >= 0.4) return 'half-full';

    return 'open';
  };

  const filteredCenters = centers.filter(c => {
    const matchesSearch = c.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const status = getCenterStatus(c);

    const matchesCapacity =
      capacityFilter === 'all' || capacityFilter === status;

    return matchesSearch && matchesCapacity;
  });

  return (
    <div className="evacuation-map-page">
      <div className="alert-banner">
        <svg className="alert-icon" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
        ALERT AREA – Prepare for possible evacuation
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
              <svg className="btn-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
              </svg>
              Use My Location
            </button>

            <button
              className={`pin-btn ${pinMode ? 'active' : ''}`}
              onClick={() => setPinMode(p => !p)}
            >
              <svg className="btn-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/>
              </svg>
              {pinMode ? 'Pin Mode ON' : 'Pin Location'}
            </button>
          </div>

          {/* Hazard Test Toggles */}
          <div className="hazard-test-panel">
            <div className="hazard-panel-header">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              <strong>Flood Hazard</strong>
            </div>
            <label className="hazard-checkbox">
              <input
                type="checkbox"
                checked={testFloodActive}
                onChange={e => setTestFloodActive(e.target.checked)}
              />
              <span>Flood Risk</span>
            </label>
            {/* <label className="hazard-checkbox">
              <input
                type="checkbox"
                checked={testEarthquakeActive}
                onChange={e => setTestEarthquakeActive(e.target.checked)}
              />
              <span>Earthquake Risk</span>
            </label> */}
          </div>

          {/* Travel Mode Selector */}
          <div className="travel-mode-selector">
            <button
              className={travelMode === 'walking' ? 'active' : ''}
              onClick={() => handleTravelModeChange('walking')}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M9.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM6.44 3.752A.75.75 0 0 1 7 3.5h1.445c.742 0 1.32.643 1.243 1.38l-.43 4.083a1.75 1.75 0 0 1-.088.395l-.318.906.213.242a.75.75 0 0 1 .114.175l2 4.25a.75.75 0 1 1-1.357.638l-1.956-4.154-1.68-1.921A.75.75 0 0 1 6 8.96l.138-2.613-.435.489-.464 2.786a.75.75 0 1 1-1.48-.246l.5-3a.75.75 0 0 1 .18-.375l2-2.25Z"/>
                <path d="M6.25 11.745v-1.418l1.204 1.375.261.524a.75.75 0 0 1-.12.231l-2.5 3.25a.75.75 0 1 1-1.19-.914l2.345-3.048Zm4.22-4.215-.494-.494.205-1.843.006-.067 1.124 1.124h1.44a.75.75 0 0 1 0 1.5H11a.75.75 0 0 1-.531-.22Z"/>
              </svg>
              Walking
            </button>
            <button
              className={travelMode === 'driving' ? 'active' : ''}
              onClick={() => handleTravelModeChange('driving')}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm10 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6 8a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2H6ZM4.862 4.276 3.906 6.19a.51.51 0 0 0 .497.731c.91-.073 2.35-.17 3.597-.17 1.247 0 2.688.097 3.597.17a.51.51 0 0 0 .497-.731l-.956-1.913A.5.5 0 0 0 10.691 4H5.309a.5.5 0 0 0-.447.276Z"/>
                <path d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679c.033.161.049.325.049.49v.413c0 .814-.39 1.543-1 1.997V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.338c-1.292.048-2.745.088-4 .088s-2.708-.04-4-.088V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.892c-.61-.454-1-1.183-1-1.997v-.413a2.5 2.5 0 0 1 .049-.49l.335-1.68c.11-.546.465-1.012.964-1.261a.807.807 0 0 0 .381-.404l.792-1.848Z"/>
              </svg>
              Driving
            </button>
            <button
              className={travelMode === 'two-wheeler' ? 'active' : ''}
              onClick={() => handleTravelModeChange('two-wheeler')}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1a4 4 0 1 1 0-8 4 4 0 0 1 0 8ZM12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/>
                <path d="M9 4.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-7Zm1 .5v6h2V5h-2Z"/>
              </svg>
              Two-wheeler
            </button>
          </div>

          {/* Route Info Legend */}
          {routeInfo && availableRoutes.length > 0 && (
            <div className="route-legend">
              <div className="route-legend-label">
                {(() => {
                  const routeLabel = availableRoutes[selectedRouteIndex]?.label || 'route';
                  const labelIcons: Record<string, JSX.Element> = {
                    'safest': (
                      <>
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
                        </svg>
                        Safest Route
                      </>
                    ),
                    'fastest': (
                      <>
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
                        </svg>
                        Fastest Route
                      </>
                    ),
                    'safest & fastest': (
                      <>
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                          <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                        </svg>
                        Best Route
                      </>
                    ),
                    'alternate': (
                      <>
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"/>
                          <path fillRule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z"/>
                        </svg>
                        Alternate Route
                      </>
                    ),
                  };
                  return labelIcons[routeLabel] || '📍 Route';
                })()}
              </div>
              <div className="route-info-details">
                <div className="route-info-item">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5z"/>
                  </svg>
                  <span>{routeInfo.distanceKm.toFixed(2)} km</span>
                </div>
                <div className="route-info-item">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                  </svg>
                  <span>{Math.ceil(routeInfo.durationMin)} mins</span>
                </div>
                <div className="route-info-item">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                  </svg>
                  <span className="travel-mode-label">{travelMode}</span>
                </div>
              </div>
              <small className="route-hint">Click alternate routes on map to switch</small>
            </div>
          )}

          <button
            className="route-btn"
            onClick={handleFindNearest}
            disabled={loading}
          >
            <svg className="btn-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
              <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            </svg>
            {loading ? 'Finding Route...' : 'Find Nearest Evacuation Center'}
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
            {(['all', 'open', 'half-full', 'near-full', 'full', 'closed'] as const).map(f => (
              <button
                key={f}
                className={capacityFilter === f ? 'active' : ''}
                onClick={() => setCapacityFilter(f)}
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
                    ref={(el) => {
                      if (el) {
                        centerItemRefs.current.set(center.id, el);
                      }
                    }}
                    className={`center-item ${selectedCenter?.id === center.id ? 'active' : ''}`}
                    onClick={() => handleSelectCenter(center)}
                  >
                    <h4 className="center-name">{center.name}</h4>
                    {center.address && (
                      <p className="center-address">{center.address}</p>
                    )}
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
    </div>
  );
};

export default EvacuationMap;