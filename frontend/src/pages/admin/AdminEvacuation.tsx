import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from './AdminLayout';
import './AdminEvacuation.css';

interface EvacuationCenter {
  center_id: string;
  name: string;
  address: string;
  capacity: number;
  current_occupancy: number;
  latitude: number;
  longitude: number;
  center_code: string | null;
  barangay_id: string | null;
  updated_at: string;
}

interface Barangay {
  barangay_id: string;
  name: string;
}

const AdminEvacuationMap = () => {
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<EvacuationCenter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for alert notification prompt
  const [showAlertPrompt, setShowAlertPrompt] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    center: EvacuationCenter;
    newCapacity: number;
    newOccupancy: number;
    newStatus: string;
  } | null>(null);
  const [adminProfileId, setAdminProfileId] = useState<string | null>(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    current_occupancy: 0,
    capacity: 0,
  });

  // Fetch all evacuation centers
  const fetchCenters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('evacuation_centers')
        .select('*')
        .order('name');

      if (error) throw error;
      setCenters(
        (data || []).map((center: any) => ({
          ...center,
          address: center.address ?? '',
          updated_at: center.updated_at ?? '',
          current_occupancy: center.current_occupancy ?? 0,
        })) as EvacuationCenter[]
      );
    } catch (err) {
      console.error('Error fetching centers:', err);
      alert('Failed to load evacuation centers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch barangays for reference
  const fetchBarangays = async () => {
    try {
      const { data, error } = await supabase
        .from('barangays')
        .select('barangay_id, name')
        .order('name');

      if (error) throw error;
      setBarangays(data || []);
    } catch (err) {
      console.error('Error fetching barangays:', err);
    }
  };

  useEffect(() => {
    fetchCenters();
    fetchBarangays();
    
    // Fetch admin profile
    const loadAdminProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_id')
          .eq('email', user.email)
          .single();
        if (profile) {
          setAdminProfileId(profile.profile_id);
        }
      }
    };
    loadAdminProfile();

    // Set up real-time subscription for capacity changes
    const channel = supabase
      .channel('evacuation-centers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evacuation_centers',
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchCenters(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle center selection
  const handleSelectCenter = (center: EvacuationCenter) => {
    setSelectedCenter(center);
    setEditForm({
      current_occupancy: center.current_occupancy || 0,
      capacity: center.capacity,
    });
    setIsEditing(false);
  };

  // Get status label for display
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'full': return 'Full';
      case 'near-full': return 'Near-Full';
      case 'half-full': return 'Half-Full';
      case 'open': return 'Open';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  // Handle update capacity - now shows prompt first
  const handleUpdateCapacity = async () => {
    if (!selectedCenter) return;

    // Validation
    if (editForm.capacity < 0) {
      alert('Capacity cannot be negative');
      return;
    }

    if (editForm.current_occupancy < 0) {
      alert('Current occupancy cannot be negative');
      return;
    }

    if (editForm.current_occupancy > editForm.capacity) {
      alert('Current occupancy cannot exceed total capacity');
      return;
    }

    // Calculate new status
    const newStatus = getStatusFromValues(editForm.current_occupancy, editForm.capacity);

    // Store pending update and show prompt
    setPendingUpdate({
      center: selectedCenter,
      newCapacity: editForm.capacity,
      newOccupancy: editForm.current_occupancy,
      newStatus: newStatus,
    });
    setShowAlertPrompt(true);
  };

  // Save the update (called after prompt decision)
  const saveUpdate = async (sendAlert: boolean) => {
    if (!pendingUpdate) return;

    try {
      setIsSaving(true);
      setShowAlertPrompt(false);

      const { error } = await supabase
        .from('evacuation_centers')
        .update({
          capacity: pendingUpdate.newCapacity,
          current_occupancy: pendingUpdate.newOccupancy,
          updated_at: new Date().toISOString(),
        })
        .eq('center_id', pendingUpdate.center.center_id);

      if (error) throw error;

      // Send notification if admin chose to alert users
      if (sendAlert) {
        const statusLabel = getStatusLabel(pendingUpdate.newStatus);
        const occupancyPercent = pendingUpdate.newCapacity > 0 
          ? Math.round((pendingUpdate.newOccupancy / pendingUpdate.newCapacity) * 100)
          : 0;

        const notificationTitle = `Evacuation Center ${statusLabel}: ${pendingUpdate.center.name}`;
        const notificationMessage = `${pendingUpdate.center.name} is now ${statusLabel.toLowerCase()}. Current occupancy: ${pendingUpdate.newOccupancy}/${pendingUpdate.newCapacity} (${occupancyPercent}%). ${pendingUpdate.center.address ? `Location: ${pendingUpdate.center.address}` : ''}`;

        // Determine severity based on status
        let severity: 'normal' | 'alert' | 'urgent' | 'critical' = 'normal';
        if (pendingUpdate.newStatus === 'full') severity = 'critical';
        else if (pendingUpdate.newStatus === 'near-full') severity = 'urgent';
        else if (pendingUpdate.newStatus === 'half-full') severity = 'alert';

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            title: notificationTitle,
            message: notificationMessage,
            disaster_type: 'typhoon',
            severity: severity,
            target_role: 'USER',
            created_by: adminProfileId,
            barangay_id: pendingUpdate.center.barangay_id,
          });

        if (notifError) {
          console.error('Failed to send notification:', notifError);
          alert('Update saved, but failed to send notification.');
        } else {
          alert('Capacity updated and users notified successfully!');
        }
      } else {
        alert('Capacity updated successfully!');
      }

      setIsEditing(false);
      fetchCenters(); // Refresh the list
      
      // Update selected center
      setSelectedCenter({
        ...pendingUpdate.center,
        capacity: pendingUpdate.newCapacity,
        current_occupancy: pendingUpdate.newOccupancy,
      });

      setPendingUpdate(null);
    } catch (err) {
      console.error('Error updating capacity:', err);
      alert('Failed to update capacity. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel the update
  const cancelUpdate = () => {
    setShowAlertPrompt(false);
    setPendingUpdate(null);
  };

  // Calculate status
  const getCenterStatus = (center: EvacuationCenter) => {
    const occupancyRate = (center.current_occupancy || 0) / center.capacity;
    if (occupancyRate >= 1) return 'full';
    if (occupancyRate >= 0.75) return 'near-full';
    if (occupancyRate >= 0.5) return 'half-full';
    if (occupancyRate > 0) return 'open';
    return 'closed';
  };

  // for calculation of the status from values, which is raw (for preview during editing)
  const getStatusFromValues = (occupancy: number, capacity: number) => {
    if (capacity <= 0) return 'closed';
    const occupancyRate = occupancy / capacity;
    if (occupancyRate >= 1) return 'full';
    if (occupancyRate >= 0.75) return 'near-full';
    if (occupancyRate >= 0.5) return 'half-full';
    if (occupancyRate > 0) return 'open';
    return 'closed';
  };

  // Get barangay name
  const getBarangayName = (barangayId: string | null) => {
    if (!barangayId) return 'Unknown';
    const barangay = barangays.find(b => b.barangay_id === barangayId);
    return barangay?.name || 'Unknown';
  };

  // Filter centers
  const filteredCenters = centers.filter(center =>
    center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.center_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get statistics
  const stats = {
    total: centers.length,
    open: centers.filter(c => getCenterStatus(c) === 'open').length,
    halfFull: centers.filter(c => getCenterStatus(c) === 'half-full').length,
    nearFull: centers.filter(c => getCenterStatus(c) === 'near-full').length,
    full: centers.filter(c => getCenterStatus(c) === 'full').length,
    closed: centers.filter(c => getCenterStatus(c) === 'closed').length,
    totalCapacity: centers.reduce((sum, c) => sum + c.capacity, 0),
    totalOccupancy: centers.reduce((sum, c) => sum + (c.current_occupancy || 0), 0),
  };

  return (
    <AdminLayout>
    <div className="admin-evacuation-map-page">
      <div className="page-header">
        <h1>Evacuation Centers Management</h1>
        <p className="page-subtitle">Monitor and update evacuation center capacities</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Centers</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon capacity">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
              <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Capacity</div>
            <div className="stat-value">{stats.totalCapacity.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon occupancy">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Current Occupancy</div>
            <div className="stat-value">{stats.totalOccupancy.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon available">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Available Space</div>
            <div className="stat-value">{(stats.totalCapacity - stats.totalOccupancy).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="status-distribution">
        <div className="status-item status-open">
          <span className="status-count">{stats.open}</span>
          <span className="status-label">Open</span>
        </div>
        <div className="status-item status-half">
          <span className="status-count">{stats.halfFull}</span>
          <span className="status-label">Half-Full</span>
        </div>
        <div className="status-item status-near">
          <span className="status-count">{stats.nearFull}</span>
          <span className="status-label">Near-Full</span>
        </div>
        <div className="status-item status-full">
          <span className="status-count">{stats.full}</span>
          <span className="status-label">Full</span>
        </div>
        <div className="status-item status-closed">
          <span className="status-count">{stats.closed}</span>
          <span className="status-label">Closed</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-grid">
        {/* Centers List */}
        <div className="centers-panel">
          <div className="panel-header">
            <h2>Evacuation Centers</h2>
            <input
              type="text"
              className="search-input"
              placeholder="Search centers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="centers-list">
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : filteredCenters.length === 0 ? (
              <div className="empty-state">No centers found</div>
            ) : (
              filteredCenters.map((center) => {
                const status = getCenterStatus(center);
                const occupancyRate = ((center.current_occupancy || 0) / center.capacity * 100).toFixed(0);

                return (
                  <div
                    key={center.center_id}
                    className={`center-card ${selectedCenter?.center_id === center.center_id ? 'active' : ''}`}
                    onClick={() => handleSelectCenter(center)}
                  >
                    <div className="center-card-header">
                      <h3>{center.name}</h3>
                      <span className={`status-badge ${status}`}>
                        {status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="center-card-body">
                      <p className="center-address">{center.address}</p>
                      <p className="center-barangay">
                        📍 {getBarangayName(center.barangay_id)}
                      </p>
                      <div className="capacity-bar">
                        <div 
                          className={`capacity-fill ${status}`}
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                      <div className="capacity-info">
                        <span>{center.current_occupancy || 0} / {center.capacity}</span>
                        <span>{occupancyRate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="details-panel">
          {selectedCenter ? (
            <>
              <div className="panel-header">
                <h2>Center Details</h2>
                {!isEditing ? (
                  <button
                    className="btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                      <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                    </svg>
                    Edit Capacity
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          current_occupancy: selectedCenter.current_occupancy || 0,
                          capacity: selectedCenter.capacity,
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-success"
                      onClick={handleUpdateCapacity}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <div className="details-content">
                <div className="detail-section">
                  <h3>Basic Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Center Name:</span>
                    <span className="detail-value">{selectedCenter.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Center Code:</span>
                    <span className="detail-value">{selectedCenter.center_code || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{selectedCenter.address}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Barangay:</span>
                    <span className="detail-value">{getBarangayName(selectedCenter.barangay_id)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Coordinates:</span>
                    <span className="detail-value">
                      {selectedCenter.latitude}, {selectedCenter.longitude}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">
                      {new Date(selectedCenter.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Capacity Management</h3>
                  
                  {isEditing ? (
                    <div className="edit-form">
                      <div className="form-group">
                        <label>Total Capacity</label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.capacity}
                          onChange={(e) =>
                            setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Current Occupancy</label>
                        <input
                          type="number"
                          min="0"
                          max={editForm.capacity}
                          value={editForm.current_occupancy}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              current_occupancy: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="capacity-preview">
                        <div className="preview-bar">
                          <div
                            className={`preview-fill ${getStatusFromValues(editForm.current_occupancy, editForm.capacity)}`}
                            style={{
                              width: `${editForm.capacity > 0 ? (editForm.current_occupancy / editForm.capacity * 100).toFixed(0) : 0}%`,
                            }}
                          />
                        </div>
                        <p className="preview-text">
                          {editForm.current_occupancy} / {editForm.capacity} (
                          {editForm.capacity > 0 ? ((editForm.current_occupancy / editForm.capacity) * 100).toFixed(0) : 0}%)
                        </p>
                        <div className="preview-status">
                          <span className="detail-label">Status Preview:</span>
                          <span className={`status-badge ${getStatusFromValues(editForm.current_occupancy, editForm.capacity)}`}>
                            {getStatusFromValues(editForm.current_occupancy, editForm.capacity).replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Total Capacity:</span>
                        <span className="detail-value">{selectedCenter.capacity}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Current Occupancy:</span>
                        <span className="detail-value">{selectedCenter.current_occupancy || 0}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Available Space:</span>
                        <span className="detail-value">
                          {selectedCenter.capacity - (selectedCenter.current_occupancy || 0)}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Occupancy Rate:</span>
                        <span className="detail-value">
                          {((selectedCenter.current_occupancy || 0) / selectedCenter.capacity * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`status-badge ${getCenterStatus(selectedCenter)}`}>
                          {getCenterStatus(selectedCenter).replace('-', ' ')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-selection">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
                <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
              <p>Select an evacuation center to view and edit details</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Alert Notification Prompt Modal */}
    {showAlertPrompt && pendingUpdate && (
      <div className="alert-prompt-overlay">
        <div className="alert-prompt-modal">
          <div className="alert-prompt-header">
            <h3>Send Alert to Users?</h3>
          </div>
          <div className="alert-prompt-body">
            <p>
              You are updating <strong>{pendingUpdate.center.name}</strong> to:
            </p>
            <div className="alert-prompt-details">
              <div className="detail-item">
                <span className="label">New Status:</span>
                <span className={`status-badge ${pendingUpdate.newStatus}`}>
                  {getStatusLabel(pendingUpdate.newStatus)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Occupancy:</span>
                <span>{pendingUpdate.newOccupancy} / {pendingUpdate.newCapacity}</span>
              </div>
            </div>
            <p className="alert-prompt-question">
              Would you like to notify users about this evacuation center status update?
            </p>
          </div>
          <div className="alert-prompt-actions">
            <button
              className="btn-cancel"
              onClick={cancelUpdate}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className="btn-secondary"
              onClick={() => saveUpdate(false)}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Without Alert'}
            </button>
            <button
              className="btn-primary"
              onClick={() => saveUpdate(true)}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save & Alert Users'}
            </button>
          </div>
        </div>
      </div>
    )}
    </AdminLayout>
  );
};

export default AdminEvacuationMap;