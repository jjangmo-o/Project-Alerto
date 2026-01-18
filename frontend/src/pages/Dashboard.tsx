import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { waterLevelService } from '../services/waterLevelService';
import type { WaterLevelData } from '../services/waterLevelService';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import type { TravelMode } from '../services/evacuationCenters.api';

import {
  CloudRainWindIcon,
  ActivityIcon,
  FireAlertIcon,
  EvacuationIcon,
  BellIcon
} from './NotificationsIcons';

import currentStatusIcon from '../assets/icon-current-status.png';
import notificationBellIcon from '../assets/icon-notification.svg';
import waterLevelIcon from '../assets/icon-water-level.png';
import hotlineIcon from '../assets/icon-emergency-hotlines.png';
import mapIcon from '../assets/icon-evacuation-map.png';
import cardIcon from '../assets/icon-profile-card.png';
import communityStatusIcon from '../assets/icon-community-status.svg';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Notification {
  notification_id: string;
  title: string;
  message: string;
  created_at: string;
  disaster_type: string;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [atCapacityCount, setAtCapacityCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);

  const [alerts, setAlerts] = useState<Notification[]>([]);

  const [waterLevel, setWaterLevel] = useState<WaterLevelData | null>(null);
  const [waterLevelLoading, setWaterLevelLoading] = useState(true);

  const [userStatus, setUserStatus] = useState<string>('Safe');
  const { user } = useAuth();

  const [travelMode, setTravelMode] = useState<TravelMode>('walking');
  const [pinMode, setPinMode] = useState(false);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [testFloodActive, setTestFloodActive] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const mapInitializedRef = useRef(false);
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);


  const fetchEvacuationCounts = async () => {
    const { data, error } = await supabase
      .from('evacuation_centers')
      .select('capacity, current_occupancy');

    if (error || !data) return;

    setAtCapacityCount(
      data.filter(c => c.current_occupancy !== null && c.current_occupancy >= c.capacity).length
    );
    setAvailableCount(
      data.filter(c => c.current_occupancy !== null && c.current_occupancy < c.capacity).length
    );
  };

  useEffect(() => {
    (async () => {
      await fetchEvacuationCounts();
    })();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('user-evac-centers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'evacuation_centers' },
        fetchEvacuationCounts
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('notification_id, title, message, created_at, disaster_type')
      .in('target_role', ['USER', 'ALL'])
      .order('created_at', { ascending: false })
      .limit(4);

    if (!error && data) {
      setAlerts(
        data.map(alert => ({
          ...alert,
          created_at: alert.created_at ?? '',
          disaster_type: alert.disaster_type ?? 'typhoon'
        }))
      );
    }
  };

  useEffect(() => {
    (async () => {
      await fetchAlerts();
    })();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        fetchAlerts
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const fetchUserStatus = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('disaster_reports')
      .select('status_type')
      .eq('user_id', user.id)
      .eq('moderation_status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      setUserStatus('Safe');
      return;
    }

    setUserStatus(data.status_type || 'Safe');
  }, [user?.id]);

  useEffect(() => {
    fetchUserStatus();
  }, [fetchUserStatus]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('user-status-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'disaster_reports',
          filter: `user_id=eq.${user.id}`,
        },
        fetchUserStatus
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchUserStatus]);


  const fetchWaterLevel = async () => {
    setWaterLevelLoading(true);
    const data = await waterLevelService.getLatest();
    setWaterLevel(data);
    setWaterLevelLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchWaterLevel();
    })();
    
    const interval = setInterval(fetchWaterLevel, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapInitializedRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [121.097, 14.650], // Marikina
      zoom: 11,
    });

    map.on('load', () => {
      map.fitBounds(
        [
          [121.0, 14.55],
          [121.18, 14.72],
        ],
        { padding: 20 }
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
    
    if (!map || !container || geocoderRef.current) return;
    
    if (!map.loaded()) {
      const onLoad = () => {
        if (!geocoderRef.current && container) {
          initGeocoder(map, container);
        }
      };
      map.on('load', onLoad);
      return () => { map.off('load', onLoad); };
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

  // for drag and drop of pin location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const handler = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      setOriginMarker(lng, lat, '#f59e0b');
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

  //use own location
  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setOriginMarker(longitude, latitude, '#16a34a');
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [setOriginMarker]);

  // ============================
  // FIND NEAREST EVACUATION CENTER
  // ============================
  const handleFindNearest = useCallback(async () => {
    if (!origin) {
      alert('Please set your location first using the location button, pin mode, or search.');
      return;
    }

    setMapLoading(true);

    try {
      // Navigate to evacuation map with location data for auto-routing
      navigate('/map', { 
        state: { 
          origin, 
          travelMode, 
          testFloodActive,
          autoRoute: true 
        } 
      });
    } catch (error) {
      console.error('Error finding nearest evacuation center:', error);
      alert('Unable to find nearest evacuation center. Please try again.');
    } finally {
      setMapLoading(false);
    }
  }, [origin, travelMode, testFloodActive, navigate]);

  // ============================
  // UI
  // ============================

  const getAlertIcon = (disasterType: string, title: string) => {
    // Check for evacuation center notifications by title
    if (title && title.toLowerCase().includes('evacuation center')) {
      return <EvacuationIcon size={24} />;
    }
    switch (disasterType) {
      case 'typhoon':
        return <CloudRainWindIcon size={24} />;
      case 'earthquake':
        return <ActivityIcon size={24} />;
      case 'fire':
        return <FireAlertIcon size={24} />;
      default:
        return <BellIcon size={24} />;
    }
  };

  const getStatusCardClass = (status: string): string => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === 'safe') {
      return 'success';
    }
    
    if (['critical', 'injured', 'fire', 'trapped', 'missing'].includes(normalizedStatus)) {
      return 'danger';
    }
    
    if (['flooding', 'power outage', 'outbreak', 'rescue', 'animal rescue', 'medical assistance'].includes(normalizedStatus)) {
      return 'warning';
    }
    
    return 'success';
  };

  const [now, setNow] = useState(() => Date.now());


  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: string) => {
    const diffMs = now - new Date(date).getTime();

    const totalMinutes = Math.floor(diffMs / 60000);
    if (totalMinutes < 1) return 'Just now';

    if (totalMinutes < 60) {
      return `${totalMinutes}m ago`;
    }

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (totalHours < 24) {
      if (remainingMinutes === 0) {
        return `${totalHours}hr${totalHours > 1 ? 's' : ''} ago`;
      }
      return `${totalHours}hr${totalHours > 1 ? 's' : ''} ${remainingMinutes}m ago`;
    }

    const totalDays = Math.floor(totalHours / 24);
    return `${totalDays} day${totalDays > 1 ? 's' : ''} ago`;
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    const dateStr = date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return `As of ${timeStr} | ${dateStr}`;
  };

  return (
    <div className="dashboard-grid">
      <div className="left-column">

        {/* STATUS CARDS */}
        <section className="status-row">
          <div className={`status-card ${getStatusCardClass(userStatus)}`}>
            <div className="icon-box">
              <img src={currentStatusIcon} alt="Status" />
            </div>
            <div className="status-info">
              <h3>{userStatus.toUpperCase()}</h3>
              <p>Your Current Status</p>
            </div>
          </div>

          <div className="status-card danger">
            <div className="icon-box">
              <img src={notificationBellIcon} alt="At Capacity" />
            </div>
            <div className="status-info">
              <h3>{atCapacityCount}</h3>
              <p>ECs At Capacity</p>
            </div>
          </div>

          <div className="status-card warning">
            <div className="icon-box">
              <img src={notificationBellIcon} alt="Vacant" />
            </div>
            <div className="status-info">
              <h3>{availableCount}</h3>
              <p>ECs Vacant</p>
            </div>
          </div>
        </section>

        {/* MAP */}
        <section className="map-row">
          <div className="map-card">
            <div ref={geocoderContainerRef} className="dashboard-geocoder-wrapper" />
            <div ref={mapContainerRef} className="dashboard-map-container" />

            {/* Map Controls */}
            <div className="dashboard-map-controls">
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

            {/* Hazard Toggle */}
            <div className="dashboard-hazard-panel">
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
            </div>

            {/* Travel Mode Selector */}
            <div className="dashboard-travel-mode-selector">
              <button
                className={travelMode === 'walking' ? 'active' : ''}
                onClick={() => setTravelMode('walking')}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM6.44 3.752A.75.75 0 0 1 7 3.5h1.445c.742 0 1.32.643 1.243 1.38l-.43 4.083a1.75 1.75 0 0 1-.088.395l-.318.906.213.242a.75.75 0 0 1 .114.175l2 4.25a.75.75 0 1 1-1.357.638l-1.956-4.154-1.68-1.921A.75.75 0 0 1 6 8.96l.138-2.613-.435.489-.464 2.786a.75.75 0 1 1-1.48-.246l.5-3a.75.75 0 0 1 .18-.375l2-2.25Z"/>
                  <path d="M6.25 11.745v-1.418l1.204 1.375.261.524a.75.75 0 0 1-.12.231l-2.5 3.25a.75.75 0 1 1-1.19-.914l2.345-3.048Zm4.22-4.215-.494-.494.205-1.843.006-.067 1.124 1.124h1.44a.75.75 0 0 1 0 1.5H11a.75.75 0 0 1-.531-.22Z"/>
                </svg>
                Walking
              </button>
              <button
                className={travelMode === 'driving' ? 'active' : ''}
                onClick={() => setTravelMode('driving')}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm10 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6 8a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2H6ZM4.862 4.276 3.906 6.19a.51.51 0 0 0 .497.731c.91-.073 2.35-.17 3.597-.17 1.247 0 2.688.097 3.597.17a.51.51 0 0 0 .497-.731l-.956-1.913A.5.5 0 0 0 10.691 4H5.309a.5.5 0 0 0-.447.276Z"/>
                  <path d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679c.033.161.049.325.049.49v.413c0 .814-.39 1.543-1 1.997V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.338c-1.292.048-2.745.088-4 .088s-2.708-.04-4-.088V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.892c-.61-.454-1-1.183-1-1.997v-.413a2.5 2.5 0 0 1 .049-.49l.335-1.68c.11-.546.465-1.012.964-1.261a.807.807 0 0 0 .381-.404l.792-1.848Z"/>
                </svg>
                Driving
              </button>
              <button
                className={travelMode === 'two-wheeler' ? 'active' : ''}
                onClick={() => setTravelMode('two-wheeler')}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1a4 4 0 1 1 0-8 4 4 0 0 1 0 8ZM12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"/>
                  <path d="M9 4.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-7Zm1 .5v6h2V5h-2Z"/>
                </svg>
                Two-wheeler
              </button>
            </div>

            {/* Find Nearest Button */}
            <button
              className="dashboard-route-btn"
              onClick={handleFindNearest}
              disabled={mapLoading}
            >
              <svg className="btn-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
                <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
              {mapLoading ? 'Finding...' : 'Find Nearest Evacuation Center'}
            </button>
          </div>
        </section>

        {/* PREPAREDNESS HUB */}
        <section className="hub-section">
          <h3 className="hub-title">Preparedness Hub</h3>

          <div className="hub-row">
            <div className="hub-card" onClick={() => navigate('/hotlines')}>
              <img src={hotlineIcon} className="hub-icon" />
              <div className="hub-label">Emergency Hotlines</div>
            </div>

            <div className="hub-card" onClick={() => navigate('/map')}>
              <img src={mapIcon} className="hub-icon" />
              <div className="hub-label">Evacuation Map</div>
            </div>

            <div className="hub-card" onClick={() => navigate('/residence')}>
              <img src={cardIcon} className="hub-icon" />
              <div className="hub-label">Residence Card</div>
            </div>

            <div className="hub-card" onClick={() => navigate('/community-status')}>
              <img src={communityStatusIcon} className="hub-icon" />
              <div className="hub-label">Community Status</div>
            </div>
          </div>
        </section>
      </div>

      <div className="right-column">
        <div className="info-card recent-alerts-card">
          <h3>Recent Alerts</h3>

          <div className="alerts-list">
            {alerts.map(alert => (
              <div 
                key={alert.notification_id} 
                className="alert-item"
                onClick={() => navigate(`/notifications?alert=${alert.notification_id}`)}
                style={{ cursor: 'pointer' }}
              >
                <span className="alert-icon-svg">
                  {getAlertIcon(alert.disaster_type, alert.title)}
                </span>
                <div className="alert-content">
                  <h4>{alert.title}</h4>
                  <p>
                    {alert.message.length > 80 
                      ? alert.message.slice(0, 80) + '...' 
                      : alert.message}
                    {alert.message.length > 80 && (
                      <span className="see-more-link"> See More</span>
                    )}
                  </p>
                </div>
                <span className="alert-time">
                  {formatTime(alert.created_at)}
                </span>
              </div>
            ))}
          </div>

          <a href="/notifications" className="view-more-alerts">
            View More Alerts
          </a>
        </div>

        <div className="water-level-card">
          <div className={`water-header ${waterLevel ? waterLevelService.getStatusClass(waterLevel.status) : ''}`}>
            <img src={waterLevelIcon} className="water-level-icon" />
            <span className="marikina-river-text">MARIKINA RIVER</span>
            <h2 className="water-level-title">WATER LEVEL UPDATE</h2>
          </div>

          <div className="water-body">
            {waterLevelLoading ? (
              <div className="water-status-text">Loading...</div>
            ) : waterLevel ? (
              <>
                <div className="water-status-text">
                  Status: {waterLevelService.getStatusText(waterLevel.status)}
                </div>
                <div className={`water-value ${waterLevelService.getStatusClass(waterLevel.status)}`}>
                  {waterLevel.status} ({waterLevel.levelMeters.toFixed(2)}m)
                </div>
                <div className="water-timestamp">
                  {formatDateTime(waterLevel.timestamp)}
                </div>
                <button 
                  className="evac-btn"
                  onClick={() => navigate('/map')}
                >
                  View Nearest Evacuation Center
                </button>
              </>
            ) : (
              <div className="water-status-text">
                Unable to fetch water level data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;