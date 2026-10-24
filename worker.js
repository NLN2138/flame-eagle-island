export default {
  async fetch(request, env, ctx) {
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>炎鷲橙果島 - 3D 沈浸式學術與 AI 應用生態系</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Noto Sans TC', sans-serif; }
        body, html { width: 100%; height: 100%; overflow: hidden; background: #060913; color: #f8fafc; }
        #canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1; }
        
        /* 頂部標題質感化 */
        .ui-header {
            position: absolute; top: 25px; left: 50%; transform: translateX(-50%); z-index: 10;
            text-align: center; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(59, 130, 246, 0.4);
            padding: 14px 30px; border-radius: 40px; backdrop-filter: blur(16px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); pointer-events: auto;
        }
        .ui-header h1 { font-size: 1.5rem; color: #60a5fa; letter-spacing: 1.5px; font-weight: 700; }
        .ui-header p { font-size: 0.82rem; color: #94a3b8; margin-top: 4px; }

        /* 操作提示 */
        .ui-hint {
            position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 10;
            background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(148, 163, 184, 0.25);
            padding: 10px 22px; border-radius: 20px; font-size: 0.85rem; color: #cbd5e1;
            backdrop-filter: blur(8px); box-shadow: 0 10px 25px rgba(0,0,0,0.5); pointer-events: none;
        }

        /* 毛玻璃質感資訊面板 */
        .info-panel {
            position: absolute; top: 110px; right: 35px; width: 420px;
            background: rgba(15, 23, 42, 0.88); border: 1px solid rgba(59, 130, 246, 0.5);
            border-radius: 20px; padding: 30px; z-index: 20; backdrop-filter: blur(20px);
            box-shadow: 0 25px 50px rgba(0,0,0,0.7); display: none;
            animation: panelIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes panelIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .info-panel h2 { color: #60a5fa; font-size: 1.4rem; margin-bottom: 12px; font-weight: 700; }
        .info-panel p { color: #94a3b8; font-size: 0.92rem; line-height: 1.7; margin-bottom: 12px; }
        .info-panel ul { padding-left: 18px; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 15px; }
        .info-panel li { margin-bottom: 8px; }
        
        .close-panel {
            position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.08); 
            border: none; color: #94a3b8; width: 32px; height: 32px; border-radius: 50%;
            font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
        }
        .close-panel:hover { background: rgba(255,255,255,0.2); color: white; }
        
        .btn-link {
            display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white; padding: 10px 18px; border-radius: 10px; text-decoration: none;
            font-size: 0.9rem; font-weight: 500; margin-top: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            transition: all 0.2s;
        }
        .btn-link:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6); }
    </style>
</head>
<body>
    <div class="ui-header">
        <h1>🦅 炎鷲橙果島 (Flame-Eagle Orange-Fruit Island)</h1>
        <p>高階沈浸式學術研究與 AI 應用生態系</p>
    </div>
    
    <div class="ui-hint">💡 操作提示：滑鼠拖曳旋轉視角、滾輪縮放；<strong>點擊 3D 建築物</strong>開啟詳細知識面板！</div>
    
    <div id="infoPanel" class="info-panel">
        <button class="close-panel" onclick="closeInfo()">×</button>
        <div id="panelContent"></div>
    </div>
    
    <div id="canvas-container"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x060913, 0.03);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 20, 28);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // --- 光影設定 ---
        scene.add(new THREE.AmbientLight(0x1e293b, 1.2));
        
        const dirLight = new THREE.DirectionalLight(0x60a5fa, 1.5);
        dirLight.position.set(20, 30, 20);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        scene.add(dirLight);

        const pointLight = new THREE.PointLight(0x3b82f6, 3, 40);
        pointLight.position.set(0, 5, 0);
        scene.add(pointLight);

        // --- 島嶼底座與發光環 ---
        const islandGeo = new THREE.CylinderGeometry(11, 9, 2.2, 6);
        const islandMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.2 });
        const island = new THREE.Mesh(islandGeo, islandMat);
        island.position.y = -1.1;
        island.receiveShadow = true;
        scene.add(island);

        const ringGeo = new THREE.RingGeometry(10.8, 11.2, 6);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.01;
        scene.add(ring);

        // --- 動態協作光纖 (Synergy Lines) ---
        const curveMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2, transparent: true, opacity: 0.6 });
        function createEnergyLine(pos1, pos2) {
            const curve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(pos1[0], pos1[1], pos1[2]),
                new THREE.Vector3((pos1[0]+pos2[0])/2, 3, (pos1[1]+pos2[1])/2),
                new THREE.Vector3(pos2[0], pos2[1], pos2[2])
            );
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            return new THREE.Line(geometry, curveMaterial);
        }
        scene.add(createEnergyLine([-4, 1, -2], [0, 0.8, 0])); // 學術殿堂連到觀測站
        scene.add(createEnergyLine([4, 1, -2], [0, 0.8, 0]));  // 實踐工坊連到觀測站
        scene.add(createEnergyLine([0, 0.6, 4], [0, 0.8, 0]));  // 知識協作網連到觀測站

        // --- 建築群生成 ---
        const interactiveObjects = [];
        const buildingsData = [
            {
                id: 'hub', name: '🌋 島主觀測站', color: 0x3b82f6, pos: [0, 0.9, 0], size: [2.8, 2.2, 2.8], shape: 'cylinder',
                content: '<h2>🌋 島主觀測站</h2><p><strong>炎鷲橙果島</strong> 結合深層語言學研究、計量句法分析（MDD）與前線 AI 應用。</p><ul><li><strong>學術基石</strong>：依存距離、南島語句法。</li><li><strong>系統落地</strong>：3 大線上智慧檢測平台。</li></ul>'
            },
            {
                id: 'papers', name: '📚 學術殿堂', color: 0x10b981, pos: [-4.5, 1.2, -2.5], size: [2.4, 2.8, 2.4], shape: 'box',
                content: '<h2>📚 學術殿堂：研究著作</h2><p>收錄於 <code>01 學術研究/00 研究成果島/01 論文</code>：</p><p><strong>1. 華語文評量材料句法複雜度與自動檢測</strong></p><p style="font-size:0.85rem; color:#94a3b8; margin-top:5px;">核心指標：依存距離 (DD)、平均依存距離 (MDD)、最大依存距離 (MaxDD)。</p>'
            },
            {
                id: 'systems', name: '⚡ 實踐工坊', color: 0xf59e0b, pos: [4.5, 1.4, -2.5], size: [2.4, 3.2, 2.4], shape: 'box',
                content: '<h2>⚡ 實踐工坊：線上應用系統</h2><p>學術理論轉化為生產力工具的現場：</p><p style="margin-top:8px;"><strong>1. AI 華語文句法難度自動檢測</strong></p><a href="https://twmddanalyzer.streamlit.app/" target="_blank" class="btn-link">🚀 啟動檢測系統</a><p style="margin-top:12px;"><strong>2. 自動語音轉文字與語料庫分析</strong></p><a href="https://twpoliticolstt.streamlit.app/" target="_blank" class="btn-link">🚀 啟動分析系統</a><p style="margin-top:12px;"><strong>3. 台灣中小學英語測驗單字頻率檢索</strong></p><a href="https://twvocfreqexam.streamlit.app/" target="_blank" class="btn-link">🚀 啟動檢索系統</a>'
            },
            {
                id: 'synergy', name: '🔗 知識協作網', color: 0x8b5cf6, pos: [0, 0.8, 4.5], size: [2.2, 1.6, 2.2], shape: 'box',
                content: '<h2>🔗 知識協作網：研發閉環</h2><p>理論轉化為前端工具的演化脈絡與知識架構。</p>'
            }
        ];

        buildingsData.forEach(data => {
            let geo = data.shape === 'cylinder' ? new THREE.CylinderGeometry(data.size[0]/2, data.size[0]/2, data.size[1], 24) : new THREE.BoxGeometry(data.size[0], data.size[1], data.size[2]);
            const mat = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.25, metalness: 0.3 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = { content: data.content, originalY: data.pos[1], originalX: data.pos[0], originalZ: data.pos[2] };
            scene.add(mesh);
            interactiveObjects.push(mesh);
        });

        // --- 飄浮微光粒子特效 ---
        const particleCount = 150;
        const particleGeo = new THREE.BufferGeometry();
        const particlePos = new Float32Array(particleCount * 3);
        for(let i=0; i<particleCount*3; i+=3) {
            particlePos[i] = (Math.random() - 0.5) * 35;
            particlePos[i+1] = Math.random() * 15;
            particlePos[i+2] = (Math.random() - 0.5) * 35;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
        const particleMat = new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.12, transparent: true, opacity: 0.7 });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // --- 滑鼠互動與運鏡 ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        window.addEventListener('click', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(interactiveObjects);
            
            if (intersects.length > 0) {
                const hit = intersects[0].object;
                document.getElementById('panelContent').innerHTML = hit.userData.content;
                document.getElementById('infoPanel').style.display = 'block';
                
                // 電影級平滑運鏡
                smoothCameraMove(hit.userData.originalX * 0.7, hit.userData.originalZ * 0.7 + 14);
            }
        });

        function closeInfo() { document.getElementById('infoPanel').style.display = 'none'; }

        let targetCamX = 0, targetCamZ = 28;
        function smoothCameraMove(x, z) {
            targetCamX = x;
            targetCamZ = z;
        }

        // --- 動態渲染迴圈 ---
        let clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            let t = clock.getElapsedTime();

            // 島嶼輕柔浮動
            island.position.y = -1.1 + Math.sin(t * 1.5) * 0.12;
            ring.position.y = island.position.y + 1.09;

            // 建築物緩動浮動
            interactiveObjects.forEach((obj, idx) => {
                obj.position.y = obj.userData.originalY + Math.sin(t * 2 + idx) * 0.06;
            });

            // 粒子緩慢旋轉
            particles.rotation.y = t * 0.03;

            // 攝影機平滑插值 (Lerp)
            camera.position.x += (targetCamX - camera.position.x) * 0.05;
            camera.position.z += (targetCamZ - camera.position.z) * 0.05;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>`;

    return new Response(htmlContent, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};
