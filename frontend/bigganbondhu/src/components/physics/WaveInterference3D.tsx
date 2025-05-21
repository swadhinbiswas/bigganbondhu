import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";

interface WaveParams {
  amplitude: number;
  frequency: number;
  visible: boolean;
}

interface WaveInterference3DProps {
  wave1: WaveParams;
  wave2: WaveParams;
  resultantVisible: boolean;
  mode: "interference" | "beats";
}

function generateWavePoints(
  amplitude: number,
  frequency: number,
  color: string,
  z: number,
  pointsCount = 200,
  time = 0
) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= pointsCount; i++) {
    const x = (i / pointsCount) * 8 - 4; // X from -4 to 4
    const y = amplitude * Math.sin(2 * Math.PI * frequency * (x + time));
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

function generateResultantPoints(
  wave1: WaveParams,
  wave2: WaveParams,
  z: number,
  pointsCount = 200,
  time = 0
) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= pointsCount; i++) {
    const x = (i / pointsCount) * 8 - 4;
    const y1 =
      wave1.amplitude * Math.sin(2 * Math.PI * wave1.frequency * (x + time));
    const y2 =
      wave2.amplitude * Math.sin(2 * Math.PI * wave2.frequency * (x + time));
    points.push(new THREE.Vector3(x, y1 + y2, z));
  }
  return points;
}

const WaveLine: React.FC<{
  points: THREE.Vector3[];
  color: string;
}> = ({ points, color }) => {
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);
  return (
    <line>
      <bufferGeometry attach="geometry" {...lineGeometry} />
      <lineBasicMaterial attach="material" color={color} linewidth={2} />
    </line>
  );
};

const WaveInterference3D: React.FC<WaveInterference3DProps> = ({
  wave1,
  wave2,
  resultantVisible,
  mode,
}) => {
  // For now, time is static. For animation, add a useFrame loop.
  const time = 0;
  const points1 = useMemo(
    () =>
      generateWavePoints(
        wave1.amplitude,
        wave1.frequency,
        "#ef4444",
        -0.5,
        200,
        time
      ),
    [wave1, time]
  );
  const points2 = useMemo(
    () =>
      generateWavePoints(
        wave2.amplitude,
        wave2.frequency,
        "#3b82f6",
        0.5,
        200,
        time
      ),
    [wave2, time]
  );
  const pointsResultant = useMemo(
    () => generateResultantPoints(wave1, wave2, 0, 200, time),
    [wave1, wave2, time]
  );

  return (
    <div style={{ width: "100%", height: 400 }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        {wave1.visible && <WaveLine points={points1} color="#ef4444" />}
        {wave2.visible && <WaveLine points={points2} color="#3b82f6" />}
        {resultantVisible && (
          <WaveLine points={pointsResultant} color="#10b981" />
        )}
        <gridHelper args={[10, 20, "#888", "#ccc"]} position={[0, 0, 0]} />
        <axesHelper args={[5]} />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default WaveInterference3D;
