import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SpacecraftComponent } from '../../types/game';
import { createSolarPanelTexture } from '../../utils/textures';

interface SpacecraftModelProps {
  components: Record<string, SpacecraftComponent>;
  rotations?: Record<string, number>;
  selectedSlot?: string | null;
  onSlotClick?: (slotId: string) => void;
  scale?: number;
  highlightSlot?: string | null;
  interactive?: boolean;
}

export const SpacecraftModel: React.FC<SpacecraftModelProps> = ({
  components,
  rotations = {},
  selectedSlot,
  onSlotClick,
  scale = 1,
  highlightSlot,
  interactive = true,
}) => {
  const solarTexture = useMemo(() => createSolarPanelTexture(), []);

  // Check what components are placed
  const coreComp = components['core'];
  const leftWingComp = components['leftWing'];
  const rightWingComp = components['rightWing'];
  const topDishComp = components['topDish'];
  const bottomOpticsComp = components['bottomOptics'];
  const frontBayComp = components['frontBay'];
  const rearBayComp = components['rearBay'];
  const leftSensorComp = components['leftSensor'];
  const rightSensorComp = components['rightSensor'];

  const handlePointerDown = (slotId: string, e: { stopPropagation: () => void }) => {
    if (!interactive) return;
    e.stopPropagation();
    onSlotClick?.(slotId);
  };

  const getSlotColor = (slotId: string) => {
    if (selectedSlot === slotId) return '#00f0ff';
    if (highlightSlot === slotId) return '#10b981';
    return '#38bdf8';
  };

  return (
    <group scale={[scale, scale, scale]}>
      {/* 1. CENTRAL BUS / CHASSIS (SLOT: core) */}
      <group
        position={[0, 0, 0]}
        rotation={[0, ((rotations['core'] || 0) * Math.PI) / 180, 0]}
        onClick={(e) => handlePointerDown('core', e)}
      >
        {coreComp ? (
          <group>
            {/* Main bus body */}
            {coreComp.modelType === 'bus-cubesat' ? (
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.0, 1.8, 1.0]} />
                <meshStandardMaterial
                  color="#e2e8f0"
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
            ) : coreComp.modelType === 'bus-hex' ? (
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[1.1, 1.1, 2.0, 6]} />
                <meshStandardMaterial
                  color="#cbd5e1"
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
            ) : (
              /* Heavy Science Bus */
              <group>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[1.6, 2.2, 1.6]} />
                  <meshStandardMaterial
                    color="#94a3b8"
                    metalness={0.75}
                    roughness={0.25}
                  />
                </mesh>
                {/* Structural ribs */}
                <mesh position={[0, 0, 0.82]}>
                  <boxGeometry args={[1.4, 2.0, 0.05]} />
                  <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
                </mesh>
              </group>
            )}

            {/* Gold foil MLI thermal blanket layer */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.02, 1.2, 1.02]} />
              <meshStandardMaterial
                color="#eab308"
                metalness={0.95}
                roughness={0.15}
              />
            </mesh>

            {/* Carbon-Composite Extreme Solar Heat Shield (if installed) */}
            {coreComp.id === 'thermal-sun-shield-extreme' || Object.values(components).some(c => c.id === 'thermal-sun-shield-extreme') ? (
              <group position={[0, 1.35, 0]}>
                {/* Large parabolic curved thermal shield */}
                <mesh castShadow>
                  <cylinderGeometry args={[2.2, 2.0, 0.2, 32]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    roughness={0.9}
                    metalness={0.1}
                  />
                </mesh>
                {/* Backside cooling truss */}
                <mesh position={[0, -0.15, 0]}>
                  <cylinderGeometry args={[0.8, 1.1, 0.15, 12]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
                </mesh>
              </group>
            ) : null}

            {/* Hydrazine RCS Thruster pods on corners */}
            {[-0.55, 0.55].map((x, xi) =>
              [-0.55, 0.55].map((z, zi) => (
                <mesh key={`rcs-${xi}-${zi}`} position={[x, -0.8, z]}>
                  <boxGeometry args={[0.15, 0.15, 0.15]} />
                  <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.3} />
                </mesh>
              ))
            )}

            {/* Main propulsion engine at bottom */}
            <group position={[0, -1.05, 0]}>
              <mesh castShadow>
                <coneGeometry args={[0.35, 0.6, 16, 1, true]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
              </mesh>
              {/* Inner nozzle glow */}
              <mesh position={[0, -0.1, 0]}>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
            </group>
          </group>
        ) : (
          /* Empty Core Slot Hologram Marker */
          <mesh castShadow>
            <boxGeometry args={[1.2, 1.8, 1.2]} />
            <meshStandardMaterial
              color={getSlotColor('core')}
              wireframe
              transparent
              opacity={0.6}
            />
          </mesh>
        )}
      </group>

      {/* 2. LEFT WING / SOLAR PANEL (SLOT: leftWing) */}
      <group
        position={[-1.4, 0, 0]}
        rotation={[0, ((rotations['leftWing'] || 0) * Math.PI) / 180, 0]}
        onClick={(e) => handlePointerDown('leftWing', e)}
      >
        {leftWingComp ? (
          <group>
            {/* Wing boom strut */}
            <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Solar Panel Wing */}
            <mesh position={[-0.8, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 1.2, 0.04]} />
              <meshStandardMaterial
                map={solarTexture}
                color="#1d4ed8"
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>
            {/* Panel backplate */}
            <mesh position={[-0.8, 0, -0.025]}>
              <boxGeometry args={[1.82, 1.22, 0.01]} />
              <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ) : (
          <mesh position={[-0.5, 0, 0]}>
            <boxGeometry args={[1.4, 1.0, 0.04]} />
            <meshStandardMaterial
              color={getSlotColor('leftWing')}
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>
        )}
      </group>

      {/* 3. RIGHT WING / SOLAR PANEL (SLOT: rightWing) */}
      <group
        position={[1.4, 0, 0]}
        rotation={[0, ((rotations['rightWing'] || 0) * Math.PI) / 180, 0]}
        onClick={(e) => handlePointerDown('rightWing', e)}
      >
        {rightWingComp ? (
          <group>
            {/* Wing boom strut */}
            <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Solar Panel Wing */}
            <mesh position={[0.8, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 1.2, 0.04]} />
              <meshStandardMaterial
                map={solarTexture}
                color="#1d4ed8"
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>
            {/* Panel backplate */}
            <mesh position={[0.8, 0, -0.025]}>
              <boxGeometry args={[1.82, 1.22, 0.01]} />
              <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ) : (
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[1.4, 1.0, 0.04]} />
            <meshStandardMaterial
              color={getSlotColor('rightWing')}
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>
        )}
      </group>

      {/* 4. TOP ANTENNA DISH (SLOT: topDish) */}
      <group
        position={[0, 1.2, 0]}
        rotation={[0, ((rotations['topDish'] || 0) * Math.PI) / 180, 0]}
        onClick={(e) => handlePointerDown('topDish', e)}
      >
        {topDishComp ? (
          <group>
            {/* Gimbal mount pedestal */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.12, 0.18, 0.25, 12]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Dish or horn antenna */}
            {topDishComp.modelType === 'antenna-dish' ? (
              <group position={[0, 0.4, 0]} rotation={[0.4, 0, 0]}>
                {/* Parabolic reflector dish */}
                <mesh castShadow receiveShadow>
                  <sphereGeometry args={[0.7, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
                  <meshStandardMaterial
                    color="#f59e0b"
                    metalness={0.9}
                    roughness={0.15}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                {/* Feed horn sub-reflector & tripod struts */}
                <mesh position={[0, 0.35, 0]}>
                  <coneGeometry args={[0.08, 0.2, 8]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
                </mesh>
              </group>
            ) : (
              /* Horn or Patch antenna */
              <group position={[0, 0.3, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.25, 0.1, 0.4, 8]} />
                  <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
                </mesh>
              </group>
            )}
          </group>
        ) : (
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.4, 0.1, 0.4, 12]} />
            <meshStandardMaterial
              color={getSlotColor('topDish')}
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>
        )}
      </group>

      {/* 5. BOTTOM OPTICS / SCIENTIFIC CAMERA (SLOT: bottomOptics) */}
      <group
        position={[0, -1.0, 0.7]}
        rotation={[0, ((rotations['bottomOptics'] || 0) * Math.PI) / 180, 0]}
        onClick={(e) => handlePointerDown('bottomOptics', e)}
      >
        {bottomOpticsComp ? (
          <group rotation={[Math.PI / 4, 0, 0]}>
            {/* Camera optical tube barrel */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.26, 0.32, 0.8, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Aperture ring gold baffle */}
            <mesh position={[0, 0.41, 0]}>
              <torusGeometry args={[0.25, 0.04, 8, 24]} />
              <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Front glass lens element */}
            <mesh position={[0, 0.38, 0]}>
              <circleGeometry args={[0.24, 24]} />
              <meshStandardMaterial
                color="#06b6d4"
                metalness={0.2}
                roughness={0.05}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        ) : (
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.6, 12]} />
            <meshStandardMaterial
              color={getSlotColor('bottomOptics')}
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>
        )}
      </group>

      {/* 6. FRONT BAY (BATTERY / COMPUTER) (SLOT: frontBay) */}
      <group
        position={[0, 0, 0.65]}
        rotation={[0, ((rotations['frontBay'] || 0) * Math.PI) / 180, 0]}
        onClick={(e) => handlePointerDown('frontBay', e)}
      >
        {frontBayComp ? (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.5, 0.22]} />
            <meshStandardMaterial
              color={frontBayComp.color || '#10b981'}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        ) : (
          <mesh>
            <boxGeometry args={[0.6, 0.5, 0.15]} />
            <meshStandardMaterial
              color={getSlotColor('frontBay')}
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
        )}
      </group>

      {/* 7. REAR BAY (NAVIGATION / FUEL) (SLOT: rearBay) */}
      <group
        position={[0, 0, -0.65]}
        rotation={[0, ((rotations['rearBay'] || 0) * Math.PI) / 180, 0]}
        onClick={(e) => handlePointerDown('rearBay', e)}
      >
        {rearBayComp ? (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.5, 0.22]} />
            <meshStandardMaterial
              color={rearBayComp.color || '#06b6d4'}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        ) : (
          <mesh>
            <boxGeometry args={[0.6, 0.5, 0.15]} />
            <meshStandardMaterial
              color={getSlotColor('rearBay')}
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
        )}
      </group>

      {/* 8. LEFT SENSOR POD (SLOT: leftSensor) */}
      <group
        position={[-0.75, 0.4, 0.5]}
        rotation={[0, ((rotations['leftSensor'] || 0) * Math.PI) / 180, 0]}
        onClick={(e) => handlePointerDown('leftSensor', e)}
      >
        {leftSensorComp ? (
          <group>
            <mesh castShadow>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial
                color={leftSensorComp.color || '#38bdf8'}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            {/* Deployable sensor antenna boom */}
            <mesh position={[-0.3, 0.2, 0]} rotation={[0, 0, 0.6]}>
              <cylinderGeometry args={[0.02, 0.02, 0.7, 6]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ) : (
          <mesh>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial
              color={getSlotColor('leftSensor')}
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
        )}
      </group>

      {/* 9. RIGHT SENSOR POD (SLOT: rightSensor) */}
      <group
        position={[0.75, 0.4, 0.5]}
        rotation={[0, ((rotations['rightSensor'] || 0) * Math.PI) / 180, 0]}
        onClick={(e) => handlePointerDown('rightSensor', e)}
      >
        {rightSensorComp ? (
          <group>
            <mesh castShadow>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial
                color={rightSensorComp.color || '#eab308'}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            {/* Deployable sensor antenna boom */}
            <mesh position={[0.3, 0.2, 0]} rotation={[0, 0, -0.6]}>
              <cylinderGeometry args={[0.02, 0.02, 0.7, 6]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ) : (
          <mesh>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial
              color={getSlotColor('rightSensor')}
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
        )}
      </group>
    </group>
  );
};
