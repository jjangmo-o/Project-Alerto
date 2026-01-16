import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import './AdminDashboard.css';
import { supabase } from '../../lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js'

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

const BARANGAYS = [
  { id: '3fee7818-0f5f-424e-ad29-4c4a7a217a0c', name: 'Barangka' },
  { id: 'c8b28f65-8466-4b52-8a98-2f95bc4f45ab', name: 'Calumpang' },
  { id: '11af9721-639d-4237-ac99-f226ff413329', name: 'Concepcion I' },
  { id: '440c0ddf-c31d-4031-95a2-813b5159f144', name: 'Concepcion II' },
  { id: '7d948164-954c-43b8-9463-22a7a494b40b', name: 'Fortune' },
  { id: '736a9cdd-e8ec-4f49-a413-db138c5d06a7', name: 'Industrial Valley' },
  { id: '26ea0dd6-f2dd-4914-8f6c-196587c9413a', name: 'Jesus Dela Peña' },
  { id: '4119162b-f6f6-414b-8db1-c9c4462e6380', name: 'Malanday' },
  { id: '7b32821a-285f-4c78-ac57-fd0812ca36ed', name: 'Marikina Heights' },
  { id: 'f668a15e-ffea-4a93-abf3-e63c8edb5ea1', name: 'Nangka' },
  { id: '299a25fe-197a-43fb-ade2-0c3cc76d91cb', name: 'Parang' },
  { id: '19f6fc41-38b8-4a1b-83e7-a2ceb14bdb06', name: 'San Roque' },
  { id: 'f1a0f639-eae6-475c-ba71-7c6a8da52de7', name: 'Santa Elena' },
  { id: 'ed6073e5-688f-445e-93a2-e5b913840b30', name: 'Santo Niño' },
  { id: '7584c655-3867-4529-b381-518cfd61f6c0', name: 'Tañong' },
  { id: 'f459284f-9a62-4adb-b5a2-807f833dafac', name: 'Tumana' },
]

const AdminDashboard = () => {
// for alert
const [alertTitle, setAlertTitle] = useState('')

// for barangay selection
const [selectedBarangays, setSelectedBarangays] = useState<string[]>([])


  const [severity, setSeverity] =
  useState<'normal' | 'alert' | 'urgent' | 'critical'>('normal')

  const [disasterType, setDisasterType] =
    useState<'typhoon' | 'earthquake' | 'fire'>('typhoon')

  const [message, setMessage] = useState('')
  const [sendToResidents, setSendToResidents] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [adminProfileId, setAdminProfileId] = useState<string | null>(null)

  // ============================
  // STATE
  // ============================
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);

  // For search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [notifyResidents, setNotifyResidents] = useState(true);

  // For loading and error states
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [centersError, setCentersError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('No authenticated user')
        return
      }

      if (!user.email) {
        console.error('Authenticated user has no email')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('profile_id, role')
        .eq('email', user.email)
        .single()

      if (profileError) {
        console.error('Profile fetch failed', profileError)
        return
      }

      if (profile.role !== 'ADMIN') {
        console.error('User is not admin')
        return
      }

      setAdminProfileId(profile.profile_id)
    }

    loadProfile()
  }, [])

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

      if (error) {
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

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
  // UPDATE HANDLER (WITH NOTIF)
  // ============================
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

const normalizedSearch = debouncedSearch.trim().toLowerCase();

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

  const renderHighlightedText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="search-highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleSendAlert = async () => {
    if (!message.trim()) {
      alert('Please enter an alert message.')
      return
    }

    if (!adminProfileId) {
      alert('Admin profile not loaded yet.')
      return
    }

    setIsSubmitting(true)

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        title: alertTitle || 'General Alert',
        message,
        disaster_type: disasterType,
        severity,
        target_role: sendToResidents ? 'USER' : 'ADMIN',
        created_by: adminProfileId,
      })
      .select()
      .single()

    if (error) {
      const pgError = error as PostgrestError
      console.error('SUPABASE ERROR:', pgError)
      alert(`${pgError.code}: ${pgError.message}`)
      setIsSubmitting(false)
      return
    }

    if (selectedBarangays.length > 0) {
      const rows = selectedBarangays.map((barangayId) => ({
        notification_id: notification.notification_id,
        barangay_id: barangayId,
      }))

      const { error: barangayError } = await supabase
        .from('notification_barangays')
        .insert(rows)

      if (barangayError) {
        const pgError = barangayError as PostgrestError
        console.error('BARANGAY LINK ERROR:', pgError)
        alert(`${pgError.code}: ${pgError.message}`)
        setIsSubmitting(false)
        return
      }
    }

    setIsSubmitting(false)
    setShowSuccess(true)
    setMessage('')
    setTimeout(() => setShowSuccess(false), 2000)
    setAlertTitle('')
    setSelectedBarangays([])
  }

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

            {!loadingCenters && !centersError && filteredCenters.length === 0 && (
              <div className="capacity-message">
                No evacuation centers found.
              </div>
            )}

            {!loadingCenters && !centersError && filteredCenters.map(center => (
              <div key={center.id} className="capacity-row">
                <span className="center-name">
                {renderHighlightedText(center.name, debouncedSearch)}
              </span>

                <button
                  className={`status-pill ${center.status}`}
                  onClick={() => toggleStatus(center.id)}
                >
                  {center.status === 'available' ? 'Available' : 'Full'}
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
        
        <section className="update-alerts-section">
          <h2 className="update-alerts-title">Update Alerts</h2>

          <div className="update-alerts-row">
            {/* Severity */}
            <div className="alert-group">
              <label>Alert Severity</label>
              <div className="alert-buttons">
                {['normal', 'alert', 'urgent', 'critical'].map((level) => (
                  <button
                    key={level}
                    className={`severity-btn ${severity === level ? 'active' : ''} ${level}`}
                    onClick={() => setSeverity(level as 'normal' | 'alert' | 'urgent' | 'critical')}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Disaster Type */}
            <div className="alert-group right">
              <label>Disaster Type</label>
              <div className="alert-buttons">
                {['typhoon', 'earthquake', 'fire'].map((type) => (
                  <button
                    key={type}
                    className={`type-btn ${disasterType === type ? 'active' : ''}`}
                    onClick={() => setDisasterType(type as 'typhoon' | 'earthquake' | 'fire')}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)} Updates
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <input
            className="admin-input"
            type="text"
            placeholder="Alert title (e.g. Flood Warning - Tumana)"
            value={alertTitle}
            onChange={(e) => setAlertTitle(e.target.value)}
          />

          <textarea
            className="alert-textarea"
            placeholder="Type the alert message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="alert-group">
            <label>Affected Barangays</label>

            <div className="barangay-selector">
              <div className="barangay-grid">
                {BARANGAYS.map((b) => (
                  <label
                    key={b.id}
                    className={`barangay-option ${
                      selectedBarangays.includes(b.id) ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBarangays.includes(b.id)}
                      onChange={() =>
                        setSelectedBarangays((prev) =>
                          prev.includes(b.id)
                            ? prev.filter((id) => id !== b.id)
                            : [...prev, b.id]
                        )
                      }
                    />
                    <span>{b.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <label className="alert-checkbox">
            <input
              type="checkbox"
              checked={sendToResidents}
              onChange={() => setSendToResidents(!sendToResidents)}
            />
            Send notifications to alert residents
          </label>

          <div className="send-alert-wrapper">
            <button
              className="send-alert-btn"
              onClick={handleSendAlert}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Alert'}
            </button>
          </div>

          {showSuccess && (
            <div className="alert-success">
              Alert sent successfully.
            </div>
          )}

          </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;