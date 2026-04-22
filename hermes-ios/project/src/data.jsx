// Mock data shared across screens.

const SKILLS = [
  { id: "trip-planner", name: "Trip Itinerary Planner", category: "Travel", uses: 14, improved: 3, learned: "2 weeks ago", auto: true, desc: "Three-pass planner: draft, critique timings, balance against budget. Learned on your Tokyo trip.", tools: ["web", "file"], confidence: 0.92 },
  { id: "pr-review", name: "PR Review Checklist", category: "Engineering", uses: 41, improved: 7, learned: "1 month ago", auto: true, desc: "Reads diff, flags missing tests, notes style inconsistencies against your team conventions.", tools: ["code", "terminal"], confidence: 0.88 },
  { id: "weekly-report", name: "Weekly Status Report", category: "Work", uses: 22, improved: 2, learned: "3 weeks ago", auto: true, desc: "Summarizes your shipped work from git + calendar into the format your team uses.", tools: ["web", "file"], confidence: 0.95 },
  { id: "kitchen-inv", name: "Kitchen Inventory → Recipes", category: "Home", uses: 6, improved: 1, learned: "5 days ago", auto: true, desc: "Takes a photo of your fridge, suggests recipes that use what's about to expire first.", tools: ["web"], confidence: 0.72 },
  { id: "paper-notes", name: "Paper Notes", category: "Research", uses: 18, improved: 4, learned: "2 months ago", auto: true, desc: "Pulls out methodology, results, and your margin-style reactions.", tools: ["web", "file"], confidence: 0.9 },
  { id: "invoice-chase", name: "Invoice Chaser", category: "Work", uses: 9, improved: 1, learned: "6 weeks ago", auto: false, desc: "You wrote this one. Polite, escalating sequence for late invoices.", tools: ["file"], confidence: 0.8 },
  { id: "morning-brief", name: "Morning Brief", category: "Personal", uses: 87, improved: 5, learned: "3 months ago", auto: true, desc: "Weather, top 3 calendar items, the two stocks you watch, overnight emails that matter.", tools: ["web"], confidence: 0.97 },
  { id: "rent-receipts", name: "Receipt Parser", category: "Finance", uses: 34, improved: 2, learned: "2 months ago", auto: true, desc: "OCR receipt photos, categorize, append to your ledger.", tools: ["file"], confidence: 0.93 },
];

const MEMORIES = [
  { id: "m1", kind: "user", text: "Prefers terse, markdown-free responses. No emoji unless I ask.", confidence: 0.98, added: "2 months ago" },
  { id: "m2", kind: "user", text: "Lives in Lisbon. Timezone is Europe/Lisbon. Works hybrid Tue–Thu.", confidence: 1.0, added: "3 months ago" },
  { id: "m3", kind: "project", text: "Kestrel codebase uses pnpm, Vitest, and conventional commits. Deploys Thursdays.", confidence: 0.95, added: "5 weeks ago" },
  { id: "m4", kind: "user", text: "Sister's birthday is Nov 14. Usually sends a handwritten note.", confidence: 0.9, added: "last year" },
  { id: "m5", kind: "project", text: "Reading group meets every other Sunday at 5pm. Skips December.", confidence: 0.88, added: "4 months ago" },
  { id: "m6", kind: "user", text: "Coffee: single origin, pour-over, no oat milk.", confidence: 0.82, added: "6 weeks ago" },
  { id: "m7", kind: "project", text: "Newsletter ships Tuesdays 7am UTC. Buttondown, section order fixed.", confidence: 0.94, added: "2 months ago" },
];

const SCHEDULES = [
  { id: "s1", name: "Morning brief", cron: "Every weekday at 7:00", next: "Tomorrow, 7:00", last: "Today, 7:00", status: "on", skill: "morning-brief", destination: "Telegram" },
  { id: "s2", name: "Friday newsletter draft", cron: "Fridays at 16:00", next: "Fri, 16:00", last: "Last Fri, 16:00", status: "on", skill: "weekly-report", destination: "Email" },
  { id: "s3", name: "Watch GitHub releases for pnpm", cron: "Every 4 hours", next: "In 2h 14m", last: "4 hours ago", status: "on", skill: null, destination: "Push" },
  { id: "s4", name: "Rent reminder (due day -3)", cron: "Monthly, 27th at 9:00", next: "Apr 27, 9:00", last: "Mar 27, 9:00", status: "paused", skill: null, destination: "Push" },
  { id: "s5", name: "Reading group prep", cron: "Alternate Sundays 14:00", next: "Sun, 14:00", last: "2 weeks ago", status: "on", skill: "paper-notes", destination: "Push" },
];

const SUBAGENTS = [
  { id: "sa1", title: "Research: competitors for Kestrel", status: "running", progress: 0.62, started: "12 min ago", tokens: 14200, steps: 23, spawned: "from Chat" },
  { id: "sa2", title: "Rewrite onboarding copy (3 variants)", status: "running", progress: 0.34, started: "4 min ago", tokens: 6100, steps: 11, spawned: "from Skills" },
  { id: "sa3", title: "Scrape Ludwig Beethoven biographies", status: "done", progress: 1, started: "this morning", tokens: 22500, steps: 41, spawned: "from Chat" },
  { id: "sa4", title: "Draft quarterly OKR doc", status: "paused", progress: 0.48, started: "yesterday", tokens: 9800, steps: 18, spawned: "from Schedules" },
];

const CHAT_SEED = [
  { id: "c1", role: "hermes", text: "Morning. You asked me yesterday to pull the Lisbon flat listings under €1400. Six new ones since. Want them grouped by neighborhood or ranked?", ts: "9:02" },
  { id: "c2", role: "user", text: "rank them. budget is firm.", ts: "9:03" },
  { id: "c3", role: "hermes", kind: "tool", tool: "web.search", args: "lisbon rentals <1400 eur 2026-04", result: "6 results · 4 kept after dedup", duration: "1.8s" },
  { id: "c4", role: "hermes", kind: "tool", tool: "skill.load", args: "apartment-scorer", result: "your scorer (light, balcony, <30m commute)", duration: "0.2s" },
  { id: "c5", role: "hermes", text: "Ranked. The top three are in Graça, Anjos, and Alvalade. The Graça one is €50 over but has the balcony and a dishwasher, which you flagged as worth the stretch last time. Shall I email the agents?", ts: "9:03" },
];

Object.assign(window, { SKILLS, MEMORIES, SCHEDULES, SUBAGENTS, CHAT_SEED });
