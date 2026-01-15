import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Residence.css';

const Residence = () => {
  const { profile } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);

  const [formData, setFormData] = useState({
    address: '',
    contact_number: '',
    email: '',
  });

  /* ================= REFS (PDF) ================= */

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  /* ================= SYNC PROFILE DATA ================= */

  useEffect(() => {
    if (!profile) return;
    // Only update if values are different
    setFormData(prev => {
      const next = {
        address: profile.address ?? '',
        contact_number: profile.contact_number ?? '',
        email: profile.email ?? '',
      };
      // Shallow compare
      if (
        prev.address === next.address &&
        prev.contact_number === next.contact_number &&
        prev.email === next.email
      ) {
        return prev;
      }
      return next;
    });
  }, [profile]);

  /* ================= PROFILE IMAGE ================= */

  useEffect(() => {
    if (!profile?.profile_image_url) {
      if (imageUrl !== null) setImageUrl(null);
      return;
    }
    supabase.storage
      .from('profile-images')
      .createSignedUrl(profile.profile_image_url, 3600)
      .then(({ data, error }) => {
        if (error) {
          if (imageUrl !== null) setImageUrl(null);
          console.error(error.message);
        } else {
          if (imageUrl !== data?.signedUrl) setImageUrl(data?.signedUrl ?? null);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.profile_image_url]);

  /* ================= REALTIME UPDATES ================= */

  useEffect(() => {
    if (!profile?.user_id) return;

    const channel = supabase
      .channel('residence-profile-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${profile.user_id}`,
        },
        payload => {
          if (payload.new) {
            setFormData({
              address: payload.new.address ?? '',
              contact_number: payload.new.contact_number ?? '',
              email: payload.new.email ?? '',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.user_id]);

  /* ================= LOADING ================= */

  if (!profile) {
    return (
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} />
        <main className="main-content">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} username="" />
          <div className="residence-wrapper">
            <div className="residence-card">Loading profile…</div>
          </div>
        </main>
      </div>
    );
  }

  /* ================= STATUS ================= */

  const status = profile.residence_verification_status;
  const isVerified = status === 'VERIFIED';
  const isPending = status === 'PENDING';

  /* ================= HELPERS ================= */

  const calculateAge = (birth?: string) => {
    if (!birth) return '';
    const b = new Date(birth);
    const t = new Date();
    let age = t.getFullYear() - b.getFullYear();
    if (
      t.getMonth() < b.getMonth() ||
      (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())
    ) {
      age--;
    }
    return age;
  };

  const gender =
    profile.gender
      ? profile.gender.charAt(0).toUpperCase() +
        profile.gender.slice(1).toLowerCase()
      : '';

  /* ================= SAVE ================= */

  const handleSave = async () => {
    setSaving(true);

    if (formData.email !== profile.email) {
      const { error } = await supabase.auth.updateUser({
        email: formData.email,
      });

      if (error) {
        alert(error.message);
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        address: formData.address,
        contact_number: formData.contact_number,
        email: formData.email,
        residence_verification_status: 'PENDING',
        verification_requested_at: new Date().toISOString(),
      })
      .eq('user_id', profile.user_id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    setEditMode(false);
    setSaving(false);
  };

  /* ================= QR PAYLOAD ================= */

  const qrPayload = JSON.stringify({
    user_id: profile.user_id,
    full_name: `${profile.last_name}, ${profile.first_name}`,
    address: profile.address,
    verified: isVerified,
    verified_at: profile.verified_at,
  });

  /* ================= PDF DOWNLOAD (FINAL) ================= */

  const handleDownloadPDF = async () => {
    if (!frontRef.current || !backRef.current) return;

    document.body.classList.add('printing');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    /* ---------- FRONT PAGE ---------- */
    const frontCanvas = await html2canvas(frontRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const frontImg = frontCanvas.toDataURL('image/png');
    const frontHeight = contentWidth * (frontCanvas.height / frontCanvas.width);

    pdf.addImage(frontImg, 'PNG', margin, margin, contentWidth, frontHeight);

    /* ---------- BACK PAGE ---------- */
    pdf.addPage();

    const backCanvas = await html2canvas(backRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const backImg = backCanvas.toDataURL('image/png');
    const backHeight = contentWidth * (backCanvas.height / backCanvas.width);

    pdf.addImage(backImg, 'PNG', margin, margin, contentWidth, backHeight);

    pdf.save('residence-card.pdf');

    document.body.classList.remove('printing');
  };

  /* ================= RENDER ================= */

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} />

      <main className="main-content">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          username={profile.first_name}
        />

        <div className="residence-wrapper">
          <div className={`residence-card-flip ${showBack ? 'flipped' : ''}`}>

            {/* ================= FRONT ================= */}
            <div className="residence-card front" ref={frontRef}>
              <div className="card-header">
                <h2>MARIKEÑO&apos;S RESIDENCE CARD</h2>

                {isVerified && !editMode && (
                  <button className="edit-btn" onClick={() => setEditMode(true)}>
                    ✏️
                  </button>
                )}
              </div>

              <div className="status-row">
                {isVerified && <span className="badge verified">Verified</span>}
                {isPending && (
                  <span className="badge pending">Pending Verification</span>
                )}
              </div>

              <div className="card-body">
                <div className="photo-box">
                  <img src={imageUrl ?? '/id-placeholder.png'} alt="Resident" />
                </div>

                <div className="info-box">
                  <div className="field">
                    <label>FULL NAME</label>
                    <span>
                      {profile.last_name}, {profile.first_name}{' '}
                      {profile.middle_name ?? ''}
                    </span>
                  </div>

                  <div className="row">
                    <div className="field">
                      <label>AGE</label>
                      <span>{calculateAge(profile.birth_date)}</span>
                    </div>
                    <div className="field">
                      <label>GENDER</label>
                      <span>{gender}</span>
                    </div>
                  </div>

                  <div className="field">
                    <label>ADDRESS</label>
                    {editMode ? (
                      <input
                        value={formData.address}
                        onChange={e =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    ) : (
                      <span>{profile.address}</span>
                    )}
                  </div>

                  <div className="field">
                    <label>CONTACT NUMBER</label>
                    {editMode ? (
                      <input
                        value={formData.contact_number}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            contact_number: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <span>{profile.contact_number}</span>
                    )}
                  </div>

                  <div className="field">
                    <label>EMAIL</label>
                    {editMode ? (
                      <input
                        value={formData.email}
                        onChange={e =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    ) : (
                      <span>{profile.email}</span>
                    )}
                  </div>
                </div>
              </div>

              {isPending && (
                <div className="lock-overlay">
                  🔒 Residence Card Locked — Verification in progress
                </div>
              )}

              <div className="card-actions">
                {editMode ? (
                  <button onClick={handleSave} disabled={saving}>
                    {saving ? 'Submitting…' : 'Save & Submit'}
                  </button>
                ) : (
                  <>
                    <button disabled={!isVerified} onClick={() => setShowBack(true)}>
                      View Back of Card
                    </button>

                    <button disabled={!isVerified} onClick={handleDownloadPDF}>
                      Download PDF
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ================= BACK ================= */}
            <div className="residence-card back" ref={backRef}>
              <h3>Official QR Code</h3>
              <div className="qr-frame">
                <QRCodeCanvas value={qrPayload} size={180} />
              </div>
              <p className="qr-note">
                Scan to verify residence authenticity
              </p>

              <div className="card-actions">
                <button onClick={() => setShowBack(false)}>
                  View Front of Card
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Residence;
