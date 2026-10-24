import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Html, QuadraticBezierLine } from '@react-three/drei';
import { create } from 'zustand';
import * as THREE from 'three';

// ==========================================
// 1. 全域狀態管理
// ==========================================
const useIslandStore = create((set) => ({
  activeModule: 'orange',
  setActiveModule: (moduleKey) => set({ activeModule: moduleKey }),
  persona: 'all',
  setPersona: (persona) => set({ persona }),
  isModalOpen: true,
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  showLabels: true,
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  showSynergyLines: true,
  toggleSynergyLines: () => set((s) => ({ showSynergyLines: !s.showSynergyLines })),
  isPaused: false,
  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
}));

// ==========================================
// 2. 六角島嶼與研究資料庫
// ==========================================
const researchModules = {
  orange: {
    id: '01',
    code: 'MODULE 01 · 核心主島',
    title: '橙果島：理論語言學與南島語研究殿堂',
    shortTitle: '橙果島 (理論語言學)',
    summary: '作為群島核心，探討人類語言底層結構、生成語法與句法語意介面，深入解析臺灣南島語之省略機制。',
    quote: '「從形式句法與類型學視角，解構南島語與漢語中看不見卻決定語意的深層語法結構。」',
    cameraPos: [0, 3.5, 5.2],
    center: [0, 0, 0],
    categories: [
      {
        name: '學位論文與理論專著',
        list: [
          '限定詞組省略理論研究：從南島語觀點出發 (Toward a Theory of DP Ellipsis)',
          '疑問詞問句及其左緣結構之研究 (Left Periphery and Wh-questions)',
        ],
      },
    ],
  },
  corpus: {
    id: '02',
    code: 'MODULE 02 · 實證計量島',
    title: '計量句法、語音與語料庫研究中心',
    shortTitle: '計量語料島',
    summary: '運用大規模口語與學習者語料庫，結合依存距離（MDD）與統計建模，剖析語音變異與詞彙常模。',
    quote: '「讓真實語料說話：從自由變異到偏誤類型，建立客觀可驗證的語言計量指標。」',
    cameraPos: [9.5, 3.5, -5.5],
    center: [9.5, 0, -5.5],
    categories: [
      {
        name: '語音變異與學習者語料庫期刊論文',
        list: [
          '標準之外的聲音：從語料庫證據反思華語語音教學與語言規範',
          '華語學習者語料庫語音偏誤研究：以不送氣舌尖後翹舌音為例',
        ],
      },
    ],
  },
  policy: {
    id: '03',
    code: 'MODULE 03 · 社會政策島',
    title: '社會語言學與教育政策智庫',
    shortTitle: '社會政策島',
    summary: '結合語料庫輔助批評論述分析（CADS）與跨國教育制度比較，探討議會政治言談與多語教育政策。',
    quote: '「連結語言證據與公共治理：從課綱教科書體檢到國際多語教育借鑑。」',
    cameraPos: [-9.5, 3.5, -5.5],
    center: [-9.5, 0, -5.5],
    categories: [
      {
        name: '教育政策與教科書研究期刊論文',
        list: [
          '高中公民與社會教科書學術詞彙之比較研究（TSSCI 第二級）',
          '中小學營養午餐政策研究：現況、挑戰與國際借鑑',
        ],
      },
    ],
  },
  systems: {
    id: '04',
    code: 'MODULE 04 · AI 實踐島',
    title: '前線 AI 應用與實踐工坊',
    shortTitle: 'AI 實踐島',
    summary: '將依存句法複雜度演算法（MDD）、語音辨識轉寫技術與測驗字頻常模，轉化為可即時互動的三大線上 AI 系統。',
    quote: '「從理論建模到程式實作，打造服務教育現場與研究社群的智慧化開源工具。」',
    cameraPos: [0, 3.5, 11.0],
    center: [0, 0, 11.0],
    isSystems: true,
    links: [
      { name: '🤖 AI 華語文句法難度自動檢測系統', url: 'https://twmddanalyzer.streamlit.app/' },
      { name: '🎙️ 自動語音轉文字與語料庫分析系統', url: 'https://twpoliticolstt.streamlit.app/' },
      { name: '📊 中小學英語測驗單字頻率檢索系統', url: 'https://twvocfreqexam.streamlit.app/' },
    ],
  },
};

// ==========================================
// 3. 六角島嶼邊緣道路與橋樑行走的避障 AI
// ==========================================
function HexPathWalker({ data }) {
  const { islandCenter, speed = 0.8, role, shirt, bottom, hair, isPet = false, petColor = '#d97706', petName = '柴柴' } = data;
  const groupRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !groupRef.current) return;
    const t = clock.getElapsedTime() * speed;
    const angle = t * 0.5;
    const r = 3.2;
    const x = islandCenter[0] + Math.cos(angle) * r;
    const z = islandCenter[2] + Math.sin(angle) * r;
    const bounce = Math.abs(Math.sin(t * 6)) * (isPet ? 0.04 : 0.07);

    groupRef.current.position.set(x, 0.05 + bounce, z);
    groupRef.current.rotation.y = -angle + Math.PI / 2;
  });

  if (isPet) {
    return (
      <group ref={groupRef} scale={[0.4, 0.4, 0.4]}>
        <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.42, 8, 12]} />
          <meshStandardMaterial color={petColor} />
        </mesh>
        {showLabels && (
          <Html position={[0, 1.1, 0]} center distanceFactor={22}>
            <div className="bg-amber-50/90 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-amber-900 border border-amber-200 whitespace-nowrap pointer-events-none">
              🐶 {petName}
            </div>
          </Html>
        )}
      </group>
    );
  }

  return (
    <group ref={groupRef} scale={[0.45, 0.45, 0.45]}>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.3, 0.6, 12]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <group position={[0, 1.38, 0]}>
        <mesh castShadow><sphereGeometry args={[0.35, 14, 14]} /><meshStandardMaterial color="#ffedd5" /></mesh>
        <mesh position={[0, 0.1, -0.03]}><sphereGeometry args={[0.36, 12, 12]} /><meshStandardMaterial color={hair} /></mesh>
      </group>
      {showLabels && (
        <Html position={[0, 2.1, 0]} center distanceFactor={20}>
          <div className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow-sm border border-slate-300 whitespace-nowrap pointer-events-none">
            {role}
          </div>
        </Html>
      )}
    </group>
  );
}

// ==========================================
// 4. 海上與天空生態（商船、海豚、海鷗）
// ==========================================
function CargoShip({ startZ, speed, flagColor }) {
  const shipRef = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !shipRef.current) return;
    const t = clock.getElapsedTime() * speed;
    const x = ((t * 4) % 65) - 32;
    shipRef.current.position.set(x, -0.95, startZ);
  });

  return (
    <group ref={shipRef} position={[-32, -0.95, startZ]} scale={[0.8, 0.8, 0.8]}>
      <mesh castShadow><boxGeometry args={[5.2, 1.1, 2.0]} /><meshStandardMaterial color="#1e293b" /></mesh>
      <mesh position={[0, 0.7, 0]}><boxGeometry args={[4.2, 0.9, 1.8]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
      <mesh position={[2.0, 1.6, 0]}><cylinderGeometry args={[0.03, 0.03, 1.5]} /><meshStandardMaterial color="#64748b" /></mesh>
      <mesh position={[2.0, 2.1, 0]}><boxGeometry args={[0.35, 0.22, 0.04]} /><meshStandardMaterial color={flagColor} /></mesh>
    </group>
  );
}

function JumpingDolphin({ radius, speed, offset }) {
  const dolRef = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !dolRef.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    const angle = t * 0.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = -1.0 + Math.abs(Math.sin(t * 2)) * 1.2;
    dolRef.current.position.set(x, y, z);
    dolRef.current.rotation.y = -angle + Math.PI / 2;
  });

  return (
    <group ref={dolRef} scale={[0.5, 0.5, 0.5]}>
      <mesh castShadow><capsuleGeometry args={[0.3, 1.2, 8, 12]} /><meshStandardMaterial color="#0284c7" /></mesh>
    </group>
  );
}

function FlyingSeagulls() {
  const gRef = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !gRef.current) return;
    const t = clock.getElapsedTime() * 0.6;
    const angle = t * 0.5;
    gRef.current.position.set(Math.cos(angle) * 22, 9.5 + Math.sin(t * 3) * 0.6, Math.sin(angle) * 20);
    gRef.current.rotation.y = -angle;
  });

  return (
    <group ref={gRef}>
      <mesh><boxGeometry args={[0.8, 0.04, 0.25]} /><meshStandardMaterial color="#ffffff" /></mesh>
    </group>
  );
}

// 樹木元件
function CuteTree({ position, scale = 1, color = '#52b788' }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.4, 0]} castShadow><cylinderGeometry args={[0.12, 0.18, 0.8, 10]} /><meshStandardMaterial color="#9c6644" /></mesh>
      <mesh position={[0, 1.0, 0]} castShadow><sphereGeometry args={[0.55, 14, 14]} /><meshStandardMaterial color={color} /></mesh>
    </group>
  );
}

// ==========================================
// 5. 外海無人島與衛星島嶼生態
// ==========================================
function UninhabitedAndSatelliteIslands() {
  const windmillRef = useRef();
  const boatRef = useRef();
  const { showLabels, isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime();
    if (windmillRef.current) windmillRef.current.rotation.z = t * 1.2;
    if (boatRef.current) {
      boatRef.current.position.y = -0.85 + Math.sin(t * 2) * 0.08;
      boatRef.current.rotation.z = Math.sin(t * 1.5) * 0.06;
    }
  });

  return (
    <group>
      {/* 燈塔觀測站島 */}
      <group position={[-18.5, -0.3, -14.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow><cylinderGeometry args={[3.6, 4.2, 1.2, 20]} /><meshStandardMaterial color="#95d5b2" /></mesh>
        <mesh position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[0.45, 0.75, 2.4, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0, 2.95, 0]} castShadow><coneGeometry args={[0.6, 0.5, 16]} /><meshStandardMaterial color="#e05a47" /></mesh>
        {showLabels && <Html position={[0, 3.8, 0]} center distanceFactor={28}><div className="bg-white/85 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow whitespace-nowrap">🏝️ 燈塔觀測站島</div></Html>}
      </group>

      {/* 綠能風車島 */}
      <group position={[19.5, -0.3, -13.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow><cylinderGeometry args={[4.0, 4.6, 1.2, 20]} /><meshStandardMaterial color="#74c69d" /></mesh>
        <group position={[0, 2.7, 0.25]} ref={windmillRef}><mesh><boxGeometry args={[2.4, 0.18, 0.05]} /><meshStandardMaterial color="#ffffff" /></mesh></group>
        {showLabels && <Html position={[0, 4.2, 0]} center distanceFactor={28}><div className="bg-white/85 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow whitespace-nowrap">🏝️ 綠能風車島</div></Html>}
      </group>

      {/* 櫻花沙龍島 */}
      <group position={[18.5, -0.3, 14.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow><cylinderGeometry args={[3.4, 4.0, 1.1, 20]} /><meshStandardMaterial color="#95d5b2" /></mesh>
        <CuteTree position={[-1.2, 0.2, -0.5]} scale={1.1} color="#f472b6" />
        <CuteTree position={[1.3, 0.2, 0.8]} scale={0.95} color="#f9a8d4" />
        {showLabels && <Html position={[0, 3.0, 0]} center distanceFactor={28}><div className="bg-white/85 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow whitespace-nowrap">🏝️ 櫻花沙龍島</div></Html>}
      </group>

      {/* 遠洋港灣島與漂浮小帆船 */}
      <group position={[-18.0, -0.3, 14.0]}>
        <mesh position={[0, -0.3, 0]} receiveShadow><cylinderGeometry args={[3.2, 3.8, 1.1, 20]} /><meshStandardMaterial color="#95d5b2" /></mesh>
        <CuteTree position={[-0.8, 0.2, -0.6]} scale={1.0} color="#52b788" />
        {showLabels && <Html position={[0, 2.8, 0]} center distanceFactor={28}><div className="bg-white/85 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow whitespace-nowrap">🏝️ 遠洋港灣島</div></Html>}
      </group>

      <group ref={boatRef} position={[-12.5, -0.85, 11.5]}>
        <mesh castShadow><boxGeometry args={[1.6, 0.4, 0.8]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0.1, 0.95, 0]} rotation={[0, 0, -0.1]}><coneGeometry args={[0.65, 1.3, 3]} /><meshStandardMaterial color="#fef08a" /></mesh>
      </group>
    </group>
  );
}

// ==========================================
// 6. 單座六角島嶼結構（橙果島與其他主題島）
// ==========================================
const HexIsland = ({ center, color, title, moduleKey, mainBuildingType }) => {
  const { activeModule, setActiveModule, setModalOpen, showLabels } = useIslandStore();
  const isSelected = activeModule === moduleKey;

  const handleClick = (e) => {
    e.stopPropagation();
    setActiveModule(moduleKey);
    setModalOpen(true);
  };

  return (
    <group position={center} onClick={handleClick}>
      <mesh position={[0, -0.4, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.5, 4.2, 0.8, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[4.2, 3.6, 0.6, 6]} />
        <meshStandardMaterial color="#d4a373" roughness={0.8} />
      </mesh>

      {/* 特色主建築 */}
      {mainBuildingType === 'orange' && (
        <group position={[0, 0.5, 0]}>
          <mesh castShadow><boxGeometry args={[2.2, 1.6, 2.2]} /><meshStandardMaterial color="#fff8f0" /></mesh>
          <mesh position={[0, 1.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[1.6, 1.0, 4]} /><meshStandardMaterial color="#e05a47" /></mesh>
        </group>
      )}
      {mainBuildingType === 'corpus' && (
        <group position={[0, 0.6, 0]}>
          <mesh castShadow><boxGeometry args={[2.0, 2.0, 2.0]} /><meshStandardMaterial color="#f1f5f9" /></mesh>
          <mesh position={[0, 1.3, 0]} castShadow><cylinderGeometry args={[0.7, 0.8, 0.6, 16]} /><meshStandardMaterial color="#06b6d4" /></mesh>
        </group>
      )}
      {mainBuildingType === 'policy' && (
        <group position={[0, 0.5, 0]}>
          <mesh castShadow><boxGeometry args={[2.4, 1.4, 2.2]} /><meshStandardMaterial color="#fdfbf7" /></mesh>
          <mesh position={[0, 1.1, 0]} castShadow><sphereGeometry args={[1.0, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#52b788" /></mesh>
        </group>
      )}
      {mainBuildingType === 'systems' && (
        <group position={[0, 0.6, 0]}>
          <mesh castShadow><cylinderGeometry args={[1.2, 1.4, 1.6, 16]} /><meshStandardMaterial color="#fffbeb" /></mesh>
          <mesh position={[0, 1.4, 0]} castShadow><octahedronGeometry args={[0.7]} /><meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} /></mesh>
        </group>
      )}

      {/* 修正後的附屬建築與樹木裝飾（括號已完整閉合） */}
      <mesh position={[-2.2, 0.3, -1.8]} castShadow>
        <boxGeometry args={[1.1, 0.9, 1.1]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <CuteTree position={[2.2, 0, 2.0]} scale={0.9} />

      {showLabels && (
        <Html position={[0, 2.6, 0]} center distanceFactor={18}>
          <div className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap transition-transform hover:scale-105 ${
            isSelected ? 'bg-rose-600 text-white border-rose-400' : 'bg-white/95 text-slate-800 border-slate-200'
          }`}>
            {title}
          </div>
        </Html>
      )}
    </group>
  );
};

// ==========================================
// 7. 島與島之間的連接橋樑
// ==========================================
const IslandBridge = ({ start, end }) => {
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  const length = Math.hypot(end[0] - start[0], end[2] - start[2]);
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0]);

  return (
    <group position={[midX, -0.35, midZ]} rotation={[0, -angle, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[length, 0.12, 0.8]} />
        <meshStandardMaterial color="#b08968" roughness={0.7} />
      </mesh>
    </group>
  );
};

// ==========================================
// 8. 3D 群島總場景與鏡頭聚焦
// ==========================================
function IslandScene({ controlsRef }) {
  const { viewport } = useThree();
  const { activeModule } = useIslandStore();

  const responsiveScale = useMemo(() => {
    const minDim = Math.min(viewport.width, viewport.height);
    return Math.max(0.8, Math.min(1.2, minDim / 12.0));
  }, [viewport.width, viewport.height]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const mod = researchModules[activeModule];
    if (mod && mod.cameraPos) {
      const targetPos = new THREE.Vector3(...mod.cameraPos);
      const lookTarget = new THREE.Vector3(...mod.center);
      controls.object.position.lerp(targetPos, 0.05);
      controls.target.lerp(lookTarget, 0.05);
      controls.update();
    }
  });

  return (
    <>
      <color attach="background" args={['#bae6fd']} />
      <ambientLight intensity={1.35} color="#fffcf2" />
      <directionalLight position={[18, 35, 22]} intensity={1.65} color="#fff8e7" castShadow />

      <group scale={[responsiveScale, responsiveScale, responsiveScale]} position={[0, -0.5, 0]}>
        {/* 汪洋大海與保留的外海無人島 */}
        <mesh position={[0, -1.25, 0]} receiveShadow>
          <cylinderGeometry args={[65, 65, 0.8, 64]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.25} />
        </mesh>

        <UninhabitedAndSatelliteIslands />
        <CargoShip startZ={-8} speed={0.9} flagColor="#ef4444" />
        <JumpingDolphin radius={15} speed={0.8} offset={0} />
        <FlyingSeagulls />

        {/* 橋樑連接 */}
        <IslandBridge start={[0, 0, 0]} end={[9.5, 0, -5.5]} />
        <IslandBridge start={[0, 0, 0]} end={[-9.5, 0, -5.5]} />
        <IslandBridge start={[0, 0, 0]} end={[0, 0, 11.0]} />

        {/* 四大六角島嶼（主島為橙果島） */}
        <HexIsland center={[0, 0, 0]} color="#95d5b2" title="🍊 橙果島 (核心主島)" moduleKey="orange" mainBuildingType="orange" />
        <HexIsland center={[9.5, 0, -5.5]} color="#74c69d" title="📊 計量語料島" moduleKey="corpus" mainBuildingType="corpus" />
        <HexIsland center={[-9.5, 0, -5.5]} color="#52b788" title="🏫 社會政策島" moduleKey="policy" mainBuildingType="policy" />
        <HexIsland center={[0, 0, 11.0]} color="#ffb703" title="⚡ AI 實踐島" moduleKey="systems" mainBuildingType="systems" />

        {/* 行人與萌寵在六角島邊緣道路與橋樑防撞行走 */}
        <HexPathWalker data={{ islandCenter: [0, 0, 0], speed: 0.8, role: '橙果居民 A', shirt: '#3b82f6', bottom: '#1e293b', hair: '#1e293b' }} />
        <HexPathWalker data={{ islandCenter: [9.5, 0, -5.5], speed: 0.75, role: '語料研究員', shirt: '#ec4899', bottom: '#be185d', hair: '#451a03' }} />
        <HexPathWalker data={{ islandCenter: [0, 0, 11.0], speed: 1.1, isPet: true, petColor: '#d97706', petName: '柴柴' }} />
      </group>

      <OrbitControls ref={controlsRef} enablePan enableZoom minDistance={3.5} maxDistance={52} />
    </>
  );
}

// ==========================================
// 9. 頂層 App 主元件
// ==========================================
export default function App() {
  const controlsRef = useRef();
  const { activeModule, setActiveModule, isModalOpen, setModalOpen, showLabels, toggleLabels, isPaused, togglePause } = useIslandStore();
  const mod = activeModule ? researchModules[activeModule] : null;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-sky-300">
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas shadows camera={{ position: [0, 12.5, 18.5], fov: 42 }}>
          <IslandScene controlsRef={controlsRef} />
        </Canvas>
      </div>

      <div className="absolute top-5 left-6 z-20 pointer-events-auto">
        <div className="bg-[#fdfbf7]/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-stone-200">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black tracking-tight text-[#e05a47]">FLAME-EAGLE</span>
            <span className="text-sm font-extrabold text-slate-800">橙果島群島世界</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">六角群島 · 無人島生態系</p>
        </div>
      </div>

      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto hidden md:flex items-center gap-2 bg-[#fdfbf7]/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-stone-200">
        <button onClick={toggleLabels} className={`px-3 py-1.5 rounded-full text-xs font-bold ${showLabels ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>🏷️ 名牌</button>
        <button onClick={togglePause} className={`px-3 py-1.5 rounded-full text-xs font-bold ${isPaused ? 'bg-rose-600 text-white' : 'text-slate-600'}`}>{isPaused ? '▶️ 繼續' : '⏸️ 暫停'}</button>
      </div>

      {isModalOpen && mod && (
        <div className="absolute top-24 left-6 bottom-20 z-30 w-[390px] max-w-[90vw] bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200 rounded-3xl p-6 shadow-2xl pointer-events-auto flex flex-col justify-between overflow-hidden">
          <div className="overflow-y-auto pr-1 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-[#e05a47] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">{mod.code}</span>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-stone-100 w-7 h-7 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{mod.title}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{mod.summary}</p>
            </div>
            {mod.isSystems && (
              <div className="space-y-2.5 pt-2">
                {mod.links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="block bg-white hover:bg-rose-50 border border-stone-200 hover:border-[#e05a47] p-3 rounded-2xl shadow-sm">
                    <span className="text-xs font-extrabold text-slate-800">{link.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <aside className="absolute top-5 right-6 bottom-20 z-20 w-80 bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200 p-5 rounded-3xl shadow-2xl pointer-events-auto flex flex-col justify-between">
        <div className="overflow-y-auto pr-1">
          <div className="border-b border-stone-200 pb-3.5 mb-4">
            <h2 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">THE RESEARCH INDEX</h2>
            <p className="text-lg font-black text-slate-800 mt-0.5">六角群島導覽</p>
          </div>
          <div className="space-y-2.5">
            {Object.entries(researchModules).map(([key, value]) => {
              const isSelected = activeModule === key && isModalOpen;
              return (
                <div key={key} onClick={() => { setActiveModule(key); setModalOpen(true); }} className={`p-3.5 rounded-2xl border cursor-pointer ${isSelected ? 'bg-rose-50 border-[#e05a47] shadow-md' : 'bg-white border-stone-200 hover:bg-stone-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-black text-[#e05a47]">{value.id}</span>
                      <span className="text-xs font-extrabold text-slate-800">{value.shortTitle}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
