export default {
  async fetch(request, env, ctx) {
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>炎鷲橙果島 - HEART 政策島風格 3D 生態系</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Noto Sans TC', sans-serif; }
        body, html { width: 100%; height: 100%; overflow: hidden; background: #cce7e8; color: #1e293b; }
        #canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1; }
        
        /* 頂部政策島風格標題列 */
        .ui-header {
            position: absolute; top: 20px; left: 25px; z-index: 10;
            background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(203, 213, 225, 0.8);
            padding: 12px 25px; border-radius: 16px; backdrop-filter: blur(12px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.08); pointer-events: auto;
        }
        .ui-header h1 { font-size: 1.25rem; color: #e11d48; letter-spacing: 0.5px; font-weight: 700; }
        .ui-header p { font-size: 0.78rem; color: #64748b; margin-top: 2px; }

        /* 3D建築物上方的浮動標籤 (Policy Island Style) */
        .island-label {
            position: absolute; z-index: 5; transform: translate(-50%, -100%);
            background: rgba(255, 255, 255, 0.95); border: 1px solid #cbd5e1;
            padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700;
            color: #334155; box-shadow: 0 4px 12px rgba(0,0,0,0.1); pointer-events: none;
            transition: all 0.2s ease; white-space: nowrap;
        }
        .island-label::after {
            content: ''; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
            border-width: 6px 6px 0; border-style: solid; border-color: rgba(255, 255, 255, 0.95) transparent;
            display: block; width: 0;
        }

        /* 操作提示 */
        .ui-hint {
            position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%); z-index: 10;
            background: rgba(255, 255, 255, 0.9); border: 1px solid #cbd5e1;
            padding: 8px 20px; border-radius: 20px; font-size: 0.82rem; color: #475569;
            box-shadow: 0 10px 20px rgba(0,0,0,0.08); pointer-events: none; font-weight: 500;
        }

        /* 毛玻璃知識資訊面板 */
        .info-panel {
            position: absolute; top: 100px; right: 30px; width: 400px;
            background: rgba(255, 255, 255, 0.95); border: 1px solid #e2e8f0;
            border-radius: 20px; padding: 25px; z-index: 20; backdrop-filter: blur(20px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.12); display: none; color: #1e293b;
            animation: panelIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes panelIn {
            from { opacity: 0; transform: translateY(15px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .info-panel h2 { color: #e11d48; font-size: 1.3rem; margin-bottom: 10px; font-weight: 700; }
        .info-panel p { color: #475569; font-size: 0.9rem; line-height: 1.6; margin-bottom: 10px; }
        .info-panel ul { padding-left: 18px; color: #334155; font-size: 0.88rem; margin-bottom: 12px; }
        .info-panel li { margin-bottom: 5px; }
        
        .close-panel {
            position: absolute; top: 18px; right: 18px; background: #f1f5f9; 
            border: none; color: #64748b; width: 30px; height: 30px; border-radius: 50%;
            font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .close-panel:hover { background: #e2e8f0; color: #0f172a; }
        
        .btn-link {
            display: inline-block; background: #e11d48; color: white; padding: 8px 16px;
            border-radius: 10px; text-decoration: none; font-size: 0.88rem; font-weight: 500; margin-top: 6px;
            box-shadow: 0 4px 10px rgba(225, 29, 72, 0.3); transition: all 0.2s;
        }
        .btn-link:hover { background: #be123c; transform: translateY(-1px); }
        code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #e11d48; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="ui-header">
        <h1>🦅 炎鷲橙果島</h1>
        <p>Flame-Eagle Orange-Fruit Island</p>
    </div>
    
    <div class="ui-hint">💡 滑鼠拖曳旋轉視角、滾輪縮放；<strong>點擊建築或標籤</strong>探索內容！</div>
    
    <!-- 動態標籤容器 -->
    <div id="labels-container"></div>

    <div id="infoPanel" class="info-panel">
        <button class="close-panel" onclick="closeInfo()">×</button>
        <div id="panelContent"></div>
    </div>
    
    <div id="canvas-container"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xd7eff1); // 政策島風格清新淺藍水域
        scene.fog = new THREE.FogExp2(0xd7eff1, 0.02);

        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 22, 28);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // --- 柔和自然光影 ---
        scene.add(new THREE.AmbientLight(0xffffff, 1.0));
        const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.1);
        dirLight.position.set(15, 30, 15);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // --- 主島與衛星島群 (群島配置) ---
        const mainIslandGeo = new THREE.CylinderGeometry(9, 8, 2, 32);
        const islandMat = new THREE.MeshStandardMaterial({ color: 0x99f6e4, roughness: 0.7 }); // 清新淺青綠
        const mainIsland = new THREE.Mesh(mainIslandGeo, islandMat);
        mainIsland.position.y = -1;
        scene.add(mainIsland);

        // 衛星小島 1 (左側)
        const subIsland1 = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3, 1.8, 16), islandMat);
        subIsland1.position.set(-8, -1.1, -4);
        scene.add(subIsland1);

        // 衛星小島 2 (右側)
        const subIsland2 = new THREE.Mesh(new THREE.CylinderGeometry(4, 3.5, 1.8, 16), islandMat);
        subIsland2.position.set(8, -1.1, -2);
        scene.add(subIsland2);

        // --- 建築群資料與可愛造型 ---
        const interactiveObjects = [];
        const labelData = [];

        function createBuilding(data) {
            const group = new THREE.Group();
            group.position.set(data.pos[0], data.pos[1], data.pos[2]);
            group.userData = { content: data.content, originalY: data.pos[1], originalX: data.pos[0], originalZ: data.pos[2] };

            if (data.id === 'hub') {
                // 🌋 島主觀測站 (中央發光水晶塔)
                const base = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.2, 1.5, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
                base.position.y = 0.75; group.add(base);
                const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.9), new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.1, emissive: 0x9f1239, emissiveIntensity: 0.4 }));
                crystal.position.y = 2.0; group.add(crystal);
            } 
            else if (data.id === 'papers') {
                // 📚 學術殿堂 (溫馨藏書閣)
                const house = new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, 2), new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.4 }));
                house.position.y = 0.8; group.add(house);
                const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.2, 4), new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 }));
                roof.position.y = 2.2; roof.rotation.y = Math.PI / 4; group.add(roof);
            } 
            else if (data.id === 'systems') {
                // ⚡ 實踐工坊 (科技工坊)
                const fac = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 2), new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.4 }));
                fac.position.y = 0.9; group.add(fac);
                const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1, 12), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 }));
                chimney.position.set(0.6, 2.0, 0); group.add(chimney);
            } 
            else if (data.id === 'synergy') {
                // 🔗 知識協作網 (雙環能量塔)
                const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.18, 16, 32), new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2 }));
                ring.position.y = 1.0; ring.rotation.x = Math.PI / 3; group.add(ring);
            }

            scene.add(group);
            interactiveObjects.push(group);
            labelData.push({ group: group, title: data.title });
        }

        const buildingsData = [
            {
                id: 'hub', title: '01 觀測站 (Overview)', pos: [0, 0, 0],
                content: '<h2>🌋 島主觀測站</h2><p><strong>炎鷲橙果島</strong> 結合深層語言學研究、計量句法分析（MDD）與前線 AI 應用。</p><ul><li><strong>學術基石</strong>：依存距離、南島語句法。</li><li><strong>系統落地</strong>：3 大線上智慧檢測平台。</li></ul>'
            },
            {
                id: 'papers', title: '02 學術殿堂 (Papers)', pos: [-4, 0, -2],
                content: '<h2>📚 學術殿堂：研究著作</h2><p>收錄於 <code>01 學術研究/00 研究成果島/01 論文</code>：</p><p><strong>1. 華語文評量材料句法複雜度與自動檢測</strong></p><p style="font-size:0.85rem; color:#64748b; margin-top:5px;">核心指標：依存距離 (DD)、平均依存距離 (MDD)、最大依存距離 (MaxDD)。</p>'
            },
            {
                id: 'systems', title: '03 實踐工坊 (AI Systems)', pos: [4, 0, -2],
                content: '<h2>⚡ 實踐工坊：線上應用系統</h2><p>學術理論轉化為生產力工具的現場：</p><p style="margin-top:8px;"><strong>1. AI 華語文句法難度自動檢測</strong></p><a href="https://twmddanalyzer.streamlit.app/" target="_blank" class="btn-link">🚀 啟動檢測系統</a><p style="margin-top:10px;"><strong>2. 自動語音轉文字與語料庫分析</strong></p><a href="https://twpoliticolstt.streamlit.app/" target="_blank" class="btn-link">🚀 啟動分析系統</a><p style="margin-top:10px;"><strong>3. 台灣中小學英語測驗單字頻率檢索</strong></p><a href="https://twvocfreqexam.streamlit.app/" target="_blank" class="btn-link">🚀 啟動檢索系統</a>'
            },
            {
                id: 'synergy', title: '04 知識協作網 (Synergy)', pos: [0, 0, 3.5],
                content: '<h2>🔗 知識協作網：研發閉環</h2><p>理論轉化為前端工具的演化脈絡與知識架構。</p>'
            }
        ];

        buildingsData.forEach(data => createBuilding(data));

        // --- 建立 HTML 浮動標籤 DOM 元素 ---
        const labelsContainer = document.getElementById('labels-container');
        const labelDivs = labelData.map((item, idx) => {
            const div = document.createElement('div');
            div.className = 'island-label';
            div.innerText = item.title;
            labelsContainer.appendChild(div);
            return div;
        });

        // --- 滑鼠互動與運鏡 ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        window.addEventListener('click', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(interactiveObjects, true);
            
            if (intersects.length > 0) {
                let obj = intersects[0].object;
                while (obj.parent && !obj.userData.content) { obj = obj.parent; }
                if (obj.userData.content) {
                    document.getElementById('panelContent').innerHTML = obj.userData.content;
                    document.getElementById('infoPanel').style.display = 'block';
                    smoothCameraMove(obj.userData.originalX * 0.7, obj.userData.originalZ * 0.7 + 14);
                }
            }
        });

        function closeInfo() { document.getElementById('infoPanel').style.display = 'none'; }

        let targetCamX = 0, targetCamZ = 28;
        function smoothCameraMove(x, z) { targetCamX = x; targetCamZ = z; }

        // --- 動態渲染迴圈 (更新 3D 位置與 HTML 標籤同步) ---
        let clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            let t = clock.getElapsedTime();

            mainIsland.position.y = -1 + Math.sin(t * 1.5) * 0.06;

            interactiveObjects.forEach((group, idx) => {
                group.position.y = group.userData.originalY + Math.sin(t * 2 + idx) * 0.04;
            });

            // 攝影機平滑移動
            camera.position.x += (targetCamX - camera.position.x) * 0.05;
            camera.position.z += (targetCamZ - camera.position.z) * 0.05;
            camera.lookAt(0, 0, 0);

            // 計算 3D 物件在螢幕上的 2D 座標，讓標籤完美釘選在建築上方
            labelData.forEach((item, idx) => {
                const vector = new THREE.Vector3(item.group.position.x, item.group.position.y + 1.8, item.group.position.z);
                vector.project(camera);
                const x = (vector.x * .5 + .5) * window.innerWidth;
                const y = (-(vector.y * .5) + .5) * window.innerHeight;
                labelDivs[idx].style.left = \`\${x}px\`;
                labelDivs[idx].style.top = \`\${y}px\`;
                // 若物件轉到背面則隱藏標籤
                labelDivs[idx].style.display = vector.z > 1 ? 'none' : 'block';
            });

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
