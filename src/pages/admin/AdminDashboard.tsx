import { useState } from 'react';
import AdminLayout from './AdminLayout';
import './AdminDashboard.css';

type CenterStatus = 'available' | 'full';

interface EvacuationCenter {
  id: string;
  name: string;
  status: CenterStatus;
  dirty: boolean;
}

const INITIAL_CENTERS: EvacuationCenter[] = [
  { id: '1', name: 'Barangay Elementary School', status: 'available', dirty: false },
  { id: '2', name: 'Barangay Gymnasium', status: 'full', dirty: false },
  { id: '3', name: 'Community Covered Court', status: 'available', dirty: false },
  { id: '4', name: 'Multi-purpose Hall', status: 'available', dirty: false },
  { id: '5', name: 'Barangay Evacuation Center', status: 'full', dirty: false },
];

const AdminDashboard = () => {
  const [centers, setCenters] = useState<EvacuationCenter[]>(INITIAL_CENTERS);
  const [search, setSearch] = useState('');
  const [notifyResidents, setNotifyResidents] = useState(true);

  const toggleStatus = (id: string) => {
    setCenters(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              status: c.status === 'available' ? 'full' : 'available',
              dirty: true,
            }
          : c
      )
    );
  };

  const handleUpdate = () => {
    const changedCenters = centers.filter(c => c.dirty);

    console.log('Updated centers:', changedCenters);
    console.log('Notify residents:', notifyResidents);

    setCenters(prev =>
      prev.map(c => ({ ...c, dirty: false }))
    );
  };

  const filteredCenters = centers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="admin-dashboard">

        {/* evac center capacity card */}
        <section className="capacity-card">
          <div className="capacity-header">
            <h2>Toggle Capacity Status of Evacuation Centers</h2>
          </div>

          <div className="capacity-search">
            <input
              type="text"
              placeholder="Type the evacuation center / barangay name"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="update-btn" onClick={handleUpdate}>
              Update
            </button>
          </div>

          <div className="capacity-list">
            {filteredCenters.map(center => (
              <div key={center.id} className="capacity-row">
                <span className="center-name">{center.name}</span>

                <button
                  className={`status-pill ${center.status}`}
                  onClick={() => toggleStatus(center.id)}
                >
                  {center.status === 'available' ? 'Available' : 'Full'}
                </button>
              </div>
            ))}

            {filteredCenters.length === 0 && (
              <div className="no-results">
                No evacuation centers found.
              </div>
            )}
          </div>

          <div className="capacity-footer">
            <label className="notify-checkbox">
              <input
                type="checkbox"
                checked={notifyResidents}
                onChange={e => setNotifyResidents(e.target.checked)}
              />
              Send notifications to alert residents
            </label>
          </div>
        </section>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;