import AdminLayout from './AdminLayout';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <AdminLayout>
        <div className="admin-dashboard">

            {/* TOP DASHBOARD GRID */}
            <section className="admin-dashboard-grid">
            {/* CURRENT STATUS CARD */}
            <div className="admin-card status-card">
                <h3 className="card-title">STABLE</h3>
                <p className="card-subtitle">Your Current Status</p>

                <div className="status-buttons">
                <button className="status-btn normal">NORMAL</button>
                <button className="status-btn alert">ALERT</button>
                <button className="status-btn urgent">URGENT</button>
                <button className="status-btn critical">CRITICAL</button>
                </div>

                <button className="admin-primary-btn">
                Update Status
                </button>
            </div>

            {/* ECS AT CAPACITY */}
            <div className="admin-card info-card">
                <h3 className="card-title">5</h3>
                <p className="card-subtitle">ECs At Capacity</p>

                <input
                type="text"
                placeholder="Type the Full Capacity Evacuation Center"
                className="admin-input"
                />

                <button className="admin-secondary-btn">
                Update
                </button>
            </div>

            {/* ECS VACANT */}
            <div className="admin-card info-card">
                <h3 className="card-title">30</h3>
                <p className="card-subtitle">ECs Vacant</p>

                <input
                type="text"
                placeholder="Type the Available Evacuation Center"
                className="admin-input"
                />

                <button className="admin-secondary-btn">
                Update
                </button>
            </div>
            </section>

            {/* UPDATE ALERTS */}
            <section className="admin-alerts-card">
            <h2 className="alerts-title">Update Alerts</h2>

            <div className="alert-levels">
                <button className="level-btn normal">NORMAL</button>
                <button className="level-btn alert">ALERT</button>
                <button className="level-btn urgent">URGENT</button>
                <button className="level-btn critical">CRITICAL</button>
            </div>

            <div className="alert-types">
                <button className="type-btn active">ALL TYPES</button>
                <button className="type-btn">TYPHOON UPDATES</button>
                <button className="type-btn">EARTHQUAKE UPDATES</button>
                <button className="type-btn">FIRE UPDATES</button>
            </div>

            <textarea
                className="admin-alert-textarea"
                placeholder="Type the alert message here..."
            />

            <button className="admin-primary-btn center">
                Send Alert
            </button>
            </section>

        </div>
    </AdminLayout>

  );
};

export default AdminDashboard;