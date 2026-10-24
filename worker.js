export default {
  async fetch(request, env, ctx) {
    // HTML 內容直接包在 Worker 內，確保 100% 穩定回傳
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>炎鷲橙果島 - 3D 沈浸式學術與 AI 應用生態系</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Noto Sans TC', sans-serif; }
        body, html { width: 100%; height: 100%; overflow: hidden; background: #090d16; color: #f8fafc; }
        #canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1; }
        .ui-header {
            position: absolute; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10;
            text-align: center; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(59, 130, 246, 0.3);
            padding: 12px 25px; border-radius: 30px; backdrop-filter: blur(10px);
        }
        .ui-header h1 { font-size: 1.4rem; color: #60a5fa; letter-spacing: 1px; }
        .ui-header p { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
        .ui-hint {
            position: absolute; bottom: 25px; left: 50%; transform: translateX(-50%); z-index: 10;
            background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(148, 163, 184, 0.2);
            padding: 10px 20px; border-radius: 20px; font-size: 0.85rem; color: #cbd5e1;
        }
        .info-panel {
            position: absolute; top: 100px; right: 30px; width: 380px;
            background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(59, 130, 246, 0.4);
            border-radius: 16px; padding: 25px; z-index: 20; backdrop-filter: blur(12px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.6); display: none;
        }
        .info-panel h2 { color: #60a5fa; font-size: 1.3rem; margin-bottom: 10px; }
        .info-panel p { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 12px; }
        .info-panel ul { padding-left: 18px; color: #cbd5e1; font-size: 0.88rem; margin-bottom: 15px; }
        .info-panel li { margin-bottom: 6px; }
        .close-panel {
            position: absolute; top: 15px; right: 15px; background: none; border: none;
            color: #94a3b8; font-size: 1.4rem; cursor: pointer;
        }
        .close-panel:hover { color: white; }
        .btn-link {
            display: inline-block; background: #3b82f6; color: white; padding: 8px 16px;
            border-radius: 8px; text-decoration: none; font-size: 0.88rem; font-weight: 500; margin-top: 5px;
        }
        .btn-link:hover { background: #2563eb; }
    </style>
</head>
<body>
    <div class="ui-header">
        <h1>🦅 炎鷲橙果島 (Flame-Eagle Orange-Fruit Island)</h1>
        <p>3D 互動學術研究與 AI 應用生態系</p>
    </div>
    <div class="ui-hint">💡 操作提示：滑鼠可拖曳旋轉 3D 視角、滾輪縮放；<strong>點擊島上 3D 建築物</strong>以探索內容！</div>
    <div id="infoPanel" class="info-panel">
        <button class="close-panel" onclick="closeInfo()">×</button>
        <div id="panelContent"></div>
    </div>
    <div id="canvas-container"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x090d16, 0.035);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 18, 24);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dirLight = new THREE.DirectionalLight(0x60a5fa, 1.2);
        dirLight.position.set(15, 25, 15);
        scene.add(dirLight);

        const interactiveObjects = [];
        const islandGeo = new THREE.CylinderGeometry(10, 8, 2, 6);
        const islandMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
        const island = new THREE.Mesh(islandGeo, islandMat);
        island.position.y = -1;
        scene.add(island);

        const ringGeo = new THREE.RingGeometry(9.9, 10.2, 6);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.01;
        scene.add(ring);

        const buildingsData = [
            {
                id: 'hub', name: '🌋 島主觀測站', color: 0x3b82f6, pos: [0, 0.8, 0], size: [2.5, 2, 2.5], shape: 'cylinder',
                content: '<h2>🌋 島主觀測站</h2><p><strong>炎鷲橙果島</strong> 結合深層語言學研究、計量句法分析（MDD）與前線 AI 應用。</p><ul><li><strong>學術基石</strong>：依存距離、南島語句法。</li><li><strong>系統落地</strong>：3 大線上智慧檢測平台。</li></ul>'
            },
            {
                id: 'papers', name: '📚 學術殿堂', color: 0x10b981, pos: [-4, 1, -2], size: [2.2, 2.5, 2.2], shape: 'box',
                content: '<h2>📚 學術殿堂：研究著作</h2><p>收錄於 <code>01 學術研究/00 研究成果島/01 論文</code>：</p><p><strong>1. 華語文評量材料句法複雜度與自動檢測</strong></p><p style="font-size:0.82rem; color:#94a3b8;">核心指標：依存距離 (DD)、平均依存距離 (MDD)。</p>'
            },
            {
                id: 'systems', name: '⚡ 實踐工坊', color: 0xf59e0b, pos: [4, 1, -2], size: [2.2, 2.8, 2.2], shape: 'box',
                content: '<h2>⚡ 實踐工坊：線上應用系統</h2><p style="margin-top:6px;"><strong>1. AI 華語文句法難度自動檢測</strong></p><a href="https://twmddanalyzer.streamlit.app/" target="_blank" class="btn-link">🚀 啟動檢測系統</a><p style="margin-top:10px;"><strong>2. 自動語音轉文字與語料庫分析</strong></p><a href="https://twpoliticolstt.streamlit.app/" target="_blank" class="btn-link">🚀 啟動分析系統</a>'
            },
            {
                id: 'synergy', name: '🔗 知識協作網', color: 0x8b5cf6, pos: [0, 0.6, 4], size: [2, 1.2, 2], shape: 'box',
                content: '<h2>🔗 知識協作網：研發閉環</h2><p>理論轉化為前端工具的演化脈絡。</p>'
            }
        ];

        buildingsData.forEach(data => {
            let geo = data.shape === 'cylinder' ? new THREE.CylinderGeometry(data.size[0]/2, data.size[0]/2, data.size[1], 16) : new THREE.BoxGeometry(data.size[0], data.size[1], data.size[2]);
            const mat = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.3 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);
            mesh.userData = { content: data.content, originalY: data.pos[1] };
            scene.add(mesh);
            interactiveObjects.push(mesh);
        });

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        window.addEventListener('click', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(interactiveObjects);
            if (intersects.length > 0) {
                document.getElementById('panelContent').innerHTML = intersects[0].object.userData.content;
                document.getElementById('infoPanel').style.display = 'block';
            }
        });

        function closeInfo() { document.getElementById('infoPanel').style.display = 'none'; }

        let clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            let t = clock.getElapsedTime();
            island.position.y = -1 + Math.sin(t * 1.5) * 0.15;
            ring.position.y = island.position.y + 1.01;
            renderer.render(scene, camera);
        }
        animate();
    </script>
</body>
</html>`;

    return new Response(htmlContent, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  },
};
