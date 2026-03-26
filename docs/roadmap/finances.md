# Finances — Roadmap

What's been built and what's next.

---

## Phase 1: Foundation (done)

- [x] Database schema (accounts, statements, transactions)
- [x] PDF upload + AI parser agent (NU + Bancolombia)
- [x] Background ingest pipeline with deduplication
- [x] Accounts CRUD + management modal
- [x] Statements upload with progress polling
- [x] Transactions list with filters + inline category edit
- [x] Dashboard with stats grid + top categories + recent transactions
- [x] `formatCOP()` helper for Colombian peso formatting

---

## Phase 2: Charts & Analytics

Visual dashboards to understand spending patterns.

- [ ] **Install chart library** — `chart.js` + `vue-chartjs` (lightweight, works well with Nuxt)
- [ ] **Monthly spending chart** — bar chart: income vs expenses by month (last 6-12 months)
- [ ] **Category breakdown** — pie/donut chart of expenses by category for selected period
- [ ] **Spending trend lines** — line chart showing daily/weekly spending over time
- [ ] **Account balance history** — line chart using `running_balance` from Bancolombia transactions
- [ ] **Month-over-month comparison** — side-by-side bars comparing current vs previous month by category
- [ ] **Credit card utilization** — NU-specific: used vs available credit over time (from statement metadata)
- [ ] **Date range picker** — reusable component for selecting custom periods across all charts

---

## Phase 3: Smart Categorization

Improve AI-generated categories with learning and rules.

- [ ] **Category rules engine** — `finance_category_rules` table: pattern → category mapping (e.g., "RESTAURANTE" → food, "UBER" → transport)
- [ ] **Auto-apply rules on import** — before AI categorization, check rules first (faster, cheaper)
- [ ] **Learn from corrections** — when user changes a category via inline edit, auto-create a rule for that description pattern
- [ ] **Bulk re-categorize** — select multiple transactions and assign category at once
- [ ] **Category merge** — merge two categories into one (e.g., merge "other" into "shopping")
- [ ] **Recurring transaction detection** — identify subscriptions and recurring bills (Claude AI, YouTube, etc.) and tag them

---

## Phase 4: Finance Advisor Agent

AI-powered insights via the chat system.

- [ ] **Agent config** — `agents/finance-advisor.toml` with RAG context from transaction data
- [ ] **Finance embeddings** — embed transaction summaries for vector search (monthly aggregates, not individual transactions)
- [ ] **Natural language queries** — "how much did I spend on food in February?", "what are my recurring subscriptions?", "compare this month to last month"
- [ ] **Monthly digest** — auto-generated summary of the month's finances (top expenses, unusual spending, savings rate)
- [ ] **Budget suggestions** — based on spending patterns, suggest realistic budgets per category
- [ ] **Anomaly detection** — flag unusual transactions (amount significantly higher than average for that category)

---

## Phase 5: Budgets & Goals

Active financial planning and tracking.

- [ ] **Budget table** — `finance_budgets`: category, monthly_limit, period (monthly/weekly)
- [ ] **Budget dashboard** — progress bars per category (spent vs budget), color-coded (green/yellow/red)
- [ ] **Budget alerts** — toast notification when approaching or exceeding a category budget
- [ ] **Savings goals** — set a target amount and track progress over time
- [ ] **Cash flow projection** — based on recurring income/expenses, project balance N days ahead

---

## Phase 6: Multi-Format Support

Expand beyond current PDF parsing.

- [ ] **CSV import** — Bancolombia also exports CSV; simpler parsing without AI
- [ ] **Excel import** — some banks provide .xlsx extracts
- [ ] **Nequi integration** — if Nequi provides exportable statements
- [ ] **Manual transaction entry** — quick-add form for cash transactions not in statements
- [ ] **Duplicate detection UI** — show potential duplicates for review when importing overlapping periods
- [ ] **Statement period overlap warning** — detect and warn when uploading a statement that overlaps an existing one

---

## Phase 7: Advanced Features

Nice-to-haves for a complete personal finance system.

- [ ] **Multi-currency support** — track USD amounts from international subscriptions (Claude AI, OpenAI) alongside COP
- [ ] **Exchange rate tracking** — store FX rates at transaction time, show both COP and original currency
- [ ] **Tags on transactions** — freeform tags in addition to categories (e.g., "trip-to-medellin", "office-setup")
- [ ] **Split transactions** — split one transaction into multiple categories (e.g., supermarket receipt: food + household)
- [ ] **Installment tracker** — dedicated view for NU credit card installments: remaining payments, total committed
- [ ] **Tax helper** — flag deductible expenses, generate annual tax summary
- [ ] **Export** — download transactions as CSV/Excel for external use
