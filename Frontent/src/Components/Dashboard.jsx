import React from 'react';
import img from '../assets/bgimg.png';

// Navbar Component
const Navbar = () => {
  return (
    <header style={styles.header}>
      <div style={styles.logoContainer}>
        <h1 style={styles.logoname}>LunaSurface AI</h1>
      </div>
      <nav style={styles.nav}>
        <NavLink href="#">Dashboard</NavLink>
        <NavLink href="#">Resources</NavLink>
        <NavLink href="#">About</NavLink>
      </nav>
      <button
        style={styles.btnSigning}
        onMouseOver={e => (e.currentTarget.style.background = '#fff')}
        onMouseOut={e => (e.currentTarget.style.background = '#a7a7a7')}
      >
        Scan
      </button>
    </header>
  );
};

// NavLink Component with hover effect
const NavLink = ({ href, children }) => (
  <a
    href={href}
    style={styles.navLink}
    onMouseOver={e => (e.currentTarget.style.color = '#3e3e3e')}
    onMouseOut={e => (e.currentTarget.style.color = '#fff')}
  >
    {children}
  </a>
);

// Dashboard Component
const Dashboard = () => {
  return (
    <div style={styles.dashboardWrapper}>
      <img
        src={img}
        alt="Background"
        style={styles.backgroundImg}
      />
      <div style={styles.overlay} />
      <div style={styles.Container}>
        <Navbar />
        {/* Add more dashboard content here */}
        <div style={styles.centerContent}>
          <h2 style={styles.welcomeText}>Welcome to Lunar LS&B-AI Dashboard</h2>
          <p style={styles.subtitle}>
            Explore resources, scan, and learn more about our mission.
          </p>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  dashboardWrapper: {
   
    fontFamily: 'Segoe UI, sans-serif',
    color: '#fff',
  },
  backgroundImg: {
    width: '100%',
    height: '100vh',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  
  Container: {
    position: 'relative',
    zIndex: 3,
    width: '100%',
    height: '100vh',
    padding: '0 2rem',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 0 1rem 0',
    background: 'rgba(30, 30, 40, 0.75)',
    borderRadius: '0 0 20px 20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
   
    top: 0,
    zIndex: 10,
    backdropFilter: 'blur(6px)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoname: {
    fontFamily: 'Poppins, sans-serif',
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    letterSpacing: '0.1rem',
    color: '#fff',
    textShadow: '0 2px 8px rgba(0,0,0,0.25)',
  },
  nav: {
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
   
  },
  navLink: {
    fontSize: '1.1rem',
    letterSpacing: '0.08rem',
    textDecoration: 'none',
    color: '#fff',
    fontWeight: 500,
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    transition: 'color 0.2s, background 0.2s',
    background: 'transparent',
  },
  btnSigning: {
    padding: '0.7rem 2rem',
    borderRadius: '50px',
    border: 'none',
    backgroundColor: '#a7a7a7',
    color: '#222',
    fontSize: '1.1rem',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
  },
  centerContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: '4rem',
  },
  welcomeText: {
    fontSize: '2.5rem',
    fontWeight: 700,
    margin: '0 0 1rem 0',
    textShadow: '0 2px 10px rgba(0,0,0,0.25)',
  },
  subtitle: {
    fontSize: '1.2rem',
    fontWeight: 400,
    color: '#e0e0e0',
    marginBottom: '2rem',
    textShadow: '0 1px 4px rgba(0,0,0,0.12)',
  },
};

export default Dashboard;
