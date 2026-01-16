import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
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

  const [liveProfile, setLiveProfile] = useState<typeof profile | null>(profile);

  useEffect(() => {
    setLiveProfile(profile);
  }, [profile]);

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

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!liveProfile) return;
    setFormData({
      address: liveProfile.address ?? '',
      contact_number: liveProfile.contact_number ?? '',
      email: liveProfile.email ?? '',
    });
  }, [liveProfile]);

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
          
          console.log('✅ Profile update received:', payload.new);
          
          // Immediately update the live profile with all new data
          setLiveProfile(prev => ({
            ...prev!,
            ...payload.new,
          }));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime subscription active for user:', profile.user_id);
        }
      });

    // Polling fallback - check every 3 seconds for updates
    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('residence_verification_status, verified_at')
        .eq('user_id', profile.user_id)
        .single();

      if (data && data.residence_verification_status !== liveProfile?.residence_verification_status) {
        console.log('🔄 Polling detected status change:', data.residence_verification_status);
        setLiveProfile(prev => ({
          ...prev!,
          ...data,
        }));
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [profile?.user_id, liveProfile?.residence_verification_status]);

  if (!liveProfile) {
    return (
      <div className="residence-wrapper">
        <div className="residence-card">Loading profile…</div>
      </div>
    );
  }

  const status = liveProfile.residence_verification_status;
  const isVerified = status === 'VERIFIED';
  const isPending = status === 'PENDING';

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

  const handleSave = async () => {
    setSaving(true);
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

  const qrPayload = JSON.stringify({
    user_id: liveProfile.user_id,
    full_name: `${liveProfile.last_name}, ${liveProfile.first_name}`,
    address: liveProfile.address,
    verified: isVerified,
    verified_at: liveProfile.verified_at,
  });

  const getImageAsBase64 = async (imgUrl: string): Promise<string> => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image:', error);
      return IMAGE_PLACEHOLDER;
    }
  };

  const handleDownloadPDF = async () => {
    if (!frontRef.current || !backRef.current) return;

    try {
      document.body.classList.add('printing');

      if (imageUrl) {
        const base64Image = await getImageAsBase64(imageUrl);
        const imgElement = frontRef.current.querySelector('.photo-box img') as HTMLImageElement;
        const originalSrc = imgElement?.src;
        
        if (imgElement && base64Image) {
          imgElement.src = base64Image;
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;

        // Capture front
        const frontCanvas = await html2canvas(frontRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        const frontImg = frontCanvas.toDataURL('image/png');
        const frontHeight = contentWidth * (frontCanvas.height / frontCanvas.width);

        pdf.addImage(frontImg, 'PNG', margin, margin, contentWidth, frontHeight);
        pdf.addPage();

        // Fix: Temporarily remove transform from back card for proper QR rendering
        const backCard = backRef.current;
        const originalTransform = backCard.style.transform;
        backCard.style.transform = 'none';
        
        await new Promise(resolve => setTimeout(resolve, 50));

        // Capture back
        const backCanvas = await html2canvas(backCard, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const backImg = backCanvas.toDataURL('image/png');
        const backHeight = contentWidth * (backCanvas.height / backCanvas.width);

        pdf.addImage(backImg, 'PNG', margin, margin, contentWidth, backHeight);
        
        // Restore original transform
        backCard.style.transform = originalTransform;
        
        pdf.save(`${liveProfile.last_name}_${liveProfile.first_name}_Residence.pdf`);

        if (imgElement && originalSrc) {
          imgElement.src = originalSrc;
        }
      }

      document.body.classList.remove('printing');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
      document.body.classList.remove('printing');
    }
  };

  return (
    <div className="residence-wrapper">
      <div className={`residence-card-flip ${showBack ? 'flipped' : ''}`}>

        {/* FRONT */}
        <div className="residence-card front" ref={frontRef}>
          <div className="card-header">
            <h2>MARIKEÑO'S RESIDENCE CARD</h2>
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
            {isPending && <span className="badge pending">Pending Verification</span>}
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
                crossOrigin="anonymous"
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
            <QRCodeCanvas value={qrPayload} size={200} />
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
  );
};

export default Residence;