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
      <color attach="background" args={['#040610']} />
      <ambientLight intensity={1.8} />
      <directionalLight position={[20, 40, 20]} intensity={2.5} castShadow shadow-mapSize={2048} />
      <pointLight position={[0, 10, 0]} intensity={4} color="#3b82f6" distance={25} />

      {/* 飄浮裝飾雲朵 */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[-14, 9, -6]}><sphereGeometry args={[2, 16, 16]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.2} /></mesh>
        <mesh position={[15, 8, 5]}><sphereGeometry args={[2.5, 16, 16]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.15} /></mesh>
      </Float>

      {/* 主島嶼與建築群（整體放大 1.8 倍，讓 3D 滿版撐開上下左右） */}
      <group scale={[1.8, 1.8, 1.8]} position={[0, -0.3, 0]}>
        <Float speed={1} rotationIntensity={0.03} floatIntensity={0.1}>
          {/* 島嶼青草地 */}
          <mesh position={[0, -1, 0]} receiveShadow>
            <cylinderGeometry args={[12.5, 11, 2, 32]} />
            <meshStandardMaterial color="#065f46" roughness={0.5} />
          </mesh>
          {/* 島嶼土壤層 */}
          <mesh position={[0, -2.2, 0]}>
            <cylinderGeometry args={[11, 10.2, 1.5, 32]} />
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
              <div className="island-badge hover:scale-105 transition-transform cursor-pointer shadow-lg">📚 理論語言學</div>
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
              <div className="island-badge hover:scale-105 transition-transform cursor-pointer shadow-lg">📊 計量與語料庫</div>
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
              <div className="island-badge hover:scale-105 transition-transform cursor-pointer shadow-lg">🏫 社會政策智庫</div>
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
      <ContactShadows position={[0, -3.8, 0]} opacity={0.6} scale={45} blur={3} far={5} />

      {/* 電影級發光後處理 */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={1.5} />
      </EffectComposer>

      {/* 相機拉近至 [0, 7.5, 10]，fov 設為 60，徹底撐滿上下界限 */}
      <OrbitControls enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={6} maxDistance={16} />
    </>
  );
}

export default function App() {
  const { activeModule, setActiveModule, isModalOpen, setModalOpen, persona, setPersona } = useIslandStore();
  const mod = activeModule ? researchModules[activeModule] : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans flex">
      
      {/* 左側與中央：3D 滿版 Canvas 畫布 */}
      <div className="relative flex-1 h-full">
        <Canvas camera={{ position: [0, 7.5, 10], fov: 60 }}>
          <IslandScene />
        </Canvas>

        {/* 頂部標題與身分適配 */}
        <header className="absolute top-5 left-6 z-20 bg-slate-900/85 backdrop-blur-xl border border-blue-500/30 px-6 py-2.5 rounded-2xl shadow-xl flex items-center gap-5">
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

        {/* 圖面上的透明疊加資訊彈窗 (Overlay Modal) */}
        {isModalOpen && mod && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-30 flex items-center justify-center p-6">
            <div className="bg-slate-900/85 border border-blue-400/40 w-full max-w-lg rounded-3xl p-7 shadow-2xl backdrop-blur-xl relative animate-in fade-in zoom-in-95 duration-200 text-slate-100">
              <button onClick={() => setModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
              <h2 className="text-xl font-bold text-blue-400 mb-2">{mod.title}</h2>
              <p className="text-slate-300 text-xs mb-4 leading-relaxed">{mod.description}</p>
              
              {mod.items && (
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 mb-4 max-h-52 overflow-y-auto">
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

      {/* 右側固定控制與選項欄位 (Fixed Right Sidebar) */}
      <aside className="w-80 h-full bg-slate-900/95 border-l border-slate-800/80 backdrop-blur-2xl z-20 p-6 flex flex-col justify-between shadow-2xl">
        <div>
          <div className="mb-6 border-b border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">島嶼模組目錄</h2>
            <p className="text-[11px] text-slate-400 mt-1">點擊下方選單直接切換或預覽研究模組</p>
          </div>

          {/* 固定選項按鈕列表 */}
          <div className="space-y-3">
            {Object.entries(researchModules).map(([key, value]) => (
              <button
                key={key}
                onClick={() => { setActiveModule(key); setModalOpen(true); }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                  activeModule === key 
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="text-xl">{value.icon || '📌'}</span>
                <div>
                  <div className="text-xs font-bold leading-tight">{value.title.split('：')[0]}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{value.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 底部小提示 */}
        <div className="border-t border-slate-800 pt-4 text-[11px] text-slate-400 text-center leading-relaxed">
          ✨ 提示：滑鼠可直接拖曳旋轉 3D 浮空島嶼，滾輪進行縮放。
        </div>
      </aside>

    </div>
  );
}
