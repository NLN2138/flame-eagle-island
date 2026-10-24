import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import { useIslandStore } from './store/islandStore';
import { researchModules } from './data/researchData';

function IslandScene() {
  const { setActiveModule, setModalOpen } = useIslandStore();

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[15, 30, 15]} intensity={1.4} castShadow />

      {/* Ｑ版清新群島基底 */}
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh position={[0, -1, 0]} receiveShadow>
          <cylinderGeometry args={[11, 9.5, 2.2, 32]} />
          <meshStandardMaterial color="#99f6e4" roughness={0.6} />
        </mesh>

        {/* 理論語言學模組 */}
        <group position={[-4.5, 0, -2.5]} onClick={(e) => { e.stopPropagation(); setActiveModule('theory'); setModalOpen(true); }}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[2, 1.6, 2]} />
            <meshStandardMaterial color="#fee2e2" roughness={0.4} />
          </mesh>
          <mesh position={[0, 2.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.5, 1.2, 4]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} />
          </mesh>
          <Html position={[0, 3.0, 0]} center>
            <div className="island-badge">📚 理論語言學</div>
          </Html>
        </group>

        {/* 計量與語料庫模組 */}
        <group position={[4.5, 0, -2.5]} onClick={(e) => { e.stopPropagation(); setActiveModule('corpus'); setModalOpen(true); }}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[2.2, 1.8, 2]} />
            <meshStandardMaterial color="#dbeafe" roughness={0.4} />
          </mesh>
          <Html position={[0, 3.1, 0]} center>
            <div className="island-badge">📊 計量與語料庫</div>
          </Html>
        </group>

        {/* 社會語言學與政策模組 */}
        <group position={[0, 0, 4]} onClick={(e) => { e.stopPropagation(); setActiveModule('policy'); setModalOpen(true); }}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[2.2, 1.6, 2.2]} />
            <meshStandardMaterial color="#d1fae5" roughness={0.4} />
          </mesh>
          <Html position={[0, 3.0, 0]} center>
            <div className="island-badge">🏫 社會政策智庫</div>
          </Html>
        </group>

        {/* AI 實踐工坊 (中心觀測塔) */}
        <group position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); setActiveModule('systems'); setModalOpen(true); }}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[1.1, 1.3, 1.6, 16]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.3} />
          </mesh>
          <mesh position={[0, 2.2, 0]} castShadow>
            <octahedronGeometry args={[0.9]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.1} emissive="#d97706" emissiveIntensity={0.6} />
          </mesh>
          <Html position={[0, 3.3, 0]} center>
            <div className="island-badge font-bold text-amber-700">⚡ AI 實踐工坊</div>
          </Html>
        </group>
      </Float>

      <OrbitControls enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={15} maxDistance={40} />
    </>
  );
}

export default function App() {
  const { activeModule, isModalOpen, setModalOpen, persona, setPersona } = useIslandStore();
  const mod = activeModule ? researchModules[activeModule] : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      <header className="absolute top-5 left-1/2 -translate-x-1/2 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-6 py-3 rounded-full shadow-xl flex items-center gap-6">
        <div>
          <h1 className="text-lg font-bold text-blue-400">🦅 炎鷲橙果島</h1>
          <p className="text-xs text-slate-400">學術研究與 AI 應用生態系</p>
        </div>
        <select value={persona} onChange={(e) => setPersona(e.target.value)} className="bg-slate-800 text-slate-200 text-sm border border-slate-700 px-3 py-1.5 rounded-lg focus:outline-none">
          <option value="all">🧭 全方位探索者</option>
          <option value="researcher">🎓 學術研究同行</option>
          <option value="teacher">🏫 教育工作者</option>
        </select>
      </header>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-slate-800/80 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full text-xs text-slate-300 pointer-events-none shadow-lg">
        💡 滑鼠拖曳旋轉、滾輪縮放；點擊 3D 建築或標籤探索詳細內容
      </div>

      <Canvas camera={{ position: [0, 22, 28], fov: 42 }}>
        <IslandScene />
      </Canvas>

      {isModalOpen && mod && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-blue-500/30 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            <h2 className="text-xl font-bold text-blue-400 mb-2">{mod.title}</h2>
            <p className="text-slate-300 text-sm mb-4 leading-relaxed">{mod.description}</p>
            
            {mod.items && (
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300 mb-4 max-h-60 overflow-y-auto">
                {mod.items.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            )}

            {mod.isSystems && (
              <div className="space-y-3 mt-4">
                {mod.links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="block bg-blue-600 hover:bg-blue-500 text-white text-center py-2.5 rounded-xl font-medium transition-all shadow-lg">
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
