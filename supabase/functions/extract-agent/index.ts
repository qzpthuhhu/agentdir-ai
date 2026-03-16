import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an AI agent data extraction specialist. Your job is to analyze content about AI agents, AI platforms, AI companies, or AI products and extract structured data.

Focus on extracting information about:
- Enterprise AI agents
- Chinese AI agents and companies
- Commercial AI agent products
- Agent platforms and frameworks
- Agent solution providers

Extract as much data as you can from the provided content. Be accurate and conservative — if you're not sure about something, leave it empty rather than guessing.

For confidence_score: rate 0-100 based on how much quality data you could extract. 80+ means most fields filled with clear data. Below 50 means very limited info.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content, sourceUrl, sourceType } = await req.json();
    if (!content) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `Analyze this content and extract structured AI agent/company data.

Source URL: ${sourceUrl || "N/A"}
Source Type: ${sourceType || "unknown"}

Content:
${content}

Extract the data using the extract_agent_data tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_agent_data",
              description: "Extract structured AI agent data from content",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Agent or product name" },
                  slug: { type: "string", description: "URL-friendly slug suggestion" },
                  tagline: { type: "string", description: "Short tagline (under 100 chars)" },
                  description: { type: "string", description: "Detailed description (200-500 chars)" },
                  provider: { type: "string", description: "Company or organization name" },
                  country: { type: "string", description: "Country of origin (e.g. US, CN, UK)" },
                  ecosystem: { type: "string", enum: ["open_source", "startups", "big_tech", "china_ai"] },
                  pricing: { type: "string", enum: ["free", "freemium", "paid", "enterprise"] },
                  is_open_source: { type: "boolean" },
                  website_url: { type: "string" },
                  github_url: { type: "string" },
                  docs_url: { type: "string" },
                  primary_language: { type: "string" },
                  license: { type: "string" },
                  features: { type: "array", items: { type: "string" }, description: "Key features list" },
                  use_cases: { type: "array", items: { type: "string" }, description: "Use case examples" },
                  tags: { type: "array", items: { type: "string" }, description: "Relevant tags" },
                  agent_type_slugs: { type: "array", items: { type: "string", enum: ["coding", "research", "browser", "automation", "chat", "productivity", "data", "devops", "security", "creative", "customer-support", "assistant"] } },
                  architecture_slugs: { type: "array", items: { type: "string", enum: ["autonomous", "multi-agent", "planning", "tool-use", "retrieval", "memory", "reasoning", "workflow", "simulation", "embodied"] } },
                  domain_slugs: { type: "array", items: { type: "string", enum: ["finance", "healthcare", "education", "legal", "marketing", "sales", "cybersecurity", "e-commerce", "gaming", "scientific", "robotics"] } },
                  target_customer: { type: "string" },
                  enterprise_focus: { type: "string" },
                  deployment_type: { type: "string" },
                  service_model: { type: "string" },
                  confidence_score: { type: "number", description: "0-100 confidence in extraction quality" },
                  extraction_notes: { type: "string", description: "Notes about what was found or missing" },
                },
                required: ["name", "slug", "confidence_score"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_agent_data" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ success: true, data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Extract error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Extraction failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
