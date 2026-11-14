import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { SpacecraftModel } from './SpacecraftModel';
import { COMPONENT_CATALOG } from '../../data/components';
import { createEarthTexture } from '../../utils/textures';

interface MainScene3DProps {
  graphicsPreset?: 'performance' | 'high' | 'ultra';
}

function EarthWithAtmosphere() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const earthTexture = useMemo(() => createEarthTexture(), []);

  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.04;
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.055;
  });

  return (
    <group position={[3.2, -0.6, -2]}>
      {/* Earth Body */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[2.8, 48, 48]} />
        <meshStandardMaterial map={earthTexture} roughness={0.65} metalness={0.15} />
      </mesh>

      {/* Atmospheric Rayleigh scattering glow */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[2.92, 32, 32]} />
        <meshStandardMaterial
          color="#00f0ff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function FloatingSpacecraft() {
  const craftRef = useRef<THREE.Group>(null);

  // Pre-assembled showcase satellite for the main menu
  const showcaseComponents = useMemo(() => {
    return {
      core: COMPONENT_CATALOG.find((c) => c.id === 'bus-hex-standard')!,
      leftWing: COMPONENT_CATALOG.find((c) => c.id === 'solar-deployable-wings')!,
      rightWing: COMPONENT_CATALOG.find((c) => c.id === 'solar-deployable-wings')!,
      topDish: COMPONENT_CATALOG.find((c) => c.id === 'antenna-ka-parabolic-dish')!,
      bottomOptics: COMPONENT_CATALOG.find((c) => c.id === 'cam-multispectral-earth')!,
      frontBay: COMPONENT_CATALOG.find((c) => c.id === 'comp-rad-hardened-750')!,
      rearBay: COMPONENT_CATALOG.find((c) => c.id === 'nav-star-tracker-dual')!,
      leftSensor: COMPONENT_CATALOG.find((c) => c.id === 'sensor-atmospheric-sounder')!,
      rightSensor: COMPONENT_CATALOG.find((c) => c.id === 'sensor-asteroid-neo-surveyor')!,
    };
  }, []);

  useFrame(({ clock }) => {
    if (!craftRef.current) return;
    const t = clock.getElapsedTime();
    craftRef.current.rotation.y = t * 0.15;
    craftRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    craftRef.current.position.y = Math.sin(t * 0.5) * 0.15;
  });

  return (
    <group ref={craftRef} position={[-1.8, 0.2, 1.2]} rotation={[0.2, -0.6, 0.1]}>
      <SpacecraftModel
        components={showcaseComponents}
        scale={0.9}
        interactive={false}
      />
    </group>
  );
}

export const MainScene3D: React.FC<MainScene3DProps> = ({ graphicsPreset = 'high' }) => {
  const shadows = graphicsPreset !== 'performance';
  const starCount = graphicsPreset === 'ultra' ? 3500 : graphicsPreset === 'high' ? 2000 : 800;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 48 }}
        shadows={shadows}
        gl={{ antialias: graphicsPreset !== 'performance', powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.25} />
          {/* Main Sunlight shining on Earth & Spacecraft */}
          <directionalLight
            position={[-8, 4, 6]}
            intensity={2.2}
            color="#fff8eb"
            castShadow={shadows}
          />
          {/* Subtle blue earthshine reflected light */}
          <pointLight position={[3, 0, 1]} intensity={1.2} color="#00f0ff" />

          {/* Rotating Animated Earth */}
          <EarthWithAtmosphere />

          {/* Floating High-Tech Spacecraft */}
          <FloatingSpacecraft />

          {/* Stars & Galaxy Particles */}
          <Stars
            radius={80}
            depth={40}
            count={starCount}
            factor={3}
            saturation={0.5}
            fade
            speed={0.4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
