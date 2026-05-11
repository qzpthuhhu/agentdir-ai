## 目标
调研一批 2025 年最新的 AI Agent 项目（约 45 个，覆盖开源框架、商业产品、中国 AI、大厂发布），直接发布到 `agents` 表，前端立即可见。

## 数据源（Firecrawl 抓取）
- **开源**：`github.com/trending`（python/typescript，weekly）、`github.com/e2b-dev/awesome-ai-agents`
- **商业产品**：`producthunt.com/topics/artificial-intelligence`、`a16z.com/100-gen-ai-consumer-apps`
- **中国 AI**：智谱、Moonshot、字节扣子/Coze、阿里通义、百川、MiniMax、DeepSeek 等官网产品页
- **大厂**：OpenAI / Anthropic / Google DeepMind / Microsoft 的最新 agent 发布页（Claude Code、ChatGPT Agent、Gemini CLI、Copilot Studio 等）

## 执行步骤

### 1. 启用 Firecrawl 连接
检查 `list_connections`；若未连接，调用 `standard_connectors--connect(connector_id="firecrawl")`。

### 2. 编写一次性调研脚本（`/tmp/research_agents.ts`）
- 用 Firecrawl `scrape` + `search` 抓取上述榜单页（markdown 格式）
- 用 Lovable AI（`google/gemini-2.5-pro`）批量解析每个候选项目，输出结构化字段：
  `name, slug, tagline, description, provider, country, ecosystem, pricing, is_open_source, website_url, github_url, primary_language, license, features[], use_cases[], tags[], agent_type_slugs[], architecture_slugs[], domain_slugs[]`
- 对带 GitHub 仓库的项目调用 `api.github.com/repos/{owner}/{repo}` 拉取 `stars / forks / language / license`
- 去重：按 `slug` 与现有 `agents.slug` / `name` 匹配，跳过已存在项

### 3. 入库（`agents` 直发）
- 用 `supabase--insert` 批量 INSERT 到 `agents`
- 同步 GitHub 数据到 `github_repos`
- 通过 `agent_to_types / agent_to_architectures / agent_to_domains` 建立分类关联（slug → id 查找）
- 在 `publish_logs` 写入 `action='create'` 审计记录

### 4. 验证
- 用 `supabase--read_query` 统计新增数量、按 ecosystem 分布
- 浏览器打开 `/agents` 确认前端展示正常（卡片、筛选、详情页）
- 输出 `/mnt/documents/new_agents_report.csv` 供你核对

## 目标分布（约 45 条）
| 分类 | 数量 | 示例 |
|---|---|---|
| 开源框架/Agent | 15 | OpenHands、SWE-agent、Suna、Agno、Pydantic-AI、Letta、smolagents |
| 商业/闭源产品 | 12 | Devin、Manus、Genspark、Replit Agent、Lovable、v0、Bolt |
| 中国 AI Agent | 10 | 智谱 AutoGLM、Moonshot Kimi、Coze、通义灵码、MiniMax、DeepSeek、Manus |
| 大厂新发布 | 8 | ChatGPT Agent、Claude Code、Gemini CLI、Copilot Studio、Amazon Q |

## 前端
**无需改动**：`/agents`、`/`、分类页、详情页都已从 `agents` 表读数据，新数据自动出现。如发现新增字段需要展示再单独处理。

## 风险与控制
- Firecrawl 额度：榜单页 ~10 个 scrape + 部分 search，开销可控
- Lovable AI 提取：用 `gemini-2.5-pro` 单次批处理，必要时回落 `gemini-2.5-flash`
- 数据质量：脚本对每条记录打印日志；低置信度（缺 description 或 website）跳过
- 直发风险：你已确认直接入 agents 表；如发现问题可用 `publish_logs` 回滚
