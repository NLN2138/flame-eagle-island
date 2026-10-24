export default {
  async fetch(request, env, ctx) {
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>炎鷲橙果島 - 可愛清新 3D 沈浸式生態系</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Noto Sans TC', sans-serif; }
        body, html { width: 100%; height: 100%; overflow: hidden; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #f8fafc; }
        #canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1; }
        
        /* 頂部清新導覽列 */
        .ui-header {
            position: absolute; top: 25px; left: 50%; transform: translateX(-50%); z-index: 10;
            text-align: center; background: rgba(255, 255, 255, 0.85); border: 1px solid rgba(148, 163, 184, 0.3);
            padding: 12px 30px; border-radius: 40px; backdrop-filter: blur(16px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.15); pointer-events: auto;
        }
        .ui-header h1 { font-size: 1.4rem; color: #3b82f6; letter-spacing: 1px; font-weight: 700; }
        .ui-header p { font-size: 0.8rem; color: #64748b; margin-top: 2px; }

        /* 清新操作提示 */
        .ui-hint {
            position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 10;
            background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(203, 213, 225, 0.5);
            padding: 10px 22px; border-radius: 20px; font-size: 0.85rem; color: #334155;
            backdrop-filter: blur(8px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); pointer-events: none;
            font-weight: 500;
        }

        /* Ｑ版毛玻璃質感資訊面板 */
        .info-panel {
            position: absolute; top: 110px; right: 35px; width: 420px;
            background: rgba(255, 255, 255, 0.92); border: 1px solid rgba(191, 219, 254, 0.8);
            border-radius: 24px; padding: 30px; z-index: 20; backdrop-filter: blur(20px);
            box-shadow: 0 25px 50px rgba(0,0,0,0.15); display: none; color: #1e293b;
            animation: panelIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes panelIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .info-panel h2 { color: #2563eb; font-size: 1.4rem; margin-bottom: 12px; font-weight: 700; }
        .info-panel p { color: #475569; font-size: 0.92rem; line-height: 1.7; margin-bottom: 12px; }
        .info-panel ul { padding-left: 18px; color: #334155; font-size: 0.9rem; margin-bottom: 15px; }
        .info-panel li { margin-bottom: 8px; }
        
        .close-panel {
            position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.05); 
            border: none; color: #64748b; width: 32px; height: 32px; border-radius: 50%;
            font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
        }
        .close-panel:hover { background: rgba(0,0,0,0.1); color: #0f172a; }
        
        .btn-link {
            display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white; padding: 10px 18px; border-radius: 12px; text-decoration: none;
            font-size: 0.9rem; font-weight: 500; margin-top: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transition: all 0.2s;
        }
        .btn-link:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5); }
        code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #2563eb; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="ui-header">
        <h1>🦅 炎鷲橙果島 (Flame-Eagle Orange-Fruit Island)</h1>
        <p>可愛清新 3D 沈浸式學術與 AI 生態系</p>
    </div>
    
    <div class="ui-hint">💡 操作提示：滑鼠拖曳旋轉視角、滾輪縮放；<strong>點擊 3D 建築物</strong>開啟詳細探索面板！</div>
    
    <div id="infoPanel" class="info-panel">
        <button class="close-panel" onclick="closeInfo()">×</button>
        <div id="panelContent"></div>
    </div>
    
    <div id="canvas-container"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x1e293b, 0.025);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 18, 26);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // --- 柔和溫暖光影 ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        
        const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.2);
        dirLight.position.set(15, 25, 15);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const pinkLight = new THREE.PointLight(0xf472b6, 2, 30);
        pinkLight.position.set(-5, 5, -5);
        scene.add(pinkLight);

        // --- Ｑ版清新島嶼基底 ---
        const islandGeo = new THREE.CylinderGeometry(11, 9.5, 2.2, 32);
        const islandMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.6, metalness: 0.1 }); // 清新草綠
        const island = new THREE.Mesh(islandGeo, islandMat);
        island.position.y = -1.1;
        island.receiveShadow = true;
        scene.add(island);

        // 島嶼底部土壤層 (層疊蛋糕風)
        const dirtGeo = new THREE.CylinderGeometry(9.5, 9, 1.5, 32);
        const dirtMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
        const dirt = new THREE.Mesh(dirtGeo, dirtMat);
        dirt.position.y = -2.4;
        scene.add(dirt);

        // --- 建立具象化可愛建築群的函式庫 ---
        const interactiveObjects = [];

        function createBuildingGroup(data) {
            const group = new THREE.Group();
            group.position.set(data.pos[0], data.pos[1], data.pos[2]);
            group.userData = { content: data.content, originalY: data.pos[1], originalX: data.pos[0], originalZ: data.pos[2] };

            if (data.id === 'hub') {
                // 🌋 島主觀測站：變成Ｑ版魔法水晶塔
                const baseGeo = new THREE.CylinderGeometry(1.2, 1.5, 1.8, 16);
                const baseMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
                const base = new THREE.Mesh(baseGeo, baseMat);
                base.castShadow = true;
                group.add(base);

                const crystalGeo = new THREE.OctahedronGeometry(1);
                const crystalMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.1, emissive: 0x1d4ed8, emissiveIntensity: 0.5 });
                const crystal = new THREE.Mesh(crystalGeo, crystalMat);
                crystal.position.y = 1.8;
                crystal.castShadow = true;
                group.add(crystal);
            } 
            else if (data.id === 'papers') {
                // 📚 學術殿堂：變成童話風精靈藏書閣 (小屋 + 屋頂)
                const houseGeo = new THREE.BoxGeometry(2.2, 1.8, 2.2);
                const houseMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 }); // 奶油色牆壁
                const house = new THREE.Mesh(houseGeo, houseMat);
                house.position.y = 0.9;
                house.castShadow = true;
                group.add(house);

                const roofGeo = new THREE.ConeGeometry(1.8, 1.4, 4);
                const roofMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }); // 亮紅色可愛屋頂
                const roof = new THREE.Mesh(roofGeo, roofMat);
                roof.position.y = 2.5;
                roof.rotation.y = Math.PI / 4;
                roof.castShadow = true;
                group.add(roof);
            } 
            else if (data.id === 'systems') {
                // ⚡ 實踐工坊：變成冒煙的橙果科技工坊
                const facGeo = new THREE.BoxGeometry(2.4, 2, 2.2);
                const facMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.4 }); // 清新粉藍牆壁
                const fac = new THREE.Mesh(facGeo, facMat);
                fac.position.y = 1;
                fac.castShadow = true;
                group.add(fac);

                const chimneyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 12);
                const chimneyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 }); // 橙色煙囪
                const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
                chimney.position.set(0.7, 2.2, 0);
                group.add(chimney);
            } 
            else if (data.id === 'synergy') {
                // 🔗 知識協作網：變成雙環交織的知識能量泉源
                const ring1Geo = new THREE.TorusGeometry(1.2, 0.2, 16, 32);
                const ringMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.2, emissive: 0x6d28d9, emissiveIntensity: 0.4 });
                const ring1 = new THREE.Mesh(ring1Geo, ringMat);
                ring1.position.y = 1;
                ring1.rotation.x = Math.PI / 3;
                group.add(ring1);
            }

            scene.add(group);
            interactiveObjects.push(group);
        }

        const buildingsData = [
            {
                id: 'hub', pos: [0, 0, 0],
                content: '<h2>🌋 島主觀測站</h2><p><strong>炎鷲橙果島</strong> 結合深層語言學研究、計量句法分析（MDD）與前線 AI 應用。</p><ul><li><strong>學術基石</strong>：依存距離、南島語句法。</li><li><strong>系統落地</strong>：3 大線上智慧檢測平台。</li></ul>'
            },
            {
                id: 'papers', pos: [-4.2, 0, -2.5],
                content: '<h2>📚 學術殿堂：研究著作</h2><p>收錄於 <code>01 學術研究/00 研究成果島/01 論文</code>：</p><p><strong>1. 華語文評量材料句法複雜度與自動檢測</strong></p><p style="font-size:0.85rem; color:#64748b; margin-top:5px;">核心指標：依存距離 (DD)、平均依存距離 (MDD)、最大依存距離 (MaxDD)。</p>'
            },
            {
                id: 'systems', pos: [4.2, 0, -2.5],
                content: '<h2>⚡ 實踐工坊：線上應用系統</h2><p>學術理論轉化為生產力工具的現場：</p><p style="margin-top:8px;"><strong>1. AI 華語文句法難度自動檢測</strong></p><a href="https://twmddanalyzer.streamlit.app/" target="_blank" class="btn-link">🚀 啟動檢測系統</a><p style="margin-top:12px;"><strong>2. 自動語音轉文字與語料庫分析</strong></p><a href="https://twpoliticolstt.streamlit.app/" target="_blank" class="btn-link">🚀 啟動分析系統</a><p style="margin-top:12px;"><strong>3. 台灣中小學英語測驗單字頻率檢索</strong></p><a href="https://twvocfreqexam.streamlit.app/" target="_blank" class="btn-link">🚀 啟動檢索系統</a>'
            },
            {
                id: 'synergy', pos: [0, 0, 4.2],
                content: '<h2>🔗 知識協作網：研發閉環</h2><p>理論轉化為前端工具的演化脈絡與知識架構。</p>'
            }
        ];

        buildingsData.forEach(data => createBuildingGroup(data));

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
                while (obj.parent && !obj.userData.content) {
                    obj = obj.parent;
                }
                if (obj.userData.content) {
                    document.getElementById('panelContent').innerHTML = obj.userData.content;
                    document.getElementById('infoPanel').style.display = 'block';
                    smoothCameraMove(obj.userData.originalX * 0.7, obj.userData.originalZ * 0.7 + 14);
                }
            }
        });

        function closeInfo() { document.getElementById('infoPanel').style.display = 'none'; }

        let targetCamX = 0, targetCamZ = 26;
        function smoothCameraMove(x, z) {
            targetCamX = x;
            targetCamZ = z;
        }

        // --- 動態渲染迴圈 ---
        let clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            let t = clock.getElapsedTime();

            // 島嶼與建築輕柔呼吸浮動
            island.position.y = -1.1 + Math.sin(t * 1.5) * 0.08;
            dirt.position.y = island.position.y - 1.3;

            interactiveObjects.forEach((group, idx) => {
                group.position.y = group.userData.originalY + Math.sin(t * 2 + idx) * 0.05;
            });

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
