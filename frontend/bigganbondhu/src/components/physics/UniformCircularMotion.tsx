import { Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface UniformCircularMotionProps {
  params: {
    mass: number;
    radius: number;
    speed: number;
  };
  showVelocityVector?: boolean;
  showForceVector?: boolean;
  showFormulas?: boolean;
  showTrace?: boolean;
  slowMotion?: boolean;
  lang?: "en" | "bn";
}

// Trace point for visualizing the ball's path
function TracePoint({ position }: { position: THREE.Vector3 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#3498db" opacity={0.7} transparent />
    </mesh>
  );
}

function Ball({
  mass,
  radius,
  speed,
  showVelocityVector,
  showForceVector,
  showTrace,
  slowMotion,
}: {
  mass: number;
  radius: number;
  speed: number;
  showVelocityVector?: boolean;
  showForceVector?: boolean;
  showTrace?: boolean;
  slowMotion?: boolean;
}) {
  const ballRef = useRef<THREE.Mesh>(null);
  const stringRef = useRef<any>(null);
  const velocityVectorRef = useRef<THREE.ArrowHelper>(null);
  const forceVectorRef = useRef<THREE.ArrowHelper>(null);

  const [time, setTime] = useState(0);
  const [position, setPosition] = useState({ x: radius, y: 0, z: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: speed, z: 0 });
  const [force, setForce] = useState({ x: 0, y: 0, z: 0 });
  const [tracePoints, setTracePoints] = useState<THREE.Vector3[]>([]);

  // Calculate angular velocity (ω) from linear speed
  const angularVelocity = speed / radius;

  // Adjust time increment for slow motion
  const timeScale = slowMotion ? 0.2 : 1;

  // Add a trace point every n frames
  const traceInterval = 10;
  const [frameCount, setFrameCount] = useState(0);

  useFrame((state, delta) => {
    const scaledDelta = delta * timeScale;
    setTime(time + scaledDelta);
    setFrameCount(frameCount + 1);

    // Calculate new position
    const angle = time * angularVelocity;
    const newX = radius * Math.cos(angle);
    const newY = radius * Math.sin(angle);

    // Calculate velocity (tangential to the circle)
    const vx = -speed * Math.sin(angle);
    const vy = speed * Math.cos(angle);

    // Calculate centripetal force (F = mv²/r)
    const forceMagnitude = (mass * speed * speed) / radius;
    const fx = -forceMagnitude * Math.cos(angle);
    const fy = -forceMagnitude * Math.sin(angle);

    setPosition({ x: newX, y: newY, z: 0 });
    setVelocity({ x: vx, y: vy, z: 0 });
    setForce({ x: fx, y: fy, z: 0 });

    // Update ball position
    if (ballRef.current) {
      ballRef.current.position.set(newX, newY, 0);
    }

    // Update string (line connecting center to ball)
    if (stringRef.current) {
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(newX, newY, 0),
      ];
      stringRef.current.geometry.setFromPoints(points);
    }

    // Update velocity vector
    if (velocityVectorRef.current && showVelocityVector) {
      velocityVectorRef.current.position.set(newX, newY, 0);
      velocityVectorRef.current.setDirection(
        new THREE.Vector3(vx, vy, 0).normalize()
      );
      velocityVectorRef.current.setLength(1.5); // Fixed length for visualization
    }

    // Update force vector
    if (forceVectorRef.current && showForceVector) {
      forceVectorRef.current.position.set(newX, newY, 0);
      forceVectorRef.current.setDirection(
        new THREE.Vector3(fx, fy, 0).normalize()
      );
      // Scale force length by magnitude (clamped for visual clarity)
      const forceLengthScaled = Math.min(2, forceMagnitude / 20);
      forceVectorRef.current.setLength(forceLengthScaled);
    }

    // Add trace points at regular intervals if tracing is enabled
    if (showTrace && frameCount % traceInterval === 0) {
      setTracePoints((prev) => {
        // Limit to 50 points for performance
        const newPoints = [...prev, new THREE.Vector3(newX, newY, 0)];
        if (newPoints.length > 50) {
          return newPoints.slice(newPoints.length - 50);
        }
        return newPoints;
      });
    } else if (!showTrace && tracePoints.length > 0) {
      setTracePoints([]);
    }
  });

  return (
    <>
      {/* String/rod connecting to center */}
      <group>
        <line ref={stringRef}>
          <bufferGeometry attach="geometry" />
          <lineBasicMaterial attach="material" color="#ffffff" lineWidth={2} />
        </line>
      </group>

      {/* Ball */}
      <mesh ref={ballRef} position={[radius, 0, 0]}>
        <sphereGeometry args={[0.3 + mass * 0.05, 32, 32]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>

      {/* Center point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>

      {/* Velocity Vector */}
      {showVelocityVector && (
        <arrowHelper
          ref={velocityVectorRef}
          args={[
            new THREE.Vector3(0, 1, 0).normalize(),
            new THREE.Vector3(position.x, position.y, position.z),
            1.5,
            0x00ff00,
          ]}
        />
      )}

      {/* Force Vector */}
      {showForceVector && (
        <arrowHelper
          ref={forceVectorRef}
          args={[
            new THREE.Vector3(-1, 0, 0).normalize(),
            new THREE.Vector3(position.x, position.y, position.z),
            1.5,
            0xff0000,
          ]}
        />
      )}

      {/* Trace points */}
      {showTrace &&
        tracePoints.map((point, index) => (
          <TracePoint key={index} position={point} />
        ))}

      {/* Circular path guide */}
      <CirclePath radius={radius} />
    </>
  );
}

// Circular path visualization
function CirclePath({ radius }: { radius: number }) {
  const points = [];
  const segments = 64;

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(radius * Math.cos(theta), radius * Math.sin(theta), 0)
    );
  }

  return <Line points={points} color="#666666" lineWidth={1} dashed={true} />;
}

// Formula display component
function Formulas({
  mass,
  radius,
  speed,
  lang,
}: {
  mass: number;
  radius: number;
  speed: number;
  lang: "en" | "bn";
}) {
  // Calculate values based on parameters
  const centripetalForce = (mass * speed * speed) / radius;
  const centripetalAcceleration = (speed * speed) / radius;
  const period = (2 * Math.PI * radius) / speed;

  const formulas = {
    en: {
      force: `Force (F) = mv²/r = ${centripetalForce.toFixed(2)} N`,
      acceleration: `Acceleration (a) = v²/r = ${centripetalAcceleration.toFixed(2)} m/s²`,
      period: `Period (T) = 2πr/v = ${period.toFixed(2)} s`,
    },
    bn: {
      force: `বল (F) = mv²/r = ${centripetalForce.toFixed(2)} N`,
      acceleration: `ত্বরণ (a) = v²/r = ${centripetalAcceleration.toFixed(2)} m/s²`,
      period: `পর্যায়কাল (T) = 2πr/v = ${period.toFixed(2)} s`,
    },
  };

  const currentLang = lang || "en";

  return (
    <group position={[0, -5, 0]}>
      <Text
        position={[0, 0, 0]}
        color="#ffffff"
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {formulas[currentLang].force}
      </Text>
      <Text
        position={[0, -0.7, 0]}
        color="#ffffff"
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {formulas[currentLang].acceleration}
      </Text>
      <Text
        position={[0, -1.4, 0]}
        color="#ffffff"
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {formulas[currentLang].period}
      </Text>
    </group>
  );
}

// Legend component
function Legend({
  showVelocityVector,
  showForceVector,
  lang,
}: {
  showVelocityVector?: boolean;
  showForceVector?: boolean;
  lang: "en" | "bn";
}) {
  const text = {
    en: {
      velocity: "Velocity Vector",
      force: "Centripetal Force Vector",
    },
    bn: {
      velocity: "বেগ ভেক্টর",
      force: "কেন্দ্রাভিমুখী বল ভেক্টর",
    },
  };

  const currentLang = lang || "en";

  return (
    <group position={[5, 5, 0]}>
      {showVelocityVector && (
        <group position={[0, 0, 0]}>
          <Line
            points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]}
            color="#00ff00"
            lineWidth={3}
          />
          <Text
            position={[2, 0, 0]}
            color="#ffffff"
            fontSize={0.4}
            anchorX="left"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {text[currentLang].velocity}
          </Text>
        </group>
      )}

      {showForceVector && (
        <group position={[0, -0.7, 0]}>
          <Line
            points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]}
            color="#ff0000"
            lineWidth={3}
          />
          <Text
            position={[2, 0, 0]}
            color="#ffffff"
            fontSize={0.4}
            anchorX="left"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {text[currentLang].force}
          </Text>
        </group>
      )}
    </group>
  );
}

export default function UniformCircularMotion({
  params,
  showVelocityVector = true,
  showForceVector = true,
  showFormulas = true,
  showTrace = false,
  slowMotion = false,
  lang = "en",
}: UniformCircularMotionProps) {
  return (
    <div className="w-full h-[500px] relative">
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Ball
          mass={params.mass}
          radius={params.radius}
          speed={params.speed}
          showVelocityVector={showVelocityVector}
          showForceVector={showForceVector}
          showTrace={showTrace}
          slowMotion={slowMotion}
        />
        {showFormulas && (
          <Formulas
            mass={params.mass}
            radius={params.radius}
            speed={params.speed}
            lang={lang}
          />
        )}
        <Legend
          showVelocityVector={showVelocityVector}
          showForceVector={showForceVector}
          lang={lang}
        />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
        />
        <gridHelper args={[20, 20, "#444444", "#222222"]} />
      </Canvas>
    </div>
  );
}
