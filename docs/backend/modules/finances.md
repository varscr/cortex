# Finances Module

Bank statement import and transaction tracking for Colombian financial products.

## Utils: `server/utils/finances/`

| File | Exports |
|------|---------|
| `types.ts` | `ACCOUNT_TYPES`, `INSTITUTIONS`, `TRANSACTION_TYPES`, `TRANSACTION_CATEGORIES`, Row/API/Input interfaces |
| `validate.ts` | `validateAccountInput(body)`, `validateTransactionUpdate(body)` |
| `transform.ts` | `toFinanceAccount()`, `toFinanceStatement()`, `toFinanceTransaction()` |
| `hash.ts` | `computeTransactionHash(accountId, date, rawDescription, amount)` — SHA256 dedup |
| `pdf-extract.ts` | `extractTextFromPdf(buffer)` — extracts text from PDF using pdf-parse |
| `ingest.ts` | `runFinanceIngest(statementId, accountId, institution, accountType, pdfText)` — background pipeline |

## Ingest Pipeline

1. Upload PDF via `/api/finances/statements/upload`
2. Extract text server-side with `pdf-parse`
3. Create `agent_runs` + `finance_statements` records
4. Background: call `finance-parser` agent with institution metadata + PDF text
5. Agent returns structured JSON: period, summary, transactions array
6. Each transaction is deduplicated via `content_hash` (SHA256 of accountId + date + rawDescription + amount)
7. Statement updated with period dates, summary, and status

## Agent: `agents/finance-parser.toml`

Uses Claude Sonnet, temperature 0.1. Handles both:
- **NU** credit card statements (installments, FX fees, payment breakdowns)
- **Bancolombia** savings statements (running balance, day/month dates with year inference)

## API: `server/api/finances/`

- **Accounts:** `accounts/` — CRUD (no pagination, <10 accounts)
- **Statements:** `statements/` — list, upload (multipart PDF), get, delete
- **Transactions:** `transactions/` — list with filters (account, type, category, search, date range), get, update (category/type/description), delete
- **Stats:** `stats.get.ts` — aggregated income/expenses/net flow, top categories, per-account breakdown

## Schema

Tables: `finance_accounts`, `finance_statements`, `finance_transactions` in `db/init/06-finances-schema.sql`

Reuses existing `agent_runs` table from `db/init/03-agent-schema.sql` for processing status tracking.
