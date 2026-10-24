import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Html, ContactShadows, QuadraticBezierLine } from '@react-three/drei';
import { useIslandStore } from './store/islandStore';
import { researchModules } from './data/researchData';
import * as THREE from 'three';

// ==========================================
// 1. 精緻化 Q 版動態小人偶（具五官、頭髮、背包、擺手與邁步動畫）
// ==========================================
function CuteScholarCharacter({ startPos, shirtColor, hairColor, roleName, speed = 1, radius = 2.2, phase = 0 }) {
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime() * speed + phase;

    // 8字形與圓形複合漫步路徑
    const angle = t * 0.55;
    const x = startPos[0] + Math.cos(angle) * radius;
    const z = startPos[2] + Math.sin(angle * 1.5) * (radius * 0.75);
    const bounce = Math.abs(Math.sin(t * 5.5)) * 0.08;

    // 計算前進朝向
    const dx = -Math.sin(angle) * radius * 0.55;
    const dz = Math.cos(angle * 1.5) * (radius * 0.75) * 1.5 * 0.55;
    const targetRot = Math.atan2(dx, dz);

    if (groupRef.current) {
      groupRef.current.position.set(x, startPos[1] + bounce, z);
      groupRef.current.rotation.y = targetRot;
    }

    // 手腳前後擺動動畫
    const swing = Math.sin(t * 5.5) * 0.55;
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
    if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.8;
  });

  return (
    <group ref={groupRef} position={startPos} scale={[0.52, 0.52, 0.52]}>
      {/* 左腿与右腿 */}
      <group position={[-0.14, 0.35, 0]} ref={leftLegRef}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.16, 0.36, 0.18]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
      </group>
      <group position={[0.14, 0.35, 0]} ref={rightLegRef}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.16, 0.36, 0.18]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
      </group>

      {/* 身體軀幹（圓潤毛衣/襯衫） */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.32, 0.65, 16]} />
        <meshStandardMaterial color={shirtColor} roughness={0.4} />
      </mesh>
      {/* 白色小領口 */}
      <mesh position={[0, 1.02, 0.05]}>
        <torusGeometry args={[0.18, 0.05, 8, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 左手與右手 */}
      <group position={[-0.34, 0.92, 0]} ref={leftArmRef}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.14, 0.45, 0.14]} />
          <meshStandardMaterial color={shirtColor} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
      </group>
      <group position={[0.34, 0.92, 0]} ref={rightArmRef}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.14, 0.45, 0.14]} />
          <meshStandardMaterial color={shirtColor} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.46, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
      </group>

      {/* 後背小書包 */}
      <mesh position={[0, 0.72, -0.28]} castShadow>
        <boxGeometry args={[0.38, 0.42, 0.22]} />
        <meshStandardMaterial color="#d97706" roughness={0.5} />
      </mesh>

      {/* 頭部 */}
      <group position={[0, 1.42, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshStandardMaterial color="#ffedd5" roughness={0.3} />
        </mesh>
        {/* 頭髮造型 */}
        <mesh position={[0, 0.12, -0.04]} castShadow>
          <sphereGeometry args={[0.39, 20, 20]} />
          <meshStandardMaterial color={hairColor} roughness={0.5} />
        </mesh>
        {/* 眼睛 */}
        <mesh position={[-0.13, 0.02, 0.35]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.13, 0.02, 0.35]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* 可愛腮紅 */}
        <mesh position={[-0.22, -0.05, 0.31]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#fda4af" />
        </mesh>
        <mesh position={[0.22, -0.05, 0.31]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#fda4af" />
        </mesh>
      </group>

      {/* 頭頂懸浮角色名牌 */}
      {showLabels && (
        <Html position={[0, 2.15, 0]} center distanceFactor={18}>
          <div className="bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-700 shadow-sm border border-slate-300/80 whitespace-nowrap pointer-events-none">
            {roleName}
          </div>
        </Html>
      )}
    </group>
  );
}

// ==========================================
// 2. 島嶼環境細節：可愛樹木、路燈與雲朵
// ==========================================
function CuteTree({ position, scale = 1, color = "#52b788" }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 樹幹 */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 0.8, 12]} />
        <meshStandardMaterial color="#9c6644" roughness={0.7} />
      </mesh>
      {/* 雙層圓潤樹冠 */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
}

// ==========================================
// 3. 四大精緻化微縮建築模型（Diorama Buildings）
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
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.6;
    }
    if (smoke1Ref.current) {
      const s1 = (t * 0.6) % 1;
      smoke1Ref.current.position.y = 2.8 + s1 * 1.2;
      smoke1Ref.current.scale.setScalar(0.25 + s1 * 0.25);
    }
    if (smoke2Ref.current) {
      const s2 = ((t * 0.6) + 0.5) % 1;
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
      {/* --------------------------------------------------
          01 理論語言學與南島語殿堂 (左上：雙層斜頂書院 + 句法樹)
         -------------------------------------------------- */}
      <group position={[-5.2, 0, -3.2]} onClick={(e) => handleSelect('theory', e)}>
        {/* 石造基座 */}
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.4, 0.4, 3.0]} />
          <meshStandardMaterial color="#e6ccb2" roughness={0.6} />
        </mesh>
        {/* 一樓主體 */}
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 1.4, 2.4]} />
          <meshStandardMaterial color="#fff8f0" roughness={0.4} />
        </mesh>
        {/* 一樓飛簷屋頂 */}
        <mesh position={[0, 1.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <cylinderGeometry args={[1.6, 2.3, 0.5, 4]} />
          <meshStandardMaterial color="#e05a47" roughness={0.3} />
        </mesh>
        {/* 二樓藏書閣 */}
        <mesh position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[2.0, 0.9, 1.7]} />
          <meshStandardMaterial color="#fff8f0" roughness={0.4} />
        </mesh>
        {/* 二樓主尖頂 */}
        <mesh position={[0, 3.35, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.8, 1.0, 4]} />
          <meshStandardMaterial color="#d94e34" roughness={0.3} />
        </mesh>
        {/* 正門木柱與牌坊 */}
        <mesh position={[-0.6, 0.9, 1.25]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 12]} />
          <meshStandardMaterial color="#b54434" />
        </mesh>
        <mesh position={[0.6, 0.9, 1.25]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 12]} />
          <meshStandardMaterial color="#b54434" />
        </mesh>
        {/* 溫暖發光窗戶 */}
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

      {/* --------------------------------------------------
          02 計量句法與語料庫中心 (右上：現代玻璃帷幕大樓 + 雷達數據環)
         -------------------------------------------------- */}
      <group position={[5.2, 0, -3.2]} onClick={(e) => handleSelect('corpus', e)}>
        {/* 基座 */}
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.4, 0.4, 3.0]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </mesh>
        {/* 主實驗大樓 */}
        <mesh position={[-0.4, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.2, 2.0]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        {/* 科技感玻璃橫條窗 */}
        <mesh position={[-0.4, 1.2, 1.02]}>
          <boxGeometry args={[1.6, 0.35, 0.05]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[-0.4, 1.85, 1.02]}>
          <boxGeometry args={[1.6, 0.35, 0.05]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.4} />
        </mesh>
        {/* 語料伺服器副樓 */}
        <mesh position={[0.95, 1.1, 0.2]} castShadow>
          <cylinderGeometry args={[0.65, 0.65, 1.4, 20]} />
          <meshStandardMaterial color="#2b7a78" roughness={0.3} />
        </mesh>
        {/* 屋頂動態數據光環 */}
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

      {/* --------------------------------------------------
          03 社會語言學與教育政策智庫 (左下：圓頂議會廳 + 古典列柱)
         -------------------------------------------------- */}
      <group position={[-4.8, 0, 3.8]} onClick={(e) => handleSelect('policy', e)}>
        {/* 階梯基座 */}
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.6, 0.4, 3.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
        {/* 智庫主廳 */}
        <mesh position={[0, 1.15, -0.1]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 1.5, 2.2]} />
          <meshStandardMaterial color="#fdfbf7" roughness={0.4} />
        </mesh>
        {/* 前方四根古典議會廊柱 */}
        {[-0.9, -0.3, 0.3, 0.9].map((xPos, idx) => (
          <mesh key={idx} position={[xPos, 1.1, 1.15]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 1.4, 12]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
        ))}
        {/* 屋頂三角門楣 */}
        <mesh position={[0, 2.05, 0.6]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <cylinderGeometry args={[0.1, 1.5, 0.5, 4]} />
          <meshStandardMaterial color="#3a86ff" roughness={0.3} />
        </mesh>
        {/* 議會綠色圓頂穹蒼 */}
        <mesh position={[0, 2.1, -0.1]} castShadow>
          <sphereGeometry args={[1.05, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#52b788" roughness={0.3} />
        </mesh>
        <mesh position={[0, 3.3, -0.1]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
          <meshStandardMaterial color="#f59e0b" />
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

      {/* --------------------------------------------------
          04 前線 AI 應用與實踐工坊 (右下：橙果科技工坊 + 冒煙煙囪 + 懸浮晶體)
         -------------------------------------------------- */}
      <group position={[4.8, 0, 3.8]} onClick={(e) => handleSelect('systems', e)}>
        {/* 基座 */}
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.5, 0.4, 3.2]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.5} />
        </mesh>
        {/* 工坊主體 */}
        <mesh position={[-0.3, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.3, 1.6, 2.2]} />
          <meshStandardMaterial color="#fffbeb" roughness={0.3} />
        </mesh>
        {/* 橙果色斜屋頂 */}
        <mesh position={[-0.3, 2.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.9, 0.9, 4]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} />
        </mesh>
        {/* 雙煙囪與動態蒸汽雲 */}
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
        {/* 懸浮旋轉 AI 能量多面體 */}
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
// 4. 響應式島嶼主場景（含中央廣場、步道、協作光弧與自動畫面縮放）
// ==========================================
function IslandScene() {
  const { viewport } = useThree();
  const { showSynergyLines } = useIslandStore();

  // 依據螢幕寬高比動態計算放大倍率，確保在任何解析度下皆填滿畫面中央
  const responsiveScale = useMemo(() => {
    const minDim = Math.min(viewport.width, viewport.height);
    return Math.max(0.85, Math.min(1.35, minDim / 11.5));
  }, [viewport.width, viewport.height]);

  return (
    <>
      {/* 政策島風格：柔和明亮的自然天光與暖色太陽 */}
      <color attach="background" args={['#dcebe6']} />
      <ambientLight intensity={1.35} color="#fffcf2" />
      <hemisphereLight skyColor="#ffffff" groundColor="#b7e4c7" intensity={0.65} />
      <directionalLight
        position={[18, 32, 22]}
        intensity={1.6}
        color="#fff8e7"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <group scale={[responsiveScale, responsiveScale, responsiveScale]} position={[0, -0.6, 0]}>
        <Float speed={0.8} rotationIntensity={0.015} floatIntensity={0.06}>
          
          {/* --- 雙層立體模型島嶼底座 (Diorama Base) --- */}
          {/* 上層：溫潤薄荷草地 */}
          <mesh position={[0, -0.5, 0]} receiveShadow>
            <cylinderGeometry args={[10.8, 10.4, 1.0, 48]} />
            <meshStandardMaterial color="#95d5b2" roughness={0.65} />
          </mesh>
          {/* 中層：奶油色沙灘環 */}
          <mesh position={[0, -1.1, 0]}>
            <cylinderGeometry args={[11.1, 10.2, 0.5, 48]} />
            <meshStandardMaterial color="#f5ebe0" roughness={0.7} />
          </mesh>
          {/* 下層：厚實土壤岩層 */}
          <mesh position={[0, -2.0, 0]}>
            <cylinderGeometry args={[10.0, 8.2, 1.4, 48]} />
            <meshStandardMaterial color="#d4a373" roughness={0.85} />
          </mesh>

          {/* --- 中央炎鷲橙果廣場與十字步道 --- */}
          <mesh position={[0, 0.03, 0]} receiveShadow>
            <cylinderGeometry args={[2.6, 2.7, 0.08, 32]} />
            <meshStandardMaterial color="#fdfbf7" roughness={0.5} />
          </mesh>
          {/* 中央紀念碑小噴泉/地標 */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.7, 0.9, 0.5, 20]} />
            <meshStandardMaterial color="#e05a47" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <dodecahedronGeometry args={[0.45, 0]} />
            <meshStandardMaterial color="#fca311" emissive="#f59e0b" emissiveIntensity={0.3} />
          </mesh>

          {/* 連接四大建築的奶油色步道 */}
          <mesh position={[0, 0.02, -0.2]} rotation={[0, Math.PI / 5, 0]} receiveShadow>
            <boxGeometry args={[13.5, 0.05, 1.1]} />
            <meshStandardMaterial color="#f5ebe0" />
          </mesh>
          <mesh position={[0, 0.02, -0.2]} rotation={[0, -Math.PI / 5, 0]} receiveShadow>
            <boxGeometry args={[13.5, 0.05, 1.1]} />
            <meshStandardMaterial color="#f5ebe0" />
          </mesh>

          {/* --- 四大精緻建築模組 --- */}
          <DetailedBuildings />

          {/* --- 跨領域動態協作光弧 (Synergy Lines，可由頂部按鈕開關) --- */}
          {showSynergyLines && (
            <group>
              <QuadraticBezierLine start={[-5.2, 2.5, -3.2]} end={[5.2, 2.5, -3.2]} mid={[0, 5.5, -3.2]} color="#e05a47" lineWidth={2.5} dashed dashScale={2} />
              <QuadraticBezierLine start={[5.2, 2.5, -3.2]} end={[4.8, 2.5, 3.8]} mid={[6.0, 5.0, 0.3]} color="#2b7a78" lineWidth={2.5} dashed dashScale={2} />
              <QuadraticBezierLine start={[-4.8, 2.5, 3.8]} end={[4.8, 2.5, 3.8]} mid={[0, 5.2, 4.2]} color="#3a86ff" lineWidth={2.5} dashed dashScale={2} />
              <QuadraticBezierLine start={[-5.2, 2.5, -3.2]} end={[4.8, 2.5, 3.8]} mid={[0, 6.2, 0]} color="#f59e0b" lineWidth={2.5} dashed dashScale={2} />
            </group>
          )}

          {/* --- 島上漫步的 5 位可愛學者與市民人偶 --- */}
          <CuteScholarCharacter startPos={[0, 0.05, 0.5]} shirtColor="#e05a47" hairColor="#1e293b" roleName="我 · 島主" speed={0.85} radius={2.2} phase={0} />
          <CuteScholarCharacter startPos={[-2.8, 0.05, -1.5]} shirtColor="#2b7a78" hairColor="#475569" roleName="句法學家" speed={0.95} radius={1.8} phase={1.5} />
          <CuteScholarCharacter startPos={[2.8, 0.05, -1.2]} shirtColor="#3a86ff" hairColor="#78350f" roleName="語料庫研究員" speed={1.05} radius={1.9} phase={3.0} />
          <CuteScholarCharacter startPos={[-2.2, 0.05, 2.2]} shirtColor="#10b981" hairColor="#334155" roleName="政策分析師" speed={0.9} radius={1.7} phase={4.2} />
          <CuteScholarCharacter startPos={[2.4, 0.05, 2.0]} shirtColor="#f59e0b" hairColor="#1e293b" roleName="AI 工程師" speed={1.1} radius={1.8} phase={5.5} />

          {/* --- 島嶼周圍的可愛樹木點綴 --- */}
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

      {/* 柔和地面接觸陰影 */}
      <ContactShadows position={[0, -3.2, 0]} opacity={0.45} scale={35} blur={2.8} far={6} />

      {/* 等角俯瞰感軌道相機控制 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        maxPolarAngle={Math.PI / 2.25}
        minPolarAngle={Math.PI / 6}
        minDistance={9}
        maxDistance={26}
        target={[0, 0.2, 0]}
      />
    </>
  );
}

// ==========================================
// 5. 頂層全螢幕懸浮 UI 儀表板（完全對齊 HEART 政策島佈局）
// ==========================================
export default function App() {
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

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#dcebe6' }}
    >
      {/* --------------------------------------------------
          底層：100% 滿版 3D 互動島嶼畫布
         -------------------------------------------------- */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}
      >
        <Canvas shadows camera={{ position: [0, 11.5, 16.5], fov: 40 }}>
          <IslandScene />
        </Canvas>
      </div>

      {/* --------------------------------------------------
          懸浮層 1：左上角品牌標誌 (HEART 政策島風格)
         -------------------------------------------------- */}
      <div className="absolute top-5 left-6 z-20 pointer-events-auto flex items-center gap-4">
        <div className="bg-[#fdfbf7]/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-stone-200/80">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black tracking-tight text-[#e05a47]">FLAME-EAGLE</span>
            <span className="text-sm font-extrabold text-slate-800">炎鷲橙果島</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 tracking-wider mt-0.5">
            ACADEMIC & AI ECOSYSTEM · 3D 知識群島
          </p>
        </div>
      </div>

      {/* --------------------------------------------------
          懸浮層 2：頂部中央膠囊工具列 (名牌 / 協作線 / 暫停 / 視角)
         -------------------------------------------------- */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto hidden md:flex items-center gap-2 bg-[#fdfbf7]/95 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-stone-200/80">
        <button
          onClick={toggleLabels}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            showLabels ? 'bg-slate-800 text-white shadow' : 'text-slate-600 hover:bg-stone-200/60'
          }`}
        >
          🏷️ 名牌
        </button>
        <button
          onClick={toggleSynergyLines}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            showSynergyLines ? 'bg-slate-800 text-white shadow' : 'text-slate-600 hover:bg-stone-200/60'
          }`}
        >
          🔗 協作線
        </button>
        <button
          onClick={togglePause}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
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

      {/* --------------------------------------------------
          懸浮層 3：左側詳細研究卡片 (點選建築或右側選單後疊加於圖面)
         -------------------------------------------------- */}
      {isModalOpen && mod && (
        <div className="absolute top-28 left-6 bottom-6 z-30 w-[390px] max-w-[90vw] bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200/90 rounded-3xl p-6 shadow-2xl pointer-events-auto flex flex-col justify-between overflow-hidden">
          <div className="overflow-y-auto pr-1 space-y-4">
            {/* 頂部編號與關閉按鈕 */}
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

            {/* 模組大標題與簡介 */}
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-snug">{mod.title}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{mod.summary}</p>
            </div>

            {/* 核心引述區塊 */}
            <div className="bg-stone-100/90 border-l-4 border-[#e05a47] p-3 rounded-r-xl text-xs text-slate-700 font-medium leading-relaxed">
              {mod.quote}
            </div>

            {/* 統計小標籤 */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-white border border-stone-200 px-3 py-1 rounded-full text-slate-700 shadow-sm">
                📄 {mod.stats.itemsCount}
              </span>
              <span className="text-[11px] font-bold bg-white border border-stone-200 px-3 py-1 rounded-full text-slate-700 shadow-sm">
                🔗 {mod.stats.synergyCount}
              </span>
            </div>

            {/* 研究細項清單（去識別化論文列表） */}
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

            {/* 線上 AI 應用系統啟動按鈕 */}
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
                    className="block bg-white hover:bg-rose-50/60 border border-stone-200 hover:border-[#e05a47] p-3.5 rounded-2xl shadow-sm transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800 group-hover:text-[#e05a47]">
                        {link.name}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {link.tag} ↗
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-normal">{link.desc}</p>
                  </a>
                ))}
              </div>
            )}

            {/* 跨模組協作關係標籤 */}
            {mod.synergyWith && (
              <div className="pt-2 border-t border-stone-200/80">
                <div className="text-[11px] font-bold text-slate-400 mb-2">和誰一起協作：</div>
                <div className="flex flex-wrap gap-1.5">
                  {mod.synergyWith.map((syn, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[11px] font-bold bg-stone-100 hover:bg-stone-200 text-slate-700 px-2.5 py-1 rounded-lg border border-stone-200"
                    >
                      ↔ {syn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------
          懸浮層 4：右側常駐目錄欄位 (THE RESEARCH INDEX)
         -------------------------------------------------- */}
      <aside className="absolute top-5 right-6 bottom-6 z-20 w-80 bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200/90 p-5 rounded-3xl shadow-2xl pointer-events-auto flex flex-col justify-between">
        <div className="overflow-y-auto pr-1">
          <div className="border-b border-stone-200 pb-3.5 mb-4">
            <h2 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
              THE RESEARCH INDEX
            </h2>
            <p className="text-lg font-black text-slate-800 mt-0.5">把理論與應用，連起來。</p>
            <p className="text-xs text-slate-500 mt-1">
              4 大研究群島 · 36 項去識別化成果 · 3 座 AI 系統
            </p>
          </div>

          {/* 4 大模組快速切換清單 */}
          <div className="space-y-2.5">
            {Object.entries(researchModules).map(([key, value]) => {
              const isSelected = activeModule === key && isModalOpen;
              return (
                <div
                  key={key}
                  onClick={() => {
                    setActiveModule(key);
                    setModalOpen(true);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50/90 border-[#e05a47] shadow-md'
                      : 'bg-white/80 border-stone-200/80 hover:bg-stone-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-black text-[#e05a47]">{value.id}</span>
                      <span className="text-xs font-extrabold text-slate-800">{value.shortTitle}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">
                      {value.stats.itemsCount.split(' ')[0]} ›
                    </span>
                  </div>
                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-rose-200/60 text-[11px] font-bold text-[#e05a47] flex items-center justify-between">
                      <span>探索此島嶼建築與著作清單</span>
                      <span>↗</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-[11px] font-medium text-slate-400 text-center border-t border-stone-200 pt-3">
          💡 拖曳旋轉 3D 島嶼 · 滾輪縮放 · 點擊建築探索
        </div>
      </aside>
    </div>
  );
}
