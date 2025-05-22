import {
  Environment,
  Html,
  OrbitControls,
  RoundedBox,
  SoftShadows,
  Text,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

const g = 9.8;

const LABELS = {
  en: {
    mass: "Mass (m)",
    angle: "Angle (θ)",
    friction: "Friction (μ)",
    weight: "Weight (mg)",
    normal: "Normal Force (N)",
    frictionForce: "Frictional Force (Ff)",
    netForce: "Net Force (F)",
    acceleration: "Acceleration (a)",
    show: "Show",
    hide: "Hide",
    play: "Play",
    pause: "Pause",
    language: "বাংলা",
    presets: "Presets",
    presetList: [
      { key: "icy", label: "Icy Slope", mass: 2, angle: 10, friction: 0.05 },
      {
        key: "rubber",
        label: "Rubber Ramp",
        mass: 2,
        angle: 20,
        friction: 0.8,
      },
      { key: "wood", label: "Wooden Board", mass: 2, angle: 25, friction: 0.4 },
      {
        key: "steel",
        label: "Steel Slide",
        mass: 2,
        angle: 30,
        friction: 0.15,
      },
      {
        key: "sandpaper",
        label: "Sandpaper",
        mass: 2,
        angle: 15,
        friction: 0.9,
      },
    ],
    tooltip: {
      weight: "Downward force due to gravity.",
      normal: "Perpendicular reaction from the plane.",
      frictionForce: "Opposes motion, proportional to normal force.",
      netForce: "Drives the block down the plane.",
      acceleration: "Resulting acceleration of the block.",
    },
  },
  bn: {
    mass: "ভর (m)",
    angle: "ঢালের কোণ (θ)",
    friction: "ঘর্ষণ সহগ (μ)",
    weight: "ওজন (mg)",
    normal: "লম্ব প্রতিক্রিয়া (N)",
    frictionForce: "ঘর্ষণ বল (Ff)",
    netForce: "নেট বল (F)",
    acceleration: "ত্বরণ (a)",
    show: "দেখান",
    hide: "লুকান",
    play: "চালান",
    pause: "থামান",
    language: "English",
    presets: "প্রিসেট",
    presetList: [
      { key: "icy", label: "বরফের ঢাল", mass: 2, angle: 10, friction: 0.05 },
      {
        key: "rubber",
        label: "রাবারের র‍্যাম্প",
        mass: 2,
        angle: 20,
        friction: 0.8,
      },
      { key: "wood", label: "কাঠের বোর্ড", mass: 2, angle: 25, friction: 0.4 },
      {
        key: "steel",
        label: "স্টিল স্লাইড",
        mass: 2,
        angle: 30,
        friction: 0.15,
      },
      {
        key: "sandpaper",
        label: "স্যান্ডপেপার",
        mass: 2,
        angle: 15,
        friction: 0.9,
      },
    ],
    tooltip: {
      weight: "মাধ্যাকর্ষণজনিত নিচের দিকে বল।",
      normal: "তলের লম্ব প্রতিক্রিয়া।",
      frictionForce: "ঘর্ষণ বল, লম্ব প্রতিক্রিয়ার সাথে সম্পর্কিত।",
      netForce: "তলে ব্লককে নামানোর বল।",
      acceleration: "ব্লকের ত্বরণ।",
    },
  },
};

interface InclinedPlaneProps {
  params: { mass: number; angle: number; friction: number };
  lang?: "en" | "bn";
}

function useBillboard(ref: React.RefObject<THREE.Group>) {
  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.lookAt(camera.position);
    }
  });
}

function Arrow3D({
  from,
  to,
  color,
  labelText,
  tooltip,
  fontSize = 0.22,
  highlight = false,
  onPointerOver,
  onPointerOut,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  labelText: string;
  tooltip: string;
  fontSize?: number;
  highlight?: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}) {
  // Draw a cylinder for the shaft and a cone for the head
  const dir = new THREE.Vector3(
    to[0] - from[0],
    to[1] - from[1],
    to[2] - from[2],
  );
  const length = dir.length();

  if (length === 0) return null;
  dir.normalize();
  const arrowPos = new THREE.Vector3(...from).add(
    dir.clone().multiplyScalar(length / 2),
  );
  const arrowHeadPos = new THREE.Vector3(...to);
  const quaternion = new THREE.Quaternion();

  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  // Offset text a bit from the arrow tip
  const textPos = arrowHeadPos.clone().add(dir.clone().multiplyScalar(0.18));
  const textRef = useRef<THREE.Group>(null);

  useBillboard(textRef);

  return (
    <group>
      {/* Shaft */}
      <mesh
        castShadow
        receiveShadow
        position={arrowPos.toArray()}
        quaternion={quaternion}
        onPointerOut={onPointerOut}
        onPointerOver={onPointerOver}
      >
        <cylinderGeometry
          args={[
            highlight ? 0.08 : 0.05,
            highlight ? 0.08 : 0.05,
            length - 0.3 > 0 ? length - 0.3 : 0.1,
            16,
          ]}
        />
        <meshStandardMaterial
          color={highlight ? "#fff700" : color}
          emissive={highlight ? color : undefined}
          emissiveIntensity={highlight ? 0.7 : 0}
        />
      </mesh>
      {/* Head */}
      <mesh
        castShadow
        receiveShadow
        position={arrowHeadPos.toArray()}
        quaternion={quaternion}
        onPointerOut={onPointerOut}
        onPointerOver={onPointerOver}
      >
        <coneGeometry
          args={[highlight ? 0.18 : 0.12, highlight ? 0.38 : 0.3, 20]}
        />
        <meshStandardMaterial
          color={highlight ? "#fff700" : color}
          emissive={highlight ? color : undefined}
          emissiveIntensity={highlight ? 0.7 : 0}
        />
      </mesh>
      {/* 3D Text Label with tooltip */}
      <group ref={textRef} position={textPos.toArray()}>
        <Text
          anchorX="left"
          anchorY="middle"
          color={highlight ? "#fff700" : color}
          fontSize={fontSize}
          outlineColor="#222"
          outlineWidth={0.008}
          onPointerOut={onPointerOut}
          onPointerOver={onPointerOver}
        >
          {labelText}
        </Text>
        {highlight && (
          <Html
            center
            style={{
              pointerEvents: "none",
              background: "rgba(30,30,30,0.95)",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 500,
              boxShadow: "0 2px 12px #0006",
              whiteSpace: "pre-line",
            }}
          >
            {tooltip}
          </Html>
        )}
      </group>
    </group>
  );
}

function CameraResetButton() {
  const { camera } = useThree();
  const handleReset = useCallback(() => {
    camera.position.set(4, 3, 7);
    camera.lookAt(1.5, 0, 0);
  }, [camera]);

  return (
    <Html position={[0, 3.5, 0]} style={{ pointerEvents: "auto" }}>
      <button
        style={{
          background: "#fff",
          color: "#222",
          border: "none",
          borderRadius: 6,
          padding: "4px 12px",
          fontWeight: 600,
          boxShadow: "0 2px 8px #0002",
          cursor: "pointer",
        }}
        onClick={handleReset}
      >
        Reset View
      </button>
    </Html>
  );
}

export default function InclinedPlane({
  params,
  lang: langProp,
}: InclinedPlaneProps) {
  const [showVectors, setShowVectors] = useState({
    weight: true,
    normal: true,
    friction: true,
    net: true,
  });
  const [playing, setPlaying] = useState(false);
  const [blockPos, setBlockPos] = useState(0); // 0 = top of plane
  const [lang, setLang] = useState<"en" | "bn">(langProp || "en");
  const [hovered, setHovered] = useState<string | null>(null);
  const [preset, setPreset] = useState<string | null>(null);
  const [localParams, setLocalParams] = useState(params);
  const requestRef = useRef<number>();
  const [mode, setMode] = useState<"3d" | "2d">("3d");

  // Update localParams if parent params change (unless a preset is active)
  useEffect(() => {
    if (!preset) setLocalParams(params);
  }, [params, preset]);

  // Handle preset selection
  const handlePreset = (presetKey: string) => {
    const presetObj = LABELS[lang].presetList.find((p) => p.key === presetKey);

    if (presetObj) {
      setLocalParams({
        mass: presetObj.mass,
        angle: presetObj.angle,
        friction: presetObj.friction,
      });
      setPreset(presetKey);
      setBlockPos(0);
      setPlaying(false);
    }
  };

  // If language changes, update preset label and keep values
  useEffect(() => {
    if (preset) {
      const presetObj = LABELS[lang].presetList.find((p) => p.key === preset);

      if (presetObj) {
        setLocalParams({
          mass: presetObj.mass,
          angle: presetObj.angle,
          friction: presetObj.friction,
        });
      }
    }
  }, [lang, preset]);

  // Physics calculations
  const m = localParams.mass;
  const theta = (localParams.angle * Math.PI) / 180;
  const mu = localParams.friction;
  const mg = m * g;
  const mgSin = mg * Math.sin(theta);
  const mgCos = m * g * Math.cos(theta);
  const N = mgCos;
  const Ff = mu * N;
  const netF = mgSin - Ff;
  const a = netF > 0 ? netF / m : 0;
  const blockMoving = netF > 0;

  // Animation
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const animate = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);

      last = now;
      if (blockMoving) {
        setBlockPos((pos) => {
          const next = Math.min(pos + a * 2 * dt, 3.2);

          return next;
        });
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current!);
  }, [playing, a, blockMoving]);

  // Reset block position when params change
  useEffect(() => {
    setBlockPos(0);
    setPlaying(false);
  }, [localParams.mass, localParams.angle, localParams.friction]);

  // 3D positions
  const planeLength = 3.5;
  const planeHeight = planeLength * Math.tan(theta);
  const blockLength = 0.5;
  const blockHeight = 0.5;
  const blockGap = 0.02; // Small gap above plane
  const planeOrigin: [number, number, number] = [0, 0.075, 0]; // Slightly above ground
  const blockLocalX = Math.min(blockPos, planeLength - blockLength / 2); // Clamp to plane
  const blockLocalY = blockHeight / 2 + blockGap;
  // Block's position in plane's local coordinates
  const blockLocal = new THREE.Vector3(blockLocalX, blockLocalY, 0);
  // Plane rotation matrix
  const planeQuat = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(-theta, 0, 0),
  );
  const blockWorld = blockLocal
    .clone()
    .applyQuaternion(planeQuat)
    .add(new THREE.Vector3(planeOrigin[0], planeOrigin[1], planeOrigin[2]));

  // Force vectors (scaled for visualization)
  const scale = 1.2;
  const weightVec: [number, number, number] = [0, -scale, 0];
  const normalVec: [number, number, number] = [
    scale * Math.sin(theta),
    scale * Math.cos(theta),
    0,
  ];
  const frictionVec: [number, number, number] = [
    scale * Math.cos(theta),
    -scale * Math.sin(theta),
    0,
  ];
  const netVec: [number, number, number] = [
    scale * Math.sin(theta),
    scale * Math.cos(theta),
    0,
  ];

  const l = LABELS[lang];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-2/3 flex flex-col items-center">
        {/* Preset Buttons */}
        <div className="flex gap-2 mb-2 mt-2">
          <span className="font-semibold text-gray-700 dark:text-gray-200 mr-2">
            {l.presets}:
          </span>
          {l.presetList.map((p) => (
            <button
              key={p.key}
              className={`px-3 py-1 rounded border text-sm font-medium transition shadow-sm ${preset === p.key ? "bg-emerald-600 text-white border-emerald-700" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900"}`}
              type="button"
              onClick={() => handlePreset(p.key)}
            >
              {p.label}
            </button>
          ))}
          {preset && (
            <button
              className="ml-2 px-2 py-1 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-400 dark:border-gray-600 text-xs font-semibold hover:bg-gray-400 dark:hover:bg-gray-600"
              type="button"
              onClick={() => {
                setPreset(null);
                setLocalParams(params);
                setBlockPos(0);
                setPlaying(false);
              }}
            >
              {lang === "en" ? "Custom" : "কাস্টম"}
            </button>
          )}
        </div>
        <div
          style={{
            width: 480,
            height: 340,
            background: "#18181b",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {mode === "3d" ? (
            <Canvas
              shadows
              camera={{ position: [4, 3, 7], fov: 40 }}
              dpr={[1, 2]}
            >
              {/* Lighting for realism */}
              <ambientLight intensity={0.6} />
              <directionalLight
                castShadow
                intensity={1.2}
                position={[5, 8, 5]}
                shadow-camera-bottom={-10}
                shadow-camera-far={30}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-mapSize-height={2048}
                shadow-mapSize-width={2048}
              />
              <pointLight intensity={0.4} position={[0, 6, 6]} />
              <Environment background blur={0.7} preset="city" />
              <SoftShadows focus={0.95} samples={24} size={30} />
              <OrbitControls
                enablePan={true}
                enableRotate={true}
                enableZoom={true}
              />
              <CameraResetButton />
              <gridHelper
                args={[10, 20, "#bbb", "#eee"]}
                position={[planeLength / 2, -0.25, 0]}
              />
              {/* Soft ground */}
              <mesh receiveShadow position={[planeLength / 2, -0.35, 0]}>
                <boxGeometry args={[planeLength + 2, 0.2, 4]} />
                <meshStandardMaterial
                  transparent
                  color="#e0e0e0"
                  metalness={0.1}
                  opacity={0.5}
                  roughness={0.8}
                />
              </mesh>
              {/* Inclined plane with bevel */}
              <mesh
                receiveShadow
                position={[planeLength / 2, planeHeight / 2 + 0.075, 0]}
                rotation={[-theta, 0, 0]}
              >
                <boxGeometry args={[planeLength, 0.15, 1]} />
                <meshStandardMaterial
                  transparent
                  color="#f3f4f6"
                  metalness={0.2}
                  opacity={0.5}
                  roughness={0.5}
                />
              </mesh>
              {/* Block with rounded edges, positioned and rotated to match plane */}
              <RoundedBox
                castShadow
                receiveShadow
                args={[blockLength, blockHeight, 0.5]}
                creaseAngle={0.4}
                position={blockWorld.toArray()}
                radius={0.08}
                rotation={[-theta, 0, 0]}
                smoothness={4}
              >
                <meshStandardMaterial
                  transparent
                  color="#f59e42"
                  metalness={0.3}
                  opacity={0.5}
                  roughness={0.3}
                />
              </RoundedBox>
              {/* Force vectors with 3D text labels and tooltips */}
              {showVectors.weight && (
                <Arrow3D
                  color="#ef4444"
                  from={blockWorld.toArray() as [number, number, number]}
                  highlight={hovered === "weight"}
                  labelText={lang === "en" ? "mg" : "ওজন"}
                  to={[
                    blockWorld.x + weightVec[0],
                    blockWorld.y + weightVec[1],
                    blockWorld.z + weightVec[2],
                  ]}
                  tooltip={l.tooltip.weight}
                  onPointerOut={() => setHovered(null)}
                  onPointerOver={() => setHovered("weight")}
                />
              )}
              {showVectors.normal && (
                <Arrow3D
                  color="#3b82f6"
                  from={blockWorld.toArray() as [number, number, number]}
                  highlight={hovered === "normal"}
                  labelText={lang === "en" ? "N" : "N"}
                  to={[
                    blockWorld.x + normalVec[0],
                    blockWorld.y + normalVec[1],
                    blockWorld.z + normalVec[2],
                  ]}
                  tooltip={l.tooltip.normal}
                  onPointerOut={() => setHovered(null)}
                  onPointerOver={() => setHovered("normal")}
                />
              )}
              {showVectors.friction && (
                <Arrow3D
                  color="#f59e42"
                  from={blockWorld.toArray() as [number, number, number]}
                  highlight={hovered === "friction"}
                  labelText={lang === "en" ? "Ff" : "ঘর্ষণ"}
                  to={[
                    blockWorld.x + frictionVec[0],
                    blockWorld.y + frictionVec[1],
                    blockWorld.z + frictionVec[2],
                  ]}
                  tooltip={l.tooltip.frictionForce}
                  onPointerOut={() => setHovered(null)}
                  onPointerOver={() => setHovered("friction")}
                />
              )}
              {showVectors.net && netF > 0.1 && (
                <Arrow3D
                  color="#10b981"
                  from={blockWorld.toArray() as [number, number, number]}
                  highlight={hovered === "net"}
                  labelText={lang === "en" ? "F" : "নেট বল"}
                  to={[
                    blockWorld.x + netVec[0],
                    blockWorld.y + netVec[1],
                    blockWorld.z + netVec[2],
                  ]}
                  tooltip={l.tooltip.netForce}
                  onPointerOut={() => setHovered(null)}
                  onPointerOver={() => setHovered("net")}
                />
              )}
            </Canvas>
          ) : (
            <InclinedPlane2D
              Ff={Ff}
              N={N}
              a={a}
              blockHeight={blockHeight}
              blockLength={blockLength}
              blockPos={blockPos}
              g={g}
              lang={lang}
              m={m}
              mg={mg}
              mgCos={mgCos}
              mgSin={mgSin}
              mu={mu}
              netF={netF}
              params={localParams}
              planeLength={planeLength}
              playing={playing}
              showVectors={showVectors}
              theta={theta}
            />
          )}
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          {(["weight", "normal", "friction", "net"] as const).map((vec) => (
            <div key={vec} className="flex items-center gap-1">
              <Switch
                checked={showVectors[vec]}
                onCheckedChange={() =>
                  setShowVectors((s) => ({ ...s, [vec]: !s[vec] }))
                }
              />
              <Label>{vec === "net" ? l.netForce : l[vec]}</Label>
            </div>
          ))}
          <button
            className="ml-4 px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
            disabled={netF <= 0}
            style={netF <= 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? l.pause : l.play}
          </button>
          <button
            className="ml-2 px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
          >
            {l.language}
          </button>
          <button
            className="ml-2 px-3 py-1 rounded bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200 transition"
            type="button"
            onClick={() => {
              setBlockPos(0);
              setPlaying(false);
            }}
          >
            {lang === "en" ? "Reset" : "রিসেট"}
          </button>
          <button
            className="ml-2 px-3 py-1 rounded bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200 transition"
            type="button"
            onClick={() => setMode(mode === "3d" ? "2d" : "3d")}
          >
            {mode === "3d"
              ? lang === "en"
                ? "2D View"
                : "২ডি ভিউ"
              : lang === "en"
                ? "3D View"
                : "থ্রিডি ভিউ"}
          </button>
        </div>
      </div>
      <div className="w-full md:w-1/3 space-y-4">
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded shadow text-sm">
          <div>
            <b>{l.weight}:</b> mg = {m} × {g} = {mg.toFixed(2)} N
          </div>
          <div>
            <b>mg·sin(θ):</b> {mgSin.toFixed(2)} N
          </div>
          <div>
            <b>mg·cos(θ):</b> {mgCos.toFixed(2)} N
          </div>
          <div>
            <b>{l.normal}:</b> N = mg·cos(θ) = {N.toFixed(2)} N
          </div>
          <div>
            <b>{l.frictionForce}:</b> Ff = μN = {mu} × {N.toFixed(2)} ={" "}
            {Ff.toFixed(2)} N
          </div>
          <div>
            <b>{l.netForce}:</b> F = mg·sin(θ) - Ff = {mgSin.toFixed(2)} -{" "}
            {Ff.toFixed(2)} = {netF.toFixed(2)} N
          </div>
          <div>
            <b>{l.acceleration}:</b> a = F/m = {netF.toFixed(2)} / {m} ={" "}
            {a.toFixed(2)} m/s²
          </div>
          {netF <= 0 && (
            <div className="text-amber-600 mt-2">
              {lang === "en"
                ? "Block remains at rest (static friction)"
                : "ব্লক স্থির থাকে (স্থিতিশীল ঘর্ষণ)"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InclinedPlane2D({
  params,
  blockPos,
  showVectors,
  lang,
  theta,
  netF,
  playing,
  planeLength,
  blockLength,
  blockHeight,
}: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw ground
    if (!ctx) return;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(0, 260, 480, 80);
    ctx.restore();
    // Draw inclined plane
    if (!ctx) return;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.translate(60, 260);
    ctx.rotate(-theta);
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, planeLength * 90, 22);
    ctx.restore();
    // Draw block
    if (!ctx) return;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.translate(60, 260);
    ctx.rotate(-theta);
    ctx.fillStyle = "#f59e42";
    const blockX = Math.min(blockPos, planeLength - blockLength / 2) * 90;

    ctx.fillRect(
      blockX,
      -blockHeight * 45 - 2,
      blockLength * 90,
      blockHeight * 90,
    );
    ctx.restore();
    // Draw force vectors (arrows)
    function drawArrow(
      x: number,
      y: number,
      dx: number,
      dy: number,
      color: string,
      label: string,
    ) {
      if (!ctx) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y + dy);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(x + dx, y + dy);
      ctx.lineTo(x + dx - 8, y + dy - 8);
      ctx.lineTo(x + dx + 8, y + dy - 8);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      // Label
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(label, x + dx + 10, y + dy);
      ctx.restore();
    }
    // Block center in 2D
    const bx = 60 + blockX + blockLength * 45;
    const by = 260 - blockHeight * 45;

    if (showVectors.weight)
      drawArrow(bx, by, 0, 60, "#ef4444", lang === "en" ? "mg" : "ওজন");
    if (showVectors.normal)
      drawArrow(
        bx,
        by,
        60 * Math.sin(theta),
        -60 * Math.cos(theta),
        "#3b82f6",
        lang === "en" ? "N" : "N",
      );
    if (showVectors.friction)
      drawArrow(
        bx,
        by,
        60 * Math.cos(theta),
        60 * Math.sin(-theta),
        "#f59e42",
        lang === "en" ? "Ff" : "ঘর্ষণ",
      );
    if (showVectors.net && netF > 0.1)
      drawArrow(
        bx,
        by,
        60 * Math.sin(theta),
        60 * Math.cos(theta),
        "#10b981",
        lang === "en" ? "F" : "নেট বল",
      );
  }, [params, blockPos, showVectors, lang, theta, netF, playing]);

  return (
    <canvas
      ref={canvasRef}
      height={340}
      style={{ background: "#18181b", borderRadius: 12 }}
      width={480}
    />
  );
}
