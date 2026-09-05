import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { specs } = await req.json();

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional aircraft sales copywriter for ClearBlue Aero, a reputable aviation brokerage.

IMPORTANT STYLE RULE: Never use em dashes (—) in any copy. Use commas, colons, parentheses, or periods instead.

Using the aircraft specifications below, write TWO pieces of copy:

1. A compelling SALES DESCRIPTION (3-5 paragraphs) for the listing page. It should be engaging, highlight the aircraft's best features, speak to serious buyers, and be suitable for a professional aviation brokerage website.

2. A SOCIAL MEDIA POST (suitable for Facebook/Instagram) that is punchy, exciting, uses 3-5 relevant aviation emojis, and ends with relevant hashtags like #aviation #aircraftforsale #generalaviation #ClearBlueAero.

Aircraft Specs:
${specs}

Return JSON with keys: "description" and "social_post".`,
      response_json_schema: {
        type: "object",
        properties: {
          description: { type: "string" },
          social_post: { type: "string" }
        }
      }
    });

    return Response.json({ description: result.description, social_post: result.social_post });
  } catch (error) {
    console.error('Error generating description:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});