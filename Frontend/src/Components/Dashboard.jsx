import React, { useState, useEffect } from 'react';
import landslideImg from './images (1).jpeg';
import boulderImg from './download (1).jpeg';
import jarvisSoundSrc from './jarvis-ui.wav';

const jarvisSound = new Audio(jarvisSoundSrc);

const Dashboard = () => {
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

  const handleDatasetClick = () => {
    jarvisSound.play();
  };

  const handleMoonClick = () => {
    jarvisSound.play();
  };

  const handleCardClick = () => {
    jarvisSound.play();
  };

  return (
    <div style={styles.container}>
      {/* Starry background */}
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

      {/* Main layout */}
      <div style={styles.contentArea}>
        {/* Left: Moon panel */}
        <div style={styles.moonPanel}>
          <p style={styles.greenDot}>🟢</p>
          <p style={styles.chandranLabel}>Chandran</p>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg"
            alt="Moon"
            style={styles.moon}
            onClick={handleMoonClick}
          />
          <div style={styles.alertsBox}>
            <h3 style={styles.cardTitle}>Alerts !</h3>
            <p style={styles.cardText}>Landslides - 5</p>
            <p style={styles.cardText}>Boulders - 42</p>
          </div>
        </div>

        {/* Middle: Detecting text */}
        <div style={styles.detectingPanel}>
          <h3 style={styles.cardTitle}>Detecting</h3>
          <p style={styles.cardText}>
            Landslides Detected : LS32 do occur on the Moon. These are primarily caused by impacts from space debris, meteor showers,
            and radiation.
          </p>
          <p style={styles.cardText}>
           Boulder Detected : MB54 do occur on the Moon. These are primarily caused by impacts from space debris, meteor showers,
            and radiation.
          </p>
          <p style={styles.cardText}>
            Boulder Detected : BB55 do occur on the Moon. These are primarily caused by impacts from space debris, meteor showers,
            and radiation.
          </p>
            <p style={styles.cardText}>
            Landslides Detected : LS33 do occur on the Moon. These are primarily caused by impacts from space debris, meteor showers,
            and radiation.
          </p>
          <p style={styles.cardText}>
            Boulder Detected : BB55 do occur on the Moon. These are primarily caused by impacts from space debris, meteor showers,
            and radiation.
          </p>
           
        </div>

        {/* Right: Cards */}
        <div style={styles.card} onClick={handleCardClick}>
          <img src={landslideImg} alt="Landslide" style={styles.cardImage} />
          <p style={styles.cardText}>
          Landslides : LS32 - Landslides occur on the Moon due to impacts from meteor showers.
          </p>
          <hr />
          <img src={boulderImg} alt="Boulder" style={styles.cardImage} />
          <p style={styles.cardText}>
          Boulder : MB54 - Boulders are often seen in craters. 
          </p>
          <img src={boulderImg} alt="Boulder" style={styles.cardImage} />
          <p style={styles.cardText}>
          Boulder : BB55 - Boulders are often seen in craters.
          </p>
        </div>
      </div>
    </div>
  );
};

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
    padding: '30px 50px',
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
  contentArea: {
    display: 'flex',
    padding: '60px 40px',
    gap: '30px',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  moonPanel: {
    position: 'absolute',
    left: '40px',
    top: '8px',
    height: '650px',
    width: '980px',
    background: 'rgba(255, 255, 255, 0.05)',
   
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    boxShadow: `0 0 15px ${glow}22`,
    color: 'white',
  },
  greenDot: {
    position: 'absolute',
    top: '15px',
    left: '20px',
    fontSize: '15px',
    margin: 0,
  },
  chandranLabel: {
    position: 'absolute',
    top: '15px',
    left: '50px',
    fontWeight: 'bold',
    margin: 0,
  },
  moon: {
    position: 'absolute',
    top: '80px',
    left: '90px',
    width: '430px',
    height: '430px',
    borderRadius: '50%',
    boxShadow: `0 0 5px ${glow}`,
    objectFit: 'cover',
  },
  alertsBox: {
    position: 'absolute',
    top: '560px',
    left: '0.1px',
    height: '90px',
    width: '250px',
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.08)',
    borderRadius: '8px',
    textAlign: 'center',
  },
  detectingPanel: {
    position: 'absolute',
    left: '650px',
    top: '70px',
    width: '300px',
    textAlign: 'center',
    borderRadius: '12px',
    padding: '20px',
    color: 'white',
    backdropFilter: 'blur(10px)',
  },
  card: {
    position: 'absolute',
    right: '40px',
    top: '8px',
    width: '300px',
    height: '650px',
    background: 'rgba(255, 255, 255, 0.06)',
    
    padding: '20px',
    color: 'white',
    backdropFilter: 'blur(10px)',
    boxShadow: `0 0 15px ${glow}22`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  cardImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  cardText: {
    fontSize: '14px',
    color: 'white',
    marginBottom: '10px',
    textAlign: 'center',
  },
};

export default Dashboard;
