import { useState } from 'react';
import AdminLayout from './AdminLayout';
import './AdminDashboard.css';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import { useEffect } from 'react';

import notificationsIcon from '../../assets/icon-notification.svg';

type CenterStatus = 'available' | 'full';

interface EvacuationCenter {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  status: CenterStatus;
  dirty: boolean;
}

const highlightText = (text: string, searchTerm: string) => {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');

  return text.split(regex).map((part, index) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <mark key={index} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const AdminDashboard = () => {
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [search, setSearch] = useState('');
  const [notifyResidents, setNotifyResidents] = useState(true);

  useEffect(() => {
    const fetchCenters = async () => {
      const { data, error } = await supabase
        .from('evacuation_centers')
        .select('center_id, name, capacity, current_occupancy');

      if (error) {
        console.error('Failed to fetch evacuation centers:', error);
        return;
      }

      const mapped: EvacuationCenter[] = data.map(c => {
        const occupancy = c.current_occupancy ?? 0;

        return {
          id: c.center_id,
          name: c.name,
          capacity: c.capacity,
          currentOccupancy: occupancy,
          status: occupancy >= c.capacity ? 'full' : 'available',
          dirty: false,
        }
      });

      setCenters(mapped);
    };

    fetchCenters();
  }, []);

  const toggleStatus = (id: string) => {
    setCenters(prev =>
      prev.map(c => {
        if (c.id !== id) return c;

        const newStatus = c.status === 'available' ? 'full' : 'available';

        return {
          ...c,
          status: newStatus,
          currentOccupancy:
            newStatus === 'full'
              ? c.capacity
              : Math.max(c.capacity - 1, 0),
          dirty: true,
        };
      })
    );
  };

  const handleUpdate = async () => {
    const changedCenters = centers.filter(c => c.dirty);

    if (changedCenters.length === 0) return;

    const updates = changedCenters.map(c =>
      supabase
        .from('evacuation_centers')
        .update({
          current_occupancy: c.currentOccupancy,
          updated_at: new Date().toISOString(),
        })
        .eq('center_id', c.id)
    );

    const results = await Promise.all(updates);

    const hasError = results.some(r => r.error);
    if (hasError) {
      console.error('Failed to update one or more centers', results);
      return;
    }

    console.log('Centers updated successfully');
    console.log('Notify residents:', notifyResidents);

    // Reset dirty flags
    setCenters(prev =>
      prev.map(c => ({ ...c, dirty: false }))
    );
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCenters = centers.filter(center => {
    if (!normalizedSearch) return true;

    return center.name.toLowerCase().includes(normalizedSearch);
  });

  const atCapacityCount = centers.filter(
    c => c.currentOccupancy >= c.capacity
  ).length;

  const availableCount = centers.filter(
    c => c.currentOccupancy < c.capacity
  ).length;

  return (
    <AdminLayout>
      <div className="admin-dashboard">

        {/* count */}
        <section className="capacity-summary">
          <div className="summary-card full">
            <div className="summary-icon-box">
              <img
                src={notificationsIcon}
                alt="Notification"
                className="summary-icon"
              />
            </div>

            <div className="summary-content">
              <span className="summary-number">{atCapacityCount}</span>
              <span className="summary-label">ECs At Capacity</span>
            </div>
          </div>

          <div className="summary-card available">
            <div className="summary-icon-box">
              <img
                src={notificationsIcon}
                alt="Notification"
                className="summary-icon"
              />
            </div>

            <div className="summary-content">
              <span className="summary-number">{availableCount}</span>
              <span className="summary-label">ECs Available</span>
            </div>
          </div>

        </section>

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
                <span className="center-name">
                    {highlightText(center.name, search)}
                </span>

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
                No evacuation centers found matching "<strong>{search}</strong>".
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