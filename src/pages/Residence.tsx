import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Residence.css';

import editIcon from '../assets/icon-edit.png';
import lockIcon from '../assets/icon-lock.png';

const SIGNED_URL_TTL_SECONDS = 60 * 60;
const IMAGE_PLACEHOLDER = '/id-placeholder.png';

const Residence = () => {
  const { profile } = useAuth();

  /* ================= LOCAL LIVE PROFILE (REALTIME SOURCE) ================= */

  const [liveProfile, setLiveProfile] = useState<typeof profile | null>(profile);

  useEffect(() => {
    setLiveProfile(profile);
  }, [profile]);

  /* ================= UI STATE ================= */

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBack, setShowBack] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [formData, setFormData] = useState({
    address: '',
    contact_number: '',
    email: '',
  });

  /* ================= REFS ================= */

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  /* ================= SYNC FORM DATA ================= */

  useEffect(() => {
    if (!liveProfile) return;

    setFormData({
      address: liveProfile.address ?? '',
      contact_number: liveProfile.contact_number ?? '',
      email: liveProfile.email ?? '',
    });
  }, [liveProfile]);

  /* ================= PROFILE IMAGE (SHARED CACHE) ================= */

  useEffect(() => {
    if (!liveProfile?.profile_image_url) {
      setImageUrl(null);
      return;
    }

    const cacheKey = `avatar:${liveProfile.profile_image_url}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() < parsed.expiresAt) {
          setImageUrl(parsed.url);
          return;
        }
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    supabase.storage
      .from('profile-images')
      .createSignedUrl(liveProfile.profile_image_url, SIGNED_URL_TTL_SECONDS)
      .then(({ data }) => {
        if (!data?.signedUrl) return;

        const expiresAt = Date.now() + SIGNED_URL_TTL_SECONDS * 1000;

        setImageUrl(data.signedUrl);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ url: data.signedUrl, expiresAt })
        );
      });
  }, [liveProfile?.profile_image_url]);

  /* ================= REALTIME SUBSCRIPTION ================= */

  useEffect(() => {
    if (!profile?.user_id) return;

    const channel = supabase
      .channel(`residence-profile-${profile.user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${profile.user_id}`,
        },
        payload => {
          if (!payload.new) return;

          // 🔥 THIS IS THE KEY
          setLiveProfile(prev => ({
            ...prev!,
            ...payload.new,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.user_id]);

  /* ================= LOADING ================= */

  if (!liveProfile) {
    return (
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} />
        <main className="main-content">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="residence-wrapper">
            <div className="residence-card">Loading profile…</div>
          </div>
        </main>
      </div>
    );
  }

  /* ================= STATUS ================= */

  const status = liveProfile.residence_verification_status;
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
    liveProfile.gender
      ? liveProfile.gender.charAt(0).toUpperCase() +
        liveProfile.gender.slice(1).toLowerCase()
      : '';

  /* ================= SAVE & SUBMIT ================= */

  const handleSave = async () => {
    setSaving(true);

    // 🔥 Optimistic UI (lock immediately)
    setLiveProfile(prev => ({
      ...prev!,
      residence_verification_status: 'PENDING',
    }));

    if (formData.email !== liveProfile.email) {
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
      .eq('user_id', liveProfile.user_id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    setEditMode(false);
    setSaving(false);
  };

  /* ================= QR ================= */

  const qrPayload = JSON.stringify({
    user_id: liveProfile.user_id,
    full_name: `${liveProfile.last_name}, ${liveProfile.first_name}`,
    address: liveProfile.address,
    verified: isVerified,
    verified_at: liveProfile.verified_at,
  });

  /* ================= PDF ================= */

  const handleDownloadPDF = async () => {
    if (!frontRef.current || !backRef.current) return;

    document.body.classList.add('printing');

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    const frontCanvas = await html2canvas(frontRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const frontImg = frontCanvas.toDataURL('image/png');
    const frontHeight =
      contentWidth * (frontCanvas.height / frontCanvas.width);

    pdf.addImage(frontImg, 'PNG', margin, margin, contentWidth, frontHeight);
    pdf.addPage();

    const backCanvas = await html2canvas(backRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const backImg = backCanvas.toDataURL('image/png');
    const backHeight =
      contentWidth * (backCanvas.height / backCanvas.width);

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
          username={liveProfile.first_name}
        />

        <div className="residence-wrapper">
          <div className={`residence-card-flip ${showBack ? 'flipped' : ''}`}>

            {/* FRONT */}
            <div className="residence-card front" ref={frontRef}>
              <div className="card-header">
                <h2>MARIKEÑO&apos;S RESIDENCE CARD</h2>

                {isVerified && !editMode && (
                  <button
                    className="edit-btn"
                    onClick={() => setEditMode(true)}
                    aria-label="Edit residence"
                  >
                    <img src={editIcon} alt="" className="icon-img" />
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
                  <img
                    src={imageUrl ?? IMAGE_PLACEHOLDER}
                    alt="Resident"
                    loading="eager"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    className={imageLoaded ? 'img-loaded' : 'img-loading'}
                  />
                </div>

                <div className="info-box">
                  <div className="field">
                    <label>FULL NAME</label>
                    <span>
                      {liveProfile.last_name}, {liveProfile.first_name}{' '}
                      {liveProfile.middle_name ?? ''}
                    </span>
                  </div>

                  <div className="row">
                    <div className="field">
                      <label>AGE</label>
                      <span>{calculateAge(liveProfile.birth_date)}</span>
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
                      <span>{liveProfile.address}</span>
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
                      <span>{liveProfile.contact_number}</span>
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
                      <span>{liveProfile.email}</span>
                    )}
                  </div>
                </div>
              </div>

              {isPending && (
                <div className="lock-overlay">
                  <img src={lockIcon} alt="" className="lock-icon" />
                  <span>Residence Card Locked — Verification in progress</span>
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

            {/* BACK */}
            <div className="residence-card back" ref={backRef}>
              <h3>Official QR Code</h3>
              <div className="qr-frame">
                <QRCodeCanvas value={qrPayload} size={180} />
              </div>
              <p className="qr-note">Scan to verify residence authenticity</p>

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
