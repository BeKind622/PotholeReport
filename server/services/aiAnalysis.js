import { GoogleGenerativeAI } from "@google/generative-ai";

let _client = null;
function getClient() {
  if (!_client) {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
    _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _client;
}

export async function analyzeRoadPhoto(base64Image, mimeType) {
  const model = getClient().getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: { mimeType, data: base64Image },
    },
    `Analyze this road or pavement photo. Reply with ONLY a valid JSON object — no markdown, no explanation:
{
  "isRoadDefect": boolean,
  "defectType": string or null,
  "severity": number or null,
  "description": string
}

Rules:
- isRoadDefect: true if you can see a road/pavement defect, false otherwise
- defectType: one of "pothole", "crack", "subsidence", "edge_break", "surface_damage", "other", or null if no defect
- severity: integer 1–5 (1 = minor cosmetic, 5 = severe/immediately dangerous), or null if no defect
- description: 1–2 sentences describing what you see`,
  ]);

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in response: ${text.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]);
}
