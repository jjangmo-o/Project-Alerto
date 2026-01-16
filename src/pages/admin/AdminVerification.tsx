import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from './AdminLayout';
import './AdminVerification.css';

interface PendingResident {
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  address: string;
  contact_number: string;
  barangay_id?: string;
  birth_date?: string;
  gender?: string;
  verification_requested_at: string | null;
  profile_image_url?: string;
}

interface Barangay {
  barangay_id: string;
  name: string;
}

const AdminVerification = () => {
  const [pendingResidents, setPendingResidents] = useState<PendingResident[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [barangayFilter, setBarangayFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedResidents, setSelectedResidents] = useState<Set<string>>(new Set());

  /* ================= FETCH PENDING RESIDENTS ================= */

  const fetchPendingResidents = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        middle_name,
        email,
        address,
        contact_number,
        barangay_id,
        birth_date,
        gender,
        verification_requested_at,
        profile_image_url
      `)
      .eq('residence_verification_status', 'PENDING')
      .order('verification_requested_at', { ascending: true });

    if (error) {
      console.error('Fetch error:', error.message);
      setPendingResidents([]);
    } else if (Array.isArray(data)) {
      // Only cast if no error and data is an array
    } else {
      setPendingResidents([]);
    }

    setLoading(false);
  };

  /* ================= FETCH BARANGAYS ================= */

  const fetchBarangays = async () => {
    const { data, error } = await supabase
      .from('barangays')
      .select('barangay_id, name')
      .order('name');

    if (error) {
      console.error('Barangay fetch error:', error.message);
      setBarangays([]);
    } else {
      setBarangays(data as Barangay[]);
    }
  };

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchPendingResidents(),
        fetchBarangays(),
      ]);
    };

    fetchData();
  }, []);

  /* ================= REALTIME ================= */

  useEffect(() => {
    const channel = supabase
      .channel('admin-residence-verification')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        fetchPendingResidents
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ================= VERIFY ================= */

  const handleVerify = async (resident: PendingResident) => {
    if (!window.confirm(`Verify residence card for ${resident.first_name} ${resident.last_name}?`)) {
      return;
    }

    setVerifyingId(resident.user_id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setVerifyingId(null);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        residence_verification_status: 'VERIFIED',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
      })
      .eq('user_id', resident.user_id);

    if (error) {
      console.error('Verification error:', error);
      alert('Failed to verify resident');
      setVerifyingId(null);
      return;
    }

    // Send notification
    const { data: notif } = await supabase
      .from('notifications')
      .insert({
        title: 'Residence Card Verified',
        message: 'Your residence card has been verified and approved by the city administration.',
        target_role: 'USER',
        created_by: user.id,
        disaster_type: 'fire',
        severity: 'normal',
      })
      .select()
      .single();

    if (notif) {
      await supabase.from('user_notifications').insert({
        notification_id: notif.notification_id,
        user_id: resident.user_id,
      });
    }

    setVerifyingId(null);
    await fetchPendingResidents();
  };

  /* ================= REJECT ================= */

  const handleReject = async (resident: PendingResident) => {
    const reason = window.prompt(`Reject verification for ${resident.first_name} ${resident.last_name}?\n\nPlease provide a reason:`);
    
    if (!reason || reason.trim() === '') {
      return;
    }

    setRejectingId(resident.user_id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRejectingId(null);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        residence_verification_status: 'VERIFIED', // Reset to last verified state
        verification_requested_at: null,
      })
      .eq('user_id', resident.user_id);

    if (error) {
      console.error('Rejection error:', error);
      alert('Failed to reject verification');
      setRejectingId(null);
      return;
    }

    // Send notification
    const { data: notif } = await supabase
      .from('notifications')
      .insert({
        title: 'Residence Card Update Rejected',
        message: `Your residence card update was rejected. Reason: ${reason}`,
        target_role: 'USER',
        created_by: user.id,
        disaster_type: 'fire',
        severity: 'alert',
      })
      .select()
      .single();

    if (notif) {
      await supabase.from('user_notifications').insert({
        notification_id: notif.notification_id,
        user_id: resident.user_id,
      });
    }

    setRejectingId(null);
    await fetchPendingResidents();
  };

  /* ================= BULK VERIFY ================= */

  const handleBulkVerify = async () => {
    if (selectedResidents.size === 0) {
      alert('Please select at least one resident');
      return;
    }

    if (!window.confirm(`Verify ${selectedResidents.size} resident(s)?`)) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    for (const userId of Array.from(selectedResidents)) {
      await supabase
        .from('profiles')
        .update({
          residence_verification_status: 'VERIFIED',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
        })
        .eq('user_id', userId);
    }

    setSelectedResidents(new Set());
    await fetchPendingResidents();
  };

  /* ================= SELECTION ================= */

  const toggleSelection = (userId: string) => {
    const newSelected = new Set(selectedResidents);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedResidents(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedResidents.size === filteredResidents.length) {
      setSelectedResidents(new Set());
    } else {
      setSelectedResidents(new Set(filteredResidents.map(r => r.user_id)));
    }
  };

  /* ================= FILTER LOGIC ================= */

  const filteredResidents = (() => {
    let filtered = [...pendingResidents];

    // Barangay filter
    if (barangayFilter !== 'ALL') {
      filtered = filtered.filter(r => r.barangay_id === barangayFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => {
        const fullName = `${r.first_name} ${r.last_name}`.toLowerCase();
        const email = r.email.toLowerCase();
        const address = r.address?.toLowerCase() || '';
        return fullName.includes(query) || email.includes(query) || address.includes(query);
      });
    }

    return filtered;
  })();

  const getBarangayName = (barangayId?: string) => {
    if (!barangayId) return 'Unknown';
    return barangays.find(b => b.barangay_id === barangayId)?.name || 'Unknown';
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '—';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  /* ================= UI ================= */

  return (
    <AdminLayout>
      <div className="admin-verification-page">
        <div className="admin-verification-header">
          <div className="page-header">
            <h1>Resident Verification</h1>
            <p>Review and approve pending residence card updates</p>
          </div>

          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{pendingResidents.length}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{filteredResidents.length}</div>
              <div className="stat-label">Filtered</div>
            </div>
          </div>
        </div>

        <div className="verification-controls">
          <div className="search-filter-row">
            <input
              type="text"
              placeholder="Search by name, email, or address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />

            <select
              className="barangay-select"
              value={barangayFilter}
              onChange={e => setBarangayFilter(e.target.value)}
            >
              <option value="ALL">All Barangays</option>
              {barangays.map(b => (
                <option key={b.barangay_id} value={b.barangay_id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {selectedResidents.size > 0 && (
            <div className="bulk-actions-bar">
              <span className="bulk-count">{selectedResidents.size} selected</span>
              <div className="bulk-buttons">
                <button className="bulk-btn btn-verify" onClick={handleBulkVerify}>
                  Verify All
                </button>
                <button className="bulk-btn btn-cancel" onClick={() => setSelectedResidents(new Set())}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            Loading pending verifications…
          </div>
        )}

        {!loading && filteredResidents.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No pending residence verifications</p>
          </div>
        )}

        {!loading && filteredResidents.length > 0 && (
          <>
            <div className="select-all-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedResidents.size === filteredResidents.length}
                  onChange={toggleSelectAll}
                />
                <span>Select All ({filteredResidents.length})</span>
              </label>
            </div>

            <div className="verification-list">
              {filteredResidents.map(resident => (
                <div key={resident.user_id} className="verification-card">
                  <div className="card-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedResidents.has(resident.user_id)}
                      onChange={() => toggleSelection(resident.user_id)}
                    />
                  </div>

                  <div className="card-main">
                    <div className="card-header-row">
                      <div>
                        <h3>
                          {resident.last_name}, {resident.first_name} {resident.middle_name}
                        </h3>
                        <div className="meta-row">
                          <span className="meta-email">{resident.email}</span>
                          <span className="meta-barangay">{getBarangayName(resident.barangay_id)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-info">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Address</span>
                          <span className="info-value">{resident.address}</span>
                        </div>

                        <div className="info-row-inline">
                          <div className="info-item">
                            <span className="info-label">Contact</span>
                            <span className="info-value">{resident.contact_number}</span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Age</span>
                            <span className="info-value">{calculateAge(resident.birth_date)}</span>
                          </div>

                          <div className="info-item">
                            <span className="info-label">Gender</span>
                            <span className="info-value">{resident.gender || '—'}</span>
                          </div>
                        </div>

                        <div className="info-item">
                          <span className="info-label">Requested</span>
                          <span className="info-value info-date">
                            {resident.verification_requested_at
                              ? new Date(resident.verification_requested_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '—'}
                          </span>
                        </div>
                      </div>

                      {expandedCard === resident.user_id && (
                        <div className="expanded-details">
                          <div className="detail-row">
                            <strong>User ID:</strong> {resident.user_id}
                          </div>
                          <div className="detail-row">
                            <strong>Birth Date:</strong> {resident.birth_date || '—'}
                          </div>
                        </div>
                      )}

                      <button
                        className="expand-toggle"
                        onClick={() => setExpandedCard(
                          expandedCard === resident.user_id ? null : resident.user_id
                        )}
                      >
                        {expandedCard === resident.user_id ? '▲ Less' : '▼ More'}
                      </button>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="action-btn btn-verify"
                      disabled={verifyingId === resident.user_id || rejectingId === resident.user_id}
                      onClick={() => handleVerify(resident)}
                    >
                      {verifyingId === resident.user_id ? 'Verifying…' : 'Verify'}
                    </button>
                    <button
                      className="action-btn btn-reject"
                      disabled={verifyingId === resident.user_id || rejectingId === resident.user_id}
                      onClick={() => handleReject(resident)}
                    >
                      {rejectingId === resident.user_id ? 'Rejecting…' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminVerification;