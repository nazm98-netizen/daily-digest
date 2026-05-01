# 📰 The Daily Digest

An automated AI-powered morning news briefing delivered to your inbox every day at 7am. Uses Claude with live web search to fetch real stories, formats them into a clean magazine-style HTML email, and sends via Resend.

---

## What it looks like

Four sections, each with 3 stories:

- 🔵 **Government & Policy**
- 🟢 **Economy & Business**
- 🟣 **Creator Economy**
- 🟠 **Consumer & Retail**

Each story has a punchy headline + a 3–5 sentence summary. Clean black-and-white typographic design.

---

## Setup (5 minutes)

### 1. Clone or create the repo

```bash
git clone https://github.com/YOUR_USERNAME/daily-digest.git
cd daily-digest
npm install
```

### 2. Get your API keys

| Key | Where to get it |
|-----|----------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) |

> **Note on Resend sender domain:** To send from a custom address like `digest@yourdomain.com`, you need to verify your domain in Resend. For quick testing, use `onboarding@resend.dev` as the sender — but it will only deliver to your own verified Resend account email.

### 3. Set up local environment (for testing)

```bash
cp .env.example .env
# Fill in your values in .env
```

Then test locally:

```bash
node generate.js
```

You should see it fetch all 4 sections and confirm the email was sent.

### 4. Add GitHub Actions secrets

In your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**, add:

| Secret name | Value |
|-------------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic key |
| `RESEND_API_KEY` | Your Resend key |
| `RECIPIENT_EMAIL` | Where to deliver the digest |
| `SENDER_EMAIL` | Your verified Resend sender address |

### 5. Push to GitHub

```bash
git add .
git commit -m "Add daily digest"
git push
```

The cron job will now run automatically every day at **7am UTC**.

---

## Changing the send time

Edit `.github/workflows/daily.yml` and update the cron expression:

```yaml
- cron: "0 7 * * *"   # 7am UTC (default)
- cron: "0 12 * * *"  # 7am EST (UTC-5)
- cron: "0 15 * * *"  # 7am PST (UTC-8)
```

---

## Manual trigger

Go to your repo on GitHub → **Actions → Daily Digest → Run workflow** to send a digest immediately.

---

## Customizing sections

Edit the `SECTIONS` array in `generate.js` to change topics, colors, or prompts. Each section has:

- `label` — displayed name
- `color` — tag text color (hex)
- `bg` — tag background color (hex)
- `prompt` — instruction sent to Claude with web search

---

## File structure

```
daily-digest/
├── generate.js                    # Main script
├── package.json
├── .env.example                   # Copy to .env for local use
├── .gitignore
└── .github/
    └── workflows/
        └── daily.yml              # GitHub Actions cron job
```
