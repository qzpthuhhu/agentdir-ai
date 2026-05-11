## 目标
固定 3 个高质量源，每次更新时统一抓取 → AI 抽取 → 去重 → 经候选表人工 review → 合并到 `agents` 表。

## 三个固定源（已确认）

| # | 源 | 覆盖 | 抓取方式 |
|---|----|------|--------|
| 1 | **`github.com/e2b-dev/awesome-ai-agents`** | 开源 + 商业 Agent 综合榜 | Firecrawl scrape (markdown) + GitHub API 补 stars/language |
| 2 | **`producthunt.com/topics/ai-agents`**（newest） | 最新商业/创业 Agent 产品（带准确发布日期） | Firecrawl scrape，过滤近 60 天 |
| 3 | **`qbitai.com`（量子位 Agent 标签）** | 中国 AI Agent 与大厂新品 | Firecrawl scrape，限定 Agent 关键词 |

## 工作流

```text
┌──────────────┐  Firecrawl   ┌──────────────┐  Lovable AI   ┌─────────────────┐
│ 3 fixed URLs │ ──scrape──▶ │ raw markdown │ ──extract──▶ │ candidate rows  │
└──────────────┘              └──────────────┘               └────────┬────────┘
                                                                     │ dedupe
                                                                     ▼
                                              ┌──────────────────────────────────┐
                                              │ candidate_agents                 │
                                              │ status = new / duplicate         │
                                              └────────────┬─────────────────────┘
                                                           │ 人工 Review (已存在)
                                                           ▼
                                                       agents 表
```

### 去重规则（按优先级）
1. `slug` 完全匹配
2. 标准化 `website_url`（去 protocol / trailing slash / www）
3. 标准化 `github_url`（owner/repo 小写）
4. `name` 模糊（小写去空格）+ `provider` 相同

命中 → 标 `duplicate`，新数据 patch 进 candidate；未命中 → `new`。

### AI 抽取字段
沿用现有 `extract-agent` edge function，必抽：
`name, tagline, description, provider, country, website_url, github_url, ecosystem, pricing, is_open_source, release_year, release_month, tags[], features[]`

## 实现步骤

1. **DB**
   - 在 `source_records` 插入 3 行种子（`source_type='fixed_feed'`, `url`, `title`）。
   - 新增 `ingestion_runs` 表：`source_id, started_at, finished_at, fetched, new_count, duplicate_count, failed_count, error`。

2. **Edge function `sync-fixed-sources`**
   - 读 enabled 的 fixed feeds → Firecrawl scrape
   - 对内容切片调用 `extract-agent`
   - GitHub URL → 调 GitHub API 拿 stars/language/created_at
   - 走去重规则 → 写入 `candidate_agents`，`submission_source = fixed_feed:<slug>`
   - 写一行 `ingestion_runs` 总结

3. **前端 `AdminOps`**
   - 新增 "Sync from Fixed Sources" 按钮
   - 显示上次运行时间 + 三源各自的统计卡片（fetched / new / duplicate / failed）

4. **`AdminSources` / `AdminCandidates`**
   - Sources 列表展示这 3 个固定源（启用/停用，不可删除）
   - Candidates 增加按 `submission_source` 筛选

5. **Review → 合并**
   - 复用现有 `AdminReview` 流程：人工确认后从 `candidate_agents` 写入 `agents`

## 范围外（这一轮不做）
- 自动定时调度（先做手动按钮，后续可加 pg_cron 周更）
- 自动批准（始终人工最终决定，符合 Core memory）

## 技术约束
- Firecrawl 已有连接器，无需新密钥
- AI 抽取用 `google/gemini-3-flash-preview`（符合 Core memory）
- 不直接写 `agents`，全部经 `candidate_agents` + 人工 review
