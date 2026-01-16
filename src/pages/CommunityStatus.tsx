import { useState, useEffect, useRef, useCallback } from 'react';
import './CommunityStatus.css';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import communityProfileIcon from '../assets/icon-community profile.png';
import communityIcon from '../assets/icon-community-status.svg';
import upvoteIcon from '../assets/upvote.png';
import uploadIcon from '../assets/icon-upload-image.svg';
import closeButtonIcon from '../assets/icon-close-button.svg';
import prevIcon from '../assets/icon-arrow-left.svg';
import nextIcon from '../assets/icon-arrow-right.svg';

const STATUS_OPTIONS = [
  'Safe',
  'Injured',
  'Critical',
  'Flooding',
  'Missing',
  'Fire',
  'Outbreak',
  'Trapped',
  'Power Outage',
  'Medical Assistance',
  'Rescue',
  'Animal Rescue',
];

const BARANGAY_OPTIONS = [
  'Barangka',
  'Calumpang',
  'Concepcion I (Uno)',
  'Concepcion II (Dos)',
  'Fortune',
  'Industrial Valley Complex (IVC)',
  'Jesus Dela Peña',
  'Malanday',
  'Marikina Heights',
  'Nangka',
  'Parang',
  'San Roque',
  'Santa Elena',
  'Santo Niño',
  'Tañong',
  'Tumana',
];

const BARANGAY_ID_MAP: Record<string, string> = {
  'Barangka': '3fee7818-0f5f-424e-ad29-4c4a7a217a0c',
  'Calumpang': 'c8b28f65-8466-4b52-8a98-2f95bc4f45ab',
  'Concepcion I (Uno)': '11af9721-639d-4237-ac99-f226ff413329',
  'Concepcion II (Dos)': '440c0ddf-c31d-4031-95a2-813b5159f144',
  'Fortune': '7d948164-954c-43b8-9463-22a7a494b40b',
  'Industrial Valley Complex (IVC)': '736a9cdd-e8ec-4f49-a413-db138c5d06a7',
  'Jesus Dela Peña': '26ea0dd6-f2dd-4914-8f6c-196587c9413a',
  'Malanday': '4119162b-f6f6-414b-8db1-c9c4462e6380',
  'Marikina Heights': '7b32821a-285f-4c78-ac57-fd0812ca36ed',
  'Nangka': 'f668a15e-ffea-4a93-abf3-e63c8edb5ea1',
  'Parang': '299a25fe-197a-43fb-ade2-0c3cc76d91cb',
  'San Roque': '19f6fc41-38b8-4a1b-83e7-a2ceb14bdb06',
  'Santa Elena': 'f1a0f639-eae6-475c-ba71-7c6a8da52de7',
  'Santo Niño': 'ed6073e5-688f-445e-93a2-e5b913840b30',
  'Tañong': '7584c655-3867-4529-b381-518cfd61f6c0',
  'Tumana': 'f459284f-9a62-4adb-b5a2-807f833dafac',
};

const BARANGAY_NAME_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(BARANGAY_ID_MAP).map(([name, id]) => [id, name])
);

interface DisasterReport {
  report_id: string;
  user_id: string;
  barangay_id: string;
  report_text: string;
  status_type: string;
  timestamp?: string;
}

interface SignedUrlCache {
  url: string;
  expiresAt: number;
}

const CommunityStatus = () => {
  const { profile } = useAuth();

  // states for posts and composer
  const [loading] = useState(false);
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<DisasterReport[]>([]);
  const [imagesByReport, setImagesByReport] = useState<Record<string, string[]>>({});
  
  // Cache for signed URLs with expiry time
  const [signedUrlCache, setSignedUrlCache] = useState<Record<string, SignedUrlCache>>(() => {
    // Load cache from localStorage on mount
    try {
      const cached = localStorage.getItem('signedUrlCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Filter out expired URLs
        const now = Date.now();
        const validCache: Record<string, SignedUrlCache> = {};
        Object.entries(parsed).forEach(([key, value]) => {
          const cache = value as SignedUrlCache;
          if (cache.expiresAt > now) {
            validCache[key] = cache;
          }
        });
        return validCache;
      }
    } catch (e) {
      console.error('Error loading cache from localStorage:', e);
    }
    return {};
  });

  // state for post composer modal
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showUploadUI, setShowUploadUI] = useState(false);

  // states for selects in composer
  const [status, setStatus] = useState('Safe');
  const [barangay, setBarangay] = useState('');

  // Image upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // This is to allow users to preview selected images from the posts
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  const [activePreviewImages, setActivePreviewImages] = useState<string[]>([]);

  // Save cache to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('signedUrlCache', JSON.stringify(signedUrlCache));
    } catch (e) {
      console.error('Error saving cache to localStorage:', e);
    }
  }, [signedUrlCache]);

  // Get signed URL with caching - valid for 1 hour
  const getSignedUrl = useCallback(async (filename: string): Promise<string> => {
    const now = Date.now();
    
    // Check if we have a valid cached URL
    if (signedUrlCache[filename] && signedUrlCache[filename].expiresAt > now) {
      return signedUrlCache[filename].url;
    }

    // Generate new signed URL (valid for 3600 seconds = 1 hour)
    const { data, error } = await supabase.storage
      .from('report-images')
      .createSignedUrl(filename, 3600);

    if (error) {
      console.error('Error creating signed URL for', filename, error);
      return '';
    }

    if (data?.signedUrl) {
      // Cache the URL with expiry time (59 minutes from now to be safe)
      const expiresAt = now + (59 * 60 * 1000);
      setSignedUrlCache(prev => ({
        ...prev,
        [filename]: {
          url: data.signedUrl,
          expiresAt
        }
      }));
      
      return data.signedUrl;
    }

    return '';
  }, [signedUrlCache]);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('disaster_reports')
      .select('*')
      .eq('moderation_status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    setPosts(
      (data ?? []).map((item) => ({
        report_id: item.report_id ?? '',
        user_id: item.user_id ?? '',
        barangay_id: item.barangay_id ?? '',
        report_text: item.report_text ?? '',
        status_type: item.status_type ?? '',
        timestamp: item.created_at ?? '',
      }))
    );

    // Fetch images for the reports
    const reportIds = (data ?? []).map((d) => d.report_id);

    if (reportIds.length > 0) {
      const { data: images, error: imagesError } = await supabase
        .from('report_images')
        .select('report_id, image_url')
        .in('report_id', reportIds);

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
        return;
      }

      console.log('Fetched images from DB:', images);

      const map: Record<string, string[]> = {};

      // Generate signed URLs for private bucket access (with caching)
      for (const img of images ?? []) {
        if (img.report_id && img.image_url) {
          // Extract filename (in case full URL was stored)
          let filename = img.image_url;
          if (filename.includes('/')) {
            const parts = filename.split('/');
            filename = parts[parts.length - 1];
          }
          
          // Get signed URL (uses cache if available, generates if not)
          const signedUrl = await getSignedUrl(filename);

          if (signedUrl) {
            if (!map[img.report_id]) map[img.report_id] = [];
            map[img.report_id].push(signedUrl);
          }
        }
      }

      console.log('Final image map with signed URLs:', map);
      setImagesByReport(map);
    }
  }, [getSignedUrl]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchPosts();
    };
    fetchData();
  }, [fetchPosts]);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-community-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'disaster_reports',
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  useEffect(() => {
    if (previewImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImageIndex(null);
      }

      if (e.key === 'ArrowRight') {
        setPreviewImageIndex((prev) =>
          prev !== null && prev < activePreviewImages.length - 1 ? prev + 1 : prev
        );
      }

      if (e.key === 'ArrowLeft') {
        setPreviewImageIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : prev
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImageIndex, activePreviewImages.length]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file sizes (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const oversizedFiles = newFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert('Some files exceed the 5MB size limit.');
      return;
    }

    // Limit to 3 images total
    const currentCount = selectedFiles.length;
    const availableSlots = 3 - currentCount;
    
    if (availableSlots <= 0) {
      alert('You can only upload up to 3 images per post.');
      return;
    }

    const filesToAdd = newFiles.slice(0, availableSlots);
    
    // Create preview URLs
    const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...filesToAdd]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // Remove selected image
  const handleRemoveImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Upload images to Supabase Storage
  const uploadImages = async (reportId: string): Promise<string[]> => {
    const uploadedFilenames: string[] = [];

    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${reportId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error } = await supabase.storage
        .from('report-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      console.log('Uploaded image:', filePath);
      uploadedFilenames.push(filePath);
    }

    return uploadedFilenames;
  };

  // Save image filenames to report_images table
  const saveImageRecords = async (reportId: string, imageFilenames: string[]) => {
    const imageRecords = imageFilenames.map(filename => ({
      report_id: reportId,
      image_url: filename  // Store just the filename
    }));

    const { error } = await supabase
      .from('report_images')
      .insert(imageRecords);

    if (error) {
      console.error('Error saving image records:', error);
      throw error;
    }
  };

  const handleCreatePost = async () => {
    console.log('Auth user:', profile?.user_id);

    if (!profile?.user_id) {
      alert('User not authenticated.');
      return;
    }

    if (!postText.trim()) {
      alert('Please write something in your post.');
      return;
    }

    if (!barangay) {
      alert('Please select your barangay.');
      return;
    }

    const barangayId = BARANGAY_ID_MAP[barangay];

    if (!barangayId) {
      alert('Invalid barangay selected.');
      return;
    }

    setIsUploading(true);

    try {
      // Create the disaster report
      const { data: reportData, error: reportError } = await supabase
        .from('disaster_reports')
        .insert([
          {
            user_id: profile.user_id,
            barangay_id: barangayId,
            report_text: postText,
            status_type: status || 'Safe',
          },
        ])
        .select()
        .single();

      if (reportError) {
        console.error(reportError);
        alert('Failed to create post. Please try again.');
        return;
      }

      // Upload images if any
      if (selectedFiles.length > 0 && reportData) {
        const imageFilenames = await uploadImages(reportData.report_id);
        await saveImageRecords(reportData.report_id, imageFilenames);
      }

      // Reset form
      setPostText('');
      setStatus('Safe');
      setBarangay('');
      setSelectedFiles([]);
      setImagePreviewUrls([]);
      setIsComposerOpen(false);
      setShowUploadUI(false);

      // Refresh posts
      await fetchPosts();

    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  return (
    <div className="community-status-container">
      <div className="community-status-main">
        <div className="community-status-content">
          <div className="community-header">
            <img src={communityIcon} alt="Community Icon" className="community-header-icon" />
            Share your community status
          </div>

          <p className="community-description">
            This page lets you stay connected with your community! You can share updates, request help during emergencies, or let others know you're safe. Simply post a status with photos, and choose your situation and barangay to keep everyone informed.
          </p>

          {/* POST COMPOSER TRIGGER */}
          <div
            className="post-composer"
            onClick={() => setIsComposerOpen(true)}
          >
            <div className="composer-left">
              <div className="avatar-circle small"><img src={communityProfileIcon} alt="Community Member" /></div>

              <button
                className="upload-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsComposerOpen(true);
                  setShowUploadUI(true);
                }}
                aria-label="Upload image"
              >
                <img src={uploadIcon} alt="Upload" />
              </button>

              <input
                type="text"
                placeholder="Write your concerns or report of situation"
                readOnly
              />
            </div>

            <button
              className="post-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsComposerOpen(true);
              }}
            >
              POST
            </button>
          </div>

          {/* POSTS FEED */}
          <div className="posts-feed">
            {posts.map((post) => (
              <div className="post-card" key={post.report_id}>
                <div className="post-header">
                  <div className="avatar-circle"> <img src={communityProfileIcon} alt="Community Member" /></div>
                  <div>
                    <h4>Community Member</h4>
                    <span>{post.timestamp}</span>
                  </div>
                </div>

                {post.status_type && (
                  <span
                    className={`cs-status cs-${post.status_type
                      .replace(/[^\w]/g, '-')
                      .toLowerCase()}`}
                  >
                    {post.status_type}
                  </span>
                )}

                {post.barangay_id && (
                  <span className="cs-barangay">
                    {BARANGAY_NAME_MAP[post.barangay_id] || 'Unknown Barangay'}
                  </span>
                )}

                <p className="post-text">{post.report_text}</p>
                {imagesByReport[post.report_id] && imagesByReport[post.report_id].length > 0 && (
                  <div className="post-images">
                    {imagesByReport[post.report_id].map((img, index) => (
                      <div
                        key={`${post.report_id}-${index}`}
                        className="post-image-wrapper"
                        onClick={() => {
                          setActivePreviewImages(imagesByReport[post.report_id]);
                          setPreviewImageIndex(index);
                        }}
                      >
                        <img 
                          src={img} 
                          alt={`Post image ${index + 1}`}
                          onError={(e) => {
                            console.error('Failed to load image:', img);
                            e.currentTarget.style.display = 'none';
                          }}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="post-actions">
                  <button className="like-btn">
                    <img src={upvoteIcon} alt="Like" />
                  </button>
                </div>
              </div>
            ))}

            {/* LOADING or SKELETON POST */}
            {loading && (
              <div className="post-card skeleton">
                <div className="post-header">
                  <div className="avatar-circle skeleton-avatar"><img src={communityProfileIcon} alt="Community Member" /></div>
                  <div className="skeleton-lines">
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line"></div>
                  </div>
                </div>
                <div className="skeleton-line long"></div>
              </div>
            )}
          </div>

          {/* POST COMPOSER MODAL */}
          {isComposerOpen && (
            <div
              className="composer-overlay"
              onClick={() => {
                if (!isUploading) {
                  setIsComposerOpen(false);
                  setShowUploadUI(false);
                  setSelectedFiles([]);
                  setImagePreviewUrls([]);
                }
              }}
            >
              <div
                className="composer-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="composer-modal-header">
                  <h3>Create post</h3>
                  <button
                    className="close-modal"
                    onClick={() => {
                      if (!isUploading) {
                        setIsComposerOpen(false);
                        setShowUploadUI(false);
                        setSelectedFiles([]);
                        setImagePreviewUrls([]);
                      }
                    }}
                    disabled={isUploading}
                  >
                    <img src={closeButtonIcon} alt="Close" />
                  </button>
                </div>

                <hr className="composer-divider" />

                <div className="composer-user">
                  <div className="avatar-circle small"><img src={communityProfileIcon} alt="Community Member" /></div>
                  <span>Community Member</span>

                  <button
                    className="upload-btn"
                    onClick={() => {
                      setShowUploadUI(true);
                      fileInputRef.current?.click();
                    }}
                    disabled={isUploading || selectedFiles.length >= 3}
                  >
                    <img src={uploadIcon} alt="Upload" />
                  </button>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </div>
                
                <div className="cs-post-selects">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isUploading}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <select
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    disabled={isUploading}
                  >
                    <option value="">Select Barangay</option>
                    {BARANGAY_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Write your concerns or report of situation....."
                  className="composer-textarea"
                  disabled={isUploading}
                />

                {/* Image upload UI */}
                {showUploadUI && (
                  <div className="upload-grid">
                    {imagePreviewUrls.map((url, index) => (
                      <div 
                        key={index} 
                        className="upload-box" 
                        style={{ 
                          backgroundImage: `url(${url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative',
                          border: '2px solid #1c3e6f'
                        }}
                      >
                        <button
                          onClick={() => handleRemoveImage(index)}
                          disabled={isUploading}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    {/* Show empty upload boxes */}
                    {Array.from({ length: 3 - imagePreviewUrls.length }).map((_, index) => (
                      <div 
                        key={`empty-${index}`}
                        className="upload-box"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
                      >
                        +
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  className="post-btn centered" 
                  onClick={handleCreatePost}
                  disabled={isUploading}
                >
                  {isUploading ? 'POSTING...' : 'POST'}
                </button>
              </div>
            </div>
          )}

          {/* IMAGE PREVIEW MODAL */}
          {previewImageIndex !== null && (
            <div
              className="image-preview-overlay"
              onClick={() => setPreviewImageIndex(null)}
            >
              <div
                className="image-viewer"
                onClick={(e) => e.stopPropagation()}
              >
                {activePreviewImages.length > 1 && (
                  <button
                    className="nav-btn prev"
                    disabled={previewImageIndex === 0}
                    onClick={() =>
                      setPreviewImageIndex((prev) =>
                        prev !== null && prev > 0 ? prev - 1 : prev
                      )
                    }
                  >
                    <img src={prevIcon} alt="Previous" />
                  </button>
                )}
                
                <div className="image-counter">
                  {previewImageIndex + 1} / {activePreviewImages.length}
                </div>

                <img
                  src={activePreviewImages[previewImageIndex]}
                  alt="Preview"
                />

                {activePreviewImages.length > 1 && (
                  <button
                    className="nav-btn next"
                    disabled={previewImageIndex === activePreviewImages.length - 1}
                    onClick={() =>
                      setPreviewImageIndex((prev) =>
                        prev !== null && prev < activePreviewImages.length - 1 ? prev + 1 : prev
                      )
                    }
                  >
                    <img src={nextIcon} alt="Next" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityStatus;