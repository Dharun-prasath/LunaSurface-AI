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
            <sphereGeometry args={[1, 64, 64]} /> {/* Reduced size */}
            <meshStandardMaterial
                map={moonTexture}
                roughness={0.8}
                metalness={0.1}
            />
        </mesh>
    );
};

const Dashboard = () => {
    const [stars, setStars] = useState([]);
    const [animateStars, setAnimateStars] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [expandedEvent, setExpandedEvent] = useState('LS32'); // Default to first event expanded
    const [selectedEvent, setSelectedEvent] = useState(null);

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

    const handleCardClick = (eventId) => {
        jarvisSound.play();
        setExpandedEvent(expandedEvent === eventId ? null : eventId);
        setSelectedEvent(events.find(event => event.id === eventId));
    };

    const events = [
        {
            id: 'LS32',
            type: 'Landslide',
            title: 'Landslide Detected: LS32',
            severity: 'High',
            location: 'Crater Aristarchus',
            details: 'Major terrain shift detected in northern crater. Possible subsurface instability. Recommend immediate survey team dispatch.',
            timestamp: '2 hours ago',
            image: landslideImg,
            fullDetails: [
                'Magnitude: 7.2 on lunar seismic scale',
                'Affected area: 1.2 km²',
                'Depth: 30-50 meters below surface',
                'Potential causes: Recent meteor impact (3.2 km NW) combined with thermal fracturing',
                'Recommended actions: Deploy seismic sensors, avoid area with rover operations'
            ]
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
                'Average size: 1.5-3m diameter',
                'Composition: Basaltic (similar to Apollo 11 samples)',
                'Recommended actions: Update rover navigation maps, schedule photographic survey'
            ]
        },
        {
            id: 'BB55',
            type: 'Boulder',
            title: 'Boulder Detected: BB55',
            severity: 'Low',
            location: 'Tycho Crater',
            details: 'Isolated boulder detected. No immediate impact on operations. Added to long-term monitoring list.',
            timestamp: '6 hours ago',
            image: boulderImg,
            fullDetails: [
                'Size: 2.4m diameter',
                'Position: 23.1°S, 11.2°W',
                'Composition: Anorthosite (highland material)',
                'Origin: Likely ejecta from Tycho impact',
                'Recommended actions: None required, monitor for movement'
            ]
        }
    ];

    // Set the first event as selected by default
    useEffect(() => {
        if (events.length > 0 && !selectedEvent) {
            setSelectedEvent(events[0]);
        }
    }, []);

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
                    <h4>Dashboard</h4>
                    <button style={styles.uploadButton} onClick={handleDatasetClick}>
                        Upload Dataset
                    </button>
                </div>
            </div>

            {/* Main layout */}
            <div style={styles.contentArea}>
                {/* Left: Moon panel */}
                <div style={styles.moonPanel}>
                    <div style={styles.statusIndicator}>
                        <span style={styles.statusDot}>🟢</span>
                        <span style={styles.statusText}>Chandran Base - Active Monitoring</span>
                    </div>

                    <div style={styles.moonCanvasContainer} onClick={handleMoonClick}>
                        <Canvas
                            camera={{ position: [0, 0, 5], fov: 45 }} // Adjusted FOV for smaller moon
                            style={styles.moonCanvas}
                        >
                            <ambientLight intensity={7.5} />
                            <pointLight position={[10, 10, 10]} intensity={1} />
                            <MoonModel />
                            <OrbitControls
                                enableZoom={false}
                                enablePan={false}
                                autoRotate
                                autoRotateSpeed={0.5}
                            />
                        </Canvas>
                    </div>

                    <div style={styles.alertsBox}>
                        <h3 style={styles.cardTitle}>Active Alerts</h3>
                        <div style={styles.alertItem}>
                            <span style={styles.alertLabel}>Landslides:</span>
                            <span style={styles.alertValue}>5 detected</span>
                        </div>
                        <div style={styles.alertItem}>
                            <span style={styles.alertLabel}>Boulders:</span>
                            <span style={styles.alertValue}>42 detected</span>
                        </div>
                        <div style={styles.alertItem}>
                            <span style={styles.alertLabel}>Seismic:</span>
                            <span style={styles.alertValue}>3 events</span>
                        </div>
                    </div>
                </div>

                {/* Middle: Events panel */}
                <div style={styles.eventsPanel}>
                    <h3 style={styles.panelTitle}>Recent Events</h3>
                    {events.map((event) => (
                        <div
                            key={event.id}
                            style={{
                                ...styles.eventCard,
                                borderLeft: `4px solid ${getSeverityColor(event.severity)}`
                            }}
                            onClick={() => handleCardClick(event.id)}
                        >
                            <div style={styles.eventHeader}>
                                <div>
                                    <h4 style={styles.eventTitle}>{event.title}</h4>
                                    <p style={styles.eventLocation}>{event.location}</p>
                                </div>
                                <span style={{
                                    ...styles.eventSeverity,
                                    backgroundColor: getSeverityColor(event.severity)
                                }}>
                                    {event.severity}
                                </span>
                            </div>

                            {expandedEvent === event.id && (
                                <div style={styles.eventDetails}>
                                    <img src={event.image} alt={event.type} style={styles.eventImage} />
                                    <p style={styles.eventText}>{event.details}</p>
                                    <p style={styles.eventTimestamp}>{event.timestamp}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right: Details panel */}
                <div style={styles.detailsPanel}>
                    <h3 style={styles.panelTitle}>
                        {selectedEvent ? `${selectedEvent.type} Details` : 'Detection Details'}
                    </h3>
                    <div style={styles.detectionInfo}>
                        {selectedEvent ? (
                            <>
                                <div style={styles.detailSection}>
                                    <h4 style={styles.detailHeader}>Location</h4>
                                    <p style={styles.detailText}>{selectedEvent.location}</p>
                                </div>
                                <div style={styles.detailSection}>
                                    <h4 style={styles.detailHeader}>Characteristics</h4>
                                    <ul style={styles.detailList}>
                                        {selectedEvent.fullDetails.map((detail, index) => (
                                            <li key={index} style={styles.detailListItem}>{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div style={styles.detailSection}>
                                    <h4 style={styles.detailHeader}>Detection Time</h4>
                                    <p style={styles.detailText}>{selectedEvent.timestamp}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <p style={styles.detectionText}>
                                    Landslides (LS) occur on the Moon primarily caused by impacts from space debris, meteor showers, and radiation exposure weakening regolith structure.
                                </p>
                                <p style={styles.detectionText}>
                                    Boulders (MB/BB) are common lunar surface features, often ejected from impact craters or exposed by seismic activity.
                                </p>
                                <div style={styles.statsContainer}>
                                    <div style={styles.statItem}>
                                        <span style={styles.statValue}>87%</span>
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
            </div>
        </div>
    );
};

const getSeverityColor = (severity) => {
    switch (severity) {
        case 'High': return '#ff4d4d';
        case 'Medium': return '#ffa64d';
        case 'Low': return '#4dffb8';
        default: return '#4d8cff';
    }
};

const glow = '#a9e2ff';
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
        padding: '20px 40px',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(1px)',
    },
    logo: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'white',
        margin: 0,
    },
    navRight: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
    },
    tabButton: {
        padding: '8px 16px',
        border: 'none',
        background: 'transparent',
        color: 'rgba(255, 255, 255, 0.7)',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
    },
    activeTabButton: {
        padding: '8px 16px',
        border: 'none',
        background: 'rgba(0, 216, 255, 0.2)',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        borderRadius: '4px',
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
        ':hover': {
            background: 'rgba(0, 216, 255, 0.1)',
        },
    },
    contentArea: {
        display: 'flex',
        padding: '20px',
        gap: '20px',
        height: 'calc(100vh - 80px)',
        position: 'relative',
        zIndex: 1,
    },
    moonPanel: {
        flex: 1,
        maxWidth: '400px',
        background: panelBg,
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(0px)',
    },
    statusIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
    },
    statusDot: {
        fontSize: '12px',
    },
    statusText: {
        fontSize: '14px',
        fontWeight: '500',
    },
    moonCanvasContainer: {
        height: '350px', // Fixed height
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '20px',
        cursor: 'pointer',
        position: 'relative',
    },
    moonCanvas: {
        width: '100%',
        height: '100%',
        background: 'transparent',
    },
    alertsBox: {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        padding: '15px',
    },
    panelTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '0 0 15px 0',
        color: glow,
        textShadow: `0 0 8px ${glow}33`,
    },
    alertItem: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
    },
    alertLabel: {
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    alertValue: {
        fontSize: '14px',
        fontWeight: 'bold',
    },
    eventsPanel: {
        flex: 1,
        maxWidth: '400px',
        background: panelBg,
        borderRadius: '12px',
        padding: '20px',
        overflowY: 'auto',
        backdropFilter: 'blur(0px)',
    },
    eventCard: {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 5px 15px rgba(0, 0, 0, 0.3)`,
        },
    },
    eventHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    eventTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        margin: '0 0 5px 0',
    },
    eventLocation: {
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.7)',
        margin: 0,
    },
    eventSeverity: {
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '4px 8px',
        borderRadius: '12px',
        color: 'black',
    },
    eventDetails: {
        marginTop: '10px',
        paddingTop: '10px',
        borderTop: `1px solid ${glow}33`,
    },
    eventImage: {
        width: '100%',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '6px',
        marginBottom: '10px',
    },
    eventText: {
        fontSize: '14px',
        margin: '0 0 10px 0',
        lineHeight: '1.5',
    },
    eventTimestamp: {
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)',
        margin: 0,
    },
    detailsPanel: {
        flex: 1,
        maxWidth: '400px',
        background: panelBg,
        borderRadius: '12px',
        padding: '20px',
        backdropFilter: 'blur(0px)',
    },
    detectionInfo: {
        height: 'calc(100% - 40px)',
        overflowY: 'auto',
    },
    detectionText: {
        fontSize: '14px',
        lineHeight: '1.6',
        margin: '0 0 15px 0',
    },
    statsContainer: {
        display: 'flex',
        gap: '15px',
        marginTop: '20px',
    },
    statItem: {
        flex: 1,
        background: 'rgba(0, 0, 0, 0.3)',
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
        color: 'rgba(255, 255, 255, 0.7)',
    },
    detailSection: {
        marginBottom: '20px',
    },
    detailHeader: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: glow,
        margin: '0 0 10px 0',
    },
    detailText: {
        fontSize: '14px',
        margin: '0 0 10px 0',
        lineHeight: '1.5',
    },
    detailList: {
        margin: '0',
        paddingLeft: '20px',
    },
    detailListItem: {
        fontSize: '14px',
        marginBottom: '8px',
        lineHeight: '1.4',
    },
};

export default Dashboard;