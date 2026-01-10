import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './CommunityStatus.css';

import communityIcon from '../assets/icon-community-status.svg';
import likeIcon from '../assets/icon-like-post.svg';
import uploadIcon from '../assets/icon-upload-image.svg';
import closeButtonIcon from '../assets/icon-close-button.svg';

const CommunityStatus = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [loading, setLoading] = useState(false);
  const [postText, setPostText] = useState('');

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showUploadUI, setShowUploadUI] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="community-status-container">
      <Sidebar isOpen={isSidebarOpen} />

      <main className="community-status-main">
        <Header onMenuClick={toggleSidebar} />

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
            This page provides real-time insights of the community into the situation ofevery Marikeños.
          </p>

          {/* POST COMPOSER */}
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

              {/* NORMAL POST */}
              <div className="post-card">
                <div className="post-header">
                  <div className="avatar-circle"></div>
                  <div>
                    <h4>Community Member</h4>
                    <span>Just now</span>
                  </div>
                </div>

                <p className="post-text">
                  Sobrang apaw na ng tubig dito sa Brgy. Kalumpang wala man lang rescue…
                </p>

                <div className="post-actions">
                  <button className="like-btn" aria-label="Like post">
                    <img src={likeIcon} alt="Like" />
                  </button>
                </div>

              </div>

              {/* POST WITH PHOTO */}
              <div className="post-card">
                <div className="post-header">
                  <div className="avatar-circle"></div>
                  <div>
                    <h4>Community Member</h4>
                    <span>Just now</span>
                  </div>
                </div>

                <p className="post-text">Tulonggggggggg……</p>

                <img
                  src="https://via.placeholder.com/400x250"
                  alt="Post"
                  className="post-image"
                />

                <div className="post-actions">
                  <button className="like-btn" aria-label="Like post">
                    <img src={likeIcon} alt="Like" />
                  </button>
                </div>
              </div>

              {/* LOADING / SKELETON POST */}
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

                  <textarea
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

                  <button className="post-btn centered">
                    POST
                  </button>
                </div>
              </div>
            )}

        </section>
      </main>
    </div>
  );
};

export default CommunityStatus;
