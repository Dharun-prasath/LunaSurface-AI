import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import landslideImg from './images (1).jpeg';
import boulderImg from './download (1).jpeg';
import jarvisSoundSrc from './jarvis-ui.wav';

const jarvisSound = new Audio(jarvisSoundSrc);

const MoonModel = () => {
    const moonRef = useRef();
    const [moonTexture] = useTexture(['https://threejs.org/examples/textures/planets/moon_1024.jpg']);

    useFrame(() => {
        moonRef.current.rotation.y += 0.004;
    });

    return (
        <mesh ref={moonRef}>
            <sphereGeometry args={[1.75, 64, 64]} />
            <meshStandardMaterial map={moonTexture} roughness={0.8} metalness={0.1} />
        </mesh>
    );
};

const Dashboard = () => {
    const [stars, setStars] = useState([]);
    const [animateStars] = useState(true);
    const [expandedEvent, setExpandedEvent] = useState('CR01');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [lightboxImg, setLightboxImg] = useState(null);

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
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.85); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes scanline {
        0%   { top: -4px; }
        100% { top: 100%; }
      }
      .action-btn:hover {
        opacity: 0.85;
        transform: translateY(-1px);
      }
    `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const events = [
        {
            id: 'CR01',
            type: 'Crater',
            title: 'Crater Detected: CR01',
            severity: 'High',
            location: 'Crater Aristarchus',
            details: 'New impact crater identified via orbital imaging. Estimated diameter 340m. High-priority geological study zone flagged for immediate survey.',
            timestamp: '2 hours ago',
            image: landslideImg,
            fullDetails: [
                'Diameter: ~340 meters',
                'Depth: Estimated 45–65 meters',
                'Ejecta radius: 1.8 km',
                'Probable age: < 50,000 years (fresh rays visible)',
                'Recommended actions: Orbital photogrammetry survey, mark as exclusion zone for rover ops',
            ],
        },
        {
            id: 'MB54',
            type: 'Boulder',
            title: 'Boulder Detected: MB54',
            severity: 'Medium',
            location: 'Mare Tranquillitatis',
            details: 'Large boulder field detected with potential navigation hazards. Marked for rover path planning avoidance.',
            timestamp: '4 hours ago',
            image: boulderImg,
            fullDetails: [
                'Boulder count: 42 significant rocks (>1m diameter)',
                'Field dimensions: 120m x 80m',
                'Average size: 1.5–3m diameter',
                'Composition: Basaltic (similar to Apollo 11 samples)',
                'Recommended actions: Update rover navigation maps, schedule photographic survey',
            ],
        },
        {
            id: 'CR02',
            type: 'Crater',
            title: 'Crater Detected: CR02',
            severity: 'Medium',
            location: 'Tycho Crater Rim',
            details: 'Secondary micro-crater cluster mapped near Tycho rim. Possible debris field from recent lunar seismic event.',
            timestamp: '5 hours ago',
            image: landslideImg,
            fullDetails: [
                'Cluster count: 7 micro-craters',
                'Diameter range: 12–38 meters',
                'Position: 23.4°S, 11.5°W',
                'Origin: Secondary ejecta from Tycho primary impact',
                'Recommended actions: None required, monitor for regolith drift',
            ],
        },
        {
            id: 'BB55',
            type: 'Boulder',
            title: 'Boulder Detected: BB55',
            severity: 'Low',
            location: 'Shackleton Crater Edge',
            details: 'Isolated 2.4m boulder detected near crater edge. Stable position confirmed. Added to long-term monitoring list.',
            timestamp: '6 hours ago',
            image: boulderImg,
            fullDetails: [
                'Size: 2.4m diameter',
                'Position: 89.9°S, 0.0°E',
                'Composition: Anorthosite (highland material)',
                'Origin: Likely ejecta from nearby impact event',
                'Recommended actions: None required, monitor for movement',
            ],
        },
        {
            id: 'CR03',
            type: 'Crater',
            title: 'Crater Detected: CR03',
            severity: 'Low',
            location: 'Mare Imbrium',
            details: 'Small ancient crater identified. Heavily eroded rim. No active hazard, added to geological archive.',
            timestamp: '9 hours ago',
            image: landslideImg,
            fullDetails: [
                'Diameter: ~85 meters',
                'Rim erosion: ~70% degraded',
                'Position: 32.8°N, 15.6°W',
                'Age estimate: > 1 billion years',
                'Recommended actions: Archive to geological database',
            ],
        },
        {
            id: 'MB56',
            type: 'Boulder',
            title: 'Boulder Detected: MB56',
            severity: 'Low',
            location: 'Oceanus Procellarum',
            details: 'Cluster of small boulders detected in flat mare region. Low navigation risk. Flagged for scientific sampling.',
            timestamp: '11 hours ago',
            image: boulderImg,
            fullDetails: [
                'Boulder count: 8 rocks (0.5–1.2m)',
                'Field dimensions: 40m x 25m',
                'Composition: Basaltic',
                'Origin: Probable secondary ejecta',
                'Recommended actions: Flag for future sample collection mission',
            ],
        },
    ];

    useEffect(() => {
        if (events.length > 0 && !selectedEvent) {
            setSelectedEvent(events[0]);
        }
    }, []);

    const craterCount = events.filter(e => e.type === 'Crater').length;
    const boulderCount = events.filter(e => e.type === 'Boulder').length;

    const handleDatasetClick = () => jarvisSound.play();
    const handleMoonClick = () => jarvisSound.play();

    const handleCardClick = (eventId) => {
        jarvisSound.play();
        setExpandedEvent(expandedEvent === eventId ? null : eventId);
        setSelectedEvent(events.find(e => e.id === eventId));
    };

    const handleImageClick = (e, imgSrc) => {
        e.stopPropagation();
        setLightboxImg(imgSrc);
    };

    return (
        <div style={styles.container}>

            {/* ── Starry background ── */}
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
                            animation: animateStars ? 'twinkle 2s infinite ease-in-out' : 'none',
                            animationDelay: `${star.delay}s`,
                        }}
                    />
                ))}
            </div>

            {/* ── Lightbox ── */}
            {lightboxImg && (
                <div style={styles.lightboxOverlay} onClick={() => setLightboxImg(null)}>
                    <div style={styles.lightboxBox} onClick={e => e.stopPropagation()}>
                        <button style={styles.lightboxClose} onClick={() => setLightboxImg(null)}>✕</button>
                        <img src={lightboxImg} alt="Detected feature" style={styles.lightboxImg} />
                    </div>
                </div>
            )}

            {/* ── Navbar ── */}
            <div style={styles.navbar}>
                <div style={styles.logoGroup}>
                    <span style={styles.logoIcon}>◎</span>
                    <h1 style={styles.logo}>LunaSurface AI</h1>
                    <span style={styles.logoSub}>Crater & Boulder Detection</span>
                </div>
                <div style={styles.navRight}>
                    <div style={styles.navStats}>
                        <span style={styles.navStat}><span style={{ color: '#ff4d4d' }}>●</span> {craterCount} Craters</span>
                        <span style={styles.navStat}><span style={{ color: '#ffa64d' }}>●</span> {boulderCount} Boulders</span>
                    </div>
                    <button style={styles.uploadButton} onClick={handleDatasetClick}>
                        Upload Images
                    </button>
                </div>
            </div>

            {/* ── Main 3-column layout ── */}
            <div style={styles.contentArea}>

                {/* ── LEFT: Moon panel ── */}
                <div style={styles.moonPanel}>
                    <div style={styles.statusIndicator}>
                        <span style={styles.statusDot}>🟢</span>
                        <span style={styles.statusText}>Chandran Base - Active Monitoring</span>
                    </div>

                    <div style={styles.moonCanvasContainer} onClick={handleMoonClick}>
                        <div style={styles.scanLine} />
                        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={styles.moonCanvas}>
                            <ambientLight intensity={7.0} />
                            <pointLight position={[10, 10, 10]} intensity={1} />
                            <MoonModel />
                            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
                        </Canvas>
                        <div style={styles.moonOverlayLabel}>LIVE SURFACE SCAN</div>
                    </div>

                    {/* ── Active Alerts card ── */}
                    <div style={styles.alertsBox}>
                        <h3 style={styles.cardTitle}>Active Alerts</h3>
                        <div style={styles.alertItem}>
                            <span style={styles.alertLabel}>Craters:</span>
                            <span style={{ ...styles.alertValue, color: '#ff4d4d' }}>{craterCount} detected</span>
                        </div>
                        <div style={styles.alertItem}>
                            <span style={styles.alertLabel}>Boulders:</span>
                            <span style={{ ...styles.alertValue, color: '#ffa64d' }}>{boulderCount} detected</span>
                        </div>
                        <div style={styles.alertItem}>
                            <span style={styles.alertLabel}>Seismic:</span>
                            <span style={styles.alertValue}>3 events</span>
                        </div>
                        <div style={styles.alertItem}>
                            <span style={styles.alertLabel}>Model Confidence:</span>
                            <span style={{ ...styles.alertValue, color: '#4dffb8' }}>92.4%</span>
                        </div>

                        {/* ── Divider ── */}
                        <div style={styles.alertDivider} />

                        {/* ── Action buttons ── */}
                        <div style={styles.alertActions}>
                            <button
                                className="action-btn"
                                style={styles.alertUploadBtn}
                                onClick={handleDatasetClick}
                            >
                                <span style={styles.btnIcon}>⬆</span> Upload Images
                            </button>
                            <button
                                className="action-btn"
                                style={styles.alertAnalysisBtn}
                                onClick={() => jarvisSound.play()}
                            >
                                <span style={styles.btnIcon}>⬡</span> Analysis
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── CENTER: Detection Detail ── */}
                <div style={styles.detailsPanel}>
                    <h3 style={styles.panelTitle}>
                        {selectedEvent ? `${selectedEvent.type} Details` : 'Detection Details'}
                    </h3>

                    <div style={styles.detectionInfo}>
                        {selectedEvent ? (
                            <>
                                {/* Clickable image → lightbox */}
                                <div
                                    style={styles.centerImageWrap}
                                    onClick={(e) => handleImageClick(e, selectedEvent.image)}
                                    title="Click to enlarge"
                                >
                                    <img
                                        src={selectedEvent.image}
                                        alt={selectedEvent.type}
                                        style={styles.centerImage}
                                    />
                                    <div style={styles.centerImageHint}>🔍 Click to enlarge</div>
                                </div>

                                {/* Type badge */}
                                <div style={styles.centerBadgeRow}>
                                    <span style={{
                                        ...styles.typeBadge,
                                        background: selectedEvent.type === 'Crater'
                                            ? 'rgba(255,77,77,0.15)'
                                            : 'rgba(255,166,77,0.15)',
                                        color: selectedEvent.type === 'Crater' ? '#ff4d4d' : '#ffa64d',
                                        border: `1px solid ${selectedEvent.type === 'Crater' ? '#ff4d4d55' : '#ffa64d55'}`,
                                    }}>
                                        {selectedEvent.type === 'Crater' ? '◎' : '⬟'} {selectedEvent.type}
                                    </span>
                                    <span style={{
                                        ...styles.severityBadge,
                                        backgroundColor: getSeverityColor(selectedEvent.severity),
                                    }}>
                                        {selectedEvent.severity}
                                    </span>
                                </div>

                                <div style={styles.detailSection}>
                                    <h4 style={styles.detailHeader}>Location</h4>
                                    <p style={styles.detailText}>📍 {selectedEvent.location}</p>
                                </div>

                                <div style={styles.detailSection}>
                                    <h4 style={styles.detailHeader}>Characteristics</h4>
                                    <ul style={styles.detailList}>
                                        {selectedEvent.fullDetails.map((detail, index) => (
                                            <li key={index} style={styles.detailListItem}>
                                                <span style={styles.detailBullet}>›</span> {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div style={styles.detailSection}>
                                    <h4 style={styles.detailHeader}>Detection Time</h4>
                                    <p style={styles.detailText}>🕐 {selectedEvent.timestamp}</p>
                                </div>

                                {/* Threat meter */}
                                <div style={styles.detailSection}>
                                    <h4 style={styles.detailHeader}>Threat Level</h4>
                                    <div style={styles.meterBar}>
                                        <div style={{
                                            ...styles.meterFill,
                                            width: selectedEvent.severity === 'High' ? '90%'
                                                : selectedEvent.severity === 'Medium' ? '55%' : '20%',
                                            background: getSeverityColor(selectedEvent.severity),
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '12px', color: getSeverityColor(selectedEvent.severity) }}>
                                        {selectedEvent.severity}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <p style={styles.detectionText}>
                                    Craters (CR) form primarily via hypervelocity meteorite impacts. Detection uses
                                    shadow-angle photogrammetry and DEM differencing to identify rim-to-floor depth profiles.
                                </p>
                                <p style={styles.detectionText}>
                                    Boulders (MB/BB) are common lunar surface features, often ejected from impact craters
                                    or exposed by seismic activity.
                                </p>
                                <div style={styles.statsContainer}>
                                    <div style={styles.statItem}>
                                        <span style={styles.statValue}>92%</span>
                                        <span style={styles.statLabel}>Detection Accuracy</span>
                                    </div>
                                    <div style={styles.statItem}>
                                        <span style={styles.statValue}>14ms</span>
                                        <span style={styles.statLabel}>Avg. Response Time</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Events feed (vertically scrollable) ── */}
                <div style={styles.eventsPanel}>
                    <h3 style={styles.panelTitle}>Recent Events</h3>

                    <div style={styles.eventsList}>
                        {events.map((event) => (
                            <div
                                key={event.id}
                                style={{
                                    ...styles.eventCard,
                                    borderLeft: `4px solid ${getSeverityColor(event.severity)}`,
                                    background: selectedEvent?.id === event.id
                                        ? 'rgba(169,226,255,0.07)'
                                        : 'rgba(0,0,0,0.3)',
                                    outline: selectedEvent?.id === event.id
                                        ? `1px solid ${glow}33`
                                        : '1px solid transparent',
                                }}
                                onClick={() => handleCardClick(event.id)}
                            >
                                <div style={styles.eventHeader}>
                                    <div style={styles.eventMetaGroup}>
                                        <span style={{
                                            ...styles.smallTypeBadge,
                                            color: event.type === 'Crater' ? '#ff4d4d' : '#ffa64d',
                                        }}>
                                            {event.type === 'Crater' ? '◎' : '⬟'} {event.type}
                                        </span>
                                        <h4 style={styles.eventTitle}>{event.title}</h4>
                                        <p style={styles.eventLocation}>📍 {event.location}</p>
                                    </div>
                                    <div style={styles.eventRightCol}>
                                        <span style={{
                                            ...styles.eventSeverity,
                                            backgroundColor: getSeverityColor(event.severity),
                                        }}>
                                            {event.severity}
                                        </span>
                                        <span style={styles.chevron}>
                                            {expandedEvent === event.id ? '▲' : '▼'}
                                        </span>
                                    </div>
                                </div>

                                {expandedEvent === event.id && (
                                    <div style={styles.eventDetails}>
                                        <img
                                            src={event.image}
                                            alt={event.type}
                                            style={styles.eventImage}
                                            onClick={(e) => handleImageClick(e, event.image)}
                                            title="Click to enlarge"
                                        />
                                        <p style={styles.eventText}>{event.details}</p>
                                        <p style={styles.eventTimestamp}>🕐 {event.timestamp}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

const getSeverityColor = (severity) => {
    switch (severity) {
        case 'High':   return '#ff4d4d';
        case 'Medium': return '#ffa64d';
        case 'Low':    return '#4dffb8';
        default:       return '#4d8cff';
    }
};

const glow    = '#a9e2ff';
const panelBg = 'rgba(0, 0, 0, 0.6)';

const styles = {
    container: {
        backgroundColor: 'black',
        minHeight: '100vh',
        color: 'white',
        fontFamily: '"Orbitron", "Poppins", sans-serif',
        overflow: 'hidden',
        position: 'relative',
    },
    starContainer: {
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
    },
    star: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: '50%',
        boxShadow: '0 0 6px white',
        zIndex: 0,
    },
    lightboxOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lightboxBox: {
        position: 'relative',
        animation: 'fadeIn 0.25s ease',
        maxWidth: '80vw',
        maxHeight: '80vh',
    },
    lightboxImg: {
        display: 'block',
        maxWidth: '80vw',
        maxHeight: '76vh',
        borderRadius: '12px',
        border: `2px solid ${glow}44`,
        boxShadow: `0 0 60px ${glow}22`,
        objectFit: 'contain',
    },
    lightboxClose: {
        position: 'absolute',
        top: '-14px',
        right: '-14px',
        background: 'rgba(0,0,0,0.8)',
        border: `1px solid ${glow}66`,
        color: glow,
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        cursor: 'pointer',
        fontSize: '14px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navbar: {
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        background: 'rgba(0,0,0,0.85)',
        borderBottom: `1px solid ${glow}22`,
        backdropFilter: 'blur(1px)',
    },
    logoGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    logoIcon: {
        fontSize: '22px',
        color: glow,
        textShadow: `0 0 12px ${glow}`,
    },
    logo: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: 'white',
        margin: 0,
    },
    logoSub: {
        fontSize: '11px',
        color: `${glow}99`,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        borderLeft: `1px solid ${glow}44`,
        paddingLeft: '10px',
    },
    navRight: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
    },
    navStats: {
        display: 'flex',
        gap: '16px',
    },
    navStat: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.8)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    uploadButton: {
        padding: '8px 16px',
        border: `1px solid ${glow}`,
        background: 'transparent',
        color: glow,
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        boxShadow: `0 0 10px ${glow}33`,
        transition: 'all 0.3s ease',
    },
    contentArea: {
        display: 'flex',
        padding: '20px',
        gap: '20px',
        height: 'calc(100vh - 69px)',
        position: 'relative',
        zIndex: 1,
        boxSizing: 'border-box',
    },

    /* LEFT */
    moonPanel: {
        flex: '0 0 340px',
        background: panelBg,
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    statusIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    statusDot: { fontSize: '12px' },
    statusText: {
        fontSize: '13px',
        fontWeight: '500',
        color: 'rgba(255,255,255,0.8)',
    },
    moonCanvasContainer: {
        height: '300px',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        border: `1px solid ${glow}22`,
        flexShrink: 0,
    },
    scanLine: {
        position: 'absolute',
        left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(to right, transparent, ${glow}66, transparent)`,
        zIndex: 2,
        animation: 'scanline 3s linear infinite',
        pointerEvents: 'none',
    },
    moonCanvas: {
        width: '100%', height: '100%',
        background: 'transparent',
    },
    moonOverlayLabel: {
        position: 'absolute',
        bottom: '8px', right: '10px',
        fontSize: '10px',
        color: `${glow}88`,
        letterSpacing: '2px',
        zIndex: 3,
        pointerEvents: 'none',
    },
    alertsBox: {
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        padding: '15px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    cardTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        margin: '0 0 12px 0',
        color: glow,
        textShadow: `0 0 8px ${glow}33`,
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    alertItem: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
    },
    alertLabel: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.8)',
    },
    alertValue: {
        fontSize: '14px',
        fontWeight: 'bold',
    },

    /* ── NEW: divider + action buttons inside alerts card ── */
    alertDivider: {
        height: '1px',
        background: `${glow}22`,
        margin: '12px 0 14px',
    },
    alertActions: {
        display: 'flex',
        gap: '10px',
        marginTop: 'auto',
    },
    alertUploadBtn: {
        flex: 1,
        padding: '9px 0',
        border: `1px solid ${glow}`,
        background: 'transparent',
        color: glow,
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: '"Orbitron", "Poppins", sans-serif',
        fontWeight: 'bold',
        fontSize: '12px',
        letterSpacing: '0.5px',
        boxShadow: `0 0 10px ${glow}22`,
        transition: 'all 0.25s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
    },
    alertAnalysisBtn: {
        flex: 1,
        padding: '9px 0',
        border: '1px solid #4dffb8',
        background: 'rgba(77,255,184,0.08)',
        color: '#4dffb8',
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: '"Orbitron", "Poppins", sans-serif',
        fontWeight: 'bold',
        fontSize: '12px',
        letterSpacing: '0.5px',
        boxShadow: '0 0 10px rgba(77,255,184,0.15)',
        transition: 'all 0.25s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
    },
    btnIcon: {
        fontSize: '13px',
    },

    /* CENTER */
    detailsPanel: {
        flex: 1,
        background: panelBg,
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    panelTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '0 0 15px 0',
        color: glow,
        textShadow: `0 0 8px ${glow}33`,
    },
    detectionInfo: {
        flex: 1,
        overflowY: 'auto',
    },
    centerImageWrap: {
        position: 'relative',
        width: '100%',
        height: '200px',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '16px',
        cursor: 'pointer',
        border: `1px solid ${glow}22`,
    },
    centerImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        transition: 'transform 0.3s ease',
    },
    centerImageHint: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: '8px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
        fontSize: '11px',
        color: `${glow}cc`,
        textAlign: 'center',
        letterSpacing: '1px',
    },
    centerBadgeRow: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        marginBottom: '16px',
    },
    typeBadge: {
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '3px 10px',
        borderRadius: '4px',
        letterSpacing: '0.5px',
    },
    severityBadge: {
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '3px 10px',
        borderRadius: '12px',
        color: 'black',
    },
    detectionText: {
        fontSize: '14px',
        lineHeight: '1.6',
        margin: '0 0 15px 0',
        color: 'rgba(255,255,255,0.85)',
    },
    statsContainer: {
        display: 'flex',
        gap: '15px',
        marginTop: '20px',
    },
    statItem: {
        flex: 1,
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        padding: '15px',
        textAlign: 'center',
    },
    statValue: {
        display: 'block',
        fontSize: '24px',
        fontWeight: 'bold',
        color: glow,
        marginBottom: '5px',
    },
    statLabel: {
        display: 'block',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.7)',
    },
    detailSection: {
        marginBottom: '18px',
    },
    detailHeader: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: glow,
        margin: '0 0 8px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    detailText: {
        fontSize: '14px',
        margin: '0 0 6px 0',
        lineHeight: '1.5',
        color: 'rgba(255,255,255,0.85)',
    },
    detailList: {
        margin: 0,
        padding: 0,
        listStyle: 'none',
    },
    detailListItem: {
        fontSize: '14px',
        marginBottom: '8px',
        lineHeight: '1.4',
        color: 'rgba(255,255,255,0.8)',
        display: 'flex',
        gap: '6px',
    },
    detailBullet: {
        color: glow,
        fontWeight: 'bold',
        flexShrink: 0,
    },
    meterBar: {
        height: '6px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '6px',
    },
    meterFill: {
        height: '100%',
        borderRadius: '3px',
        transition: 'width 0.4s ease',
    },

    /* RIGHT */
    eventsPanel: {
        flex: '0 0 300px',
        background: panelBg,
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    eventsList: {
        flex: 1,
        overflowY: 'auto',
        paddingRight: '4px',
    },
    eventCard: {
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        borderLeft: '4px solid transparent',
    },
    eventHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '8px',
    },
    eventMetaGroup: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
    },
    smallTypeBadge: {
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
    },
    eventRightCol: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '5px',
        flexShrink: 0,
    },
    eventTitle: {
        fontSize: '13px',
        fontWeight: 'bold',
        margin: 0,
    },
    eventLocation: {
        fontSize: '11px',
        color: 'rgba(255,255,255,0.6)',
        margin: 0,
    },
    eventSeverity: {
        fontSize: '10px',
        fontWeight: 'bold',
        padding: '3px 7px',
        borderRadius: '12px',
        color: 'black',
    },
    chevron: {
        fontSize: '9px',
        color: `${glow}88`,
    },
    eventDetails: {
        marginTop: '10px',
        paddingTop: '10px',
        borderTop: `1px solid ${glow}33`,
    },
    eventImage: {
        width: '100%',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '6px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'opacity 0.2s ease',
        border: `1px solid ${glow}22`,
    },
    eventText: {
        fontSize: '12px',
        margin: '0 0 6px 0',
        lineHeight: '1.5',
        color: 'rgba(255,255,255,0.8)',
    },
    eventTimestamp: {
        fontSize: '11px',
        color: 'rgba(255,255,255,0.5)',
        margin: 0,
    },
};

export default Dashboard;