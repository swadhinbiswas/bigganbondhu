import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Text,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Howl } from "howler";
import React, { useEffect, useMemo, useRef } from "react";
import { useDrop } from "react-dnd";
import * as THREE from "three";

import {
  calculateElectronConfiguration,
  PARTICLE_CONFIG,
  ParticleType,
} from "@/types/atom";
import { useAtomStore } from "@/lib/stores/atomStore";
import { DragTypes } from "@/lib/dragTypes";

// Sound effects
const addProtonSound = new Howl({ src: ["/sounds/proton.mp3"], volume: 0.5 });
const addNeutronSound = new Howl({ src: ["/sounds/neutron.mp3"], volume: 0.4 });
const addElectronSound = new Howl({
  src: ["/sounds/electron.mp3"],
  volume: 0.6,
});

// Nucleus component that contains protons and neutrons
const Nucleus: React.FC<{ protons: number; neutrons: number }> = ({
  protons,
  neutrons,
}) => {
  const nucleusGroup = useRef<THREE.Group>(null);
  const particlesGroup = useRef<THREE.Group>(null);

  const particlePositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const total = protons + neutrons;

    // Simple approach to position particles in a spherical arrangement
    for (let i = 0; i < total; i++) {
      // Calculate positions on a sphere
      const phi = Math.acos(-1 + (2 * i) / Math.max(total, 1));
      const theta = Math.sqrt(Math.max(total, 1) * Math.PI) * phi;

      // Convert to cartesian coordinates within a radius
      const x = Math.cos(theta) * Math.sin(phi) * 0.6;
      const y = Math.sin(theta) * Math.sin(phi) * 0.6;
      const z = Math.cos(phi) * 0.6;

      positions.push(new THREE.Vector3(x, y, z));
    }

    return positions;
  }, [protons, neutrons]);

  // Rotate the nucleus slowly
  useFrame(() => {
    if (nucleusGroup.current) {
      nucleusGroup.current.rotation.y += 0.001;
      nucleusGroup.current.rotation.x += 0.0005;
    }
  });

  return (
    <group ref={nucleusGroup}>
      {/* Core glow */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial transparent color="#FFCC88" opacity={0.15} />
      </mesh>

      <group ref={particlesGroup}>
        {/* Render protons */}
        {Array(protons)
          .fill(0)
          .map((_, index) => (
            <mesh
              key={`proton-${index}`}
              position={particlePositions[index] || [0, 0, 0]}
            >
              <sphereGeometry args={[PARTICLE_CONFIG.proton.size, 16, 16]} />
              <meshStandardMaterial
                color={PARTICLE_CONFIG.proton.color}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
          ))}

        {/* Render neutrons */}
        {Array(neutrons)
          .fill(0)
          .map((_, index) => (
            <mesh
              key={`neutron-${index}`}
              position={particlePositions[protons + index] || [0, 0, 0]}
            >
              <sphereGeometry args={[PARTICLE_CONFIG.neutron.size, 16, 16]} />
              <meshStandardMaterial
                color={PARTICLE_CONFIG.neutron.color}
                metalness={0.2}
                roughness={0.5}
              />
            </mesh>
          ))}
      </group>
    </group>
  );
};

// Electron component for orbit view
const Electron: React.FC<{
  shellRadius: number;
  position: number;
  totalInShell: number;
}> = ({ shellRadius, position, totalInShell }) => {
  const electronRef = useRef<THREE.Mesh>(null);
  const electronSpeed = 1 / shellRadius; // Outer shells move slower

  // Calculate electron position in the orbit
  useFrame(({ clock }) => {
    if (electronRef.current) {
      const angle =
        clock.getElapsedTime() * electronSpeed +
        (2 * Math.PI * position) / Math.max(totalInShell, 1);

      electronRef.current.position.x = Math.cos(angle) * shellRadius;
      electronRef.current.position.z = Math.sin(angle) * shellRadius;
    }
  });

  return (
    <mesh ref={electronRef}>
      <sphereGeometry args={[PARTICLE_CONFIG.electron.size, 16, 16]} />
      <meshStandardMaterial
        color={PARTICLE_CONFIG.electron.color}
        emissive={PARTICLE_CONFIG.electron.color}
        emissiveIntensity={0.5}
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
};

// Electron shell (orbital) component
const ElectronShell: React.FC<{ radius: number; electrons: number }> = ({
  radius,
  electrons,
}) => {
  return (
    <group>
      {/* Shell ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.02, 16, 100]} />
        <meshStandardMaterial
          transparent
          color="#4444FF"
          metalness={0.8}
          opacity={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* Electrons in this shell */}
      {Array(electrons)
        .fill(0)
        .map((_, idx) => (
          <Electron
            key={`electron-${radius}-${idx}`}
            position={idx}
            shellRadius={radius}
            totalInShell={electrons}
          />
        ))}
    </group>
  );
};

// Electron cloud component for cloud view
const ElectronCloud: React.FC<{ electrons: number }> = ({ electrons }) => {
  const cloudPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];

    // Generate random positions for electron cloud based on electron count
    for (let i = 0; i < electrons * 10; i++) {
      const radius = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      points.push(new THREE.Vector3(x, y, z));
    }

    return points;
  }, [electrons]);

  const cloudRef = useRef<THREE.Points>(null);

  // Animate the cloud
  useFrame(({ clock }) => {
    if (cloudRef.current) {
      const time = clock.getElapsedTime();

      // Rotate the entire cloud slowly
      cloudRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
      cloudRef.current.rotation.y = Math.cos(time * 0.1) * 0.1;

      // Update each particle position
      const positions = cloudRef.current.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        // Add small movement to each point
        positions[i] = x + Math.sin(time + i * 0.1) * 0.01;
        positions[i + 1] = y + Math.cos(time + i * 0.1) * 0.01;
        positions[i + 2] = z + Math.sin(time + i * 0.05) * 0.01;
      }

      cloudRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={cloudRef}>
      <bufferGeometry>
        <bufferAttribute
          array={new Float32Array(cloudPoints.flatMap((p) => [p.x, p.y, p.z]))}
          attach="attributes-position"
          count={cloudPoints.length}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        sizeAttenuation
        transparent
        color={PARTICLE_CONFIG.electron.color}
        depthWrite={false}
        opacity={0.6}
        size={0.1}
      />
    </points>
  );
};

// Element label component
const ElementLabel: React.FC<{
  element: string | null;
  position: [number, number, number];
}> = ({ element, position }) => {
  if (!element) return null;

  return (
    <Text
      anchorX="center"
      anchorY="middle"
      color="white"
      fontSize={0.5}
      outlineColor="#000000"
      outlineWidth={0.02}
      position={position}
    >
      {element}
    </Text>
  );
};

// Drop target for particles
const AtomDropTarget: React.FC<{
  children: React.ReactNode;
  onDrop: (type: ParticleType) => void;
}> = ({ children, onDrop }) => {
  const { scene } = useThree();

  const [{ isOver }] = useDrop(() => ({
    accept: DragTypes.PARTICLE,
    drop: (item: { type: ParticleType; id: string }) => {
      onDrop(item.type);

      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Add highlight when hovering with draggable
  useEffect(() => {
    if (isOver) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.material) {
          const material = object.material as THREE.MeshStandardMaterial;

          if (material.emissive) {
            material.emissive = new THREE.Color(0x333333);
          }
        }
      });
    } else {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.material) {
          const material = object.material as THREE.MeshStandardMaterial;

          if (material.emissive) {
            material.emissive = new THREE.Color(0x000000);
          }
        }
      });
    }
  }, [isOver, scene]);

  return <>{children}</>;
};

// Main 3D scene component
const AtomScene: React.FC<{
  onParticleDrop: (type: ParticleType) => void;
}> = ({}) => {
  const { protons, neutrons, electrons, element, viewMode } = useAtomStore();
  const sceneRef = useRef<THREE.Group>(null);

  // Calculate electron configuration
  const electronShells = useMemo(() => {
    return calculateElectronConfiguration(electrons);
  }, [electrons]);

  return (
    <group ref={sceneRef}>
      {/* Atom nucleus with protons and neutrons */}
      <Nucleus neutrons={neutrons} protons={protons} />

      {/* Element symbol if we have an element */}
      <ElementLabel element={element?.symbol || null} position={[0, -2, 0]} />

      {/* Electron orbital display when in 'orbit' mode */}
      {viewMode === "orbit" &&
        electronShells.map((shell) => (
          <ElectronShell
            key={`shell-${shell.level}`}
            electrons={shell.electrons}
            radius={shell.radius}
          />
        ))}

      {/* Electron cloud display when in 'cloud' mode */}
      {viewMode === "cloud" && <ElectronCloud electrons={electrons} />}
    </group>
  );
};

// Main component
const AtomBuilder3D: React.FC = () => {
  // Handle particle drop function
  const handleParticleDrop = (type: ParticleType) => {
    const { addProton, addNeutron, addElectron } = useAtomStore.getState();

    switch (type) {
      case "proton":
        addProton();
        addProtonSound.play();
        break;
      case "neutron":
        addNeutron();
        addNeutronSound.play();
        break;
      case "electron":
        addElectron();
        addElectronSound.play();
        break;
    }
  };

  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: DragTypes.PARTICLE,
    drop: (item: { type: ParticleType; id: string }) => {
      handleParticleDrop(item.type);

      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-gray-900 rounded-lg shadow-lg overflow-hidden
        ${isOver ? "ring-2 ring-indigo-400" : ""}
        ${canDrop ? "cursor-move" : "cursor-grab"}
      `}
    >
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault fov={50} position={[0, 0, 10]} />
        <color args={["#050816"]} attach="background" />
        <ambientLight intensity={0.5} />
        <pointLight castShadow intensity={1} position={[10, 10, 10]} />
        <pointLight intensity={0.5} position={[-10, -10, -10]} />
        <spotLight
          castShadow
          angle={0.3}
          intensity={1.5}
          penumbra={1}
          position={[0, 5, 10]}
        />

        <AtomDropTarget onDrop={handleParticleDrop}>
          <AtomScene onParticleDrop={handleParticleDrop} />
        </AtomDropTarget>

        <OrbitControls enablePan={false} maxDistance={15} minDistance={5} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default AtomBuilder3D;
