## 目标

1. 调研并新增 **2026 年最新发布的 AI Agent**（含去重）
2. 给 `agents` 表增加 **发布时间（年/月）** 字段，支持按发布时间倒序展示与年-月筛选
3. **删除 2024 年之前发布的 agent**（保留 2024 至今）
4. 全站**中文化覆盖**补强（切换到 zh 时仍是英文的位置补齐）

---

## 实施步骤

### 1. Schema 变更（migration）
- `agents` 增加：
  - `release_year` (int, nullable)
  - `release_month` (int 1–12, nullable)
  - `released_at` (date, generated/写入用，便于排序索引)
- 增加 index：`(release_year desc, release_month desc)`
- `candidate_agents` 同步增加这三个字段（保持入库管线一致）

### 2. 数据回填 + 清洗
- **回填**：基于现有 177 条 agent，用 Lovable AI（gemini-3-flash-preview）批量推断每个 agent 的首次公开发布年/月（参考 GitHub 首次 release / 公司公告时间），写回数据库
- **清洗**：删除 `release_year < 2024` 的 agent（先列表给你确认，再 DELETE；同步清理 `agent_to_*` 与 `github_repos`）
- **去重**：按 (lower(name)) + 主域名归一 + github_url 三路匹配，标出疑似重复，合并保留信息更全的那条

### 3. 新增 2026 年 Agent
- 数据源：`github.com/trending` 月榜（2026-01 至当月）、Product Hunt AI 月榜、a16z、各大厂 2026 发布会
- 目标数量：**约 30 个** 2026 年新发布或重大重制 agent
- 入库：直接发布到 `agents` 表（沿用上次流程）

### 4. 前端：发布时间筛选与排序
- `AgentsPage`：
  - 排序下拉新增「最新发布」（按 `released_at` 倒序），设为默认
  - 新增 **年-月筛选器**：年份 multi-select（2024/2025/2026），月份 multi-select（1-12）
- `AgentCard`：右上角小标签显示「2026·03」之类发布时间
- `AgentDetailPage`：在 provider 下方新增「发布于 2026 年 3 月」

### 5. 中文化补强
扫描以下区域确保中文环境完全本地化（目前已发现的硬编码英文）：
- `AgentsPage` 的 sort/filter UI 文案、空状态
- `AgentCard` 上的 stars/license/language 标签
- `AgentDetailPage` 的标签区、按钮、面包屑
- `Admin*` 页面（运营内部，可选；建议保留英文）—— **会与你确认**
- 新增 `zh.json` 键：`filters.releaseDate / filters.year / filters.month / sort.newest / sort.popular / sort.rating` 等

---

## 技术细节

```sql
ALTER TABLE agents
  ADD COLUMN release_year smallint,
  ADD COLUMN release_month smallint CHECK (release_month BETWEEN 1 AND 12),
  ADD COLUMN released_at date;

CREATE INDEX idx_agents_released_at ON agents(released_at DESC NULLS LAST);
```

排序示例：
```ts
.order('released_at', { ascending: false, nullsFirst: false })
```

去重匹配键（SQL 伪代码）：
```sql
SELECT lower(name), count(*) FROM agents GROUP BY 1 HAVING count(*)>1;
SELECT regexp_replace(website_url,'https?://(www\.)?([^/]+).*','\2') AS host, count(*) ...
```

---

## 需要你确认 2 件事

1. **2024 年之前的 agent 删除范围**：当前库内大量经典开源框架（LangChain 2022、AutoGPT 2023 等）会被删掉。是否：
   - (A) **硬删除**所有 2024 之前的（按你字面要求）
   - (B) **保留但隐藏**（加 `is_archived` 标记，不在前端默认列表显示，但详情页仍可访问，保留 SEO 价值）—— 推荐
2. **Admin 页面是否也要中文化**？（默认仅前台中文化，admin 保留英文）
