import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { MissionType } from '../../types/game';
import { createEarthTexture, createSunTexture } from '../../utils/textures';

interface PlanetarySurface3DProps {
  missionType: MissionType;
  subMode?: 'rover' | 'lander' | 'astronaut' | 'orbiter';
  roverState?: {
    x: number;
    z: number;
    heading: number;
    speed: number;
  };
  landerState?: {
    altitude: number;
    descentRate: number;
    throttle: number;
    landed: boolean;
  };
  astronautState?: {
    x: number;
    z: number;
    heading: number;
    isWalking: boolean;
    flagPlanted: boolean;
    alsepDeployed: boolean;
  };
  onInteract?: (action: string) => void;
  graphicsPreset?: 'performance' | 'high' | 'ultra';
}

// 1. 3D LUNAR / MARS ROVER MODEL
function RoverModel({
  position,
  rotationY,
  isMars = false,
}: {
  position: [number, number, number];
  rotationY: number;
  isMars?: boolean;
}) {
  const wheelColor = '#1e293b';
  const bodyColor = isMars ? '#cbd5e1' : '#f8fafc';

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Rover Main Chassis */}
      <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.2, 0.4, 0.8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Gold Foil Avionics Cover */}
      <mesh position={[0, 0.66, 0]}>
        <boxGeometry args={[1.0, 0.05, 0.65]} />
        <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Mast Camera (Pancam / Navcam) */}
      <group position={[0.4, 0.7, 0.25]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        {/* Stereo Camera Head */}
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.22, 0.12, 0.15]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        {/* Camera lenses */}
        <mesh position={[0.06, 0.42, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.03, 12]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
        <mesh position={[-0.06, 0.42, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.03, 12]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
      </group>

      {/* Robotic Arm with Rock Drill */}
      <group position={[0.5, 0.35, -0.25]}>
        <mesh rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        <mesh position={[0.4, -0.15, 0]}>
          <boxGeometry args={[0.15, 0.1, 0.1]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* High-Gain Antenna Dish */}
      <group position={[-0.35, 0.7, -0.2]}>
        <mesh rotation={[-0.4, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.05, 0.08, 12]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} />
        </mesh>
      </group>

      {/* 4 Rocker-Bogie Heavy Wheels with Cleats */}
      {[
        [-0.55, 0.2, 0.55],
        [0.55, 0.2, 0.55],
        [-0.55, 0.2, -0.55],
        [0.55, 0.2, -0.55],
      ].map((pos, idx) => (
        <group key={`wheel-${idx}`} position={pos as [number, number, number]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 16]} />
            <meshStandardMaterial color={wheelColor} metalness={0.4} roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.17, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Headlight Beams */}
      <pointLight position={[0.6, 0.5, 0]} intensity={1.5} distance={12} color="#fef08a" />
    </group>
  );
}

// 2. 3D LUNAR LANDER MODEL
function LanderModel({ altitude, landed }: { altitude: number; landed: boolean }) {
  const engineFlameRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (engineFlameRef.current) {
      if (landed) {
        engineFlameRef.current.visible = false;
      } else {
        engineFlameRef.current.visible = true;
        const s = 0.8 + Math.random() * 0.4;
        engineFlameRef.current.scale.set(s, s * 1.5, s);
      }
    }
  });

  return (
    <group position={[0, altitude, 0]}>
      {/* Descent Stage Octagonal Core */}
      <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[1.4, 1.6, 1.2, 8]} />
        <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Ascent Stage Cabin */}
      <mesh castShadow position={[0, 1.9, 0]}>
        <cylinderGeometry args={[1.0, 1.2, 1.1, 8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Windows & EVA Ingress Hatch */}
      <mesh position={[0.65, 2.0, 0.65]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.05]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>

      {/* 4 Articulated Landing Legs with Footpads */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <group key={`leg-${i}`} rotation={[0, angle, 0]}>
          {/* Upper Strut */}
          <mesh position={[1.4, 0.4, 0]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.06, 0.06, 1.4, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
          </mesh>
          {/* Circular Footpad */}
          <mesh position={[1.8, landed ? 0.05 : 0.0, 0]} receiveShadow>
            <cylinderGeometry args={[0.3, 0.35, 0.06, 12]} />
            <meshStandardMaterial color="#eab308" metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Descent Engine Bell Nozzle */}
      <mesh position={[0, 0.1, 0]}>
        <coneGeometry args={[0.45, 0.7, 16, 1, true]} />
        <meshStandardMaterial color="#334155" metalness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Descent Engine Flame */}
      <mesh ref={engineFlameRef} position={[0, -0.7, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.4, 1.5, 12]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// 3. 3D ASTRONAUT MODEL (Lunar EVA Spacesuit)
function AstronautModel({
  position,
  rotationY,
  isWalking,
}: {
  position: [number, number, number];
  rotationY: number;
  isWalking: boolean;
}) {
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (isWalking) {
      const t = clock.getElapsedTime() * 6;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t) * 0.4;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(t) * 0.4;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.sin(t) * 0.3;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t) * 0.3;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Torso Suit */}
      <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.35]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>

      {/* Life Support Backpack (PLSS) */}
      <mesh position={[0, 0.88, -0.26]} castShadow>
        <boxGeometry args={[0.45, 0.55, 0.22]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Backpack Comms Antenna */}
      <mesh position={[0.15, 1.25, -0.26]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 6]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Helmet & Gold Visor */}
      <group position={[0, 1.35, 0]}>
        {/* White Helmet sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {/* Reflective Gold Visor */}
        <mesh position={[0, 0, 0.14]} rotation={[0.2, 0, 0]}>
          <sphereGeometry args={[0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.16, 0.55, 0]}>
        <mesh castShadow position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.55, 8]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
        </mesh>
        {/* Lunar Boot */}
        <mesh position={[0, -0.55, 0.05]}>
          <boxGeometry args={[0.14, 0.12, 0.24]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.16, 0.55, 0]}>
        <mesh castShadow position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.55, 8]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
        </mesh>
        {/* Lunar Boot */}
        <mesh position={[0, -0.55, 0.05]}>
          <boxGeometry args={[0.14, 0.12, 0.24]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.35, 1.05, 0]}>
        <mesh castShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.45, 8]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.35, 1.05, 0]}>
        <mesh castShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.45, 8]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>
    </group>
  );
}

// 4. LUNAR SCIENCE HARDWARE (FLAG & ALSEP STATION)
function SurfaceDeployables({
  flagPlanted,
  alsepDeployed,
}: {
  flagPlanted: boolean;
  alsepDeployed: boolean;
}) {
  return (
    <group>
      {/* Mission Commemorative Flag */}
      {flagPlanted && (
        <group position={[2.5, 0, 1.5]}>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
          <mesh position={[0.35, 1.5, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.7, 0.45, 0.01]} />
            <meshStandardMaterial color="#00f0ff" roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* ALSEP Science Station */}
      {alsepDeployed && (
        <group position={[-2.5, 0, -1.5]}>
          {/* Central Transmitter Station */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.35, 0.4, 0.5, 8]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} />
          </mesh>
          {/* Seismometer Pod */}
          <mesh position={[0.8, 0.1, 0.4]}>
            <cylinderGeometry args={[0.15, 0.2, 0.2, 8]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Radioisotope Thermoelectric Generator (RTG) */}
          <mesh position={[-0.8, 0.2, -0.3]}>
            <cylinderGeometry args={[0.15, 0.15, 0.4, 6]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 5. SUN CORONAL PROBE SCENE
function SunProbeScene() {
  const sunTexture = useMemo(() => createSunTexture(), []);
  const probeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (probeRef.current) {
      const t = clock.getElapsedTime();
      probeRef.current.position.y = Math.sin(t * 0.8) * 0.15;
    }
  });

  return (
    <group>
      {/* Massive Sun Sphere Dominating View */}
      <mesh position={[0, 0, -18]}>
        <sphereGeometry args={[14, 48, 48]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>
      {/* Corona Halo */}
      <mesh position={[0, 0, -18]}>
        <sphereGeometry args={[16, 32, 32]} />
        <meshBasicMaterial color="#ff5500" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>
      <pointLight position={[0, 0, -14]} intensity={4.5} distance={50} color="#ffedd5" />

      {/* Extreme Thermal Heat Shield & Probe */}
      <group ref={probeRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        {/* Forward Carbon-Composite Shield facing Sun */}
        <mesh position={[0, 0, -1.2]}>
          <cylinderGeometry args={[1.8, 1.7, 0.2, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        {/* Probe Core safely behind the heat shield in the umbra */}
        <mesh position={[0, 0, -0.4]}>
          <boxGeometry args={[1.0, 1.0, 1.2]} />
          <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Plasma Wave Antennas trailing back */}
        <mesh position={[0.7, 0.4, 0.6]} rotation={[0.4, 0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.8, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
        <mesh position={[-0.7, 0.4, 0.6]} rotation={[0.4, -0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.8, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

export const PlanetarySurface3D: React.FC<PlanetarySurface3DProps> = ({
  missionType,
  subMode = 'rover',
  roverState = { x: 0, z: 0, heading: 0, speed: 0 },
  landerState = { altitude: 0, descentRate: 0, throttle: 0, landed: true },
  astronautState = { x: 0, z: 0, heading: 0, isWalking: false, flagPlanted: false, alsepDeployed: false },
  graphicsPreset = 'high',
}) => {
  const isMars = missionType === 'mars';
  const isMoon = missionType === 'moon';
  const isSun = missionType === 'sun';
  const earthTexture = useMemo(() => createEarthTexture(), []);

  // Sky and terrain colors
  const groundColor = isMars ? '#993d1f' : '#6b7280';
  const fogColor = isMars ? '#7c2d12' : '#000000';

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 4.5, 7.5], fov: 50 }}
        shadows={graphicsPreset !== 'performance'}
        gl={{ antialias: graphicsPreset !== 'performance', powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          {/* Surface Lighting */}
          <ambientLight intensity={isMars ? 0.4 : 0.15} />
          <directionalLight
            position={[15, 20, 10]}
            intensity={isMars ? 1.4 : 2.2}
            castShadow={graphicsPreset !== 'performance'}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          {isMars && <fog attach="fog" args={[fogColor, 20, 90]} />}

          {/* 1. TERRAIN (LUNAR OR MARTIAN REGOLITH) */}
          {!isSun && (
            <group>
              {/* Planetary ground surface */}
              <mesh position={[0, -0.05, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[120, 120, 32, 32]} />
                <meshStandardMaterial
                  color={groundColor}
                  roughness={0.95}
                  metalness={0.05}
                />
              </mesh>

              {/* Surface Boulders & Crater rims */}
              {[
                [-6, 0.4, -8, 1.2],
                [8, 0.3, -5, 0.8],
                [-12, 0.6, 10, 1.8],
                [14, 0.5, 12, 1.4],
                [4, 0.2, 7, 0.6],
                [-4, 0.25, 5, 0.7],
              ].map(([bx, by, bz, br], i) => (
                <mesh key={`boulder-${i}`} position={[bx, by, bz]} castShadow receiveShadow>
                  <dodecahedronGeometry args={[br, 1]} />
                  <meshStandardMaterial
                    color={isMars ? '#6a2a16' : '#4b5563'}
                    roughness={0.9}
                  />
                </mesh>
              ))}

              {/* Blue Marble Earth in Moon's black sky */}
              {isMoon && (
                <group position={[-25, 30, -50]}>
                  <mesh>
                    <sphereGeometry args={[4.5, 32, 32]} />
                    <meshStandardMaterial map={earthTexture} roughness={0.7} />
                  </mesh>
                  <mesh>
                    <sphereGeometry args={[4.7, 24, 24]} />
                    <meshBasicMaterial color="#00f0ff" transparent opacity={0.2} side={THREE.BackSide} />
                  </mesh>
                </group>
              )}
            </group>
          )}

          {/* 2. MODE-SPECIFIC ACTIVE ENTITY */}
          {isSun ? (
            <SunProbeScene />
          ) : subMode === 'rover' ? (
            <RoverModel
              position={[roverState.x, 0, roverState.z]}
              rotationY={roverState.heading}
              isMars={isMars}
            />
          ) : subMode === 'lander' ? (
            <LanderModel
              altitude={landerState.altitude}
              landed={landerState.landed}
            />
          ) : subMode === 'astronaut' ? (
            <group>
              <AstronautModel
                position={[astronautState.x, 0, astronautState.z]}
                rotationY={astronautState.heading}
                isWalking={astronautState.isWalking}
              />
              <SurfaceDeployables
                flagPlanted={astronautState.flagPlanted}
                alsepDeployed={astronautState.alsepDeployed}
              />
            </group>
          ) : null}

          {/* Stars */}
          {!isMars && (
            <Stars
              radius={80}
              depth={30}
              count={graphicsPreset === 'ultra' ? 3000 : 1500}
              factor={3}
              fade
              speed={0.1}
            />
          )}

          <OrbitControls
            makeDefault
            minDistance={2.5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2 - 0.05}
            enableDamping
            dampingFactor={0.06}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
