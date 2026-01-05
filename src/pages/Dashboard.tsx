import React from 'react';
import './Dashboard.css';

import logoImg from '../assets/logo-lighthouse.png';
import menuIcon from '../assets/icon-menu.png';
import currentStatusIcon from '../assets/icon-current-status.png';
import notificationBellIcon from '../assets/icon-notification.png';
import waterLevelIcon from '../assets/icon-water-level.png';
import hotlineIcon from '../assets/icon-emergency-hotlines.png';
import mapIcon from '../assets/icon-evacuation-map.png';
import cardIcon from '../assets/icon-profile-card.png';
import alertRed from '../assets/icon-red-alert.png';
import alertOrange from '../assets/icon-orange-alert.png';
import alertGreen from '../assets/icon-green-alert.png';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      
      {/* --- for sidebar --- */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          {}
          <img src={logoImg} alt="Project Alerto Logo" />
          <h2>Project Alerto</h2>
          <p>Marikeños Readiness Hub</p>
        </div>

        <nav className="nav-menu">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Emergency Hotlines</button>
          <button className="nav-item">Evacuation Map</button>
          <button className="nav-item">Residence Card</button>
          <button className="nav-item">Notifications</button>
        </nav>

        <button className="logout-btn">Logout</button>
      </aside>

      {}
      <main className="main-content">
        {/* top header */}
        <header className="top-header">
          <div className="header-title">
            <img src={menuIcon} alt="Menu" className="menu-icon-img" />
            Dashboard
          </div>
          <div className="user-profile">
            <div className="avatar-circle"></div>
            <span>Hello, user!</span>
          </div>
        </header>

        <div className="dashboard-grid">
          
          <div className="left-column"> 
            
            {/* row 1 aka status cards */}
            <section className="status-row">
              <div className="status-card">
                <div className="icon-box">
                  {}
                  <img src={currentStatusIcon} alt="Stable" />
                </div>
                <div className="status-info">
                  <h3>STABLE</h3>
                  <p>Your Current Status</p>
                </div>
              </div>
              <div className="status-card">
                <div className="icon-box">
                  {}
                  <img src={notificationBellIcon} alt="Alerts" />
                </div>
                <div className="status-info">
                  <h3>5</h3>
                  <p>ECs At Capacity</p>
                </div>
              </div>
              <div className="status-card">
                <div className="icon-box">
                  {}
                  <img src={notificationBellIcon} alt="ECs Vacant" />
                </div>
                <div className="status-info">
                  <h3>30</h3>
                  <p>ECs Vacant</p>
                </div>
              </div>
            </section>

            {/* row 2 aka map & water Level card */}
            <section className="map-water-row">
              <div className="map-card">
                {}
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
                    <div className="water-value">NORMAL (14.2m)</div>
                    <div className="water-timestamp">As of 11:20 AM | 22 July 2025</div>
                  </div>
                  <button className="evac-btn">View Nearest Evacuation Center</button>
                </div>
              </div>
            </section>

            {/* row 3 aka preparedness hub */}
            <section>
              <h3 className="hub-title">Preparedness Hub</h3>
              <div className="hub-row">
                <div className="hub-card">
                  <img src={hotlineIcon} alt="Hotlines" className="hub-icon" />
                  <div className="hub-label">Emergency Hotlines</div>
                </div>
                <div className="hub-card">
                  <img src={mapIcon} alt="Map" className="hub-icon" />
                  <div className="hub-label">Evacuation Map</div>
                </div>
                <div className="hub-card">
                  <img src={cardIcon} alt="Card" className="hub-icon" />
                  <div className="hub-label">Residence Card</div>
                </div>
              </div>
            </section>

          </div>

          <div className="right-column">
            
            <div className="info-card">
              <h3>Recent Alerts</h3>
              
              <div className="alert-item">
                <img src={alertRed} alt="Critical" className="alert-icon" />
                <div className="alert-content">
                  <h4>Flood Level Rising</h4>
                  <p>- Brgy San Roque</p>
                </div>
                <span className="alert-time">Just now</span>
              </div>

              <div className="alert-item">
                <img src={alertOrange} alt="Warning" className="alert-icon" />
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
                  <p>Level is now at CRITICAL</p>
                </div>
                <span className="alert-time">17m ago</span>
              </div>
            </div>

            <div className="info-card" style={{flexGrow: 1}}>
              <h3>Evacuation Centers</h3>
              <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ADB5BD', fontWeight: '600'}}>
                List of Centers...
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;