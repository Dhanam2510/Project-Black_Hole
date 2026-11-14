import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { MissionType, SpacecraftComponent } from '../../types/game';
import { SpacecraftModel } from './SpacecraftModel';
import {
  createEarthTexture,
  createMoonTexture,
  createMarsTexture,
  createSunTexture,
} from '../../utils/textures';

interface OrbitSim3DProps {
  missionType: MissionType;
  components: Record<string, SpacecraftComponent>;
  simSpeed: number; // 0 (paused), 1x, 5x, 25x, 100x
  isPaused: boolean;
  transitProgress: number; // 0 to 1
  onFocusChange?: (target: 'earth' | 'moon' | 'mars' | 'sun' | 'craft') => void;
  graphicsPreset?: 'performance' | 'high' | 'ultra';
}

function SolarSystemScene({
  missionType,
  components,
  simSpeed,
  isPaused,
  transitProgress,
}: {
  missionType: MissionType;
  components: Record<string, SpacecraftComponent>;
  simSpeed: number;
  isPaused: boolean;
  transitProgress: number;
}) {
  const sunTexture = useMemo(() => createSunTexture(), []);
  const earthTexture = useMemo(() => createEarthTexture(), []);
  const moonTexture = useMemo(() => createMoonTexture(), []);
  const marsTexture = useMemo(() => createMarsTexture(), []);

  const earthGroupRef = useRef<THREE.Group>(null);
  const moonGroupRef = useRef<THREE.Group>(null);
  const marsGroupRef = useRef<THREE.Group>(null);
  const spacecraftRef = useRef<THREE.Group>(null);
  const sunMeshRef = useRef<THREE.Mesh>(null);

  // Animate planetary orbits and spacecraft transit
  useFrame((_, delta) => {
    const timeDelta = isPaused ? 0 : delta * simSpeed;

    if (sunMeshRef.current) {
      sunMeshRef.current.rotation.y += timeDelta * 0.05;
    }

    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += timeDelta * 0.15;
    }

    if (moonGroupRef.current) {
      moonGroupRef.current.rotation.y += timeDelta * 0.4;
    }

    if (marsGroupRef.current) {
      marsGroupRef.current.rotation.y += timeDelta * 0.1;
    }

    // Spacecraft trajectory positioning based on mission
    if (spacecraftRef.current) {
      if (missionType === 'earth') {
        // Spacecraft in circular Low Earth Orbit
        const angle = transitProgress * Math.PI * 4;
        const r = 2.4;
        spacecraftRef.current.position.set(
          8 + Math.cos(angle) * r,
          Math.sin(angle * 1.5) * 0.6,
          Math.sin(angle) * r
        );
        spacecraftRef.current.rotation.y = angle + Math.PI / 2;
      } else if (missionType === 'moon') {
        // Trans-lunar trajectory from Earth (x: 8) to Moon (x: 14)
        const t = transitProgress;
        const startX = 8, startZ = 0;
        const targetX = 14, targetZ = 3;
        const curX = startX + (targetX - startX) * t;
        const curZ = startZ + (targetZ - startZ) * t + Math.sin(t * Math.PI) * 2.0;
        spacecraftRef.current.position.set(curX, Math.sin(t * Math.PI) * 0.5, curZ);
      } else if (missionType === 'mars') {
        // Interplanetary Hohmann transfer ellipse from Earth orbit to Mars orbit
        const t = transitProgress;
        const angle = 0.5 + t * 1.8;
        const r = 8 + t * 9;
        spacecraftRef.current.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      } else if (missionType === 'sun') {
        // Inward spiral perihelion trajectory toward the Sun
        const t = transitProgress;
        const r = 8 - t * 5.2; // Closest approach 2.8 units from Sun
        const angle = t * 3.5;
        spacecraftRef.current.position.set(Math.cos(angle) * r, Math.sin(angle * 0.5) * 0.3, Math.sin(angle) * r);
        // Ensure spacecraft heat shield faces directly toward the Sun at [0,0,0]
        spacecraftRef.current.lookAt(0, 0, 0);
      }
    }
  });

  // Elliptical trajectory orbital line points
  const trajectoryPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    if (missionType === 'earth') {
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(8 + Math.cos(theta) * 2.4, 0, Math.sin(theta) * 2.4));
      }
    } else if (missionType === 'moon') {
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const x = 8 + (14 - 8) * t;
        const z = 0 + (3 - 0) * t + Math.sin(t * Math.PI) * 2.0;
        pts.push(new THREE.Vector3(x, 0, z));
      }
    } else if (missionType === 'mars') {
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const angle = 0.5 + t * 1.8;
        const r = 8 + t * 9;
        pts.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
      }
    } else if (missionType === 'sun') {
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const r = 8 - t * 5.2;
        const angle = t * 3.5;
        pts.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
      }
    }
    return pts;
  }, [missionType]);

  const trajectoryGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(trajectoryPoints);
  }, [trajectoryPoints]);

  const trajectoryLine = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: '#00f0ff', linewidth: 2, transparent: true, opacity: 0.85 });
    return new THREE.Line(trajectoryGeometry, mat);
  }, [trajectoryGeometry]);

  return (
    <group>
      {/* 1. CENTRAL SUN */}
      <group position={[0, 0, 0]}>
        <mesh ref={sunMeshRef}>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshBasicMaterial map={sunTexture} />
        </mesh>
        {/* Pulsating solar corona glow */}
        <mesh>
          <sphereGeometry args={[3.0, 24, 24]} />
          <meshBasicMaterial color="#ff7700" transparent opacity={0.25} side={THREE.BackSide} />
        </mesh>
        <pointLight position={[0, 0, 0]} intensity={2.5} distance={100} color="#fff1cc" />
        <Text position={[0, 3.4, 0]} fontSize={0.6} color="#fbbf24" anchorX="center" anchorY="middle">
          SOLAR CORE
        </Text>
      </group>

      {/* Planetary Orbit Track Lines */}
      {/* Earth Orbit Ring (R = 8) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.95, 8.05, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Mars Orbit Ring (R = 17) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[16.95, 17.05, 64]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. EARTH & MOON SYSTEM */}
      <group ref={earthGroupRef} position={[8, 0, 0]}>
        {/* Earth sphere */}
        <mesh>
          <sphereGeometry args={[1.1, 32, 32]} />
          <meshStandardMaterial map={earthTexture} roughness={0.7} metalness={0.1} />
        </mesh>
        {/* Blue atmosphere scattering halo */}
        <mesh>
          <sphereGeometry args={[1.18, 24, 24]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.18} side={THREE.BackSide} />
        </mesh>
        <Text position={[0, 1.8, 0]} fontSize={0.45} color="#38bdf8" anchorX="center" anchorY="middle">
          EARTH
        </Text>

        {/* Moon orbiting Earth */}
        <group ref={moonGroupRef} position={[2.8, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.35, 24, 24]} />
            <meshStandardMaterial map={moonTexture} roughness={0.9} />
          </mesh>
          <Text position={[0, 0.65, 0]} fontSize={0.3} color="#cbd5e1" anchorX="center" anchorY="middle">
            MOON
          </Text>
        </group>
      </group>

      {/* 3. MARS */}
      <group ref={marsGroupRef} position={[15, 0, 8]}>
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial map={marsTexture} roughness={0.8} />
        </mesh>
        {/* Thin dusty red atmosphere */}
        <mesh>
          <sphereGeometry args={[0.76, 24, 24]} />
          <meshBasicMaterial color="#ea580c" transparent opacity={0.2} side={THREE.BackSide} />
        </mesh>
        <Text position={[0, 1.3, 0]} fontSize={0.4} color="#f97316" anchorX="center" anchorY="middle">
          MARS
        </Text>
      </group>

      {/* 4. ACTIVE MISSION TRAJECTORY LINE */}
      <primitive object={trajectoryLine} />

      {/* 5. THE ACTIVE SPACECRAFT MODEL */}
      <group ref={spacecraftRef} position={[8, 0, 0]}>
        <SpacecraftModel
          components={components}
          scale={0.45}
          interactive={false}
        />
        {/* Cyan spacecraft position beacon beacon */}
        <pointLight position={[0, 0.5, 0]} intensity={1.5} distance={3} color="#00f0ff" />
        <mesh position={[0, 0.9, 0]}>
          <octahedronGeometry args={[0.12]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
        <Text position={[0, 1.4, 0]} fontSize={0.35} color="#00f0ff" anchorX="center" anchorY="middle">
          SC-1 PIONEER
        </Text>
      </group>
    </group>
  );
}

export const OrbitSim3D: React.FC<OrbitSim3DProps> = ({
  missionType,
  components,
  simSpeed,
  isPaused,
  transitProgress,
  graphicsPreset = 'high',
}) => {
  const cameraTarget: [number, number, number] = useMemo(() => {
    if (missionType === 'earth') return [8, 0, 0];
    if (missionType === 'moon') return [10, 0, 1];
    if (missionType === 'mars') return [12, 0, 4];
    return [0, 0, 0]; // Sun
  }, [missionType]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [cameraTarget[0] + 12, 14, cameraTarget[2] + 14], fov: 45 }}
        gl={{ antialias: graphicsPreset !== 'performance', powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.25} />

          <SolarSystemScene
            missionType={missionType}
            components={components}
            simSpeed={simSpeed}
            isPaused={isPaused}
            transitProgress={transitProgress}
          />

          <Stars
            radius={80}
            depth={40}
            count={graphicsPreset === 'ultra' ? 3500 : 1500}
            factor={3}
            fade
            speed={0.2}
          />

          <OrbitControls
            makeDefault
            target={cameraTarget}
            minDistance={4}
            maxDistance={50}
            enableDamping
            dampingFactor={0.06}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
