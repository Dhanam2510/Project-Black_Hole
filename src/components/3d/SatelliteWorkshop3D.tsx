import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Grid } from '@react-three/drei';
import { SpacecraftModel } from './SpacecraftModel';
import { SpacecraftComponent } from '../../types/game';

interface SatelliteWorkshop3DProps {
  components: Record<string, SpacecraftComponent>;
  rotations: Record<string, number>;
  selectedSlot: string | null;
  onSlotClick: (slotId: string) => void;
  graphicsPreset?: 'performance' | 'high' | 'ultra';
}

export const SatelliteWorkshop3D: React.FC<SatelliteWorkshop3DProps> = ({
  components,
  rotations,
  selectedSlot,
  onSlotClick,
  graphicsPreset = 'high',
}) => {
  const shadows = graphicsPreset !== 'performance';
  const starCount = graphicsPreset === 'performance' ? 800 : graphicsPreset === 'high' ? 2000 : 4000;

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [3.5, 2.5, 4.0], fov: 45 }}
        shadows={shadows}
        gl={{ antialias: graphicsPreset !== 'performance', powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          {/* Ambient & Directional Lighting for Cleanroom / Space integration */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            castShadow={shadows}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          {/* Cyan edge rim light for high-tech aerospace aesthetic */}
          <pointLight position={[-4, 2, -4]} intensity={0.8} color="#00f0ff" />
          <pointLight position={[3, -2, 3]} intensity={0.5} color="#3b82f6" />

          {/* Cleanroom assembly platform grid */}
          <Grid
            renderOrder={-1}
            position={[0, -1.8, 0]}
            infiniteGrid
            cellSize={0.6}
            cellThickness={0.6}
            cellColor="#1e293b"
            sectionSize={3}
            sectionThickness={1.5}
            sectionColor="#00f0ff"
            fadeDistance={25}
          />

          {/* Hexagonal pedestal base */}
          <mesh position={[0, -1.85, 0]} receiveShadow>
            <cylinderGeometry args={[2.8, 3.2, 0.2, 6]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
          </mesh>

          {/* Glowing alignment ring on platform */}
          <mesh position={[0, -1.74, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.8, 1.88, 32]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} />
          </mesh>

          {/* The interactive modular spacecraft */}
          <SpacecraftModel
            components={components}
            rotations={rotations}
            selectedSlot={selectedSlot}
            onSlotClick={onSlotClick}
            scale={1.0}
            interactive={true}
          />

          {/* Distant stars visible through cleanroom observatory dome */}
          <Stars
            radius={60}
            depth={30}
            count={starCount}
            factor={3}
            saturation={0.5}
            fade
            speed={0.5}
          />

          <OrbitControls
            makeDefault
            minDistance={2.0}
            maxDistance={8.5}
            maxPolarAngle={Math.PI / 2 + 0.1}
            enableDamping
            dampingFactor={0.06}
          />
        </Suspense>
      </Canvas>

      {/* 3D Viewport Controls Overlay */}
      <div className="absolute top-3 left-3 bg-space-900/80 backdrop-blur border border-cyan-500/30 rounded px-2.5 py-1 text-xs text-cyan-300 font-mono flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        3D ASSEMBLY BAY // ORBIT CONTROLS ACTIVE [DRAG TO ROTATE, SCROLL TO ZOOM]
      </div>
    </div>
  );
};
