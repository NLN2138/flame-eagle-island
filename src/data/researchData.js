export const researchModules = {
  theory: {
    id: "01",
    code: "MODULE 01 · 理論基石",
    title: "理論語言學與南島語研究殿堂",
    shortTitle: "理論語言學與南島語",
    icon: "🏛️",
    color: "#e05a47",
    position: [-5.2, 0, -3.2],
    summary: "探討人類語言底層結構、生成語法與句法語意介面，深入解析臺灣南島語之省略機制與左緣結構。",
    quote: "「從形式句法與類型學視角，解構南島語與漢語中看不見卻決定語意的深層語法結構。」",
    stats: { itemsCount: "10 項著作", synergyCount: "2 條協作" },
    synergyWith: ["02 計量與語料庫研究中心", "04 前線 AI 應用與實踐工坊"],
    categories: [
      {
        name: "學位論文與理論專著",
        list: [
          "限定詞組省略理論研究：從南島語觀點出發 (Toward a Theory of DP Ellipsis: A Formosan Perspective)",
          "疑問詞問句及其左緣結構之研究 (Left Periphery and Wh-questions)"
        ]
      },
      {
        name: "南島語與漢語形式句法研究",
        list: [
          "南島語限定詞組省略之類型與參數研究 (Typology and parameter: DP ellipsis)",
          "論元省略與語法島修復機制研究 (Is island 'repairable'? Argument drop study)",
          "篇章指涉與論旨角色指派機制 (Discourse Reference and Theta-role Assignment)",
          "空代名詞之分布與指涉特性研究 (Distribution and reference of empty pronoun)",
          "兩類空範疇之跨語言比較研究 (Two types of empty categories: A comparative study)",
          "受事控制結構之最簡方案分析 (Two types of object control: A minimalist perspective)",
          "漢語疑問感嘆句之製圖理論分析 (Wh-exclamative constructions: A cartographic approach)",
          "南島語數詞系統之句法結構分析 (Numerals syntax system analysis)"
        ]
      }
    ]
  },
  corpus: {
    id: "02",
    code: "MODULE 02 · 實證計量",
    title: "計量句法、語音與語料庫研究中心",
    shortTitle: "計量句法與語料庫",
    icon: "📊",
    color: "#2b7a78",
    position: [5.2, 0, -3.2],
    summary: "運用大規模口語與學習者語料庫，結合依存距離（MDD）與統計建模，剖析語音變異、習得偏誤與詞彙常模。",
    quote: "「讓真實語料說話：從自由變異到偏誤類型，建立客觀可驗證的語言計量指標。」",
    stats: { itemsCount: "13 項研究", synergyCount: "3 條協作" },
    synergyWith: ["01 理論語言學殿堂", "03 社會政策智庫", "04 前線 AI 應用與實踐工坊"],
    categories: [
      {
        name: "語音變異與學習者語料庫期刊論文",
        list: [
          "標準之外的聲音：從語料庫證據反思華語語音教學與語言規範",
          "華語學習者語料庫語音偏誤研究：以不送氣舌尖後翹舌音、舌根鼻音和輕聲為例（THCI 第一級）",
          "華語自由變異的類型和趨勢：基於語音語料庫的研究（THCI 第一級）",
          "基於華語學習者語料庫之疑問詞「怎麼（樣）」偏誤分析（THCI 第一級）",
          "華語學習者輕聲偏誤及其潛在變項之相關性研究"
        ]
      },
      {
        name: "計量句法、聲調變異與字頻實證會議論文",
        list: [
          "語音習得之層次非對稱性：母語背景對鼻韻尾、輕聲與音韻規則的調節作用",
          "初探華語文評量材料句法複雜度與自動檢測系統建置",
          "華語自由聲調變異之實證與語料庫研究 (Free tonal variation: Empirical & corpus-based studies)",
          "人群中悄然演變的聲音：基於口語語料庫之音變分析 (Sound gradually changes in the crowd)",
          "是偏誤？還是變異？華語文教育語言規範新視角",
          "初探華語的「變」與「不變」：基於語料庫的語音研究",
          "英語學習者口語詞彙表建置與課綱字彙表改進建議 (Making a spoken word list for EFL learners)",
          "科普專論：基於語料庫的一字多音研究、口語語料庫對英語學習的啟示"
        ]
      }
    ]
  },
  policy: {
    id: "03",
    code: "MODULE 03 · 政策治理",
    title: "社會語言學與教育政策智庫",
    shortTitle: "社會語言學與政策智庫",
    icon: "🏫",
    color: "#3a86ff",
    position: [-4.8, 0, 3.8],
    summary: "結合語料庫輔助批評論述分析（CADS）與跨國教育制度比較，探討議會政治言談、教科書詞彙與多語教育政策。",
    quote: "「連結語言證據與公共治理：從課綱教科書體檢到國際多語教育借鑑。」",
    stats: { itemsCount: "13 項研究", synergyCount: "2 條協作" },
    synergyWith: ["02 計量與語料庫研究中心", "04 前線 AI 應用與實踐工坊"],
    categories: [
      {
        name: "教育政策與教科書研究期刊論文",
        list: [
          "高中公民與社會教科書學術詞彙之比較研究（TSSCI 第二級）",
          "中小學營養午餐政策研究：現況、挑戰與國際借鑑",
          "多語教育怎麼「行」！？以歐洲三語學校的推動經驗為例",
          "他山之石：歐美國家語言教育政策趨勢"
        ]
      },
      {
        name: "政治言談分析（CADS）與跨國政策比較",
        list: [
          "以言建國：地方議會辯論之語料庫輔助批評論述分析 (Nationhood by words: CADS of council debates)",
          "地方議會政治言談中的問句句式與評價性修辭分析",
          "地方議會政治言談中的國族指涉詞：詞頻分布、共變模式與主體定位分析",
          "東南亞與本土中小學英語教育政策之跨國比較",
          "新舊課綱高中社會領域教科書對比分析：語料庫為本之研究",
          "邁向多語共融的永續未來：歐亞雙語及多語教育政策比較研究",
          "穩健邁向未來：歐洲英語教育對本土雙語教育的啟示",
          "校園防疫治理經驗與啟示 (How schools combat against pandemic)",
          "政策科普評論：本土語言走出校園孤島、社會教科書用語體檢、小學英語教科書與飲食教育跨國比較"
        ]
      }
    ]
  },
  systems: {
    id: "04",
    code: "MODULE 04 · 系統落地",
    title: "前線 AI 應用與實踐工坊",
    shortTitle: "前線 AI 應用工坊",
    icon: "⚡",
    color: "#f59e0b",
    position: [4.8, 0, 3.8],
    summary: "將依存句法複雜度演算法（MDD）、語音辨識轉寫技術與測驗字頻常模，轉化為可即時互動的三大線上 AI 系統。",
    quote: "「從理論建模到程式實作，打造服務教育現場與研究社群的智慧化開源工具。」",
    stats: { itemsCount: "3 座線上系統", synergyCount: "3 條協作" },
    synergyWith: ["01 理論語言學殿堂", "02 計量與語料庫研究中心", "03 社會政策智庫"],
    isSystems: true,
    links: [
      {
        name: "🤖 AI 華語文句法難度自動檢測系統",
        desc: "基於依存距離（DD）、平均依存距離（MDD）與最大依存距離之自動文本複雜度診斷平台。",
        tag: "句法演算",
        url: "https://twmddanalyzer.streamlit.app/"
      },
      {
        name: "🎙️ 自動語音轉文字與語料庫分析系統",
        desc: "整合高精度語音辨識（STT）、斷詞標註與政治/口語語料庫共現檢索之自動化分析工具。",
        tag: "語音語料",
        url: "https://twpoliticolstt.streamlit.app/"
      },
      {
        name: "📊 中小學英語測驗單字頻率檢索系統",
        desc: "串接歷屆大型英語測驗與課綱字表常模，提供教育工作者與命題者即時詞頻診斷服務。",
        tag: "詞頻常模",
        url: "https://twvocfreqexam.streamlit.app/"
      }
    ]
  }
};
