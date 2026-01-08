import { useState } from 'react';
import './Residence.css';
import Sidebar from './Sidebar';
import Header from './Header';

import profileImg from '../assets/sample-resident.png';

const Residence: React.FC = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* HEADER */}
        <Header onMenuClick={toggleSidebar} />

        {/* PAGE CONTENT */}
        <div className="residence-page">
          <div className="residence-card">
            <h1 className="residence-title">Marikeño's Residence Card</h1>

            <div className="residence-content">
              {/* LEFT: PHOTO */}
              <div className="residence-photo">
                <img src={profileImg} alt="Resident" />
              </div>

              {/* RIGHT: DETAILS */}
              <div className="residence-details">
                <div className="detail-block">
                  <span className="label">LAST NAME, FIRST NAME MIDDLE INITIAL</span>
                  <p className="value name">Minatozaki, Sana</p>
                </div>

                <div className="detail-row">
                  <div className="detail-block">
                    <span className="label">AGE</span>
                    <p className="value">30</p>
                  </div>

                  <div className="detail-block">
                    <span className="label">GENDER</span>
                    <p className="value">Female</p>
                  </div>
                </div>

                <div className="detail-block">
                  <span className="label">ADDRESS</span>
                  <p className="value">
                    170 General Julian Cruz St., Barangka,<br />
                    Marikina City
                  </p>
                </div>

                <div className="detail-block">
                  <span className="label">CONTACT</span>
                  <p className="value">099934567898</p>
                </div>

                <div className="detail-block">
                  <span className="label">EMAIL</span>
                  <p className="value">sanaminatozaki@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

};

export default Residence;
