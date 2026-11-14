import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { SpacecraftComponent, RocketVehicle } from '../../types/game';
import { SpacecraftModel } from './SpacecraftModel';
import { createEarthTexture } from '../../utils/textures';

interface LaunchPad3DProps {
  rocket: RocketVehicle;
  components: Record<string, SpacecraftComponent>;
  rotations: Record<string, number>;
  launchStage: 'countdown' | 'ignition' | 'ascent' | 'staging' | 'fairing' | 'separation';
  progress: number; // 0 to 1
  graphicsPreset?: 'performance' | 'high' | 'ultra';
}

function Rocket3D({
  rocket,
  launchStage,
  progress,
  components,
  rotations,
}: {
  rocket: RocketVehicle;
  launchStage: string;
  progress: number;
  components: Record<string, SpacecraftComponent>;
  rotations: Record<string, number>;
}) {
  const rocketGroupRef = useRef<THREE.Group>(null);
  const fairingLeftRef = useRef<THREE.Group>(null);
  const fairingRightRef = useRef<THREE.Group>(null);
  const exhaustRef = useRef<THREE.Group>(null);

  // Compute altitude based on launch stage and progress
  useFrame(() => {
    if (!rocketGroupRef.current) return;

    if (launchStage === 'countdown') {
      rocketGroupRef.current.position.y = 0;
    } else if (launchStage === 'ignition') {
      // Subtle vibration
      rocketGroupRef.current.position.y = 0 + (Math.random() - 0.5) * 0.05;
      rocketGroupRef.current.position.x = (Math.random() - 0.5) * 0.03;
    } else if (launchStage === 'ascent') {
      // Rocket accelerates upward
      const y = Math.pow(progress, 1.8) * 45;
      rocketGroupRef.current.position.y = y;
      rocketGroupRef.current.position.x = 0;
    } else if (launchStage === 'staging') {
      // High atmosphere ascent
      rocketGroupRef.current.position.y = 45 + progress * 20;
    } else if (launchStage === 'fairing') {
      rocketGroupRef.current.position.y = 65 + progress * 10;
      // Clamshell fairings separate outward
      if (fairingLeftRef.current && fairingRightRef.current) {
        fairingLeftRef.current.position.x = -progress * 2.5;
        fairingLeftRef.current.rotation.z = progress * 0.4;
        fairingRightRef.current.position.x = progress * 2.5;
        fairingRightRef.current.rotation.z = -progress * 0.4;
      }
    } else if (launchStage === 'separation') {
      rocketGroupRef.current.position.y = 75;
      if (fairingLeftRef.current && fairingRightRef.current) {
        fairingLeftRef.current.position.x = -5.0;
        fairingRightRef.current.position.x = 5.0;
      }
    }

    // Engine exhaust flicker
    if (exhaustRef.current) {
      const isFiring = launchStage === 'ignition' || launchStage === 'ascent' || launchStage === 'staging';
      exhaustRef.current.visible = isFiring;
      if (isFiring) {
        const s = 0.8 + Math.random() * 0.4;
        exhaustRef.current.scale.set(s, s * 1.5, s);
      }
    }
  });

  const showFairing = launchStage !== 'separation';
  const showSecondStageOnly = launchStage === 'staging' || launchStage === 'fairing' || launchStage === 'separation';

  return (
    <group ref={rocketGroupRef}>
      {/* BOOSTER STAGE 1 (Hidden after staging) */}
      {!showSecondStageOnly && (
        <group position={[0, 4.0, 0]}>
          {/* Main Stage 1 Cylinder */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[1.2, 1.2, 8.0, 24]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Roll markings / Black interstage stripes */}
          <mesh position={[0, 3.2, 0]}>
            <cylinderGeometry args={[1.21, 1.21, 0.5, 24]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0, -2.8, 0]}>
            <cylinderGeometry args={[1.21, 1.21, 0.4, 24]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Grid Fins for control */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
            <group key={`fin-${i}`} position={[0, 3.4, 0]} rotation={[0, angle, 0]}>
              <mesh position={[1.4, 0, 0]}>
                <boxGeometry args={[0.5, 0.3, 0.05]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          ))}

          {/* Rocket engine cluster (4 bell nozzles) */}
          {[-0.45, 0.45].map((x, xi) =>
            [-0.45, 0.45].map((z, zi) => (
              <mesh key={`nozzle-${xi}-${zi}`} position={[x, -4.4, z]}>
                <coneGeometry args={[0.3, 0.9, 16, 1, true]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
              </mesh>
            ))
          )}

          {/* Engine Exhaust Flame Particles / Cone */}
          <group ref={exhaustRef} position={[0, -5.5, 0]}>
            <mesh rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[1.4, 4.2, 16]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.85} />
            </mesh>
            <mesh position={[0, -1.0, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.7, 2.5, 12]} />
              <meshBasicMaterial color="#fef08a" transparent opacity={0.95} />
            </mesh>
            <pointLight position={[0, -2, 0]} intensity={3.5} distance={15} color="#ea580c" />
          </group>
        </group>
      )}

      {/* SECOND STAGE & PAYLOAD SECTION */}
      <group position={[0, showSecondStageOnly ? 2.0 : 10.5, 0]}>
        {/* Stage 2 Fuel Tank & Engine */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[1.1, 1.1, 4.0, 24]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Spacecraft Payload inside or deployed */}
        <group position={[0, 3.2, 0]}>
          <SpacecraftModel
            components={components}
            rotations={rotations}
            scale={0.7}
            interactive={false}
          />
        </group>

        {/* PAYLOAD FAIRINGS (Clamshell jettison) */}
        {showFairing && (
          <group position={[0, 3.2, 0]}>
            {/* Left Fairing Half */}
            <group ref={fairingLeftRef} position={[0, 0, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.3, 1.25, 4.0, 16, 1, false, 0, Math.PI]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.4} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 2.4, 0]}>
                <coneGeometry args={[0.3, 1.0, 16, 1, false, 0, Math.PI]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.4} side={THREE.DoubleSide} />
              </mesh>
            </group>

            {/* Right Fairing Half */}
            <group ref={fairingRightRef} position={[0, 0, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.3, 1.25, 4.0, 16, 1, false, Math.PI, Math.PI]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.4} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 2.4, 0]}>
                <coneGeometry args={[0.3, 1.0, 16, 1, false, Math.PI, Math.PI]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.4} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        )}
      </group>
    </group>
  );
}

export const LaunchPad3D: React.FC<LaunchPad3DProps> = ({
  rocket,
  components,
  rotations,
  launchStage,
  progress,
  graphicsPreset = 'high',
}) => {
  const shadows = graphicsPreset !== 'performance';
  const earthTexture = useMemo(() => createEarthTexture(), []);

  // Dynamic camera elevation depending on flight stage
  const cameraPos: [number, number, number] = useMemo(() => {
    if (launchStage === 'countdown' || launchStage === 'ignition') return [12, 6, 14];
    if (launchStage === 'ascent') return [20, 25, 24];
    if (launchStage === 'staging') return [18, 55, 22];
    return [8, 78, 12];
  }, [launchStage]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: cameraPos, fov: 50 }}
        shadows={shadows}
        gl={{ antialias: graphicsPreset !== 'performance', powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[20, 30, 20]}
            intensity={1.5}
            castShadow={shadows}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          {/* Engine launch pad ground lighting */}
          {(launchStage === 'ignition' || launchStage === 'ascent') && (
            <pointLight position={[0, 2, 0]} intensity={5.0} distance={40} color="#ff7700" />
          )}

          {/* LAUNCH TOWER & PAD INFRASTRUCTURE (at ground level) */}
          <group position={[0, 0, 0]}>
            {/* Ground launch deck */}
            <mesh position={[0, -0.5, 0]} receiveShadow>
              <cylinderGeometry args={[25, 28, 1.0, 32]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>

            {/* Flame trench opening */}
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[3.2, 4.0, 1.2, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>

            {/* Umbilical Launch Support Tower */}
            <group position={[-4.5, 7.5, 0]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.8, 16.0, 1.8]} />
                <meshStandardMaterial color="#b91c1c" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Swing arm umbilical */}
              <mesh position={[1.8, 4.0, 0]}>
                <boxGeometry args={[2.0, 0.4, 0.4]} />
                <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          </group>

          {/* THE 3D ROCKET WITH FAIRING & DEPLOYMENT */}
          <Rocket3D
            rocket={rocket}
            launchStage={launchStage}
            progress={progress}
            components={components}
            rotations={rotations}
          />

          {/* Distant Earth sphere below as rocket reaches orbit */}
          {(launchStage === 'staging' || launchStage === 'fairing' || launchStage === 'separation') && (
            <mesh position={[0, -80, 0]} rotation={[0, 0.4, 0]}>
              <sphereGeometry args={[75, 48, 48]} />
              <meshStandardMaterial map={earthTexture} roughness={0.8} metalness={0.1} />
            </mesh>
          )}

          {/* Starfield */}
          <Stars
            radius={100}
            depth={50}
            count={graphicsPreset === 'ultra' ? 3000 : 1500}
            factor={3}
            fade
            speed={0.3}
          />

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={4}
            maxDistance={80}
            target={[0, launchStage === 'countdown' ? 6 : launchStage === 'ascent' ? 25 : 75, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
