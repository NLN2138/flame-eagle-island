import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Html, QuadraticBezierLine } from '@react-three/drei';
import { create } from 'zustand';
import * as THREE from 'three';

// ==========================================
// 1. 全域狀態管理
// ==========================================
const useIslandStore = create((set) => ({
  activeModule: 'systems',
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
// 2. 去識別化研究與系統資料庫
// ==========================================
const researchModules = {
  theory: {
    id: '01',
    code: 'MODULE 01 · 理論基石',
    title: '理論語言學與南島語研究殿堂',
    shortTitle: '理論語言學與南島語',
    summary: '探討人類語言底層結構、生成語法與句法語意介面，深入解析臺灣南島語之省略機制與左緣結構。',
    quote: '「從形式句法與類型學視角，解構南島語與漢語中看不見卻決定語意的深層語法結構。」',
    stats: { itemsCount: '10 項著作', synergyCount: '2 條協作' },
    synergyWith: ['02 計量與語料庫中心', '04 前線 AI 實踐工坊'],
    categories: [
      {
        name: '學位論文與理論專著',
        list: [
          '限定詞組省略理論研究：從南島語觀點出發 (Toward a Theory of DP Ellipsis: A Formosan Perspective)',
          '疑問詞問句及其左緣結構之研究 (Left Periphery and Wh-questions)',
        ],
      },
    ],
  },
  corpus: {
    id: '02',
    code: 'MODULE 02 · 實證計量',
    title: '計量句法、語音與語料庫研究中心',
    shortTitle: '計量句法與語料庫',
    summary: '運用大規模口語與學習者語料庫，結合依存距離（MDD）與統計建模，剖析語音變異、習得偏誤與詞彙常模。',
    quote: '「讓真實語料說話：從自由變異到偏誤類型，建立客觀可驗證的語言計量指標。」',
    stats: { itemsCount: '13 項研究', synergyCount: '3 條協作' },
    synergyWith: ['01 理論語言學殿堂', '03 社會政策智庫', '04 前線 AI 實踐工坊'],
    categories: [
      {
        name: '語音變異與學習者語料庫期刊論文',
        list: [
          '標準之外的聲音：從語料庫證據反思華語語音教學與語言規範',
          '華語學習者語料庫語音偏誤研究：以不送氣舌尖後翹舌音、舌根鼻音和輕聲為例',
        ],
      },
    ],
  },
  policy: {
    id: '03',
    code: 'MODULE 03 · 政策治理',
    title: '社會語言學與教育政策智庫',
    shortTitle: '社會語言學與政策智庫',
    summary: '結合語料庫輔助批評論述分析（CADS）與跨國教育制度比較，探討議會政治言談、教科書詞彙與多語教育政策。',
    quote: '「連結語言證據與公共治理：從課綱教科書體檢到國際多語教育借鑑。」',
    stats: { itemsCount: '13 項研究', synergyCount: '2 條協作' },
    synergyWith: ['02 計量與語料庫中心', '04 前線 AI 實踐工坊'],
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
    code: 'MODULE 04 · 系統落地',
    title: '前線 AI 應用與實踐工坊',
    shortTitle: '前線 AI 應用工坊',
    summary: '將依存句法複雜度演算法（MDD）、語音辨識轉寫技術與測驗字頻常模，轉化為可即時互動的三大線上 AI 系統。',
    quote: '「從理論建模到程式實作，打造服務教育現場與研究社群的智慧化開源工具。」',
    stats: { itemsCount: '3 座線上系統', synergyCount: '3 條協作' },
    synergyWith: ['01 理論語言學殿堂', '02 計量與語料庫中心', '03 社會政策智庫'],
    isSystems: true,
    links: [
      { name: '🤖 AI 華語文句法難度自動檢測系統', desc: '基於依存距離（DD）與平均依存距離（MDD）之自動文本複雜度診斷平台。', tag: '句法演算', url: 'https://twmddanalyzer.streamlit.app/' },
      { name: '🎙️ 自動語音轉文字與語料庫分析系統', desc: '整合高精度語音辨識（STT）、斷詞標註與語料庫共現檢索之自動化分析工具。', tag: '語音語料', url: 'https://twpoliticolstt.streamlit.app/' },
      { name: '📊 中小學英語測驗單字頻率檢索系統', desc: '串接歷屆大型英語測驗與課綱字表常模，提供教育工作者即時詞頻診斷服務。', tag: '詞頻常模', url: 'https://twvocfreqexam.streamlit.app/' },
    ],
  },
};

// ==========================================
// 3. 智慧防撞步道走路者與動物元件
// ==========================================
function SafeWalkerOrPet({ data }) {
  const { startPos, speed = 0.8, role, shirt, bottom, hair, isPet = false, petColor = '#d97706', petName = '柴柴' } = data;
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !groupRef.current) return;
    const t = clock.getElapsedTime() * speed;

    // 定義安全路徑節點：沿著中央廣場 (0,0) 與十字走廊移動，絕對不進入建築物範圍
    const angle = t * 0.45;
    let x = Math.cos(angle) * (2.2 + (Math.sin(t * 0.5) * 0.8));
    let z = Math.sin(angle * 1.2) * (2.2 + (Math.cos(t * 0.5) * 0.8));

    // 嚴格碰撞防禦網：若靠近任何建築物中心，自動將座標向外推開
    const buildings = [
      { x: -5.2, z: -3.2, r: 1.8 }, // 建築 01
      { x: 5.2, z: -3.2, r: 1.8 },  // 建築 02
      { x: -4.8, z: 3.8, r: 1.8 },  // 建築 03
      { x: 4.8, z: 3.8, r: 1.8 },   // 建築 04
    ];

    buildings.forEach((b) => {
      const dist = Math.hypot(x - b.x, z - b.z);
      if (dist < b.r) {
        // 自動導向安全區
        x += (x - b.x) * 0.5;
        z += (z - b.z) * 0.5;
      }
    });

    const bounce = Math.abs(Math.sin(t * 6)) * (isPet ? 0.05 : 0.08);
    groupRef.current.position.set(x, (isPet ? 0.02 : 0.05) + bounce, z);
    
    const nextX = x + Math.cos(angle + 0.1) * 0.1;
    const nextZ = z + Math.sin(angle + 0.1) * 0.1;
    groupRef.current.rotation.y = Math.atan2(nextX - x, nextZ - z);

    const swing = Math.sin(t * 6) * 0.5;
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
  });

  if (isPet) {
    return (
      <group ref={groupRef} position={startPos} scale={[0.4, 0.4, 0.4]}>
        <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.42, 8, 12]} />
          <meshStandardMaterial color={petColor} />
        </mesh>
        <group position={[0, 0.58, 0.32]}>
          <mesh castShadow><sphereGeometry args={[0.22, 12, 12]} /><meshStandardMaterial color={petColor} /></mesh>
        </group>
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
    <group ref={groupRef} position={startPos} scale={[0.48, 0.48, 0.48]}>
      <group position={[-0.14, 0.35, 0]} ref={leftLegRef}>
        <mesh position={[0, -0.18, 0]} castShadow><boxGeometry args={[0.15, 0.35, 0.16} /><meshStandardMaterial color={bottom} /></mesh>
      </group>
      <group position={[0.14, 0.35, 0]} ref={rightLegRef}>
        <mesh position={[0, -0.18, 0]} castShadow><boxGeometry args={[0.15, 0.35, 0.16} /><meshStandardMaterial color={bottom} /></mesh>
      </group>
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
// 4. 海上活動與動態元素
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

function SurferAndDog({ angleOffset, radius }) {
  const surfRef = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !surfRef.current) return;
    const t = clock.getElapsedTime() * 0.9 + angleOffset;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    surfRef.current.position.set(x, -1.05 + Math.sin(t * 6) * 0.08, z);
    surfRef.current.rotation.y = -t + Math.PI / 2;
  });

  return (
    <group ref={surfRef}>
      <mesh rotation={[0, 0, 0.1]} castShadow><boxGeometry args={[1.8, 0.12, 0.55]} /><meshStandardMaterial color="#facc15" /></mesh>
      <mesh position={[0, 0.45, 0]}><capsuleGeometry args={[0.18, 0.4, 8, 12]} /><meshStandardMaterial color="#ea580c" /></mesh>
    </group>
  );
}

function Sunbather({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[0.2, 0, 0]} position={[0, 0.05, 0]}>
        <boxGeometry args={[0.7, 0.08, 1.2]} /><meshStandardMaterial color="#f43f5e" />
      </mesh>
      <mesh position={[0, 0.2, -0.2]}>
        <capsuleGeometry args={[0.22, 0.5, 8, 12]} /><meshStandardMaterial color="#fcd34d" />
      </mesh>
    </group>
  );
}

// ==========================================
// 5. 四大建築與島嶼群 (無「備用」字眼，綠能風車島有橋相連)
// ==========================================
function DetailedBuildings() {
  const { activeModule, setActiveModule, setModalOpen, showLabels } = useIslandStore();
  const handleSelect = (key, e) => { e.stopPropagation(); setActiveModule(key); setModalOpen(true); };

  return (
    <>
      <group position={[-5.2, 0, -3.2]} onClick={(e) => handleSelect('theory', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow><boxGeometry args={[3.4, 0.4, 3.0]} /><meshStandardMaterial color="#e6ccb2" /></mesh>
        <mesh position={[0, 1.1, 0]} castShadow><boxGeometry args={[2.8, 1.4, 2.4]} /><meshStandardMaterial color="#fff8f0" /></mesh>
        {showLabels && (
          <Html position={[0, 3.8, 0]} center distanceFactor={18}>
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap ${activeModule === 'theory' ? 'bg-rose-600 text-white' : 'bg-white/95 text-slate-800'}`}>
              01 🏛️ 理論語言學殿堂
            </div>
          </Html>
        )}
      </group>

      <group position={[5.2, 0, -3.2]} onClick={(e) => handleSelect('corpus', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow><boxGeometry args={[3.4, 0.4, 3.0]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
        <mesh position={[-0.4, 1.5, 0]} castShadow><boxGeometry args={[2.0, 2.2, 2.0]} /><meshStandardMaterial color="#f1f5f9" /></mesh>
        {showLabels && (
          <Html position={[0, 3.8, 0]} center distanceFactor={18}>
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap ${activeModule === 'corpus' ? 'bg-teal-700 text-white' : 'bg-white/95 text-slate-800'}`}>
              02 📊 計量與語料庫中心
            </div>
          </Html>
        )}
      </group>

      <group position={[-4.8, 0, 3.8]} onClick={(e) => handleSelect('policy', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow><boxGeometry args={[3.6, 0.4, 3.2]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
        <mesh position={[0, 1.15, -0.1]} castShadow><boxGeometry args={[2.8, 1.5, 2.2]} /><meshStandardMaterial color="#fdfbf7" /></mesh>
        {showLabels && (
          <Html position={[0, 3.8, 0]} center distanceFactor={18}>
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap ${activeModule === 'policy' ? 'bg-blue-600 text-white' : 'bg-white/95 text-slate-800'}`}>
              03 🏫 社會政策智庫
            </div>
          </Html>
        )}
      </group>

      <group position={[4.8, 0, 3.8]} onClick={(e) => handleSelect('systems', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow><boxGeometry args={[3.5, 0.4, 3.2]} /><meshStandardMaterial color="#fed7aa" /></mesh>
        <mesh position={[-0.3, 1.2, 0]} castShadow><boxGeometry args={[2.3, 1.6, 2.2]} /><meshStandardMaterial color="#fffbeb" /></mesh>
        {showLabels && (
          <Html position={[0, 3.8, 0]} center distanceFactor={18}>
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap ${activeModule === 'systems' ? 'bg-amber-500 text-white' : 'bg-amber-50/95 text-amber-900'}`}>
              04 ⚡ 前線 AI 實踐工坊
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

function OceanAndSatelliteIslands() {
  const windmillRef = useRef();
  const { showLabels, isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime();
    if (windmillRef.current) windmillRef.current.rotation.z = t * 1.2;
  });

  return (
    <group>
      {/* 燈塔觀測站島 */}
      <group position={[-16.5, -0.3, -11.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow><cylinderGeometry args={[3.6, 4.2, 1.2, 20]} /><meshStandardMaterial color="#95d5b2" /></mesh>
        {showLabels && (
          <Html position={[0, 2.5, 0]} center distanceFactor={28}>
            <div className="bg-white/85 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow whitespace-nowrap">🏝️ 燈塔觀測站島</div>
          </Html>
        )}
      </group>

      {/* 綠能風車島（有木橋與本島相連） */}
      <group position={[17.5, -0.3, -10.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow><cylinderGeometry args={[4.0, 4.6, 1.2, 20]} /><meshStandardMaterial color="#74c69d" /></mesh>
        <group position={[0, 2.7, 0.25]} ref={windmillRef}>
          <mesh><boxGeometry args={[2.4, 0.18, 0.05]} /><meshStandardMaterial color="#ffffff" /></mesh>
        </group>
        {showLabels && (
          <Html position={[0, 3.5, 0]} center distanceFactor={28}>
            <div className="bg-white/85 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow whitespace-nowrap">🏝️ 綠能風車島</div>
          </Html>
        )}
      </group>

      {/* 連結本島與綠能風車島的木橋 */}
      <group position={[11.5, -0.3, -5.5]} rotation={[0, -0.5, 0]}>
        <mesh castShadow><boxGeometry args={[7.0, 0.15, 0.8]} /><meshStandardMaterial color="#b08968" /></mesh>
      </group>
    </group>
  );
}

// ==========================================
// 6. 3D 主場景組裝
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
      <ambientLight intensity={1.35} color="#fffcf2" />
      <directionalLight position={[18, 35, 22]} intensity={1.65} color="#fff8e7" castShadow />

      <group scale={[responsiveScale, responsiveScale, responsiveScale]} position={[0, -0.5, 0]}>
        <mesh position={[0, -1.25, 0]} receiveShadow>
          <cylinderGeometry args={[65, 65, 0.8, 32]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.25} />
        </mesh>

        <OceanAndSatelliteIslands />
        <CargoShip startZ={-8} speed={0.9} flagColor="#ef4444" />
        <SurferAndDog angleOffset={0} radius={11.2} />

        <Float speed={0.5} rotationIntensity={0.008} floatIntensity={0.03}>
          <mesh position={[0, -0.45, 0]} receiveShadow><cylinderGeometry args={[10.6, 10.2, 0.9, 32]} /><meshStandardMaterial color="#95d5b2" /></mesh>
          <Sunbather position={[7.5, 0.05, 4.0]} />
          
          <DetailedBuildings />

          {/* 具備智慧避障防撞功能的行人與萌寵 */}
          <SafeWalkerOrPet data={{ startPos: [0, 0.05, 0], speed: 0.8, role: '行人 A', shirt: '#3b82f6', bottom: '#1e293b', hair: '#1e293b' }} />
          <SafeWalkerOrPet data={{ startPos: [-2, 0.05, 1], speed: 0.75, role: '行人 B', shirt: '#ec4899', bottom: '#be185d', hair: '#451a03' }} />
          <SafeWalkerOrPet data={{ startPos: [1.5, 0.05, -1], speed: 0.85, role: '行人 C', shirt: '#10b981', bottom: '#065f46', hair: '#78350f' }} />
          <SafeWalkerOrPet data={{ startPos: [-1, 0.02, -2], speed: 1.1, isPet: true, petColor: '#d97706', petName: '柴柴' }} />
          <SafeWalkerOrPet data={{ startPos: [2, 0.02, 2], speed: 1.0, isPet: true, petColor: '#fb923c', petName: '胖橘貓' }} />

          {showSynergyLines && (
            <QuadraticBezierLine start={[-5.2, 2.5, -3.2]} end={[5.2, 2.5, -3.2]} mid={[0, 5.5, -3.2]} color="#e05a47" lineWidth={2} dashed />
          )}
        </Float>
      </group>

      <OrbitControls ref={controlsRef} enablePan enableZoom minDistance={3.5} maxDistance={52} target={[0, 0.2, 0]} />
    </>
  );
}

// ==========================================
// 7. 頂層 App 主元件
// ==========================================
export default function App() {
  const controlsRef = useRef();
  const { activeModule, setActiveModule, isModalOpen, setModalOpen, showLabels, toggleLabels, showSynergyLines, toggleSynergyLines, isPaused, togglePause } = useIslandStore();
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
            <span className="text-sm font-extrabold text-slate-800">炎鷲橙果島</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">ACADEMIC & AI ARCHIPELAGO</p>
        </div>
      </div>

      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto hidden md:flex items-center gap-2 bg-[#fdfbf7]/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-stone-200">
        <button onClick={toggleLabels} className={`px-3 py-1.5 rounded-full text-xs font-bold ${showLabels ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>🏷️ 名牌</button>
        <button onClick={toggleSynergyLines} className={`px-3 py-1.5 rounded-full text-xs font-bold ${showSynergyLines ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>🔗 協作線</button>
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
          </div>
        </div>
      )}

      <aside className="absolute top-5 right-6 bottom-20 z-20 w-80 bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200 p-5 rounded-3xl shadow-2xl pointer-events-auto flex flex-col justify-between">
        <div className="overflow-y-auto pr-1">
          <div className="border-b border-stone-200 pb-3.5 mb-4">
            <h2 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">THE RESEARCH INDEX</h2>
            <p className="text-lg font-black text-slate-800 mt-0.5">把理論與應用，連起來。</p>
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
