# 盲测挂接结果（Kimi，本仓助手会话）：（2016）苏09民终867号 机动车交通事故责任纠纷（二审）

> **资格声明（必读）**：我在同一会话中此前读过本库《应用期真实案件序列 v1》（房屋买卖案）的挂接实例，**因此不是严格意义上的盲测方**——挂接可能受该实例层结构与字段选值习惯影响。本轮定位为参考样本与脚本验证基准，结论层不得当作无偏证据。

---

## L1 主张层

- `Claim-01` 上诉人（原审原告）邱荣珍诉请赔偿：claimType=**侵权**，basisNorm=侵权责任法第十九条/第四十八条，assertedByRole=原告，reviewOrder=1
  - `effect`=赔偿损失
- `Claim-02` 诉讼费用承担请求：claimType=侵权（附带），effect=承担诉讼费用

> 注：诉请为十余项费用合计 129596.93 元，我按「一个总赔偿 Claim + 明细进 L4 CaseElement」处理。骨架没有「费用明细表」类，明细挂 CaseElement 逐行——需要确认的取舍。

## L2 要件层

机动车交通事故责任纠纷属侵权，须挂：
- `Element-01` 侵权行为（hasElement ← Claim-01）
- `Element-02` 损害后果
- `Element-03` 因果关系
- `Element-04` 过错（本案交警认定全责，被告过错可推定）

骨架 `Element` 只有 `elementName` 一个属性，没有案由绑定点。机动车交通事故的 I2 要素映射我无法从骨架本身判定（`mapsToElement` 的 range 是 Element，但 ElementSchema 的 causeOfAction 属性是否覆盖此案由，需查 I2 资产件，盲测包未提供）。我按侵权四要件命名。

## L3 抗辩出罪层

- `Defense-01` 保险公司抗辩：defenseKind=**抗辩**，raisesDefense ← 保险公司 Role，defendsAgainst → Claim-01。内容：扣除 15% 非医保用药（未举证，不采信）
- `Defense-02` 保险公司抗辩：defenseKind=**抗辩**，defendsAgainst → Claim-01。内容：鉴定时机不当（内固定取出后仅一个多月即鉴定），主张鉴定违法
- `Defense-03` 保险公司抗辩：defenseKind=**抗辩**，defendsAgainst → Claim-01。内容：误工/护理/营养期限超出 GA/T1193-2014 规范上限
- `Defense-04` 保险公司抗辩：defenseKind=**抗辩**，defendsAgainst → Claim-01。内容：误工费证据虚假（工资发放表手写签字）
- `Defense-05` 保险公司抗辩：defenseKind=**抗辩**，defendsAgainst → Claim-01。内容：伤残等级应按农村标准计算

## L4 事实要素层

- `MaterialFact-01` 交通事故发生（2014-05-26 17:45，张银生开车门碰撞）
- `MaterialFact-02` 事故责任认定（张银生全责，邱荣珍无责）→ mapsToElement → Element-04
- `MaterialFact-03` 投保事实（交强险 + 30 万商业险，事故在保险期内）→ mapsToElement → Element-01
- `MaterialFact-04` 邱荣珍主要收入来自非农（村委会证明 + 楚某调查笔录）

`CaseElement` 逐行（judgmentOn 指向各行的处理）：

| 项 | claimantValue | defendantValue | courtFinding | objectionValue |
|---|---|---|---|---|
| 医疗费 | 62868.3 | 主张扣 15% | 62625.7 | 有异议 |
| 住院伙食补助费 | 2100 | 无异议 | 1890（105×18） | 无异议 |
| 营养费 | 1200 | 超规范上限 | 1080（120×9） | 有异议 |
| 残疾赔偿金 | 65257.4 | 应按农村标准 | 65257.4（城镇标准） | 有异议 |
| 误工费 | 28000 | 证据虚假/农村标准 | 22560（城镇标准） | 有异议 |
| 护理费 | 9000 | 超规范上限 | 9000 | 有异议 |
| 交通费 | 1000 | 只认可 200 | 200 | 有异议 |
| 精神损害抚慰金 | 5000 | — | 3000（酌减） | — |
| 拐杖费 | 110 | 手写发票不认可 | **不予支持** | 有异议 |
| 车辆损失 | 500 | 无证据 | **不予支持** | 有异议 |
| 鉴定费 | 1310 | — | 1310 | — |

`AdjudicativeFact`：
- `AF-01` 十级伤残 → findingBasis=司法鉴定意见书（evidenceType=鉴定意见）
- `AF-02` 误工 240 日/护理 150 日/营养 120 日 → findingBasis=同上
- `AF-03` 邱荣珍主要收入来自非农 → findingBasis=村委会证明 + 调查笔录（楚某陈述）

`findingBasis` 的 range 是 `[Evidence, Presumption]`，但司法实践中「裁判事实」的认定依据还常包括当事人陈述/自认。v3.4 原文列的 JudicialNotice/Admission/Mixed 三项仍在 P1 待裁决，我暂把村委会证明归入 Evidence（书证），调查笔录归入 Evidence（当事人陈述/证人证言边界——楚某是单位工作人员，我倾向证人证言）。

## L5 证据举证层

- `Evidence-01` 医疗费票据 16119.53 元（二审新提交）→ evidenceType=书证，submittedBy=原告
  - `EvidenceAdmissibilityFinding-01`：authenticity=真实（保险公司无异议），relevance=有关联（但公兴卫生院票据无医嘱关联部分有异议），subject=保险公司
- `Evidence-02` 盐阜司法【2015】临鉴字第413号鉴定意见书 → evidenceType=鉴定意见
  - `EvidenceAdmissibilityFinding-02`：三性均认定，争议在证明力而非可采性
- `Evidence-03` 村委会证明 ×2 → evidenceType=书证
- `Evidence-04` 楚某调查笔录 → evidenceType=证人证言（或当事人陈述，见上）
- `Evidence-05` 工资发放表（手写签字）→ evidenceType=书证，`EvidenceWeightFinding-01`：证明力低（形式瑕疵）

本案保险公司对鉴定的异议是「程序违法（时机不当）+ 超出规范」，实质是证明力/证明标准之争，但骨架 `ProofStandard.standardType` 只有 [优势证据/高度盖然性/排除合理怀疑]，`EvidenceWeightFinding` 只有 `weightQualitative` 一个属性——鉴定时机、规范上限这类具体质证理由无处安放。我暂挂 EvidenceWeightFinding 并用 weightQualitative 文字承载，这是表达力缺口。

`BurdenAssignment`：
- `Burden-01` 医疗费合理性举证 → holder=保险公司，isReversed=false（保险公司主张扣 15% 非医保用药但未举证，败）
- `Burden-02` 用药清单提供义务 → holder=原告，isReversed=false（法院认为原告拒不提供清单应承担不利后果——但最终未据此扣减）

## L6 程序时间层

- `ProcedureStage-01` 一审（阜宁县法院，2015 立案，procedureStageType=一审）
- `ProcedureStage-02` 二审（盐城中院，2016-02-22 立案受理，procedureStageType=二审）
- `appealsFrom`：Case(二审) → Case(一审)
- `ProcedureAct-01` 上诉（保险公司提起）
- `ProcedureAct-02` 鉴定委托（一审法院委托）
- `ProcedureAct-03` 调查取证（一审法院对楚某调查）

## L7 裁判层

本案判项是盲测的关键观察点。

- `Judgment-01`：disposition=**驳回**（驳回上诉，维持原判），judgmentOn → Claim-01'（二审 Claim 投影）
- `Judgment-02`：disposition=**维持**（维持原判），judgmentOn → 一审判项
- `Judgment-03`：disposition=**驳回**（驳回其他诉讼请求），judgmentOn → Claim-01（拐杖费、车辆损失两项）

骨架 v3.5 已有 Judgment 类与 disposition 八值枚举（fix7），本案判项能挂上。但一审判项本身（交强险赔 110017.4、商业险赔 55595.7、合计 165613.1、扣减垫付后实付 120870.33）在本案文书中是"经审理查明"段落转述，不是二审判决主文——若要记录一审判项金额，需不需要 Judgment 节点指向一审 Case？骨架的 judgmentOn.range 是 [Assertion, CaseElement]，没有指向 Case 的路径。这是我在 L7 遇到的结构疑问。

## A 论证争点翼

- `Issue-01` 医疗费应否扣除 15% 非医保用药 → issueStatus=裁判终结，raisedBy=保险公司
- `Issue-02` 鉴定程序是否合法 → issueStatus=裁判终结，raisedBy=保险公司
- `Issue-03` 误工/护理/营养期限是否超规范 → raisedBy=保险公司
- `Issue-04` 误工费证据是否虚假 → raisedBy=保险公司
- `Issue-05` 残疾赔偿金/误工费适用城镇还是农村标准 → raisedBy=保险公司
- `Preference-01`：法院采纳 Argument（程序合法 + 鉴定机构资质 + 异议方未举证），basis=举证责任分配 + 鉴定程序合法性审查

## R 法律关系翼

- 保险责任关系（交强险/商业险）——本案核心，但骨架 relationType 无枚举值约束，我标 relationType=保险责任，relationWingStatus=built
- 侵权责任关系（张银生 → 邱荣珍）
- 本案不属七类必建（担保等），按争议 007 降级建，标 degraded 亦可。但保险责任是交通事故案的核心关系，与"担保七连问"同级重要性是否应入必建清单？这是 P2 待裁决的潜在候选。

---

## 本轮发现的结构性缺口（盲测最有价值产出）

1. **明细费用无类可挂**——十余项赔偿明细只能逐行塞 CaseElement，"诉请金额构成"没有结构化落点
2. **Element 无案由绑定**——机动车交通事故的 I2 要素映射无法从骨架判定
3. **质证具体理由无处安放**——鉴定时机、规范上限等理由只能塞 weightQualitative 文字
4. **一审判项金额无挂接路径**——judgmentOn 不指向 Case，一审判项只能靠叙述
5. **保险责任关系的重要性**——是否应入 R 翼必建清单（P2 候选）
