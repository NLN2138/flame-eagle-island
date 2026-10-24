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
      {
        name: '南島語與漢語形式句法研究',
        list: [
          '南島語限定詞組省略之類型與參數研究 (Typology and parameter: DP ellipsis)',
          '論元省略與語法島修復機制研究 (Is island "repairable"? Argument drop study)',
          '篇章指涉與論旨角色指派機制 (Discourse Reference and Theta-role Assignment)',
          '空代名詞之分布與指涉特性研究 (Distribution and reference of empty pronoun)',
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
          '華語學習者語料庫語音偏誤研究：以不送氣舌尖後翹舌音、舌根鼻音和輕聲為例（THCI 第一級）',
          '華語自由變異的類型和趨勢：基於語音語料庫的研究（THCI 第一級）',
        ],
      },
      {
        name: '計量句法、聲調變異與字頻實證研究',
        list: [
          '語音習得之層次非對稱性：母語背景對鼻韻尾、輕聲與音韻規則的調節作用',
          '初探華語文評量材料句法複雜度與自動檢測系統建置',
          '華語自由聲調變異之實證與語料庫研究 (Free tonal variation studies)',
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
          '多語教育怎麼「行」！？以歐洲三語學校的推動經驗為例',
        ],
      },
      {
        name: '政治言談分析（CADS）與跨國政策比較',
        list: [
          '以言建國：地方議會辯論之語料庫輔助批評論述分析 (Nationhood by words: CADS)',
          '地方議會政治言談中的問句句式與評價性修辭分析',
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
// 3. 嚴格道路尋路步行者（絕不撞到四大建築物）
// ==========================================
function SafePathWalker({ data }) {
  const { pathIndex, speed = 0.8, role, shirt, bottom, hair } = data;
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime() * speed;

    let x = 0, z = 0, nextX = 0, nextZ = 0;
    const progress = (t * 0.35) % 4; // 4個區段循環

    // 定義安全道路與廣場節點（徹底避開建築物座標 [-5.2,-3.2], [5.2,-3.2], [-4.8,3.8], [4.8,3.8]）
    if (pathIndex === 0) {
      // 十字步道 A 線：從左前到右後
      const p = progress / 4;
      x = -3.5 + p * 7.0;
      z = 2.5 - p * 5.0;
      nextX = x + 0.1; nextZ = z - 0.08;
    } else if (pathIndex === 1) {
      // 十字步道 B 線：從右前到左後
      const p = progress / 4;
      x = 3.5 - p * 7.0;
      z = 2.5 - p * 5.0;
      nextX = x - 0.1; nextZ = z - 0.08;
    } else {
      // 中央廣場外圍圓形安全步道
      const angle = (t * 0.4) + (pathIndex * 2);
      const r = 2.4;
      x = Math.cos(angle) * r;
      z = Math.sin(angle) * r;
      nextX = Math.cos(angle + 0.1) * r;
      nextZ = Math.sin(angle + 0.1) * r;
    }

    const bounce = Math.abs(Math.sin(t * 6)) * 0.08;

    if (groupRef.current) {
      groupRef.current.position.set(x, 0.05 + bounce, z);
      groupRef.current.rotation.y = Math.atan2(nextX - x, nextZ - z);
    }

    const swing = Math.sin(t * 6) * 0.5;
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
  });

  return (
    <group ref={groupRef} scale={[0.48, 0.48, 0.48]}>
      <group position={[-0.14, 0.35, 0]} ref={leftLegRef}>
        <mesh position={[0, -0.18, 0]} castShadow><boxGeometry args={[0.15, 0.35, 0.16} /><meshStandardMaterial color={bottom} /></mesh>
      </group>
      <group position={[0.14, 0.35, 0]} ref={rightLegRef}>
        <mesh position={[0, -0.18, 0]} castShadow><boxGeometry args={[0.15, 0.35, 0.16} /><meshStandardMaterial color={bottom} /></mesh>
      </group>
      <mesh position={[0, 0.72, 0]} castShadow><cylinderGeometry args={[0.24, 0.3, 0.6, 14} /><meshStandardMaterial color={shirt} /></mesh>
      <group position={[0, 1.38, 0]}>
        <mesh castShadow><sphereGeometry args={[0.35, 16, 16]} /><meshStandardMaterial color="#ffedd5" /></mesh>
        <mesh position={[0, 0.1, -0.03]} castShadow><sphereGeometry args={[0.36, 14, 14]} /><meshStandardMaterial color={hair} /></mesh>
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
// 4. 海上來來往往的商船、遊艇、SUP、衝浪人與海鷗
// ==========================================
// 國旗彩色小方塊
function FlagBanner({ color }) {
  return (
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[0.35, 0.22, 0.04]} />
      <meshStandardMaterial color={color} roughness={0.3} />
    </mesh>
  );
}

// 掛各國國旗的巨型商船
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
      {/* 船體 */}
      <mesh castShadow><boxGeometry args={[5.2, 1.1, 2.0]} /><meshStandardMaterial color="#1e293b" /></mesh>
      <mesh position={[0, 0.7, 0]}><boxGeometry args={[4.2, 0.9, 1.8]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
      {/* 貨櫃 */}
      <mesh position={[-0.8, 1.4, 0]}><boxGeometry args={[1.4, 0.9, 1.5]} /><meshStandardMaterial color="#ef4444" /></mesh>
      <mesh position={[0.8, 1.4, 0]}><boxGeometry args={[1.4, 0.9, 1.5]} /><meshStandardMaterial color="#3b82f6" /></mesh>
      {/* 旗桿與各國國旗 */}
      <mesh position={[2.0, 1.6, 0]}><cylinderGeometry args={[0.03, 0.03, 1.5]} /><meshStandardMaterial color="#64748b" /></mesh>
      <group position={[2.0, 2.1, 0]}><FlagBanner color={flagColor} /></group>
    </group>
  );
}

// 優雅遊艇
function LuxuryYacht({ startZ, speed }) {
  const yachtRef = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !yachtRef.current) return;
    const t = clock.getElapsedTime() * speed;
    const x = -(((t * 5) % 65) - 32); // 反方向開
    yachtRef.current.position.set(x, -0.98, startZ);
    yachtRef.current.rotation.y = Math.PI;
  });

  return (
    <group ref={yachtRef} position={[32, -0.98, startZ]} scale={[0.6, 0.6, 0.6]}>
      <mesh castShadow><boxGeometry args={[4.0, 0.8, 1.6]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[0.3, 0.6, 0]}><boxGeometry args={[2.2, 0.7, 1.3]} /><meshStandardMaterial color="#0284c7" roughness={0.1} /></mesh>
    </group>
  );
}

// SUP 立槳衝浪與衝浪人+小狗
function SurferAndDog({ angleOffset, radius }) {
  const surfRef = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !surfRef.current) return;
    const t = clock.getElapsedTime() * 0.9 + angleOffset;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const waveBob = Math.sin(t * 6) * 0.08;
    surfRef.current.position.set(x, -1.05 + waveBob, z);
    surfRef.current.rotation.y = -t + Math.PI / 2;
  });

  return (
    <group ref={surfRef}>
      {/* 衝浪板 */}
      <mesh rotation={[0, 0, 0.1]} castShadow><boxGeometry args={[1.8, 0.12, 0.55]} /><meshStandardMaterial color="#facc15" /></mesh>
      {/* 衝浪人 */}
      <mesh position={[0, 0.45, 0]}><capsuleGeometry args={[0.18, 0.4, 8, 12]} /><meshStandardMaterial color="#ea580c" /></mesh>
      <mesh position={[0, 0.82, 0]}><sphereGeometry args={[0.16, 12, 12]} /><meshStandardMaterial color="#ffedd5" /></mesh>
      {/* 衝浪小狗 */}
      <group position={[0.5, 0.28, 0]} scale={[0.5, 0.5, 0.5]}>
        <mesh><boxGeometry args={[0.6, 0.3, 0.3]} /><meshStandardMaterial color="#d97706" /></mesh>
        <mesh position={[0.3, 0.22, 0]}><sphereGeometry args={[0.15, 10, 10]} /><meshStandardMaterial color="#d97706" /></mesh>
      </group>
    </group>
  );
}

// 天空翱翔的海鷗
function FlyingSeagulls() {
  const g1Ref = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !g1Ref.current) return;
    const t = clock.getElapsedTime() * 0.6;
    const angle = t * 0.5;
    g1Ref.current.position.set(Math.cos(angle) * 16, 8.5 + Math.sin(t * 3) * 0.6, Math.sin(angle) * 14);
    g1Ref.current.rotation.y = -angle;
  });

  return (
    <group ref={g1Ref}>
      <mesh><boxGeometry args={[0.8, 0.04, 0.25]} /><meshStandardMaterial color="#ffffff" /></mesh>
    </group>
  );
}

// ==========================================
// 5. 四大核心精緻建築
// ==========================================
function DetailedBuildings() {
  const { activeModule, setActiveModule, setModalOpen, showLabels } = useIslandStore();
  const handleSelect = (key, e) => { e.stopPropagation(); setActiveModule(key); setModalOpen(true); };

  return (
    <>
      <group position={[-5.2, 0, -3.2]} onClick={(e) => handleSelect('theory', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow><boxGeometry args={[3.4, 0.4, 3.0]} /><meshStandardMaterial color="#e6ccb2" /></mesh>
        <mesh position={[0, 1.1, 0]} castShadow><boxGeometry args={[2.8, 1.4, 2.4]} /><meshStandardMaterial color="#fff8f0" /></mesh>
        <mesh position={[0, 1.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><cylinderGeometry args={[1.6, 2.3, 0.5, 4]} /><meshStandardMaterial color="#e05a47" /></mesh>
        {showLabels && (
          <Html position={[0, 3.8, 0]} center distanceFactor={18}>
            <div className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap ${activeModule === 'theory' ? 'bg-rose-600 text-white' : 'bg-white/95 text-slate-800'}`}>
              01 🏛️ 理論語言學殿堂
            </div>
          </Html>
        )}
      </group>

      <group position={[5.2, 0, -3.2]} onClick={(e) => handleSelect('corpus', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow><boxGeometry args={[3.4, 0.4, 3.0]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
        <mesh position={[-0.4, 1.5, 0]} castShadow><boxGeometry args={[2.0, 2.2, 2.0]} /><meshStandardMaterial color="#f1f5f9" /></mesh>
        <mesh position={[0.95, 1.1, 0.2]} castShadow><cylinderGeometry args={[0.65, 0.65, 1.4, 20]} /><meshStandardMaterial color="#2b7a78" /></mesh>
        {showLabels && (
          <Html position={[0, 3.8, 0]} center distanceFactor={18}>
            <div className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap ${activeModule === 'corpus' ? 'bg-teal-700 text-white' : 'bg-white/95 text-slate-800'}`}>
              02 📊 計量與語料庫中心
            </div>
          </Html>
        )}
      </group>

      <group position={[-4.8, 0, 3.8]} onClick={(e) => handleSelect('policy', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow><boxGeometry args={[3.6, 0.4, 3.2]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
        <mesh position={[0, 1.15, -0.1]} castShadow><boxGeometry args={[2.8, 1.5, 2.2]} /><meshStandardMaterial color="#fdfbf7" /></mesh>
        <mesh position={[0, 2.1, -0.1]} castShadow><sphereGeometry args={[1.05, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#52b788" /></mesh>
        {showLabels && (
          <Html position={[0, 3.8, 0]} center distanceFactor={18}>
            <div className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap ${activeModule === 'policy' ? 'bg-blue-600 text-white' : 'bg-white/95 text-slate-800'}`}>
              03 🏫 社會政策智庫
            </div>
          </Html>
        )}
      </group>

      <group position={[4.8, 0, 3.8]} onClick={(e) => handleSelect('systems', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow><boxGeometry args={[3.5, 0.4, 3.2]} /><meshStandardMaterial color="#fed7aa" /></mesh>
        <mesh position={[-0.3, 1.2, 0]} castShadow><boxGeometry args={[2.3, 1.6, 2.2]} /><meshStandardMaterial color="#fffbeb" /></mesh>
        <mesh position={[-0.3, 2.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[1.9, 0.9, 4]} /><meshStandardMaterial color="#f59e0b" /></mesh>
        {showLabels && (
          <Html position={[0, 3.8, 0]} center distanceFactor={18}>
            <div className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap ${activeModule === 'systems' ? 'bg-amber-500 text-white' : 'bg-amber-50/95 text-amber-900'}`}>
              04 ⚡ 前線 AI 實踐工坊
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

// ==========================================
// 6. 3D 群島與海洋場景組裝
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
      <fog attach="fog" args={['#bae6fd', 35, 70]} />
      <ambientLight intensity={1.35} color="#fffcf2" />
      <hemisphereLight skyColor="#ffffff" groundColor="#7dd3fc" intensity={0.65} />
      <directionalLight position={[18, 35, 22]} intensity={1.65} color="#fff8e7" castShadow />

      <group scale={[responsiveScale, responsiveScale, responsiveScale]} position={[0, -0.5, 0]}>
        {/* 汪洋大海與來來往往的商船、遊艇、SUP衝浪 */}
        <mesh position={[0, -1.25, 0]} receiveShadow>
          <cylinderGeometry args={[65, 65, 0.8, 64]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.25} />
        </mesh>
        
        {/* 海上船隻與水上活動 */}
        <CargoShip startZ={-8} speed={0.9} flagColor="#ef4444" />
        <CargoShip startZ={10} speed={0.75} flagColor="#3b82f6" />
        <LuxuryYacht startZ={-2} speed={1.1} />
        <SurferAndDog angleOffset={0} radius={11.2} />
        <SurferAndDog angleOffset={Math.PI} radius={11.8} />

        {/* 天空海鷗 */}
        <FlyingSeagulls />

        <Float speed={0.5} rotationIntensity={0.008} floatIntensity={0.03}>
          {/* 主島三層地貌 */}
          <mesh position={[0, -0.45, 0]} receiveShadow><cylinderGeometry args={[10.6, 10.2, 0.9, 48]} /><meshStandardMaterial color="#95d5b2" roughness={0.65} /></mesh>
          <mesh position={[0, -0.95, 0]}><cylinderGeometry args={[10.9, 10.1, 0.4, 48]} /><meshStandardMaterial color="#f5ebe0" /></mesh>
          <mesh position={[0, -1.7, 0]}><cylinderGeometry args={[9.8, 8.2, 1.2, 48]} /><meshStandardMaterial color="#d4a373" /></mesh>

          {/* 廣場步道 */}
          <mesh position={[0, 0.02, 0]} receiveShadow><cylinderGeometry args={[3.2, 3.3, 0.06, 36]} /><meshStandardMaterial color="#fdfbf7" /></mesh>
          
          <DetailedBuildings />

          {/* 走在道路上且絕對不撞建築的步行者 */}
          <SafePathWalker data={{ pathIndex: 0, speed: 0.8, role: '行人 A', shirt: '#3b82f6', bottom: '#1e293b', hair: '#1e293b' }} />
          <SafePathWalker data={{ pathIndex: 1, speed: 0.75, role: '行人 B', shirt: '#ec4899', bottom: '#be185d', hair: '#451a03' }} />
          <SafePathWalker data={{ pathIndex: 2, speed: 0.85, role: '行人 C', shirt: '#10b981', bottom: '#065f46', hair: '#78350f' }} />

          {showSynergyLines && (
            <group>
              <QuadraticBezierLine start={[-5.2, 2.5, -3.2]} end={[5.2, 2.5, -3.2]} mid={[0, 5.5, -3.2]} color="#e05a47" lineWidth={2} dashed dashScale={2} />
            </group>
          )}
        </Float>
      </group>

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={3.5}
        maxDistance={52}
        target={[0, 0.2, 0]}
      />
    </>
  );
}

// ==========================================
// 7. 頂層懸浮 UI 主元件
// ==========================================
export default function App() {
  const controlsRef = useRef();
  const { activeModule, setActiveModule, isModalOpen, setModalOpen, persona, setPersona, showLabels, toggleLabels, showSynergyLines, toggleSynergyLines, isPaused, togglePause } = useIslandStore();
  const mod = activeModule ? researchModules[activeModule] : null;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-sky-300">
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas shadows camera={{ position: [0, 12.5, 18.5], fov: 42 }}>
          <IslandScene controlsRef={controlsRef} />
        </Canvas>
      </div>

      {/* 左上角品牌 */}
      <div className="absolute top-5 left-6 z-20 pointer-events-auto">
        <div className="bg-[#fdfbf7]/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-stone-200">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black tracking-tight text-[#e05a47]">FLAME-EAGLE</span>
            <span className="text-sm font-extrabold text-slate-800">炎鷲橙果島</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">ACADEMIC & AI ARCHIPELAGO · 海洋夏日度假世界</p>
        </div>
      </div>

      {/* 頂部導覽列 */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto hidden md:flex items-center gap-2 bg-[#fdfbf7]/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-stone-200">
        <button onClick={toggleLabels} className={`px-3 py-1.5 rounded-full text-xs font-bold ${showLabels ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>🏷️ 名牌</button>
        <button onClick={toggleSynergyLines} className={`px-3 py-1.5 rounded-full text-xs font-bold ${showSynergyLines ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>🔗 協作線</button>
        <button onClick={togglePause} className={`px-3 py-1.5 rounded-full text-xs font-bold ${isPaused ? 'bg-rose-600 text-white' : 'text-slate-600'}`}>{isPaused ? '▶️ 繼續' : '⏸️ 暫停'}</button>
        <select value={persona} onChange={(e) => setPersona(e.target.value)} className="bg-stone-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full border border-stone-200">
          <option value="all">🧭 全方位探索者</option>
          <option value="researcher">🎓 學術研究同行</option>
        </select>
      </div>

      {/* 左側詳細研究卡片 */}
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
            <div className="bg-stone-100 border-l-4 border-[#e05a47] p-3 rounded-r-xl text-xs text-slate-700 font-medium">{mod.quote}</div>
            {mod.categories && (
              <div className="space-y-3">
                {mod.categories.map((cat, cIdx) => (
                  <div key={cIdx} className="space-y-1.5">
                    <div className="text-[11px] font-extrabold text-slate-400 uppercase">{cat.name}</div>
                    {cat.list.map((item, iIdx) => (
                      <div key={iIdx} className="bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-slate-700 font-medium shadow-sm flex items-start gap-2">
                        <span className="text-[#e05a47] font-black">●</span><span>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {mod.isSystems && (
              <div className="space-y-2.5">
                {mod.links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="block bg-white hover:bg-rose-50 border border-stone-200 hover:border-[#e05a47] p-3.5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between"><span className="text-xs font-extrabold text-slate-800">{link.name}</span><span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{link.tag} ↗</span></div>
                    <p className="text-[11px] text-slate-500 mt-1">{link.desc}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 右側目錄欄位 */}
      <aside className="absolute top-5 right-6 bottom-20 z-20 w-80 bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200 p-5 rounded-3xl shadow-2xl pointer-events-auto flex flex-col justify-between">
        <div className="overflow-y-auto pr-1">
          <div className="border-b border-stone-200 pb-3.5 mb-4">
            <h2 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">THE RESEARCH INDEX</h2>
            <p className="text-lg font-black text-slate-800 mt-0.5">把理論與應用，連起來。</p>
            <p className="text-xs text-slate-500 mt-1">海上商船、衝浪狗狗、步道行人全景世界</p>
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
