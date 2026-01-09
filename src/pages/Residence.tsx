import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import html2canvas from 'html2canvas';
import './Residence.css';

const FALLBACK_IMAGE =
  'https://ui-avatars.com/api/?size=300&background=E5E7EB&color=374151&name=Profile';

const Residence = () => {
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(FALLBACK_IMAGE);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile?.profile_image_url) {
      // No need to setImageUrl here; initial state is already FALLBACK_IMAGE
      return;
    }

    // 🔐 SECURE: signed URL
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

    setImageUrl(data?.signedUrl ?? FALLBACK_IMAGE);
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

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} />

      <main className="main-content">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          username={profile.first_name}
        />

        <div className="residence-page">
          <div className="residence-card" ref={cardRef}>
            <h1 className="residence-title">
              Marikeño's Residence Card
            </h1>

            <div className="residence-content">
              {/* PHOTO */}
              <div className="residence-photo">
                <img src={imageUrl ?? FALLBACK_IMAGE} alt="Profile" />

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

              {/* DETAILS */}
              <div className="residence-details">
                <div className="detail-block">
                  <span className="label">
                    LAST NAME, FIRST NAME
                  </span>
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
              </div>
            </div>

            <div className="residence-actions">
              <button onClick={downloadCard}>Download Card</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Residence;
