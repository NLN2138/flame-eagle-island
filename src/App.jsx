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
      <color attach="background" args={['#070d1b']} />
      <ambientLight intensity={1.8} />
      <directionalLight position={[20, 40, 20]} intensity={2.5} castShadow shadow-mapSize={2048} />
      <pointLight position={[0, 15, 0]} intensity={4} color="#3b82f6" distance={30} />

      {/* 3D 群島本體：完美對齊滿版視口中央 */}
      <group scale={[2.2, 2.2, 2.2]} position={[0, -1.5, 0]}>
        <Float speed={1} rotationIntensity={0.03} floatIntensity={0.08}>
          {/* 島嶼青草地 */}
          <mesh position={[0, -1, 0]} receiveShadow>
            <cylinderGeometry args={[13, 11.5, 2, 32]} />
            <meshStandardMaterial color="#065f46" roughness={0.5} />
          </mesh>
          {/* 島嶼土壤層 */}
          <mesh position={[0, -2.2, 0]}>
            <cylinderGeometry args={[11.5, 10.5, 1.5, 32]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>

          {/* 建築一：理論語言學 */}
          <group position={[-5, 0, -2.5]} onClick={(e) => { e.stopPropagation(); setActiveModule('theory'); setModalOpen(true); }}>
            <mesh position={[0, 0.9, 0]} castShadow>
              <boxGeometry args={[2.2, 1.8, 2.2]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[1.6, 1.4, 4]} />
              <meshStandardMaterial color="#ef4444" roughness={0.2} />
            </mesh>
            <Html position={[0, 3.2, 0]} center>
              <div className="bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-lg border border-slate-200 cursor-pointer hover:scale-105 transition-transform whitespace-nowrap">📚 理論語言學</div>
            </Html>
          </group>

          {/* 建築二：計量與語料庫 */}
          <group position={[5, 0, -2.5]} onClick={(e) => { e.stopPropagation(); setActiveModule('corpus'); setModalOpen(true); }}>
            <mesh position={[0, 1, 0]} castShadow>
              <boxGeometry args={[2, 2.2, 2]} />
              <meshStandardMaterial color="#dbeafe" roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.3, 0]} castShadow>
              <cylinderGeometry args={[0.9, 1.0, 0.6, 16]} />
              <meshStandardMaterial color="#3b82f6" roughness={0.1} emissive="#1d4ed8" emissiveIntensity={0.8} />
            </mesh>
            <Html position={[0, 3.3, 0]} center>
              <div className="bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-lg border border-slate-200 cursor-pointer hover:scale-105 transition-transform whitespace-nowrap">📊 計量與語料庫</div>
            </Html>
          </group>

          {/* 建築三：社會政策智庫 */}
          <group position={[0, 0, 4.2]} onClick={(e) => { e.stopPropagation(); setActiveModule('policy'); setModalOpen(true); }}>
            <mesh position={[0, 0.9, 0]} castShadow>
              <boxGeometry args={[2.4, 1.8, 2.4]} />
              <meshStandardMaterial color="#d1fae5" roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.1, 0]} castShadow>
              <boxGeometry args={[1.4, 0.8, 1.4]} />
              <meshStandardMaterial color="#10b981" roughness={0.2} />
            </mesh>
            <Html position={[0, 3.2, 0]} center>
              <div className="bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-lg border border-slate-200 cursor-pointer hover:scale-105 transition-transform whitespace-nowrap">🏫 社會政策智庫</div>
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
              <meshStandardMaterial color="#f59e0b" roughness={0.1} emissive="#d97706" emissiveIntensity={1.8} />
            </mesh>
            <Html position={[0, 3.8, 0]} center>
              <div className="bg-amber-50/95 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-amber-800 shadow-xl border border-amber-300 cursor-pointer hover:scale-105 transition-transform whitespace-nowrap">⚡ AI 實踐工坊</div>
            </Html>
          </group>
        </Float>
      </group>

      <ContactShadows position={[0, -4.5, 0]} opacity={0.65} scale={55} blur={3.5} far={6} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={1.5} />
      </EffectComposer>

      <OrbitControls enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={4} maxDistance={14} target={[0, -0.2, 0]} />
    </>
  );
}

export default function App() {
  const { activeModule, setActiveModule, isModalOpen, setModalOpen, persona, setPersona } = useIslandStore();
  const mod = activeModule ? researchModules[activeModule] : null;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-900 text-slate-900 font-sans select-none">
      
      {/* 1. 底層：100% 絕對滿版 3D 畫布 */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas camera={{ position: [0, 3.5, 6.0], fov: 65 }} style={{ width: '100%', height: '100%', display: 'block' }}>
          <IslandScene />
        </Canvas>
      </div>

      {/* 2. 頂部導覽列 (模仿 HEART 政策島 Header) */}
      <header className="absolute top-4 left-6 right-6 z-20 flex justify-between items-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-2xl shadow-xl border border-slate-200/80 pointer-events-auto flex items-center gap-4">
          <div>
            <h1 className="text-sm font-black text-rose-600 tracking-wider">FUTURE SOON. <span className="text-slate-800 font-medium text-xs">炎鷲橙果島</span></h1>
          </div>
          <select value={persona} onChange={(e) => setPersona(e.target.value)} className="bg-slate-100 text-slate-700 text-xs border border-slate-200 px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer font-medium">
            <option value="all">🧭 全方位探索者</option>
            <option value="researcher">🎓 學術研究同行</option>
            <option value="teacher">🏫 教育工作者</option>
          </select>
        </div>
      </header>

      {/* 3. 右側固定側邊欄 (模仿 POLICY INDEX) */}
      <aside className="absolute top-20 right-6 bottom-6 z-20 w-80 bg-white/90 backdrop-blur-2xl border border-slate-200/80 p-5 rounded-3xl shadow-2xl pointer-events-auto flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-200 pb-3 mb-4">
            <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase">THE POLICY INDEX</h2>
            <p className="text-base font-extrabold text-slate-800 mt-0.5">把改變，連起來。</p>
            <p className="text-[11px] text-slate-500 mt-1">4 大研究模組 / 點擊探索島嶼風貌</p>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {Object.entries(researchModules).map(([key, value], idx) => (
              <button
                key={key}
                onClick={() => { setActiveModule(key); setModalOpen(true); }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  activeModule === key 
                    ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-md' 
                    : 'bg-slate-50/80 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="text-xs font-extrabold text-rose-600">0{idx + 1}</div>
                  <div className="text-xs font-bold mt-0.5">{value.title.split('：')[0]}</div>
                </div>
                <span className="text-xs text-slate-400 font-bold">›</span>
              </button>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 text-center border-t border-slate-200 pt-3">
          💡 點擊 3D 建築或右側選單開啟詳細內容
        </div>
      </aside>

      {/* 4. 左側懸浮彈窗面板 (點擊建築後直接疊加在圖面上) */}
      {isModalOpen && mod && (
        <div className="absolute top-20 left-6 z-30 w-96 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 shadow-2xl pointer-events-auto animate-in fade-in zoom-in-95 duration-200 text-slate-800">
          <button onClick={() => setModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg">POLICY 01 · 政策與研究</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-2">{mod.title}</h2>
          <p className="text-slate-600 text-xs mb-4 leading-relaxed">{mod.description}</p>
          
          {mod.items && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-4 max-h-56 overflow-y-auto">
              <ul className="space-y-2.5 text-xs text-slate-700">
                {mod.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold mt-0.5">•</span>
                    <span className="leading-normal">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mod.isSystems && (
            <div className="space-y-2.5 mt-2">
              {mod.links.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="block bg-rose-600 hover:bg-rose-700 text-white text-center py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/30">
                  {link.name}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
