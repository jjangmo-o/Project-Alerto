import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';
import logoImg from '../assets/logo.png';

const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const [particleStyles] = useState<Array<React.CSSProperties>>(() =>
    Array.from({ length: 50 }).map(() => {
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 8;
      const animationDuration = 8 + Math.random() * 8;
      const opacity = Math.random() * 0.5 + 0.2;
      return {
        left: `${left}%`,
        animationDelay: `${animationDelay}s`,
        animationDuration: `${animationDuration}s`,
        opacity,
      };
    })
  );

  return (
    <div className="welcome-page">
      {/* Animated Background Particles */}
      <div className="particles-container">
        {particleStyles.map((style, i) => (
          <div
            key={i}
            className="particle"
            style={style}
          />
        ))}
      </div>

      {/* Water Wave Animation */}
      <div className="wave-container">
        <svg
          className="wave"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(255, 255, 255, 0.1)"
            fillOpacity="1"
            d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,144C960,128,1056,128,1152,138.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <svg
          className="wave wave-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(255, 255, 255, 0.05)"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,154.7C384,149,480,107,576,101.3C672,96,768,128,864,144C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Main Content Container */}
      <div className="welcome-content">
        {/* Hero Section */}
        <div className="hero-section">
          {/* Tagline */}
          <div className="tagline">
            <span className="tagline-highlight">"Be Aware. Be Ready. Be Safe."</span>
          </div>

          {/* Logo Section */}
          <div className="logo-container">
            <img src={logoImg} alt="Project Alerto" className="welcome-logo" />
          </div>

          {/* Title */}
          <h1 className="hero-title">MARIKEÑOS' PREPAREDNESS HUB</h1>

          {/* Description */}
          <p className="hero-description">
            Stay informed, stay prepared, and stay connected with your community. 
            Project Alerto brings real-time emergency alerts, disaster preparedness 
            resources, and community support right to your fingertips.
          </p>

          {/* CTA Buttons */}
          <div className="cta-buttons">
            <button className="btn-primary" onClick={handleGetStarted}>
              Get Started
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;