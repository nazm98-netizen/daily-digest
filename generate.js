import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;
const SENDER_EMAIL = process.env.SENDER_EMAIL || "digest@yourdomain.com";

const SECTIONS = [
  {
    id: "government",
    label: "Government & Policy",
    color: "#1a56db",
    bg: "#eff6ff",
    prompt:
      "Search for today's top 3 most important US and international government, politics, and policy news stories from the last 24 hours. For each story provide a punchy headline (max 12 words) and a 3-5 sentence summary covering the key facts, context, and significance.",
  },
  {
    id: "economy",
    label: "Economy & Business",
    color: "#057a55",
    bg: "#f0fdf4",
    prompt:
      "Search for today's top 3 most important economy, finance, and business news stories from the last 24 hours. Include market moves, corporate news, or economic data. For each story provide a punchy headline (max 12 words) and a 3-5 sentence summary covering the key facts, context, and significance.",
  },
  {
    id: "creator",
    label: "Creator Economy",
    color: "#7e3af2",
    bg: "#faf5ff",
    prompt:
      "Search for today's top 3 most important creator economy, influencer marketing, social media platforms, and digital content news stories from the last 24 hours. For each story provide a punchy headline (max 12 words) and a 3-5 sentence summary covering the key facts, context, and significance.",
  },
  {
    id: "consumer",
    label: "Consumer & Retail",
    color: "#d03801",
    bg: "#fff7ed",
    prompt:
      "Search for today's top 3 most important consumer trends, retail, e-commerce, and brand news stories from the last 24 hours. For each story provide a punchy headline (max 12 words) and a 3-5 sentence summary covering the key facts, context, and significance.",
  },
];

async function fetchSection(section) {
  console.log(`Fetching: ${section.label}...`);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [
      {
        role: "user",
        content: `${section.prompt}

Return ONLY a JSON object in this exact format, no markdown, no preamble:
{"stories":[{"headline":"...","summary":"..."},{"headline":"...","summary":"..."},{"headline":"...","summary":"..."}]}`,
      },
    ],
  });

  // Extract the final text block (after tool use)
  const textBlock = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  try {
    const clean = textBlock.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    console.error(`Parse error for ${section.label}:`, textBlock.slice(0, 300));
    return {
      stories: [
        {
          headline: "Stories temporarily unavailable",
          summary:
            "We encountered an issue fetching this section. Please check back later.",
        },
      ],
    };
  }
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildHTML(sections) {
  const date = formatDate();

  const sectionHTML = sections
    .map(({ section, data }) => {
      const storiesHTML = data.stories
        .map(
          ({ headline, summary }) => `
      <tr>
        <td style="padding: 24px 0 28px 0; border-bottom: 1px solid #f0f0f0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-bottom: 10px;">
                <span style="
                  display: inline-block;
                  background-color: ${section.bg};
                  color: ${section.color};
                  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                  font-size: 10px;
                  font-weight: 700;
                  letter-spacing: 1.2px;
                  text-transform: uppercase;
                  padding: 3px 9px;
                  border-radius: 3px;
                ">${section.label}</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px;">
                <span style="
                  font-family: Georgia, 'Times New Roman', serif;
                  font-size: 20px;
                  font-weight: 700;
                  color: #111111;
                  line-height: 1.3;
                ">${headline}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span style="
                  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                  font-size: 15px;
                  color: #444444;
                  line-height: 1.7;
                ">${summary}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
        )
        .join("");

      return `
    <!-- Section: ${section.label} -->
    <tr>
      <td style="padding: 36px 0 0 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="
              border-top: 3px solid #111111;
              padding-top: 14px;
              padding-bottom: 4px;
            ">
              <span style="
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: #111111;
              ">${section.label}</span>
            </td>
          </tr>
          ${storiesHTML}
        </table>
      </td>
    </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>The Daily Digest — ${date}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- Card wrapper -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff;">

          <!-- Header -->
          <tr>
            <td style="background-color: #111111; padding: 32px 40px 28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="
                      font-family: Georgia, 'Times New Roman', serif;
                      font-size: 30px;
                      font-weight: 700;
                      color: #ffffff;
                      letter-spacing: -0.5px;
                    ">The Daily Digest</div>
                    <div style="
                      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                      font-size: 12px;
                      color: #888888;
                      margin-top: 6px;
                      letter-spacing: 1px;
                      text-transform: uppercase;
                    ">${date}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Intro strip -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 14px 40px; border-bottom: 1px solid #ebebeb;">
              <span style="
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                font-size: 13px;
                color: #666666;
                font-style: italic;
              ">Your morning briefing — curated by AI, delivered before 7am.</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${sectionHTML}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #111111; padding: 24px 40px;">
              <span style="
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                font-size: 12px;
                color: #666666;
              ">The Daily Digest is generated automatically each morning using AI and live web search. Stories are summarized, not manually verified.</span>
            </td>
          </tr>

        </table>
        <!-- /Card wrapper -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function main() {
  console.log("📰 Starting Daily Digest generation...");

  const results = [];

  for (const section of SECTIONS) {
    const data = await fetchSection(section);
    results.push({ section, data });
    await new Promise(resolve => setTimeout(resolve, 15000));
  }

  console.log("✅ All sections fetched. Building HTML...");
  const html = buildHTML(results);

  console.log("📧 Sending email via Resend...");
  const { data, error } = await resend.emails.send({
    from: `The Daily Digest <${SENDER_EMAIL}>`,
    to: [RECIPIENT_EMAIL],
    subject: `The Daily Digest — ${formatDate()}`,
    html,
  });

  if (error) {
    console.error("❌ Resend error:", error);
    process.exit(1);
  }

  console.log("✅ Email sent! ID:", data.id);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
