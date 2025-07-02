import React, { useState } from 'react';
import Dashboard from './Dashboard';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div style={styles.container}>
            {/* 🌌 Space Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={styles.backgroundVideo}
            >
                <source src="https://cdn.pixabay.com/video/2016/03/31/2619-865412755_large.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* 🚀 Navbar */}
            <nav style={styles.navbar}>
                <div style={styles.navbarLeft}>
                    <h1 style={styles.title}>🌕 LunaSurface AI</h1>
                </div>
                <div style={styles.navbarRight}>
                    <button style={styles.detectButton}>Detect</button>
                    <button
                        style={styles.mobileMenuButton}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        ☰
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div style={styles.mobileMenu}>
                        <ul style={styles.mobileNavList}>
                            <li style={styles.mobileNavItem}>Home</li>
                            <li style={styles.mobileNavItem}>About</li>
                            <li style={styles.mobileNavItem}>Services</li>
                        </ul>
                    </div>
                )}
            </nav>

            {/* 📑 Sidebar + Main */}
            <div style={styles.mainLayout}>
                <div style={sidebarOpen ? styles.sidebar : styles.sidebarCollapsed}>
                    <button
                        style={styles.sidebarToggle}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? '✕' : '☰'}
                    </button>
                    {sidebarOpen && (
                        <ul style={styles.sidebarList}>
                            <li style={styles.sidebarItem}> Projects</li>
                            <li style={styles.sidebarItem}> Schedule</li>
                            <li style={styles.sidebarItem}> Profile</li>
                            <li style={styles.sidebarItem}>Settings</li>
                        </ul>
                    )}
                </div>

                {/* 🪐 Main Content */}
                <main style={styles.mainContent}>
                    <Dashboard />
                </main>
            </div>

            {/* 🔗 Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerText}>
                    © {new Date().getFullYear()} LunaSurface AI. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative',
        color: '#f1f1f1',
        fontFamily: '"Poppins", sans-serif',
        overflow: 'hidden',
    },
    backgroundVideo: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        zIndex: -1,
    },
    mainLayout: {
        display: 'flex',
        flex: 1,
    },
    navbar: {
        background: 'rgba(28, 30, 38, 0.25)',
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)',
        borderBottom: '0px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navbarLeft: { 
        display: 'flex', 
        alignItems: 'center' 
    },
    navbarRight: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '25px' 
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        margin: 0,
        color: '#eee',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
    },
    navList: {
        listStyle: 'none',
        display: 'flex',
        gap: '25px',
        padding: 0,
        margin: 0,
        alignItems: 'center',
    },
    navItem: {
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#ddd',
        transition: 'all 0.3s ease',
        ':hover': {
            color: '#fff',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
        },
    },
    detectButton: {
        backgroundColor: '#ff4081',
        border: 'none',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '9999px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: '1rem',
        fontWeight: '600',
        ':hover': {
            backgroundColor: '#ff1a66',
            transform: 'scale(1.05)',
            boxShadow: '0 0 15px rgba(255, 64, 129, 0.5)',
        },
    },
    mobileMenuButton: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '1.8rem',
        cursor: 'pointer',
        display: 'none',
        '@media (max-width: 768px)': {
            display: 'block',
        },
    },
    mobileMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        padding: '20px',
        zIndex: 100,
        backdropFilter: 'blur(10px)',
    },
    mobileNavList: { 
        listStyle: 'none', 
        padding: 0, 
        margin: 0 
    },
    mobileNavItem: {
        padding: '12px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        color: '#ddd',
        fontSize: '1.1rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        ':hover': {
            color: '#fff',
        },
    },
    sidebar: {
        background: 'rgba(28, 30, 38, 0.2)',
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)',
        width: '150px',
        minHeight: 'calc(100vh - 60px)',
        transition: 'all 0.3s ease',
        borderRight: '0px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0px 0 3px rgba(0, 0, 0, 0.3)',
        padding: '4px 0',
    },
    sidebarCollapsed: {
        background: 'rgba(28, 30, 38, 0.0)',
        backdropFilter: 'blur(0px)',
        WebkitBackdropFilter: 'blur(1px)',
        width: '80px',
        minHeight: 'calc(100vh - 60px)',
        transition: 'all 0.3s ease',
        borderRight: '0px solid rgba(255,255,255,0.06)',
        padding: '20px 0',
    },
    sidebarToggle: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '1.5rem',
        cursor: 'pointer',
        margin: '0 0 20px 20px',
        padding: '10px',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: 'rgba(255,255,255,0.1)',
        },
    },
    sidebarList: { 
        listStyle: 'none', 
        padding: 0, 
        margin: 0 
    },
    sidebarItem: {
        padding: '15px 25px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        color: '#ddd',
        fontSize: '1.1rem',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#fff',
        },
    },
    mainContent: {
        flex: 1,
        padding: '0px',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '10px',
        margin: '7px',
        border: '0.5px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 50px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
    },
    footer: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        padding: '15px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        justifyContent: 'center',
    },
    footerText: { 
        color: '#aaa', 
        fontSize: '0.9rem',
        textAlign: 'center',
    },
};

export default Layout;