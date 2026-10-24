import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useIslandStore } from './store/islandStore';
import { researchModules } from './data/researchData';
import * as THREE from 'three';

// 🚶‍♂️ 可愛動態漫步小人偶元件
function WalkingCharacter({ startPos, color, speed = 1, radius = 3 }) {
  const charRef = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    // 讓小人偶在島嶼上繞圈或依循特定軌跡漫步，並加上上下微跳的走路感
    const x = startPos[0] + Math.cos(t * 0.8) * radius;
    const z = startPos[2] + Math.sin(t * 0.8) * radius;
    const y = startPos[1] + Math.abs(Math.sin(t * 4)) * 0.15; // 走路時上下彈跳
    
    if (charRef.current) {
      charRef.current.position.set(x, y, z);
      // 讓小人偶面向前進方向
      charRef.current.rotation.y = -t * 0.8 + Math.PI / 2;
    }
  });

  return (
    <group ref={charRef} position={startPos} scale={[0.6, 0.6, 0.6]}>
      {/* 身體 */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.4, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* 頭部 */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#fde68a" roughness={0.3} />
      </mesh>
      {/* 學術小背包 */}
      <mesh position={[0, 0.6, -0.25]} castShadow>
        <boxGeometry args={[0.35, 0.4, 0.2]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} />
      </mesh>
    </group>
  );
}

function IslandScene() {
  const { setActiveModule, setModalOpen } = useIslandStore();

  return (
    <>
      <color attach="background" args={['#02040a']} />
      <ambientLight intensity={1.9} />
      <directionalLight position={[20, 40, 20]} intensity={2.8} castShadow shadow-mapSize={2048} />
      <pointLight position={[0, 15, 0]} intensity={5} color="#3b82f6" distance={35} />

      {/* 飄浮裝飾微光雲朵 */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[-18, 12, -8]}><sphereGeometry args={[2.5, 16, 16]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.15} /></mesh>
        <mesh position={[19, 11, 8]}><sphereGeometry args={[3, 16, 16]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.1} /></mesh>
      </Float>

      {/* 3D 群島本體 */}
      <group scale={[2.4, 2.4, 2.4]} position={[0, -1.2, 0]}>
        <Float speed={1} rotationIntensity={0.03} floatIntensity={0.08}>
          {/* 島嶼青草地 */}
          <mesh position={[0, -1, 0]} receiveShadow>
            <cylinderGeometry args={[13.5, 12, 2, 32]} />
            <meshStandardMaterial color="#065f46" roughness={0.5} />
          </mesh>
          {/* 島嶼土壤層 */}
          <mesh position={[0, -2.2, 0]}>
            <cylinderGeometry args={[12, 11, 1.5, 32]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>

          {/* 🚶‍♂️ 加入多位在島上漫步的可愛學者/學生人偶 */}
          <WalkingCharacter startPos={[-3, 0, -1]} color="#3b82f6" speed={0.9} radius={2} />
          <WalkingCharacter startPos={[3, 0, 2]} color="#10b981" speed={1.1} radius={2.5} />
          <WalkingCharacter startPos={[0, 0, -3]} color="#ef4444" speed={0.8} radius={1.8} />

          {/* 建築一：理論語言學 */}
          <group position={[-5.2, 0, -2.8]} onClick={(e) => { e.stopPropagation(); setActiveModule('theory'); setModalOpen(true); }}>
            <mesh position={[0, 0.9, 0]} castShadow>
              <boxGeometry args={[2.2, 1.8, 2.2]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[1.6, 1.4, 4]} />
              <meshStandardMaterial color="#ef4444" roughness={0.2} />
            </mesh>
            <Html position={[0, 3.2, 0]} center>
              <div className="island-badge hover:scale-105 transition-transform cursor-pointer shadow-xl">📚 理論語言學</div>
            </Html>
          </group>

          {/* 建築二：計量與語料庫 */}
          <group position={[5.2, 0, -2.8]} onClick={(e) => { e.stopPropagation(); setActiveModule('corpus'); setModalOpen(true); }}>
            <mesh position={[0, 1, 0]} castShadow>
              <boxGeometry args={[2, 2.2, 2]} />
              <meshStandardMaterial color="#dbeafe" roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.3, 0]} castShadow>
              <cylinderGeometry args={[0.9, 1.0, 0.6, 16]} />
              <meshStandardMaterial color="#3b82f6" roughness={0.1} emissive="#1d4ed8" emissiveIntensity={0.8} />
            </mesh>
            <Html position={[0, 3.3, 0]} center>
              <div className="island-badge hover:scale-105 transition-transform cursor-pointer shadow-xl">📊 計量與語料庫</div>
            </Html>
          </group>

          {/* 建築三：社會政策智庫 */}
          <group position={[0, 0, 4.6]} onClick={(e) => { e.stopPropagation(); setActiveModule('policy'); setModalOpen(true); }}>
            <mesh position={[0, 0.9, 0]} castShadow>
              <boxGeometry args={[2.4, 1.8, 2.4]} />
              <meshStandardMaterial color="#d1fae5" roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.1, 0]} castShadow>
              <boxGeometry args={[1.4, 0.8, 1.4]} />
              <meshStandardMaterial color="#10b981" roughness={0.2} />
            </mesh>
            <Html position={[0, 3.2, 0]} center>
              <div className="island-badge hover:scale-105 transition-transform cursor-pointer shadow-xl">🏫 社會政策智庫</div>
            </Html>
          </group>

          {/* 建築四：AI 實踐工坊 */}
          <group position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); setActiveModule('systems'); setModalOpen(true); }}>
            <mesh position={[0, 0.9, 0]} castShadow>
              <cylinderGeometry args={[1.2, 1.4, 1.8, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            <mesh position={[0, 2.5, 0]} castShadow>
              <octahedronGeometry args={[1.1]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.1} emissive="#d97706" emissiveIntensity={2.0} />
            </mesh>
            <Html position={[0, 3.8, 0]} center>
              <div className="island-badge font-bold text-amber-800 bg-amber-50 border-amber-300 hover:scale-105 transition-transform cursor-pointer shadow-2xl">⚡ AI 實踐工坊</div>
            </Html>
          </group>
        </Float>
      </group>

      {/* 地面柔和陰影 */}
      <ContactShadows position={[0, -4.8, 0]} opacity={0.7} scale={60} blur={4} far={7} />

      {/* 電影級發光後處理 */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={1.8} />
      </EffectComposer>

      <OrbitControls enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={4} maxDistance={12} target={[0, -0.2, 0]} />
    </>
  );
}

export default function App() {
  const { activeModule, setActiveModule, isModalOpen, setModalOpen, persona, setPersona } = useIslandStore();
  const mod = activeModule ? researchModules[activeModule] : null;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      
      {/* 1. 底層：100% 強制滿版 Canvas 畫布 */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas camera={{ position: [0, 3.8, 6.2], fov: 70 }} style={{ width: '100%', height: '100%', display: 'block' }}>
          <IslandScene />
        </Canvas>
      </div>

      {/* 2. 懸浮層：頂部左側品牌與身分適配選單 */}
      <header className="absolute top-6 left-6 z-20 bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-5 pointer-events-auto">
        <div>
          <h1 className="text-base font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">🦅 炎鷲橙果島</h1>
          <p className="text-[10px] text-slate-400 font-medium">Academic & AI Ecosystem</p>
        </div>
        <select value={persona} onChange={(e) => setPersona(e.target.value)} className="bg-slate-800 text-slate-200 text-xs border border-slate-700/80 px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer">
          <option value="all">🧭 全方位探索者</option>
          <option value="researcher">🎓 學術研究同行</option>
          <option value="teacher">🏫 教育工作者</option>
        </select>
      </header>

      {/* 3. 懸浮層：右側固定模組選單導覽列 */}
      <aside className="absolute top-6 right-6 z-20 w-72 bg-slate-900/85 backdrop-blur-2xl border border-slate-700/60 p-5 rounded-3xl shadow-2xl pointer-events-auto flex flex-col gap-3">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">島嶼模組目錄</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">點擊快速切換研究或應用模組</p>
        </div>
        <div className="space-y-2">
          {Object.entries(researchModules).map(([key, value]) => (
            <button
              key={key}
              onClick={() => { setActiveModule(key); setModalOpen(true); }}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                activeModule === key 
                  ? 'bg-blue-600/30 border-blue-500/60 text-blue-200 shadow-lg' 
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <span className="text-lg">{value.icon || '📌'}</span>
              <div className="overflow-hidden">
                <div className="text-xs font-bold truncate">{value.title.split('：')[0]}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{value.description}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* 4. 互動層：點選建築或右側選單後，彈出在 3D 圖面正上方的半透明懸浮面板 */}
      {isModalOpen && mod && (
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-md z-40 flex items-center justify-center p-6 pointer-events-auto">
          <div className="bg-slate-900/90 border border-blue-400/40 w-full max-w-lg rounded-3xl p-7 shadow-2xl backdrop-blur-2xl relative animate-in fade-in zoom-in-95 duration-200 text-slate-100">
            <button onClick={() => setModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
            <h2 className="text-xl font-bold text-blue-400 mb-2">{mod.title}</h2>
            <p className="text-slate-300 text-xs mb-4 leading-relaxed">{mod.description}</p>
            
            {mod.items && (
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 mb-4 max-h-60 overflow-y-auto">
                <ul className="space-y-2 text-xs text-slate-300">
                  {mod.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold mt-0.5">•</span>
                      <span className="leading-normal">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {mod.isSystems && (
              <div className="space-y-2.5 mt-2">
                {mod.links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-center py-2.5 px-4 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-blue-600/30">
                    {link.name}
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
