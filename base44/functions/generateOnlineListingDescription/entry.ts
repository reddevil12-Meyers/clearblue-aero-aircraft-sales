import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { specs } = await req.json();

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You write plain-text classified listings for used aircraft on Barnstormers.com and Trade-A-Plane.

IMPORTANT STYLE RULES:
- Never use em dashes. Use commas, colons, parentheses, or periods instead.
- No emojis, no hashtags, no ALL CAPS hype, no exclamation points.
- Plain text only, suitable for pasting into a classified ad form.

Using the aircraft details below, write ONE listing description of 600 CHARACTERS OR LESS (including spaces). It MUST include the airframe total time and engine time when provided. Include other facts that matter to classified buyers (year/make/model, avionics, interior/exterior condition, damage history, ADS-B, price, location) as available. Be factual and concise. Do not include the character count in the text.

Aircraft details:
${specs}

Return JSON with key: "description" (a string of 600 characters or less).`,
      response_json_schema: {
        type: "object",
        properties: {
          description: { type: "string" }
        }
      }
    });

    let description = String(result.description || '').trim();
    if (description.length > 600) {
      description = description.slice(0, 597).trim() + '...';
    }

    return Response.json({ description });
  } catch (error) {
    console.error('Error generating online listing description:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}