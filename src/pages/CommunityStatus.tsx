import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './CommunityStatus.css';
import { useAuth } from '../hooks/useAuth';

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
  'Stable / Safe',
  'Injured',
  'Flooding',
  'Fire',
  'Trapped',
  'Power Outage',
  'Medical Assistance Needed',
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
  const [loading, setLoading] = useState(false);
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<any[]>([]);


  // state for post composer modal
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showUploadUI, setShowUploadUI] = useState(false);

  // states for selects in composer
  const [status, setStatus] = useState('Stable / Safe');
  const [barangay, setBarangay] = useState('');

  // This is to allow users to preview selected images from the posts
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);

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
                <div className="post-card" key={post.id}>
                  <div className="post-header">
                    <div className="avatar-circle"></div>
                    <div>
                      <h4>Community Member</h4>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>

                  <div className="cs-post-meta">
                    <span className={`cs-status cs-${post.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {post.status}
                    </span>
                    <span className="cs-barangay">{post.barangay}</span>
                  </div>

                  <p className="post-text">{post.text}</p>

                  <div className="post-actions">
                    <button className="like-btn">
                      <img src={likeIcon} alt="Like" />
                    </button>
                  </div>
                </div>
              ))}


                <p className="post-text">
                  Sobrang apaw na ng tubig dito sa Brgy. Kalumpang wala man lang rescue…
                </p>

                <div className="post-actions">
                  <button className="like-btn" aria-label="Like post">
                    <img src={likeIcon} alt="Like" />
                  </button>
                </div>

              </div>

              {/* POST w PHOTO */}
              <div className="post-card">
                <div className="post-header">
                  <div className="avatar-circle"></div>
                  <div>
                    <h4>Community Member</h4>
                    <span>Just now</span>
                  </div>
                </div>

                <p className="post-text">Tulonggggggggg……</p>

                {samplePost.images.length > 0 && (
                  <div className="post-images">
                    {samplePost.images.slice(0, 3).map((img, index) => {
                      const remaining = samplePost.images.length - 2;

                      if (index === 2 && samplePost.images.length > 2) {
                        return (
                          <div
                            key={index}
                            className="post-image-wrapper overlay"
                            onClick={() => setPreviewImageIndex(index)}
                          >
                            <img src={img} alt="Post" />
                            <div className="image-overlay">
                              +{remaining} photos
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={index}
                          className="post-image-wrapper"
                          onClick={() => setPreviewImageIndex(index)}
                        >
                          <img src={img} alt="Post" />
                        </div>
                      );
                    })}
                  </div>
                )}


                <div className="post-actions">
                  <button className="like-btn" aria-label="Like post">
                    <img src={likeIcon} alt="Like" />
                  </button>
                </div>
              </div>

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