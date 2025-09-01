import type { PlagiarismAnalysis, GroundingSource } from '../types';

// Khai báo interface cho API được expose từ preload script
declare global {
  interface Window {
    electronAPI: {
      getApiKey: () => Promise<string | undefined>;
    }
  }
}

let ai: any = null;

// Hàm để lấy instance của AI client, khởi tạo nếu cần
const getAiInstance = async (): Promise<any> => {
  if (ai) {
    return ai;
  }
  
  // Lấy API key từ main process thông qua preload script
  const apiKey = await window.electronAPI.getApiKey();

  if (!apiKey) {
    throw new Error("API key không được cấu hình. Vui lòng đặt biến môi trường API_KEY khi chạy ứng dụng.");
  }

  // Dynamic import để tránh bundling issues
  const { GoogleGenAI } = await import("@google/genai");
  ai = new GoogleGenAI({ apiKey });
  return ai;
};


const parseJsonResponse = (text: string): PlagiarismAnalysis | null => {
  const match = text.match(/```json\n([\s\S]+?)\n```/);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (
        !parsed.plagiarizedSentences ||
        !Array.isArray(parsed.plagiarizedSentences) ||
        !parsed.plagiarizedSentences.every((s: any) => 
          typeof s.sentence === 'string' &&
          typeof s.source === 'string' &&
          (s.sourceType === 'WEB' || s.sourceType === 'AI')
        )
      ) {
        console.error("Parsed JSON does not match expected PlagiarismAnalysis structure:", parsed);
        return null;
      }
      return parsed as PlagiarismAnalysis;
    } catch (e) {
      console.error("Failed to parse JSON from response:", e);
      return null;
    }
  }
  console.error("Could not find JSON block in response text.");
  return null;
};

export const checkPlagiarism = async (text: string): Promise<{ result: PlagiarismAnalysis | null, sources: GroundingSource[] }> => {
  const prompt = `
HỆ THỐNG: Bạn là một công cụ phân tích văn bản AI tinh vi. Nhiệm vụ của bạn là phân tích tỉ mỉ văn bản dưới đây để xác định hai loại nội dung:
1. Các câu/đoạn văn sao chép từ các nguồn trên internet.
2. Các câu/đoạn văn có dấu hiệu được tạo ra bởi một mô hình ngôn ngữ AI (ví dụ: GPT, Gemini, Copilot).

Để phát hiện nội dung do AI tạo, hãy chú ý đến các đặc điểm như: văn phong quá mượt mà, thiếu giọng văn cá nhân, các ví dụ chung chung, hoặc ngữ pháp hoàn hảo một cách bất thường.

Sau khi phân tích, bạn BẮT BUỘC phải trả lời CHỈ bằng một đối tượng JSON nằm trong khối markdown \`\`\`json. Không thêm bất kỳ văn bản nào trước hoặc sau khối JSON.

Đối tượng JSON phải có cấu trúc sau:
- \`plagiarizedSentences\`: Một mảng các đối tượng, mỗi đối tượng có:
  - \`sentence\`: Câu hoặc đoạn văn chính xác từ văn bản gốc bị gắn cờ.
  - \`sourceType\`: Loại nguồn, là 'WEB' cho các nguồn internet hoặc 'AI' cho nội dung do AI tạo.
  - \`source\`: URL của nguồn có khả năng nhất nếu \`sourceType\` là 'WEB'. Nếu \`sourceType\` là 'AI', hãy ghi "Nội dung có thể do AI tạo".

Văn bản cần phân tích:
\`\`\`
${text}
\`\`\`
`;
  try {
    const localAi = await getAiInstance();
    const response: any = await localAi.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const analysisResult = parseJsonResponse(response.text);
    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { result: analysisResult, sources: groundingSources };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("API key không được cấu hình")) {
      throw error;
    }
    throw new Error("Đã xảy ra lỗi khi giao tiếp với API. Vui lòng thử lại.");
  }
};
