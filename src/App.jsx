import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Html, QuadraticBezierLine } from '@react-three/drei';
import { create } from 'zustand';
import * as THREE from 'three';

// ==========================================
// 1. 全域狀態管理 (Zustand)
// ==========================================
const useIslandStore = create((set) => ({
  activeModule: null,
  setActiveModule: (moduleKey) => set({ activeModule: moduleKey }),
  isModalOpen: false,
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  showLabels: true,
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  isPaused: false,
  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
}));

// ==========================================
// 2. 四大主題場館與 3-4 類精簡研究資料庫
// ==========================================
const researchModules = {
  theory: {
    id: '01',
    code: 'VENUE 01',
    title: '語言學大殿堂',
    summary: '探討語言底層結構、生成語法與句法語意介面，解析南島語機制。',
    cameraPos: [0, 6, 8],
    center: [0, 0, 0],
    categories: [
      { name: 'A. 句法結構與理論', list: ['限定詞組省略理論研究', '疑問詞問句及其左緣結構'] },
      { name: 'B. 語意與指涉機制', list: ['篇章指涉與論旨角色指派', '空代名詞之分布與指涉'] },
      { name: 'C. 跨語言與類型學', list: ['兩類空範疇之跨語言比較', '受事控制結構之最簡方案分析'] },
    ],
  },
  corpus: {
    id: '02',
    code: 'VENUE 02',
    title: '語料庫花園',
    summary: '運用大規模學習者語料庫，結合依存距離（MDD）剖析語音變異與詞彙常模。',
    cameraPos: [11.5, 6, -6.5],
    center: [11.5, 0, -6.5],
    categories: [
      { name: 'A. 語音變異實證', list: ['華語自由變異的類型和趨勢', '人群中悄然演變的聲音分析'] },
      { name: 'B. 學習者語料庫', list: ['華語學習者語音偏誤研究', '疑問詞「怎麼」偏誤分析'] },
      { name: 'C. 測驗與詞彙常模', list: ['評量材料句法複雜度檢測', '英語學習者口語詞彙表建置'] },
    ],
  },
  policy: {
    id: '03',
    code: 'VENUE 03',
    title: '語言政策講堂',
    summary: '結合語料庫輔助批評論述分析，探討議會政治言談與跨國多語教育政策。',
    cameraPos: [-11.5, 6, -6.5],
    center: [-11.5, 0, -6.5],
    categories: [
      { name: 'A. 教育與教科書政策', list: ['公民與社會教科書學術詞彙比較', '東南亞與本土英語教育政策比較'] },
      { name: 'B. 政治言談與論述', list: ['地方議會辯論之語料庫輔助分析', '政治言談中的國族指涉詞定位'] },
      { name: 'C. 國際公共治理', list: ['中小學營養午餐政策國際借鑑', '歐洲三語學校推動經驗與啟示'] },
      { name: 'D. 社會語言與防疫', list: ['校園防疫治理經驗與國際借鑑', '本土語言走出校園孤島政策評論'] },
    ],
  },
  systems: {
    id: '04',
    code: 'VENUE 04',
    title: '人工智慧咖啡廳',
    summary: '將句法複雜度演算法與語音辨識技術轉化為教育現場可用的開源 AI 工具。',
    cameraPos: [0, 6, 13.5],
    center: [0, 0, 13.5],
    isSystems: true,
    links: [
      { name: '🤖 句法難度自動檢測系統', url: '#' },
      { name: '🎙️ 自動語音轉文字與分析', url: '#' },
      { name: '📊 英語測驗單字頻率檢索', url: '#' },
    ],
  },
};

// ==========================================
// 3. 幾何路徑：六角形邊緣與橋樑計算
// ==========================================
// 產生六角形邊緣的座標陣列 (半徑 r)
function getHexagonWaypoints(cx, cz, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    pts.push(new THREE.Vector3(cx + Math.cos(angle) * r, 0, cz + Math.sin(angle) * r));
  }
  pts.push(pts[0]); // 閉合迴圈
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0);
}

// 建立跨島橋樑路徑
const bridgePath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 4.0), // 橙果島南端
  new THREE.Vector3(0, 0, 9.5)  // AI 島北端
]);

// 智慧尋路者 (行人、寵物、單車、滑板車)
function SmartWalker({ pathCurve, speed = 0.05, type = 'pedestrian', color = '#3b82f6', isPet = false }) {
  const ref = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !ref.current) return;
    const t = (clock.getElapsedTime() * speed) % 1; // 0~1 進度
    const pos = pathCurve.getPointAt(t);
    const nextPos = pathCurve.getPointAt((t + 0.01) % 1);
    
    // 走路/騎車的上下震動感
    const bounce = type === 'pedestrian' ? Math.abs(Math.sin(t * 200)) * 0.08 : 0;
    
    ref.current.position.set(pos.x, 0.05 + bounce, pos.z);
    ref.current.lookAt(nextPos.x, ref.current.position.y, nextPos.z);
  });

  // 腳踏車兒童
  if (type === 'bike') {
    return (
      <group ref={ref} scale={[0.4, 0.4, 0.4]}>
        {/* 單車車架與輪胎 */}
        <mesh position={[0, 0.3, 0.4]}><cylinderGeometry args={[0.2, 0.2, 0.05, 16]} rotation={[0, 0, Math.PI/2]} /><meshStandardMaterial color="#1e293b" /></mesh>
        <mesh position={[0, 0.3, -0.4]}><cylinderGeometry args={[0.2, 0.2, 0.05, 16]} rotation={[0, 0, Math.PI/2]} /><meshStandardMaterial color="#1e293b" /></mesh>
        <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.05, 0.05, 0.8]} /><meshStandardMaterial color="#ef4444" /></mesh>
        {/* 騎車小孩 */}
        <mesh position={[0, 0.8, -0.1]}><cylinderGeometry args={[0.2, 0.2, 0.5]} /><meshStandardMaterial color={color} /></mesh>
        <mesh position={[0, 1.2, -0.1]}><sphereGeometry args={[0.25]} /><meshStandardMaterial color="#ffedd5" /></mesh>
      </group>
    );
  }

  // 滑板車兒童
  if (type === 'scooter') {
    return (
      <group ref={ref} scale={[0.35, 0.35, 0.35]}>
        <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.15, 0.05, 0.7]} /><meshStandardMaterial color="#f59e0b" /></mesh>
        <mesh position={[0, 0.5, 0.3]}><cylinderGeometry args={[0.03, 0.03, 0.8]} /><meshStandardMaterial color="#334155" /></mesh>
        {/* 滑板車小孩 */}
        <mesh position={[0, 0.5, -0.1]}><cylinderGeometry args={[0.18, 0.18, 0.4]} /><meshStandardMaterial color={color} /></mesh>
        <mesh position={[0, 0.9, -0.1]}><sphereGeometry args={[0.22]} /><meshStandardMaterial color="#ffedd5" /></mesh>
      </group>
    );
  }

  // 行人或萌寵
  return (
    <group ref={ref} scale={[0.45, 0.45, 0.45]}>
      {isPet ? (
        <>
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI/2, 0, 0]}><capsuleGeometry args={[0.2, 0.4]} /><meshStandardMaterial color={color} /></mesh>
          <mesh position={[0, 0.5, 0.3]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color={color} /></mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.25, 0.25, 0.6]} /><meshStandardMaterial color={color} /></mesh>
          <mesh position={[0, 1.0, 0]}><sphereGeometry args={[0.3]} /><meshStandardMaterial color="#ffedd5" /></mesh>
        </>
      )}
    </group>
  );
}

// ==========================================
// 4. 生態系統：噴水鯨魚、海豚、海鷗與無人島
// ==========================================
function SpoutingWhale({ position }) {
  const whaleRef = useRef();
  const spoutRef = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime();
    if (whaleRef.current) {
      whaleRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.15;
      whaleRef.current.rotation.x = Math.sin(t * 1.5) * 0.1;
    }
    if (spoutRef.current) {
      // 模擬噴水忽大忽小
      spoutRef.current.scale.y = 1 + Math.sin(t * 3) * 0.5;
      spoutRef.current.position.y = 0.8 + spoutRef.current.scale.y * 0.2;
    }
  });

  return (
    <group ref={whaleRef} position={position} scale={[1.2, 1.2, 1.2]}>
      <mesh castShadow><capsuleGeometry args={[0.6, 1.5, 12, 16]} rotation={[Math.PI/2, 0, 0]} /><meshStandardMaterial color="#1e3a8a" /></mesh>
      <mesh position={[0, 0.4, 0.5]}><sphereGeometry args={[0.5]} /><meshStandardMaterial color="#1e3a8a" /></mesh>
      {/* 噴泉粒子柱 */}
      <mesh ref={spoutRef} position={[0, 0.8, 0.6]}>
        <coneGeometry args={[0.15, 0.8, 8]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Sunbather() {
  return (
    <group position={[0, 0.1, 0]}>
      {/* 躺椅 */}
      <mesh rotation={[0.2, 0, 0]} position={[0, 0.05, 0]}><boxGeometry args={[0.6, 0.05, 1.2]} /><meshStandardMaterial color="#fca5a5" /></mesh>
      {/* 遊客 */}
      <mesh position={[0, 0.15, -0.2]}><capsuleGeometry args={[0.18, 0.4]} /><meshStandardMaterial color="#fef08a" /></mesh>
      {/* 墨鏡 */}
      <mesh position={[0, 0.28, -0.1]}><boxGeometry args={[0.25, 0.05, 0.1]} /><meshStandardMaterial color="#0f172a" /></mesh>
      {/* 遮陽傘 */}
      <mesh position={[-0.6, 0.8, 0]}><cylinderGeometry args={[0.03, 0.03, 1.6]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
      <mesh position={[-0.6, 1.5, 0]}><coneGeometry args={[1.2, 0.4, 12]} /><meshStandardMaterial color="#f472b6" /></mesh>
    </group>
  );
}

// ==========================================
// 5. 單座六角主題島嶼元件
// ==========================================
const HexThemeIsland = ({ moduleKey }) => {
  const { activeModule, setActiveModule, setModalOpen, showLabels } = useIslandStore();
  const mod = researchModules[moduleKey];
  const isSelected = activeModule === moduleKey;
  const isOrange = moduleKey === 'theory';

  return (
    <group position={mod.center} onClick={(e) => { e.stopPropagation(); setActiveModule(moduleKey); setModalOpen(true); }}>
      {/* 六角形地基 */}
      <mesh position={[0, -0.4, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[5.2, 4.8, 0.8, 6]} />
        <meshStandardMaterial color={isOrange ? '#fcd34d' : '#86efac'} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[4.8, 4.2, 0.6, 6]} />
        <meshStandardMaterial color="#d4a373" />
      </mesh>

      {/* 場館特色建築 */}
      {moduleKey === 'theory' && (
        <group position={[0, 1.5, 0]}>
          {/* 巨型橙果紀念碑 */}
          <mesh castShadow><sphereGeometry args={[1.6, 32, 32]} /><meshStandardMaterial color="#f97316" roughness={0.4} /></mesh>
          <mesh position={[0, 1.6, 0]} rotation={[0, 0, 0.3]}><cylinderGeometry args={[0.08, 0.08, 0.5]} /><meshStandardMaterial color="#78350f" /></mesh>
          <mesh position={[0.4, 1.7, 0]} rotation={[0, 0, -0.5]}><circleGeometry args={[0.4]} /><meshStandardMaterial color="#22c55e" side={THREE.DoubleSide} /></mesh>
        </group>
      )}
      {moduleKey === 'corpus' && (
        <group position={[0, 0.8, 0]}>
          <mesh castShadow><cylinderGeometry args={[1.8, 1.8, 1.6, 32]} /><meshStandardMaterial color="#f1f5f9" /></mesh>
          <mesh position={[0, 0.8, 0]}><sphereGeometry args={[1.7, 16, 16, 0, Math.PI*2, 0, Math.PI/2]} /><meshStandardMaterial color="#38bdf8" transparent opacity={0.6} /></mesh>
        </group>
      )}
      {moduleKey === 'policy' && (
        <group position={[0, 0.8, 0]}>
          <mesh castShadow><boxGeometry args={[3.2, 1.6, 2.5]} /><meshStandardMaterial color="#fdfbf7" /></mesh>
          <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[1.2, 1.2, 0.8, 6]} /><meshStandardMaterial color="#475569" /></mesh>
        </group>
      )}
      {moduleKey === 'systems' && (
        <group position={[0, 0.8, 0]}>
          <mesh castShadow><boxGeometry args={[2.5, 1.6, 2.5]} /><meshStandardMaterial color="#fffbeb" /></mesh>
          <mesh position={[0, 1.0, 0]} rotation={[Math.PI/2, 0, 0]}><planeGeometry args={[2.0, 2.0]} /><meshStandardMaterial color="#0284c7" /></mesh> {/* 太陽能板 */}
          <mesh position={[0, 1.6, 0]} castShadow><octahedronGeometry args={[0.8]} /><meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} /></mesh>
        </group>
      )}

      {showLabels && (
        <Html position={[0, 3.8, 0]} center distanceFactor={18}>
          <div className={`px-4 py-1.5 rounded-full text-sm font-extrabold shadow-lg border transition-transform ${isSelected ? 'bg-rose-600 text-white scale-110' : 'bg-white/95 text-slate-800'}`}>
            {mod.title}
          </div>
        </Html>
      )}
    </group>
  );
};

// ==========================================
// 6. 3D 總場景 (海洋、島群、橋樑與軌跡)
// ==========================================
function IslandScene({ controlsRef }) {
  const { viewport } = useThree();
  const { activeModule } = useIslandStore();

  const responsiveScale = useMemo(() => {
    const minDim = Math.min(viewport.width, viewport.height);
    return Math.max(0.65, Math.min(1.0, minDim / 14.0)); // 手機版自適應縮放
  }, [viewport.width, viewport.height]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (activeModule && researchModules[activeModule]) {
      const mod = researchModules[activeModule];
      controls.object.position.lerp(new THREE.Vector3(...mod.cameraPos), 0.05);
      controls.target.lerp(new THREE.Vector3(...mod.center), 0.05);
    } else {
      // 預設全景視角
      controls.object.position.lerp(new THREE.Vector3(0, 18, 24), 0.05);
      controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    }
    controls.update();
  });

  // 預先計算各島嶼邊緣路徑
  const pathOrange = useMemo(() => getHexagonWaypoints(0, 0, 4.0), []);
  const pathCorpus = useMemo(() => getHexagonWaypoints(11.5, 0, -6.5, 4.0), []);
  const pathPolicy = useMemo(() => getHexagonWaypoints(-11.5, 0, -6.5, 4.0), []);

  return (
    <>
      <color attach="background" args={['#bae6fd']} />
      <ambientLight intensity={1.35} color="#fffcf2" />
      <directionalLight position={[18, 35, 22]} intensity={1.65} color="#fff8e7" castShadow />

      <group scale={[responsiveScale, responsiveScale, responsiveScale]} position={[0, -0.5, 0]}>
        {/* 汪洋大海 */}
        <mesh position={[0, -1.25, 0]} receiveShadow>
          <cylinderGeometry args={[65, 65, 0.8, 64]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.25} />
        </mesh>

        {/* 生態動物 */}
        <SpoutingWhale position={[18, -0.8, 12]} />
        <SpoutingWhale position={[-20, -0.8, 5]} />

        {/* 跨島木橋 */}
        <group position={[5.75, -0.3, -3.25]} rotation={[0, -Math.PI/6, 0]}>
          <mesh castShadow><boxGeometry args={[7, 0.15, 1.2]} /><meshStandardMaterial color="#b08968" /></mesh>
        </group>
        <group position={[-5.75, -0.3, -3.25]} rotation={[0, Math.PI/6, 0]}>
          <mesh castShadow><boxGeometry args={[7, 0.15, 1.2]} /><meshStandardMaterial color="#b08968" /></mesh>
        </group>
        <group position={[0, -0.3, 6.75]} rotation={[0, Math.PI/2, 0]}>
          <mesh castShadow><boxGeometry args={[7, 0.15, 1.2]} /><meshStandardMaterial color="#b08968" /></mesh>
        </group>

        {/* 四大主題六角島 */}
        <HexThemeIsland moduleKey="theory" />
        <HexThemeIsland moduleKey="corpus" />
        <HexThemeIsland moduleKey="policy" />
        <HexThemeIsland moduleKey="systems" />

        {/* 外海無人島與衛星島嶼 */}
        <group position={[-22, -0.3, -15]}>
          <mesh><cylinderGeometry args={[4, 4.5, 1.2, 6]} /><meshStandardMaterial color="#95d5b2" /></mesh>
          <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.5, 0.8, 3]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position={[0, 3.5, 0]}><coneGeometry args={[0.6, 0.8]} /><meshStandardMaterial color="#ef4444" /></mesh>
          <Html position={[0, 4.5, 0]} center><div className="bg-white/80 px-2 py-1 rounded-full text-[10px] font-bold">🏝️ 燈塔觀測站島</div></Html>
        </group>

        <group position={[22, -0.3, -15]}>
          <mesh><cylinderGeometry args={[4, 4.5, 1.2, 6]} /><meshStandardMaterial color="#74c69d" /></mesh>
          <mesh position={[0, 2, 0]}><cylinderGeometry args={[0.2, 0.3, 4]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position={[0, 4, 0.3]}><boxGeometry args={[3, 0.2, 0.1]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position={[0, 4, 0.3]} rotation={[0, 0, Math.PI/2]}><boxGeometry args={[3, 0.2, 0.1]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <Html position={[0, 5, 0]} center><div className="bg-white/80 px-2 py-1 rounded-full text-[10px] font-bold">🏝️ 綠能風車島</div></Html>
        </group>

        <group position={[20, -0.3, 16]}>
          <mesh><cylinderGeometry args={[4, 4.5, 1.2, 6]} /><meshStandardMaterial color="#95d5b2" /></mesh>
          <mesh position={[-1.5, 1, -1]}><sphereGeometry args={[1.2]} /><meshStandardMaterial color="#f472b6" /></mesh> {/* 櫻花樹 */}
          <Sunbather />
          <Html position={[0, 3.5, 0]} center><div className="bg-white/80 px-2 py-1 rounded-full text-[10px] font-bold">🏝️ 櫻花沙龍島</div></Html>
        </group>

        {/* 智慧尋路路人與載具 */}
        <SmartWalker pathCurve={pathOrange} speed={0.04} color="#f59e0b" type="scooter" />
        <SmartWalker pathCurve={pathOrange} speed={0.03} color="#d97706" isPet={true} />
        <SmartWalker pathCurve={pathCorpus} speed={0.035} color="#ec4899" type="pedestrian" />
        <SmartWalker pathCurve={pathPolicy} speed={0.05} color="#10b981" type="bike" />
        <SmartWalker pathCurve={bridgePath} speed={0.08} color="#3b82f6" type="pedestrian" />

      </group>
      <OrbitControls ref={controlsRef} enablePan enableZoom minDistance={4} maxDistance={60} />
    </>
  );
}

// ==========================================
// 7. 頂層 App (手機版優先佈局)
// ==========================================
export default function App() {
  const controlsRef = useRef();
  const { activeModule, setActiveModule, isModalOpen, setModalOpen, isMobileMenuOpen, setMobileMenuOpen } = useIslandStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const mod = activeModule ? researchModules[activeModule] : null;

  // 搜尋過濾功能
  const filteredModules = Object.entries(researchModules).filter(([_, val]) => 
    val.title.includes(searchQuery) || val.summary.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-sky-200 select-none">
      {/* 3D 滿版地圖 */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas shadows camera={{ position: [0, 18, 24], fov: 45 }}>
          <IslandScene controlsRef={controlsRef} />
        </Canvas>
      </div>

      {/* 右上角手機版選單按鈕 */}
      <button 
        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        className="absolute top-4 right-4 z-50 bg-slate-900/90 text-white p-3 rounded-xl shadow-lg md:hidden flex items-center justify-center font-bold"
      >
        {isMobileMenuOpen ? '關閉選單 ✕' : '探索場館 ☰'}
      </button>

      {/* 左側邊欄：搜尋與場館清單 (手機端依賴狀態開關，電腦端常駐) */}
      <aside className={`absolute top-4 left-4 bottom-4 z-20 w-80 bg-white/95 backdrop-blur-md border border-slate-200 p-5 rounded-2xl shadow-2xl transition-transform duration-300 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'}`}>
        <div className="mb-4">
          <h1 className="text-xl font-black text-rose-600">橙果島群島</h1>
          <p className="text-xs font-bold text-slate-500 mt-1">六角學術生態系 · 點擊場館 Zoom In</p>
        </div>

        <input 
          type="text" 
          placeholder="🔍 搜尋主題或場館..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-100 text-sm px-4 py-2.5 rounded-xl border border-slate-200 mb-4 focus:outline-none focus:ring-2 focus:ring-rose-400"
        />

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredModules.map(([key, value]) => {
            const isSelected = activeModule === key;
            return (
              <div 
                key={key} 
                onClick={() => { setActiveModule(key); setModalOpen(false); if(window.innerWidth < 768) setMobileMenuOpen(false); }} 
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-rose-50 border-rose-400 shadow-md scale-[1.02]' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="text-xs font-black text-rose-500 mb-1">{value.id}</div>
                <div className="text-sm font-extrabold text-slate-800">{value.title}</div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-2">{value.summary}</div>
              </div>
            );
          })}
        </div>
        
        <button 
          onClick={() => { setActiveModule(null); setModalOpen(false); }}
          className="mt-4 w-full bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
        >
          🌍 恢復全景視角
        </button>
      </aside>

      {/* 右側詳細資料彈窗 (點擊建築物或選單後展開) */}
      {isModalOpen && mod && (
        <div className="absolute top-20 right-4 bottom-4 z-30 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-5 shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-extrabold text-white bg-rose-500 px-2 py-1 rounded-md">{mod.code}</span>
            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 w-7 h-7 rounded-full flex items-center justify-center font-bold">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">{mod.title}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{mod.quote}</p>
            </div>

            {/* 精簡化 3-4 類清單 */}
            {mod.categories && (
              <div className="space-y-3 mt-2">
                {mod.categories.map((cat, cIdx) => (
                  <div key={cIdx}>
                    <div className="text-[11px] font-extrabold text-rose-600 border-b border-rose-100 pb-1 mb-2">{cat.name}</div>
                    <div className="space-y-1.5">
                      {cat.list.map((item, iIdx) => (
                        <div key={iIdx} className="text-xs text-slate-700 font-medium flex items-start gap-1.5">
                          <span className="text-slate-300">▸</span><span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mod.isSystems && (
              <div className="space-y-2 mt-4">
                <div className="text-[11px] font-extrabold text-slate-400 mb-2">線上系統入口</div>
                {mod.links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="block bg-slate-800 text-white text-xs font-bold text-center py-2.5 rounded-xl shadow-md hover:bg-slate-700 transition-colors">
                    {link.name} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
