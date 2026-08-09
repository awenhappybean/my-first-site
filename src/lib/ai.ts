import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `你是一位專業的 BNI（商務引薦組織）分會顧問助理。
你的任務是閱讀一段一對一會談的逐字稿（或會談筆記），並整理出一份「有目的性」的摘要，
幫助分會幹部快速掌握重點、找到可轉介的機會，並知道下一步該做什麼。

請用繁體中文，以下列 Markdown 結構輸出，內容精簡但具體：

## 對方摘要
（對方的產業、專長、目前事業重點，2-3 句話）

## 核心需求 / 痛點
（條列 2-4 點）

## 可轉介 / 合作機會
（條列：有哪些人脈、客戶輪廓、產業適合轉介給對方，或對方能提供什麼給分會夥伴）

## 待跟進事項
（條列具體的下一步行動，包含建議時程）

## 課程 / 資源推薦
（如果內容中提到對方可能需要的課程、工具或資源，請列出；若無則寫「無」）

不要編造逐字稿中沒有的資訊，如果某個項目缺乏資訊，請寫「資料不足」。`;

export async function generateMeetingSummary(params: {
  contactName: string;
  company?: string | null;
  industry?: string | null;
  transcript: string;
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "尚未設定 ANTHROPIC_API_KEY，請在環境變數中加入才能使用 AI 摘要功能"
    );
  }

  const client = new Anthropic({ apiKey });

  const userContent = `以下是與「${params.contactName}」${
    params.company ? `（${params.company}）` : ""
  }${params.industry ? `，產業別：${params.industry}` : ""} 的一對一會談逐字稿：

---
${params.transcript}
---

請依照系統指示整理成摘要。`;

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}
