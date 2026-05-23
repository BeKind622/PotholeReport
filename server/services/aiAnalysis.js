import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function analyzeRoadPhoto(base64Image, mimeType) {
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
  if (!textBlock) throw new Error("No text in AI response");

  return JSON.parse(textBlock.text);
}
