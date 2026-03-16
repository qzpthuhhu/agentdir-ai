

## Plan: Collect and Update GitHub Stars/Forks Data

### Problem
- **candidate_agents**: All records with GitHub URLs have stars=0, forks=0
- **published agents**: Some have github_repos records with data, some are missing entirely

### Approach
Write a Python script that:
1. Queries all candidate_agents and published agents with GitHub URLs
2. Extracts owner/repo from each GitHub URL using the GitHub API (public, no key needed, 60 req/hr limit)
3. Fetches real stars and forks counts
4. Updates `candidate_agents` table (stars, forks columns)
5. Updates/inserts `github_repos` table for published agents

### Technical Details
- GitHub API endpoint: `https://api.github.com/repos/{owner}/{repo}`
- Rate limit: 60 requests/hour for unauthenticated requests. With ~70+ repos this is tight but doable in one pass with small delays
- Parse GitHub URLs to extract `owner/repo` (handle trailing slashes, `.git` suffix, org-only URLs)
- Skip URLs that point to orgs rather than repos (e.g., `https://github.com/THUDM`)
- Use `psql` for updates via the database connection

### Execution
- Single script run via `lov-exec`
- Results logged and written to `/mnt/documents/` for review
- Database updates done directly via psql

### No code changes needed
This is a one-time data backfill task. No frontend or backend code modifications required.

