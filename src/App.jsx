import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Html, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useIslandStore } from './store/islandStore';
import { researchModules } from './data/researchData';

function IslandScene() {
  const { setActiveModule, setModalOpen } = useIslandStore();

  return (
    <>
      <color attach="background" args={['#050814']} />
      <ambientLight intensity={1.6} />
      <directionalLight position={[20, 40, 20]} intensity={2.2} castShadow shadow-mapSize={2048} />
      <pointLight position={[0, 10, 0]} intensity={3.5} color="#3b82f6" distance={25} />

      {/* 飄浮裝飾雲朵 */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[-12, 8, -6]}><sphereGeometry args={[1.8, 16, 16]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.25} /></mesh>
        <mesh position={[13, 7, 5]}><sphereGeometry args={[2.2, 16, 16]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.2} /></mesh>
      </Float>

      {/* 主島嶼與建築群（整體放大 1.5 倍，佔滿畫面空間） */}
      <group scale={[1.5, 1.5, 1.5]}>
        <Float speed={1} rotationIntensity={0.04} floatIntensity={0.12}>
          {/* 島嶼青草地 */}
          <mesh position={[0, -1, 0]} receiveShadow>
            <cylinderGeometry args={[12, 10.5, 2, 32]} />
            <meshStandardMaterial color="#065f46" roughness={0.5} />
          </mesh>
          {/* 島嶼土壤層 */}
          <mesh position={[0, -2.2, 0]}>
            <cylinderGeometry args={[10.5, 9.8, 1.5, 32]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>

          {/* 建築一：理論語言學 (精靈藏書閣) */}
          <group position={[-5, 0, -2.8]} onClick={(e) => { e.stopPropagation(); setActiveModule('theory'); setModalOpen(true); }}>
            <mesh position={[0, 0.9, 0]} castShadow>
              <boxGeometry args={[2.2, 1.8, 2.2]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[1.6, 1.4, 4]} />
              <meshStandardMaterial color="#ef4444" roughness={0.2} />
            </mesh>
            <Html position={[0, 3.2, 0]} center>
              <div className="island-badge hover:scale-105 transition-transform cursor-pointer shadow-md">📚 理論語言學</div>
            </Html>
          </group>

          {/* 建築二：計量與語料庫 (數據資料塔) */}
          <group position={[5, 0, -2.8]} onClick={(e) => { e.stopPropagation(); setActiveModule('corpus'); setModalOpen(true); }}>
            <mesh position={[0, 1, 0]} castShadow>
              <boxGeometry args={[2, 2.2, 2]} />
              <meshStandardMaterial color="#dbeafe" roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.3, 0]} castShadow>
              <cylinderGeometry args={[0.9, 1.0, 0.6, 16]} />
              <meshStandardMaterial color="#3b82f6" roughness={0.1} emissive="#1d4ed8" emissiveIntensity={0.8} />
            </mesh>
            <Html position={[0, 3.3, 0]} center>
              <div className="island-badge hover:scale-105 transition-transform cursor-pointer shadow-md">📊 計量與語料庫</div>
            </Html>
          </group>

          {/* 建築三：社會政策智庫 (政策研究所) */}
          <group position={[0, 0, 4.5]} onClick={(e) => { e.stopPropagation(); setActiveModule('policy'); setModalOpen(true); }}>
            <mesh position={[0, 0.9, 0]} castShadow>
              <boxGeometry args={[2.4, 1.8, 2.4]} />
              <meshStandardMaterial color="#d1fae5" roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.1, 0]} castShadow>
              <boxGeometry args={[1.4, 0.8, 1.4]} />
              <meshStandardMaterial color="#10b981" roughness={0.2} />
            </mesh>
            <Html position={[0, 3.2, 0]} center>
              <div className="island-badge hover:scale-105 transition-transform cursor-pointer shadow-md">🏫 社會政策智庫</div>
            </Html>
          </group>

          {/* 建築四：AI 實踐工坊 (中央發光魔法水晶塔) */}
          <group position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); setActiveModule('systems'); setModalOpen(true); }}>
            <mesh position={[0, 0.9, 0]} castShadow>
              <cylinderGeometry args={[1.2, 1.4, 1.8, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            <mesh position={[0, 2.5, 0]} castShadow>
              <octahedronGeometry args={[1.1]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.1} emissive="#d97706" emissiveIntensity={1.8} />
            </mesh>
            <Html position={[0, 3.8, 0]} center>
              <div className="island-badge font-bold text-amber-800 bg-amber-50 border-amber-300 hover:scale-105 transition-transform cursor-pointer shadow-xl">⚡ AI 實踐工坊</div>
            </Html>
          </group>
        </Float>
      </group>

      {/* 地面柔和陰影 */}
      <ContactShadows position={[0, -3.5, 0]} opacity={0.6} scale={40} blur={2.5} far={5} />

      {/* 電影級發光後處理 */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={1.4} />
      </EffectComposer>

      {/* 限制相機距離，確保島嶼完美佔滿畫面 */}
      <OrbitControls enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={8} maxDistance={20} />
    </>
  );
}

export default function App() {
  const { activeModule, isModalOpen, setModalOpen, persona, setPersona } = useIslandStore();
  const mod = activeModule ? researchModules[activeModule] : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* 頂部質感導覽列 */}
      <header className="absolute top-5 left-1/2 -translate-x-1/2 z-20 bg-slate-900/85 backdrop-blur-xl border border-blue-500/30 px-8 py-3 rounded-full shadow-2xl flex items-center gap-8">
        <div>
          <h1 className="text-lg font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">🦅 炎鷲橙果島</h1>
          <p className="text-[11px] text-slate-400 font-medium">Academic & AI Ecosystem</p>
        </div>
        <select value={persona} onChange={(e) => setPersona(e.target.value)} className="bg-slate-800 text-slate-200 text-xs border border-slate-700/80 px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer">
          <option value="all">🧭 全方位探索者</option>
          <option value="researcher">🎓 學術研究同行</option>
          <option value="teacher">🏫 教育工作者</option>
        </select>
      </header>

      {/* 底部提示 */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 px-5 py-2 rounded-full text-xs text-slate-300 pointer-events-none shadow-xl">
        ✨ 提示：滑鼠拖曳旋轉、滾輪縮放；<strong>點擊 3D 建築或標籤</strong>探索詳細內容！
      </div>

      {/* 滿版 Canvas 畫布，相機拉近至 [0, 9, 12]，fov 設為 55 撐滿上下空間 */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas camera={{ position: [0, 9, 12], fov: 55 }}>
          <IslandScene />
        </Canvas>
      </div>

      {/* 高質感毛玻璃互動彈窗 */}
      {isModalOpen && mod && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-blue-500/40 w-full max-w-xl rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 w-9 h-9 rounded-full flex items-center justify-center transition-colors">✕</button>
            <h2 className="text-2xl font-bold text-blue-400 mb-3">{mod.title}</h2>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">{mod.description}</p>
            
            {mod.items && (
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 mb-6 max-h-64 overflow-y-auto">
                <ul className="space-y-3 text-sm text-slate-300">
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
              <div className="space-y-3.5 mt-2">
                {mod.links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-center py-3 px-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.01]">
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
