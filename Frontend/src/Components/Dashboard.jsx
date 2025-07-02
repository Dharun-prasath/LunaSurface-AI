import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';

function Moon() {
    const moonRef = useRef();
    const [moonTexture, moonBump] = useTexture([
        'https://threejs.org/examples/textures/planets/moon_1024.jpg',
        'https://threejs.org/examples/textures/planets/moon_1024.jpg'
    ]);

    useFrame(() => {
        moonRef.current.rotation.y += 0.002;
    });

    return (
        <mesh ref={moonRef}>
            <sphereGeometry args={[1.5, 64, 64]} />
            <meshStandardMaterial
                map={moonTexture}
                bumpMap={moonBump}
                bumpScale={0.05}
                roughness={0.8}
                metalness={0.1}
            />
        </mesh>
    );
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <Moon />
            <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={0.5}
            />
        </>
    );
}

const Dashboard = () => {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
        }}>
            <Canvas
                style={{
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                }}
                camera={{ position: [0, 0, 5], fov: 50 }}
            >
                <Scene />
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    enableRotate={true}
                    zoomSpeed={0.6}
                    rotateSpeed={0.4}
                    minDistance={3}
                    maxDistance={8}
                />
            </Canvas>
            
            <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '15px 30px',
                borderRadius: '30px',
                color: 'white',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.2rem',
                fontWeight: '500',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            }}>
                Lunar Surface Analysis Model
            </div>
            
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '10px 15px',
                borderRadius: '10px',
                color: 'white',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.9rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#4CAF50',
                    }}></div>
                    <span>Model Active</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;