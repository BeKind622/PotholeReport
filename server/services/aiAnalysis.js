import Anthropic from "@anthropic-ai/sdk";

// Lazy-initialized so the client is created after dotenv.config() has run
let _client = null;
function getClient() {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export async function analyzeRoadPhoto(base64Image, mimeType) {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: `Analyze this road or pavement photo. Reply with ONLY a valid JSON object — no markdown, no explanation:
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
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("No text block in AI response");

  // Strip markdown code fences if the model wrapped the JSON
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in AI response: ${textBlock.text.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]);
}
