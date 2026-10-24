import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Html, ContactShadows, QuadraticBezierLine } from '@react-three/drei';
import { useIslandStore } from './store/islandStore';
import { researchModules } from './data/researchData';
import * as THREE from 'three';

// ==========================================
// 1. 中央三層動態噴泉 (Central Animated Fountain)
// ==========================================
function CentralFountain() {
  const dropsRef = useRef([]);
  const topSplashRef = useRef();
  const { isPaused } = useIslandStore();

  // 建立 24 顆循環噴湧的水滴粒子
  const dropData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      angle: (i / 24) * Math.PI * 2,
      speed: 1.2 + (i % 5) * 0.15,
      offset: (i / 24) * 1.0,
      radius: 0.45 + (i % 3) * 0.22,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime();

    dropsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const d = dropData[i];
      const progress = (t * d.speed + d.offset) % 1; // 0 ~ 1 循環
      // 拋物線軌跡：由中心噴嘴向上噴出再往外落入水池
      const r = progress * d.radius;
      const x = Math.cos(d.angle + t * 0.3) * r;
      const z = Math.sin(d.angle + t * 0.3) * r;
      const y = 1.35 + Math.sin(progress * Math.PI) * 0.75 - progress * 0.65;
      mesh.position.set(x, y, z);
      const scale = Math.sin(progress * Math.PI) * 0.9 + 0.3;
      mesh.scale.setScalar(scale);
    });

    if (topSplashRef.current) {
      topSplashRef.current.scale.y = 1 + Math.sin(t * 8) * 0.2;
    }
  });

  return (
    <group position={[0, 0.04, 0]}>
      {/* 底層大石池外框 */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.85, 2.0, 0.36, 32]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>
      {/* 底層池水 */}
      <mesh position={[0, 0.33, 0]}>
        <cylinderGeometry args={[1.68, 1.68, 0.1, 32]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.25} roughness={0.1} />
      </mesh>

      {/* 中層石柱與中水盤 */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.6, 0.6, 20]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <cylinderGeometry args={[1.05, 0.85, 0.22, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.91, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.08, 24]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#0ea5e9" emissiveIntensity={0.3} roughness={0.1} />
      </mesh>

      {/* 上層噴嘴柱與頂端湧泉 */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 0.5, 16]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh ref={topSplashRef} position={[0, 1.55, 0]}>
        <coneGeometry args={[0.22, 0.45, 16]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>

      {/* 動態噴泉水珠 */}
      {dropData.map((_, i) => (
        <mesh key={i} ref={(el) => (dropsRef.current[i] = el)}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ==========================================
// 2. 多元人物元件：支援老人(拄拐杖)、小孩、男女學生、學者與市民
// ==========================================
function DiversePerson({
  startPos,
  type = 'citizen_m', // 'elder_m' | 'elder_f' | 'child_m' | 'child_f' | 'student_m' | 'student_f' | 'citizen_m' | 'citizen_f'
  shirtColor = '#3b82f6',
  bottomColor = '#334155',
  hairColor = '#1e293b',
  roleName = '市民',
  speed = 0.9,
  radius = 2.2,
  phase = 0,
}) {
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

  // 依據年齡設定身高比例與步頻
  const isChild = type.startsWith('child');
  const isElder = type.startsWith('elder');
  const isStudent = type.startsWith('student');
  const isFemale = type.endsWith('_f');

  const charScale = isChild ? 0.35 : isElder ? 0.48 : isStudent ? 0.46 : 0.52;
  const walkFreq = isChild ? 7.5 : isElder ? 3.8 : 5.2;

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime() * speed + phase;

    const angle = t * 0.48;
    const x = startPos[0] + Math.cos(angle) * radius;
    const z = startPos[2] + Math.sin(angle * 1.3) * (radius * 0.8);
    const bounce = Math.abs(Math.sin(t * walkFreq)) * (isChild ? 0.11 : isElder ? 0.04 : 0.07);

    const dx = -Math.sin(angle) * radius * 0.48;
    const dz = Math.cos(angle * 1.3) * (radius * 0.8) * 1.3 * 0.48;
    const targetRot = Math.atan2(dx, dz);

    if (groupRef.current) {
      groupRef.current.position.set(x, startPos[1] + bounce, z);
      groupRef.current.rotation.y = targetRot;
    }

    const swing = Math.sin(t * walkFreq) * (isElder ? 0.35 : 0.55);
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
    if (rightArmRef.current) rightArmRef.current.rotation.x = isElder ? 0.25 + swing * 0.25 : swing * 0.8;
  });

  return (
    <group ref={groupRef} position={startPos} scale={[charScale, charScale, charScale]}>
      {/* 雙腿 */}
      <group position={[-0.14, 0.35, 0]} ref={leftLegRef}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.16, 0.36, 0.18]} />
          <meshStandardMaterial color={bottomColor} roughness={0.6} />
        </mesh>
      </group>
      <group position={[0.14, 0.35, 0]} ref={rightLegRef}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.16, 0.36, 0.18]} />
          <meshStandardMaterial color={bottomColor} roughness={0.6} />
        </mesh>
      </group>

      {/* 女性裙擺設計 */}
      {isFemale && (
        <mesh position={[0, 0.42, 0]} castShadow>
          <coneGeometry args={[0.38, 0.35, 16]} />
          <meshStandardMaterial color={bottomColor} roughness={0.5} />
        </mesh>
      )}

      {/* 身體軀幹 */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.32, 0.65, 16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.4} />
      </mesh>

      {/* 左手与右手（長者右手持木拐杖） */}
      <group position={[-0.34, 0.92, 0]} ref={leftArmRef}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.14, 0.45, 0.14]} />
          <meshStandardMaterial color={shirtColor} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
      </group>
      <group position={[0.34, 0.92, 0]} ref={rightArmRef}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.14, 0.45, 0.14]} />
          <meshStandardMaterial color={shirtColor} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
        {/* 長者專屬拐杖 */}
        {isElder && (
          <mesh position={[0, -0.68, 0.18]} rotation={[-0.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.03, 0.85, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        )}
      </group>

      {/* 學生與孩童專屬小書包 */}
      {(isStudent || isChild) && (
        <mesh position={[0, 0.72, -0.28]} castShadow>
          <boxGeometry args={[0.38, 0.42, 0.22]} />
          <meshStandardMaterial color={isChild ? '#f43f5e' : '#d97706'} roughness={0.5} />
        </mesh>
      )}

      {/* 頭部與髮型 */}
      <group position={[0, 1.42, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.38, 20, 20]} />
          <meshStandardMaterial color="#ffedd5" roughness={0.3} />
        </mesh>
        {/* 基礎頭髮 */}
        <mesh position={[0, 0.12, -0.04]} castShadow>
          <sphereGeometry args={[0.39, 18, 18]} />
          <meshStandardMaterial color={hairColor} roughness={0.5} />
        </mesh>
        {/* 女性長馬尾 / 阿嬤髮髻 / 小女孩雙馬尾 */}
        {isFemale && !isElder && !isChild && (
          <mesh position={[0, 0.05, -0.42]} rotation={[0.4, 0, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.28, 8, 12]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
        )}
        {isFemale && isElder && (
          <mesh position={[0, 0.38, -0.22]} castShadow>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
        )}
        {isFemale && isChild && (
          <>
            <mesh position={[-0.36, 0.15, -0.1]} rotation={[0, 0, 0.4]}>
              <sphereGeometry args={[0.14, 10, 10]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
            <mesh position={[0.36, 0.15, -0.1]} rotation={[0, 0, -0.4]}>
              <sphereGeometry args={[0.14, 10, 10]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
          </>
        )}
        {/* 小男孩鴨舌帽 */}
        {!isFemale && isChild && (
          <mesh position={[0, 0.32, 0.12]}>
            <cylinderGeometry args={[0.36, 0.36, 0.12, 16]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        )}
        {/* 眼睛 */}
        <mesh position={[-0.13, 0.02, 0.35]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.13, 0.02, 0.35]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {showLabels && (
        <Html position={[0, 2.2, 0]} center distanceFactor={20}>
          <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow-sm border border-slate-300/80 whitespace-nowrap pointer-events-none">
            {roleName}
          </div>
        </Html>
      )}
    </group>
  );
}

// ==========================================
// 3. 可愛貓咪與小狗元件 (Cute Cats & Dogs)
// ==========================================
function CutePet({ startPos, species = 'dog', color = '#f59e0b', name = '柴犬', speed = 1.2, radius = 1.6, phase = 0 }) {
  const petRef = useRef();
  const tailRef = useRef();
  const { isPaused, showLabels } = useIslandStore();
  const isCat = species === 'cat';

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime() * speed + phase;

    const angle = t * 0.7;
    const x = startPos[0] + Math.cos(angle) * radius;
    const z = startPos[2] + Math.sin(angle * 1.4) * (radius * 0.85);
    const hop = Math.abs(Math.sin(t * 8)) * 0.06;

    const dx = -Math.sin(angle) * radius * 0.7;
    const dz = Math.cos(angle * 1.4) * (radius * 0.85) * 1.4 * 0.7;
    const rotY = Math.atan2(dx, dz);

    if (petRef.current) {
      petRef.current.position.set(x, startPos[1] + hop, z);
      petRef.current.rotation.y = rotY;
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 12) * 0.45;
    }
  });

  return (
    <group ref={petRef} position={startPos} scale={isCat ? [0.38, 0.38, 0.38] : [0.45, 0.45, 0.45]}>
      {/* 身體 */}
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.42, 8, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* 四隻小腳 */}
      {[
        [-0.12, 0.14, 0.2],
        [0.12, 0.14, 0.2],
        [-0.12, 0.14, -0.2],
        [0.12, 0.14, -0.2],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos} castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.28, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {/* 頭部 */}
      <group position={[0, 0.58, 0.32]}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        {/* 狗狗口吻部 vs 貓咪小粉鼻 */}
        {!isCat ? (
          <mesh position={[0, -0.04, 0.18]}>
            <boxGeometry args={[0.14, 0.12, 0.16]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>
        ) : (
          <mesh position={[0, -0.02, 0.21]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#fda4af" />
          </mesh>
        )}
        {/* 尖尖耳朵 */}
        <mesh position={[-0.13, 0.2, 0]} rotation={[0, 0, 0.25]}>
          <coneGeometry args={[0.08, 0.18, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.13, 0.2, 0]} rotation={[0, 0, -0.25]}>
          <coneGeometry args={[0.08, 0.18, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* 眼睛 */}
        <mesh position={[-0.08, 0.04, 0.19]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.08, 0.04, 0.19]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
      {/* 搖擺尾巴 */}
      <group position={[0, 0.48, -0.32]} ref={tailRef}>
        <mesh position={[0, 0.15, -0.08]} rotation={[-0.5, 0, 0]}>
          <capsuleGeometry args={[0.045, isCat ? 0.35 : 0.22, 6, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>

      {showLabels && (
        <Html position={[0, 1.15, 0]} center distanceFactor={22}>
          <div className="bg-amber-50/90 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-amber-900 border border-amber-200 whitespace-nowrap pointer-events-none">
            {isCat ? '🐱' : '🐶'} {name}
          </div>
        </Html>
      )}
    </group>
  );
}

// ==========================================
// 4. 天空巡航直升機與立體雲朵 (Sky Helicopter & Clouds)
// ==========================================
function FlyingHelicopter() {
  const heliRef = useRef();
  const mainRotorRef = useRef();
  const tailRotorRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime() * 0.35;
    const radius = 14.5;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * (radius * 0.78);
    const y = 7.8 + Math.sin(t * 3) * 0.4;

    const dx = -Math.sin(t) * radius;
    const dz = Math.cos(t) * (radius * 0.78);
    const rotY = Math.atan2(dx, dz);

    if (heliRef.current) {
      heliRef.current.position.set(x, y, z);
      heliRef.current.rotation.set(0.12, rotY, 0); // 微向前傾飛行姿態
    }
    if (mainRotorRef.current) mainRotorRef.current.rotation.y += 0.45;
    if (tailRotorRef.current) tailRotorRef.current.rotation.x += 0.5;
  });

  return (
    <group ref={heliRef} position={[12, 8, 0]} scale={[0.75, 0.75, 0.75]}>
      {/* 機艙主體 */}
      <mesh castShadow>
        <capsuleGeometry args={[0.65, 0.9, 12, 16]} />
        <meshStandardMaterial color="#e05a47" roughness={0.3} />
      </mesh>
      {/* 前方藍色玻璃駕駛艙 */}
      <mesh position={[0, 0.1, 0.55]}>
        <sphereGeometry args={[0.58, 16, 16]} />
        <meshStandardMaterial color="#bae6fd" roughness={0.1} metalness={0.3} />
      </mesh>
      {/* 白色機身橫紋 */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.34, 0.22, 1.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* 機尾延伸桿与尾翼 */}
      <mesh position={[0, 0.15, -1.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.28, 1.9, 12]} />
        <meshStandardMaterial color="#e05a47" />
      </mesh>
      <mesh position={[0, 0.45, -2.35]} castShadow>
        <boxGeometry args={[0.1, 0.65, 0.35]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* 底部雙起落架滑橇 */}
      <mesh position={[-0.45, -0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0.45, -0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* 頂部高速旋轉主螺旋槳 */}
      <group position={[0, 0.82, 0]} ref={mainRotorRef}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.25, 8]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[3.8, 0.03, 0.22]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[3.8, 0.03, 0.22]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
      {/* 尾部螺旋槳 */}
      <group position={[0.14, 0.45, -2.35]} ref={tailRotorRef}>
        <mesh>
          <boxGeometry args={[0.04, 0.75, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {showLabels && (
        <Html position={[0, 1.6, 0]} center distanceFactor={24}>
          <div className="bg-rose-600/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow whitespace-nowrap pointer-events-none">
            🚁 空中巡航號
          </div>
        </Html>
      )}
    </group>
  );
}

// 立體雲朵元件
function FluffyCloud({ position, scale = 1, speed = 0.2 }) {
  const cloudRef = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !cloudRef.current) return;
    const t = clock.getElapsedTime() * speed;
    cloudRef.current.position.x = position[0] + Math.sin(t) * 2.5;
  });

  return (
    <group ref={cloudRef} position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.1, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[0.9, -0.15, 0.2]}>
        <sphereGeometry args={[0.85, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[-0.9, -0.2, -0.1]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[0.3, 0.4, -0.3]}>
        <sphereGeometry args={[0.75, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ==========================================
// 5. 大海與四周備用衛星小島 (Ocean & Reserve Satellite Islands)
// ==========================================
function CuteTree({ position, scale = 1, color = '#52b788' }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 0.8, 10]} />
        <meshStandardMaterial color="#9c6644" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.55, 14, 14]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.4, 14, 14]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
}

function OceanAndSatelliteIslands() {
  const boatRef = useRef();
  const windmillRef = useRef();
  const { showLabels, isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime();
    if (boatRef.current) {
      boatRef.current.position.y = -0.85 + Math.sin(t * 2) * 0.08;
      boatRef.current.rotation.z = Math.sin(t * 1.5) * 0.06;
    }
    if (windmillRef.current) {
      windmillRef.current.rotation.z = t * 1.2;
    }
  });

  return (
    <group>
      {/* 廣闊無邊的蔚藍大海 */}
      <mesh position={[0, -1.25, 0]} receiveShadow>
        <cylinderGeometry args={[65, 65, 0.8, 64]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.25} metalness={0.05} />
      </mesh>
      {/* 主島周圍的白色海浪淺灘環 */}
      <mesh position={[0, -0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10.8, 12.2, 48]} />
        <meshStandardMaterial color="#bae6fd" side={THREE.DoubleSide} transparent opacity={0.75} />
      </mesh>

      {/* --- 備用小島 A (左後方)：紅白燈塔訊號島 --- */}
      <group position={[-16.5, -0.3, -11.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <cylinderGeometry args={[3.6, 4.2, 1.2, 24]} />
          <meshStandardMaterial color="#95d5b2" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[4.2, 3.5, 0.8, 24]} />
          <meshStandardMaterial color="#f5ebe0" />
        </mesh>
        {/* 紅白條紋燈塔 */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.75, 2.4, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.56, 0.65, 0.8, 16]} />
          <meshStandardMaterial color="#e05a47" />
        </mesh>
        <mesh position={[0, 2.55, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.4, 16]} />
          <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 2.95, 0]} castShadow>
          <coneGeometry args={[0.6, 0.5, 16]} />
          <meshStandardMaterial color="#e05a47" />
        </mesh>
        <CuteTree position={[-1.6, 0.2, 1.0]} scale={0.9} />
        <CuteTree position={[1.5, 0.2, -1.2]} scale={0.75} />
        {showLabels && (
          <Html position={[0, 3.8, 0]} center distanceFactor={28}>
            <div className="bg-white/85 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow border border-slate-200 whitespace-nowrap">
              🏝️ 備用島 A · 燈塔觀測站
            </div>
          </Html>
        )}
      </group>

      {/* --- 備用小島 B (右後方)：綠能風車生態島 --- */}
      <group position={[17.5, -0.3, -10.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <cylinderGeometry args={[4.0, 4.6, 1.2, 24]} />
          <meshStandardMaterial color="#74c69d" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[4.6, 3.8, 0.8, 24]} />
          <meshStandardMaterial color="#f5ebe0" />
        </mesh>
        {/* 白色發電風車 */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.35, 2.8, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <group position={[0, 2.7, 0.25]} ref={windmillRef}>
          <mesh>
            <boxGeometry args={[2.4, 0.18, 0.05]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[2.4, 0.18, 0.05]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
        <CuteTree position={[-1.8, 0.2, 0.8]} scale={1.1} color="#40916c" />
        <CuteTree position={[1.6, 0.2, 1.2]} scale={0.9} color="#52b788" />
        <CuteTree position={[1.2, 0.2, -1.5]} scale={0.85} color="#40916c" />
        {showLabels && (
          <Html position={[0, 4.2, 0]} center distanceFactor={28}>
            <div className="bg-white/85 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow border border-slate-200 whitespace-nowrap">
              🏝️ 備用島 B · 綠能生態園區
            </div>
          </Html>
        )}
      </group>

      {/* --- 備用小島 C (右前方)：櫻花涼亭沙龍島 --- */}
      <group position={[16.5, -0.3, 11.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <cylinderGeometry args={[3.4, 4.0, 1.1, 24]} />
          <meshStandardMaterial color="#95d5b2" roughness={0.6} />
        </mesh>
        {/* 雙棵粉紅櫻花樹 */}
        <CuteTree position={[-1.2, 0.2, -0.5]} scale={1.1} color="#f472b6" />
        <CuteTree position={[1.3, 0.2, 0.8]} scale={0.95} color="#f9a8d4" />
        {/* 休憩小木亭 */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.9, 0.9, 0.1, 6]} />
          <meshStandardMaterial color="#d4a373" />
        </mesh>
        <mesh position={[0, 1.5, 0]} castShadow>
          <coneGeometry args={[1.2, 0.7, 6]} />
          <meshStandardMaterial color="#e05a47" />
        </mesh>
        {showLabels && (
          <Html position={[0, 3.0, 0]} center distanceFactor={28}>
            <div className="bg-white/85 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow border border-slate-200 whitespace-nowrap">
              🏝️ 備用島 C · 跨域沙龍島
            </div>
          </Html>
        )}
      </group>

      {/* --- 備用小島 D (左前方)：木棧道港灣島與海上帆船 --- */}
      <group position={[-16.0, -0.3, 11.0]}>
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <cylinderGeometry args={[3.2, 3.8, 1.1, 24]} />
          <meshStandardMaterial color="#95d5b2" roughness={0.6} />
        </mesh>
        <CuteTree position={[-0.8, 0.2, -0.6]} scale={1.0} color="#52b788" />
        {/* 延伸出海的木棧道碼頭 */}
        <mesh position={[2.4, 0.1, 0]} castShadow>
          <boxGeometry args={[2.8, 0.15, 0.9]} />
          <meshStandardMaterial color="#b08968" />
        </mesh>
        {showLabels && (
          <Html position={[0, 2.8, 0]} center distanceFactor={28}>
            <div className="bg-white/85 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow border border-slate-200 whitespace-nowrap">
              🏝️ 備用島 D · 遠洋港灣島
            </div>
          </Html>
        )}
      </group>

      {/* 海面上搖晃的可愛白色帆船 */}
      <group ref={boatRef} position={[-10.5, -0.85, 9.5]}>
        <mesh castShadow>
          <boxGeometry args={[1.6, 0.4, 0.8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.6, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0.1, 0.95, 0]} rotation={[0, 0, -0.1]}>
          <coneGeometry args={[0.65, 1.3, 3]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
      </group>
    </group>
  );
}

// ==========================================
// 6. 主島四大精緻微縮建築模型 (Main Island Buildings)
// ==========================================
function DetailedBuildings() {
  const { activeModule, setActiveModule, setModalOpen, showLabels, isPaused } = useIslandStore();
  const crystalRef = useRef();
  const ringRef = useRef();
  const smoke1Ref = useRef();
  const smoke2Ref = useRef();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime();
    if (crystalRef.current) {
      crystalRef.current.rotation.y = t * 0.8;
      crystalRef.current.position.y = 3.1 + Math.sin(t * 2.5) * 0.15;
    }
    if (ringRef.current) ringRef.current.rotation.z = t * 0.6;
    if (smoke1Ref.current) {
      const s1 = (t * 0.6) % 1;
      smoke1Ref.current.position.y = 2.8 + s1 * 1.2;
      smoke1Ref.current.scale.setScalar(0.25 + s1 * 0.25);
    }
    if (smoke2Ref.current) {
      const s2 = (t * 0.6 + 0.5) % 1;
      smoke2Ref.current.position.y = 2.8 + s2 * 1.2;
      smoke2Ref.current.scale.setScalar(0.25 + s2 * 0.25);
    }
  });

  const handleSelect = (key, e) => {
    e.stopPropagation();
    setActiveModule(key);
    setModalOpen(true);
  };

  return (
    <>
      {/* 01 理論語言學殿堂 */}
      <group position={[-5.2, 0, -3.2]} onClick={(e) => handleSelect('theory', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.4, 0.4, 3.0]} />
          <meshStandardMaterial color="#e6ccb2" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 1.4, 2.4]} />
          <meshStandardMaterial color="#fff8f0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <cylinderGeometry args={[1.6, 2.3, 0.5, 4]} />
          <meshStandardMaterial color="#e05a47" roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[2.0, 0.9, 1.7]} />
          <meshStandardMaterial color="#fff8f0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 3.35, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.8, 1.0, 4]} />
          <meshStandardMaterial color="#d94e34" roughness={0.3} />
        </mesh>
        <mesh position={[-0.7, 1.15, 1.21]}>
          <boxGeometry args={[0.45, 0.45, 0.05]} />
          <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.7, 1.15, 1.21]}>
          <boxGeometry args={[0.45, 0.45, 0.05]} />
          <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.5} />
        </mesh>
        {showLabels && (
          <Html position={[0, 4.3, 0]} center distanceFactor={18}>
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border transition-transform cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeModule === 'theory' ? 'bg-rose-600 text-white border-rose-400 scale-110' : 'bg-white/95 text-slate-800 border-slate-200 hover:scale-105'
            }`}>
              <span>01</span>
              <span>🏛️ 理論語言學殿堂</span>
            </div>
          </Html>
        )}
      </group>

      {/* 02 計量與語料庫中心 */}
      <group position={[5.2, 0, -3.2]} onClick={(e) => handleSelect('corpus', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.4, 0.4, 3.0]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </mesh>
        <mesh position={[-0.4, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.2, 2.0]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        <mesh position={[-0.4, 1.2, 1.02]}>
          <boxGeometry args={[1.6, 0.35, 0.05]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[-0.4, 1.85, 1.02]}>
          <boxGeometry args={[1.6, 0.35, 0.05]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0.95, 1.1, 0.2]} castShadow>
          <cylinderGeometry args={[0.65, 0.65, 1.4, 20]} />
          <meshStandardMaterial color="#2b7a78" roughness={0.3} />
        </mesh>
        <group position={[-0.4, 3.1, 0]}>
          <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.65, 0.08, 16, 32]} />
            <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.6} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={0.8} />
          </mesh>
        </group>
        {showLabels && (
          <Html position={[0, 4.3, 0]} center distanceFactor={18}>
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border transition-transform cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeModule === 'corpus' ? 'bg-teal-700 text-white border-teal-400 scale-110' : 'bg-white/95 text-slate-800 border-slate-200 hover:scale-105'
            }`}>
              <span>02</span>
              <span>📊 計量與語料庫中心</span>
            </div>
          </Html>
        )}
      </group>

      {/* 03 社會政策智庫 */}
      <group position={[-4.8, 0, 3.8]} onClick={(e) => handleSelect('policy', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.6, 0.4, 3.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.15, -0.1]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 1.5, 2.2]} />
          <meshStandardMaterial color="#fdfbf7" roughness={0.4} />
        </mesh>
        {[-0.9, -0.3, 0.3, 0.9].map((xPos, idx) => (
          <mesh key={idx} position={[xPos, 1.1, 1.15]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 1.4, 12]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
        ))}
        <mesh position={[0, 2.05, 0.6]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <cylinderGeometry args={[0.1, 1.5, 0.5, 4]} />
          <meshStandardMaterial color="#3a86ff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.1, -0.1]} castShadow>
          <sphereGeometry args={[1.05, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#52b788" roughness={0.3} />
        </mesh>
        {showLabels && (
          <Html position={[0, 4.1, 0]} center distanceFactor={18}>
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border transition-transform cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeModule === 'policy' ? 'bg-blue-600 text-white border-blue-400 scale-110' : 'bg-white/95 text-slate-800 border-slate-200 hover:scale-105'
            }`}>
              <span>03</span>
              <span>🏫 社會政策智庫</span>
            </div>
          </Html>
        )}
      </group>

      {/* 04 前線 AI 實踐工坊 */}
      <group position={[4.8, 0, 3.8]} onClick={(e) => handleSelect('systems', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.5, 0.4, 3.2]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.5} />
        </mesh>
        <mesh position={[-0.3, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.3, 1.6, 2.2]} />
          <meshStandardMaterial color="#fffbeb" roughness={0.3} />
        </mesh>
        <mesh position={[-0.3, 2.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.9, 0.9, 4]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} />
        </mesh>
        <mesh position={[0.9, 1.6, -0.5]} castShadow>
          <cylinderGeometry args={[0.25, 0.3, 2.2, 16]} />
          <meshStandardMaterial color="#ea580c" roughness={0.4} />
        </mesh>
        <mesh ref={smoke1Ref} position={[0.9, 3.0, -0.5]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        <mesh ref={smoke2Ref} position={[1.05, 3.4, -0.4]}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
        <mesh ref={crystalRef} position={[-0.3, 3.2, 0]} castShadow>
          <octahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.7} roughness={0.1} />
        </mesh>
        {showLabels && (
          <Html position={[0, 4.3, 0]} center distanceFactor={18}>
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border transition-transform cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeModule === 'systems' ? 'bg-amber-500 text-white border-amber-300 scale-110' : 'bg-amber-50/95 text-amber-900 border-amber-300 hover:scale-105'
            }`}>
              <span>04</span>
              <span>⚡ 前線 AI 實踐工坊</span>
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

// ==========================================
// 7. 3D 群島主場景 (IslandScene)
// ==========================================
function IslandScene({ controlsRef }) {
  const { viewport } = useThree();
  const { showSynergyLines } = useIslandStore();

  const responsiveScale = useMemo(() => {
    const minDim = Math.min(viewport.width, viewport.height);
    return Math.max(0.85, Math.min(1.3, minDim / 11.5));
  }, [viewport.width, viewport.height]);

  return (
    <>
      <color attach="background" args={['#bae6fd']} />
      <fog attach="fog" args={['#bae6fd', 32, 68]} />
      <ambientLight intensity={1.35} color="#fffcf2" />
      <hemisphereLight skyColor="#ffffff" groundColor="#7dd3fc" intensity={0.65} />
      <directionalLight
        position={[18, 35, 22]}
        intensity={1.65}
        color="#fff8e7"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <group scale={[responsiveScale, responsiveScale, responsiveScale]} position={[0, -0.5, 0]}>
        {/* 大海與 4 座備用衛星小島 */}
        <OceanAndSatelliteIslands />

        {/* 高空飄浮雲朵與盤旋直升機 */}
        <FlyingHelicopter />
        <FluffyCloud position={[-12, 9.5, -8]} scale={1.1} speed={0.18} />
        <FluffyCloud position={[14, 10.2, -6]} scale={1.3} speed={0.14} />
        <FluffyCloud position={[-8, 10.8, 10]} scale={0.95} speed={0.22} />
        <FluffyCloud position={[11, 9.0, 9]} scale={1.05} speed={0.16} />

        {/* 主島嶼 */}
        <Float speed={0.5} rotationIntensity={0.008} floatIntensity={0.03}>
          {/* 主島三層地貌底座 */}
          <mesh position={[0, -0.45, 0]} receiveShadow>
            <cylinderGeometry args={[10.6, 10.2, 0.9, 48]} />
            <meshStandardMaterial color="#95d5b2" roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.95, 0]}>
            <cylinderGeometry args={[10.9, 10.1, 0.4, 48]} />
            <meshStandardMaterial color="#f5ebe0" roughness={0.7} />
          </mesh>
          <mesh position={[0, -1.7, 0]}>
            <cylinderGeometry args={[9.8, 8.2, 1.2, 48]} />
            <meshStandardMaterial color="#d4a373" roughness={0.85} />
          </mesh>

          {/* 中央圓形石磚廣場與十字步道 */}
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <cylinderGeometry args={[3.2, 3.3, 0.06, 36]} />
            <meshStandardMaterial color="#fdfbf7" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.015, -0.2]} rotation={[0, Math.PI / 5, 0]} receiveShadow>
            <boxGeometry args={[13.5, 0.04, 1.15]} />
            <meshStandardMaterial color="#f5ebe0" />
          </mesh>
          <mesh position={[0, 0.015, -0.2]} rotation={[0, -Math.PI / 5, 0]} receiveShadow>
            <boxGeometry args={[13.5, 0.04, 1.15]} />
            <meshStandardMaterial color="#f5ebe0" />
          </mesh>

          {/* ★ 地面中心三層動態噴泉 ★ */}
          <CentralFountain />

          {/* 四大核心建築 */}
          <DetailedBuildings />

          {/* 協作光弧 */}
          {showSynergyLines && (
            <group>
              <QuadraticBezierLine start={[-5.2, 2.5, -3.2]} end={[5.2, 2.5, -3.2]} mid={[0, 5.5, -3.2]} color="#e05a47" lineWidth={2.5} dashed dashScale={2} />
              <QuadraticBezierLine start={[5.2, 2.5, -3.2]} end={[4.8, 2.5, 3.8]} mid={[6.0, 5.0, 0.3]} color="#2b7a78" lineWidth={2.5} dashed dashScale={2} />
              <QuadraticBezierLine start={[-4.8, 2.5, 3.8]} end={[4.8, 2.5, 3.8]} mid={[0, 5.2, 4.2]} color="#3a86ff" lineWidth={2.5} dashed dashScale={2} />
              <QuadraticBezierLine start={[-5.2, 2.5, -3.2]} end={[4.8, 2.5, 3.8]} mid={[0, 6.2, 0]} color="#f59e0b" lineWidth={2.5} dashed dashScale={2} />
            </group>
          )}

          {/* ★ 12 位多元人物：男女學者、長者(阿公阿嬤)、男女學生、男女孩童 ★ */}
          <DiversePerson startPos={[0, 0.05, 0]} type="citizen_m" shirtColor="#e05a47" bottomColor="#1e293b" hairColor="#1e293b" roleName="我 · 島主" speed={0.85} radius={2.6} phase={0} />
          <DiversePerson startPos={[-2.5, 0.05, -1.2]} type="citizen_f" shirtColor="#ec4899" bottomColor="#be185d" hairColor="#451a03" roleName="女性語言學家" speed={0.9} radius={1.9} phase={1.1} />
          <DiversePerson startPos={[2.6, 0.05, -1.4]} type="citizen_m" shirtColor="#2b7a78" bottomColor="#334155" hairColor="#1e293b" roleName="語料庫研究員" speed={0.95} radius={1.8} phase={2.2} />
          <DiversePerson startPos={[-2.2, 0.05, 2.1]} type="citizen_f" shirtColor="#8b5cf6" bottomColor="#4c1d95" hairColor="#78350f" roleName="政策分析師" speed={0.88} radius={1.8} phase={3.3} />
          <DiversePerson startPos={[2.3, 0.05, 2.0]} type="citizen_m" shirtColor="#f59e0b" bottomColor="#1e293b" hairColor="#0f172a" roleName="AI 工程師" speed={1.0} radius={1.9} phase={4.4} />

          {/* 長者：阿公與阿嬤（銀白髮、拄拐杖） */}
          <DiversePerson startPos={[-1.0, 0.05, 2.8]} type="elder_m" shirtColor="#64748b" bottomColor="#334155" hairColor="#e2e8f0" roleName="散步阿公" speed={0.55} radius={1.6} phase={0.7} />
          <DiversePerson startPos={[1.2, 0.05, -2.6]} type="elder_f" shirtColor="#d97706" bottomColor="#78350f" hairColor="#cbd5e1" roleName="慈祥阿嬤" speed={0.52} radius={1.5} phase={2.8} />

          {/* 學生：男學生與女學生（背書包、穿制服） */}
          <DiversePerson startPos={[-3.5, 0.05, 0.5]} type="student_m" shirtColor="#f8fafc" bottomColor="#1e3a8a" hairColor="#0f172a" roleName="高中男學生" speed={1.05} radius={2.1} phase={1.9} />
          <DiversePerson startPos={[3.4, 0.05, 0.6]} type="student_f" shirtColor="#f8fafc" bottomColor="#be123c" hairColor="#451a03" roleName="高中女學生" speed={1.02} radius={2.0} phase={3.9} />

          {/* 孩童：小男孩與小女孩（活潑蹦跳） */}
          <DiversePerson startPos={[0.5, 0.05, 2.4]} type="child_m" shirtColor="#38bdf8" bottomColor="#0369a1" hairColor="#1e293b" roleName="活潑小弟" speed={1.35} radius={1.7} phase={5.0} />
          <DiversePerson startPos={[-0.6, 0.05, -2.3]} type="child_f" shirtColor="#fb7185" bottomColor="#e11d48" hairColor="#78350f" roleName="雙馬尾小妹" speed={1.3} radius={1.7} phase={6.1} />
          <DiversePerson startPos={[0, 0.05, 3.6]} type="child_f" shirtColor="#facc15" bottomColor="#ca8a04" hairColor="#1e293b" roleName="小學生" speed={1.25} radius={1.5} phase={1.4} />

          {/* ★ 6 隻可愛貓咪與小狗 ★ */}
          <CutePet startPos={[-1.8, 0.02, 0.2]} species="dog" color="#d97706" name="柴柴" speed={1.25} radius={1.5} phase={0.5} />
          <CutePet startPos={[1.9, 0.02, -0.3]} species="dog" color="#fef3c7" name="小白汪" speed={1.3} radius={1.6} phase={2.1} />
          <CutePet startPos={[0.2, 0.02, 4.2]} species="dog" color="#b45309" name="黃金獵犬" speed={1.15} radius={1.4} phase={4.0} />
          <CutePet startPos={[-2.8, 0.02, -3.5]} species="cat" color="#fb923c" name="胖橘貓" speed={1.1} radius={1.2} phase={1.2} />
          <CutePet startPos={[2.9, 0.02, 3.2]} species="cat" color="#f8fafc" name="雪白喵" speed={1.2} radius={1.3} phase={3.5} />
          <CutePet startPos={[-3.2, 0.02, 2.8]} species="cat" color="#334155" name="黑嚕嚕喵" speed={1.18} radius={1.2} phase={5.2} />

          {/* 島嶼四周綠樹 */}
          <CuteTree position={[-8.2, 0, -1.0]} scale={1.1} color="#40916c" />
          <CuteTree position={[-7.5, 0, 1.5]} scale={0.85} color="#52b788" />
          <CuteTree position={[8.2, 0, -0.5]} scale={1.15} color="#40916c" />
          <CuteTree position={[7.6, 0, 1.8]} scale={0.9} color="#74c69d" />
          <CuteTree position={[0, 0, -6.8]} scale={1.2} color="#40916c" />
          <CuteTree position={[-1.8, 0, -6.2]} scale={0.85} color="#52b788" />
          <CuteTree position={[1.8, 0, 6.5]} scale={1.0} color="#52b788" />
          <CuteTree position={[-1.5, 0, 6.8]} scale={0.9} color="#40916c" />
        </Float>
      </group>

      {/* 支援大範圍 Zoom In (minDistance=3.5) 與 Zoom Out (maxDistance=52) */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        zoomSpeed={1.2}
        maxPolarAngle={Math.PI / 2.15}
        minPolarAngle={Math.PI / 8}
        minDistance={3.5}
        maxDistance={52}
        target={[0, 0.2, 0]}
      />
    </>
  );
}

// ==========================================
// 8. 頂層全螢幕懸浮 UI 儀表板 (含 Zoom In / Zoom Out 控制按鈕)
// ==========================================
export default function App() {
  const controlsRef = useRef();
  const {
    activeModule,
    setActiveModule,
    isModalOpen,
    setModalOpen,
    persona,
    setPersona,
    showLabels,
    toggleLabels,
    showSynergyLines,
    toggleSynergyLines,
    isPaused,
    togglePause,
  } = useIslandStore();

  const mod = activeModule ? researchModules[activeModule] : null;

  // 縮放與視角控制函式
  const handleZoom = (factor) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const cam = controls.object;
    const target = controls.target;
    const offset = cam.position.clone().sub(target);
    const newLength = Math.max(controls.minDistance, Math.min(controls.maxDistance, offset.length() * factor));
    offset.setLength(newLength);
    cam.position.copy(target).add(offset);
    controls.update();
  };

  const handleResetView = (dist = 18.5, height = 12.5) => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.target.set(0, 0.2, 0);
    controls.object.position.set(0, height, dist);
    controls.update();
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#bae6fd' }}
    >
      {/* 底層：100% 滿版 3D 畫布 */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}
      >
        <Canvas shadows camera={{ position: [0, 12.5, 18.5], fov: 42 }}>
          <IslandScene controlsRef={controlsRef} />
        </Canvas>
      </div>

      {/* 懸浮層 1：左上角品牌標誌 */}
      <div className="absolute top-5 left-6 z-20 pointer-events-auto flex items-center gap-4">
        <div className="bg-[#fdfbf7]/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-stone-200/80">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black tracking-tight text-[#e05a47]">FLAME-EAGLE</span>
            <span className="text-sm font-extrabold text-slate-800">炎鷲橙果島</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 tracking-wider mt-0.5">
            ACADEMIC & AI ARCHIPELAGO · 3D 海洋知識群島
          </p>
        </div>
      </div>

      {/* 懸浮層 2：頂部中央膠囊工具列 */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto hidden md:flex items-center gap-2 bg-[#fdfbf7]/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-stone-200/80">
        <button
          onClick={toggleLabels}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            showLabels ? 'bg-slate-800 text-white shadow' : 'text-slate-600 hover:bg-stone-200/60'
          }`}
        >
          🏷️ 名牌
        </button>
        <button
          onClick={toggleSynergyLines}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            showSynergyLines ? 'bg-slate-800 text-white shadow' : 'text-slate-600 hover:bg-stone-200/60'
          }`}
        >
          🔗 協作線
        </button>
        <button
          onClick={togglePause}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            isPaused ? 'bg-rose-600 text-white shadow' : 'text-slate-600 hover:bg-stone-200/60'
          }`}
        >
          {isPaused ? '▶️ 繼續' : '⏸️ 暫停'}
        </button>
        <div className="h-4 w-[1px] bg-stone-300 mx-1" />
        <select
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          className="bg-stone-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full border border-stone-200 focus:outline-none cursor-pointer"
        >
          <option value="all">🧭 角色：全方位探索者</option>
          <option value="researcher">🎓 角色：學術研究同行</option>
          <option value="teacher">🏫 角色：第一線教育工作者</option>
        </select>
      </div>

      {/* ★ 新增懸浮層：底部中央 Zoom In / Zoom Out 縮放控制列 ★ */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2 bg-[#fdfbf7]/95 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-stone-200/90">
        <button
          onClick={() => handleZoom(0.75)}
          className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-sm flex items-center gap-1"
          title="拉近鏡頭 (Zoom In)"
        >
          <span>➕ 放大 (Zoom In)</span>
        </button>
        <button
          onClick={() => handleZoom(1.3)}
          className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-sm flex items-center gap-1"
          title="拉遠鏡頭 (Zoom Out)"
        >
          <span>➖ 縮小 (Zoom Out)</span>
        </button>
        <div className="h-4 w-[1px] bg-stone-300 mx-0.5" />
        <button
          onClick={() => handleResetView(8.0, 4.5)}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-sky-100 hover:bg-sky-200 text-sky-900 transition-all"
        >
          ⛲ 近看噴泉與貓狗
        </button>
        <button
          onClick={() => handleResetView(18.5, 12.5)}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-stone-100 hover:bg-stone-200 text-slate-700 transition-all"
        >
          🏝️ 標準主島
        </button>
        <button
          onClick={() => handleResetView(34.0, 22.0)}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-all"
        >
          🌊 全景大海與外島
        </button>
      </div>

      {/* 懸浮層 3：左側詳細研究卡片 */}
      {isModalOpen && mod && (
        <div className="absolute top-24 left-6 bottom-20 z-30 w-[390px] max-w-[90vw] bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200/90 rounded-3xl p-6 shadow-2xl pointer-events-auto flex flex-col justify-between overflow-hidden">
          <div className="overflow-y-auto pr-1 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wider text-[#e05a47] uppercase bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60">
                {mod.code}
              </span>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 bg-stone-100 hover:bg-stone-200 w-7 h-7 rounded-full flex items-center justify-center transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 leading-snug">{mod.title}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{mod.summary}</p>
            </div>

            <div className="bg-stone-100/90 border-l-4 border-[#e05a47] p-3 rounded-r-xl text-xs text-slate-700 font-medium leading-relaxed">
              {mod.quote}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-white border border-stone-200 px-3 py-1 rounded-full text-slate-700 shadow-sm">
                📄 {mod.stats.itemsCount}
              </span>
              <span className="text-[11px] font-bold bg-white border border-stone-200 px-3 py-1 rounded-full text-slate-700 shadow-sm">
                🔗 {mod.stats.synergyCount}
              </span>
            </div>

            {mod.categories && (
              <div className="space-y-3 pt-1">
                {mod.categories.map((cat, cIdx) => (
                  <div key={cIdx} className="space-y-1.5">
                    <div className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                      {cat.name}
                    </div>
                    <div className="space-y-1.5">
                      {cat.list.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="bg-white border border-stone-200/80 rounded-xl p-2.5 text-xs text-slate-700 font-medium shadow-sm hover:border-rose-300 transition-colors flex items-start gap-2"
                        >
                          <span className="text-[#e05a47] font-black mt-0.5">●</span>
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mod.isSystems && (
              <div className="space-y-2.5 pt-1">
                <div className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
                  線上互動系統（點擊直接啟動）
                </div>
                {mod.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg
