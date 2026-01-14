import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './CommunityStatus.css';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

import communityIcon from '../assets/icon-community-status.svg';
import likeIcon from '../assets/icon-like-post.svg';
import uploadIcon from '../assets/icon-upload-image.svg';
import closeButtonIcon from '../assets/icon-close-button.svg';
import samplePostImage from '../assets/sample-post-image.jpg';
import prevIcon from '../assets/icon-arrow-left.svg';
import nextIcon from '../assets/icon-arrow-right.svg';

// FOR FUTURE, AFTER BACKEND INTEGRATION
// interface Post {
//   id: string;
//   text: string;
//   images: string[];
// }

// const [posts, setPosts] = useState<Post[]>([]);
// const [activePost, setActivePost] = useState<Post | null>(null);
// const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

// FUTURE IMAGE RENDERING
// {post.images.length > 0 && (
//   <div className="post-images">
//     {post.images.slice(0, 3).map((img, index) => {
//       const remaining = post.images.length - 2;

//       if (index === 2 && post.images.length > 2) {
//         return (
//           <div
//             key={index}
//             className="post-image-wrapper overlay"
//             onClick={() => {
//               setActivePost(post);
//               setActiveImageIndex(index);
//             }}
//           >
//             <img src={img} alt="Post" />
//             <div className="image-overlay">
//               +{remaining} photos
//             </div>
//           </div>
//         );
//       }

//       return (
//         <div
//           key={index}
//           className="post-image-wrapper"
//           onClick={() => {
//             setActivePost(post);
//             setActiveImageIndex(index);
//           }}
//         >
//           <img src={img} alt="Post" />
//         </div>
//       );
//     })}
//   </div>
// )}

// FUTURE IMAGE VIEWER
// {activePost && activeImageIndex !== null && (
//   <div className="image-preview-overlay">
//     <div className="image-viewer">
//       <button
//         className="nav-btn prev"
//         onClick={() =>
//           setActiveImageIndex((i) => (i! > 0 ? i! - 1 : i))
//         }
//       >
//         <img src={prevIcon} alt="Previous" />
//       </button>

//       <img
//         src={activePost.images[activeImageIndex]}
//         alt="Preview"
//       />

//       <button
//         className="nav-btn next"
//         onClick={() =>
//           setActiveImageIndex((i) =>
//             i! < activePost.images.length - 1 ? i! + 1 : i
//           )
//         }
//       >
//         <img src={nextIcon} alt="Next" />
//       </button>
//     </div>
//   </div>
// )}

// onClick={() => {
//   setActivePost(post);
//   setActiveImageIndex(index);
// }}

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

const samplePost = {
  text: 'Tulonggggggggg……',
  images: [
    samplePostImage,
    samplePostImage,
  ],
};

const CommunityStatus = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { profile } = useAuth();

  const userName = profile?.first_name || 'User';

  // states for posts and composer
  const [loading] = useState(false);
  const [postText, setPostText] = useState('');
  interface DisasterReport {
    report_id: string;
    user_id: string;
    barangay_id: string;
    report_text: string;
    status_type: string;
    timestamp?: string;
    // Add other fields as needed
  }

  const [posts, setPosts] = useState<DisasterReport[]>([]);


  // state for post composer modal
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showUploadUI, setShowUploadUI] = useState(false);

  // states for selects in composer
  const [status, setStatus] = useState('Safe');
  const [barangay, setBarangay] = useState('');

  // This is to allow users to preview selected images from the posts
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('disaster_reports')
      .select('*')
      .eq('moderation_status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
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
        // Add other fields as needed
      }))
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchPosts();
    };
    fetchData();
  }, []);

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
}, []);

  useEffect(() => {
  if (previewImageIndex === null) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setPreviewImageIndex(null);
    }

    if (e.key === 'ArrowRight') {
      setPreviewImageIndex((prev) =>
        prev !== null && prev < samplePost.images.length - 1 ? prev + 1 : prev
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
}, [previewImageIndex]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCreatePost = async () => {
    console.log('Auth user:', profile?.user_id);

    if (!profile?.user_id) {
      alert('User not authenticated.');
      return;
    }

    if (!postText.trim()) return;

    if (!barangay) {
      alert('Please select your barangay.');
      return;
    }

    const barangayId = BARANGAY_ID_MAP[barangay];

    if (!barangayId) {
      alert('Invalid barangay selected.');
      return;
    }

    const { error } = await supabase
      .from('disaster_reports')
      .insert([
        {
          user_id: profile.user_id,
          barangay_id: barangayId,
          report_text: postText,
          status_type: status || 'Safe',
        },
      ]);

    if (error) {
      console.error(error);
      alert('Failed to post. Please try again.');
      return;
    }

    setPostText('');
    setStatus('Stable / Safe');
    setBarangay('');
    setIsComposerOpen(false);
    setShowUploadUI(false);

    fetchPosts();
  };

  return (
    <div className="community-status-container">
      <Sidebar isOpen={isSidebarOpen} />

      <main className="community-status-main">
        <Header onMenuClick={toggleSidebar} username={userName} />

        <section className="community-status-content">

          <div className="community-header">
            <img
              src={communityIcon}
              alt="Community Status"
              className="community-header-icon"
            />
            <h2>Share your sentiments and updates with the community</h2>
          </div>


          <p className="community-description">
            This page provides real-time insights of the community into the situation of every Marikeños.
          </p>

          {/* POST COMPOSER THING */}
            <div
              className="post-composer"
              onClick={() => setIsComposerOpen(true)}
            >
              <div className="composer-left">
                <div className="avatar-circle small"></div>

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

              {/* NORMAL POST (w/out photo) */}
              {posts.map((post) => (
                <div className="post-card" key={post.report_id}>
                  <div className="post-header">
                    <div className="avatar-circle"></div>
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

                  <div className="post-actions">
                    <button className="like-btn">
                      <img src={likeIcon} alt="Like" />
                    </button>
                  </div>
                </div>
              ))}

              {/* POST w PHOTO */}

              {/* LOADING or SKELETON POST; to be implemented */}
              {loading && (
                <div className="post-card skeleton">
                  <div className="post-header">
                    <div className="avatar-circle skeleton-avatar"></div>
                    <div className="skeleton-lines">
                      <div className="skeleton-line short"></div>
                      <div className="skeleton-line"></div>
                    </div>
                  </div>
                  <div className="skeleton-line long"></div>
                </div>
              )}
            </div>

            {isComposerOpen && (
              <div
                className="composer-overlay"
                onClick={() => {
                  setIsComposerOpen(false);
                  setShowUploadUI(false);
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
                        setIsComposerOpen(false);
                        setShowUploadUI(false);
                      }}
                    >
                      <img src={closeButtonIcon} alt="Close" />
                    </button>
                  </div>

                  <hr className="composer-divider" />

                  <div className="composer-user">
                    <div className="avatar-circle small"></div>
                    <span>Community Member</span>

                    <button
                      className="upload-btn"
                      onClick={() => setShowUploadUI(true)}
                    >
                      <img src={uploadIcon} alt="Upload" />
                    </button>
                  </div>
                  
                  <div className="cs-post-selects">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <select
                      value={barangay}
                      onChange={(e) => setBarangay(e.target.value)}
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
                  />


                  {showUploadUI && (
                    <div className="upload-grid">
                      <div className="upload-box">+</div>
                      <div className="upload-box">+</div>
                      <div className="upload-box">+</div>
                    </div>
                  )}

                  <button className="post-btn centered" onClick={handleCreatePost}>
                    POST
                  </button>
                </div>
              </div>
            )}

            {previewImageIndex !== null && (
              <div
                className="image-preview-overlay"
                onClick={() => setPreviewImageIndex(null)}
              >
                <div
                  className="image-viewer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {samplePost.images.length > 1 && (
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
                    {previewImageIndex! + 1} / {samplePost.images.length}
                  </div>

                  <img
                    src={samplePost.images[previewImageIndex]}
                    alt="Preview"
                  />

                  {samplePost.images.length > 1 && (
                    <button
                      className="nav-btn next"
                      disabled={previewImageIndex === samplePost.images.length - 1}
                      onClick={() =>
                        setPreviewImageIndex((prev) =>
                          prev !== null && prev < samplePost.images.length - 1 ? prev + 1 : prev
                        )
                      }
                    >
                      <img src={nextIcon} alt="Next" />
                    </button>
                  )}
                </div>
              </div>
            )}


        </section>
      </main>
    </div>
  );
};

export default CommunityStatus;