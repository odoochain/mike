# 北大法宝法条核验接入（方案，未实施）

本方案把「中文法条核验」接入 Mike，用于校验法条引用是否存在、条号是否位移、
以及引文是否与现行文本一致。目标场景是外部知识库（法律本体学）中的条号台账需要
一个独立于官方网站的商业法源做交叉核验。

> **状态：方案稿，尚未实施，未经实机鉴权验证。**
> 下文关于北大法宝接口的描述来自其官方站点 `https://mcp.pkulaw.com/` 的公开说明，
> 未经实际调用验证。实施前必须先完成阶段 0 的连通性验证。

## 范围与不做什么

- 本方案**只做核验**：给定一条法条引用，回答"是否存在 / 现行文本如何 / 是否位移"。
- 不做法律意见、不做要件抽取、不自动改写外部知识库的本体骨架。
- 核验结论回流到本体属于建模决策变更，按该知识库的治理规则须走裁决卡，
  不由本工具直接写回。

## 阶段 0：零代码接入（先做这一步）

Mike 的 MCP connectors 已原生支持 bearer-token 远程服务器，因此**不需要改任何代码**
即可验证北大法宝是否可用：

1. 在北大法宝控制台注册账号并获取 Token，**并在控制台订阅/开启所需能力**
   （有 Token 不等于开通全部端点）。
2. Mike 中进入 **Settings > Connectors > + Custom**，填入：

   | 字段 | 值 |
   | --- | --- |
   | Name | `pkulaw-citation-validator` |
   | URL | `https://apim-gateway.pkulaw.com/pku_citation_validator/mcp` |
   | Bearer token | 控制台获取的 Token |

3. 保存后确认工具列表能被拉取到（Mike 会缓存并展示该服务器的工具）。

URL 会经过 `backend/src/lib/mcp/client.ts` 的 `validateRemoteMcpUrl` 校验：
必须 HTTPS、不得是 localhost/元数据主机、不得解析到私有 IP。

若只想先在命令行验证，不必先起 mike：`pkulaw-mcp init --authorization "Bearer <Token>"`
会写入 `~/.pkulaw/mcp/config.json` 并自动拉取 `tools/list`，能更快暴露订阅或鉴权问题。

### 无 Token 连通性探测结果（2026-10-12 实测）

已实测通过，不再需要重复探测：

- **DNS**：`apim-gateway.pkulaw.com` 解析为公网地址 `221.11.190.218` / `211.97.84.77`，
  HTTPS + 非 localhost + 非公网保留段三项均满足 `validateRemoteMcpUrl` 全部条件
  （对照 `client.ts:245-285` 逐条人工核验，未执行该函数本身）。
- **网关存活**：**权威服务清单是 13 个，不是官网首页展示的 9 个**。以下路径取自 CLI
  内置清单 `dist/config/servers.json` 的 `invokePath`，全部 POST 实测返回 **HTTP 401**
  （路由存在、仅差鉴权）：

  | 服务 id | 用途 | 网关路径 |
  | --- | --- | --- |
  | `law-keyword` | 法规关键词检索 | `/mcp-law/mcp` |
  | `law-semantic` | 法规语义检索 | `/mcp-law-search-service/mcp` |
  | `fatiao` | 按法规名+条号精确取法条全文 | `/mcp-fatiao/mcp` |
  | `law-recognition` | 从文本识别法条并回全文+来源链接 | `/law_recognition/mcp` |
  | `citation-validator` | 修正生成幻觉-法条 | `/pku_citation_validator/mcp` |
  | **`statute-history`** | **法规与法条沿革：版本链、某条历次文本、同条两版本逐字差异** | `/pkulaw-statute-history/mcp` |
  | `case-keyword` / `case-semantic` | 案例关键词 / 语义检索 | `/mcp-case/mcp` / `/mcp-case-search-service/mcp` |
  | `case-number` | 案号识别与溯源 | `/case_number_recognition/mcp` |
  | `doc-link` | 法宝超链 | `/add-doc-link/mcp` |
  | `procuratorate-doc` / `enforcement-doc` | 检察文书 / 行政执法检索 | `/pkulaw-procuratorate-doc/mcp` / `/pkulaw-enforcement-doc/mcp` |
  | `account` | 积分余额、各 MCP 开启状态与**每次调用积分** | `/pkulaw-account/mcp` |

  ⚠️ 路径必须带 `/mcp` 后缀；官网首页展示的地址省略了该后缀，不可直接照抄。

  无 Token 与伪造 Token 返回相同 401，无法据此区分 Token 真伪。
- **备用通道确认**：`@pkulaw/mcp-cli` v0.3.2 已在 npm 发布（MIT），
  `pkulaw-mcp init --authorization "Bearer <Token>"` 即直连同一网关。

### CLI 实测发现：citation-validator 的真实形态

`pkulaw-mcp citation-validator adjust_provisions` 的定位是「修正生成幻觉-法条」，
入参为三个顶层字段：`--userlaw`（被引用的法条清单 JSON）、`--answerlaw`
（答案中法条及文本 JSON）、`--prompt`（问题）。这正好适合把条号台账的 26 处引用
作为 `userlaw` 批量喂入做交叉核验。注意 CLI 工具名以线网 `tools/list` 为准，
不要凭文档猜参数名（先跑 `pkulaw-mcp update` 刷新缓存）。

另有两个**零积分**工具可用于鉴权后的免费连通性自检：
`account get_points_balance`（查积分余额）、`account list_entitlements`（查已订阅能力），
路径 `/pkulaw-account/mcp`。拿到 Token 后第一步应先跑这两个，
确认订阅面再决定测哪个端点。

### 关键修正：沿革核验有专门服务，不必依赖 citation-validator 承担

本方案原先把「返回须含历史版本 / 效力期间字段」设为 citation-validator 的验收标准。
CLI 内置清单显示存在独立的 `statute-history`（法规与法条沿革），其说明为
「查询某部法的版本链、关联法规、某一条的历次文本，以及同一条两个版本的逐字差异」——
这正是条号位移核验（如海商法 28→27、刑诉法第 210 条第 3 项适用规则变更）
所需的原生能力。

因此阶段 0 的验收应调整为**两服务分工**：

- `account`（0 积分）：先确认订阅面与每次调用的积分成本，再决定测什么。
- `statute-history`：承担条号位移与效力期间核验，对台账中海商法、民诉法
  「修正前条号 + 修正后条号 + 生效日期」三要素逐项验证。
- `citation-validator adjust_provisions`：承担批量引用比对，把台账 26 处引用
  作为 `--userlaw` 喂入，查错引/漏引。
- `fatiao`：按法规名+条号取现行法条全文，作为「基准文本」比对源。

### 阶段 0 鉴权执行结果（2026-10-13 实测）

**Token 有效，能力全开**：`list_entitlements` 返回 `totalCount: 14, turnedOnCount: 14`，
`accountStatus: active`。账号侧比 CLI 内置清单多一个服务 `mcp-law-agg`（法律智能检索，125 分），
以账号返回为准。

**⚠️ 当前阻断：`availablePoints = 0`**，所有检索类工具均无法调用。
充值入口：<https://mcp.pkulaw.com/console/points>。

各服务每次调用积分（`pointsPerCall`）：

| 服务 | 每次积分 | 备注 |
| --- | --- | --- |
| `fatiao` | **25** | 最便宜，按法规名+条号取现行全文 |
| `mcp-law` / `mcp-case` | 25 | 关键词检索 |
| `statute-history` | 75 | 沿革/条号位移核验 |
| `law_recognition`、`add-doc-link`、`citation-validator`、`case_number_recognition` | 125 | 溯源类 |
| `mcp-law-search-service`、`mcp-case-search-service`、`mcp-law-agg` | 125 | 语义/综合检索 |
| `pkulaw-account` | 0 | 余额与订阅查询，可无限用 |

### 真实参数规格（已从 `tools/list` 免费取得，不必再猜）

`pkulaw-mcp tools <serviceId>` 不消耗积分，可随时刷新真实 schema：

- **statute-history**（4 个工具）
  - `list_law_versions --lawTitle`
  - `list_related_statutes --lawTitle --relation`（`--relation` 必须传英文 key，如 `inferiorLaw`）
  - `get_article_history --lawTitle --articleNumber [--asOf] [--includeUnchanged]`
  - `diff_article_versions --lawTitle --articleNumber --fromVersion --toVersion [--format]`
  - **条号位移的原生判据**：`get_article_history` 的条号按**现行版**解释；
    传 `asOf` 若命中版当年条号 ≠ 入参，会额外返回 `citedAsOfAlternate`。
    `diff_article_versions` 同样按现行条号走同一谱系。
    判断时点看 `implementDate`（施行日期），**不要看 `issueDate`（发布日期）**。
  - 不计费的失败：`diff_article_versions` 在本条变迁无记录时会 raise 且不计费。
- **citation-validator**：`adjust_provisions --userlaw --answerlaw --prompt`
  （`--userlaw` 是被引用法条的集合，**可一次批量喂入多条**）
- **fatiao**：`get_law_item_content --title --tiao_num`（`tiao_num` 须为整数或小数）

### 建议的首次消费方案（约 275 积分）

1. `citation-validator adjust_provisions`（**125**，1 次调用覆盖台账全部 26 条引用，
   把 26 处作为 `--userlaw` JSON 喂入）——最便宜的全量交叉核验。
2. `statute-history get_article_history`（**75 × 2 = 150**）——对两条**已知位移**的条号
   （海商法 28→27、民诉法执行编 239→246）验 `citedAsOfAlternate`，
   这是本方案「位移与效力期间」验收标准的正面判定。

跑完第 2 步若 `citedAsOfAlternate` 能正确给出旧版条号，则 L1 交叉核验能力成立，
可进入阶段 1；否则应停止投入。

### 首次核验执行结果（2026-10-13，已消费 475 积分）

#### 1. 批量引用核验：31/31 全部解析成功

`citation-validator adjust_provisions` 一次调用喂入台账 31 条引用，
**31 条全部返回权威原文 + 正文 URL + 版本标签 + `implement_date`**，无一条解析失败。

#### 2. 一致项（外部确认）

- **行政类 8 条全部一致**。台账自纠的勘误「给付判决应为第 73 条、非第 72 条」
  被外部确认：现行第 72 条=履行判决，第 73 条=给付判决。
- **海商法 4 条全部一致**。`statute-history get_article_history --lawTitle 中华人民共和国海商法
  --articleNumber 27 --asOf 2025-06-01` 原生印证位移：

  | 版本 | 条号 | 文本 | `renumbered` |
  | --- | --- | --- | --- |
  | 2025修订（现行，施行 2026-05-01） | 第二十七条 | 船舶优先权应当通过法院扣押产生优先权的船舶行使 | false |
  | 正本（施行 1993-07-01） | **第二十八条** | 同上 | **true** |

  即现行 27 = 旧版 28，台账「28→27」成立；`completeness.otherArticleNumbers = ["28.0"]`。
  同法第 28 条亦确认含「船员工资类优先权一年自离船之日起算」的新增规则。

#### 3. ⚠️ 不一致项（民诉法执行编 3 处——本次外部验证的实质发现）

台账标注为「民事诉讼法（2023 修正）」的 3 个条号，与北大法宝现行
（2023 修正，施行 2024-01-01）条号**全部不符**，且差异为**固定 +4**：

| 台账主题 | 台账记 | 法宝现行 | 法宝在台账所记条号上的实际内容 |
| --- | --- | --- | --- |
| 执行异议（书面异议，15 日审查） | 232 | **236** | 232 = 公示催告期间申报权利 |
| 不予执行仲裁裁决（六情形） | 244 | **248** | 244 = 执行回转 |
| 申请执行时效二年 | 246 | **250** | 246 = 人民检察院对民事执行活动实行法律监督 |

**根因推断**：台账执行的是 2017→2021 的 **+7** 位移（执行异议 225→232、
不予执行 237→244、时效 239→246），得到的是 **2021 修正**的条号，却标注为 2023 修正。
2023 修正在此基础上再 **+4**（2021→2023）。独立佐证——检察监督条的谱系为
**235（2017修正）→ 242（2021修正）→ 246（2023修正）**，正是 +7 再 +4。

因此台账所记「2023 修正主要扩涉外编，执行编整体 +7」这一规律本身也不准确：
**+7 是 2021 修正的位移，2023 修正另有 +4**。

#### 4. 官方源复核（2026-10-13 完成，结论与法宝逐字一致）

现行《民事诉讼法》（2023 修正）官方全文（载明 1991 通过、
2007/2012/2017/2021/2023 五次修正、2024-01-01 施行，含完整修正沿革）逐条确认：

- 第 **236** 条 = 执行异议（书面异议，十五日审查）
- 第 **248** 条 = 不予执行仲裁裁决（六情形）
- 第 **250** 条 = 申请执行的期间为二年
- 第 232 条 = 公示催告期间申报权利；第 244 条 = 执行回转；第 246 条 = 检察监督

官方文本与北大法宝结果**逐字一致**，三处不符获双源确认。

#### 5. 第三源验证：元典开放平台（2026-10-13）

**此前判断已作废**：本文件曾记「元典未见 API/MCP 接入说明，不纳入」。
现确认其有开放平台 MCP，且已实测可用。

- 端点：`https://open.chineselaw.com/mcp`（streamable HTTP，Bearer 鉴权，
  `Accept: application/json, text/event-stream`）
- 服务端：`yuandian-open-platform` v0.1.0「全部能力统一入口」，**47 个工具**
- 额度：每月 1 日赠 3500 积分，**当月有效不累计**；50 QPM；
  适用范围为普通法律法规 / 案例文书 / 企业信息 / 证券合规
- ⚠️ **`yuandian_hall_detect`（幻觉校验）仅 VIP 可用**——免费档不可用，
  故批量引用自动抽取校验这条路走不通，需按条号逐条查
- 合同审查单次约 300–500+ 积分，且须经本地 CLI，与本工作流无关

**与本次核验对口的工具**：

| 工具 | 用途 |
| --- | --- |
| `yuandian_get_legal_article_detail` | 法条/法规详情；`regulation_name` + `article_number` + **`reference_date`（YYYY-MM-DD，选指定日期有效版本，与法宝 `asOf` 等价）**；返回 `effective_date`、`validity_status` |
| `yuandian_get_law_or_regulation_detail` | 法规详情（正文、时效性、发布/实施日期） |
| `yuandian_search_legal_articles` / `yuandian_search_laws_and_regulations` | 法条 / 法规检索 |
| `yuandian_search_judicial_cases` / `yuandian_search_authoritative_cases` / `yuandian_get_case_detail` | 裁判案例与权威案例检索（L3 盲测选案可用） |
| `yuandian_get_user_balance` / `yuandian_get_free_policy` | 余额与免费政策，**查询不扣积分** |

**元典实测（与法宝、官方文本一致）**：

| 查询 | 元典返回 |
| --- | --- |
| 民事诉讼法 第 246 条 | 人民检察院有权对民事执行活动实行法律监督（2023修正，2024-01-01 施行，现行有效） |
| 民事诉讼法 第 250 条 | 申请执行的期间为二年（2023修正，2024-01-01 施行，现行有效） |
| 民事诉讼法 第 232 条 | 利害关系人应当在公示催告期间向人民法院申报（同上） |

至此三处不符获 **三源确认（北大法宝 + 官方全文 + 元典）**。

> 脚本坑：PowerShell 里 `$args` 是保留自动变量，把它当函数参数名会让
> MCP 的 `arguments` 被序列化成数组，服务端报
> `Cannot deserialize ... from Array value`。必须换参数名。

### L1 常态化交叉核验：`scripts/law-crosscheck.mjs`

把「两个商业法源自动互校、只在分歧时报警」落成脚本，使 L1 从一次性验证转为可持续。

```bash
PKULAW_MCP_AUTHORIZATION="Bearer ..." YUANDIAN_API_KEY="..." \
  node scripts/law-crosscheck.mjs --ledger scripts/law-ledger.example.json
```

台账格式（`scripts/law-ledger.example.json`，每条为法规名 + 中文条号）：

```json
[
  { "title": "中华人民共和国民事诉讼法", "article_number": "第二百五十条" }
]
```

**退出码契约（fail-closed，与 `audit-gate.mjs` 同一原则）**：

| 码 | 含义 |
| --- | --- |
| 0 | 每条都被**两个源**核验且一致 |
| 1 | 至少一个 DISAGREE（需人工裁决） |
| 2 | **未能核验**（缺凭证、源不可达、鉴权/配额失败、或某条未查全） |

「没能检查」绝不与「检查通过」输出同一结论——部分成功即失败。
`scripts/law-crosscheck.test.mjs`（`node --test`，9/9 通过）逐条断言这些退出码。

实现要点：
- 法宝走 `mcp-fatiao` 的 `get_law_item_content`（需数字条号），脚本内置中文条号转换
  （`第二百五十条`→`250`、`第十七条之一`→`17.1`）；解析不出即判 UNCHECKED，不猜
- 元典走 `yuandian_get_legal_article_detail`（`regulation_name` + 中文条号）
- 比较前做归一化（去条号前缀、空白、中英文标点），两边互为子串即判一致
- 401/403 视为致命，立即 exit 2 且不重试；429 退避重试
- **源返回成功但无正文 = UNCHECKED，不是 DISAGREE**（由测试捕获修正，见下）

**实跑结果（2026-10-13，11 条真实台账）**：`total=11 agree=11 disagree=0 unchecked=0`，
exit 0。两家在**版本标签上亦一致**（民事诉讼法 2023 修正、海商法 2025 修订、
行政诉讼法 2017 修正）。

**已知局限（不要过度解读）**：
- 两家均为商业法源，**数据同源性未知**——一致不等于正确，只说明分歧风险低
- 仅比对法条**文本**，不覆盖条号位移与历史版本；位移核验仍须用
  法宝 `statute-history` 或元典 `reference_date`
- 消耗积分：法宝 25/条、元典从其月度额度扣；跑全量台账前先查余额

### L2 案例交叉核验：`scripts/case-crosscheck.mjs`

案例与判决来源同样需要外部验证，但**必须分清验到了什么**。

```bash
PKULAW_MCP_AUTHORIZATION="Bearer ..." YUANDIAN_API_KEY="..." \
  node scripts/case-crosscheck.mjs --ledger scripts/case-ledger.example.json
```

**⚠️ 这个脚本只验「案例同一性」，不验「案例内容」**：
它证明被引案号真实存在、且两家解析到同一案件（标题、法院、审结日期一致）；
**它不证明知识库对该案裁判要旨、事实、说理的归纳是对的**。
两家一致只说明"这个案子是真的"，不说明"我们读对了"。
案例内容的可靠性属 L3（盲测），不能由本脚本代劳。

比对字段与容错：

| 字段 | 来源 | 比对方式 |
| --- | --- | --- |
| 标题 | 法宝 `anhao_recognition` / 元典 `get_case_detail` | 归一化后相等或互为子串 |
| 法院 | 同上（元典给 `city`） | 子串容错（`广东省佛山市中级人民法院` ⊃ `佛山市`） |
| 审结日期 | 仅法宝返回 | 预留 `datesAgree`，元典详情无此字段时不参与判定 |

退出码契约与 L1 脚本一致（0 一致 / 1 分歧 / 2 未能核验，fail-closed）。
`scripts/case-crosscheck.test.mjs`（`node --test`，10/10 通过）断言各失败路径。

**实跑结果（2026-10-13）**：库内三个案件序列的全部 4 个案号均 `AGREE`，exit 0：
`(2021)粤06民终16502号`（v1 二审）、`(2021)粤0605民初14458号`（v1 一审）、
`(2019)津01民初129号`（v2 民间借贷一审）、`(2024)豫01民终1195号`（v3 劳动争议二审）。
v1 二审审结日期 `2022.01.28`、v3 `2024.02.23` 均与库内记载一致。

**法院字段的假阳性（已修）**：元典案例详情返回的是 `city`（"佛山市""郑州市"，
甚至缩写"一中院"），不是法院名。把它当法院名比对，在
`(2019)津01民初129号` 上产生了假 DISAGREE——两家标题其实完全相同。
现改为：仅当两侧都像完整法院名（以"法院"结尾）才比对，否则标
`not_comparable`（**不可比不等于一致**，判定退回标题）。已有测试锁定。

**实现坑（已修）**：法宝 HTTP 层 `case_number_recognition` 直接返回**单个命中对象**，
而其 CLI 会包装成 `{ result: [...] }`。按 CLI 形状解析会把命中误判成"未找到"，
进而误报 UNCHECKED。脚本现兼容两种形状。

**已知局限**：
- 元典案例详情无审结日期字段，日期目前只有单源，未纳入判定
- 法宝 `case-keyword`（关键词检索）无案号入参，案号核验只能走 `anhao_recognition`
- 两家均为商业法源，数据同源性未知

### 元典接入 mike 的三条路线

#### ⚠️ 前提更正：`@yuandian/sdk` 不存在

npm 上 `@yuandian/sdk` 返回 **404**（`@yuandian/sdk@* is not in this registry`），
不存在该包。官方文档与 SDK 形态请以开放平台为准，不要按不存在的包名写实现。

真实存在的相关包（`npm view` 核实）：

| 包 | 版本 | 发布方 | 说明 |
| --- | --- | --- | --- |
| `yuandian-mcp-server` | 0.2.4 | `yuanli@ailaw.cn`（MIT） | **官方**：把本地 stdio MCP 透明代理到元典 Streamable HTTP MCP Server；默认代理 `https://open.chineselaw.com/mcp`，`YUANDIAN_API_KEY` 环境变量；Node ≥ 20 |
| `huayu-yuandian-legal-data` | 0.1.5 | `yuanli@ailaw.cn`，homepage `open.chineselaw.com` | **官方**：DeepSeek Harness（dsh）插件，仓库 `yuandian-ailaw/yuandian_dsh_plugin` |
| `chineselaw-mcp` | 1.0.0 | 第三方 `zooges` | 非官方，慎用 |
| `yd-mcp-server` | 0.6.0 | 无关（元点 Admin） | 同名干扰项，与元典无关 |

#### 路线 A（推荐，零代码）：mike MCP connector 直连 HTTP

mike 的 connectors 原生支持 `streamable_http` + `bearer`，元典端点本身就是
Streamable HTTP，**不需要 stdio 代理**：

| 字段 | 值 |
| --- | --- |
| Name | `yuandian` |
| URL | `https://open.chineselaw.com/mcp` |
| Bearer token | 开放平台 API Key |

在 **Settings > Connectors > + Custom** 填写。URL 会过
`backend/src/lib/mcp/client.ts` 的 `validateRemoteMcpUrl`（HTTPS + 公网 IP），该域名满足。

#### 路线 B：stdio 代理（仅在客户端只支持 stdio 时才需要）

```bash
YUANDIAN_API_KEY="<API Key>" npx -y yuandian-mcp-server@latest
```

mike 走 HTTP 即可，此路线对 mike 无必要；保留给只吃 stdio 的客户端。

#### 路线 C：mike 内建薄适配层（想要 UI 开关与结构化结果时）

平移 `backend/src/lib/courtlistener.ts` 的既有模式（lib 封装 + tools 定义 +
`ApiKeyProvider` + 设置开关），新增 `lib/yuandian.ts` 与 `tools/yuandianTools.ts`，
开关建议 `legal_research_cn`。**仅在需要把结果渲染进 mike UI、或做批量脚本时才值得**；
仅做核验时路线 A 足够。

#### 与 dsh 执行层的关系（未决线索）

`huayu-yuandian-legal-data` 是元典官方的 **DeepSeek Harness 插件**。若后续要把元典
接进 `d:\916938\deepseek-harness` 执行层，这是现成入口；但按既有结论，dsh 插件
属范本层、不接运行时，接入前须先核对其是否真能驱动运行时，勿假定。

#### 6. 处置纪律

- 条号修正属事实性勘误，按知识库治理（争议 009）应走裁决/勘误流程登记，
  **不得直接改骨架**。
- 勘误卡草稿已写就：`docs/drafts/勘误卡-民诉法执行编条号_v1_20261013.md`
  （含验证链、根因、影响面与三档候选处置），待走 12 夹裁决流程。

### 仍未核实的边界（不要跳过）

- 各服务的**入参/出参完整规格**：技术文档页（`mcp.pkulaw.com/docs?doc=…`）需登录后
  才能读取，未登录只返回工作区占位页。真实 schema 只能靠线网 `tools/list`
  （即 `pkulaw-mcp update` 后 `pkulaw-mcp tools <serverId>`）获取，
  **不要凭文档示例猜参数名**。
- 费用与配额、返回法条文本能否落库与再分发。

## 阶段 1：代码化（仅在阶段 0 验证通过后）

平移 CourtListener 的既有模式，而不是另起一套机制。已有可复用的骨架：

| 现有实现 | 位置 |
| --- | --- |
| 工具定义 + 系统提示词 | `backend/src/modules/chat/engine/tools/courtlistenerTools.ts` |
| 工具分发 | `backend/src/modules/chat/engine/tools/toolDispatcher.ts` |
| 工具装配与开关 | `backend/src/modules/chat/engine/streaming.ts`（`includeResearchTools`） |
| 系统提示词拼装 | `backend/src/modules/chat/engine/prompts.ts` |
| 用户级 API Key 提供器 | `backend/src/modules/user/user.apiKeyStore.ts`（`ApiKeyProvider`） |
| 设置开关（后端） | `backend/src/modules/user/user.settings.ts`（`legal_research_us`） |
| 设置开关（前端） | `frontend/src/app/(pages)/settings/features/page.tsx` |

需要新增的部分：

1. `backend/src/lib/pkulaw.ts` — 对应 `lib/courtlistener.ts`，封装令牌解析与调用。
2. `backend/src/modules/chat/engine/tools/pkulawTools.ts` — 工具定义与中文提示词。
3. `ApiKeyProvider` 增加 `"pkulaw"`，环境变量 `PKULAW_API_TOKEN`
    （参照 `user.apiKeyStore.ts:59` 的 `courtlistener` 分支）。
4. 设置开关 `legal_research_cn`：后端 `user.settings.ts` / `user.profile.validation.ts`
   / `user.profile.storage.ts`，前端 `features/page.tsx` 与 `UserProfileContext.tsx`。
5. 数据库迁移：若新增列，按 `AGENTS.md` 的迁移规范新增
   `backend/migrations/YYYYMMDD_NN_<name>.sql` 并同步 `backend/schema.sql`。

注意：`legal_research_us` 现有语义是「US 判例检索」，与「中国法条核验」不同，
应新增独立开关而非复用。

## 分工（与本次外部验证相关的三个仓）

- **mike**：核验执行点（本方案）。
- **xiaozheng-space**：验证过程的执行与留痕（可重复运行与证据追溯）。
- **Prism-Legal-OS**：不参与核验执行；其 `features/ai-drafting/README.md` 已声明
  AI 输出需人工核验，无中国法源能力。仅可作为核验结果的消费方。

## 未核实项（实施前必须确认）

1. 北大法宝 Token 的获取方式、费用与配额额度。
2. 各 MCP 端点实际返回结构，特别是是否含历史版本与效力期间字段。
3. 数据使用范围：返回的法条文本能否落库、能否再分发（关系到能否写进知识库）。
4. 元典智库（`chineselaw.com`）公开页面未见 API/MCP 说明，本方案不纳入；
   如需第二商业法源交叉，应另行核实其授权接入方式。
