import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './CommunityStatus.css';

const CommunityStatus = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="community-status-container">
      <Sidebar isOpen={isSidebarOpen} />

      <main className="community-status-main">
        <Header onMenuClick={toggleSidebar} />

        <section className="community-status-content">
          <h2 className="community-title">Community Status</h2>

          <p className="community-description">
            This page provides real-time insights of the community into the situation ofevery Marikeños.
          </p>

          <div className="community-placeholder">
            <p>This is just a placeholder for now, still waiting for backend. Status content goes here.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CommunityStatus;
