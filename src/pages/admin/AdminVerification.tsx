import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from './AdminLayout';
import './AdminVerification.css';

interface PendingResident {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  contact_number: string;
  verification_requested_at: string | null;
  barangay_id: string | null;
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
  const [barangayFilter, setBarangayFilter] = useState<string>('ALL');

  /* ================= FETCH PENDING RESIDENTS ================= */

  const fetchPendingResidents = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        email,
        address,
        contact_number,
        verification_requested_at,
        barangay_id
      `)
      .eq('residence_verification_status', 'PENDING')
      .order('verification_requested_at', { ascending: true });

    if (error) {
      console.error('Fetch error:', error.message);
      setPendingResidents([]);
    } else {
      setPendingResidents(data as PendingResident[]);
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
    setVerifyingId(resident.user_id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from('profiles')
      .update({
        residence_verification_status: 'VERIFIED',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
      })
      .eq('user_id', resident.user_id);

    const { data: notif } = await supabase
      .from('notifications')
      .insert({
        title: 'Residence Card Verified',
        message:
          'Your residence card update has been verified and approved by the city administration.',
        target_role: 'USER',
        created_by: user.id,
        disaster_type: 'other',
        severity: 'info',
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
    fetchPendingResidents();
  };

  /* ================= FILTER LOGIC ================= */

  const filteredResidents = useMemo(() => {
    if (barangayFilter === 'ALL') return pendingResidents;
    return pendingResidents.filter(
      r => r.barangay_id === barangayFilter
    );
  }, [pendingResidents, barangayFilter]);

  /* ================= UI ================= */

  return (
    <AdminLayout>
      <div className="admin-verification-page">
        <div className="page-header">
          <h1>Resident Verification</h1>
          <p>Review and approve pending residence card updates.</p>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">Barangay</span>
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

          <div className="filter-count">
            {filteredResidents.length} pending
          </div>
        </div>

        {loading && (
          <div className="loading">
            Loading pending verifications…
          </div>
        )}

        {!loading && filteredResidents.length === 0 && (
          <div className="empty-state">
            No pending residence verifications.
          </div>
        )}

        <div className="verification-list">
          {filteredResidents.map(resident => (
            <div key={resident.user_id} className="verification-card">
              <div className="card-main">
                <div className="card-header-row">
                  <div>
                    <h3>
                      {resident.last_name}, {resident.first_name}
                    </h3>
                    <div className="meta">{resident.email}</div>
                  </div>
                </div>

                <div className="card-info">
                  <div className="info-line">
                    <span className="label">Address</span>
                    <span>{resident.address}</span>
                  </div>

                  <div className="info-row">
                    <div className="info-line">
                      <span className="label">Contact</span>
                      <span>{resident.contact_number}</span>
                    </div>

                    <div className="info-line small">
                      <span className="label">Requested</span>
                      <span>
                        {resident.verification_requested_at
                          ? new Date(
                              resident.verification_requested_at
                            ).toLocaleString()
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="verify-btn"
                  disabled={verifyingId === resident.user_id}
                  onClick={() => handleVerify(resident)}
                >
                  {verifyingId === resident.user_id
                    ? 'Verifying…'
                    : 'Verify'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVerification;
