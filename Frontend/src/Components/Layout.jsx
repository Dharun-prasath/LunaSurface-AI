import React, { useState } from 'react';

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
            </video>

            {/* 🚀 Navbar */}
            <nav style={styles.navbar}>
                <div style={styles.navbarLeft}>
                    <h1 style={styles.title}>🌕 LunaSurface AI</h1>
                </div>
                <div style={styles.navbarRight}>
                    <ul style={styles.navList}>
                        <li style={styles.navItem}> Home</li>
                        <li style={styles.navItem}>ℹ️ About</li>
                        <li style={styles.navItem}> Services</li>
                    </ul>
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
                            <li style={styles.mobileNavItem}> Home</li>
                            <li style={styles.mobileNavItem}>ℹ️ About</li>
                            <li style={styles.mobileNavItem}> Services</li>
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
                        {sidebarOpen ? 'X' : '☰'}
                    </button>
                    {sidebarOpen && (
                        <ul style={styles.sidebarList}>
                            <li style={styles.sidebarItem}>Projects</li>
                            <li style={styles.sidebarItem}>Schedule</li>
                            <li style={styles.sidebarItem}>Profile</li>
                        </ul>
                    )}
                </div>

                {/* 🪐 Main Content */}
                <main style={styles.mainContent}>
                    
                </main>
            </div>

            {/* 🔗 Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerLinks}>
                    <a href="#" style={styles.footerLink}>Home</a>
                    <a href="#" style={styles.footerLink}>About</a>
                    <a href="#" style={styles.footerLink}>Services</a>
                    <a href="#" style={styles.footerLink}>Contact</a>
                </div>
                <div style={styles.footerSocial}>
                    <a href="#" style={styles.socialLink}>Twitter</a>
                    <a href="#" style={styles.socialLink}>GitHub</a>
                    <a href="#" style={styles.socialLink}>Email</a>
                </div>
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
        fontFamily: 'Poppins, sans-serif',
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
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },


    navbarLeft: { display: 'flex', alignItems: 'center' },
    navbarRight: { display: 'flex', alignItems: 'center', gap: '20px' },

    title: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        margin: 0,
        color: '#eee',
    },

    navList: {
        listStyle: 'none',
        display: 'flex',
        gap: '20px',
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
    },

    detectButton: {
        backgroundColor: '#ff4081',
        border: 'none',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '9999px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },

    mobileMenuButton: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '1.5rem',
        cursor: 'pointer',
        display: 'none',
    },

    mobileMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        padding: '10px',
        zIndex: 100,
    },

    mobileNavList: { listStyle: 'none', padding: 0, margin: 0 },

    mobileNavItem: {
        padding: '8px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        color: '#ddd',
    },

    sidebar: {
        background: 'rgba(28, 30, 38, 0.25)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        width: '250px',
        minHeight: 'calc(100vh - 60px)',
        transition: 'width 0.3s ease',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '4px 0 30px rgba(0, 0, 0, 0.3)',
    },

    sidebarCollapsed: {
        background: 'rgba(28, 30, 38, 0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        width: '60px',
        minHeight: 'calc(100vh - 60px)',
        transition: 'width 0.3s ease',
        borderRight: '1px solid rgba(255,255,255,0.06)',
    },

    sidebarToggle: {
        backgroundColor: 'transparent',
        backdropFilter: 'blur(10px)',
        border: 'none',
        color: '#fff',
        fontSize: '1.5rem',
        cursor: 'pointer',
        margin: '10px',
    },

    sidebarList: { listStyle: 'none', padding: '10px 0', margin: 0 },

    sidebarItem: {
        padding: '10px 20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#ddd',
    },

    mainContent: {
        flex: 1,
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.01)', // Ultra transparent
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '20px',
        margin: 'none',
        border: '0px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 50px rgba(0, 0, 0, 0.4)',
    },



    footer: {
        background: 'rgba(28, 30, 38, 0.25)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },

    footerLinks: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
    },

    footerLink: { color: '#aaa', textDecoration: 'none' },

    footerSocial: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
    },

    socialLink: {
        color: '#aaa',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },

    footerText: { color: '#888', fontSize: '0.9rem' },
};

export default Layout;
