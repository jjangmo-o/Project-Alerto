import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Dashboard.css';
import Sidebar from './Sidebar';
import Header from './Header';

import currentStatusIcon from '../assets/icon-current-status.png';
import notificationBellIcon from '../assets/icon-notification.png';
import waterLevelIcon from '../assets/icon-water-level.png';
import hotlineIcon from '../assets/icon-emergency-hotlines.png';
import mapIcon from '../assets/icon-evacuation-map.png';
import cardIcon from '../assets/icon-profile-card.png';
import alertRed from '../assets/icon-red-alert.png';
import alertYellow from '../assets/icon-yellow-alert.png';
import alertOrange from '../assets/icon-orange-alert.png';
import alertGreen from '../assets/icon-green-alert.svg';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { profile } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Get user's first name from profile
  const userName = profile?.first_name || 'User';

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen}/>

      <main className="main-content">
        <Header
          onMenuClick={toggleSidebar}
          username={userName}
        />


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
                  <h3>5</h3>
                  <p>ECs At Capacity</p>
                </div>
              </div>

              <div className="status-card warning">
                <div className="icon-box">
                  <img src={notificationBellIcon} alt="Vacant" />
                </div>
                <div className="status-info">
                  <h3>30</h3>
                  <p>ECs Vacant</p>
                </div>
              </div>
            </section>

            {/* MAP & WATER LEVEL */}
            <section className="map-water-row">
              <div className="map-card">
                {/* Map content */}
              </div>

              <div className="water-level-card">
                <div className="water-header">
                  <img src={waterLevelIcon} alt="Water Level" className="water-level-icon" />
                  <span className="marikina-river-text">MARIKINA RIVER</span>
                  <h2 className="water-level-title">WATER LEVEL UPDATE</h2>
                </div>

                <div className="water-body">
                  <div className="water-status-group">
                    <div className="water-status-text">Status: Normal</div>
                    <div className="water-value normal">NORMAL (14.2m)</div>
                    <div className="water-timestamp">
                      As of 11:20 AM | 22 July 2025
                    </div>
                  </div>
                  <button className="evac-btn">
                    View Nearest Evacuation Center
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="right-column">
            <div className="info-card recent-alerts-card">
              <h3>Recent Alerts</h3>

              <div className="alerts-list">
                <div className="alert-item">
                  <img src={alertRed} alt="Critical" className="alert-icon" />
                  <div className="alert-content">
                    <h4>Flood Level Rising</h4>
                    <p>- Brgy San Roque</p>
                  </div>
                  <span className="alert-time">Just now</span>
                </div>

                <div className="alert-item">
                  <img src={alertYellow} alt="Warning" className="alert-icon" />
                  <div className="alert-content">
                    <h4>Evacuation Center Full</h4>
                    <p>- Brgy Tañong</p>
                  </div>
                  <span className="alert-time">10m ago</span>
                </div>

                <div className="alert-item">
                  <img src={alertGreen} alt="Resolved" className="alert-icon" />
                  <div className="alert-content">
                    <h4>Aid Delivered</h4>
                    <p>- Brgy Malanday</p>
                  </div>
                  <span className="alert-time">15m ago</span>
                </div>

                <div className="alert-item">
                  <img src={alertOrange} alt="Warning" className="alert-icon" />
                  <div className="alert-content">
                    <h4>Marikina River Water</h4>
                    <p>Level is now at CRITICAL level</p>
                  </div>
                  <span className="alert-time">17m ago</span>
                </div>
              </div>
            </div>


            
            {/* 
              TEMPORARILY HIDDEN:
              Evacuation Centers Card
            */}
            {/*
            <div className="info-card">
              <h3>Evacuation Centers</h3>
              <div className="evac-list-container">
                ...
              </div>
            </div>
            */}
          </div>

          
        </div>

        {/* ✅ FULL-WIDTH PREPAREDNESS HUB */}
<section className="hub-section">
  <h3 className="hub-title">Preparedness Hub</h3>

  <div className="hub-row">
    <div className="hub-card" tabIndex={0}>
      <img src={hotlineIcon} className="hub-icon" />
      <div className="hub-label">Emergency Hotlines</div>
    </div>

    <div className="hub-card" tabIndex={0}>
      <img src={mapIcon} className="hub-icon" />
      <div className="hub-label">Evacuation Map</div>
    </div>

    <div className="hub-card" tabIndex={0}>
      <img src={cardIcon} className="hub-icon" />
      <div className="hub-label">Residence Card</div>
    </div>

    <div className="hub-card" tabIndex={0}>
      <img src={currentStatusIcon} className="hub-icon" />
      <div className="hub-label">Community Status</div>
    </div>
  </div>
</section>
      </main>
    </div>
  );
};

export default Dashboard;
