import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Html, QuadraticBezierLine } from '@react-three/drei';
import { create } from 'zustand';
import * as THREE from 'three';

// ==========================================
// 1. 全域狀態管理 (內建於單一檔案，避免缺檔報錯)
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
// 2. 去識別化研究成果與 AI 應用系統完整資料庫
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
          '兩類空範疇之跨語言比較研究 (Two types of empty categories: A comparative study)',
          '受事控制結構之最簡方案分析 (Two types of object control: A minimalist perspective)',
          '漢語疑問感嘆句之製圖理論分析 (Wh-exclamative constructions: A cartographic approach)',
          '南島語數詞系統之句法結構分析 (Numerals syntax system analysis)',
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
          '基於華語學習者語料庫之疑問詞「怎麼（樣）」偏誤分析（THCI 第一級）',
          '華語學習者輕聲偏誤及其潛在變項之相關性研究',
        ],
      },
      {
        name: '計量句法、聲調變異與字頻實證研究',
        list: [
          '語音習得之層次非對稱性：母語背景對鼻韻尾、輕聲與音韻規則的調節作用',
          '初探華語文評量材料句法複雜度與自動檢測系統建置',
          '華語自由聲調變異之實證與語料庫研究 (Free tonal variation studies)',
          '人群中悄然演變的聲音：基於口語語料庫之音變分析',
          '是偏誤？還是變異？華語文教育語言規範新視角',
          '初探華語的「變」與「不變」：基於語料庫的語音研究',
          '英語學習者口語詞彙表建置與課綱字彙表改進建議',
          '科普專論：基於語料庫的一字多音研究、口語語料庫對英語學習的啟示',
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
          '他山之石：歐美國家語言教育政策趨勢',
        ],
      },
      {
        name: '政治言談分析（CADS）與跨國政策比較',
        list: [
          '以言建國：地方議會辯論之語料庫輔助批評論述分析 (Nationhood by words: CADS)',
          '地方議會政治言談中的問句句式與評價性修辭分析',
          '地方議會政治言談中的國族指涉詞：詞頻分布、共變模式與主體定位分析',
          '東南亞與本土中小學英語教育政策之跨國比較',
          '新舊課綱高中社會領域教科書對比分析：語料庫為本之研究',
          '邁向多語共融的永續未來：歐亞雙語及多語教育政策比較研究',
          '穩健邁向未來：歐洲英語教育對本土雙語教育的啟示',
          '校園防疫治理經驗與國際借鑑 (How schools combat against pandemic)',
          '政策科普評論：本土語言走出校園孤島、社會教科書用語體檢、跨國飲食與英語教科書比較',
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
// 3. 島民與萌寵配置清單 (老人、小孩、學生、男女學者、貓狗)
// ==========================================
const PEOPLE_LIST = [
  { pos: [0, 0.05, 0], type: 'citizen_m', shirt: '#e05a47', bottom: '#1e293b', hair: '#1e293b', role: '我 · 島主', speed: 0.85, rad: 2.5, phase: 0 },
  { pos: [-2.5, 0.05, -1.2], type: 'citizen_f', shirt: '#ec4899', bottom: '#be185d', hair: '#451a03', role: '女性語言學家', speed: 0.9, rad: 1.9, phase: 1.1 },
  { pos: [2.6, 0.05, -1.4], type: 'citizen_m', shirt: '#2b7a78', bottom: '#334155', hair: '#1e293b', role: '語料庫研究員', speed: 0.95, rad: 1.8, phase: 2.2 },
  { pos: [-2.2, 0.05, 2.1], type: 'citizen_f', shirt: '#8b5cf6', bottom: '#4c1d95', hair: '#78350f', role: '政策分析師', speed: 0.88, rad: 1.8, phase: 3.3 },
  { pos: [2.3, 0.05, 2.0], type: 'citizen_m', shirt: '#f59e0b', bottom: '#1e293b', hair: '#0f172a', role: 'AI 工程師', speed: 1.0, rad: 1.9, phase: 4.4 },
  { pos: [-1.0, 0.05, 2.8], type: 'elder_m', shirt: '#64748b', bottom: '#334155', hair: '#e2e8f0', role: '散步阿公', speed: 0.55, rad: 1.6, phase: 0.7 },
  { pos: [1.2, 0.05, -2.6], type: 'elder_f', shirt: '#d97706', bottom: '#78350f', hair: '#cbd5e1', role: '慈祥阿嬤', speed: 0.52, rad: 1.5, phase: 2.8 },
  { pos: [-3.5, 0.05, 0.5], type: 'student_m', shirt: '#f8fafc', bottom: '#1e3a8a', hair: '#0f172a', role: '高中男學生', speed: 1.05, rad: 2.1, phase: 1.9 },
  { pos: [3.4, 0.05, 0.6], type: 'student_f', shirt: '#f8fafc', bottom: '#be123c', hair: '#451a03', role: '高中女學生', speed: 1.02, rad: 2.0, phase: 3.9 },
  { pos: [0.5, 0.05, 2.4], type: 'child_m', shirt: '#38bdf8', bottom: '#0369a1', hair: '#1e293b', role: '活潑小弟', speed: 1.35, rad: 1.7, phase: 5.0 },
  { pos: [-0.6, 0.05, -2.3], type: 'child_f', shirt: '#fb7185', bottom: '#e11d48', hair: '#78350f', role: '雙馬尾小妹', speed: 1.3, rad: 1.7, phase: 6.1 },
  { pos: [0, 0.05, 3.6], type: 'child_f', shirt: '#facc15', bottom: '#ca8a04', hair: '#1e293b', role: '小學生', speed: 1.25, rad: 1.5, phase: 1.4 },
];

const PETS_LIST = [
  { pos: [-1.8, 0.02, 0.2], species: 'dog', color: '#d97706', name: '柴柴', speed: 1.25, rad: 1.5, phase: 0.5 },
  { pos: [1.9, 0.02, -0.3], species: 'dog', color: '#fef3c7', name: '小白汪', speed: 1.3, rad: 1.6, phase: 2.1 },
  { pos: [0.2, 0.02, 4.2], species: 'dog', color: '#b45309', name: '黃金獵犬', speed: 1.15, rad: 1.4, phase: 4.0 },
  { pos: [-2.8, 0.02, -3.5], species: 'cat', color: '#fb923c', name: '胖橘貓', speed: 1.1, rad: 1.2, phase: 1.2 },
  { pos: [2.9, 0.02, 3.2], species: 'cat', color: '#f8fafc', name: '雪白喵', speed: 1.2, rad: 1.3, phase: 3.5 },
  { pos: [-3.2, 0.02, 2.8], species: 'cat', color: '#334155', name: '黑嚕嚕喵', speed: 1.18, rad: 1.2, phase: 5.2 },
];

// ==========================================
// 4. 中央三層動態噴泉 (Central Fountain)
// ==========================================
function CentralFountain() {
  const dropsRef = useRef([]);
  const topSplashRef = useRef();
  const { isPaused } = useIslandStore();

  const dropData = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        angle: (i / 20) * Math.PI * 2,
        speed: 1.2 + (i % 4) * 0.15,
        offset: (i / 20) * 1.0,
        radius: 0.45 + (i % 3) * 0.2,
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
      const r = p * d.radius;
      mesh.position.set(
        Math.cos(d.angle + t * 0.3) * r,
        1.35 + Math.sin(p * Math.PI) * 0.75 - p * 0.65,
        Math.sin(d.angle + t * 0.3) * r
      );
      mesh.scale.setScalar(Math.sin(p * Math.PI) * 0.9 + 0.3);
    });
    if (topSplashRef.current) topSplashRef.current.scale.y = 1 + Math.sin(t * 8) * 0.2;
  });

  return (
    <group position={[0, 0.04, 0]}>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.85, 2.0, 0.36, 32]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.33, 0]}>
        <cylinderGeometry args={[1.68, 1.68, 0.1, 32]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.6, 0.6, 20]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <cylinderGeometry args={[1.05, 0.85, 0.22, 24]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0, 0.91, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.08, 24]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#0ea5e9" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 1.18, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 0.5, 16]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh ref={topSplashRef} position={[0, 1.55, 0]}>
        <coneGeometry args={[0.22, 0.45, 16]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={0.5} transparent opacity={0.85} />
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
// 5. 多元人物與貓狗元件
// ==========================================
function DiversePerson({ data }) {
  const { pos, type, shirt, bottom, hair, role, speed, rad, phase } = data;
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const { isPaused, showLabels } = useIslandStore();

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
    const x = pos[0] + Math.cos(angle) * rad;
    const z = pos[2] + Math.sin(angle * 1.3) * (rad * 0.8);
    const bounce = Math.abs(Math.sin(t * walkFreq)) * (isChild ? 0.11 : isElder ? 0.04 : 0.07);
    const dx = -Math.sin(angle) * rad * 0.48;
    const dz = Math.cos(angle * 1.3) * (rad * 0.8) * 1.3 * 0.48;

    if (groupRef.current) {
      groupRef.current.position.set(x, pos[1] + bounce, z);
      groupRef.current.rotation.y = Math.atan2(dx, dz);
    }
    const swing = Math.sin(t * walkFreq) * (isElder ? 0.35 : 0.55);
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
    if (rightArmRef.current) rightArmRef.current.rotation.x = isElder ? 0.25 + swing * 0.25 : swing * 0.8;
  });

  return (
    <group ref={groupRef} position={pos} scale={[charScale, charScale, charScale]}>
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
          <coneGeometry args={[0.38, 0.35, 16]} />
          <meshStandardMaterial color={bottom} />
        </mesh>
      )}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.32, 0.65, 16]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <group position={[-0.34, 0.92, 0]} ref={leftArmRef}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.14, 0.45, 0.14]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
      </group>
      <group position={[0.34, 0.92, 0]} ref={rightArmRef}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.14, 0.45, 0.14]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        {isElder && (
          <mesh position={[0, -0.68, 0.18]} rotation={[-0.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.03, 0.85, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        )}
      </group>
      {(isStudent || isChild) && (
        <mesh position={[0, 0.72, -0.28]} castShadow>
          <boxGeometry args={[0.38, 0.42, 0.22]} />
          <meshStandardMaterial color={isChild ? '#f43f5e' : '#d97706'} />
        </mesh>
      )}
      <group position={[0, 1.42, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.38, 18, 18]} />
          <meshStandardMaterial color="#ffedd5" />
        </mesh>
        <mesh position={[0, 0.12, -0.04]} castShadow>
          <sphereGeometry args={[0.39, 16, 16]} />
          <meshStandardMaterial color={hair} />
        </mesh>
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
          <div className="bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow-sm border border-slate-300 whitespace-nowrap pointer-events-none">
            {role}
          </div>
        </Html>
      )}
    </group>
  );
}

function CutePet({ data }) {
  const { pos, species, color, name, speed, rad, phase } = data;
  const petRef = useRef();
  const tailRef = useRef();
  const { isPaused, showLabels } = useIslandStore();
  const isCat = species === 'cat';

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime() * speed + phase;
    const angle = t * 0.7;
    const x = pos[0] + Math.cos(angle) * rad;
    const z = pos[2] + Math.sin(angle * 1.4) * (rad * 0.85);
    const hop = Math.abs(Math.sin(t * 8)) * 0.06;
    const dx = -Math.sin(angle) * rad * 0.7;
    const dz = Math.cos(angle * 1.4) * (rad * 0.85) * 1.4 * 0.7;

    if (petRef.current) {
      petRef.current.position.set(x, pos[1] + hop, z);
      petRef.current.rotation.y = Math.atan2(dx, dz);
    }
    if (tailRef.current) tailRef.current.rotation.z = Math.sin(t * 12) * 0.45;
  });

  return (
    <group ref={petRef} position={pos} scale={isCat ? [0.38, 0.38, 0.38] : [0.45, 0.45, 0.45]}>
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.42, 8, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[
        [-0.12, 0.14, 0.2],
        [0.12, 0.14, 0.2],
        [-0.12, 0.14, -0.2],
        [0.12, 0.14, -0.2],
      ].map((p, idx) => (
        <mesh key={idx} position={p} castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.28, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      <group position={[0, 0.58, 0.32]}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 14, 14]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[-0.13, 0.2, 0]} rotation={[0, 0, 0.25]}>
          <coneGeometry args={[0.08, 0.18, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.13, 0.2, 0]} rotation={[0, 0, -0.25]}>
          <coneGeometry args={[0.08, 0.18, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
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
// 6. 直升機、雲朵、樹木與外海衛星島
// ==========================================
function CuteTree({ position, scale = 1, color = '#52b788' }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 0.8, 10]} />
        <meshStandardMaterial color="#9c6644" />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.55, 14, 14]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.4, 14, 14]} />
        <meshStandardMaterial color={color} />
      </mesh>
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
    const t = clock.getElapsedTime() * 0.35;
    const radius = 14.5;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * (radius * 0.78);
    const y = 7.8 + Math.sin(t * 3) * 0.4;
    if (heliRef.current) {
      heliRef.current.position.set(x, y, z);
      heliRef.current.rotation.set(0.12, Math.atan2(-Math.sin(t) * radius, Math.cos(t) * (radius * 0.78)), 0);
    }
    if (mainRotorRef.current) mainRotorRef.current.rotation.y += 0.45;
    if (tailRotorRef.current) tailRotorRef.current.rotation.x += 0.5;
  });

  return (
    <group ref={heliRef} position={[12, 8, 0]} scale={[0.75, 0.75, 0.75]}>
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
        <Html position={[0, 1.6, 0]} center distanceFactor={24}>
          <div className="bg-rose-600/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow whitespace-nowrap pointer-events-none">
            🚁 空中巡航號
          </div>
        </Html>
      )}
    </group>
  );
}

function FluffyCloud({ position, scale = 1, speed = 0.2 }) {
  const cloudRef = useRef();
  const { isPaused } = useIslandStore();
  useFrame(({ clock }) => {
    if (!isPaused && cloudRef.current) {
      cloudRef.current.position.x = position[0] + Math.sin(clock.getElapsedTime() * speed) * 2.5;
    }
  });
  return (
    <group ref={cloudRef} position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0, 0]}><sphereGeometry args={[1.1, 14, 14]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[0.9, -0.15, 0.2]}><sphereGeometry args={[0.85, 14, 14]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[-0.9, -0.2, -0.1]}><sphereGeometry args={[0.8, 14, 14]} /><meshStandardMaterial color="#ffffff" /></mesh>
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
    if (windmillRef.current) windmillRef.current.rotation.z = t * 1.2;
  });

  return (
    <group>
      {/* 蔚藍大海與浪花環 */}
      <mesh position={[0, -1.25, 0]} receiveShadow>
        <cylinderGeometry args={[65, 65, 0.8, 64]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10.8, 12.2, 48]} />
        <meshStandardMaterial color="#bae6fd" side={THREE.DoubleSide} transparent opacity={0.75} />
      </mesh>

      {/* 備用島 A：燈塔島 */}
      <group position={[-16.5, -0.3, -11.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow><cylinderGeometry args={[3.6, 4.2, 1.2, 24]} /><meshStandardMaterial color="#95d5b2" /></mesh>
        <mesh position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[0.45, 0.75, 2.4, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0, 2.95, 0]} castShadow><coneGeometry args={[0.6, 0.5, 16]} /><meshStandardMaterial color="#e05a47" /></mesh>
        <CuteTree position={[-1.6, 0.2, 1.0]} scale={0.9} />
        {showLabels && (
          <Html position={[0, 3.8, 0]} center distanceFactor={28}>
            <div className="bg-white/85 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow whitespace-nowrap">🏝️ 備用島 A · 燈塔觀測站</div>
          </Html>
        )}
      </group>

      {/* 備用島 B：風車綠能島 */}
      <group position={[17.5, -0.3, -10.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow><cylinderGeometry args={[4.0, 4.6, 1.2, 24]} /><meshStandardMaterial color="#74c69d" /></mesh>
        <mesh position={[0, 1.5, 0]} castShadow><cylinderGeometry args={[0.18, 0.35, 2.8, 12]} /><meshStandardMaterial color="#f8fafc" /></mesh>
        <group position={[0, 2.7, 0.25]} ref={windmillRef}>
          <mesh><boxGeometry args={[2.4, 0.18, 0.05]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[2.4, 0.18, 0.05]} /><meshStandardMaterial color="#ffffff" /></mesh>
        </group>
        <CuteTree position={[-1.8, 0.2, 0.8]} scale={1.1} color="#40916c" />
        {showLabels && (
          <Html position={[0, 4.2, 0]} center distanceFactor={28}>
            <div className="bg-white/85 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow whitespace-nowrap">🏝️ 備用島 B · 綠能風車島</div>
          </Html>
        )}
      </group>

      {/* 備用島 C：櫻花涼亭島 */}
      <group position={[16.5, -0.3, 11.5]}>
        <mesh position={[0, -0.3, 0]} receiveShadow><cylinderGeometry args={[3.4, 4.0, 1.1, 24]} /><meshStandardMaterial color="#95d5b2" /></mesh>
        <CuteTree position={[-1.2, 0.2, -0.5]} scale={1.1} color="#f472b6" />
        <CuteTree position={[1.3, 0.2, 0.8]} scale={0.95} color="#f9a8d4" />
        <mesh position={[0, 1.5, 0]} castShadow><coneGeometry args={[1.2, 0.7, 6]} /><meshStandardMaterial color="#e05a47" /></mesh>
        {showLabels && (
          <Html position={[0, 3.0, 0]} center distanceFactor={28}>
            <div className="bg-white/85 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow whitespace-nowrap">🏝️ 備用島 C · 櫻花沙龍島</div>
          </Html>
        )}
      </group>

      {/* 備用島 D：港灣碼頭島与帆船 */}
      <group position={[-16.0, -0.3, 11.0]}>
        <mesh position={[0, -0.3, 0]} receiveShadow><cylinderGeometry args={[3.2, 3.8, 1.1, 24]} /><meshStandardMaterial color="#95d5b2" /></mesh>
        <CuteTree position={[-0.8, 0.2, -0.6]} scale={1.0} color="#52b788" />
        <mesh position={[2.4, 0.1, 0]} castShadow><boxGeometry args={[2.8, 0.15, 0.9]} /><meshStandardMaterial color="#b08968" /></mesh>
        {showLabels && (
          <Html position={[0, 2.8, 0]} center distanceFactor={28}>
            <div className="bg-white/85 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow whitespace-nowrap">🏝️ 備用島 D · 遠洋港灣島</div>
          </Html>
        )}
      </group>

      <group ref={boatRef} position={[-10.5, -0.85, 9.5]}>
        <mesh castShadow><boxGeometry args={[1.6, 0.4, 0.8]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0.1, 0.95, 0]} rotation={[0, 0, -0.1]}><coneGeometry args={[0.65, 1.3, 3]} /><meshStandardMaterial color="#fef08a" /></mesh>
      </group>
    </group>
  );
}

// ==========================================
// 7. 主島四大核心研究建築
// ==========================================
function DetailedBuildings() {
  const { activeModule, setActiveModule, setModalOpen, showLabels, isPaused } = useIslandStore();
  const crystalRef = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (isPaused) return;
    const t = clock.getElapsedTime();
    if (crystalRef.current) {
      crystalRef.current.rotation.y = t * 0.8;
      crystalRef.current.position.y = 3.1 + Math.sin(t * 2.5) * 0.15;
    }
    if (ringRef.current) ringRef.current.rotation.z = t * 0.6;
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
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow><boxGeometry args={[3.4, 0.4, 3.0]} /><meshStandardMaterial color="#e6ccb2" /></mesh>
        <mesh position={[0, 1.1, 0]} castShadow><boxGeometry args={[2.8, 1.4, 2.4]} /><meshStandardMaterial color="#fff8f0" /></mesh>
        <mesh position={[0, 1.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><cylinderGeometry args={[1.6, 2.3, 0.5, 4]} /><meshStandardMaterial color="#e05a47" /></mesh>
        <mesh position={[0, 2.5, 0]} castShadow><boxGeometry args={[2.0, 0.9, 1.7]} /><meshStandardMaterial color="#fff8f0" /></mesh>
        <mesh position={[0, 3.35, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[1.8, 1.0, 4]} /><meshStandardMaterial color="#d94e34" /></mesh>
        {showLabels && (
          <Html position={[0, 4.3, 0]} center distanceFactor={18}>
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap ${activeModule === 'theory' ? 'bg-rose-600 text-white' : 'bg-white/95 text-slate-800'}`}>
              01 🏛️ 理論語言學殿堂
            </div>
          </Html>
        )}
      </group>

      {/* 02 計量與語料庫中心 */}
      <group position={[5.2, 0, -3.2]} onClick={(e) => handleSelect('corpus', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow><boxGeometry args={[3.4, 0.4, 3.0]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
        <mesh position={[-0.4, 1.5, 0]} castShadow><boxGeometry args={[2.0, 2.2, 2.0]} /><meshStandardMaterial color="#f1f5f9" /></mesh>
        <mesh position={[0.95, 1.1, 0.2]} castShadow><cylinderGeometry args={[0.65, 0.65, 1.4, 20]} /><meshStandardMaterial color="#2b7a78" /></mesh>
        <group position={[-0.4, 3.1, 0]}>
          <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}><torusGeometry args={[0.65, 0.08, 14, 28]} /><meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.6} /></mesh>
        </group>
        {showLabels && (
          <Html position={[0, 4.3, 0]} center distanceFactor={18}>
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap ${activeModule === 'corpus' ? 'bg-teal-700 text-white' : 'bg-white/95 text-slate-800'}`}>
              02 📊 計量與語料庫中心
            </div>
          </Html>
        )}
      </group>

      {/* 03 社會政策智庫 */}
      <group position={[-4.8, 0, 3.8]} onClick={(e) => handleSelect('policy', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow><boxGeometry args={[3.6, 0.4, 3.2]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
        <mesh position={[0, 1.15, -0.1]} castShadow><boxGeometry args={[2.8, 1.5, 2.2]} /><meshStandardMaterial color="#fdfbf7" /></mesh>
        <mesh position={[0, 2.1, -0.1]} castShadow><sphereGeometry args={[1.05, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#52b788" /></mesh>
        {showLabels && (
          <Html position={[0, 4.1, 0]} center distanceFactor={18}>
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap ${activeModule === 'policy' ? 'bg-blue-600 text-white' : 'bg-white/95 text-slate-800'}`}>
              03 🏫 社會政策智庫
            </div>
          </Html>
        )}
      </group>

      {/* 04 前線 AI 實踐工坊 */}
      <group position={[4.8, 0, 3.8]} onClick={(e) => handleSelect('systems', e)}>
        <mesh position={[0, 0.2, 0]} receiveShadow castShadow><boxGeometry args={[3.5, 0.4, 3.2]} /><meshStandardMaterial color="#fed7aa" /></mesh>
        <mesh position={[-0.3, 1.2, 0]} castShadow><boxGeometry args={[2.3, 1.6, 2.2]} /><meshStandardMaterial color="#fffbeb" /></mesh>
        <mesh position={[-0.3, 2.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[1.9, 0.9, 4]} /><meshStandardMaterial color="#f59e0b" /></mesh>
        <mesh position={[0.9, 1.6, -0.5]} castShadow><cylinderGeometry args={[0.25, 0.3, 2.2, 14]} /><meshStandardMaterial color="#ea580c" /></mesh>
        <mesh ref={crystalRef} position={[-0.3, 3.2, 0]} castShadow><octahedronGeometry args={[0.55, 0]} /><meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.7} /></mesh>
        {showLabels && (
          <Html position={[0, 4.3, 0]} center distanceFactor={18}>
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg border cursor-pointer whitespace-nowrap ${activeModule === 'systems' ? 'bg-amber-500 text-white' : 'bg-amber-50/95 text-amber-900'}`}>
              04 ⚡ 前線 AI 實踐工坊
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

// ==========================================
// 8. 3D 群島場景組裝
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
        <OceanAndSatelliteIslands />
        <FlyingHelicopter />
        <FluffyCloud position={[-12, 9.5, -8]} scale={1.1} speed={0.18} />
        <FluffyCloud position={[14, 10.2, -6]} scale={1.3} speed={0.14} />
        <FluffyCloud position={[-8, 10.8, 10]} scale={0.95} speed={0.22} />
        <FluffyCloud position={[11, 9.0, 9]} scale={1.05} speed={0.16} />

        <Float speed={0.5} rotationIntensity={0.008} floatIntensity={0.03}>
          {/* 主島三層底座 */}
          <mesh position={[0, -0.45, 0]} receiveShadow><cylinderGeometry args={[10.6, 10.2, 0.9, 48]} /><meshStandardMaterial color="#95d5b2" roughness={0.65} /></mesh>
          <mesh position={[0, -0.95, 0]}><cylinderGeometry args={[10.9, 10.1, 0.4, 48]} /><meshStandardMaterial color="#f5ebe0" /></mesh>
          <mesh position={[0, -1.7, 0]}><cylinderGeometry args={[9.8, 8.2, 1.2, 48]} /><meshStandardMaterial color="#d4a373" /></mesh>

          {/* 中央廣場步道與三層噴泉 */}
          <mesh position={[0, 0.02, 0]} receiveShadow><cylinderGeometry args={[3.2, 3.3, 0.06, 36]} /><meshStandardMaterial color="#fdfbf7" /></mesh>
          <mesh position={[0, 0.015, -0.2]} rotation={[0, Math.PI / 5, 0]} receiveShadow><boxGeometry args={[13.5, 0.04, 1.15]} /><meshStandardMaterial color="#f5ebe0" /></mesh>
          <mesh position={[0, 0.015, -0.2]} rotation={[0, -Math.PI / 5, 0]} receiveShadow><boxGeometry args={[13.5, 0.04, 1.15]} /><meshStandardMaterial color="#f5ebe0" /></mesh>
          <CentralFountain />

          <DetailedBuildings />

          {showSynergyLines && (
            <group>
              <QuadraticBezierLine start={[-5.2, 2.5, -3.2]} end={[5.2, 2.5, -3.2]} mid={[0, 5.5, -3.2]} color="#e05a47" lineWidth={2} dashed dashScale={2} />
              <QuadraticBezierLine start={[5.2, 2.5, -3.2]} end={[4.8, 2.5, 3.8]} mid={[6.0, 5.0, 0.3]} color="#2b7a78" lineWidth={2} dashed dashScale={2} />
              <QuadraticBezierLine start={[-4.8, 2.5, 3.8]} end={[4.8, 2.5, 3.8]} mid={[0, 5.2, 4.2]} color="#3a86ff" lineWidth={2} dashed dashScale={2} />
              <QuadraticBezierLine start={[-5.2, 2.5, -3.2]} end={[4.8, 2.5, 3.8]} mid={[0, 6.2, 0]} color="#f59e0b" lineWidth={2} dashed dashScale={2} />
            </group>
          )}

          {/* 渲染 12 位多元人物与 6 隻貓狗 */}
          {PEOPLE_LIST.map((p, idx) => (
            <DiversePerson key={idx} data={p} />
          ))}
          {PETS_LIST.map((pet, idx) => (
            <CutePet key={idx} data={pet} />
          ))}

          {/* 島嶼綠樹 */}
          <CuteTree position={[-8.2, 0, -1.0]} scale={1.1} color="#40916c" />
          <CuteTree position={[-7.5, 0, 1.5]} scale={0.85} color="#52b788" />
          <CuteTree position={[8.2, 0, -0.5]} scale={1.15} color="#40916c" />
          <CuteTree position={[7.6, 0, 1.8]} scale={0.9} color="#74c69d" />
          <CuteTree position={[0, 0, -6.8]} scale={1.2} color="#40916c" />
          <CuteTree position={[1.8, 0, 6.5]} scale={1.0} color="#52b788" />
        </Float>
      </group>

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
// 9. 頂層全螢幕懸浮 UI 主元件 (App)
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

  const handleZoom = (factor) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const cam = controls.object;
    const offset = cam.position.clone().sub(controls.target);
    const newLen = Math.max(controls.minDistance, Math.min(controls.maxDistance, offset.length() * factor));
    offset.setLength(newLen);
    cam.position.copy(controls.target).add(offset);
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
      {/* 100% 滿版 3D 畫布 */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}
      >
        <Canvas shadows camera={{ position: [0, 12.5, 18.5], fov: 42 }}>
          <IslandScene controlsRef={controlsRef} />
        </Canvas>
      </div>

      {/* 左上角品牌標誌 */}
      <div className="absolute top-5 left-6 z-20 pointer-events-auto">
        <div className="bg-[#fdfbf7]/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-stone-200">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black tracking-tight text-[#e05a47]">FLAME-EAGLE</span>
            <span className="text-sm font-extrabold text-slate-800">炎鷲橙果島</span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">ACADEMIC & AI ARCHIPELAGO · 3D 海洋知識群島</p>
        </div>
      </div>

      {/* 頂部中央膠囊工具列 */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto hidden md:flex items-center gap-2 bg-[#fdfbf7]/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-stone-200">
        <button onClick={toggleLabels} className={`px-3 py-1.5 rounded-full text-xs font-bold ${showLabels ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>
          🏷️ 名牌
        </button>
        <button onClick={toggleSynergyLines} className={`px-3 py-1.5 rounded-full text-xs font-bold ${showSynergyLines ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>
          🔗 協作線
        </button>
        <button onClick={togglePause} className={`px-3 py-1.5 rounded-full text-xs font-bold ${isPaused ? 'bg-rose-600 text-white' : 'text-slate-600'}`}>
          {isPaused ? '▶️ 繼續' : '⏸️ 暫停'}
        </button>
        <select value={persona} onChange={(e) => setPersona(e.target.value)} className="bg-stone-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full border border-stone-200">
          <option value="all">🧭 全方位探索者</option>
          <option value="researcher">🎓 學術研究同行</option>
          <option value="teacher">🏫 教育工作者</option>
        </select>
      </div>

      {/* 底部中央 Zoom In / Zoom Out 縮放控制列 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2 bg-[#fdfbf7]/95 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-stone-200">
        <button onClick={() => handleZoom(0.75)} className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-white">
          ➕ 放大 (Zoom In)
        </button>
        <button onClick={() => handleZoom(1.3)} className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-white">
          ➖ 縮小 (Zoom Out)
        </button>
        <button onClick={() => handleResetView(8.0, 4.5)} className="px-3 py-1.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900">
          ⛲ 近看噴泉與貓狗
        </button>
        <button onClick={() => handleResetView(18.5, 12.5)} className="px-3 py-1.5 rounded-full text-xs font-bold bg-stone-100 text-slate-700">
          🏝️ 標準主島
        </button>
        <button onClick={() => handleResetView(34.0, 22.0)} className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
          🌊 全景大海與外島
        </button>
      </div>

      {/* 左側詳細研究卡片 */}
      {isModalOpen && mod && (
        <div className="absolute top-24 left-6 bottom-20 z-30 w-[390px] max-w-[90vw] bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200 rounded-3xl p-6 shadow-2xl pointer-events-auto flex flex-col justify-between overflow-hidden">
          <div className="overflow-y-auto pr-1 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-[#e05a47] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                {mod.code}
              </span>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-stone-100 w-7 h-7 rounded-full flex items-center justify-center font-bold">
                ✕
              </button>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{mod.title}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{mod.summary}</p>
            </div>
            <div className="bg-stone-100 border-l-4 border-[#e05a47] p-3 rounded-r-xl text-xs text-slate-700 font-medium">
              {mod.quote}
            </div>
            {mod.categories && (
              <div className="space-y-3">
                {mod.categories.map((cat, cIdx) => (
                  <div key={cIdx} className="space-y-1.5">
                    <div className="text-[11px] font-extrabold text-slate-400 uppercase">{cat.name}</div>
                    {cat.list.map((item, iIdx) => (
                      <div key={iIdx} className="bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-slate-700 font-medium shadow-sm flex items-start gap-2">
                        <span className="text-[#e05a47] font-black">●</span>
                        <span>{item}</span>
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">{link.name}</span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{link.tag} ↗</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{link.desc}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 右側常駐目錄欄位 */}
      <aside className="absolute top-5 right-6 bottom-20 z-20 w-80 bg-[#fdfbf7]/95 backdrop-blur-xl border border-stone-200 p-5 rounded-3xl shadow-2xl pointer-events-auto flex flex-col justify-between">
        <div className="overflow-y-auto pr-1">
          <div className="border-b border-stone-200 pb-3.5 mb-4">
            <h2 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">THE RESEARCH INDEX</h2>
            <p className="text-lg font-black text-slate-800 mt-0.5">把理論與應用，連起來。</p>
            <p className="text-xs text-slate-500 mt-1">主島 4 大中心 · 外海 4 座備用島 · 12 位島民與萌寵</p>
          </div>
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
                  className={`p-3.5 rounded-2xl border cursor-pointer ${isSelected ? 'bg-rose-50 border-[#e05a47] shadow-md' : 'bg-white border-stone-200 hover:bg-stone-100'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-black text-[#e05a47]">{value.id}</span>
                      <span className="text-xs font-extrabold text-slate-800">{value.shortTitle}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">{value.stats.itemsCount.split(' ')[0]} ›</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-[11px] font-medium text-slate-400 text-center border-t border-stone-200 pt-3">
          💡 滾輪或下方按鈕可自由 Zoom In / Out
        </div>
      </aside>
    </div>
  );
}
