import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { supabase } from '../lib/supabase';

import {
  CloudRainWindIcon,
  ActivityIcon,
  FireAlertIcon,
  EvacuationIcon,
  BellIcon
} from './NotificationsIcons';

import currentStatusIcon from '../assets/icon-current-status.png';
import notificationBellIcon from '../assets/icon-notification.png';
import waterLevelIcon from '../assets/icon-water-level.png';
import hotlineIcon from '../assets/icon-emergency-hotlines.png';
import mapIcon from '../assets/icon-evacuation-map.png';
import cardIcon from '../assets/icon-profile-card.png';
import communityStatusIcon from '../assets/icon-community-status.svg';

interface Notification {
  notification_id: string;
  title: string;
  message: string;
  created_at: string;
  disaster_type: string;
}

const Dashboard = () => {
  const navigate = useNavigate();

  // REALTIME COUNTS
  const [atCapacityCount, setAtCapacityCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);

  // REALTIME ALERTS
  const [alerts, setAlerts] = useState<Notification[]>([]);

  // ============================
  // EVACUATION CENTER COUNTS
  // ============================

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

  // ============================
  // RECENT ALERTS (REALTIME)
  // ============================

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

  const [now, setNow] = useState(Date.now());


  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: string) => {
    const diff = now - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
  };

  return (
    <div className="dashboard-grid">
      <div className="left-column">

        {/* STATUS CARDS */}
        <section className="status-row">
          <div className="status-card success">
            <div className="icon-box">
              <img src={currentStatusIcon} alt="Stable" />
            </div>
            <div className="status-info">
              <h3>STABLE</h3>
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
          <div className="map-card" />
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
          <div className="water-header">
            <img src={waterLevelIcon} className="water-level-icon" />
            <span className="marikina-river-text">MARIKINA RIVER</span>
            <h2 className="water-level-title">WATER LEVEL UPDATE</h2>
          </div>

          <div className="water-body">
            <div className="water-status-text">Status: Normal</div>
            <div className="water-value normal">NORMAL (14.2m)</div>
            <div className="water-timestamp">
              As of 11:20 AM | 22 July 2025
            </div>
            <button className="evac-btn">
              View Nearest Evacuation Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;