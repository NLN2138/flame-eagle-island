import streamlit as st

# 1. 頁面基本設定
st.set_page_config(
    page_title="炎鷲橙果島 - 知識與實踐生態系",
    page_icon="🦅",
    layout="wide"
)

# 2. 側邊欄：身分切換與導覽
st.sidebar.title("🦅 炎鷲橙果島導覽")
st.sidebar.markdown("---")

visitor_role = st.sidebar.selectbox(
    "請選擇您的訪客身分（將為您高亮推薦內容）：",
    ["🎓 學術同行 / 研究人員", "🏫 華語與英語教師", "💻 軟體開發 / 科技大眾", "🌐 一般訪客"]
)

st.sidebar.markdown("---")
page = st.sidebar.radio(
    "選擇島嶼區域：",
    ["🏠 島嶼大廳 (Home)", "📚 學術殿堂 (Research Papers)", "⚡ 實踐工坊 (Online Systems)", "🗺️ 知識協作網 (Synergy)"]
)

# 3. 頁面內容實作
if page == "🏠 島嶼大廳 (Home)":
    st.title("歡迎來到 🌟 炎鷲橙果島")
    st.markdown("### 融合「深層學術研究」與「前瞻AI應用」的知識探索地標")
    
    st.info(f"✨ 目前導覽模式已針對 **{visitor_role}** 進行最佳化推薦！")
    
    col1, col2, col3 = st.columns(3)
    col1.metric("核心期刊論文與著作", "精選典藏中", "涵蓋句法與南島語")
    col2.metric("在線運行智慧系統", "3 大系統", "即時互動與檢測")
    col3.metric("語料處理規模", "140+ 萬字", "臺灣中小學真實語料")
    
    st.markdown("---")
    st.subheader("島主的話")
    st.write("本島致力於將語言學理論、句法複雜度研究與大數據應用結合，轉化為大眾與教育工作者能實際操作的線上智慧工具。請從側邊欄探索各個區域！")

elif page == "📚 學術殿堂 (Research Papers)":
    st.title("📚 學術殿堂：研究著作與期刊論文")
    st.markdown("存放於 **`01 學術研究/00 研究成果島/01 論文`** 的核心研究結晶：")
    
    with st.expander("📄 華語文評量材料句法複雜度與自動檢測系統研究"):
        st.write("**核心指標**：依存距離 (DD)、平均依存距離 (MDD)、最大依存距離 (MaxDD)、複句標準化頻率。")
        st.write("**摘要簡述**：探討臺灣中小學評量試卷語料，結合依存句法理論與自動化演算法，量化文本之認知負荷與結構難度。")
        st.markdown("[查看對應線上系統 ➔](https://twmddanalyzer.streamlit.app/)")

    with st.expander("📄 南島語句法與限定詞組省略理論研究 (如 Saisiyat 語法)"):
        st.write("**核心領域**：臺灣南島語、句法學、生成語法、空代名詞 (Empty Categories)。")
        st.write("**摘要簡述**：從臺灣南島語觀點出發，探討 DP 省略、島嶼效應與微型化語法架構的互動機制。")

elif page == "⚡ 實踐工坊 (Online Systems)":
    st.title("⚡ 實踐工坊：線上應用系統")
    st.markdown("將學術理論轉化為生產力工具的現場，歡迎直接點擊體驗：")

    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 1. 🤖 AI 華語文句法難度自動檢測系統")
        st.write("輸入華語文句子，即時分析句法複雜度與依存距離。")
        st.markdown("[🔗 點此前往應用系統](https://twmddanalyzer.streamlit.app/)")
        
        st.markdown("### 2. 🎙️ 自動語音轉文字與語料庫分析系統")
        st.write("結合語音辨識、清洗降噪與自動化語料庫建置技術。")
        st.markdown("[🔗 點此前往應用系統](https://twpoliticolstt.streamlit.app/)")

    with col2:
        st.markdown("### 3. 📊 台灣中小學英語測驗單字頻率檢索系統")
        st.write("大數據支援的英語教育字頻檢索與試卷分析工具。")
        st.markdown("[🔗 點此前往應用系統](https://twvocfreqexam.streamlit.app/)")

elif page == "🗺️ 知識協作網 (Synergy)":
    st.title("🗺️ 知識協作網：理論到應用的閉環")
    st.markdown("在這裡，您可以看見學術研究如何一步步萌芽並長成線上工具：")
    st.code("""
[ 語言學理論 & 依存句法研究 ] (存放於 01 論文)
         │
         ▼ 演算法與指標建模 (MDD / MaxDD)
[ 核心研究成果轉化 ]
         ├──► 🤖 AI 華語文句法難度檢測系統
         ├──► 🎙️ 自動語音轉文字與語料庫系統
         └──► 📊 英語測驗單字頻率檢索系統
    """, language="text")

st.markdown("---")
st.markdown("<p style='text-align: center; color: gray;'>© 2026 炎鷲橙果島 (Flame-Eagle Orange-Fruit Island) | Designed for YMC</p>", unsafe_allow_html=True)
