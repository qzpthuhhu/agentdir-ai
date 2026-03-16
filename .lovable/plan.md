

## Analysis: Differences Between Edit Agent and Candidate Review

### Key Differences Found

**1. Missing fields in Candidate Review (`AdminReview.tsx`) that exist in Edit Agent (`AgentForm.tsx`):**
- **GitHub Stars** — not shown or editable
- **GitHub Forks** — not shown or editable
- **Primary Language** — not shown or editable
- **License** — not shown or editable
- **Logo URL** — not shown or editable

**2. Missing fields in the `candidate_agents` table schema:**
The `candidate_agents` table does NOT have `stars`, `forks` columns. The LLM extraction function (`extract-agent`) also does not extract stars/forks. These fields only exist in the `github_repos` table which is linked to published agents.

**3. Publish pipeline gap (`publishCandidate` in `ops.service.ts`):**
When publishing a candidate to a live agent, the function does NOT create a `github_repos` record — meaning even if we add stars/forks to candidates, they wouldn't carry over to the published agent's GitHub data.

### Plan

**A. Add missing columns to `candidate_agents` table (migration):**
- Add `stars` (integer, default 0)
- Add `forks` (integer, default 0)

(Note: `primary_language`, `license`, `logo_url` already exist in the candidate table)

**B. Update AdminReview.tsx — add missing fields:**
- Add a "Technical" section with: Primary Language, License, Stars, Forks
- Add Logo URL field in the Identity section

**C. Update `publishCandidate` in `ops.service.ts`:**
- When publishing, if the candidate has `github_url` and `is_open_source`, create/upsert a `github_repos` record with stars, forks, language, license
- Pass `primary_language` and `license` to `agentData`

**D. Update `extract-agent` edge function:**
- Add `stars` and `forks` to the extraction tool schema so the LLM can extract them when available from scraped content

**E. Update `scrape-url` or ingestion pipeline (if applicable):**
- No changes needed — stars/forks from extraction will flow into candidate record

### Files to modify:
1. **Migration** — add `stars`, `forks` columns to `candidate_agents`
2. **`src/pages/admin/AdminReview.tsx`** — add Technical section with stars, forks, language, license, logo_url fields
3. **`src/services/ops.service.ts`** — update `publishCandidate` to create `github_repos` and include `primary_language`/`license` in agentData
4. **`supabase/functions/extract-agent/index.ts`** — add `stars`, `forks` to tool parameters

