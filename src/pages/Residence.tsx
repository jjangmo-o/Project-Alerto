import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';
import './Residence.css';

const FALLBACK_IMAGE =
  'https://ui-avatars.com/api/?size=300&background=E5E7EB&color=374151&name=Profile';

const Residence = () => {
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(FALLBACK_IMAGE);
  const [showBack, setShowBack] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  /* ================= LOAD PROFILE IMAGE ================= */

  useEffect(() => {
    if (!profile?.profile_image_url) return;

    supabase.storage
      .from('profile-images')
      .createSignedUrl(profile.profile_image_url, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) setImageUrl(data.signedUrl);
      });
  }, [profile]);

  if (!profile) return null;

  /* ================= HELPERS ================= */

  const fullName = `${profile.last_name}, ${profile.first_name}${
    profile.middle_name ? ` ${profile.middle_name[0]}.` : ''
  }`;

  const formatGender = (g?: string) =>
    g ? g.charAt(0).toUpperCase() + g.slice(1) : '—';

  const calculateAge = (birth?: string) => {
    if (!birth) return '—';
    const b = new Date(birth);
    const t = new Date();
    let age = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
    return age;
  };

  /* ================= PHOTO UPLOAD ================= */

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.currentTarget.files?.[0];
    if (!file || !profile) return;

    setUploading(true);

    const ext = file.name.split('.').pop();
    const filePath = `${profile.user_id}.${ext}`;

    const { error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    await supabase
      .from('profiles')
      .update({ profile_image_url: filePath })
      .eq('user_id', profile.user_id);

    const { data } = await supabase.storage
      .from('profile-images')
      .createSignedUrl(filePath, 3600);

    if (data?.signedUrl) setImageUrl(data.signedUrl);
    setUploading(false);
  };

  /* ================= DOWNLOAD ================= */

  const downloadCard = async () => {
    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = 'residence-card.png';
    link.href = canvas.toDataURL();
    link.click();
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

        <div className="residence-page">
          <div
            className={`residence-card-flip ${showBack ? 'flipped' : ''}`}
            ref={cardRef}
          >
            {/* ================= FRONT ================= */}
            <div className="residence-card front">
              <h1 className="residence-title">
                Marikeño's Residence Card
              </h1>

              <div className="residence-content">
                <div className="residence-photo">
                  <img src={imageUrl} alt="Profile" />

                  <label className="edit-photo-btn">
                    {uploading ? 'Uploading…' : 'Edit Photo'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      hidden
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>

                <div className="residence-details">
                  <div className="detail-block">
                    <span className="label">LAST NAME, FIRST NAME</span>
                    <span className="value name">{fullName}</span>
                  </div>

                  <div className="detail-row">
                    <div className="detail-block">
                      <span className="label">AGE</span>
                      <span className="value">
                        {calculateAge(profile.birth_date)}
                      </span>
                    </div>

                    <div className="detail-block">
                      <span className="label">GENDER</span>
                      <span className="value">
                        {formatGender(profile.gender)}
                      </span>
                    </div>
                  </div>

                  <div className="detail-block">
                    <span className="label">ADDRESS</span>
                    <span className="value">{profile.address}</span>
                  </div>

                  <div className="detail-block">
                    <span className="label">CONTACT</span>
                    <span className="value">
                      {profile.contact_number}
                    </span>
                  </div>

                  <div className="detail-block">
                    <span className="label">EMAIL</span>
                    <span className="value">{profile.email}</span>
                  </div>

                  <span className="barangay-badge">
                    Barangay — VERIFIED
                  </span>
                </div>
              </div>

              <div className="residence-actions">
                <button onClick={() => setShowBack(true)}>
                  View Back
                </button>
                <button onClick={downloadCard}>
                  Download Card
                </button>
              </div>
            </div>

            {/* ================= BACK ================= */}
            <div className="residence-card back">
              <h1 className="residence-title">
                Official ID Verification
              </h1>

              <div className="qr-wrapper">
                <QRCode
                  value={`https://project-alerto.app/verify/${profile.user_id}`}
                  size={220}
                />
                <p className="qr-text">
                  Scan to verify residency via Project Alerto
                </p>
              </div>

              <div className="residence-actions">
                <button onClick={() => setShowBack(false)}>
                  View Front
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