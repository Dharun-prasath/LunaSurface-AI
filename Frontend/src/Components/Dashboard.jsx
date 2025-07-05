import React, { useState, useEffect } from 'react';
import landslideImg from './images (1).jpeg';
import boulderImg from './download (1).jpeg';
import jarvisSoundSrc from './jarvis-ui.wav';

const jarvisSound = new Audio(jarvisSoundSrc);

const Dashboard = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [stars, setStars] = useState([]);
  const [animateStars, setAnimateStars] = useState(true);

  useEffect(() => {
    const starsArray = Array.from({ length: 100 }).map((_, index) => ({
      id: index,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 10,
    }));
    setStars(starsArray);
  }, []);

  useEffect(() => {
    // Inject twinkle keyframes once
    const style = document.createElement('style');
    style.textContent = `
      @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleMoonClick = () => {
    jarvisSound.play();
    setShowPanel(true);
  };

  const handleExploreClick = () => {
    jarvisSound.play();
  };

  const handleDatasetClick = () => {
    jarvisSound.play();
  };

  const toggleStars = () => {
    jarvisSound.play();
    setAnimateStars((prev) => !prev);
  };

  return (
    <div style={styles.container}>
      {/* Starfield */}
      <div style={styles.starContainer}>
        {stars.map((star) => (
          <span
            key={star.id}
            style={{
              ...styles.star,
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animation: animateStars ? `twinkle 2s infinite ease-in-out` : 'none',
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>LunaSurface AI</h1>
        <div style={styles.navRight}>
          <p style={styles.dashboardText}>Dashboard</p>
          <button style={styles.uploadButton} onClick={handleDatasetClick}>Upload Dataset</button>
          
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.leftColumn}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg"
            alt="Moon"
            style={styles.moon}
            onClick={handleMoonClick}
          />
        </div>

        {showPanel && (
          <div style={styles.rightColumn}>
            <div style={styles.cardRow}>
              <div style={styles.card}>
                <img src={landslideImg} alt="Landslide" style={styles.cardImage} />
                <h3 style={styles.cardTitle}>Landslides</h3>
                <p style={styles.cardText}>Detected terrain irregularity.</p>
                <button style={styles.button} onClick={handleExploreClick}>Explore</button>
              </div>
              <div style={styles.card}>
                <img src={boulderImg} alt="Boulder" style={styles.cardImage} />
                <h3 style={styles.cardTitle}>Boulders</h3>
                <p style={styles.cardText}>Detected surface rock mass.</p>
                <button style={styles.button} onClick={handleExploreClick}>Explore</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------- Styles ------------------------

const glow = '#aaa';

const styles = {
  container: {
    backgroundColor: 'black',
    minHeight: '100vh',
    color: 'white',
    fontFamily: 'Orbitron, Poppins, sans-serif',
    overflow: 'hidden',
    position: 'relative',
  },
  starContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: '50%',
    boxShadow: '0 0 6px white',
    zIndex: 0,
  },
  navbar: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '40px 60px',
    borderBottom: `1px solid ${glow}33`,
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
  },
  navRight: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  dashboardText: {
    fontSize: '16px',
    color: 'white',
  },
  uploadButton: {
    padding: '8px 14px',
    border: `1px solid ${glow}`,
    background: 'transparent',
    color: glow,
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: `0 0 10px ${glow}33`,
  },
  mainContent: {
    position: 'relative',
    zIndex: 2,
    color: 'white',
    display: 'flex',
    padding: '60px 40px',
    gap: '60px',
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moon: {
    marginTop: '35px',
    width: '500px',
    height: '500px',
   
    cursor: 'pointer',
    objectFit: 'cover',
  },
  rightColumn: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    alignItems: 'center',
  },
  card: {
    width: '300px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: `1px solid ${glow}22`,
    borderRadius: '16px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
    boxShadow: `0 0 20px ${glow}22`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '150px',
    borderRadius: '10px',
    objectFit: 'cover',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '18px',
    color: "white",
    marginBottom: '8px',
  },
  cardText: {
    fontSize: '14px',
    color: 'white',
    marginBottom: '12px',
    textAlign: 'center',
  },
  button: {
    padding: '8px 12px',
    border: `1px solid ${glow}`,
    background: 'transparent',
    color: glow,
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: `0 0 10px ${glow}22`,
  },
};

export default Dashboard;
