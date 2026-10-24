import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Html, QuadraticBezierLine } from '@react-three/drei';
import { create } from 'zustand';
import * as THREE from 'three';

// ==========================================
// 1. 全域狀態管理 (內建於單一檔案，避免缺檔報錯)
// ==========================================
const useIslandStore = create((set) => ({
  activeModule: 'theory',
  setActiveModule: (moduleKey) => set({ activeModule: moduleKey }),
  persona: 'all',
  setPersona: (persona) => set({ persona }),
  isModalOpen: false,
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  showLabels: true,
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  showSynergyLines: true,
  toggleSynergyLines: () => set((s) => ({ showSynergyLines: !s.showSynergyLines })),
  isPaused: false,
  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
  // 鏡頭平滑飛行目標
  cameraFlight: null,
  triggerCameraFlight: (pos, target) =>
    set({
      cameraFlight: {
        pos: new THREE.Vector3(...pos),
        target: new THREE.Vector3(...target),
        timestamp: Date.now(),
      },
    }),
  clearCameraFlight: () => set({ cameraFlight: null }),
}));

// ==========================================
// 2. 四大主題、四大場館與 3-4 類精細研究資料庫
// ==========================================
const researchModules = {
  theory: {
    id: '01',
    themeName: '01 理論與描述語言學',
    venueName: '01 語言學大殿堂',
    islandName: '🍊 橙果島 · 語言學大殿堂',
    code: 'THEME 01 · 理論與描述語言學',
    title: '語言學大殿堂',
    shortTitle: '語言學大殿堂',
    summary: '解構人類語言深層語法，探索臺灣南島語與漢語之省略機制、左緣結構與句法語意介面。',
    quote: '「從形式句法與類型學視角，解構南島語與漢語中看不見卻決定語意的深層語法結構。」',
    stats: { itemsCount: '10 項著作', synergyCount: '3 類核心主題' },
    synergyWith: ['02 語料庫花園', '04 人工智慧咖啡廳'],
    center: [0, 0, 0],
    cameraPos: [0, 6.2, 9.2],
    categories: [
      {
        name: '一、學位論文與省略理論專著',
        list: [
          '限定詞組省略理論研究：從南島語觀點出發 (Toward a Theory of DP Ellipsis: A Formosan Perspective)',
          '疑問詞問句及其左緣結構之研究 (Left Periphery and Wh-questions)',
        ],
      },
      {
        name: '二、臺灣南島語形式句法與類型學',
        list: [
          '南島語限定詞組省略之類型與參數研究 (Typology and parameter: DP ellipsis)',
          '論元省略與語法島修復機制研究 (Is island "repairable"? Argument drop study)',
          '南島語數詞系統之句法結構分析 (Numerals syntax system analysis)',
        ],
      },
      {
        name: '三、漢語空範疇、控制結構與製圖理論',
        list: [
          '篇章指涉與論旨角色指派機制 (Discourse Reference and Theta-role Assignment)',
          '空代名詞之分布與指涉特性研究 (Distribution and reference of empty pronoun)',
          '兩類空範疇之跨語言比較研究 (Two types of empty categories: A comparative study)',
          '受事控制結構之最簡方案分析 (Two types of object control: A minimalist perspective)',
          '漢語疑問感嘆句之製圖理論分析 (Wh-exclamative constructions: A cartographic approach)',
        ],
      },
    ],
  },
  corpus: {
    id: '02',
    themeName: '02 計量語言學與語料庫',
    venueName: '02 語料庫花園',
    islandName: '📊 計量語料島 · 語料庫花園',
    code: 'THEME 02 · 計量語言學與語料庫',
    title: '語料庫花園',
    shortTitle: '語料庫花園',
    summary: '灌溉大規模真實口語與學習者語料，以依存距離（MDD）與統計模型剖析語音變異與詞彙常模。',
    quote: '「讓真實語料說話：從自由變異到偏誤類型，建立客觀可驗證的語言計量指標。」',
    stats: { itemsCount: '13 項研究', synergyCount: '4 類核心主題' },
    synergyWith: ['01 語言學大殿堂', '03 語言政策講堂', '04 人工智慧咖啡廳'],
    center: [12.5, 0, -7.2],
    cameraPos: [12.5, 6.0, 1.5],
    categories: [
      {
        name: '一、學習者語料庫與語音偏誤實證',
        list: [
          '華語學習者語料庫語音偏誤研究：以不送氣舌尖後翹舌音、舌根鼻音和輕聲為例（THCI 第一級）',
          '華語學習者輕聲偏誤及其潛在變項之相關性研究',
          '語音習得之層次非對稱性：母語背景對鼻韻尾、輕聲與音韻規則的調節作用',
          '是偏誤？還是變異？華語文教育語言規範新視角',
        ],
      },
      {
        name: '二、華語自由變異與口語音變趨勢',
        list: [
          '華語自由變異的類型和趨勢：基於語音語料庫的研究（THCI 第一級）',
          '標準之外的聲音：從語料庫證據反思華語語音教學與語言規範',
          '華語自由聲調變異之實證與語料庫研究 (Free tonal variation studies)',
          '人群中悄然演變的聲音：基於口語語料庫之音變分析',
        ],
      },
      {
        name: '三、句法複雜度與疑問詞偏誤計量',
        list: [
          '基於華語學習者語料庫之疑問詞「怎麼（樣）」偏誤分析（THCI 第一級）',
          '初探華語文評量材料句法複雜度與自動檢測系統建置',
        ],
      },
      {
        name: '四、測驗詞彙常模建置與語料庫科普',
        list: [
          '初探華語的「變」與「不變」：基於語料庫的語音研究',
          '英語學習者口語詞彙表建置與課綱字彙表改進建議',
          '科普專論：基於語料庫的一字多音研究、口語語料庫對英語學習的啟示',
        ],
      },
    ],
  },
  policy: {
    id: '03',
    themeName: '03 社會語言學與教育政策',
    venueName: '03 語言政策講堂',
    islandName: '🏫 社會政策島 · 語言政策講堂',
    code: 'THEME 03 · 社會語言學與教育政策',
    title: '語言政策講堂',
    shortTitle: '語言政策講堂',
    summary: '結合語料庫輔助批評論述分析（CADS）與跨國教育比較，連結實證語言證據與公共政策治理。',
    quote: '「連結語言證據與公共治理：從課綱教科書體檢到國際多語教育借鑑。」',
    stats: { itemsCount: '13 項研究', synergyCount: '4 類核心主題' },
    synergyWith: ['02 語料庫花園', '04 人工智慧咖啡廳'],
    center: [-12.5, 0, -7.2],
    cameraPos: [-12.5, 6.0, 1.5],
    categories: [
      {
        name: '一、政治言談與議會批評論述分析 (CADS)',
        list: [
          '以言建國：地方議會辯論之語料庫輔助批評論述分析 (Nationhood by words: CADS)',
          '地方議會政治言談中的問句句式與評價性修辭分析',
          '地方議會政治言談中的國族指涉詞：詞頻分布、共變模式與主體定位分析',
        ],
      },
      {
        name: '二、課綱與公民社會教科書詞彙研究',
        list: [
          '高中公民與社會教科書學術詞彙之比較研究（TSSCI 第二級）',
          '新舊課綱高中社會領域教科書對比分析：語料庫為本之研究',
          '社會教科書用語體檢與小學英語教科書詞彙分析',
        ],
      },
      {
        name: '三、跨國雙語與多語教育政策比較',
        list: [
          '多語教育怎麼「行」！？以歐洲三語學校的推動經驗為例',
          '他山之石：歐美國家語言教育政策趨勢',
          '東南亞與本土中小學英語教育政策之跨國比較',
          '邁向多語共融的永續未來：歐亞雙語及多語教育政策比較與歐洲英語教育啟示',
        ],
      },
      {
        name: '四、校園治理、飲食政策與本土語推廣',
        list: [
          '中小學營養午餐政策研究：現況、挑戰與國際借鑑',
          '校園防疫治理經驗與國際借鑑 (How schools combat against pandemic)',
          '政策評論：本土語言走出校園孤島、跨國飲食教育比較',
        ],
      },
    ],
  },
  systems: {
    id: '04',
    themeName: '04 人工智慧應用',
    venueName: '04 人工智慧咖啡廳',
    islandName: '⚡ AI 實踐島 · 人工智慧咖啡廳',
    code: 'THEME 04 · 人工智慧應用',
    title: '人工智慧咖啡廳',
    shortTitle: '人工智慧咖啡廳',
    summary: '將依存句法演算法、自動語音辨識與測驗字頻常模，沖泡成服務教育現場的三大線上 AI 系統。',
    quote: '「從理論建模到程式實作，打造服務教育現場與研究社群的智慧化開源工具。」',
    stats: { itemsCount: '3 座線上系統', synergyCount: '3 類核心技術' },
    synergyWith: ['01 語言學大殿堂', '02 語料庫花園', '03 語言政策講堂'],
    center: [0, 0, 14.0],
    cameraPos: [0, 6.0, 22.8],
    isSystems: true,
    categories: [
      {
        name: '一、句法複雜度自動診斷技術',
        list: [
          '依存距離（DD）與平均依存距離（MDD）自動化剖析演算法',
          '華語文讀本與評量文本之句法難度即時視覺化指標',
        ],
      },
      {
        name: '二、自動化語音轉寫與語料檢索技術',
        list: [
          '高精度語音辨識（STT）整合自動斷詞與詞性標註流水線',
          '議會政治言談與口語語料庫之關鍵詞共現（Collocation）檢索',
        ],
      },
      {
        name: '三、大型測驗詞頻與課綱常模應用',
        list: [
          '歷屆大型英語測驗單字頻率分布與課綱字表對比檢索',
          '第一線教師命題與教材編纂之即時詞頻輔助診斷工具',
        ],
      },
    ],
    links: [
      {
        name: '🤖 AI 華語文句法難度自動檢測系統',
        desc: '基於依存距離（DD）與平均依存距離（MDD）之自動文本複雜度診斷平台。',
        tag: '句法演算',
        url: 'https://twmddanalyzer.streamlit.app/',
      },
      {
        name: '🎙️ 自動語音轉文字與語料庫分析系統',
        desc: '整合高精度語音辨識（STT）、斷詞標註與語料庫共現檢索之自動化分析工具。',
        tag: '語音語料',
        url: 'https://twpoliticolstt.streamlit.app/',
      },
      {
        name: '📊 中小學英語測驗單字頻率檢索系統',
        desc: '串接歷屆大型英語測驗與課綱字表常模，提供教育工作者即時詞頻診斷服務。',
        tag: '詞頻常模',
        url: 'https://twvocfreqexam.streamlit.app/',
      },
    ],
  },
};

// ==========================================
// 3. 六角形邊緣道路與跨島橋樑路徑產生器 (100% 防撞建築)
// ==========================================
function createHexagonPath(cx, cz, radius) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    pts.push(new THREE.Vector3(cx + Math.cos(angle) * radius, 0.06, cz + Math.sin(angle) * radius));
  }
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.08);
}

// 跨島大巡迴路徑：從橙果島外環 -> 跨橋至各主題島外環 -> 返回，絕不進入建築物半徑
function createGrandArchipelagoPath() {
  const pts = [
    new THREE.Vector3(0, 0.06, 4.3),
    new THREE.Vector3(0, 0.06, 9.6),
    new THREE.Vector3(3.3, 0.06, 12.1),
    new THREE.Vector3(3.3, 0.06, 15.9),
    new THREE.Vector3(0, 0.06, 17.8),
    new THREE.Vector3(-3.3, 0.06, 15.9),
    new THREE.Vector3(-3.3, 0.06, 12.1),
    new THREE.Vector3(0, 0.06, 9.6),
    new THREE.Vector3(0, 0.06, 4.3),
    new THREE.Vector3(3.7, 0.06, 2.1),
    new THREE.Vector3(3.7, 0.06, -2.1),
    new THREE.Vector3(8.8, 0.06, -5.1),
    new THREE.Vector3(12.5, 0.06, -3.4),
    new THREE.Vector3(15.8, 0.06, -5.3),
    new THREE.Vector3(15.8, 0.06, -9.1),
    new THREE.Vector3(12.5, 0.06, -11.0),
    new THREE.Vector3(8.8, 0.06, -5.1),
    new THREE.Vector3(3.7, 0.06, -2.1),
    new THREE.Vector3(0, 0.06, -4.3),
    new THREE.Vector3(-3.7, 0.06, -2.1),
    new THREE.Vector3(-8.8, 0.06, -5.1),
    new THREE.Vector3(-12.5, 0.06, -11.0),
    new THREE.Vector3(-15.8, 0.06, -9.1),
    new THREE.Vector3(-15.8, 0.06, -5.3),
    new THREE.Vector3(-12.5, 0.06, -3.4),
    new THREE.Vector3(-8.8, 0.06, -5.1),
    new THREE.Vector3(-3.7, 0.06, -2.1),
    new THREE.Vector3(-3.7, 0.06, 2.1),
  ];
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.12);
}

// ==========================================
// 4. 豐富裝飾元件：樹木、櫻花樹、古典路燈、噴泉、太陽能板、風車
// ==========================================
function CuteTree({ position, scale = 1, color = '#52b788' }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 0.8, 10]} />
        <meshStandardMaterial color="#9c6644" roughness={0.8} />
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

function StreetLamp({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 1.1, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 1.28, 0]}>
        <coneGeometry args={[0.18, 0.12, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

function SolarPanelArray({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {[-0.6, 0.6].map((x, idx) => (
        <group key={idx} position={[x, 0, 0]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <mesh position={[0, 0.42, 0]} rotation={[0.45, 0, 0]} castShadow>
            <boxGeometry args={[0.95, 0.05, 0.7]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.6} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.43, 0]} rotation={[0.45, 0, 0]}>
            <boxGeometry args={[0.98, 0.04, 0.73]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MiniFountain({ position, scale = 0.65 }) {
  const dropsRef = useRef([]);
  const { isPaused } = useIslandStore();
  const dropData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        angle: (i / 12) * Math.PI * 2,
        speed: 1.3 + (i % 3) * 0.15,
        offset: (i / 12) * 1.0,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime();
    dropsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const d = dropData[i];
      const p = (t * d.speed + d.offset) % 1;
      const r = p * 0.55;
      mesh.position.set(
        Math.cos(d.angle + t * 0.4) * r,
        0.95 + Math.sin(p * Math.PI) * 0.6 - p * 0.5,
        Math.sin(d.angle + t * 0.4) * r
      );
      mesh.scale.setScalar(Math.sin(p * Math.PI) * 0.8 + 0.25);
    });
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.3, 0.32, 24]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.1, 24]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 0.6, 16]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
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
// 5. 橙果島核心地標：巨型橘子主題紀念碑噴泉 (Giant Orange Monument)
// ==========================================
function GiantOrangeMonument({ position = [0, 0.04, 1.4] }) {
  const orangeRef = useRef();
  const ringRef = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime();
    if (orangeRef.current) {
      orangeRef.current.position.y = 2.0 + Math.sin(t * 2.0) * 0.1;
      orangeRef.current.rotation.y = t * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.7;
    }
  });

  return (
    <group position={position}>
      {/* 底層三層噴泉水池基座 */}
      <MiniFountain position={[0, 0, 0]} scale={0.95} />
      {/* 紀念碑白石方尖基柱 */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.65, 1.1, 6]} />
        <meshStandardMaterial color="#fffbeb" roughness={0.3} />
      </mesh>
      {/* 金色銘牌環 */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.12, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* 巨型立體橘子主體 */}
      <group ref={orangeRef} position={[0, 2.0, 0]}>
        <mesh scale={[1, 0.88, 1]} castShadow>
          <sphereGeometry args={[0.85, 32, 24]} />
          <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.22} roughness={0.35} />
        </mesh>
        {/* 頂部綠蒂與木梗 */}
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.18, 0.05, 0.08, 6]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
        <mesh position={[0, 0.88, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.05, 0.07, 0.35, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        {/* 兩片翠綠橘子葉 */}
        <mesh position={[0.28, 0.88, 0]} rotation={[0.2, 0, -0.5]} scale={[1.4, 0.25, 0.7]} castShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        <mesh position={[-0.22, 0.84, 0.12]} rotation={[-0.2, 0.3, 0.6]} scale={[1.1, 0.22, 0.6]} castShadow>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#4ade80" />
        </mesh>
        {/* 環繞橘子的黃金知識光環 */}
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.15, 0.04, 12, 36]} />
          <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// ==========================================
// 6. 四座六角主題島嶼與場館建築群 (Hexagonal Theme Islands)
// ==========================================
function HexThemeIslands() {
  const { activeModule, setActiveModule, setModalOpen, triggerCameraFlight, showLabels, isPaused } = useIslandStore();
  const ringRef = useRef();
  const crystalRef = useRef();
  const policyWindmillRef = useRef();
  const smokeRef = useRef();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime();
    if (ringRef.current) ringRef.current.rotation.z = t * 0.7;
    if (crystalRef.current) {
      crystalRef.current.rotation.y = t * 0.9;
      crystalRef.current.position.y = 3.25 + Math.sin(t * 2.5) * 0.12;
    }
    if (policyWindmillRef.current) policyWindmillRef.current.rotation.z = t * 1.6;
    if (smokeRef.current) {
      const s = (t * 0.6) % 1;
      smokeRef.current.position.y = 2.6 + s * 1.1;
      smokeRef.current.scale.setScalar(0.2 + s * 0.25);
    }
  });

  const handleSelectIsland = (key, e) => {
    e.stopPropagation();
    const mod = researchModules[key];
    setActiveModule(key);
    setModalOpen(true);
    if (mod) {
      triggerCameraFlight(mod.cameraPos, mod.center);
    }
  };

  // 六角形頂點座標（用於擺放路燈與行道樹）
  const hexAngles = useMemo(() => [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI) / 3 + Math.PI / 6), []);

  return (
    <>
      {/* ==================================================
          01 主島：橙果島 (理論與描述語言學 · 語言學大殿堂)
         ================================================== */}
      <group position={[0, 0, 0]} onClick={(e) => handleSelectIsland('theory', e)}>
        {/* 六角形三層島嶼地基 */}
        <mesh position={[0, -0.45, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[6.0, 5.7, 0.9, 6]} />
          <meshStandardMaterial color="#95d5b2" roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.95, 0]}>
          <cylinderGeometry args={[6.2, 5.5, 0.4, 6]} />
          <meshStandardMaterial color="#f5ebe0" roughness={0.7} />
        </mesh>
        <mesh position={[0, -1.65, 0]}>
          <cylinderGeometry args={[5.4, 4.3, 1.1, 6]} />
          <meshStandardMaterial color="#d4a373" roughness={0.85} />
        </mesh>
        {/* 海面六角浪花環 */}
        <mesh position={[0, -0.82, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 6]}>
          <ringGeometry args={[5.9, 6.7, 6]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>

        {/* 六角形邊緣環島大道 (半徑 4.1~4.7，供行人、單車、滑板車、萌寵通行) */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 6]} receiveShadow>
          <ringGeometry args={[3.9, 4.7, 6]} />
          <meshStandardMaterial color="#f5ebe0" roughness={0.6} />
        </mesh>
        {/* 中央圓形石磚廣場 */}
        <mesh position={[0, 0.015, 0]} receiveShadow>
          <cylinderGeometry args={[3.6, 3.6, 0.04, 6]} />
          <meshStandardMaterial color="#fdfbf7" />
        </mesh>

        {/* ★ 巨型橘子主題紀念碑與動態噴泉 ★ */}
        <GiantOrangeMonument position={[0, 0.04, 1.55]} />

        {/* 主建築：01 語言學大殿堂 (雙層飛簷書院) */}
        <group position={[0, 0, -1.35]}>
          <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
            <boxGeometry args={[3.1, 0.4, 2.3]} />
            <meshStandardMaterial color="#e6ccb2" />
          </mesh>
          <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.6, 1.3, 1.9]} />
            <meshStandardMaterial color="#fff8f0" />
          </mesh>
          <mesh position={[0, 1.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <cylinderGeometry args={[1.4, 2.1, 0.45, 4]} />
            <meshStandardMaterial color="#e05a47" />
          </mesh>
          <mesh position={[0, 2.35, 0]} castShadow>
            <boxGeometry args={[1.8, 0.8, 1.4]} />
            <meshStandardMaterial color="#fff8f0" />
          </mesh>
          <mesh position={[0, 3.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.6, 0.85, 4]} />
            <meshStandardMaterial color="#d94e34" />
          </mesh>
          {/* 溫暖窗格 */}
          <mesh position={[-0.65, 1.05, 0.96]}>
            <boxGeometry args={[0.4, 0.4, 0.04]} />
            <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.65, 1.05, 0.96]}>
            <boxGeometry args={[0.4, 0.4, 0.04]} />
            <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* 附屬建築：南島語田野工作站與句法樹雕塑 */}
        <group position={[-2.2, 0, -0.4]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1.1, 1.0, 1.0]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>
          <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.9, 0.55, 4]} />
            <meshStandardMaterial color="#f97316" />
          </mesh>
        </group>
        <CuteTree position={[2.3, 0, -0.5]} scale={0.95} color="#40916c" />
        <CuteTree position={[-2.1, 0, 1.2]} scale={0.8} color="#52b788" />
        {hexAngles.map((ang, i) => (
          <StreetLamp key={i} position={[Math.cos(ang) * 4.85, 0, Math.sin(ang) * 4.85]} />
        ))}

        {showLabels && (
          <Html position={[0, 4.5, -0.8]} center distanceFactor={20}>
            <div
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap transition-transform ${
                activeModule === 'theory'
                  ? 'bg-orange-600 text-white border-orange-300 scale-110'
                  : 'bg-white/95 text-slate-800 border-stone-200 hover:scale-105'
              }`}
            >
              🍊 橙果島 · 01 語言學大殿堂
            </div>
          </Html>
        )}
      </group>

      {/* ==================================================
          02 東北島：計量語料島 (計量語言學與語料庫 · 語料庫花園)
         ================================================== */}
      <group position={[12.5, 0, -7.2]} onClick={(e) => handleSelectIsland('corpus', e)}>
        <mesh position={[0, -0.45, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[5.2, 4.9, 0.9, 6]} />
          <meshStandardMaterial color="#74c69d" roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.95, 0]}>
          <cylinderGeometry args={[5.4, 4.7, 0.4, 6]} />
          <meshStandardMaterial color="#f5ebe0" />
        </mesh>
        <mesh position={[0, -1.65, 0]}>
          <cylinderGeometry args={[4.6, 3.7, 1.1, 6]} />
          <meshStandardMaterial color="#d4a373" />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 6]} receiveShadow>
          <ringGeometry args={[3.4, 4.1, 6]} />
          <meshStandardMaterial color="#f5ebe0" />
        </mesh>

        {/* 主建築：02 語料庫花園 (玻璃圓頂溫室與旋轉語料數據塔) */}
        <group position={[-0.4, 0, -0.5]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[1.8, 1.95, 0.4, 24]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <cylinderGeometry args={[1.6, 1.6, 1.1, 24]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* 晶透溫室玻璃穹頂 */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <sphereGeometry args={[1.58, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.68} roughness={0.1} metalness={0.2} />
          </mesh>
          {/* 頂端動態數據光環 */}
          <group position={[0, 2.9, 0]}>
            <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
              <torusGeometry args={[0.6, 0.07, 14, 28]} />
              <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.7} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.22, 14, 14]} />
              <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={0.9} />
            </mesh>
          </group>
        </group>

        {/* 附屬建築：語音伺服器塔 + 花園噴泉 + 太陽能板 */}
        <mesh position={[1.6, 0.85, -0.6]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 1.7, 16]} />
          <meshStandardMaterial color="#0f766e" />
        </mesh>
        <MiniFountain position={[0.4, 0.02, 1.5]} scale={0.55} />
        <SolarPanelArray position={[-1.6, 0, 1.3]} rotation={[0, 0.4, 0]} />
        <CuteTree position={[1.9, 0, 1.0]} scale={0.9} color="#2d6a4f" />
        <CuteTree position={[-2.1, 0, -1.2]} scale={0.85} color="#52b788" />
        {[0, 2, 4].map((i) => (
          <StreetLamp key={i} position={[Math.cos(hexAngles[i]) * 4.25, 0, Math.sin(hexAngles[i]) * 4.25]} />
        ))}

        {showLabels && (
          <Html position={[0, 4.1, 0]} center distanceFactor={20}>
            <div
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap transition-transform ${
                activeModule === 'corpus'
                  ? 'bg-teal-700 text-white border-teal-300 scale-110'
                  : 'bg-white/95 text-slate-800 border-stone-200 hover:scale-105'
              }`}
            >
              📊 02 語料庫花園
            </div>
          </Html>
        )}
      </group>

      {/* ==================================================
          03 西北島：社會政策島 (社會語言學與教育政策 · 語言政策講堂)
         ================================================== */}
      <group position={[-12.5, 0, -7.2]} onClick={(e) => handleSelectIsland('policy', e)}>
        <mesh position={[0, -0.45, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[5.2, 4.9, 0.9, 6]} />
          <meshStandardMaterial color="#80ed99" roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.95, 0]}>
          <cylinderGeometry args={[5.4, 4.7, 0.4, 6]} />
          <meshStandardMaterial color="#f5ebe0" />
        </mesh>
        <mesh position={[0, -1.65, 0]}>
          <cylinderGeometry args={[4.6, 3.7, 1.1, 6]} />
          <meshStandardMaterial color="#d4a373" />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 6]} receiveShadow>
          <ringGeometry args={[3.4, 4.1, 6]} />
          <meshStandardMaterial color="#f5ebe0" />
        </mesh>

        {/* 主建築：03 語言政策講堂 (古典議會圓頂講堂與列柱) */}
        <group position={[0.3, 0, -0.5]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[3.0, 0.4, 2.4]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <mesh position={[0, 1.05, -0.1]} castShadow>
            <boxGeometry args={[2.5, 1.3, 1.9]} />
            <meshStandardMaterial color="#fdfbf7" />
          </mesh>
          {[-0.8, -0.27, 0.27, 0.8].map((xPos, idx) => (
            <mesh key={idx} position={[xPos, 1.0, 0.95]} castShadow>
              <cylinderGeometry args={[0.09, 0.11, 1.25, 10]} />
              <meshStandardMaterial color="#f1f5f9" />
            </mesh>
          ))}
          <mesh position={[0, 1.75, -0.1]} castShadow>
            <sphereGeometry args={[1.0, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#3a86ff" roughness={0.3} />
          </mesh>
        </group>

        {/* 附屬建築：政策書庫 + 政策小燈塔 + 綠能風車 */}
        <mesh position={[-1.7, 0.55, 0.8]} castShadow>
          <boxGeometry args={[1.1, 1.1, 1.0]} />
          <meshStandardMaterial color="#dbeafe" />
        </mesh>
        {/* 島上小燈塔 */}
        <group position={[-1.9, 0, -1.2]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.36, 1.8, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.27, 0.31, 0.55, 12]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 1.95, 0]}>
            <coneGeometry args={[0.32, 0.35, 12]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
        {/* 島上小風車 */}
        <group position={[1.9, 0, 1.2]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.15, 1.9, 10]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <group position={[0, 1.8, 0.14]} ref={policyWindmillRef}>
            <mesh>
              <boxGeometry args={[1.3, 0.1, 0.03]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[1.3, 0.1, 0.03]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>
        <CuteTree position={[0.4, 0, 1.7]} scale={0.85} color="#40916c" />
        {[1, 3, 5].map((i) => (
          <StreetLamp key={i} position={[Math.cos(hexAngles[i]) * 4.25, 0, Math.sin(hexAngles[i]) * 4.25]} />
        ))}

        {showLabels && (
          <Html position={[0, 4.1, 0]} center distanceFactor={20}>
            <div
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap transition-transform ${
                activeModule === 'policy'
                  ? 'bg-blue-600 text-white border-blue-300 scale-110'
                  : 'bg-white/95 text-slate-800 border-stone-200 hover:scale-105'
              }`}
            >
              🏫 03 語言政策講堂
            </div>
          </Html>
        )}
      </group>

      {/* ==================================================
          04 南方島：AI 實踐島 (人工智慧應用 · 人工智慧咖啡廳)
         ================================================== */}
      <group position={[0, 0, 14.0]} onClick={(e) => handleSelectIsland('systems', e)}>
        <mesh position={[0, -0.45, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[5.2, 4.9, 0.9, 6]} />
          <meshStandardMaterial color="#b7e4c7" roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.95, 0]}>
          <cylinderGeometry args={[5.4, 4.7, 0.4, 6]} />
          <meshStandardMaterial color="#f5ebe0" />
        </mesh>
        <mesh position={[0, -1.65, 0]}>
          <cylinderGeometry args={[4.6, 3.7, 1.1, 6]} />
          <meshStandardMaterial color="#d4a373" />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 6]} receiveShadow>
          <ringGeometry args={[3.4, 4.1, 6]} />
          <meshStandardMaterial color="#f5ebe0" />
        </mesh>

        {/* 主建築：04 人工智慧咖啡廳 (暖調咖啡館 + 烘焙煙囪 + 懸浮 AI 晶體) */}
        <group position={[-0.3, 0, -0.3]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[2.8, 0.4, 2.3]} />
            <meshStandardMaterial color="#fed7aa" />
          </mesh>
          <mesh position={[0, 1.05, 0]} castShadow>
            <boxGeometry args={[2.3, 1.4, 1.9]} />
            <meshStandardMaterial color="#fffbeb" />
          </mesh>
          {/* 咖啡廳雨遮與落地窗 */}
          <mesh position={[0, 0.95, 1.05]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[2.1, 0.08, 0.45]} />
            <meshStandardMaterial color="#ea580c" />
          </mesh>
          <mesh position={[0, 0.75, 0.96]}>
            <boxGeometry args={[1.5, 0.65, 0.04]} />
            <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={0.5} />
          </mesh>
          {/* 屋頂與咖啡煙囪 */}
          <mesh position={[0, 2.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.8, 0.85, 4]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
          <mesh position={[0.85, 1.6, -0.45]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 1.9, 12]} />
            <meshStandardMaterial color="#c2410c" />
          </mesh>
          <mesh ref={smokeRef} position={[0.85, 2.8, -0.45]}>
            <sphereGeometry args={[0.25, 10, 10]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.75} />
          </mesh>
          {/* 懸浮旋轉 AI 能量多面體 */}
          <mesh ref={crystalRef} position={[0, 3.25, 0]} castShadow>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.85} />
          </mesh>
        </group>

        {/* 附屬設施：戶外咖啡陽傘座 + 創客副樓 + 太陽能發電陣列 */}
        <group position={[1.65, 0, 0.9]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <coneGeometry args={[0.75, 0.35, 10]} />
            <meshStandardMaterial color="#f97316" />
          </mesh>
        </group>
        <SolarPanelArray position={[-1.4, 0, 1.4]} rotation={[0, -0.3, 0]} />
        <CuteTree position={[1.9, 0, -1.0]} scale={0.9} color="#52b788" />
        {[0, 2, 4].map((i) => (
          <StreetLamp key={i} position={[Math.cos(hexAngles[i]) * 4.25, 0, Math.sin(hexAngles[i]) * 4.25]} />
        ))}

        {showLabels && (
          <Html position={[0, 4.2, 0]} center distanceFactor={20}>
            <div
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap transition-transform ${
                activeModule === 'systems'
                  ? 'bg-amber-500 text-white border-amber-300 scale-110'
                  : 'bg-amber-50/95 text-amber-900 border-amber-300 hover:scale-105'
              }`}
            >
              ⚡ 04 人工智慧咖啡廳
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

// ==========================================
// 7. 跨海連接木橋元件 (Connecting Bridges with Railings)
// ==========================================
function ConnectingBridge({ start, end }) {
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  const length = Math.hypot(end[0] - start[0], end[2] - start[2]);
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0]);

  return (
    <group position={[midX, 0.02, midZ]} rotation={[0, -angle, 0]}>
      {/* 橋面木板 */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[length, 0.12, 1.35]} />
        <meshStandardMaterial color="#b08968" roughness={0.7} />
      </mesh>
      {/* 雙側護欄 */}
      <mesh position={[0, 0.22, 0.62]} castShadow>
        <boxGeometry args={[length, 0.08, 0.08]} />
        <meshStandardMaterial color="#7f5539" />
      </mesh>
      <mesh position={[0, 0.22, -0.62]} castShadow>
        <boxGeometry args={[length, 0.08, 0.08]} />
        <meshStandardMaterial color="#7f5539" />
      </mesh>
      {/* 海中橋墩 */}
      <mesh position={[-length * 0.25, -0.6, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 1.2, 10]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[length * 0.25, -0.6, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 1.2, 10]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    </group>
  );
}

// ==========================================
// 8. 沿六角邊緣道路與橋樑移動的行人、腳踏車/滑板車兒童與萌寵 (絕不撞建築)
// ==========================================
function RoadWalker({ curve, offset = 0, speed = 0.04, role, shirt, bottom, hair, type = 'adult_m' }) {
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

  const isElder = type.startsWith('elder');
  const isChild = type.startsWith('child');
  const isFemale = type.endsWith('_f');
  const charScale = isChild ? 0.34 : isElder ? 0.45 : 0.48;

  useFrame(({ clock }) => {
    if (isPaused || !groupRef.current) return;
    const t = (clock.getElapsedTime() * speed + offset) % 1;
    const pos = curve.getPointAt(t);
    const nextPos = curve.getPointAt((t + 0.008) % 1);
    const bounce = Math.abs(Math.sin(clock.getElapsedTime() * (isElder ? 4 : 6.5) + offset * 10)) * 0.06;

    groupRef.current.position.set(pos.x, pos.y + bounce, pos.z);
    groupRef.current.lookAt(nextPos.x, pos.y + bounce, nextPos.z);

    const swing = Math.sin(clock.getElapsedTime() * (isElder ? 4 : 6.5) + offset * 10) * (isElder ? 0.35 : 0.55);
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
  });

  return (
    <group ref={groupRef} scale={[charScale, charScale, charScale]}>
      <group position={[-0.14, 0.35, 0]} ref={leftLegRef}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.16, 0.36, 0.18]} />
          <meshStandardMaterial color={bottom} />
        </mesh>
      </group>
      <group position={[0.14, 0.35, 0]} ref={rightLegRef}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.16, 0.36, 0.18]} />
          <meshStandardMaterial color={bottom} />
        </mesh>
      </group>
      {isFemale && (
        <mesh position={[0, 0.42, 0]} castShadow>
          <coneGeometry args={[0.36, 0.32, 14]} />
          <meshStandardMaterial color={bottom} />
        </mesh>
      )}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.3, 0.62, 14]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      {/* 長者拐杖 */}
      {isElder && (
        <mesh position={[0.35, 0.35, 0.2]} rotation={[-0.15, 0, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.03, 0.8, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      )}
      <group position={[0, 1.4, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.36, 16, 16]} />
          <meshStandardMaterial color="#ffedd5" />
        </mesh>
        <mesh position={[0, 0.12, -0.04]} castShadow>
          <sphereGeometry args={[0.37, 14, 14]} />
          <meshStandardMaterial color={hair} />
        </mesh>
      </group>
      {showLabels && (
        <Html position={[0, 2.15, 0]} center distanceFactor={22}>
          <div className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow-sm border border-slate-300 whitespace-nowrap pointer-events-none">
            {role}
          </div>
        </Html>
      )}
    </group>
  );
}

// ★ 新增：騎腳踏車與溜滑板車的小朋友元件 ★
function KidOnWheels({ curve, offset = 0, speed = 0.065, mode = 'bike', shirtColor = '#38bdf8', helmetColor = '#f43f5e', role = '單車小弟' }) {
  const groupRef = useRef();
  const wheel1Ref = useRef();
  const wheel2Ref = useRef();
  const { isPaused, showLabels } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !groupRef.current) return;
    const t = (clock.getElapsedTime() * speed + offset) % 1;
    const pos = curve.getPointAt(t);
    const nextPos = curve.getPointAt((t + 0.01) % 1);
    groupRef.current.position.set(pos.x, pos.y, pos.z);
    groupRef.current.lookAt(nextPos.x, pos.y, nextPos.z);

    if (wheel1Ref.current) wheel1Ref.current.rotation.x += 0.25;
    if (wheel2Ref.current) wheel2Ref.current.rotation.x += 0.25;
  });

  return (
    <group ref={groupRef} scale={[0.42, 0.42, 0.42]}>
      {mode === 'bike' ? (
        /* 腳踏車造型 */
        <group>
          <mesh ref={wheel1Ref} position={[0, 0.24, 0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.06, 16]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh ref={wheel2Ref} position={[0, 0.24, -0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.06, 16]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* 車架與把手 */}
          <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.85, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.65, 0.35]}>
            <cylinderGeometry args={[0.035, 0.035, 0.55, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0.9, 0.35]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      ) : (
        /* 滑板車造型 */
        <group>
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.26, 0.06, 0.9]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
          <mesh ref={wheel1Ref} position={[0, 0.1, 0.38]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.06, 12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh ref={wheel2Ref} position={[0, 0.1, -0.38]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.06, 12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0.55, 0.36]}>
            <cylinderGeometry args={[0.03, 0.03, 0.85, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0.95, 0.36]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.42, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {/* 小朋友身體與安全帽 */}
      <mesh position={[0, 0.72, -0.08]} castShadow>
        <cylinderGeometry args={[0.2, 0.24, 0.5, 12]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      <group position={[0, 1.22, -0.05]}>
        <mesh castShadow>
          <sphereGeometry args={[0.3, 14, 14]} />
          <meshStandardMaterial color="#ffedd5" />
        </mesh>
        {/* 可愛運動安全帽 */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <sphereGeometry args={[0.33, 14, 12, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
          <meshStandardMaterial color={helmetColor} roughness={0.3} />
        </mesh>
      </group>

      {showLabels && (
        <Html position={[0, 1.95, 0]} center distanceFactor={22}>
          <div className="bg-sky-50/95 px-2 py-0.5 rounded-full text-[10px] font-bold text-sky-900 shadow-sm border border-sky-300 whitespace-nowrap pointer-events-none">
            {mode === 'bike' ? '🚲' : '🛴'} {role}
          </div>
        </Html>
      )}
    </group>
  );
}

// 沿六角步道奔跑的貓狗萌寵
function RoadPet({ curve, offset = 0, speed = 0.05, species = 'dog', color = '#d97706', name = '柴柴' }) {
  const petRef = useRef();
  const tailRef = useRef();
  const { isPaused, showLabels } = useIslandStore();
  const isCat = species === 'cat';

  useFrame(({ clock }) => {
    if (isPaused || !petRef.current) return;
    const t = (clock.getElapsedTime() * speed + offset) % 1;
    const pos = curve.getPointAt(t);
    const nextPos = curve.getPointAt((t + 0.01) % 1);
    const hop = Math.abs(Math.sin(clock.getElapsedTime() * 9 + offset * 10)) * 0.05;

    petRef.current.position.set(pos.x, pos.y + hop, pos.z);
    petRef.current.lookAt(nextPos.x, pos.y + hop, nextPos.z);
    if (tailRef.current) tailRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 14) * 0.45;
  });

  return (
    <group ref={petRef} scale={isCat ? [0.36, 0.36, 0.36] : [0.42, 0.42, 0.42]}>
      <mesh position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.4, 8, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <group position={[0, 0.54, 0.3]}>
        <mesh castShadow>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[-0.12, 0.18, 0]} rotation={[0, 0, 0.2]}>
          <coneGeometry args={[0.07, 0.16, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.12, 0.18, 0]} rotation={[0, 0, -0.2]}>
          <coneGeometry args={[0.07, 0.16, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      <group position={[0, 0.45, -0.3]} ref={tailRef}>
        <mesh position={[0, 0.14, -0.06]} rotation={[-0.5, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.25, 6, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {showLabels && (
        <Html position={[0, 1.1, 0]} center distanceFactor={22}>
          <div className="bg-amber-50/95 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-amber-900 border border-amber-200 whitespace-nowrap pointer-events-none">
            {isCat ? '🐱' : '🐶'} {name}
          </div>
        </Html>
      )}
    </group>
  );
}

// ==========================================
// 9. 外海 4 座無人島與衛星島嶼 (含櫻花沙龍島戴墨鏡日光浴、燈塔、風車、港灣帆船)
// ==========================================
function SunbatherWithSunglasses({ position, rotation = [0, 0, 0], umbrellaColor = '#f43f5e' }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 海灘躺椅 */}
      <mesh position={[0, 0.08, 0]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.65, 0.08, 1.35]} />
        <meshStandardMaterial color="#fef08a" />
      </mesh>
      {/* 躺著曬日光浴的人 */}
      <mesh position={[0, 0.22, -0.05]} rotation={[Math.PI / 2 - 0.15, 0, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.45, 8, 12]} />
        <meshStandardMaterial color="#fdba74" />
      </mesh>
      {/* 頭部與酷炫黑墨鏡 */}
      <group position={[0, 0.36, -0.45]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 14]} />
          <meshStandardMaterial color="#ffedd5" />
        </mesh>
        {/* 酷炫雙鏡片墨鏡 */}
        <mesh position={[-0.06, 0.08, 0.14]}>
          <boxGeometry args={[0.09, 0.05, 0.05]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[0.06, 0.08, 0.14]}>
          <boxGeometry args={[0.09, 0.05, 0.05]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.08, 0.14]}>
          <boxGeometry args={[0.22, 0.02, 0.04]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
      {/* 海灘遮陽傘 */}
      <group position={[-0.65, 0, -0.2]}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 1.5, 8]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, 1.45, 0]} castShadow>
          <coneGeometry args={[0.95, 0.42, 12]} />
          <meshStandardMaterial color={umbrellaColor} />
        </mesh>
      </group>
    </group>
  );
}

function OuterSatelliteIslands() {
  const windmillRef = useRef();
  const boatRef = useRef();
  const { showLabels, isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime();
    if (windmillRef.current) windmillRef.current.rotation.z = t * 1.3;
    if (boatRef.current) {
      boatRef.current.position.y = -0.82 + Math.sin(t * 2.2) * 0.08;
      boatRef.current.rotation.z = Math.sin(t * 1.5) * 0.06;
    }
  });

  return (
    <group>
      {/* 1. 燈塔觀測站島 (左後方外海) */}
      <group position={[-22.5, -0.3, -15.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[3.8, 4.4, 1.2, 6]} />
          <meshStandardMaterial color="#95d5b2" />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[4.4, 3.6, 0.7, 6]} />
          <meshStandardMaterial color="#f5ebe0" />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.78, 2.6, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.56, 0.66, 0.85, 16]} />
          <meshStandardMaterial color="#e05a47" />
        </mesh>
        <mesh position={[0, 2.75, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.4, 16]} />
          <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0, 3.15, 0]} castShadow>
          <coneGeometry args={[0.62, 0.55, 16]} />
          <meshStandardMaterial color="#e05a47" />
        </mesh>
        <CuteTree position={[-1.7, 0.2, 1.1]} scale={0.9} />
        <CuteTree position={[1.6, 0.2, -1.0]} scale={0.8} />
        {showLabels && (
          <Html position={[0, 4.1, 0]} center distanceFactor={28}>
            <div className="bg-white/90 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow whitespace-nowrap">
              🏝️ 燈塔觀測站島
            </div>
          </Html>
        )}
      </group>

      {/* 2. 綠能風車島 (右後方外海) */}
      <group position={[22.5, -0.3, -15.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[4.1, 4.7, 1.2, 6]} />
          <meshStandardMaterial color="#74c69d" />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[4.7, 3.9, 0.7, 6]} />
          <meshStandardMaterial color="#f5ebe0" />
        </mesh>
        <mesh position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.36, 3.0, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <group position={[0, 2.9, 0.25]} ref={windmillRef}>
          <mesh>
            <boxGeometry args={[2.6, 0.2, 0.05]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[2.6, 0.2, 0.05]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
        <SolarPanelArray position={[0, 0.25, 1.6]} />
        <CuteTree position={[-1.8, 0.2, 0.6]} scale={1.05} color="#40916c" />
        <CuteTree position={[1.7, 0.2, -0.8]} scale={0.9} color="#52b788" />
        {showLabels && (
          <Html position={[0, 4.4, 0]} center distanceFactor={28}>
            <div className="bg-white/90 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow whitespace-nowrap">
              🏝️ 綠能風車島
            </div>
          </Html>
        )}
      </group>

      {/* 3. 櫻花沙龍島 (右前方外海：粉紅櫻花樹、涼亭、陽傘、有人戴墨鏡曬日光浴) */}
      <group position={[21.0, -0.3, 14.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[4.0, 4.6, 1.1, 6]} />
          <meshStandardMaterial color="#95d5b2" />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[4.8, 4.1, 0.6, 6]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
        {/* 粉紅櫻花樹群 */}
        <CuteTree position={[-1.6, 0.2, -1.0]} scale={1.15} color="#f472b6" />
        <CuteTree position={[1.6, 0.2, -0.8]} scale={1.0} color="#f9a8d4" />
        <CuteTree position={[0, 0.2, -2.0]} scale={0.9} color="#fb7185" />
        {/* 雅緻木造涼亭 */}
        <group position={[0, 0.2, -0.4]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.95, 1.0, 0.12, 6]} />
            <meshStandardMaterial color="#d4a373" />
          </mesh>
          <mesh position={[0, 1.35, 0]} castShadow>
            <coneGeometry args={[1.25, 0.65, 6]} />
            <meshStandardMaterial color="#e05a47" />
          </mesh>
        </group>
        {/* ★ 戴墨鏡曬日光浴的遊客與海灘陽傘 ★ */}
        <SunbatherWithSunglasses position={[-0.9, 0.25, 1.5]} rotation={[0, 0.3, 0]} umbrellaColor="#f43f5e" />
        <SunbatherWithSunglasses position={[1.1, 0.25, 1.4]} rotation={[0, -0.25, 0]} umbrellaColor="#38bdf8" />
        {showLabels && (
          <Html position={[0, 3.4, 0]} center distanceFactor={28}>
            <div className="bg-pink-50/95 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-pink-900 border border-pink-200 shadow whitespace-nowrap">
              🌸 櫻花沙龍島 (日光浴度假區)
            </div>
          </Html>
        )}
      </group>

      {/* 4. 遠洋港灣島 (左前方外海：木棧道碼頭與停泊的小帆船) */}
      <group position={[-21.0, -0.3, 14.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[3.6, 4.2, 1.1, 6]} />
          <meshStandardMaterial color="#95d5b2" />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[4.3, 3.6, 0.6, 6]} />
          <meshStandardMaterial color="#f5ebe0" />
        </mesh>
        {/* 港灣小屋與延伸木棧道碼頭 */}
        <mesh position={[-0.8, 0.6, -0.4]} castShadow>
          <boxGeometry args={[1.3, 0.9, 1.1]} />
          <meshStandardMaterial color="#fff8f0" />
        </mesh>
        <mesh position={[-0.8, 1.25, -0.4]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.05, 0.55, 4]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        <mesh position={[2.8, 0.1, 0]} castShadow>
          <boxGeometry args={[3.2, 0.15, 0.95]} />
          <meshStandardMaterial color="#b08968" />
        </mesh>
        <CuteTree position={[-1.4, 0.2, 1.0]} scale={0.95} color="#52b788" />
        {showLabels && (
          <Html position={[0, 3.1, 0]} center distanceFactor={28}>
            <div className="bg-white/90 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow whitespace-nowrap">
              ⛵ 遠洋港灣島
            </div>
          </Html>
        )}
      </group>

      {/* 停泊在港灣島碼頭旁隨波搖晃的小帆船 */}
      <group ref={boatRef} position={[-15.5, -0.82, 14.5]}>
        <mesh castShadow>
          <boxGeometry args={[1.8, 0.42, 0.85]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.7, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0.12, 1.0, 0]} rotation={[0, 0, -0.1]}>
          <coneGeometry args={[0.7, 1.35, 3]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
      </group>
    </group>
  );
}

// ==========================================
// 10. 海洋與天空動態生態：SUP 立槳、躍動海豚、噴水鯨魚、海鷗群、直升機、雲朵
// ==========================================
function SUPPaddler({ centerPos, radius = 3.5, speed = 0.5, phase = 0, boardColor = '#fbbf24' }) {
  const supRef = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !supRef.current) return;
    const t = clock.getElapsedTime() * speed + phase;
    const x = centerPos[0] + Math.cos(t) * radius;
    const z = centerPos[2] + Math.sin(t) * (radius * 0.75);
    const bob = Math.sin(t * 5) * 0.05;
    supRef.current.position.set(x, -0.82 + bob, z);
    supRef.current.rotation.y = -t + Math.PI / 2;
  });

  return (
    <group ref={supRef} scale={[0.55, 0.55, 0.55]}>
      <mesh castShadow>
        <boxGeometry args={[2.1, 0.12, 0.68]} />
        <meshStandardMaterial color={boardColor} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.38, 8, 12]} />
        <meshStandardMaterial color="#ea580c" />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#ffedd5" />
      </mesh>
      {/* 划槳 */}
      <mesh position={[0.25, 0.4, 0.38]} rotation={[0.4, 0, -0.3]}>
        <cylinderGeometry args={[0.025, 0.025, 1.3, 6]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

function JumpingDolphin({ centerPos, radius = 4.0, speed = 0.9, offset = 0 }) {
  const dolRef = useRef();
  const { isPaused } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !dolRef.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    const angle = t * 0.55;
    const x = centerPos[0] + Math.cos(angle) * radius;
    const z = centerPos[2] + Math.sin(angle) * radius;
    const jumpArc = Math.sin(t * 2.2);
    const y = -0.95 + Math.max(0, jumpArc) * 1.45;

    dolRef.current.position.set(x, y, z);
    dolRef.current.rotation.y = -angle + Math.PI / 2;
    dolRef.current.rotation.z = Math.cos(t * 2.2) * 0.45;
  });

  return (
    <group ref={dolRef} scale={[0.52, 0.52, 0.52]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.26, 1.1, 10, 14]} />
        <meshStandardMaterial color="#0284c7" roughness={0.2} />
      </mesh>
      {/* 背鰭與尾鰭 */}
      <mesh position={[0, 0.32, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.16, 0.4, 6]} />
        <meshStandardMaterial color="#0369a1" />
      </mesh>
      <mesh position={[-0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.35, 0.35, 3]} />
        <meshStandardMaterial color="#0369a1" />
      </mesh>
    </group>
  );
}

// ★ 新增：噴水鯨魚元件 (Spouting Whale) ★
function SpoutingWhale({ position, speed = 0.3, phase = 0 }) {
  const whaleRef = useRef();
  const spoutRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !whaleRef.current) return;
    const t = clock.getElapsedTime() * speed + phase;
    whaleRef.current.position.x = position[0] + Math.sin(t) * 3.5;
    whaleRef.current.position.y = -0.88 + Math.sin(t * 3) * 0.08;
    whaleRef.current.rotation.y = Math.cos(t) >= 0 ? 0 : Math.PI;

    if (spoutRef.current) {
      const pulse = (Math.sin(clock.getElapsedTime() * 3.5 + phase) + 1) * 0.5;
      spoutRef.current.scale.set(0.7 + pulse * 0.6, 0.4 + pulse * 1.3, 0.7 + pulse * 0.6);
      spoutRef.current.position.y = 0.65 + pulse * 0.55;
    }
  });

  return (
    <group ref={whaleRef} position={position} scale={[1.15, 1.15, 1.15]}>
      {/* 鯨魚身軀 */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.62, 1.8, 14, 18]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.3} />
      </mesh>
      {/* 鯨魚尾翼 */}
      <mesh position={[-1.4, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.65, 0.5, 3]} />
        <meshStandardMaterial color="#172554" />
      </mesh>
      {/* 噴水柱與水花 */}
      <group ref={spoutRef} position={[0.45, 0.9, 0]}>
        <mesh>
          <coneGeometry args={[0.28, 1.1, 12]} />
          <meshStandardMaterial color="#e0f2fe" emissive="#bae6fd" emissiveIntensity={0.5} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.32, 10, 10]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      </group>
      {showLabels && (
        <Html position={[0, 2.2, 0]} center distanceFactor={28}>
          <div className="bg-blue-900/85 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow whitespace-nowrap pointer-events-none">
            🐳 噴水藍鯨
          </div>
        </Html>
      )}
    </group>
  );
}

// 展翅海鷗群
function SeagullFlock() {
  const flockRef = useRef();
  const wingRefs = useRef([]);
  const { isPaused } = useIslandStore();

  const birds = useMemo(
    () => [
      { pos: [0, 0, 0], scale: 0.7 },
      { pos: [-1.4, 0.3, -1.1], scale: 0.58 },
      { pos: [1.3, -0.2, -1.2], scale: 0.62 },
      { pos: [-2.5, 0.5, -2.2], scale: 0.52 },
      { pos: [2.4, 0.1, -2.4], scale: 0.55 },
    ],
    []
  );

  useFrame(({ clock }) => {
    if (isPaused || !flockRef.current) return;
    const t = clock.getElapsedTime() * 0.32;
    const r = 17.5;
    flockRef.current.position.set(Math.cos(t) * r, 9.2 + Math.sin(t * 2.5) * 0.6, Math.sin(t) * (r * 0.8));
    flockRef.current.rotation.y = -t;

    wingRefs.current.forEach((w, i) => {
      if (!w) return;
      const flap = Math.sin(clock.getElapsedTime() * 8 + i) * 0.45;
      if (w.left) w.left.rotation.z = flap;
      if (w.right) w.right.rotation.z = -flap;
    });
  });

  return (
    <group ref={flockRef}>
      {birds.map((b, i) => (
        <group key={i} position={b.pos} scale={[b.scale, b.scale, b.scale]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.08, 0.35, 6, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh
            ref={(el) => {
              if (!wingRefs.current[i]) wingRefs.current[i] = {};
              wingRefs.current[i].left = el;
            }}
            position={[-0.28, 0, 0]}
          >
            <boxGeometry args={[0.55, 0.03, 0.18]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh
            ref={(el) => {
              if (!wingRefs.current[i]) wingRefs.current[i] = {};
              wingRefs.current[i].right = el;
            }}
            position={[0.28, 0, 0]}
          >
            <boxGeometry args={[0.55, 0.03, 0.18]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FlyingHelicopter() {
  const heliRef = useRef();
  const mainRotorRef = useRef();
  const tailRotorRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime() * 0.28;
    const radius = 19.5;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * (radius * 0.78);
    const y = 10.5 + Math.sin(t * 3) * 0.4;
    if (heliRef.current) {
      heliRef.current.position.set(x, y, z);
      heliRef.current.rotation.set(0.12, Math.atan2(-Math.sin(t) * radius, Math.cos(t) * (radius * 0.78)), 0);
    }
    if (mainRotorRef.current) mainRotorRef.current.rotation.y += 0.45;
    if (tailRotorRef.current) tailRotorRef.current.rotation.x += 0.5;
  });

  return (
    <group ref={heliRef} position={[15, 10, 0]} scale={[0.72, 0.72, 0.72]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.65, 0.9, 12, 16]} />
        <meshStandardMaterial color="#e05a47" />
      </mesh>
      <mesh position={[0, 0.1, 0.55]}>
        <sphereGeometry args={[0.58, 14, 14]} />
        <meshStandardMaterial color="#bae6fd" />
      </mesh>
      <mesh position={[0, 0.15, -1.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.28, 1.9, 12]} />
        <meshStandardMaterial color="#e05a47" />
      </mesh>
      <group position={[0, 0.82, 0]} ref={mainRotorRef}>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[3.8, 0.04, 0.22]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[3.8, 0.04, 0.22]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
      <group position={[0.14, 0.45, -2.35]} ref={tailRotorRef}>
        <mesh>
          <boxGeometry args={[0.04, 0.75, 0.1]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
      {showLabels && (
        <Html position={[0, 1.6, 0]} center distanceFactor={26}>
          <div className="bg-rose-600/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow whitespace-nowrap pointer-events-none">
            🚁 空中巡航號
          </div>
        </Html>
      )}
    </group>
  );
}

function FluffyCloud({ position, scale = 1, speed = 0.18 }) {
  const cloudRef = useRef();
  const { isPaused } = useIslandStore();
  useFrame(({ clock }) => {
    if (!isPaused && cloudRef.current) {
      cloudRef.current.position.x = position[0] + Math.sin(clock.getElapsedTime() * speed) * 2.5;
    }
  });
  return (
    <group ref={cloudRef} position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.1, 14, 14]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.9, -0.15, 0.2]}>
        <sphereGeometry args={[0.85, 14, 14]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.9, -0.2, -0.1]}>
        <sphereGeometry args={[0.8, 14, 14]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// ==========================================
// 11. 3D 群島總場景與智慧相機控制器
// ==========================================
function IslandScene({ controlsRef }) {
  const { viewport } = useThree();
  const { showSynergyLines, cameraFlight, clearCameraFlight } = useIslandStore();

  const responsiveScale = useMemo(() => {
    const minDim = Math.min(viewport.width, viewport.height);
    return Math.max(0.72, Math.min(1.15, minDim / 13.0));
  }, [viewport.width, viewport.height]);

  // 預先計算所有六角邊緣道路與跨島橋樑安全路徑
  const hexPathOrange = useMemo(() => createHexagonPath(0, 0, 4.3), []);
  const hexPathCorpus = useMemo(() => createHexagonPath(12.5, -7.2, 3.75), []);
  const hexPathPolicy = useMemo(() => createHexagonPath(-12.5, -7.2, 3.75), []);
  const hexPathSystems = useMemo(() => createHexagonPath(0, 14.0, 3.75), []);
  const grandBridgePath = useMemo(() => createGrandArchipelagoPath(), []);

  // 當點擊建築物或切換場館時，平滑推進鏡頭；到達後自動釋放控制權以支援滑鼠/手勢自由縮放
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || !cameraFlight) return;

    controls.object.position.lerp(cameraFlight.pos, 0.08);
    controls.target.lerp(cameraFlight.target, 0.08);
    controls.update();

    if (
      controls.object.position.distanceTo(cameraFlight.pos) < 0.15 ||
      Date.now() - cameraFlight.timestamp > 1600
    ) {
      clearCameraFlight();
    }
  });

  return (
    <>
      <color attach="background" args={['#bae6fd']} />
      <fog attach="fog" args={['#bae6fd', 42, 88]} />
      <ambientLight intensity={1.35} color="#fffcf2" />
      <hemisphereLight skyColor="#ffffff" groundColor="#7dd3fc" intensity={0.65} />
      <directionalLight position={[20, 38, 24]} intensity={1.65} color="#fff8e7" castShadow />

      <group scale={[responsiveScale, responsiveScale, responsiveScale]} position={[0, -0.5, 0]}>
        {/* 廣闊無邊的蔚藍大海 */}
        <mesh position={[0, -1.25, 0]} receiveShadow>
          <cylinderGeometry args={[78, 78, 0.8, 64]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.22} />
        </mesh>

        {/* 外海 4 座無人島與衛星島嶼 */}
        <OuterSatelliteIslands />

        {/* 海洋生態：SUP 立槳板、躍動海豚、噴水藍鯨 */}
        <SUPPaddler centerPos={[6.5, 0, 5.5]} radius={2.4} speed={0.55} phase={0} boardColor="#facc15" />
        <SUPPaddler centerPos={[-7.0, 0, 5.2]} radius={2.5} speed={0.48} phase={2.1} boardColor="#fb7185" />
        <SUPPaddler centerPos={[0, 0, -9.5]} radius={2.8} speed={0.52} phase={4.0} boardColor="#34d399" />

        <JumpingDolphin centerPos={[9.5, 0, 6.5]} radius={3.2} speed={0.85} offset={0} />
        <JumpingDolphin centerPos={[-9.5, 0, 6.5]} radius={3.5} speed={0.78} offset={Math.PI} />

        <SpoutingWhale position={[14.5, -0.88, 3.0]} speed={0.32} phase={0} />
        <SpoutingWhale position={[-14.5, -0.88, 2.5]} speed={0.28} phase={2.5} />

        {/* 天空生態：展翅海鷗群、巡航直升機、立體白雲 */}
        <SeagullFlock />
        <FlyingHelicopter />
        <FluffyCloud position={[-15, 11.5, -10]} scale={1.15} speed={0.16} />
        <FluffyCloud position={[16, 12.0, -8]} scale={1.3} speed={0.14} />
        <FluffyCloud position={[-10, 12.5, 12]} scale={0.95} speed={0.2} />
        <FluffyCloud position={[13, 11.0, 11]} scale={1.05} speed={0.15} />

        <Float speed={0.4} rotationIntensity={0.005} floatIntensity={0.025}>
          {/* 4 座六角主題島嶼與場館 */}
          <HexThemeIslands />

          {/* 連接四大六角島的 3 座跨海木橋 */}
          <ConnectingBridge start={[4.4, 0, -2.5]} end={[8.4, 0, -4.8]} />
          <ConnectingBridge start={[-4.4, 0, -2.5]} end={[-8.4, 0, -4.8]} />
          <ConnectingBridge start={[0, 0, 5.1]} end={[0, 0, 9.3]} />

          {/* 跨場館知識協作光弧 */}
          {showSynergyLines && (
            <group>
              <QuadraticBezierLine start={[0, 3.2, -1.2]} end={[12.5, 3.2, -7.2]} mid={[6.2, 6.8, -4.2]} color="#e05a47" lineWidth={2} dashed dashScale={2} />
              <QuadraticBezierLine start={[0, 3.2, -1.2]} end={[-12.5, 3.2, -7.2]} mid={[-6.2, 6.8, -4.2]} color="#3a86ff" lineWidth={2} dashed dashScale={2} />
              <QuadraticBezierLine start={[0, 3.2, -1.2]} end={[0, 3.2, 14.0]} mid={[0, 7.2, 6.5]} color="#f59e0b" lineWidth={2} dashed dashScale={2} />
              <QuadraticBezierLine start={[-12.5, 3.2, -7.2]} end={[12.5, 3.2, -7.2]} mid={[0, 7.5, -7.2]} color="#0d9488" lineWidth={2} dashed dashScale={2} />
            </group>
          )}

          {/* ★ 走在六角形邊緣道路與跨島橋樑上的島民、單車/滑板車兒童與貓狗 (100% 防撞建築) ★ */}
          {/* 橙果島外環步道 */}
          <RoadWalker curve={hexPathOrange} offset={0.0} speed={0.038} role="我 · 橙果島主" shirt="#e05a47" bottom="#1e293b" hair="#1e293b" type="adult_m" />
          <RoadWalker curve={hexPathOrange} offset={0.35} speed={0.032} role="女性語言學家" shirt="#ec4899" bottom="#be185d" hair="#451a03" type="adult_f" />
          <RoadWalker curve={hexPathOrange} offset={0.68} speed={0.022} role="散步阿公" shirt="#64748b" bottom="#334155" hair="#e2e8f0" type="elder_m" />
          <KidOnWheels curve={hexPathOrange} offset={0.18} speed={0.065} mode="bike" shirtColor="#38bdf8" helmetColor="#f43f5e" role="騎單車小弟" />
          <KidOnWheels curve={hexPathOrange} offset={0.52} speed={0.06} mode="scooter" shirtColor="#a855f7" helmetColor="#facc15" role="滑板車小妹" />

          {/* 計量語料島外環步道 */}
          <RoadWalker curve={hexPathCorpus} offset={0.1} speed={0.04} role="語料庫研究員" shirt="#0d9488" bottom="#334155" hair="#1e293b" type="adult_m" />
          <RoadWalker curve={hexPathCorpus} offset={0.55} speed={0.042} role="高中女學生" shirt="#f8fafc" bottom="#be123c" hair="#451a03" type="adult_f" />
          <KidOnWheels curve={hexPathCorpus} offset={0.8} speed={0.062} mode="scooter" shirtColor="#fb923c" helmetColor="#38bdf8" role="滑板車少年" />

          {/* 社會政策島外環步道 */}
          <RoadWalker curve={hexPathPolicy} offset={0.2} speed={0.036} role="政策分析師" shirt="#6366f1" bottom="#312e81" hair="#78350f" type="adult_f" />
          <RoadWalker curve={hexPathPolicy} offset={0.65} speed={0.024} role="慈祥阿嬤" shirt="#d97706" bottom="#78350f" hair="#cbd5e1" type="elder_f" />
          <KidOnWheels curve={hexPathPolicy} offset={0.45} speed={0.068} mode="bike" shirtColor="#4ade80" helmetColor="#f97316" role="單車小女孩" />

          {/* AI 實踐島外環步道 */}
          <RoadWalker curve={hexPathSystems} offset={0.15} speed={0.042} role="AI 工程師" shirt="#f59e0b" bottom="#1e293b" hair="#0f172a" type="adult_m" />
          <RoadWalker curve={hexPathSystems} offset={0.6} speed={0.045} role="高中男學生" shirt="#f8fafc" bottom="#1e3a8a" hair="#0f172a" type="adult_m" />

          {/* 跨島木橋大巡迴（行人與萌寵自由往返於各座六角島與木橋） */}
          <RoadWalker curve={grandBridgePath} offset={0.05} speed={0.014} role="跨島探索學者" shirt="#10b981" bottom="#064e3b" hair="#1e293b" type="adult_m" />
          <RoadWalker curve={grandBridgePath} offset={0.48} speed={0.015} role="小學生" shirt="#facc15" bottom="#ca8a04" hair="#1e293b" type="child_f" />

          {/* 6 隻可愛貓咪與小狗 */}
          <RoadPet curve={hexPathOrange} offset={0.25} speed={0.052} species="dog" color="#d97706" name="柴柴" />
          <RoadPet curve={hexPathOrange} offset={0.82} speed={0.048} species="cat" color="#fb923c" name="胖橘貓" />
          <RoadPet curve={hexPathCorpus} offset={0.35} speed={0.055} species="dog" color="#fef3c7" name="小白汪" />
          <RoadPet curve={hexPathPolicy} offset={0.75} speed={0.046} species="cat" color="#f8fafc" name="雪白喵" />
          <RoadPet curve={hexPathSystems} offset={0.4} speed={0.05} species="dog" color="#b45309" name="黃金獵犬" />
          <RoadPet curve={grandBridgePath} offset={0.22} speed={0.018} species="cat" color="#334155" name="黑嚕嚕喵" />
        </Float>
      </group>

      <OrbitControls
        ref={controlsRef}
        onStart={clearCameraFlight}
        enablePan={true}
        enableZoom={true}
        zoomSpeed={1.2}
        maxPolarAngle={Math.PI / 2.15}
        minPolarAngle={Math.PI / 9}
        minDistance={4.0}
        maxDistance={62}
        target={[0, 0.2, 0]}
      />
    </>
  );
}

// ==========================================
// 12. 頂層全螢幕懸浮 UI 主元件 (支援手機版右上角收折、搜尋主題、場館分類檢索)
// ==========================================
export default function App() {
  const controlsRef = useRef();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    activeModule,
    setActiveModule,
    isModalOpen,
    setModalOpen,
    isMobileMenuOpen,
    setMobileMenuOpen,
    showLabels,
    toggleLabels,
    showSynergyLines,
    toggleSynergyLines,
    isPaused,
    togglePause,
    triggerCameraFlight,
    clearCameraFlight,
  } = useIslandStore();

  const mod = activeModule ? researchModules[activeModule] : null;

  // 搜尋過濾邏輯：可同時搜尋「四大主題」、「場館名稱」、「簡介」與「各分類研究細項」
  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return Object.entries(researchModules);
    return Object.entries(researchModules).filter(([_, val]) => {
      const matchHeader =
        val.themeName.toLowerCase().includes(q) ||
        val.venueName.toLowerCase().includes(q) ||
        val.summary.toLowerCase().includes(q);
      const matchItems =
        val.categories &&
        val.categories.some(
          (cat) =>
            cat.name.toLowerCase().includes(q) ||
            cat.list.some((item) => item.toLowerCase().includes(q))
        );
      return matchHeader || matchItems;
    });
  }, [searchQuery]);

  // 選取場館並平滑 Zoom In
  const handleSelectVenue = (key) => {
    const targetMod = researchModules[key];
    setActiveModule(key);
    setModalOpen(true);
    setMobileMenuOpen(false);
    if (targetMod) {
      triggerCameraFlight(targetMod.cameraPos, targetMod.center);
    }
  };

  // 手動縮放與全景重置
  const handleZoom = (factor) => {
    clearCameraFlight();
    const controls = controlsRef.current;
    if (!controls) return;
    const cam = controls.object;
    const offset = cam.position.clone().sub(controls.target);
    const newLen = Math.max(controls.minDistance, Math.min(controls.maxDistance, offset.length() * factor));
    offset.setLength(newLen);
    cam.position.copy(controls.target).add(offset);
    controls.update();
  };

  const handleResetOverview = (dist = 26.0, height = 16.5) => {
    setModalOpen(false);
    setMobileMenuOpen(false);
    triggerCameraFlight([0, height, dist], [0, 0.2, 2.0]);
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#bae6fd' }}
    >
      {/* 1. 底層：100% 滿版 3D 互動群島畫布 */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}
      >
        <Canvas shadows camera={{ position: [0, 16.5, 26.0], fov: 42 }}>
          <IslandScene controlsRef={controlsRef} />
        </Canvas>
      </div>

      {/* 2. 手機版專用：簡潔頂部標題與右上角縮小功能按鈕群 */}
      <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between pointer-events-none md:hidden">
        <div
          onClick={() => handleResetOverview(26.0, 16.5)}
          className="pointer-events-auto bg-[#fdfbf7]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-stone-200 flex items-center gap-2 cursor-pointer"
        >
          <span className="text-base">🍊</span>
          <div>
            <div className="text-xs font-black text-[#e05a47] leading-none">橙果島群島</div>
            <div className="text-[9px] font-bold text-slate-500 mt-0.5">點擊建築 Zoom In</div>
          </div>
        </div>

        {/* 右上角縮小按鈕群 */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={toggleLabels}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold shadow-lg border ${
              showLabels ? 'bg-slate-800 text-white border-slate-700' : 'bg-white/95 text-slate-700 border-stone-200'
            }`}
            title="切換名牌"
          >
            🏷️
          </button>
          <button
            onClick={() => handleResetOverview(28.0, 18.0)}
            className="bg-white/95 text-slate-700 border border-stone-200 px-2.5 py-2 rounded-xl text-xs font-bold shadow-lg"
            title="全景視角"
          >
            🌍
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(!isMobileMenuOpen);
              if (!isMobileMenuOpen) setModalOpen(false);
            }}
            className="bg-[#e05a47] text-white px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-lg flex items-center gap-1"
          >
            {isMobileMenuOpen ? '✕ 關閉' : '☰ 四大場館'}
          </button>
        </div>
      </div>

      {/* 3. 電腦版頂部中央膠囊工具列 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto hidden md:flex items-center gap-2 bg-[#fdfbf7]/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-stone-200">
        <button
          onClick={toggleLabels}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            showLabels ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-stone-200/60'
          }`}
        >
          🏷️ 名牌
        </button>
        <button
          onClick={toggleSynergyLines}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            showSynergyLines ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-stone-200/60'
          }`}
        >
          🔗 協作線
        </button>
        <button
          onClick={togglePause}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            isPaused ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-stone-200/60'
          }`}
        >
          {isPaused ? '▶️ 繼續' : '⏸️ 暫停'}
        </button>
        <div className="h-4 w-[1px] bg-stone-300 mx-1" />
        <button
          onClick={() => handleSelectVenue('theory')}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 hover:bg-orange-200 text-orange-900"
        >
          🍊 近看橘子紀念碑
        </button>
        <button
          onClick={() => handleResetOverview(26.0, 16.5)}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-stone-100 hover:bg-stone-200 text-slate-700"
        >
          🏝️ 六角群島全景
        </button>
        <button
          onClick={() => handleResetOverview(42.0, 26.0)}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-sky-100 hover:bg-sky-200 text-sky-900"
        >
          🌊 遠眺外海無人島與鯨魚
        </button>
      </div>

      {/* 4. 底部 Zoom In / Zoom Out 控制膠囊 (手機版精簡置底，電腦版完整呈現) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2 bg-[#fdfbf7]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xl border border-stone-200">
        <button
          onClick={() => handleZoom(0.75)}
          className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-white"
        >
          ➕ 放大
        </button>
        <button
          onClick={() => handleZoom(1.3)}
          className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-white"
        >
          ➖ 縮小
        </button>
        <button
          onClick={() => handleResetOverview(26.0, 16.5)}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900"
        >
          🧭 重置視角
        </button>
      </div>

      {/* 5. 左邊欄：四大主題與四大場館導覽 + 即時搜尋功能 (電腦常駐，手機由右上角按鈕展開) */}
      <aside
        className={`absolute top-16 md:top-4 left-3 md:left-5 bottom-16 md:bottom-16 z-30 w-[330px] max-w-[92vw] bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200/90 p-5 rounded-3xl shadow-2xl pointer-events-auto flex flex-col justify-between transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* 品牌標頭 */}
          <div className="border-b border-stone-200 pb-3 mb-3">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black tracking-tight text-[#e05a47]">🍊 橙果島</span>
                <span className="text-xs font-extrabold text-slate-700">六角知識群島</span>
              </div>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                4 大主題場館
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-1">
              點擊場館自動 Zoom In 聚焦 · 探索 36 項研究與 AI 系統
            </p>
          </div>

          {/* ★ 搜尋主題與場館輸入框 ★ */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 搜尋四大主題、場館或研究關鍵字..."
              className="w-full bg-white text-xs font-medium text-slate-800 placeholder-slate-400 px-3.5 py-2.5 rounded-2xl border border-stone-200 focus:outline-none focus:border-[#e05a47] shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* 四大場館與四大主題卡片列表 */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredModules.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">
                找不到符合「{searchQuery}」的主題或研究
              </div>
            ) : (
              filteredModules.map(([key, value]) => {
                const isSelected = activeModule === key && isModalOpen;
                return (
                  <div
                    key={key}
                    onClick={() => handleSelectVenue(key)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/95 border-[#e05a47] shadow-md'
                        : 'bg-white/90 border-stone-200/90 hover:bg-stone-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold text-[#e05a47] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                        {value.themeName}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{value.stats.itemsCount} ›</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 mt-1">{value.venueName}</div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{value.summary}</p>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-[10px] font-medium text-slate-400 text-center border-t border-stone-200 pt-2.5 mt-2">
            💡 點擊場館即可推進鏡頭並展開 3-4 類研究成果
          </div>
        </div>
      </aside>

      {/* 6. 右側詳細研究與 AI 系統卡片 (細分為 3-4 類，支援關鍵字高亮過濾) */}
      {isModalOpen && mod && (
        <div className="absolute top-16 md:top-4 right-3 md:right-5 bottom-16 md:bottom-16 z-30 w-[380px] max-w-[92vw] bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200/90 rounded-3xl p-5 shadow-2xl pointer-events-auto flex flex-col justify-between overflow-hidden">
          <div className="overflow-y-auto pr-1 space-y-3.5">
            {/* 頂部主題標籤與關閉按鈕 */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-[#e05a47] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                {mod.themeName}
              </span>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 bg-stone-100 hover:bg-stone-200 w-7 h-7 rounded-full flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* 場館名稱與簡短說明 */}
            <div>
              <div className="text-xs font-bold text-orange-600">{mod.islandName}</div>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">{mod.venueName}</h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{mod.summary}</p>
            </div>

            <div className="bg-stone-100 border-l-4 border-[#e05a47] p-3 rounded-r-xl text-xs text-slate-700 font-medium leading-relaxed">
              {mod.quote}
            </div>

            {/* 若為 04 人工智慧咖啡廳，優先呈現 3 座線上互動系統入口 */}
            {mod.isSystems && mod.links && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">
                  ⚡ 線上 AI 系統（點擊立即啟動）
                </div>
                {mod.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-amber-50/70 hover:bg-amber-100/80 border border-amber-300 p-3 rounded-2xl shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">{link.name}</span>
                      <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                        {link.tag} ↗
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{link.desc}</p>
                  </a>
                ))}
              </div>
            )}

            {/* 細分為 3-4 類的研究成果清單 */}
            {mod.categories && (
              <div className="space-y-3 pt-1">
                {mod.categories.map((cat, cIdx) => (
                  <div key={cIdx} className="space-y-1.5">
                    <div className="text-xs font-extrabold text-slate-800 bg-stone-200/70 px-3 py-1 rounded-lg">
                      {cat.name}
                    </div>
                    <div className="space-y-1.5">
                      {cat.list.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="bg-white border border-stone-200/90 rounded-xl p-2.5 text-xs text-slate-700 font-medium shadow-sm flex items-start gap-2"
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
          </div>
        </div>
      )}
    </div>
  );
}
