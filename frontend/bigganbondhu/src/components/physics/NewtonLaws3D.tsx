import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface VelocityData {
  x: number;
  y: number;
  z: number;
}

// First Law - Object at rest or in uniform motion
function FirstLawSimulation({
  // mass, // Removed unused parameter
  friction,
}: {
  mass: number; // Keeping type definition for consistency
  friction: number;
}) {
  const restObjectRef = useRef<THREE.Mesh>(null);
  const movingObjectRef = useRef<THREE.Mesh>(null);
  const clockRef = useRef<number>(0);

  // Apply initial velocity to the moving object only once
  useEffect(() => {
    if (movingObjectRef.current) {
      movingObjectRef.current.userData.velocity = { x: 0.05, y: 0, z: 0 };
    }
  }, []);

  // Update object positions in animation loop
  useFrame(() => {
    clockRef.current += 0.01;

    if (movingObjectRef.current) {
      const obj = movingObjectRef.current;
      const velocity = obj.userData.velocity as VelocityData;

      // Apply friction (very low to demonstrate uniform motion)
      velocity.x *= 1 - friction * 0.001;

      // Update position
      obj.position.x += velocity.x;

      // Add a slight bounce effect to show it's not static
      obj.position.y = Math.sin(clockRef.current * 2) * 0.05;

      // Loop the object back if it goes too far
      if (obj.position.x > 5) {
        obj.position.x = -5;
      }

      // Create a trail effect by rotating slightly
      obj.rotation.y += 0.01;
    }

    // Add slight movement to static object to show it truly stays at rest
    if (restObjectRef.current) {
      // Apply small random vibrations to demonstrate it's not moving meaningfully
      restObjectRef.current.position.y =
        Math.sin(clockRef.current * 10) * 0.002;
    }
  });

  return (
    <>
      {/* Environment setup */}
      <gridHelper args={[20, 20, "#444444", "#222222"]} />

      {/* Static object - with platform to emphasize being at rest */}
      <group position={[-3, 0, 0]}>
        {/* Platform */}
        <mesh position={[0, -0.75, 0]}>
          <boxGeometry args={[2, 0.5, 2]} />
          <meshStandardMaterial color="#555555" />
        </mesh>

        {/* Static object */}
        <mesh ref={restObjectRef} position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#e74c3c"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>

        {/* Label */}
        <Text color="white" fontSize={0.4} position={[0, 1.5, 0]}>
          At Rest
        </Text>

        {/* Force indicator (none) */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial transparent color="#cccccc" opacity={0.6} />
        </mesh>
      </group>

      {/* Moving object - with motion path */}
      <group>
        {/* Motion path */}
        <mesh position={[0, -0.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 0.5]} />
          <meshBasicMaterial transparent color="#3498db" opacity={0.3} />
        </mesh>

        {/* Moving object */}
        <mesh ref={movingObjectRef} position={[3, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#3498db"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>

        {/* Motion indicator (arrow) */}
        <group position={[3, 0.5, 0]}>
          <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
            <meshStandardMaterial color="#3498db" />
          </mesh>
          <mesh position={[0.75, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.1, 0.2, 8]} />
            <meshStandardMaterial color="#3498db" />
          </mesh>
        </group>

        {/* Label */}
        <Text color="white" fontSize={0.4} position={[3, 1.5, 0]}>
          Uniform Motion
        </Text>
      </group>

      {/* Floor */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#555555" metalness={0.2} roughness={0.8} />
      </mesh>
    </>
  );
}

// Second Law - F = ma
function SecondLawSimulation({ mass, force }: { mass: number; force: number }) {
  const cubeRef = useRef<THREE.Mesh>(null);
  const arrowRef = useRef<THREE.Mesh>(null);
  const [acceleration, setAcceleration] = useState<number>(0);
  const clockRef = useRef<number>(0);

  useEffect(() => {
    // Calculate acceleration directly from F = ma
    setAcceleration(force / mass);
  }, [force, mass]);

  // Apply force to object
  useFrame(() => {
    clockRef.current += 0.01;

    if (cubeRef.current) {
      // Initialize velocity object if it doesn't exist
      if (!cubeRef.current.userData.velocity) {
        cubeRef.current.userData.velocity = { x: 0, y: 0, z: 0 };
      }

      const velocity = cubeRef.current.userData.velocity as VelocityData;

      // Update velocity based on acceleration (F = ma rearranged as a = F/m)
      velocity.x += acceleration * 0.01;

      // Update position
      cubeRef.current.position.x += velocity.x;

      // Add a slight up/down motion for visual interest
      cubeRef.current.position.y = Math.sin(clockRef.current * 2) * 0.03;

      // Update arrow size to represent force
      if (arrowRef.current) {
        // Scale arrow proportional to force
        arrowRef.current.scale.x = 1 + force * 5;
      }

      // Reset position if cube moves too far
      if (cubeRef.current.position.x > 5) {
        cubeRef.current.position.x = -5;
        velocity.x = 0;
      }

      // Add rotation to make motion more interesting
      cubeRef.current.rotation.z -= velocity.x * 0.2;
      cubeRef.current.rotation.y += velocity.x * 0.1;
    }
  });

  // Size the cube based on mass
  const size = 0.8 + mass / 10;

  return (
    <>
      {/* Environment */}
      <gridHelper args={[20, 20, "#444444", "#222222"]} />

      {/* Motion path */}
      <mesh position={[0, -size / 2 - 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 1]} />
        <meshBasicMaterial transparent color="#9b59b6" opacity={0.15} />
      </mesh>

      {/* Mass cube with shadow */}
      <mesh ref={cubeRef} castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color="#9b59b6"
          emissive="#9b59b6"
          emissiveIntensity={0.1}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Force vectors - animated arrow */}
      <group position={[-1, 0, 0]}>
        {/* Arrow shaft */}
        <mesh ref={arrowRef} position={[0, 0, 0]} scale={[1, 0.1, 0.1]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#f1c40f"
            emissive="#f39c12"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Arrow head */}
        <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[0.2, 0.5, 32]} />
          <meshStandardMaterial
            color="#f1c40f"
            emissive="#f39c12"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, -size / 2 - 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#555555" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Formula visualization */}
      <group position={[0, 2.5, 0]}>
        {/* F = m × a formula */}
        <Text
          anchorX="center"
          color="white"
          font="/fonts/roboto.woff"
          fontSize={0.5}
          position={[0, 0.6, 0]}
        >
          F = m × a
        </Text>

        {/* Calculation with values */}
        <group position={[0, 0, 0]}>
          <Text
            anchorX="center"
            color="#f1c40f"
            fontSize={0.4}
            position={[-1.5, 0, 0]}
          >
            {`${force.toFixed(2)}N`}
          </Text>
          <Text
            anchorX="center"
            color="#ffffff"
            fontSize={0.4}
            position={[0, 0, 0]}
          >
            =
          </Text>
          <Text
            anchorX="center"
            color="#9b59b6"
            fontSize={0.4}
            position={[0.8, 0, 0]}
          >
            {`${mass.toFixed(1)}kg`}
          </Text>
          <Text
            anchorX="center"
            color="#ffffff"
            fontSize={0.4}
            position={[1.6, 0, 0]}
          >
            ×
          </Text>
          <Text
            anchorX="center"
            color="#2ecc71"
            fontSize={0.4}
            position={[2.5, 0, 0]}
          >
            {`${acceleration.toFixed(2)}m/s²`}
          </Text>
        </group>

        {/* Parameter details */}
        <group position={[0, -0.8, 0]}>
          <Text
            anchorX="center"
            color="#f1c40f"
            fontSize={0.25}
            position={[-1.5, 0, 0]}
          >
            Force
          </Text>
          <Text
            anchorX="center"
            color="#9b59b6"
            fontSize={0.25}
            position={[0.8, 0, 0]}
          >
            Mass
          </Text>
          <Text
            anchorX="center"
            color="#2ecc71"
            fontSize={0.25}
            position={[2.5, 0, 0]}
          >
            Acceleration
          </Text>
        </group>
      </group>
    </>
  );
}

// Third Law - Action and Reaction
function ThirdLawSimulation({ mass, force }: { mass: number; force: number }) {
  const object1Ref = useRef<THREE.Mesh>(null);
  const object2Ref = useRef<THREE.Mesh>(null);
  const springRef = useRef<THREE.Mesh>(null);
  const arrow1Ref = useRef<THREE.Group>(null);
  const arrow2Ref = useRef<THREE.Group>(null);
  const clockRef = useRef<number>(0);
  const [forceValue, setForceValue] = useState<number>(0);

  useEffect(() => {
    // Animate force value for smoother transitions
    setForceValue(force);
  }, [force]);

  useFrame(() => {
    clockRef.current += 0.01;

    if (object1Ref.current && object2Ref.current) {
      // Initialize velocities if needed
      if (!object1Ref.current.userData.velocity) {
        object1Ref.current.userData.velocity = { x: 0, y: 0, z: 0 };
      }
      if (!object2Ref.current.userData.velocity) {
        object2Ref.current.userData.velocity = { x: 0, y: 0, z: 0 };
      }

      const obj1 = object1Ref.current;
      const obj2 = object2Ref.current;
      const vel1 = obj1.userData.velocity as VelocityData;
      const vel2 = obj2.userData.velocity as VelocityData;

      // Add pulsing effect based on force
      const pulseIntensity = Math.sin(clockRef.current * 5) * 0.05 * forceValue;

      if (arrow1Ref.current) {
        arrow1Ref.current.scale.y = 1 + pulseIntensity;
        arrow1Ref.current.scale.z = 1 + pulseIntensity;
      }
      if (arrow2Ref.current) {
        arrow2Ref.current.scale.y = 1 + pulseIntensity;
        arrow2Ref.current.scale.z = 1 + pulseIntensity;
      }

      // Calculate spring force based on distance (Hooke's law)
      const distance = obj2.position.x - obj1.position.x;
      const restLength = 3;
      const springConstant = 0.05;
      const springForce = (distance - restLength) * springConstant;

      // Apply spring forces (equal and opposite)
      vel1.x += springForce * 0.01;
      vel2.x -= springForce * 0.01;

      // Apply user force to demonstrate initiating action/reaction
      vel1.x += forceValue * 0.001;
      vel2.x -= forceValue * 0.001;

      // Damping (friction)
      vel1.x *= 0.98;
      vel2.x *= 0.98;

      // Update positions
      obj1.position.x += vel1.x;
      obj2.position.x += vel2.x;

      // Keep objects within bounds
      if (obj1.position.x < -5) {
        obj1.position.x = -5;
        vel1.x *= -0.5; // Bounce with energy loss
      }
      if (obj2.position.x > 5) {
        obj2.position.x = 5;
        vel2.x *= -0.5; // Bounce with energy loss
      }

      // Update spring visualization
      if (springRef.current) {
        // Scale the spring correctly based on the distance
        springRef.current.scale.x = distance;
        springRef.current.position.x = (obj1.position.x + obj2.position.x) / 2;

        // Add a slight wiggle to the spring for visual interest
        springRef.current.rotation.z =
          Math.PI / 2 + Math.sin(clockRef.current * 10) * 0.05;
      }
    }
  });

  // Scale cubes based on mass
  const size = 0.8 + mass / 10;

  return (
    <>
      {/* Environment */}
      <gridHelper args={[20, 20, "#444444", "#222222"]} />

      {/* Platform for objects */}
      <mesh
        receiveShadow
        position={[0, -0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Object 1 (left) */}
      <mesh ref={object1Ref} castShadow receiveShadow position={[-2, 0, 0]}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Object 2 (right) */}
      <mesh ref={object2Ref} castShadow receiveShadow position={[2, 0, 0]}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#3498db" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Spring connecting objects - improved spring effect */}
      <group>
        <mesh
          ref={springRef}
          position={[0, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.2, 0.2, 1, 16, 10, true]} />
          <meshStandardMaterial color="#95a5a6" wireframe={true} />
        </mesh>

        {/* Add coil detail to make it look more like a spring */}
        {[...Array(8)].map((_, i) => (
          <mesh
            key={i}
            position={[0, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            scale={[1, 0.3, 0.3]}
          >
            <torusGeometry args={[0.4, 0.05, 8, 16, Math.PI * 2 * 0.125]} />
            <meshStandardMaterial color="#95a5a6" />
          </mesh>
        ))}
      </group>

      {/* Force arrows with animated size */}
      <group ref={arrow1Ref} position={[-2, 0.7, 0]}>
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry
            args={[0.05, 0.05, 0.5 * (0.5 + forceValue * 5), 8]}
          />
          <meshStandardMaterial
            color="#e74c3c"
            emissive="#ff6347"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0.75, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshStandardMaterial
            color="#e74c3c"
            emissive="#ff6347"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      <group ref={arrow2Ref} position={[2, 0.7, 0]}>
        <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry
            args={[0.05, 0.05, 0.5 * (0.5 + forceValue * 5), 8]}
          />
          <meshStandardMaterial
            color="#3498db"
            emissive="#1e90ff"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[-0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshStandardMaterial
            color="#3498db"
            emissive="#1e90ff"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Text labels with enhanced styling */}
      <group position={[-2, 1.5, 0]}>
        <Text anchorX="center" color="#e74c3c" fontSize={0.3}>
          Action Force
        </Text>
        <Text
          anchorX="center"
          color="#ffffff"
          fontSize={0.2}
          position={[0, -0.3, 0]}
        >
          {`${forceValue.toFixed(2)}N`}
        </Text>
      </group>

      <group position={[2, 1.5, 0]}>
        <Text anchorX="center" color="#3498db" fontSize={0.3}>
          Reaction Force
        </Text>
        <Text
          anchorX="center"
          color="#ffffff"
          fontSize={0.2}
          position={[0, -0.3, 0]}
        >
          {`${forceValue.toFixed(2)}N`}
        </Text>
      </group>

      {/* Floor */}
      <mesh receiveShadow position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#555555" metalness={0.2} roughness={0.8} />
      </mesh>
    </>
  );
}

// Main scene setup with lighting
function SceneSetup({ children }: { children: React.ReactNode }) {
  const { camera } = useThree();

  useEffect(() => {
    // Set up camera position and target
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      {/* Scene environment */}
      <color args={["#111827"]} attach="background" />
      <fog args={["#111827", 8, 25]} attach="fog" />

      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.6} />

      {/* Main directional light with shadow */}
      <directionalLight
        castShadow
        intensity={1}
        position={[10, 10, 5]}
        shadow-camera-bottom={-10}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />

      {/* Fill light from opposite direction */}
      <directionalLight intensity={0.3} position={[-5, 5, -2]} />

      {/* Controls for interactivity */}
      <OrbitControls
        dampingFactor={0.05}
        enableDamping={true}
        enablePan={true}
        enableZoom={true}
        maxDistance={15}
        minDistance={3}
      />

      {children}
    </>
  );
}

interface NewtonLaws3DProps {
  lawNumber: number;
  mass: number;
  force: number;
  friction: number;
}

// Main Newton's Laws component
const NewtonLaws3D: React.FC<NewtonLaws3DProps> = ({
  lawNumber,
  mass,
  force,
  friction,
}) => {
  return (
    <div className="w-full h-[500px] relative bg-gradient-to-b from-gray-900 to-black rounded overflow-hidden">
      <Canvas shadows>
        <SceneSetup>
          {lawNumber === 1 && (
            <FirstLawSimulation friction={friction} mass={mass} />
          )}
          {lawNumber === 2 && <SecondLawSimulation force={force} mass={mass} />}
          {lawNumber === 3 && <ThirdLawSimulation force={force} mass={mass} />}
        </SceneSetup>
      </Canvas>

      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded shadow-lg max-w-md opacity-90">
        <p className="text-gray-800 dark:text-gray-200 font-bold text-sm">
          {lawNumber === 1 &&
            "Newton's 1st Law: Objects in motion stay in motion, objects at rest stay at rest unless acted upon by a force"}
          {lawNumber === 2 && "Newton's 2nd Law: Force = Mass × Acceleration"}
          {lawNumber === 3 &&
            "Newton's 3rd Law: For every action, there is an equal and opposite reaction"}
        </p>
      </div>

      <div className="absolute top-4 right-4 text-white text-sm bg-gray-800/70 p-2 rounded opacity-80 hover:opacity-100 transition-opacity">
        <p>Drag to rotate • Scroll to zoom</p>
      </div>

      <div className="absolute top-4 left-4 bg-gray-800/70 p-2 rounded opacity-90">
        <p className="text-xs text-white">
          <span className="font-semibold">Parameters:</span> Mass: {mass}kg •
          {lawNumber !== 1 ? ` Force: ${force}N •` : ""}
          {lawNumber === 1 ? ` Friction: ${friction}` : ""}
        </p>
      </div>
    </div>
  );
};

export default NewtonLaws3D;
