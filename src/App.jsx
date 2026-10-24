import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, QuadraticBezierLine, Line } from '@react-three/drei';
import { create } from 'zustand';
import * as THREE from 'three';

// ==========================================
// 1. 全域狀態管理 (內建於單一檔案，避免缺檔報錯)
// ==========================================
const useIslandStore = create((set) => ({
  activeModule: 'theory',
  visitedModules: ['theory'],
  setActiveModule: (moduleKey) =>
    set((s) => ({
      activeModule: moduleKey,
      visitedModules:
        moduleKey && !s.visitedModules.includes(moduleKey)
          ? [...s.visitedModules, moduleKey]
          : s.visitedModules,
    })),
  sceneMode: 'day', // 'dawn' | 'day' | 'sunset' | 'night' | 'snow'
  setSceneMode: (sceneMode) => set({ sceneMode }),
  autoRotate: false,
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
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
  toastMessage: '🍊 歡迎來到 EUREKA！橙果島！三座特色大橋與分流海上航線已全面啟航',
  setToastMessage: (msg) => set({ toastMessage: msg }),
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
// 2. 場景氣候與光影配置表 (清晨 / 白晝 / 黃昏 / 晚上 / 飄雪)
// ==========================================
const SCENE_CONFIGS = {
  dawn: {
    label: '🌅 清晨',
    bg: '#fed7aa',
    fog: '#ffedd5',
    ocean: '#38bdf8',
    ambientColor: '#ffe4e6',
    ambientIntensity: 1.15,
    dirColor: '#fb923c',
    dirIntensity: 1.45,
    dirPos: [28, 18, 12],
    isNight: false,
    isSnow: false,
  },
  day: {
    label: '☀️ 白晝',
    bg: '#bae6fd',
    fog: '#bae6fd',
    ocean: '#0ea5e9',
    ambientColor: '#fffcf2',
    ambientIntensity: 1.35,
    dirColor: '#fff8e7',
    dirIntensity: 1.65,
    dirPos: [20, 38, 24],
    isNight: false,
    isSnow: false,
  },
  sunset: {
    label: '🌇 黃昏',
    bg: '#fb7185',
    fog: '#fdba74',
    ocean: '#0284c7',
    ambientColor: '#fed7aa',
    ambientIntensity: 1.0,
    dirColor: '#ea580c',
    dirIntensity: 1.6,
    dirPos: [-28, 14, 18],
    isNight: false,
    isSnow: false,
  },
  night: {
    label: '🌙 晚上',
    bg: '#0f172a',
    fog: '#0f172a',
    ocean: '#082f49',
    ambientColor: '#334155',
    ambientIntensity: 0.55,
    dirColor: '#94a3b8',
    dirIntensity: 0.45,
    dirPos: [-15, 32, -15],
    isNight: true,
    isSnow: false,
  },
  snow: {
    label: '❄️ 飄雪',
    bg: '#e2e8f0',
    fog: '#e2e8f0',
    ocean: '#38bdf8',
    ambientColor: '#f8fafc',
    ambientIntensity: 1.4,
    dirColor: '#ffffff',
    dirIntensity: 1.3,
    dirPos: [18, 35, 20],
    isNight: false,
    isSnow: true,
  },
};

// ==========================================
// 3. 四大主題、四大場館與 3-4 類精細研究資料庫
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
// 4. 陸地與海洋無碰撞固定路線產生器 (All Non-Overlapping Closed Curves)
// ==========================================
function createHexagonPath(cx, cz, radius) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    pts.push(new THREE.Vector3(cx + Math.cos(angle) * radius, 0.04, cz + Math.sin(angle) * radius));
  }
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.08);
}

// 产生平滑封閉橢圓海面航道（確保每種海洋生物/運動/船隻都在專屬水域，絕不碰撞）
function createOvalSeaRoute(cx, cz, rx, rz, y = -0.82) {
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    pts.push(new THREE.Vector3(cx + Math.cos(angle) * rx, y, cz + Math.sin(angle) * rz));
  }
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
}

// 陸地跨島橋樑大巡迴路徑
function createGrandArchipelagoPath() {
  const pts = [
    new THREE.Vector3(0, 0.05, 4.3),
    new THREE.Vector3(0, 0.05, 9.6),
    new THREE.Vector3(3.3, 0.05, 12.1),
    new THREE.Vector3(3.3, 0.05, 15.9),
    new THREE.Vector3(0, 0.05, 17.8),
    new THREE.Vector3(-3.3, 0.05, 15.9),
    new THREE.Vector3(-3.3, 0.05, 12.1),
    new THREE.Vector3(0, 0.05, 9.6),
    new THREE.Vector3(0, 0.05, 4.3),
    new THREE.Vector3(3.7, 0.05, 2.1),
    new THREE.Vector3(3.7, 0.05, -2.1),
    new THREE.Vector3(8.8, 0.05, -5.1),
    new THREE.Vector3(12.5, 0.05, -3.4),
    new THREE.Vector3(15.8, 0.05, -5.3),
    new THREE.Vector3(15.8, 0.05, -9.1),
    new THREE.Vector3(12.5, 0.05, -11.0),
    new THREE.Vector3(8.8, 0.05, -5.1),
    new THREE.Vector3(3.7, 0.05, -2.1),
    new THREE.Vector3(0, 0.05, -4.3),
    new THREE.Vector3(-3.7, 0.05, -2.1),
    new THREE.Vector3(-8.8, 0.05, -5.1),
    new THREE.Vector3(-12.5, 0.05, -11.0),
    new THREE.Vector3(-15.8, 0.05, -9.1),
    new THREE.Vector3(-15.8, 0.05, -5.3),
    new THREE.Vector3(-12.5, 0.05, -3.4),
    new THREE.Vector3(-8.8, 0.05, -5.1),
    new THREE.Vector3(-3.7, 0.05, -2.1),
    new THREE.Vector3(-3.7, 0.05, 2.1),
  ];
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.12);
}

// 觀光渡輪專屬中環跳島航線 (完全避開內灣運動區、三座橋樑與外海郵輪)
function createOuterFerryRoute() {
  const pts = [
    new THREE.Vector3(0.0, -0.82, -16.8),   // 北側海峽
    new THREE.Vector3(18.0, -0.82, -13.8),  // 綠能風車島停靠站
    new THREE.Vector3(20.5, -0.82, 0.0),    // 東側中環水道
    new THREE.Vector3(17.2, -0.82, 13.0),   // 櫻花沙龍島停靠站
    new THREE.Vector3(0.0, -0.82, 21.8),    // AI 島南側外海水道
    new THREE.Vector3(-17.2, -0.82, 13.0),  // 遠洋港灣島停靠站
    new THREE.Vector3(-20.5, -0.82, 0.0),   // 西側中環水道
    new THREE.Vector3(-18.0, -0.82, -13.8), // 燈塔觀測站島停靠站
  ];
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.45);
}

// ==========================================
// 5. ★ 三座不同造型與配色的跨海大橋 ★
// (1) 翡翠白玉拱橋 (Arch Bridge)
// (2) 緋紅金冠斜張橋 (Cable-Stayed Bridge)
// (3) 暖陽原木棧橋 (Wooden Bridge)
// ==========================================

// (1) 拱橋：連通 橙果主島 ⇄ 02 語料庫花園
function ArchBridge({ start, end }) {
  const { sceneMode, setToastMessage } = useIslandStore();
  const isNight = sceneMode === 'night';
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  const length = Math.hypot(end[0] - start[0], end[2] - start[2]);
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0]);

  const hangerPositions = useMemo(() => [-1.4, -0.7, 0, 0.7, 1.4], []);

  return (
    <group
      position={[midX, 0.02, midZ]}
      rotation={[0, -angle, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setToastMessage('🌈 翡翠白玉拱橋（Arch Bridge）：以雙拋物線翡翠鋼拱與白玉橋面連結語料庫花園！');
      }}
    >
      {/* 象牙白石橋面 */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[length, 0.14, 1.45]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      {/* 翡翠綠兩側護欄 */}
      <mesh position={[0, 0.2, 0.66]} castShadow>
        <boxGeometry args={[length, 0.14, 0.1]} />
        <meshStandardMaterial color="#0d9488" />
      </mesh>
      <mesh position={[0, 0.2, -0.66]} castShadow>
        <boxGeometry args={[length, 0.14, 0.1]} />
        <meshStandardMaterial color="#0d9488" />
      </mesh>

      {/* 雙側大型翡翠拱肋 (上拱結構 + 垂直吊桿) */}
      {[0.66, -0.66].map((zOffset, idx) => (
        <group key={idx}>
          <QuadraticBezierLine
            start={[-length * 0.46, 0.1, zOffset]}
            mid={[0, 2.15, zOffset]}
            end={[length * 0.46, 0.1, zOffset]}
            color={isNight ? '#2dd4bf' : '#0f766e'}
            lineWidth={4.5}
          />
          {hangerPositions.map((hx, hIdx) => {
            const normX = hx / (length * 0.46);
            const archY = (1 - normX * normX) * 1.15;
            return (
              <mesh key={hIdx} position={[hx, archY / 2 + 0.1, zOffset]}>
                <cylinderGeometry args={[0.025, 0.025, archY, 8]} />
                <meshStandardMaterial
                  color="#5eead4"
                  emissive={isNight ? '#14b8a6' : '#000000'}
                  emissiveIntensity={isNight ? 1.2 : 0}
                />
              </mesh>
            );
          })}
        </group>
      ))}
      {/* 拱頂橫向連繫樑 */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <boxGeometry args={[0.18, 0.12, 1.38]} />
        <meshStandardMaterial color="#0f766e" />
      </mesh>
      {/* 白石橋墩 */}
      <mesh position={[-length * 0.32, -0.55, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 1.1, 12]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[length * 0.32, -0.55, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 1.1, 12]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
    </group>
  );
}

// (2) 斜張橋：連通 橙果主島 ⇄ 03 語言政策講堂
function CableStayedBridge({ start, end }) {
  const { sceneMode, setToastMessage } = useIslandStore();
  const isNight = sceneMode === 'night';
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  const length = Math.hypot(end[0] - start[0], end[2] - start[2]);
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0]);

  const cableAnchors = useMemo(() => [-1.85, -1.25, -0.65, 0.65, 1.25, 1.85], []);

  return (
    <group
      position={[midX, 0.02, midZ]}
      rotation={[0, -angle, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setToastMessage('🌉 緋紅金冠斜張橋（Cable-Stayed Bridge）：以高聳雙柱塔與放射狀黃金鋼索連結語言政策講堂！');
      }}
    >
      {/* 現代深灰鋼構橋面與緋紅側樑 */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[length, 0.14, 1.45]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.14, 0.68]}>
        <boxGeometry args={[length, 0.12, 0.08]} />
        <meshStandardMaterial color="#e11d48" />
      </mesh>
      <mesh position={[0, 0.14, -0.68]}>
        <boxGeometry args={[length, 0.12, 0.08]} />
        <meshStandardMaterial color="#e11d48" />
      </mesh>

      {/* 中央 H 型高聳斜張橋主塔 (緋紅塔身 + 黃金塔冠) */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 1.15, 0.68]} castShadow>
          <boxGeometry args={[0.24, 2.8, 0.18]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>
        <mesh position={[0, 1.15, -0.68]} castShadow>
          <boxGeometry args={[0.24, 2.8, 0.18]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>
        {/* 塔間橫樑與黃金塔冠 */}
        <mesh position={[0, 1.65, 0]} castShadow>
          <boxGeometry args={[0.2, 0.16, 1.45]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
        <mesh position={[0, 2.45, 0]} castShadow>
          <boxGeometry args={[0.22, 0.18, 1.5]} />
          <meshStandardMaterial
            color="#fde047"
            emissive={isNight ? '#f59e0b' : '#000000'}
            emissiveIntensity={isNight ? 1.8 : 0.3}
          />
        </mesh>

        {/* 雙側放射狀斜張鋼索 */}
        {[0.68, -0.68].map((zSide, sIdx) =>
          cableAnchors.map((ax, cIdx) => (
            <Line
              key={`${sIdx}-${cIdx}`}
              points={[
                [0, 2.38, zSide],
                [ax, 0.15, zSide],
              ]}
              color={isNight ? '#fde047' : '#f8fafc'}
              lineWidth={1.8}
            />
          ))
        )}
      </group>
    </group>
  );
}

// (3) 原木棧橋：連通 橙果主島 ⇄ 04 人工智慧咖啡廳
function WoodenBridge({ start, end }) {
  const { setToastMessage } = useIslandStore();
  const midX = (start[0] + end[0]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  const length = Math.hypot(end[0] - start[0], end[2] - start[2]);
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0]);

  const posts = useMemo(() => [-1.6, -0.8, 0, 0.8, 1.6], []);

  return (
    <group
      position={[midX, 0.02, midZ]}
      rotation={[0, -angle, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setToastMessage('🪵 暖陽原木棧橋（Wooden Bridge）：以溫潤杉木枕木與原木欄杆連結人工智慧咖啡廳！');
      }}
    >
      {/* 溫潤原木橋面 */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[length, 0.12, 1.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.75} />
      </mesh>
      {/* 枕木紋理飾條 */}
      {[-1.7, -1.1, -0.5, 0.1, 0.7, 1.3, 1.8].map((px, idx) => (
        <mesh key={idx} position={[px, 0.07, 0]} receiveShadow>
          <boxGeometry args={[0.25, 0.03, 1.38]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
      ))}
      {/* 雙側原木護欄橫桿 */}
      <mesh position={[0, 0.32, 0.64]} castShadow>
        <boxGeometry args={[length, 0.07, 0.07]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0, 0.32, -0.64]} castShadow>
        <boxGeometry args={[length, 0.07, 0.07]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* 原木立柱與海中木樁 */}
      {posts.map((px, i) => (
        <group key={i} position={[px, 0, 0]}>
          <mesh position={[0, 0.22, 0.64]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.42, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0, 0.22, -0.64]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.42, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
      ))}
      <mesh position={[-length * 0.28, -0.55, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 1.1, 10]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[length * 0.28, -0.55, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 1.1, 10]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    </group>
  );
}

// ==========================================
// 6. 連結外海無人島的「觀光渡輪」與航線標示
// ==========================================
function SightseeingFerrySystem({ ferryCurve }) {
  const ferry1Ref = useRef();
  const ferry2Ref = useRef();
  const { isPaused, showLabels, sceneMode, setToastMessage } = useIslandStore();
  const isNight = sceneMode === 'night';

  const routePoints = useMemo(() => ferryCurve.getPoints(100), [ferryCurve]);

  useFrame(({ clock }) => {
    if (isPaused) return;
    const elapsed = clock.getElapsedTime();

    // 兩艘渡輪同速、相差 0.5 圈，永遠保持半圈距離，絕不追撞
    [
      { ref: ferry1Ref, offset: 0.0, speed: 0.02 },
      { ref: ferry2Ref, offset: 0.5, speed: 0.02 },
    ].forEach(({ ref, offset, speed }) => {
      if (!ref.current) return;
      const t = (elapsed * speed + offset) % 1;
      const nextT = (t + 0.008) % 1;
      const pos = ferryCurve.getPointAt(t);
      const nextPos = ferryCurve.getPointAt(nextT);
      const dx = nextPos.x - pos.x;
      const dz = nextPos.z - pos.z;
      const bob = Math.sin(elapsed * 3.5 + offset * 10) * 0.04;

      ref.current.position.set(pos.x, pos.y + bob, pos.z);
      ref.current.rotation.set(0, Math.atan2(dx, dz), 0);
    });
  });

  const renderFerryMesh = (name, roofColor) => (
    <group
      scale={[0.82, 0.82, 0.82]}
      onClick={(e) => {
        e.stopPropagation();
        setToastMessage(`⛴️ ${name}：正沿著中環專屬航道串聯四座外海無人島！`);
      }}
    >
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[1.35, 0.38, 2.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.2, 1.65]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.68, 0.7, 4]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      <mesh position={[0, 0.58, -0.1]} castShadow>
        <boxGeometry args={[1.15, 0.45, 2.0]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 0.6, -0.05]}>
        <boxGeometry args={[1.18, 0.22, 1.65]} />
        <meshStandardMaterial
          color={isNight ? '#fde047' : '#38bdf8'}
          emissive={isNight ? '#f59e0b' : '#0284c7'}
          emissiveIntensity={isNight ? 2.0 : 0.3}
        />
      </mesh>
      <mesh position={[0, 0.95, -0.15]} castShadow>
        <boxGeometry args={[1.05, 0.12, 1.5]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      {showLabels && (
        <Html position={[0, 1.55, 0]} center distanceFactor={26}>
          <div className="bg-orange-600/95 text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold shadow border border-orange-300 whitespace-nowrap cursor-pointer">
            ⛴️ {name}
          </div>
        </Html>
      )}
    </group>
  );

  return (
    <group>
      <Line
        points={routePoints}
        color={isNight ? '#38bdf8' : '#0284c7'}
        lineWidth={1.6}
        dashed
        dashScale={1.5}
        dashSize={0.8}
        gapSize={0.6}
      />
      <group ref={ferry1Ref}>{renderFerryMesh('無人島觀光渡輪 1號', '#f97316')}</group>
      <group ref={ferry2Ref}>{renderFerryMesh('無人島觀光渡輪 2號', '#0ea5e9')}</group>
    </group>
  );
}

// ==========================================
// 7. 國際巨型郵輪「EUREKA 海洋號」與 8 國傳統服飾貴賓
// (台灣、美國、日本、捷克、西班牙、泰國、加拿大、芬蘭)
// ==========================================
const EIGHT_NATIONS_PASSENGERS = [
  {
    id: 'tw',
    flag: '🇹🇼',
    country: '台灣',
    pos: [-0.65, 2.15, 1.55],
    primary: '#dc2626',
    secondary: '#1e293b',
    accent: '#ffffff',
    headgear: 'feather',
  },
  {
    id: 'us',
    flag: '🇺🇸',
    country: '美國',
    pos: [0.65, 2.15, 1.55],
    primary: '#1d4ed8',
    secondary: '#dc2626',
    accent: '#92400e',
    headgear: 'cowboy',
  },
  {
    id: 'jp',
    flag: '🇯🇵',
    country: '日本',
    pos: [-0.75, 2.15, 0.55],
    primary: '#f472b6',
    secondary: '#facc15',
    accent: '#1e293b',
    headgear: 'kimono_bun',
  },
  {
    id: 'cz',
    flag: '🇨🇿',
    country: '捷克',
    pos: [0.75, 2.15, 0.55],
    primary: '#e11d48',
    secondary: '#ffffff',
    accent: '#1e40af',
    headgear: 'floral_crown',
  },
  {
    id: 'es',
    flag: '🇪🇸',
    country: '西班牙',
    pos: [-0.75, 2.15, -0.45],
    primary: '#dc2626',
    secondary: '#0f172a',
    accent: '#f43f5e',
    headgear: 'rose_bun',
  },
  {
    id: 'th',
    flag: '🇹🇭',
    country: '泰國',
    pos: [0.75, 2.15, -0.45],
    primary: '#eab308',
    secondary: '#9333ea',
    accent: '#fef08a',
    headgear: 'thai_chada',
  },
  {
    id: 'ca',
    flag: '🇨🇦',
    country: '加拿大',
    pos: [-0.65, 2.15, -1.45],
    primary: '#dc2626',
    secondary: '#1e293b',
    accent: '#b45309',
    headgear: 'mountie',
  },
  {
    id: 'fi',
    flag: '🇫🇮',
    country: '芬蘭',
    pos: [0.65, 2.15, -1.45],
    primary: '#0284c7',
    secondary: '#ffffff',
    accent: '#ef4444',
    headgear: 'finnish_cap',
  },
];

function TraditionalPassenger({ data, index }) {
  const armRef = useRef();
  const bodyRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime() * 5 + index;
    if (armRef.current) {
      armRef.current.rotation.z = 2.4 + Math.sin(t * 1.5) * 0.35;
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = data.pos[1] + Math.abs(Math.sin(t * 0.8)) * 0.04;
    }
  });

  return (
    <group ref={bodyRef} position={data.pos} scale={[0.38, 0.38, 0.38]}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <coneGeometry args={[0.34, 0.55, 14]} />
        <meshStandardMaterial color={data.primary} />
      </mesh>
      {(data.id === 'es' || data.id === 'cz' || data.id === 'jp' || data.id === 'fi') && (
        <mesh position={[0, 0.42, 0.03]} castShadow>
          <cylinderGeometry args={[0.28, 0.32, 0.22, 14]} />
          <meshStandardMaterial color={data.secondary} />
        </mesh>
      )}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.28, 0.55, 14]} />
        <meshStandardMaterial color={data.id === 'cz' ? data.accent : data.primary} />
      </mesh>
      <mesh position={[0, 0.92, 0.05]} rotation={[0, 0, 0.35]}>
        <torusGeometry args={[0.22, 0.05, 8, 16]} />
        <meshStandardMaterial color={data.secondary} />
      </mesh>

      <group position={[0.3, 0.92, 0]} ref={armRef}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.06, 0.32, 6, 8]} />
          <meshStandardMaterial color={data.primary} />
        </mesh>
      </group>

      <group position={[0, 1.32, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial color="#ffedd5" />
        </mesh>
        <mesh position={[-0.1, 0.02, 0.29]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.1, 0.02, 0.29]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {data.headgear === 'feather' && (
          <group>
            <mesh position={[0, 0.14, 0]}>
              <cylinderGeometry args={[0.33, 0.33, 0.12, 16]} />
              <meshStandardMaterial color="#dc2626" />
            </mesh>
            <mesh position={[0, 0.48, -0.05]} rotation={[-0.15, 0, 0]}>
              <coneGeometry args={[0.08, 0.55, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        )}
        {(data.headgear === 'cowboy' || data.headgear === 'mountie') && (
          <group position={[0, 0.24, 0]}>
            <mesh>
              <cylinderGeometry args={[0.55, 0.55, 0.05, 16]} />
              <meshStandardMaterial color={data.accent} />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.24, 0.3, 0.28, 14]} />
              <meshStandardMaterial color={data.accent} />
            </mesh>
          </group>
        )}
        {(data.headgear === 'kimono_bun' || data.headgear === 'rose_bun') && (
          <group>
            <mesh position={[0, 0.1, -0.05]}>
              <sphereGeometry args={[0.33, 14, 14]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, 0.35, -0.1]}>
              <sphereGeometry args={[0.16, 12, 12]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0.2, 0.32, 0.05]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial color={data.id === 'es' ? '#dc2626' : '#f472b6'} />
            </mesh>
          </group>
        )}
        {data.headgear === 'floral_crown' && (
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.07, 10, 18]} />
            <meshStandardMaterial color="#f43f5e" />
          </mesh>
        )}
        {data.headgear === 'thai_chada' && (
          <mesh position={[0, 0.48, 0]} castShadow>
            <coneGeometry args={[0.22, 0.68, 12]} />
            <meshStandardMaterial color="#facc15" metalness={0.6} roughness={0.2} />
          </mesh>
        )}
        {data.headgear === 'finnish_cap' && (
          <group position={[0, 0.26, 0]}>
            <mesh>
              <cylinderGeometry args={[0.34, 0.32, 0.22, 8]} />
              <meshStandardMaterial color="#0284c7" />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <boxGeometry args={[0.5, 0.12, 0.5]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          </group>
        )}
      </group>

      {showLabels && (
        <Html position={[0, 2.35, 0]} center distanceFactor={18}>
          <div className="bg-slate-900/90 text-white px-1.5 py-0.5 rounded-md text-[8px] font-bold shadow border border-amber-300/80 whitespace-nowrap pointer-events-none">
            {data.flag} {data.country}
          </div>
        </Html>
      )}
    </group>
  );
}

function InternationalCruiseShip({ cruiseCurve, shipRef }) {
  const { isPaused, showLabels, sceneMode, setToastMessage, triggerCameraFlight } = useIslandStore();
  const isNight = sceneMode === 'night';

  useFrame(({ clock }) => {
    if (isPaused || !shipRef.current) return;
    const elapsed = clock.getElapsedTime();
    const t = (elapsed * 0.011) % 1;
    const nextT = (t + 0.005) % 1;
    const pos = cruiseCurve.getPointAt(t);
    const nextPos = cruiseCurve.getPointAt(nextT);
    const dx = nextPos.x - pos.x;
    const dz = nextPos.z - pos.z;

    shipRef.current.position.set(pos.x, pos.y + Math.sin(elapsed * 2.0) * 0.05, pos.z);
    shipRef.current.rotation.set(0, Math.atan2(dx, dz), 0);
  });

  const handleInspectCruise = (e) => {
    e.stopPropagation();
    if (shipRef.current) {
      const p = shipRef.current.position;
      triggerCameraFlight([p.x, p.y + 6.5, p.z + 8.5], [p.x, p.y + 1.8, p.z]);
    }
    setToastMessage(
      '🚢 國際巨型郵輪「EUREKA 海洋號」：甲板上載著 🇹🇼台灣、🇺🇸美國、🇯🇵日本、🇨🇿捷克、🇪🇸西班牙、🇹🇭泰國、🇨🇦加拿大、🇫🇮芬蘭 8 國傳統服飾貴賓！'
    );
  };

  return (
    <group ref={shipRef} scale={[1.38, 1.38, 1.38]} onClick={handleInspectCruise}>
      {isNight && <pointLight position={[0, 3.8, 0]} intensity={2.8} distance={16} color="#fde047" />}

      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.9, 6.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.45, 3.65]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[1.25, 1.2, 4]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[2.54, 0.12, 6.24]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.2} />
      </mesh>

      <mesh position={[0, 1.32, -0.15]} castShadow>
        <boxGeometry args={[2.25, 0.85, 5.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.92, -0.25]} castShadow>
        <boxGeometry args={[2.0, 0.45, 4.4]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {[1.15, 1.5, 1.9].map((yPos, idx) => (
        <mesh key={idx} position={[0, yPos, -0.2]}>
          <boxGeometry args={[2.28 - idx * 0.12, 0.14, 4.2]} />
          <meshStandardMaterial
            color={isNight ? '#fde047' : '#38bdf8'}
            emissive={isNight ? '#f59e0b' : '#0284c7'}
            emissiveIntensity={isNight ? 2.2 : 0.35}
          />
        </mesh>
      ))}

      <mesh position={[0, 2.16, 0]} receiveShadow>
        <boxGeometry args={[1.95, 0.06, 4.2]} />
        <meshStandardMaterial color="#fde68a" />
      </mesh>
      <mesh position={[0, 2.18, 0.05]}>
        <boxGeometry args={[0.85, 0.05, 1.4]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.5} />
      </mesh>

      <group position={[0, 2.65, -2.0]}>
        <mesh rotation={[-0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.36, 1.1, 16]} />
          <meshStandardMaterial color="#e05a47" />
        </mesh>
        <mesh position={[0, 0.45, -0.08]} rotation={[-0.2, 0, 0]}>
          <cylinderGeometry args={[0.29, 0.29, 0.22, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {EIGHT_NATIONS_PASSENGERS.map((p, idx) => (
        <TraditionalPassenger key={p.id} data={p} index={idx} />
      ))}

      {showLabels && (
        <Html position={[0, 4.1, 0]} center distanceFactor={28}>
          <div className="bg-gradient-to-r from-amber-500 to-rose-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-xl border border-amber-200 whitespace-nowrap cursor-pointer">
            🚢 國際巨型郵輪 · 傳統服飾貴賓
          </div>
        </Html>
      )}
    </group>
  );
}

// ==========================================
// 8. 天空飛行器與雲朵：直升機、立體白雲、展翅海鷗群、飄雪
// ==========================================
function FlyingHelicopter() {
  const heliRef = useRef();
  const mainRotorRef = useRef();
  const tailRotorRef = useRef();
  const { isPaused, showLabels, setToastMessage } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime() * 0.28;
    const rx = 18.0;
    const rz = 13.5;
    const x = Math.cos(t) * rx;
    const z = Math.sin(t) * rz;
    const y = 11.2 + Math.sin(t * 3) * 0.35;
    const dx = -Math.sin(t) * rx;
    const dz = Math.cos(t) * rz;

    if (heliRef.current) {
      heliRef.current.position.set(x, y, z);
      heliRef.current.rotation.set(0.1, Math.atan2(dx, dz), 0);
    }
    if (mainRotorRef.current) mainRotorRef.current.rotation.y += 0.55;
    if (tailRotorRef.current) tailRotorRef.current.rotation.x += 0.6;
  });

  return (
    <group
      ref={heliRef}
      position={[15, 11.2, 0]}
      scale={[0.78, 0.78, 0.78]}
      onClick={(e) => {
        e.stopPropagation();
        setToastMessage('🚁 空中巡航號直升機：正從高空俯瞰橙果島、三座特色大橋與外海郵輪！');
      }}
    >
      {/* 機艙主體 (+Z 為機頭) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.62, 0.9, 12, 16]} />
        <meshStandardMaterial color="#e05a47" />
      </mesh>
      {/* 前方玻璃駕駛艙 (+Z) */}
      <mesh position={[0, 0.08, 0.55]}>
        <sphereGeometry args={[0.56, 14, 14]} />
        <meshStandardMaterial color="#bae6fd" metalness={0.3} roughness={0.1} />
      </mesh>
      {/* 機身白條紋 */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.28, 0.2, 1.35]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* 機尾延伸桿 (-Z) 與垂直尾翼 */}
      <mesh position={[0, 0.15, -1.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.26, 1.9, 12]} />
        <meshStandardMaterial color="#e05a47" />
      </mesh>
      <mesh position={[0, 0.45, -2.35]} castShadow>
        <boxGeometry args={[0.1, 0.65, 0.35]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* 底部雙起落架滑橇 */}
      <mesh position={[-0.45, -0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0.45, -0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* 頂部高速旋轉主螺旋槳 */}
      <group position={[0, 0.82, 0]} ref={mainRotorRef}>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[3.9, 0.04, 0.22]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[3.9, 0.04, 0.22]} />
          <meshStandardMaterial color="#1e293b" />
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
        <Html position={[0, 1.65, 0]} center distanceFactor={26}>
          <div className="bg-rose-600/95 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow whitespace-nowrap cursor-pointer">
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
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[0.9, -0.15, 0.2]}>
        <sphereGeometry args={[0.85, 14, 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[-0.9, -0.2, -0.1]}>
        <sphereGeometry args={[0.8, 14, 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
    </group>
  );
}

function SeagullFlock() {
  const flockRef = useRef();
  const { isPaused } = useIslandStore();
  const birds = useMemo(
    () => [
      [0, 0, 0],
      [-1.4, 0.3, -1.1],
      [1.3, -0.2, -1.2],
      [-2.4, 0.5, -2.1],
    ],
    []
  );

  useFrame(({ clock }) => {
    if (isPaused || !flockRef.current) return;
    const t = clock.getElapsedTime() * 0.32 + 2.5;
    const r = 15.0;
    flockRef.current.position.set(Math.cos(t) * r, 9.2 + Math.sin(t * 2.5) * 0.5, Math.sin(t) * (r * 0.8));
    flockRef.current.rotation.set(0, Math.atan2(-Math.sin(t) * r, Math.cos(t) * (r * 0.8)), 0);
  });

  return (
    <group ref={flockRef}>
      {birds.map((pos, i) => (
        <group key={i} position={pos} scale={[0.6, 0.6, 0.6]}>
          <mesh>
            <boxGeometry args={[0.85, 0.04, 0.22]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SnowParticles({ active }) {
  const pointsRef = useRef();
  const { isPaused } = useIslandStore();
  const count = 550;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 65;
      arr[i * 3 + 1] = Math.random() * 24;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 65;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!active || isPaused || !pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i) - delta * 2.6;
      let x = posAttr.getX(i) + Math.sin(y * 0.5 + i) * delta * 0.4;
      if (y < -0.5) y = 24;
      posAttr.setXY(i, x, y);
    }
    posAttr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.28} color="#ffffff" transparent opacity={0.88} />
    </points>
  );
}

// ==========================================
// 9. 景觀物件：樹木、夜間發光路燈(避開橋頭)、噴泉、太陽能板、攤販
// ==========================================
function CuteTree({ position, scale = 1, color = '#52b788' }) {
  const { sceneMode } = useIslandStore();
  const isSnow = sceneMode === 'snow';
  const topColor = isSnow ? '#f8fafc' : color;

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
        <meshStandardMaterial color={topColor} roughness={0.5} />
      </mesh>
    </group>
  );
}

function StreetLamp({ position }) {
  const { sceneMode } = useIslandStore();
  const isLit = sceneMode === 'night' || sceneMode === 'sunset' || sceneMode === 'dawn';
  const isNight = sceneMode === 'night';

  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 1.1, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial
          color={isLit ? '#fef08a' : '#e2e8f0'}
          emissive={isLit ? '#facc15' : '#000000'}
          emissiveIntensity={isNight ? 2.4 : isLit ? 1.1 : 0}
        />
      </mesh>
      {isNight && (
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.38, 12, 12]} />
          <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={1.2} transparent opacity={0.28} />
        </mesh>
      )}
      <mesh position={[0, 1.29, 0]}>
        <coneGeometry args={[0.2, 0.12, 8]} />
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
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.35} />
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

function SausageStand({ position, rotation = [0, 0, 0] }) {
  const smokeRef = useRef();
  const { isPaused, showLabels, sceneMode, setToastMessage } = useIslandStore();
  const isNight = sceneMode === 'night';

  useFrame(({ clock }) => {
    if (isPaused || !smokeRef.current) return;
    const s = (clock.getElapsedTime() * 0.9) % 1;
    smokeRef.current.position.y = 0.85 + s * 0.55;
    smokeRef.current.scale.setScalar(0.12 + s * 0.18);
  });

  return (
    <group
      position={position}
      rotation={rotation}
      scale={[0.58, 0.58, 0.58]}
      onClick={(e) => {
        e.stopPropagation();
        const dice =
          Math.floor(Math.random() * 6) +
          1 +
          Math.floor(Math.random() * 6) +
          1 +
          Math.floor(Math.random() * 6) +
          1;
        setToastMessage(`🌭 十八豆仔開骰！你擲出了 ${dice} 點，老闆請吃一根炭烤飛魚卵香腸！`);
      }}
    >
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.35, 0.72, 0.8]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[-0.2, 0.82, 0]}>
        <boxGeometry args={[0.75, 0.1, 0.55]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {[-0.4, -0.25, -0.1, 0.05].map((x, i) => (
        <mesh key={i} position={[x, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.045, 0.28, 6, 8]} />
          <meshStandardMaterial color="#991b1b" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.42, 0.84, 0]}>
        <cylinderGeometry args={[0.2, 0.12, 0.12, 14]} />
        <meshStandardMaterial color="#fde047" />
      </mesh>
      <mesh ref={smokeRef} position={[-0.2, 1.05, 0]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.65} />
      </mesh>
      <mesh position={[-0.6, 1.1, -0.32]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0.6, 1.1, -0.32]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0, 1.82, 0]}>
        <boxGeometry args={[1.45, 0.1, 0.9]} />
        <meshStandardMaterial color="#b91c1c" />
      </mesh>
      <mesh position={[0.55, 1.5, 0.3]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#f97316" emissiveIntensity={isNight ? 2.2 : 0.7} />
      </mesh>
      <group position={[0, 0, -0.65]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.85, 12]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[0, 1.18, 0]} castShadow>
          <sphereGeometry args={[0.28, 14, 14]} />
          <meshStandardMaterial color="#ffedd5" />
        </mesh>
      </group>
      {showLabels && (
        <Html position={[0, 2.35, 0]} center distanceFactor={20}>
          <div className="bg-red-600/95 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow border border-red-300 whitespace-nowrap cursor-pointer">
            🌭 台灣烤香腸攤
          </div>
        </Html>
      )}
    </group>
  );
}

function IceCreamCart({ position, rotation = [0, 0, 0] }) {
  const { showLabels, setToastMessage } = useIslandStore();

  return (
    <group
      position={position}
      rotation={rotation}
      scale={[0.58, 0.58, 0.58]}
      onClick={(e) => {
        e.stopPropagation();
        setToastMessage('🍦 來一球海鹽檸檬與台灣愛文芒果雙色冰淇淋！');
      }}
    >
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.3, 0.7, 0.78]} />
        <meshStandardMaterial color="#fbcfe8" />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1.2, 0.22, 0.7]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.85} />
      </mesh>
      <mesh position={[-0.3, 1.0, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#f472b6" />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#fde047" />
      </mesh>
      <mesh position={[0.3, 1.0, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#34d399" />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 1.95, 0]} castShadow>
        <coneGeometry args={[1.1, 0.45, 12]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>
      <group position={[0, 0, -0.65]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 0.85, 12]} />
          <meshStandardMaterial color="#ec4899" />
        </mesh>
        <mesh position={[0, 1.18, 0]} castShadow>
          <sphereGeometry args={[0.27, 14, 14]} />
          <meshStandardMaterial color="#ffedd5" />
        </mesh>
      </group>
      {showLabels && (
        <Html position={[0, 2.45, 0]} center distanceFactor={20}>
          <div className="bg-sky-500/95 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow border border-sky-200 whitespace-nowrap cursor-pointer">
            🍦 手工冰淇淋車
          </div>
        </Html>
      )}
    </group>
  );
}

function GiantOrangeMonument({ position = [0, 0.04, 1.4] }) {
  const orangeRef = useRef();
  const ringRef = useRef();
  const { isPaused, sceneMode, setToastMessage } = useIslandStore();
  const isNight = sceneMode === 'night';

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime();
    if (orangeRef.current) {
      orangeRef.current.position.y = 2.0 + Math.sin(t * 2.0) * 0.08;
      orangeRef.current.rotation.y = t * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.7;
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setToastMessage('🍊 EUREKA！橙果島巨型紀念碑：象徵理論語言學與 AI 實踐的飽滿果實！');
      }}
    >
      <MiniFountain position={[0, 0, 0]} scale={0.95} />
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.65, 1.1, 6]} />
        <meshStandardMaterial color="#fffbeb" roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.12, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.5} roughness={0.2} />
      </mesh>

      <group ref={orangeRef} position={[0, 2.0, 0]}>
        <mesh scale={[1, 0.88, 1]} castShadow>
          <sphereGeometry args={[0.85, 32, 24]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#ea580c"
            emissiveIntensity={isNight ? 0.65 : 0.22}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.18, 0.05, 0.08, 6]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
        <mesh position={[0, 0.88, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.05, 0.07, 0.35, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0.28, 0.88, 0]} rotation={[0.2, 0, -0.5]} scale={[1.4, 0.25, 0.7]} castShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        <mesh position={[-0.22, 0.84, 0.12]} rotation={[-0.2, 0.3, 0.6]} scale={[1.1, 0.22, 0.6]} castShadow>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#4ade80" />
        </mesh>
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.15, 0.04, 12, 36]} />
          <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={isNight ? 1.5 : 0.7} />
        </mesh>
      </group>
    </group>
  );
}

// ==========================================
// 10. 四座六角主題島嶼與場館建築群 (路燈嚴格避開橋頭)
// ==========================================
function HexThemeIslands() {
  const { activeModule, setActiveModule, setModalOpen, triggerCameraFlight, showLabels, isPaused, sceneMode } =
    useIslandStore();
  const ringRef = useRef();
  const crystalRef = useRef();
  const policyWindmillRef = useRef();
  const smokeRef = useRef();

  const isNight = sceneMode === 'night';
  const isSnow = sceneMode === 'snow';

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

  const safeLampAngles = useMemo(() => [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI) / 3), []);

  return (
    <>
      {/* 01 主島：橙果島 (理論與描述語言學 · 語言學大殿堂) */}
      <group position={[0, 0, 0]} onClick={(e) => handleSelectIsland('theory', e)}>
        {isNight && <pointLight position={[0, 4.5, 0]} intensity={2.2} distance={14} color="#fde047" />}
        <mesh position={[0, -0.45, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[6.0, 5.7, 0.9, 6]} />
          <meshStandardMaterial color={isSnow ? '#e2e8f0' : '#95d5b2'} roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.95, 0]}>
          <cylinderGeometry args={[6.2, 5.5, 0.4, 6]} />
          <meshStandardMaterial color="#f5ebe0" roughness={0.7} />
        </mesh>
        <mesh position={[0, -1.65, 0]}>
          <cylinderGeometry args={[5.4, 4.3, 1.1, 6]} />
          <meshStandardMaterial color="#d4a373" roughness={0.85} />
        </mesh>

        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 6]} receiveShadow>
          <ringGeometry args={[3.8, 4.85, 6]} />
          <meshStandardMaterial color="#e7e5e4" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.015, 0]} receiveShadow>
          <cylinderGeometry args={[3.6, 3.6, 0.04, 6]} />
          <meshStandardMaterial color="#fdfbf7" />
        </mesh>

        <GiantOrangeMonument position={[0, 0.04, 1.5]} />
        <SausageStand position={[2.55, 0.03, 1.35]} rotation={[0, 0.5, 0]} />
        <IceCreamCart position={[-2.55, 0.03, 1.35]} rotation={[0, -0.5, 0]} />

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
            <meshStandardMaterial color={isSnow ? '#f1f5f9' : '#e05a47'} />
          </mesh>
          <mesh position={[0, 2.35, 0]} castShadow>
            <boxGeometry args={[1.8, 0.8, 1.4]} />
            <meshStandardMaterial color="#fff8f0" />
          </mesh>
          <mesh position={[0, 3.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.6, 0.85, 4]} />
            <meshStandardMaterial color={isSnow ? '#f8fafc' : '#d94e34'} />
          </mesh>
          <mesh position={[-0.65, 1.05, 0.96]}>
            <boxGeometry args={[0.42, 0.42, 0.04]} />
            <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={isNight ? 2.0 : 0.5} />
          </mesh>
          <mesh position={[0.65, 1.05, 0.96]}>
            <boxGeometry args={[0.42, 0.42, 0.04]} />
            <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={isNight ? 2.0 : 0.5} />
          </mesh>
        </group>

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
        {safeLampAngles.map((ang, i) => (
          <StreetLamp key={i} position={[Math.cos(ang) * 3.55, 0, Math.sin(ang) * 3.55]} />
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

      {/* 02 東北島：計量語料島 (計量語言學與語料庫 · 語料庫花園) */}
      <group position={[12.5, 0, -7.2]} onClick={(e) => handleSelectIsland('corpus', e)}>
        {isNight && <pointLight position={[0, 4.0, 0]} intensity={1.8} distance={12} color="#38bdf8" />}
        <mesh position={[0, -0.45, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[5.2, 4.9, 0.9, 6]} />
          <meshStandardMaterial color={isSnow ? '#e2e8f0' : '#74c69d'} roughness={0.65} />
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
          <ringGeometry args={[3.3, 4.15, 6]} />
          <meshStandardMaterial color="#e7e5e4" />
        </mesh>

        <group position={[-0.4, 0, -0.5]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[1.8, 1.95, 0.4, 24]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
          <mesh position={[0, 0.95, 0]} castShadow>
            <cylinderGeometry args={[1.6, 1.6, 1.1, 24]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, 1.5, 0]} castShadow>
            <sphereGeometry args={[1.58, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={isNight ? 0.9 : 0.2}
              transparent
              opacity={0.72}
            />
          </mesh>
          <group position={[0, 2.9, 0]}>
            <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
              <torusGeometry args={[0.6, 0.07, 14, 28]} />
              <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={isNight ? 1.6 : 0.7} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.22, 14, 14]} />
              <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={1.2} />
            </mesh>
          </group>
        </group>

        <mesh position={[1.6, 0.85, -0.6]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 1.7, 16]} />
          <meshStandardMaterial color="#0f766e" />
        </mesh>
        <MiniFountain position={[0.4, 0.02, 1.5]} scale={0.55} />
        <SolarPanelArray position={[-1.6, 0, 1.3]} rotation={[0, 0.4, 0]} />
        <CuteTree position={[1.9, 0, 1.0]} scale={0.9} color="#2d6a4f" />
        {[0, 1, 2, 4].map((i) => (
          <StreetLamp
            key={i}
            position={[Math.cos(safeLampAngles[i]) * 3.1, 0, Math.sin(safeLampAngles[i]) * 3.1]}
          />
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

      {/* 03 西北島：社會政策島 (社會語言學與教育政策 · 語言政策講堂) */}
      <group position={[-12.5, 0, -7.2]} onClick={(e) => handleSelectIsland('policy', e)}>
        {isNight && <pointLight position={[0, 4.0, 0]} intensity={1.8} distance={12} color="#fde047" />}
        <mesh position={[0, -0.45, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[5.2, 4.9, 0.9, 6]} />
          <meshStandardMaterial color={isSnow ? '#e2e8f0' : '#80ed99'} roughness={0.65} />
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
          <ringGeometry args={[3.3, 4.15, 6]} />
          <meshStandardMaterial color="#e7e5e4" />
        </mesh>

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

        <mesh position={[-1.7, 0.55, 0.8]} castShadow>
          <boxGeometry args={[1.1, 1.1, 1.0]} />
          <meshStandardMaterial color="#dbeafe" />
        </mesh>
        <group position={[-1.9, 0, -1.2]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.36, 1.8, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 1.95, 0]}>
            <coneGeometry args={[0.32, 0.35, 12]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
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
        {[1, 2, 3, 4].map((i) => (
          <StreetLamp
            key={i}
            position={[Math.cos(safeLampAngles[i]) * 3.1, 0, Math.sin(safeLampAngles[i]) * 3.1]}
          />
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

      {/* 04 南方島：AI 實踐島 (人工智慧應用 · 人工智慧咖啡廳) */}
      <group position={[0, 0, 14.0]} onClick={(e) => handleSelectIsland('systems', e)}>
        {isNight && <pointLight position={[0, 4.0, 0]} intensity={2.0} distance={12} color="#fbbf24" />}
        <mesh position={[0, -0.45, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[5.2, 4.9, 0.9, 6]} />
          <meshStandardMaterial color={isSnow ? '#e2e8f0' : '#b7e4c7'} roughness={0.65} />
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
          <ringGeometry args={[3.3, 4.15, 6]} />
          <meshStandardMaterial color="#e7e5e4" />
        </mesh>

        <group position={[-0.3, 0, -0.3]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[2.8, 0.4, 2.3]} />
            <meshStandardMaterial color="#fed7aa" />
          </mesh>
          <mesh position={[0, 1.05, 0]} castShadow>
            <boxGeometry args={[2.3, 1.4, 1.9]} />
            <meshStandardMaterial color="#fffbeb" />
          </mesh>
          <mesh position={[0, 0.95, 1.05]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[2.1, 0.08, 0.45]} />
            <meshStandardMaterial color="#ea580c" />
          </mesh>
          <mesh position={[0, 0.75, 0.96]}>
            <boxGeometry args={[1.5, 0.65, 0.04]} />
            <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={isNight ? 2.2 : 0.6} />
          </mesh>
          <mesh position={[0, 2.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.8, 0.85, 4]} />
            <meshStandardMaterial color={isSnow ? '#f8fafc' : '#f59e0b'} />
          </mesh>
          <mesh position={[0.85, 1.6, -0.45]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 1.9, 12]} />
            <meshStandardMaterial color="#c2410c" />
          </mesh>
          <mesh ref={smokeRef} position={[0.85, 2.8, -0.45]}>
            <sphereGeometry args={[0.25, 10, 10]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.75} />
          </mesh>
          <mesh ref={crystalRef} position={[0, 3.25, 0]} castShadow>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={isNight ? 1.8 : 0.85} />
          </mesh>
        </group>

        <SolarPanelArray position={[-1.4, 0, 1.4]} rotation={[0, -0.3, 0]} />
        <CuteTree position={[1.9, 0, -1.0]} scale={0.9} color="#52b788" />
        {[0, 1, 2, 3].map((i) => (
          <StreetLamp
            key={i}
            position={[Math.cos(safeLampAngles[i]) * 3.1, 0, Math.sin(safeLampAngles[i]) * 3.1]}
          />
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
// 11. 100% 垂直站立且正面朝前之多元人物與萌寵系統
// ==========================================
function UprightActor({
  curve,
  offset = 0,
  speed = 0.035,
  dir = 1,
  laneOffset = 0,
  actorType = 'walker',
  shirt = '#3b82f6',
  bottom = '#1e293b',
  hair = '#1e293b',
  umbrellaColor = '#f472b6',
  petColor = '#d97706',
  role = '島民',
}) {
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const wheel1Ref = useRef();
  const wheel2Ref = useRef();
  const dogLegRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

  const isJogger = actorType === 'jogger';
  const isElder = actorType === 'elder';
  const walkFreq = isJogger ? 11.0 : isElder ? 4.2 : 6.5;

  useFrame(({ clock }) => {
    if (isPaused || !groupRef.current) return;
    const elapsed = clock.getElapsedTime();
    const rawT = (offset + elapsed * speed * dir) % 1;
    const t = rawT < 0 ? rawT + 1 : rawT;

    const deltaT = 0.006 * dir;
    const rawNextT = (t + deltaT) % 1;
    const nextT = rawNextT < 0 ? rawNextT + 1 : rawNextT;

    const pos = curve.getPointAt(t);
    const nextPos = curve.getPointAt(nextT);

    const dx = nextPos.x - pos.x;
    const dz = nextPos.z - pos.z;
    const yaw = Math.atan2(dx, dz);

    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;

    const isWheeled = actorType === 'bike' || actorType === 'scooter' || actorType === 'stroller_family';
    const bounce = isWheeled
      ? 0
      : Math.abs(Math.sin(elapsed * walkFreq + offset * 12)) * (isJogger ? 0.09 : isElder ? 0.03 : 0.055);

    groupRef.current.position.set(pos.x + nx * laneOffset, pos.y + bounce, pos.z + nz * laneOffset);
    groupRef.current.rotation.set(0, yaw, 0);

    const swing = Math.sin(elapsed * walkFreq + offset * 12) * (isJogger ? 0.85 : isElder ? 0.35 : 0.55);
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
    if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.8;
    if (dogLegRef.current) dogLegRef.current.rotation.x = Math.sin(elapsed * 12) * 0.5;
    if (wheel1Ref.current) wheel1Ref.current.rotation.x += 0.25;
    if (wheel2Ref.current) wheel2Ref.current.rotation.x += 0.25;
  });

  if (actorType === 'pet') {
    return (
      <group ref={groupRef} scale={[0.42, 0.42, 0.42]}>
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.38, 8, 12]} />
          <meshStandardMaterial color={petColor} />
        </mesh>
        <group position={[0, 0.48, 0.28]}>
          <mesh castShadow>
            <sphereGeometry args={[0.19, 12, 12]} />
            <meshStandardMaterial color={petColor} />
          </mesh>
          <mesh position={[0, -0.02, 0.17]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[-0.1, 0.16, 0]}>
            <coneGeometry args={[0.06, 0.15, 4]} />
            <meshStandardMaterial color={petColor} />
          </mesh>
          <mesh position={[0.1, 0.16, 0]}>
            <coneGeometry args={[0.06, 0.15, 4]} />
            <meshStandardMaterial color={petColor} />
          </mesh>
        </group>
        <mesh position={[0, 0.45, -0.28]} rotation={[-0.5, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.22, 6, 8]} />
          <meshStandardMaterial color={petColor} />
        </mesh>
        {showLabels && (
          <Html position={[0, 1.05, 0]} center distanceFactor={22}>
            <div className="bg-amber-50/95 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-amber-900 border border-amber-200 whitespace-nowrap pointer-events-none">
              🐾 {role}
            </div>
          </Html>
        )}
      </group>
    );
  }

  if (actorType === 'bike' || actorType === 'scooter') {
    const isBike = actorType === 'bike';
    return (
      <group ref={groupRef} scale={[0.44, 0.44, 0.44]}>
        {isBike ? (
          <group>
            <mesh ref={wheel1Ref} position={[0, 0.24, 0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.24, 0.24, 0.06, 16]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh ref={wheel2Ref} position={[0, 0.24, -0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.24, 0.24, 0.06, 16]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.85, 8]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 0.68, 0.35]}>
              <cylinderGeometry args={[0.035, 0.035, 0.55, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, 0.92, 0.35]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>
        ) : (
          <group>
            <mesh position={[0, 0.12, 0]} castShadow>
              <boxGeometry args={[0.26, 0.06, 0.9]} />
              <meshStandardMaterial color="#f59e0b" />
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
        <mesh position={[0, 0.72, -0.05]} castShadow>
          <cylinderGeometry args={[0.2, 0.24, 0.55, 12]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <group position={[0, 1.24, -0.02]}>
          <mesh castShadow>
            <sphereGeometry args={[0.28, 14, 14]} />
            <meshStandardMaterial color="#ffedd5" />
          </mesh>
          <mesh position={[-0.09, 0.02, 0.25]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.09, 0.02, 0.25]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.31, 14, 12, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
            <meshStandardMaterial color={umbrellaColor} />
          </mesh>
        </group>
        {showLabels && (
          <Html position={[0, 1.95, 0]} center distanceFactor={22}>
            <div className="bg-sky-50/95 px-2 py-0.5 rounded-full text-[10px] font-bold text-sky-900 shadow-sm border border-sky-300 whitespace-nowrap pointer-events-none">
              {isBike ? '🚲' : '🛴'} {role}
            </div>
          </Html>
        )}
      </group>
    );
  }

  if (actorType === 'stroller_family') {
    return (
      <group ref={groupRef} scale={[0.45, 0.45, 0.45]}>
        <group position={[-0.36, 0, 0]}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <coneGeometry args={[0.32, 0.5, 12]} />
            <meshStandardMaterial color="#be185d" />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.26, 0.58, 12]} />
            <meshStandardMaterial color="#f472b6" />
          </mesh>
          <mesh position={[0, 1.32, 0]} castShadow>
            <sphereGeometry args={[0.3, 14, 14]} />
            <meshStandardMaterial color="#ffedd5" />
          </mesh>
          <mesh position={[0, 1.4, -0.04]}>
            <sphereGeometry args={[0.31, 12, 12]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
        </group>
        <group position={[0.32, 0, 0]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.28, 0.5, 0.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.78, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.28, 0.62, 12]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          <mesh position={[0, 1.36, 0]} castShadow>
            <sphereGeometry args={[0.32, 14, 14]} />
            <meshStandardMaterial color="#ffedd5" />
          </mesh>
          <mesh position={[0, 1.45, -0.04]}>
            <sphereGeometry args={[0.33, 12, 12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
        <group position={[0.15, 0, 0.88]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.55, 0.38, 0.68]} />
            <meshStandardMaterial color="#fef08a" />
          </mesh>
          <mesh position={[0, 0.75, -0.15]} rotation={[-0.3, 0, 0]}>
            <sphereGeometry args={[0.32, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0, 0.72, 0.1]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#ffedd5" />
          </mesh>
          <mesh position={[0, 0.68, -0.45]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {[
            [-0.26, 0.14, 0.25],
            [0.26, 0.14, 0.25],
            [-0.26, 0.14, -0.25],
            [0.26, 0.14, -0.25],
          ].map((w, idx) => (
            <mesh key={idx} position={w} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 0.05, 12]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          ))}
        </group>
        {showLabels && (
          <Html position={[0, 2.15, 0.3]} center distanceFactor={22}>
            <div className="bg-rose-50/95 px-2 py-0.5 rounded-full text-[10px] font-bold text-rose-900 shadow-sm border border-rose-200 whitespace-nowrap pointer-events-none">
              👨‍👩‍👧 {role}
            </div>
          </Html>
        )}
      </group>
    );
  }

  return (
    <group ref={groupRef} scale={[0.46, 0.46, 0.46]}>
      <group position={[-0.13, 0.35, 0]} ref={leftLegRef}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.15, 0.36, 0.17]} />
          <meshStandardMaterial color={bottom} />
        </mesh>
      </group>
      <group position={[0.13, 0.35, 0]} ref={rightLegRef}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.15, 0.36, 0.17]} />
          <meshStandardMaterial color={bottom} />
        </mesh>
      </group>

      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.29, 0.62, 14]} />
        <meshStandardMaterial color={shirt} />
      </mesh>

      <group position={[-0.31, 0.92, 0]} ref={leftArmRef}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.12, 0.42, 0.12]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
      </group>
      <group position={[0.31, 0.92, 0]} ref={rightArmRef}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.12, 0.42, 0.12]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
      </group>

      {isElder && (
        <mesh position={[0.35, 0.42, 0.22]} rotation={[-0.12, 0, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.03, 0.85, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      )}

      {actorType === 'umbrella' && (
        <group position={[0.32, 1.35, 0.1]}>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.95, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0.25, 0]} castShadow>
            <coneGeometry args={[0.78, 0.35, 12]} />
            <meshStandardMaterial color={umbrellaColor} />
          </mesh>
        </group>
      )}

      {actorType === 'dog_walker' && (
        <group>
          <Line
            points={[
              [0.3, 0.65, 0.1],
              [0.25, 0.45, 0.95],
            ]}
            color="#78350f"
            lineWidth={1.8}
          />
          <group position={[0.25, 0, 1.1]} ref={dogLegRef}>
            <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.13, 0.32, 8, 10]} />
              <meshStandardMaterial color={petColor} />
            </mesh>
            <mesh position={[0, 0.42, 0.22]} castShadow>
              <sphereGeometry args={[0.16, 12, 12]} />
              <meshStandardMaterial color={petColor} />
            </mesh>
            <mesh position={[0, 0.42, 0.36]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, 0.38, -0.24]} rotation={[-0.5, 0, 0]}>
              <capsuleGeometry args={[0.03, 0.18, 6, 8]} />
              <meshStandardMaterial color={petColor} />
            </mesh>
          </group>
        </group>
      )}

      <group position={[0, 1.38, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#ffedd5" />
        </mesh>
        <mesh position={[0, 0.11, -0.04]} castShadow>
          <sphereGeometry args={[0.36, 14, 14]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        {isJogger && (
          <mesh position={[0, 0.12, 0.02]}>
            <cylinderGeometry args={[0.365, 0.365, 0.1, 16]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        )}
        <mesh position={[-0.12, 0.02, 0.33]}>
          <sphereGeometry args={[0.042, 8, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.12, 0.02, 0.33]}>
          <sphereGeometry args={[0.042, 8, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {showLabels && (
        <Html position={[0, 2.2, 0]} center distanceFactor={22}>
          <div className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow-sm border border-slate-300 whitespace-nowrap pointer-events-none">
            {role}
          </div>
        </Html>
      )}
    </group>
  );
}

// ==========================================
// 12. ★ 依循獨立固定航道、絕不相撞之海上運動與鯨豚生態 ★
// ==========================================

// (A) 依循東內灣專屬航道的 SUP 立槳衝浪者
function RouteSUPPaddler({ curve, offset = 0, speed = 0.035, boardColor = '#facc15', role = 'SUP 玩家' }) {
  const supRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !supRef.current) return;
    const elapsed = clock.getElapsedTime();
    const t = (elapsed * speed + offset) % 1;
    const nextT = (t + 0.01) % 1;
    const pos = curve.getPointAt(t);
    const nextPos = curve.getPointAt(nextT);
    const dx = nextPos.x - pos.x;
    const dz = nextPos.z - pos.z;

    supRef.current.position.set(pos.x, pos.y + Math.sin(elapsed * 5 + offset * 10) * 0.04, pos.z);
    supRef.current.rotation.set(0, Math.atan2(dx, dz), 0);
  });

  return (
    <group ref={supRef} scale={[0.52, 0.52, 0.52]}>
      <mesh castShadow>
        <boxGeometry args={[0.68, 0.12, 2.1]} />
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
      {showLabels && (
        <Html position={[0, 1.35, 0]} center distanceFactor={24}>
          <div className="bg-amber-50/90 text-amber-900 px-2 py-0.5 rounded-full text-[9px] font-bold border border-amber-200 whitespace-nowrap pointer-events-none">
            🏄 {role}
          </div>
        </Html>
      )}
    </group>
  );
}

// (B) 依循西內灣專屬航道的「台灣白海豚群 (4隻結伴同行)」
function TaiwaneseWhiteDolphinPod({ curve, speed = 0.032 }) {
  const podRef = useRef();
  const dolphinRefs = useRef([]);
  const { isPaused, showLabels, setToastMessage } = useIslandStore();

  const podMembers = useMemo(
    () => [
      { offset: [0, 0, 0], scale: 0.5, color: '#fce7f3', phase: 0 },
      { offset: [-0.85, 0, -0.7], scale: 0.46, color: '#fbcfe8', phase: 0.9 },
      { offset: [0.85, 0, -0.8], scale: 0.44, color: '#f9a8d4', phase: 1.8 },
      { offset: [0, 0, -1.55], scale: 0.38, color: '#fff1f2', phase: 2.6 },
    ],
    []
  );

  useFrame(({ clock }) => {
    if (isPaused || !podRef.current) return;
    const elapsed = clock.getElapsedTime();
    const t = (elapsed * speed) % 1;
    const nextT = (t + 0.01) % 1;
    const pos = curve.getPointAt(t);
    const nextPos = curve.getPointAt(nextT);
    const dx = nextPos.x - pos.x;
    const dz = nextPos.z - pos.z;

    podRef.current.position.set(pos.x, pos.y, pos.z);
    podRef.current.rotation.set(0, Math.atan2(dx, dz), 0);

    dolphinRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const m = podMembers[idx];
      const arc = Math.sin(elapsed * 2.8 + m.phase);
      mesh.position.y = Math.max(-0.12, arc * 0.9);
      mesh.rotation.x = -Math.cos(elapsed * 2.8 + m.phase) * 0.36;
    });
  });

  return (
    <group
      ref={podRef}
      onClick={(e) => {
        e.stopPropagation();
        setToastMessage('🐬 台灣白海豚（媽祖魚）群正沿著西內灣保育航道結伴跳躍！');
      }}
    >
      {podMembers.map((m, i) => (
        <group
          key={i}
          position={m.offset}
          scale={[m.scale, m.scale, m.scale]}
          ref={(el) => (dolphinRefs.current[i] = el)}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.26, 1.1, 10, 14]} />
            <meshStandardMaterial color={m.color} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.3, -0.05]} rotation={[-0.3, 0, 0]}>
            <coneGeometry args={[0.15, 0.38, 6]} />
            <meshStandardMaterial color="#f472b6" />
          </mesh>
          <mesh position={[0, 0, -0.75]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.35, 0.32, 3]} />
            <meshStandardMaterial color="#f472b6" />
          </mesh>
        </group>
      ))}
      {showLabels && (
        <Html position={[0, 1.6, 0]} center distanceFactor={26}>
          <div className="bg-pink-100/95 text-pink-900 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border border-pink-300 shadow whitespace-nowrap cursor-pointer">
            🐬 台灣白海豚群
          </div>
        </Html>
      )}
    </group>
  );
}

// (C) 依循東外海專屬航道的「鯨魚家族 (爸爸、媽媽帶 3 隻小鯨魚)」
function WhaleFamilyPod({ curve, speed = 0.022 }) {
  const familyRef = useRef();
  const { isPaused, showLabels, setToastMessage } = useIslandStore();

  const familyMembers = useMemo(
    () => [
      { pos: [-0.95, 0, 0], scale: 1.0, color: '#1e3a8a' },
      { pos: [0.95, 0, -0.2], scale: 0.9, color: '#1d4ed8' },
      { pos: [-0.7, 0.04, -2.2], scale: 0.46, color: '#3b82f6' },
      { pos: [0.1, 0.04, -2.5], scale: 0.42, color: '#60a5fa' },
      { pos: [0.85, 0.04, -2.3], scale: 0.38, color: '#93c5fd' },
    ],
    []
  );

  useFrame(({ clock }) => {
    if (isPaused || !familyRef.current) return;
    const elapsed = clock.getElapsedTime();
    const t = (elapsed * speed) % 1;
    const nextT = (t + 0.01) % 1;
    const pos = curve.getPointAt(t);
    const nextPos = curve.getPointAt(nextT);
    const dx = nextPos.x - pos.x;
    const dz = nextPos.z - pos.z;

    familyRef.current.position.set(pos.x, pos.y + Math.sin(elapsed * 3) * 0.06, pos.z);
    familyRef.current.rotation.set(0, Math.atan2(dx, dz), 0);
  });

  return (
    <group
      ref={familyRef}
      onClick={(e) => {
        e.stopPropagation();
        setToastMessage('🐋 鯨魚家族：鯨魚爸爸與媽媽正帶著 3 隻小鯨魚沿東外海專屬航道溫暖巡游！');
      }}
    >
      {familyMembers.map((w, idx) => (
        <group key={idx} position={w.pos} scale={[w.scale, w.scale, w.scale]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.52, 1.5, 12, 16]} />
            <meshStandardMaterial color={w.color} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.12, -1.15]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.55, 0.45, 3]} />
            <meshStandardMaterial color={w.color} />
          </mesh>
        </group>
      ))}
      {showLabels && (
        <Html position={[0, 1.6, -0.8]} center distanceFactor={28}>
          <div className="bg-blue-900/90 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow border border-blue-400 whitespace-nowrap cursor-pointer">
            🐋 鯨魚爸媽與 3 隻小鯨魚
          </div>
        </Html>
      )}
    </group>
  );
}

// (D) 依循北內灣專屬航道的「單獨 1 隻大翅鯨噴水」
function SoloHumpbackWhale({ curve, speed = 0.025 }) {
  const whaleRef = useRef();
  const spoutRef = useRef();
  const { isPaused, showLabels, setToastMessage } = useIslandStore();

  useFrame(({ clock }) => {
    if (isPaused || !whaleRef.current) return;
    const elapsed = clock.getElapsedTime();
    const t = (elapsed * speed) % 1;
    const nextT = (t + 0.01) % 1;
    const pos = curve.getPointAt(t);
    const nextPos = curve.getPointAt(nextT);
    const dx = nextPos.x - pos.x;
    const dz = nextPos.z - pos.z;

    whaleRef.current.position.set(pos.x, pos.y + Math.sin(elapsed * 2.5) * 0.07, pos.z);
    whaleRef.current.rotation.set(0, Math.atan2(dx, dz), 0);

    if (spoutRef.current) {
      const pulse = (Math.sin(elapsed * 3.2) + 1) * 0.5;
      spoutRef.current.scale.set(0.75 + pulse * 0.65, 0.45 + pulse * 1.45, 0.75 + pulse * 0.65);
      spoutRef.current.position.y = 0.75 + pulse * 0.6;
    }
  });

  return (
    <group
      ref={whaleRef}
      scale={[1.22, 1.22, 1.22]}
      onClick={(e) => {
        e.stopPropagation();
        setToastMessage('🐳 大翅鯨座頭鯨噴出壯觀水柱！牠正沿著北灣巡游！');
      }}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.62, 1.9, 14, 18]} />
        <meshStandardMaterial color="#1e293b" roughness={0.35} />
      </mesh>
      <mesh position={[-0.95, -0.1, 0.25]} rotation={[0, 0.25, -0.15]} castShadow>
        <boxGeometry args={[1.35, 0.08, 0.36]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0.95, -0.1, 0.25]} rotation={[0, -0.25, 0.15]} castShadow>
        <boxGeometry args={[1.35, 0.08, 0.36]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 0.15, -1.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.75, 0.55, 3]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <group ref={spoutRef} position={[0, 0.9, 0.55]}>
        <mesh>
          <coneGeometry args={[0.3, 1.25, 12]} />
          <meshStandardMaterial color="#e0f2fe" emissive="#bae6fd" emissiveIntensity={0.6} transparent opacity={0.88} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.35, 10, 10]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.85} />
        </mesh>
      </group>
      {showLabels && (
        <Html position={[0, 2.35, 0]} center distanceFactor={28}>
          <div className="bg-slate-900/90 text-sky-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow border border-sky-400 whitespace-nowrap cursor-pointer">
            🐳 大翅鯨噴水
          </div>
        </Html>
      )}
    </group>
  );
}

// ==========================================
// 13. 外海 4 座無人島與衛星島嶼
// ==========================================
function SunbatherWithSunglasses({ position, rotation = [0, 0, 0], umbrellaColor = '#f43f5e' }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.08, 0]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.65, 0.08, 1.35]} />
        <meshStandardMaterial color="#fef08a" />
      </mesh>
      <mesh position={[0, 0.22, -0.05]} rotation={[Math.PI / 2 - 0.15, 0, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.45, 8, 12]} />
        <meshStandardMaterial color="#fdba74" />
      </mesh>
      <group position={[0, 0.36, -0.45]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 14, 14]} />
          <meshStandardMaterial color="#ffedd5" />
        </mesh>
        <mesh position={[-0.06, 0.08, 0.14]}>
          <boxGeometry args={[0.09, 0.05, 0.05]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.06, 0.08, 0.14]}>
          <boxGeometry args={[0.09, 0.05, 0.05]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
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
  const { showLabels, isPaused, sceneMode } = useIslandStore();
  const isNight = sceneMode === 'night';

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
      {/* 1. 燈塔觀測站島 */}
      <group position={[-23.5, -0.3, -16.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[3.8, 4.4, 1.2, 6]} />
          <meshStandardMaterial color="#95d5b2" />
        </mesh>
        <mesh position={[3.2, 0.08, 2.2]} rotation={[0, -0.6, 0]} castShadow>
          <boxGeometry args={[2.2, 0.14, 0.9]} />
          <meshStandardMaterial color="#b08968" />
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
          <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={isNight ? 2.5 : 0.9} />
        </mesh>
        <mesh position={[0, 3.15, 0]} castShadow>
          <coneGeometry args={[0.62, 0.55, 16]} />
          <meshStandardMaterial color="#e05a47" />
        </mesh>
        <CuteTree position={[-1.7, 0.2, 1.1]} scale={0.9} />
        {showLabels && (
          <Html position={[0, 4.1, 0]} center distanceFactor={28}>
            <div className="bg-white/90 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow whitespace-nowrap">
              🏝️ 燈塔觀測站島
            </div>
          </Html>
        )}
      </group>

      {/* 2. 綠能風車島 */}
      <group position={[23.5, -0.3, -16.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[4.1, 4.7, 1.2, 6]} />
          <meshStandardMaterial color="#74c69d" />
        </mesh>
        <mesh position={[-3.4, 0.08, 2.2]} rotation={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2.2, 0.14, 0.9]} />
          <meshStandardMaterial color="#b08968" />
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
        {showLabels && (
          <Html position={[0, 4.4, 0]} center distanceFactor={28}>
            <div className="bg-white/90 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow whitespace-nowrap">
              🏝️ 綠能風車島
            </div>
          </Html>
        )}
      </group>

      {/* 3. 櫻花沙龍島 */}
      <group position={[22.0, -0.3, 15.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[4.0, 4.6, 1.1, 6]} />
          <meshStandardMaterial color="#95d5b2" />
        </mesh>
        <mesh position={[-3.3, 0.08, -1.8]} rotation={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[2.2, 0.14, 0.9]} />
          <meshStandardMaterial color="#b08968" />
        </mesh>
        <CuteTree position={[-1.6, 0.2, -1.0]} scale={1.15} color="#f472b6" />
        <CuteTree position={[1.6, 0.2, -0.8]} scale={1.0} color="#f9a8d4" />
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
        <SunbatherWithSunglasses position={[-0.9, 0.25, 1.5]} rotation={[0, 0.3, 0]} umbrellaColor="#f43f5e" />
        <SunbatherWithSunglasses position={[1.1, 0.25, 1.4]} rotation={[0, -0.25, 0]} umbrellaColor="#38bdf8" />
        {showLabels && (
          <Html position={[0, 3.4, 0]} center distanceFactor={28}>
            <div className="bg-pink-50/95 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-pink-900 border border-pink-200 shadow whitespace-nowrap">
              🌸 櫻花沙龍島
            </div>
          </Html>
        )}
      </group>

      {/* 4. 遠洋港灣島與停泊帆船 */}
      <group position={[-22.0, -0.3, 15.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[3.6, 4.2, 1.1, 6]} />
          <meshStandardMaterial color="#95d5b2" />
        </mesh>
        <mesh position={[-0.8, 0.6, -0.4]} castShadow>
          <boxGeometry args={[1.3, 0.9, 1.1]} />
          <meshStandardMaterial color="#fff8f0" />
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

      {/* 停泊在港灣島安全港池內的帆船 */}
      <group ref={boatRef} position={[-18.8, -0.82, 18.2]}>
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
// 14. 3D 群島總場景與智慧相機控制器
// ==========================================
function IslandScene({ controlsRef, cruiseShipRef }) {
  const { viewport } = useThree();
  const { showSynergyLines, sceneMode, autoRotate, cameraFlight, clearCameraFlight } = useIslandStore();
  const env = SCENE_CONFIGS[sceneMode] || SCENE_CONFIGS.day;

  const responsiveScale = useMemo(() => {
    const minDim = Math.min(viewport.width, viewport.height);
    return Math.max(0.72, Math.min(1.15, minDim / 13.0));
  }, [viewport.width, viewport.height]);

  // 1. 陸地六角環島步道與跨橋路徑
  const hexPathOrange = useMemo(() => createHexagonPath(0, 0, 4.35), []);
  const hexPathCorpus = useMemo(() => createHexagonPath(12.5, -7.2, 3.75), []);
  const hexPathPolicy = useMemo(() => createHexagonPath(-12.5, -7.2, 3.75), []);
  const hexPathSystems = useMemo(() => createHexagonPath(0, 14.0, 3.75), []);
  const grandBridgePath = useMemo(() => createGrandArchipelagoPath(), []);

  // 2. ★ 海上無碰撞獨立分流航道 (各自擁有專屬海域，絕不交錯相撞) ★
  // (a) 東內灣航道：SUP 立槳衝浪區
  const supBayCurve = useMemo(() => createOvalSeaRoute(8.2, 5.2, 2.2, 1.8, -0.82), []);
  // (b) 西內灣航道：台灣白海豚群 (4隻) 保育區
  const whiteDolphinCurve = useMemo(() => createOvalSeaRoute(-8.2, 5.2, 2.3, 1.9, -0.88), []);
  // (c) 北內灣航道：單獨大翅鯨噴水巡游區
  const humpbackCurve = useMemo(() => createOvalSeaRoute(0.0, -10.2, 3.3, 1.6, -0.88), []);
  // (d) 東外海航道：鯨魚家族 (爸媽帶3小鯨) 巡游區
  const whaleFamilyCurve = useMemo(() => createOvalSeaRoute(26.5, 0.0, 2.0, 4.2, -0.88), []);
  // (e) 中環跳島航道：無人島觀光渡輪
  const outerFerryCurve = useMemo(() => createOuterFerryRoute(), []);
  // (f) 外環公海航道：國際巨型郵輪 (載8國傳統服飾人民)
  const internationalCruiseCurve = useMemo(() => createOvalSeaRoute(0.0, 0.0, 39.5, 31.0, -0.82), []);

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
      <color attach="background" args={[env.bg]} />
      <fog attach="fog" args={[env.fog, 46, 102]} />
      <ambientLight intensity={env.ambientIntensity} color={env.ambientColor} />
      <hemisphereLight skyColor={env.bg} groundColor={env.ocean} intensity={0.6} />
      <directionalLight position={env.dirPos} intensity={env.dirIntensity} color={env.dirColor} castShadow />

      <SnowParticles active={env.isSnow} />

      <group scale={[responsiveScale, responsiveScale, responsiveScale]} position={[0, -0.5, 0]}>
        {/* 廣闊大海 */}
        <mesh position={[0, -1.25, 0]} receiveShadow>
          <cylinderGeometry args={[92, 92, 0.8, 64]} />
          <meshStandardMaterial color={env.ocean} roughness={0.22} />
        </mesh>

        {/* 天空飛行器與雲朵：直升機、4 朵立體白雲、海鷗群 */}
        <FlyingHelicopter />
        <FluffyCloud position={[-15, 11.8, -10]} scale={1.15} speed={0.16} />
        <FluffyCloud position={[16, 12.2, -8]} scale={1.3} speed={0.14} />
        <FluffyCloud position={[-10, 12.6, 12]} scale={0.95} speed={0.2} />
        <FluffyCloud position={[13, 11.4, 11]} scale={1.05} speed={0.15} />
        <SeagullFlock />

        {/* 外海 4 座無人島與衛星島嶼 */}
        <OuterSatelliteIslands />

        {/* ★ 分流海上運動、鯨豚與船隻（各自沿專屬固定路線行進，絕不相撞） ★ */}
        <RouteSUPPaddler curve={supBayCurve} offset={0.0} speed={0.04} boardColor="#facc15" role="SUP 立槳玩家" />
        <RouteSUPPaddler curve={supBayCurve} offset={0.5} speed={0.04} boardColor="#34d399" role="SUP 立槳初學者" />
        <TaiwaneseWhiteDolphinPod curve={whiteDolphinCurve} speed={0.032} />
        <SoloHumpbackWhale curve={humpbackCurve} speed={0.025} />
        <WhaleFamilyPod curve={whaleFamilyCurve} speed={0.022} />
        <SightseeingFerrySystem ferryCurve={outerFerryCurve} />
        <InternationalCruiseShip cruiseCurve={internationalCruiseCurve} shipRef={cruiseShipRef} />

        {/* 4 座六角主題島嶼與場館 */}
        <HexThemeIslands />

        {/* ★ 三座造型與顏色截然不同的跨海大橋 ★ */}
        {/* 1. 東北橋：翡翠白玉拱橋 (Arch Bridge) */}
        <ArchBridge start={[4.4, 0, -2.5]} end={[8.4, 0, -4.8]} />
        {/* 2. 西北橋：緋紅金冠斜張橋 (Cable-Stayed Bridge) */}
        <CableStayedBridge start={[-4.4, 0, -2.5]} end={[-8.4, 0, -4.8]} />
        {/* 3. 南方橋：暖陽原木棧橋 (Wooden Bridge) */}
        <WoodenBridge start={[0, 0, 5.1]} end={[0, 0, 9.3]} />

        {/* 跨場館知識協作光弧 */}
        {showSynergyLines && (
          <group>
            <QuadraticBezierLine start={[0, 3.2, -1.2]} end={[12.5, 3.2, -7.2]} mid={[6.2, 6.8, -4.2]} color="#0d9488" lineWidth={2} dashed dashScale={2} />
            <QuadraticBezierLine start={[0, 3.2, -1.2]} end={[-12.5, 3.2, -7.2]} mid={[-6.2, 6.8, -4.2]} color="#e11d48" lineWidth={2} dashed dashScale={2} />
            <QuadraticBezierLine start={[0, 3.2, -1.2]} end={[0, 3.2, 14.0]} mid={[0, 7.2, 6.5]} color="#d97706" lineWidth={2} dashed dashScale={2} />
            <QuadraticBezierLine start={[-12.5, 3.2, -7.2]} end={[12.5, 3.2, -7.2]} mid={[0, 7.5, -7.2]} color="#3a86ff" lineWidth={2} dashed dashScale={2} />
          </group>
        )}

        {/* 雙向自然移動、站直朝前之多元人物與萌寵群 */}
        <UprightActor curve={hexPathOrange} offset={0.02} speed={0.028} dir={1} laneOffset={-0.22} actorType="dog_walker" shirt="#e05a47" bottom="#1e293b" petColor="#d97706" role="遛狗島主" />
        <UprightActor curve={hexPathOrange} offset={0.28} speed={0.022} dir={-1} laneOffset={0.24} actorType="stroller_family" role="爸媽與嫩嬰" />
        <UprightActor curve={hexPathOrange} offset={0.52} speed={0.03} dir={1} laneOffset={-0.2} actorType="umbrella" shirt="#ec4899" bottom="#be185d" umbrellaColor="#f472b6" role="語言學者" />
        <UprightActor curve={hexPathOrange} offset={0.74} speed={0.052} dir={-1} laneOffset={0.26} actorType="jogger" shirt="#38bdf8" bottom="#0f172a" role="慢跑青少年" />
        <UprightActor curve={hexPathOrange} offset={0.88} speed={0.018} dir={1} laneOffset={-0.24} actorType="elder" shirt="#64748b" bottom="#334155" hair="#e2e8f0" role="拄拐杖阿公" />
        <UprightActor curve={hexPathOrange} offset={0.15} speed={0.06} dir={1} laneOffset={0.25} actorType="bike" shirt="#10b981" umbrellaColor="#f43f5e" role="騎腳踏車青年" />
        <UprightActor curve={hexPathOrange} offset={0.62} speed={0.055} dir={-1} laneOffset={-0.25} actorType="scooter" shirt="#a855f7" umbrellaColor="#facc15" role="滑板車小妹" />

        <UprightActor curve={hexPathCorpus} offset={0.1} speed={0.032} dir={1} laneOffset={-0.2} actorType="walker" shirt="#0d9488" bottom="#334155" role="語料庫研究員" />
        <UprightActor curve={hexPathCorpus} offset={0.45} speed={0.028} dir={-1} laneOffset={0.22} actorType="umbrella" shirt="#8b5cf6" bottom="#4c1d95" umbrellaColor="#38bdf8" role="活力大學生" />
        <UprightActor curve={hexPathCorpus} offset={0.78} speed={0.052} dir={1} laneOffset={0.22} actorType="jogger" shirt="#f97316" bottom="#1e293b" role="健行壯年人" />

        <UprightActor curve={hexPathPolicy} offset={0.2} speed={0.02} dir={-1} laneOffset={-0.2} actorType="elder" shirt="#d97706" bottom="#78350f" hair="#cbd5e1" role="拄拐杖阿嬤" />
        <UprightActor curve={hexPathPolicy} offset={0.55} speed={0.028} dir={1} laneOffset={0.22} actorType="dog_walker" shirt="#2563eb" bottom="#1e3a8a" petColor="#fef3c7" role="遛小白狗居民" />
        <UprightActor curve={hexPathPolicy} offset={0.85} speed={0.058} dir={-1} laneOffset={0.24} actorType="bike" shirt="#22c55e" umbrellaColor="#fb923c" role="單車小男孩" />

        <UprightActor curve={hexPathSystems} offset={0.12} speed={0.034} dir={1} laneOffset={-0.2} actorType="walker" shirt="#f59e0b" bottom="#1e293b" role="AI 工程師" />
        <UprightActor curve={hexPathSystems} offset={0.5} speed={0.024} dir={-1} laneOffset={0.22} actorType="stroller_family" role="新手爸媽推車" />
        <UprightActor curve={hexPathSystems} offset={0.82} speed={0.055} dir={1} laneOffset={0.24} actorType="scooter" shirt="#ec4899" umbrellaColor="#38bdf8" role="滑板車少年" />

        <UprightActor curve={grandBridgePath} offset={0.04} speed={0.012} dir={1} laneOffset={-0.18} actorType="walker" shirt="#10b981" bottom="#064e3b" role="跨島探索學者" />
        <UprightActor curve={grandBridgePath} offset={0.52} speed={0.013} dir={-1} laneOffset={0.18} actorType="umbrella" shirt="#f43f5e" bottom="#881337" umbrellaColor="#fde047" role="跨島漫遊旅人" />

        <UprightActor curve={hexPathOrange} offset={0.38} speed={0.042} dir={-1} laneOffset={-0.28} actorType="pet" petColor="#fb923c" role="胖橘貓" />
        <UprightActor curve={hexPathCorpus} offset={0.65} speed={0.045} dir={-1} laneOffset={-0.25} actorType="pet" petColor="#f8fafc" role="雪白喵" />
        <UprightActor curve={hexPathSystems} offset={0.3} speed={0.044} dir={-1} laneOffset={-0.25} actorType="pet" petColor="#b45309" role="黃金獵犬" />
      </group>

      <OrbitControls
        ref={controlsRef}
        onStart={clearCameraFlight}
        autoRotate={autoRotate}
        autoRotateSpeed={0.6}
        enablePan={true}
        enableZoom={true}
        zoomSpeed={1.2}
        maxPolarAngle={Math.PI / 2.12}
        minPolarAngle={0.05}
        minDistance={3.8}
        maxDistance={80}
        target={[0, 0.2, 0]}
      />
    </>
  );
}

// ==========================================
// 15. 頂層全螢幕懸浮 UI 主元件 (書籤名稱固定為：EUREKA！橙果島)
// ==========================================
export default function App() {
  const controlsRef = useRef();
  const cruiseShipRef = useRef();
  const [searchQuery, setSearchQuery] = useState('');

  // 自動設定瀏覽器書籤與分頁名稱為「EUREKA！橙果島」
  useEffect(() => {
    document.title = 'EUREKA！橙果島';
  }, []);

  const {
    activeModule,
    visitedModules,
    setActiveModule,
    sceneMode,
    setSceneMode,
    autoRotate,
    toggleAutoRotate,
    isModalOpen,
    setModalOpen,
    isMobileMenuOpen,
    setMobileMenuOpen,
    showLabels,
    toggleLabels,
    isPaused,
    togglePause,
    toastMessage,
    setToastMessage,
    triggerCameraFlight,
    clearCameraFlight,
  } = useIslandStore();

  const mod = activeModule ? researchModules[activeModule] : null;

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

  const handleSelectVenue = (key) => {
    const targetMod = researchModules[key];
    setActiveModule(key);
    setModalOpen(true);
    setMobileMenuOpen(false);
    if (targetMod) {
      triggerCameraFlight(targetMod.cameraPos, targetMod.center);
    }
  };

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

  const handleBirdsEyeView = () => {
    setModalOpen(false);
    setMobileMenuOpen(false);
    triggerCameraFlight([0, 48.0, 4.0], [0, 0, 2.0]);
  };

  const handleFocusCruiseShip = () => {
    setModalOpen(false);
    setMobileMenuOpen(false);
    if (cruiseShipRef.current) {
      const p = cruiseShipRef.current.position;
      triggerCameraFlight([p.x, p.y + 6.5, p.z + 8.5], [p.x, p.y + 1.8, p.z]);
    } else {
      triggerCameraFlight([32, 6.5, 22], [28, 1.5, 16]);
    }
    setToastMessage(
      '🚢 已登船特寫「EUREKA 海洋號」！甲板上為台灣、美國、日本、捷克、西班牙、泰國、加拿大、芬蘭傳統服飾人民！'
    );
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    >
      {/* 1. 底層：100% 滿版 3D 互動群島畫布 */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}
      >
        <Canvas shadows camera={{ position: [0, 16.5, 26.0], fov: 42 }}>
          <IslandScene controlsRef={controlsRef} cruiseShipRef={cruiseShipRef} />
        </Canvas>
      </div>

      {/* 2. 手機版頂部列 (左標題 + 右上角縮小按鈕群) */}
      <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between pointer-events-none md:hidden">
        <div
          onClick={() => handleResetOverview(26.0, 16.5)}
          className="pointer-events-auto bg-[#fdfbf7]/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-stone-200 flex items-center gap-1.5 cursor-pointer"
        >
          <span className="text-base">🍊</span>
          <div>
            <div className="text-xs font-black text-[#e05a47] leading-none">EUREKA！橙果島</div>
            <div className="text-[9px] font-bold text-slate-500 mt-0.5">已解鎖 {visitedModules.length}/4 場館</div>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-1">
          <button
            onClick={handleFocusCruiseShip}
            className="bg-white/95 text-slate-800 border border-stone-200 px-2.5 py-2 rounded-xl text-xs font-bold shadow-lg"
            title="國際郵輪特寫"
          >
            🚢
          </button>
          <button
            onClick={handleBirdsEyeView}
            className="bg-white/95 text-slate-800 border border-stone-200 px-2.5 py-2 rounded-xl text-xs font-bold shadow-lg"
            title="鳥瞰視角"
          >
            🦅
          </button>
          <button
            onClick={() => {
              const modes = ['dawn', 'day', 'sunset', 'night', 'snow'];
              const next = modes[(modes.indexOf(sceneMode) + 1) % modes.length];
              setSceneMode(next);
            }}
            className="bg-white/95 text-slate-800 border border-stone-200 px-2.5 py-2 rounded-xl text-xs font-bold shadow-lg"
            title="切換場景天氣"
          >
            {SCENE_CONFIGS[sceneMode].label.split(' ')[0]}
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(!isMobileMenuOpen);
              if (!isMobileMenuOpen) setModalOpen(false);
            }}
            className="bg-[#e05a47] text-white px-3 py-2 rounded-xl text-xs font-extrabold shadow-lg"
          >
            {isMobileMenuOpen ? '✕' : '☰ 場館'}
          </button>
        </div>
      </div>

      {/* 3. 電腦版頂部中央：場景天氣切換 (清晨/白晝/黃昏/晚上/飄雪) 與視角控制列 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto hidden md:flex items-center gap-1.5 bg-[#fdfbf7]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xl border border-stone-200">
        {Object.entries(SCENE_CONFIGS).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setSceneMode(key)}
            className={`px-2.5 py-1 rounded-full text-xs font-extrabold transition-all ${
              sceneMode === key
                ? 'bg-orange-500 text-white shadow-sm scale-105'
                : 'text-slate-600 hover:bg-stone-200/70'
            }`}
          >
            {cfg.label}
          </button>
        ))}
        <div className="h-4 w-[1px] bg-stone-300 mx-1" />
        <button
          onClick={handleFocusCruiseShip}
          className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 hover:bg-rose-200 text-rose-900"
        >
          🚢 國際郵輪
        </button>
        <button
          onClick={handleBirdsEyeView}
          className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100 hover:bg-sky-200 text-sky-900"
        >
          🦅 鳥瞰全島
        </button>
        <button
          onClick={toggleAutoRotate}
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            autoRotate ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
          }`}
        >
          🎬 環島巡航
        </button>
        <button
          onClick={toggleLabels}
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            showLabels ? 'bg-slate-800 text-white' : 'text-slate-600'
          }`}
        >
          🏷️ 名牌
        </button>
        <button
          onClick={togglePause}
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            isPaused ? 'bg-rose-600 text-white' : 'text-slate-600'
          }`}
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>
      </div>

      {/* 4. 底部：互動彩蛋氣泡訊息 + Zoom In / Zoom Out 縮放控制膠囊 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center gap-2 w-full max-w-xl px-3">
        {toastMessage && (
          <div className="bg-slate-900/90 text-amber-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border border-slate-700 text-center max-w-[94vw] truncate">
            {toastMessage}
          </div>
        )}
        <div className="flex items-center gap-1.5 bg-[#fdfbf7]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xl border border-stone-200">
          <button
            onClick={() => handleZoom(0.75)}
            className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-white"
          >
            ➕ 放大
          </button>
          <button
            onClick={() => handleZoom(1.3)}
            className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-white"
          >
            ➖ 縮小
          </button>
          <button
            onClick={handleFocusCruiseShip}
            className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-900"
          >
            🚢 近看國際郵輪
          </button>
          <button
            onClick={handleBirdsEyeView}
            className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 hover:bg-sky-200 text-sky-900"
          >
            🦅 鳥瞰
          </button>
          <button
            onClick={() => handleResetOverview(26.0, 16.5)}
            className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900"
          >
            🧭 標準全景
          </button>
        </div>
      </div>

      {/* 5. 左邊欄：EUREKA！橙果島 四大主題與四大場館導覽 */}
      <aside
        className={`absolute top-14 md:top-4 left-3 md:left-5 bottom-20 md:bottom-16 z-30 w-[330px] max-w-[92vw] bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200/90 p-5 rounded-3xl shadow-2xl pointer-events-auto flex flex-col justify-between transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="border-b border-stone-200 pb-3 mb-3">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#e05a47]">🍊 EUREKA！橙果島</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                🏅 集章 {visitedModules.length} / 4
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-1">
              拱橋 · 斜張橋 · 原木橋 · 分流海洋生態群島
            </p>
          </div>

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

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredModules.map(([key, value]) => {
              const isSelected = activeModule === key && isModalOpen;
              const isVisited = visitedModules.includes(key);
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
                    <span className="text-[10px] font-bold text-slate-400">
                      {isVisited ? '✓ 已集章 · ' : ''}
                      {value.stats.itemsCount} ›
                    </span>
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-1">{value.venueName}</div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{value.summary}</p>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* 6. 右側詳細研究與 AI 系統卡片 */}
      {isModalOpen && mod && (
        <div className="absolute top-14 md:top-4 right-3 md:right-5 bottom-20 md:bottom-16 z-30 w-[380px] max-w-[92vw] bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200/90 rounded-3xl p-5 shadow-2xl pointer-events-auto flex flex-col justify-between overflow-hidden">
          <div className="overflow-y-auto pr-1 space-y-3.5">
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

            <div>
              <div className="text-xs font-bold text-orange-600">{mod.islandName}</div>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">{mod.venueName}</h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{mod.summary}</p>
            </div>

            <div className="bg-stone-100 border-l-4 border-[#e05a47] p-3 rounded-r-xl text-xs text-slate-700 font-medium leading-relaxed">
              {mod.quote}
            </div>

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
