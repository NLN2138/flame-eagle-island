import streamlit as st

# 1. 頁面基本設定
st.set_page_config(
    page_title="炎鷲橙果島 - 互動知識與應用島嶼",
    page_icon="🦅",
    layout="wide"
)

# 自訂 CSS 營造沈浸式科技島嶼風格
st.markdown("""
    <style>
    .island-header {
        background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
        padding: 30px;
        border-radius: 15px;
        color: white;
        text-align: center;
        margin-bottom: 25px;
    }
    .island-header h1 {
        margin: 0;
        font-size: 2.5rem;
    }
    .island-header p {
        margin-top: 10px;
        font-size: 1.1rem;
        opacity: 0.9;
    }
    </style>
""", unsafe_allow_html=True)

# 2. 頂部島嶼橫幅
st.markdown("""
    <div class="island-header">
        <h1>🦅 炎鷲橙果島 (Flame-Eagle Orange-Fruit Island)</h1>
        <p>探索語言學深層理論與前線 AI 應用系統的數位沈浸式島嶼</p>
    </div>
""", unsafe_allow_html=True)

# 3. 側邊欄：互動島嶼導覽與身分適配
st.sidebar.title("🗺️ 島嶼導航羅盤")
visitor_role = st.sidebar.selectbox(
    "選擇您的探索身分：",
    ["🎓 學術同行 / 研究人員", "🏫 華語與英語教育工作者", "💻 AI 系統開發者", "🌐 一般訪客"]
)

st.sidebar.markdown("---")
island_zone = st.sidebar.radio(
    "選擇要傳送到的島嶼區域：",
    ["🌋 島嶼大廳 (Overview)", "📚 區域一：學術殿堂 (Papers)", "⚡ 區域二：實踐工坊 (Online Systems)", "🔗 區域三：知識協作網 (Synergy)"]
)

st.sidebar.markdown("---")
st.sidebar.info("🔒 **去識別化與隱私防護**：本島展示之所有研究著作與線上工具均經過嚴格合規與去識別化處理。")

# 4. 區域內容邏輯
if island_zone == "🌋 島嶼大廳 (Overview)":
    st.subheader("🌟 歡迎登陸炎鷲橙果島")
    st.write(f"系統已為您切換至 **{visitor_role}** 的專屬導覽視角。本島將您的學術研究結晶與 3 大線上智慧系統完美交織，提供如互動展覽般的探索體驗。")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("核心學術資產", "期刊論文與專書", "涵蓋句法與南島語")
    with col2:
        st.metric("運行中 AI 系統", "3 大線上平台", "支援即時互動檢測")
    with col3:
        st.metric("大數據語料規模", "140+ 萬字", "臺灣中小學真實試卷")

    st.markdown("---")
    st.markdown("### 🗺️ 島嶼地貌一覽")
    col_a, col_b = st.columns(2)
    with col_a:
        st.info("📚 **學術殿堂**：存放依存句法、MDD 複雜度指標與南島語研究論文。")
        st.info("⚡ **實踐工坊**：提供華語難度檢測、語音轉錄、英語字頻檢索等線上工具。")
    with col_b:
        st.info("🔗 **知識協作網**：展示從理論模型催生實務應用系統的演化脈絡。")

elif island_zone == "📚 區域一：學術殿堂 (Papers)":
    st.title("📚 學術殿堂：研究著作與發表清單")
    st.markdown("此區展示存放於 `01 學術研究/00 研究成果島/01 論文` 之核心學術成果：")

    with st.expander("📄 1. 華語文評量材料句法複雜度與自動檢測系統研究"):
        st.markdown("""
        * **研究領域**：計量語言學、計算語言學、智慧教育
        * **核心指標**：依存距離 (DD)、平均依存距離 (MDD)、最大依存距離 (MaxDD)、複句標準化頻率
        * **摘要簡述**：蒐集臺灣中小學評量試卷語料（約140萬字），結合依存句法與演算法，量化文本之認知負荷。
        * **對應系統**：[AI 華語文句法難度自動檢測系統](https://twmddanalyzer.streamlit.app/)
        """)

    with st.expander("📄 2. 南島語句法與限定詞組省略理論研究 (以 Saisiyat 為例)"):
        st.markdown("""
        * **研究領域**：理論語言學、臺灣南島語
        * **核心主題**：生成語法、空代名詞 (Empty Categories)、DP 省略、島嶼效應
        * **摘要簡述**：從南島語觀點出發，探討 DP 省略與微型化語法架構的互動機制，深化跨語言比較研究。
        """)

elif island_zone == "⚡ 區域二：實踐工坊 (Online Systems)":
    st.title("⚡ 實踐工坊：線上應用系統中心")
    st.markdown("歡迎直接點擊下方卡片，體驗將學術理論化為生產力工具的現場：")

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("### 🤖 AI 華語文句法難度自動檢測系統")
        st.write("即時分析華語句子之依存距離與認知負荷。")
        st.markdown("[🔗 啟動應用系統](https://twmddanalyzer.streamlit.app/)")
        
        st.markdown("---")
        
        st.markdown("### 🎙️ 自動語音轉文字與語料庫分析系統")
        st.write("結合語音辨識、清洗降噪與語料庫建置。")
        st.markdown("[🔗 啟動應用系統](https://twpoliticolstt.streamlit.app/)")

    with col2:
        st.markdown("### 📊 台灣中小學英語測驗單字頻率檢索")
        st.write("大數據支援的英語教育字頻檢索與試卷分析工具。")
        st.markdown("[🔗 啟動應用系統](https://twvocfreqexam.streamlit.app/)")

elif island_zone == "🔗 區域三：知識協作網 (Synergy)":
    st.title("🔗 知識協作網：理論與應用的閉環")
    st.markdown("透過動態節點架構，呈現本島學術研究如何轉化為前端應用：")

    st.code("""
[ 基礎語言學理論 & 句法複雜度研究 ] (存放於 01 論文)
         │
         ▼ 演算法建模與指標提取 (MDD / MaxDD / 語料清洗)
[ 核心知識轉化與系統實作 ]
         ├──► 🤖 AI 華語文句法難度檢測系統
         ├──► 🎙️ 自動語音轉文字與語料庫系統
         └──► 📊 台灣中小學英語測驗單字頻率檢索系統
    """, language="text")

# 5. 頁尾聲明
st.markdown("---")
st.markdown("<p style='text-align: center; color: gray;'>© 2026 炎鷲橙果島 (Flame-Eagle Orange-Fruit Island) | Designed for Interactive Academic Showcase</p>", unsafe_allow_html=True)
