import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import './AdminDashboard.css';
import { supabase } from '../../lib/supabase';

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

const AdminDashboard = () => {
  // ============================
  // STATE
  // ============================
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [notifyResidents, setNotifyResidents] = useState(true);

  const [loadingCenters, setLoadingCenters] = useState(true);
  const [centersError, setCentersError] = useState<string | null>(null);

  // ============================
  // FETCH CENTERS
  // ============================
  useEffect(() => {
    const fetchCenters = async () => {
      setLoadingCenters(true);
      setCentersError(null);

      const { data, error } = await supabase
        .from('evacuation_centers')
        .select('center_id, name, capacity, current_occupancy');

      if (error || !data) {
        console.error('Failed to fetch evacuation centers:', error);
        setCentersError('Failed to load evacuation centers.');
        setLoadingCenters(false);
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
        };
      });

      setCenters(mapped);
      setLoadingCenters(false);
    };

    fetchCenters();
  }, []);

  // ============================
  // SEARCH DEBOUNCE
  // ============================
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  // ============================
  // TOGGLE STATUS (UI ONLY)
  // ============================
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

  // ============================
  // REALTIME (ADMIN VIEW SYNC)
  // ============================
  useEffect(() => {
    const channel = supabase
      .channel('admin-evacuation-centers-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evacuation_centers',
        },
        payload => {
          if (!payload.new) return;

          const updated = payload.new as {
            center_id: string;
            current_occupancy: number;
          };

          setCenters(prev =>
            prev.map(center => {
              if (center.id !== updated.center_id) return center;

              const occupancy = updated.current_occupancy ?? 0;

              return {
                ...center,
                currentOccupancy: occupancy,
                status:
                  occupancy >= center.capacity
                    ? 'full'
                    : 'available',
                dirty: false,
              };
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ============================
  // CREATE NOTIFICATION (KEY PART)
  // ============================
  const createNotification = async (message: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from('notifications').insert({
      title: 'Evacuation Center Update',
      message,
      target_role: 'USER',
      created_by: user.id,
    });
  };

  // ============================
  // UPDATE HANDLER (WITH NOTIF)
  // ============================
  const handleUpdate = async () => {
    const changedCenters = centers.filter(c => c.dirty);
    if (changedCenters.length === 0) return;

    // 1. Update evacuation centers
    const updates = changedCenters.map(c =>
      supabase
        .from('evacuation_centers')
        .update({
          current_occupancy: c.currentOccupancy,
        })
        .eq('center_id', c.id)
    );

    const results = await Promise.all(updates);
    if (results.some(r => r.error)) {
      console.error('Failed to update centers', results);
      return;
    }

    // 2. Create notification if checkbox checked
    if (notifyResidents) {
      const fullCenters = changedCenters.filter(
        c => c.currentOccupancy >= c.capacity
      );

      if (fullCenters.length > 0) {
        const message = fullCenters
          .map(c => `${c.name} is now FULL`)
          .join(', ');

        await createNotification(message);
      }
    }

    // 3. Reset dirty flags
    setCenters(prev =>
      prev.map(c => ({ ...c, dirty: false }))
    );
  };

  // ============================
  // DERIVED DATA
  // ============================
  const normalizedSearch = debouncedSearch.trim().toLowerCase();

  const filteredCenters = centers.filter(center =>
    !normalizedSearch
      ? true
      : center.name.toLowerCase().includes(normalizedSearch)
  );

  const atCapacityCount = centers.filter(
    c => c.currentOccupancy >= c.capacity
  ).length;

  const availableCount = centers.filter(
    c => c.currentOccupancy < c.capacity
  ).length;

  const renderHighlightedText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="search-highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // ============================
  // UI
  // ============================
  return (
    <AdminLayout>
      <div className="admin-dashboard">
        {/* SUMMARY */}
        <section className="capacity-summary">
          <div className="summary-card full">
            <div className="summary-icon-box">
              <img src={notificationsIcon} className="summary-icon" />
            </div>
            <div className="summary-content">
              <span className="summary-number">{atCapacityCount}</span>
              <span className="summary-label">ECs At Capacity</span>
            </div>
          </div>

          <div className="summary-card available">
            <div className="summary-icon-box">
              <img src={notificationsIcon} className="summary-icon" />
            </div>
            <div className="summary-content">
              <span className="summary-number">{availableCount}</span>
              <span className="summary-label">ECs Available</span>
            </div>
          </div>
        </section>

        {/* MANAGE CENTERS */}
        <section className="capacity-card">
          <div className="capacity-header">
            <h2>Manage Evacuation Center Status</h2>
          </div>

          <div className="capacity-search">
            <input
              type="text"
              placeholder="Type the evacuation center / barangay name"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              className="update-btn"
              onClick={handleUpdate}
              disabled={loadingCenters || !!centersError}
            >
              Update
            </button>
          </div>

          <div className="capacity-list">
            {loadingCenters && (
              <div className="capacity-message">
                Loading evacuation centers…
              </div>
            )}

            {!loadingCenters && centersError && (
              <div className="capacity-message error">
                {centersError}
              </div>
            )}

            {!loadingCenters &&
              !centersError &&
              filteredCenters.map(center => (
                <div key={center.id} className="capacity-row">
                  <span className="center-name">
                    {renderHighlightedText(center.name, debouncedSearch)}
                  </span>
                  <button
                    className={`status-pill ${center.status}`}
                    onClick={() => toggleStatus(center.id)}
                  >
                    {center.status === 'available'
                      ? 'Available'
                      : 'Full'}
                  </button>
                </div>
              ))}
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
