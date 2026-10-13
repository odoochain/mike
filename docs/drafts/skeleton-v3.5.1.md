# 中国法本体骨架 v1 · 顶层 schema v3.5.1

| 项 | 内容 |
|---|---|
| 归属 | 13_资产库与工具箱 |
| 版本 | v3.5.1_20261009 |
| 决策依据 | 形式修正批次 0（台账 TD-01 部分/TD-02/TD-03/TD-04）；沿用争议 009「形式修正例外」与 F9 命名修正先例，不含建模变更；v3.5 的 P1–P3 仍待裁决 |
| 替代 | 顶层 schema v3.5；v3.5 转入历史存档 |
| 成熟度 | 可解析的本体规格；结构校验通过不等于实例校验、数据库集成或法律正确性已经验证 |

## 1. 本次变更

- v3.5.1 全部为**形式修正**（无建模变更，逐条见 YAML 头注释 G1–G4）：
  - G1：props/relations 同名清理（7 个标识符：`mapsToElement`/`correlativeOf`/`oppositeOf`/`preferredOver`/`requiredStandard`/`hasBurden`/`attackType`；统一"关系优先"，从 props 移除）。`assertedBy`/`acceptedBy`/`findingBasis` 因与认定类 domain 扩展及 P1 耦合，留待后续批次。
  - G2：`stage` → `procedureStage`（Justification/Excuse/Subsumption），解除 P4。
  - G3：补 `eventType`/`triggerType` 两个枚举及绑定（取值照录 04 夹《法律关系的生命周期》）。
  - G4：补 `wasDerivedFrom` 关系（alignment 段已引用但 relations 段未定义）。
- 48 类、43 关系、22 组枚举、18 条设计规则、15 个组件。
- v3.5 的建模变更（fix7 判项层 + fix8 仲裁前置）原样保留，见历史存档。

## 2. 发布前修正

- 版本及同意日期校正为 2026-10-06。
- 撤回草稿中“发回重审一律不得记录 effectiveDate”的规则；有依据才填写，未知留空，不从结果标签自动推断。
- 不把程序关系缺失直接当成未履行仲裁前置，也不把所有仲裁事项一概认定为前置程序。
- I2 的 67/67 是现行总纲和骨架的历史收官报告，未在本次重审全部行；旧清单的 8/67 是 2026-09-22 的时点，不是当前上限。

## 3. 验证与边界

v3.5.1 的验证范围（如实声明）：执行了 YAML 解析与自定义结构检查（48 类 / 43 关系 / 22 枚举 / 23 绑定 / 18 规则 / 15 组件；7 项断言全过：7 个标识符已清出 props、eventType/triggerType 枚举与绑定就位、wasDerivedFrom 就位、无残留裸 stage、关系 domain/range 无未知类、绑定无未知枚举/未知目标、procedureStage 绑定正确）。**未跑缺陷注入回归**——校验器脚本不在本次编辑环境可用范围内；v3.5 的回归记录不自动延续到本版，下游应重跑 `test_validate_skeleton.py` 后再用于生产。

design_rules 和 enum_constraints 中的实例规则还需要下游实例校验器消费；本次未连接生产数据库、未跑完整真实案件回归、未迁移 Rust 存储。

待裁决 P1（findingBasis 引用）、P2（关系翼必建清单）、P3（外围类落库范围）仍明确保留，不宣称已解决；P4（stage 语义）已在 v3.5.1 以 G2 解除。这些问题可能阻塞对应功能，不能以结构测试通过替代裁决。组件升层的警告是供人工复核，不是已证明组件不符合规则。

## 4. 完整 YAML

以下代码块与本地可解析骨架逐字一致，发布后通过下载比对校验，不另维护一份手工副本。

```yaml
# ============================================================
# 中国法本体骨架 v1 · 顶层 schema（可执行事实源）
# ------------------------------------------------------------
# 本文件是 IMA「法律本体学」知识库 13_资产库与工具箱
# 《中国法本体骨架v1_顶层schema（可机读骨架文件）_v3.4_20261002》
# 的出壳版本：剥离 Markdown 包装，成为可被解析器直接读取、
# 可被 CI 校验的唯一事实源。
#
# 版本沿革（IMA 侧）：
#   v1_20260921 → v2_20260921（争议裁决 004-008）
#   → v3_20261002（组件并入）→ v3.1（行政侧验证）
#   → v3.2（民事侧验证）→ v3.3（刑事侧验证）
#   → v3.4（答辩侧验证）
#   → **v3.4.1-unwrapped（出壳 + 12 处形式修正，无建模变更）**
#   → **v3.5（fix7 判项层 + fix8 仲裁前置，用户 2026-10-06 裁决）**
#   → **v3.5.1（本文件：G1–G4 形式修正，无建模变更，2026-10-09）**
#
# v3.5.1 相对 v3.5 的全部变更均为「形式修正」（依据争议 009 的形式修正例外，
# 与 F9 命名修正先例同性质；未走裁决卡，因为不含任何建模决策变更）：
#   G1 props/relations 同名清理（7 个标识符，统一「关系优先」，从 props 移除）：
#        MaterialFact.props 移除 mapsToElement；Element.props 移除 requiredStandard/hasBurden；
#        HohfeldRelation.props 移除 correlativeOf/oppositeOf；
#        Preference.props 移除 preferredOver；Attack.props 移除 attackType。
#        依据：13 夹《骨架反向核查试点报告（04·06夹）》§4.1 与《报告之二（03·05夹）》§4.1。
#        assertedBy/acceptedBy 与 findingBasis 因分别耦合「认定类 domain 扩展」（批次 3）
#        与 P1 裁决，本批不动。
#   G2 stage → procedureStage（Justification/Excuse/Subsumption 的 props 与绑定同步），
#        解除 pending_decisions.P4；沿用 F9（stageType→procedureStageType）命名修正先例。
#   G3 补 eventType/triggerType 两枚举及 binding（v3.5 有属性名无枚举值）；
#        取值照录 04 夹《法律关系的生命周期》§4 表 1 与 §7(2)，不自拟。
#   G4 补 wasDerivedFrom 关系（v3.5 alignment 段 PROV-O 条目已引用「推导来源」，
#        但 relations 段未定义——属 alignment 段悬空引用，见《报告之三》§1.2）。
#
# v3.5 是建模变更版本（非形式修正），经用户裁决，内容：
#   fix7 新增 L7 裁判层与 Judgment 类（disposition/amount/basis/rate/effectiveDate）
#        + judgmentOn 关系 + disposition 八值枚举 + design_rule 17
#        动因：三件真实判决书均命中「判项无落点」，此前只能塞 CaseElement.courtFinding
#   fix8 procedureStageType 增「仲裁」值 + arbitrationPrecedes + arbitratedAs 两条关系
#        + design_rule 18
#        动因：劳动争议仲裁前置程序无落点（雷某案 (2024)豫01民终1195号）
#
# v3.4.1-unwrapped 相对 v3.4 的全部变更均为「形式修正」，不含建模变更：
#   F1 第 173 行 `omain:` → `domain:`（拼写错误，preferredOver 关系）
#   F2 CauseOfAction/ChargeName 的 props 由散文 "同 CauseOfAction" 改为显式列举
#   F3 `objectionValue` 枚举值与 design_rules 中的 `conditional` 表述统一为「附条件」
#   F4 relations 的 domain/range 统一为数组形式（原混用标量与数组）
#   F5 interface 字段统一为字符串数组（原混用 "I2" 与 "I2/L6"）
#   F6 为 7 层 + 2 翼补 layer 枚举定义，使 classes.layer 可校验
#   F7 components.publicSubgraph / local 补 tier 字段，消除靠父键区分层级的隐式约定
#   F8 meta.coverage 的 "67/67（十批收官，2026-10-01）" 拆为结构化字段
#
# F9–F12 为校验器接入后追加的修正（校验器回归发现，均为形式修正）：
#   F9 ProcedureStage 的 `stageType` → `procedureStageType`（与 ReviewStage.stageType 同名歧义）
#   F10 新增 `property_enum_bindings` 段（19 条绑定），修复 YAML `on` 保留字陷阱
#   F11 校验绑定发现 stage/stageType 两个不同概念共用同类名——`stage` 绑到
#       `procedureStageType`（立案/一审/二审），`stageType` 独占 `ReviewStage`（三阶层）。
#       这是骨架自身的设计缺陷，留 v3.6 修正属性名（待 IMA 裁决）。
#   F12 新增 `test_validate_skeleton.py` 回归测试（8 类缺陷注入，全捕获）
#
# 任何「建模决策」变更必须走 IMA 12_应用与建模争议档案 的裁决卡流程，
# 不得直接改本文件。本文件只跟随裁决结果。
# ============================================================

meta:
  name: 中国法本体骨架 v1
  version: v3.5.1
  date: 2026-10-09
  derived_from:
    source: IMA 法律本体学 / 13_资产库与工具箱
    document: 中国法本体骨架v1_顶层schema（可机读骨架文件）_v3.5_20261006.md
    relation: 形式修正批次 0（G1–G4，无建模变更；争议 009 例外 + F9 先例）
  authority: |
    本文件为中国法本体的唯一事实源（single source of truth）。
    代码侧 schemas/litigation_*.yaml 为其投影，不得反向覆盖本文件。
    依据：IMA 12 夹争议 009 裁决。
  main_stem: Case -> Assertion(Claim/Charge) -> Element -> Defense -> Fact -> Evidence

  # F6：层定义显式化，使 classes.layer 可被校验
  layers:
    - {id: L0, name: 标签层,     note: 案由/罪名，SKOS 概念，不建 OWL 类}
    - {id: L1, name: 主张层,     note: Assertion 抽象父类，Claim/Charge 并列}
    - {id: L2, name: 要件层,     note: Element/CrimeElement，I2 映射目标}
    - {id: L3, name: 抗辩出罪层, note: 独立节点，禁做布尔字段}
    - {id: L4, name: 事实要素层, note: 生活事实/要件事实/裁判事实三分}
    - {id: L5, name: 证据举证层, note: 三性与证明力为独立认定节点}
    - {id: L6, name: 程序时间层, note: 程序阶段、行为、期间、时效}
    - {id: L7, name: 裁判层,     note: 'v3.5 新增（fix7）：判项与其金额三要素，裁判结果的唯一落点'}
  crosscutting:
    - {id: R, name: 法律关系翼, note: 按场景选建，七类必建}
    - {id: A, name: 论证争点翼, note: 对齐 AIF/ASPIC+/Dung}
  # '-' 表示外围依赖类，不属于主干分层
  layer_values: ['-', L0, L1, L2, L3, L4, L5, L6, L7, R, A]

  # 已裁决争议（来源：IMA 12 夹裁决卡）
  resolved:
    '004':
      topic: 形成权
      decision: Claim 子类（hohfeldGroup=power），不进 reviewOrder，行使效果落 LegalRelationEvent
    '005':
      topic: 案由多值
      decision: caseHasCauseOfAction 基数 1..n，唯一 isPrimaryCauseOfAction，统计只用主案由
    '006':
      topic: 要素与要件
      decision: 两层节点，mapsToElement 是映射非 rdf:type，未映射显式标 unmapped
    '007':
      topic: 法律关系翼
      decision: 按场景选建（暂定），担保类等七类必建，其余降级并标 relationWingStatus
      status: 暂定
    '008':
      topic: 刑民同父类
      decision: 新增抽象父类 Assertion，Claim/Charge 并列为其子类

  # F8：coverage 结构化
  coverage:
    I2:
      mapped: 67
      total: 67
      status: 收官
      as_of: '2026-10-01'
      note: |
        67/67 沿用 v3.4 骨架及唯一现行总纲 v3.28 的十批逐行映射收官记录。
        本次未逐行重审全部映射资产，不把文档报告值等同于机器验证结果。
        2026-09-22 清单中的 8/67 是历史时点，不代表当前覆盖率。
        字段采集、逐行映射、实例回归应分别记录分母、时点和验证依据；
        不得据旧清单把当前逐行映射覆盖率断定为 8/67。
    I4:
      defendant_side_categories: 13
      third_party_statement_types: 3
      ip_administrative_layers: [自认/异议, 举证, 质证, 攻防对照]
    articleNumbers:
      reconciled: 26
      outstanding: 0
      as_of: '2026-10-02'
      rule: 引用必带 validity period（design_rule 14）

global_properties:
  - {name: id,              note: 节点标识}
  - {name: sourceRef,       note: 原文出处（条号/页码/行号）}
  - {name: wasAttributedTo, note: 对齐 PROV-O，归属主体}
  - {name: assertedBy,      note: 主张方}
  - {name: acceptedBy,      note: 认定方}
  - {name: validFrom,       note: 事实有效起点}
  - {name: validTo,         note: 事实有效终点}
  - {name: schemeVersion,   note: 案由/罪名方案版本}

classes:
  # ---------- 外围依赖（layer: '-'） ----------
  Case:          {layer: '-', props: [caseNumber, schemeVersion, court, timeInterval, relationWingStatus]}
  Party:         {layer: '-', props: [partyType]}
  Role:          {layer: '-', props: [roleType, inStage]}
  LegalDocument: {layer: '-', props: [docType, docDate]}
  LegalNorm:     {layer: '-', props: [normFunction, deonticModality, isForbearance, effectiveFrom, effectiveTo]}
  Article:       {layer: '-', props: [articleNumber, statute], note: 条号引用须带 validity period（规则 14）}
  Provision:     {layer: '-', props: [provisionNumber]}

  # ---------- L1 主张层 ----------
  Assertion: {layer: L1, abstract: true, props: [assertedByRole, basisNorm, reviewOrder]}
  Claim:
    layer: L1
    parent: Assertion
    props: [claimType, reviewOrder, hohfeldGroup, effect]
    note: v3.2 加 effect——解除等形成权的法律后果子项（返还/恢复原状/赔偿损失），不单列 Claim
  Charge: {layer: L1, parent: Assertion, props: [chargeName, count]}

  # ---------- L2 要件层 ----------
  Element:      {layer: L2, props: [elementName]}
  CrimeElement: {layer: L2, parent: Element, props: [crimeElementType]}
  ReviewStage:  {layer: L2, props: [stageType]}

  # ---------- L3 抗辩出罪层 ----------
  Defense:          {layer: L3, props: [defenseKind, isExOfficio]}
  Justification:    {layer: L3, props: [assertedBy, acceptedBy, procedureStage]}
  Excuse:           {layer: L3, props: [assertedBy, acceptedBy, procedureStage]}
  SentencingFactor: {layer: L3, props: [factorType, affects]}

  # ---------- L4 事实要素层 ----------
  Fact:             {layer: L4, props: [factLayer]}
  LifeFact:         {layer: L4, parent: Fact}
  MaterialFact:     {layer: L4, parent: Fact, note: 与 CaseElement 的要素映射走 mapsToElement 关系（G1：不再列入 props）}
  AdjudicativeFact: {layer: L4, parent: Fact, props: [findingBasis]}
  CaseElement:
    layer: L4
    props: [claimantValue, defendantValue, isContested, courtFinding, findingBasis,
            mappedStatus, objectionValue, condition]
    note: v3.4 加 objectionValue（六值）+ condition（附条件异议的条件文本与指向）
  ElementSchema: {layer: L4, props: [elementName, valueType, enumValues, causeOfAction, version]}

  # ---------- L5 证据举证层 ----------
  Evidence: {layer: L5, props: [evidenceType, submittedBy, submittedAt]}
  EvidenceAdmissibilityFinding:
    layer: L5
    props: [authenticity, legality, relevance, assertedBy, acceptedBy, subject]
    note: 三性独立认定节点（争议 002）；v3 加 subject 承接 COMP-IV-01 质证对象
  EvidenceWeightFinding: {layer: L5, props: [weightQualitative], note: COMP-IV-01 第四元（证明力有无及大小）}
  Subsumption:      {layer: L5, props: [isContested, acceptedBy, procedureStage]}
  BurdenAssignment: {layer: L5, props: [burdenKind, holder, isReversed]}
  ProofStandard:    {layer: L5, props: [standardType]}
  Presumption:      {layer: L5, props: [isRebuttable, rebuttalStandard]}
  # 以下三类在 v3.4 的 findingBasis range 中被引用但未定义，v3.5 显式补齐为外围枚举值而非类
  # （见 relations.findingBasis 的 range_note）

  # ---------- L6 程序时间层 ----------
  # F9：v3.4 此处 props 写 stageType，与 L2 的 ReviewStage.stageType 同名
  #     但指向互不相容的枚举（立案/一审/二审 vs 该当性/违法性/有责性）。
  #     改为 procedureStageType，与既有同名枚举对齐。属命名修正，不改建模决策。
  ProcedureStage:   {layer: L6, props: [procedureStageType, court, timeInterval]}
  ProcedureAct:     {layer: L6, props: [actType, actor, occurredAt]}
  TimePeriod:       {layer: L6, props: [startRule, endRule]}
  LimitationPeriod: {layer: L6, props: [startRule, interruptionEvents, suspensionEvents]}

  # ---------- L7 裁判层（v3.5 新增，fix7） ----------
  # 动因：三件真实判决书均命中「判项无落点」——维持/撤销/改判/部分支持等
  # disposition 在骨架无节点可挂，此前只能零散塞进 CaseElement.courtFinding，
  # 导致「法院判了什么」与「某要素如何认定」两件事混在同一字段。
  # 民间借贷案进一步贡献新形态：判项会调整诉请的计算基数
  #（原告以 2226 万本息合计为基数，法院按 2100 万本金计），
  # 故 Judgment 须覆盖 amount/basis/rate 属性组，而非只有 disposition 一个标签。
  Judgment:
    layer: L7
    props: [disposition, amount, basis, rate, effectiveDate]
    note: |
      判项节点。一个 Judgment 对应裁判文书主文中的一项判决。
      disposition 为判项类型；amount/basis/rate 承载金额判项的三要素
      （判付金额 / 计算基数 / 利率或违约金标准），
      基数调整与司法酌减（如违约金日 0.1% 调为日万分之五）落在此处，
      不得塞回 CaseElement.courtFinding。
      effectiveDate 仅在有依据时记录，与裁判日期区分；未知留空，不按 disposition 自动推定。

  # ---------- L0 标签层（SKOS，不建 OWL 类） ----------
  # F2：原 ChargeName 的 props 写作散文 "同 CauseOfAction"，此处显式列举
  CauseOfAction:
    layer: L0
    as: skos:Concept
    props: [prefLabel, altLabel, notation, broader, narrower, scopeNote,
            changeNote, deprecated, skosReplacedBy]
  ChargeName:
    layer: L0
    as: skos:Concept
    props: [prefLabel, altLabel, notation, broader, narrower, scopeNote,
            changeNote, deprecated, skosReplacedBy]

  # ---------- R 法律关系翼 ----------
  LegalRelation:      {layer: R, props: [relationType, hasScope]}
  HohfeldRelation:    {layer: R, props: [hohfeldPosition, timeInterval], note: 'G1：correlativeOf/oppositeOf 为关系，不再列入 props'}
  LegalRelationEvent: {layer: R, props: [eventType, triggerType]}
  CapacityAssessment: {layer: R, props: [capacityType, scope, timeInterval]}
  LegalObject:        {layer: R, props: [objectType, needsStatutoryBasis]}

  # ---------- A 论证争点翼 ----------
  Issue:            {layer: A, props: [issueStatus, raisedBy]}
  Argument:         {layer: A, props: [defeatStatus]}
  ArgumentScheme:   {layer: A, props: [schemeType]}
  CriticalQuestion: {layer: A, props: [cqText, isAnswered]}
  Attack:           {layer: A, note: 'G1：attackType 由 attacks 边携带，Attack 类本身暂无自有属性（孤立类，待批次 2 接入）'}
  Preference:       {layer: A, props: [basis]}

# F4：domain/range 统一为数组；F5：interface 统一为数组
relations:
  - {name: isExpressedIn,  domain: [LegalNorm], range: [Article]}
  - {name: hasProvision,   domain: [Article],   range: [Provision]}
  - name: caseHasCauseOfAction
    domain: [Case]
    range: [CauseOfAction]
    cardinality: '1..n'
    props: [schemeVersion, isPrimaryCauseOfAction, causeRole]
  - {name: caseHasCharge,  domain: [Case], range: [ChargeName]}
  - {name: causeOfActionInvolvesNorms, domain: [CauseOfAction], range: [LegalNorm], interface: [I1]}
  - {name: partyHasRole,   domain: [Party], range: [Role]}
  - {name: roleInCase,     domain: [Role],  range: [Case]}
  - {name: asserts,        domain: [Role],  range: [Assertion]}
  - {name: claimArisesFromNorm, domain: [Assertion], range: [LegalNorm]}
  - {name: hasElement,     domain: [Assertion], range: [Element]}
  - name: elementBelongsToStage
    domain: [CrimeElement]
    range: [ReviewStage]
    interface: [I3]
    note: I3 边必须带 disputeNote 消费（v3 强化）
  - name: mapsToElement
    domain: [CaseElement, MaterialFact]
    range: [Element]
    interface: [I2]
    note: 争议 006；I2 已 67/67 收官
  - {name: isProvedBy, domain: [AdjudicativeFact], range: [Evidence], interface: [I4]}
  - name: findingBasis
    domain: [AdjudicativeFact, CaseElement]
    range: [Evidence, Presumption]
    interface: [I4]
    range_note: |
      v3.4 原文另列 JudicialNotice / Admission / Mixed 三项，但 classes 段未定义它们。
      v3.5 不擅自建类，改为记入待裁决项：
      应确认其为 findingBasis 的枚举取值（推荐），还是需要新建三个 L5 类。
      见 pending_decisions.P1。
  - {name: hasBurden,        domain: [Element, MaterialFact], range: [BurdenAssignment]}
  - {name: requiredStandard, domain: [Element], range: [ProofStandard]}
  - {name: defendsAgainst,   domain: [Defense, Justification, Excuse], range: [Assertion]}
  - {name: raisesDefense,    domain: [Role], range: [Defense]}
  - name: assertedBy
    domain: [Defense, Justification, Excuse, Evidence]
    range: [Role]
    interface: [I6]
  - name: acceptedBy
    domain: [Defense, Justification, Excuse, Evidence]
    range: [Role]
    interface: [I6]
  - {name: concursWith,      domain: [Assertion], range: [Assertion], interface: [I5]}
  - {name: isSubsumedUnder,  domain: [Subsumption], range: [Element]}
  - {name: subsumesFact,     domain: [Subsumption], range: [Fact]}
  - {name: hasIssue,         domain: [Case], range: [Issue], interface: [I8]}
  - name: issueConcerns
    domain: [Issue]
    range: [Assertion, Element, CaseElement]
    interface: [I8]
  - {name: mediates,     domain: [LegalRelation], range: [Party]}
  - {name: hasObject,    domain: [LegalRelation], range: [LegalObject]}
  - {name: correlativeOf, domain: [HohfeldRelation], range: [HohfeldRelation]}
  - {name: oppositeOf,   domain: [HohfeldRelation], range: [HohfeldRelation]}
  - name: outranks
    domain: [LegalRelation, HohfeldRelation]
    range: [LegalRelation, HohfeldRelation]
    note: 禁止数字 rank，必带 rankBasis/rankTime/ruleRef
  - {name: hasRelationEvent, domain: [LegalRelation], range: [LegalRelationEvent]}
  - name: requiresCapacity
    domain: [ProcedureAct, LegalRelationEvent]
    range: [CapacityAssessment]
  - {name: supports, domain: [Argument], range: [Argument, Assertion]}
  - {name: attacks,  domain: [Argument], range: [Argument, Assertion], props: [attackType]}
  # F1：v3.4 此行误写 `omain:`，修正为 domain
  - {name: preferredOver, domain: [Preference], range: [Argument]}
  - {name: appealsFrom,   domain: [Case], range: [Case]}
  - {name: occursInStage, domain: [ProcedureAct], range: [ProcedureStage]}
  - name: triggerFillsElement
    domain: [ProcedureAct]
    range: [Element, CaseElement]
    interface: [I2, L6]
    note: v3.3 新增（fix5）——程序触发器→要素补全联动（网络协助勾选→公安协助取证→补齐主体身份）
  - name: wasAttributedTo
    domain: ['*']
    range: [Role]
    note: 对齐 PROV-O
  # G4（v3.5.1）：补 alignment 段已引用但 relations 段未定义的关系
  - name: wasDerivedFrom
    domain: ['*']
    range: ['*']
    note: 对齐 PROV-O 推导来源；记录认定/结论由何派生（如裁判事实由证据推理派生）

  # ---------- v3.5 新增关系（fix7 + fix8） ----------
  - name: judgmentOn
    domain: [Judgment]
    range: [Assertion, CaseElement]
    interface: [I9]
    note: |
      v3.5 新增（fix7）：判项→被裁判对象。
      range 含 Assertion（整项诉请/指控被判）与 CaseElement
      （某具体要素行被单独裁断，如基数调整只针对「借款本金」一行）。
      一条诉请可有多个 Judgment（如本金支持、利息部分支持），不合并。
  - name: arbitrationPrecedes
    domain: [ProcedureStage]
    range: [ProcedureStage]
    interface: [I9]
    note: |
      v3.5 新增（fix8）：记录适用仲裁前置要求的程序衔接。
      direction 为仲裁阶段指向对应诉讼阶段，不表示任意仲裁都具有诉讼前置效力。
      未找到此边只代表记录缺失，不能直接推定当事人未经过仲裁或请求不适格。
      适用范围及例外应由已核验的规则另行判定。
  - name: arbitratedAs
    domain: [Claim]
    range: [Claim]
    interface: [I9]
    note: |
      v3.5 新增（fix8）：方向固定为仲裁请求项指向对应诉讼请求项。
      两端为不同阶段的独立请求记录；可一对多或多对一，保留各自来源与阶段。
      未匹配的新请求必须显式报告，映射关系本身不判断新增请求是否允许。
      此边为请求范围复核提供依据，不自动作出程序适格结论。

enums:
  claimType:
    # 民事基础
    - 合同履行
    - 违约
    - 缔约过失
    - 无因管理
    - 不当得利
    - 物权请求权
    - 侵权
    - 继承
    - 形成权
    - statutoryPriority      # v3：COMP-MAR-01 法定优先权主张位
    # v3.1：行政八值（与行政诉讼法裁判方式镜像）
    - 撤销行政行为
    - 确认违法
    - 确认无效
    - 变更行政行为
    - 责令采取补救措施
    - 行政赔偿
    - 履行法定职责
    - 给付
    # v3.2：民事确认形成类五值（房屋买卖诉请 1 六选位覆盖）
    - 确认合同无效
    - 确认合同未成立
    - 撤销合同
    - 继续履行
    - 订立本约
  defenseKind:      [抗辩, 抗辩权, 例外]
  crimeElementType: [犯罪客体, 犯罪客观方面, 犯罪主体, 犯罪主观方面]
  stageType:        [该当性, 违法性, 有责性]
  factLayer:        [生活事实, 要件事实, 裁判事实]
  evidenceType:     [当事人陈述, 书证, 物证, 视听资料, 电子数据, 证人证言, 鉴定意见, 勘验笔录]
  hohfeldPosition:  [right, duty, privilege, no-right, power, liability, immunity, disability]
  standardType:     [优势证据, 高度盖然性, 排除合理怀疑]
  attackType:       [rebut, undermine, undercut]
  # v3.5（fix8）：增「仲裁」——劳动争议等仲裁前置程序此前无落点。
  # 置于「立案」之前，因仲裁发生在诉讼立案前。
  procedureStageType: [仲裁, 立案, 一审, 二审, 再审, 执行]
  objectType:       [物, 智力成果, 数据, 网络虚拟财产, 人格利益]
  normFunction:     [构成性规则, 调整性规则]
  deonticModality:  [应当, 禁止, 许可]
  hohfeldGroup:     [claim, power]
  causeRole:        [立案案由, 审理案由, 并列案由]
  relationWingStatus: [built, degraded, notBuilt]
  mappedStatus:     [mapped, unmapped]
  partySide:        [原告侧, 被告侧]
  # F3：v3.4 枚举列「附条件」而注释写 conditional，此处统一为「附条件」
  objectionValue:   [无异议, 有异议, 部分异议, 不争执, 不知悉, 附条件]
  # v3.5 新增（fix7）：判项类型。
  # 「部分支持（含基数/标准调整）」独立成值而非归入「部分支持」——
  # 民间借贷案中法院把计算基数从 2226 万（本息合计）改为 2100 万（本金），
  # 违约金标准从日 0.1% 酌减为日万分之五（民法典 585 条 2 款）：
  # 这类判项在金额上「部分支持」，但真正变动的是基数或标准，
  # 混入「部分支持」会让「法院改了什么」在统计上消失。
  disposition:
    - 支持
    - 驳回
    - 部分支持
    - 部分支持（含基数/标准调整）
    - 维持
    - 撤销
    - 改判
    - 发回重审
  # G3（v3.5.1）：补 LegalRelationEvent 两个属性的枚举（v3.5 有属性名无枚举值）。
  # 取值照录 04 夹《法律关系的生命周期》§4 表 1 与 §7(2)，不自拟。
  eventType:        [creates, modifies, transfers, extinguishes]
  triggerType:      [juristicAct, factualAct, prescribedEvent, otherStatutory]

enum_constraints:
  - enum: objectionValue
    value: 附条件
    requires: [condition]
    note: 取「附条件」时 CaseElement.condition 必填（条件文本 + 条件指向的诉请/事实）
  - enum: claimType
    value: 形成权
    requires_prop: {hohfeldGroup: power}
    forbids: [reviewOrder]
    note: 争议 004——形成权 reviewOrder 须留空
  # v3.5 新增（fix7）
  - enum: disposition
    value: 部分支持（含基数/标准调整）
    requires: [basis]
    note: |
      取此值时 Judgment.basis 必填（说明调整后的基数或标准）。
      仅标 disposition 而不记基数，等于丢掉了判项的实际内容。

# F10：声明属性 → 枚举取值域的绑定。v3.4 未声明，导致 partySide 等枚举
#      在文件中悬空（无法校验谁在用它）。只补绑定，不改任何取值。
property_enum_bindings:
  - {property: subject,            enum: partySide,          applies_to: [EvidenceAdmissibilityFinding]}
  - {property: disposition,        enum: disposition,         applies_to: [Judgment]}
  - {property: procedureStageType, enum: procedureStageType,  applies_to: [ProcedureStage]}
  - {property: stageType,          enum: stageType,           applies_to: [ReviewStage]}
  # G2（v3.5.1）：stage → procedureStage，与 ReviewStage.stageType 隔离。
  #   - ReviewStage.stageType → 该当性/违法性/有责性（三阶层，L2）
  #   - Justification/Excuse/Subsumption.procedureStage → 立案/一审/二审（程序阶段，L6）
  # 迁移说明：v3.5 及以前的 `stage` 字段一律读作 `procedureStage`；P4 已解除。
  - {property: procedureStage,     enum: procedureStageType,  applies_to: [Justification, Excuse, Subsumption]}
  - {property: claimType,          enum: claimType,           applies_to: [Claim]}
  - {property: crimeElementType,   enum: crimeElementType,    applies_to: [CrimeElement]}
  - {property: factLayer,          enum: factLayer,           applies_to: [Fact]}
  - {property: evidenceType,       enum: evidenceType,        applies_to: [Evidence]}
  - {property: hohfeldPosition,    enum: hohfeldPosition,     applies_to: [HohfeldRelation]}
  - {property: hohfeldGroup,       enum: hohfeldGroup,        applies_to: [Claim]}
  - {property: defenseKind,        enum: defenseKind,         applies_to: [Defense]}
  - {property: objectionValue,     enum: objectionValue,      applies_to: [CaseElement]}
  - {property: mappedStatus,       enum: mappedStatus,        applies_to: [CaseElement]}
  - {property: relationWingStatus, enum: relationWingStatus,  applies_to: [Case]}
  - {property: objectType,         enum: objectType,          applies_to: [LegalObject]}
  - {property: normFunction,       enum: normFunction,        applies_to: [LegalNorm]}
  - {property: deonticModality,    enum: deonticModality,     applies_to: [LegalNorm]}
  - {property: causeRole,          enum: causeRole,           applies_to: [caseHasCauseOfAction]}
  - {property: attackType,         enum: attackType,          applies_to: [attacks]}
  - {property: standardType,       enum: standardType,        applies_to: [ProofStandard]}
  # G3（v3.5.1）：补 eventType/triggerType 绑定
  - {property: eventType,          enum: eventType,           applies_to: [LegalRelationEvent]}
  - {property: triggerType,        enum: triggerType,         applies_to: [LegalRelationEvent]}

design_rules:
  - id: 1
    rule: 规范(LegalNorm)、条文(Article)、条款(Provision) 必须分三层，不得合并
  - id: 2
    rule: 抗辩与出罪事由必须是独立节点，禁止做成 Claim 的布尔字段
  - id: 3
    rule: 证据三性必须是独立认定节点，禁止做成 Evidence 的属性
    source: 争议 002
  - id: 4
    rule: 举证责任必须挂在 Element / MaterialFact 上，禁止挂在 Party 上
  - id: 5
    rule: 案由罪名为 SKOS 概念，禁止建 OWL 类继承
  - id: 6
    rule: 要建子类前先考虑加枚举属性
  - id: 7
    rule: 任何认定类节点必须同时具备 assertedBy 与 acceptedBy
  - id: 8
    rule: 时间建模默认时间戳字段，仅在时效/期间场景启用 LimitationPeriod
  - id: 9
    rule: 形成权入 claimType 枚举并用 hohfeldGroup=power 标注，禁止另建顶层类，且 reviewOrder 留空
    source: 争议 004
  - id: 10
    rule: 案由多值共存但主案由唯一，统计与类案分组键只用主案由
    source: 争议 005
  - id: 11
    rule: mapsToElement 未覆盖的行必须显式标 unmapped，缺口不得静默隐藏
    source: 争议 006
  - id: 12
    rule: R 法律关系翼按场景选建——七类必建，其余降级并在 Case.relationWingStatus 标注
    source: 争议 007（暂定）
  - id: 13
    rule: Assertion 为抽象父类，禁止直接实例化；新增民刑公共属性一律上提至 Assertion
    source: 争议 008
  - id: 14
    rule: 条号引用必须带 validity period 三要素（修正前条号/修正后条号/生效日期）——法律修订位移是常态
  - id: 15
    rule: 组件升 L2 公共子图标准——复用 ≥3 次且跨案由，或攻防双侧复用，满足其一即升
  - id: 16
    rule: 质证不新建类——映射到 EvidenceAdmissibilityFinding（三性）+ EvidenceWeightFinding（证明力）+ subject 属性
    aligns: [3, 6]
  - id: 17
    rule: 判项必须建成 Judgment 节点，禁止塞进 CaseElement.courtFinding
    source: v3.5 fix7
    note: |
      courtFinding 回答「某要素如何被认定」，Judgment 回答「法院判了什么」，
      两者是不同层次的事实。混用会让「判项统计」与「要素认定统计」互相污染。
  - id: 18
    rule: 仲裁前置案由必须建 procedureStageType=仲裁 的阶段节点并用 arbitrationPrecedes 连到诉讼阶段
    source: v3.5 fix8
    note: |
      缺此结构则无法在图上回答「是否已过仲裁前置」，
      而该问题是劳动争议等案由的程序适格前提。

# F7：原靠 publicSubgraph/local 父键隐式区分层级，此处补显式 tier
components:
  COMP-SEC-01:
    tier: publicSubgraph
    name: 担保七连问
    instances: [金融借款, 信用卡, 融资租赁, 执行担保]
    slots: [担保方式, 债权种类及数额, 担保范围, 担保期间, 担保物情况, 权利瑕疵, 责任承担条件]
  COMP-IPA-02:
    tier: publicSubgraph
    name: 专利有效性五分项攻防表
    instances: [专利驳回复审, 专利无效（起诉状+第三人陈述书双侧）]
    slots:
      - 新颖性(专利法22.2)
      - 创造性(专利法22.3)
      - 实用性(专利法22.4)
      - 公开充分(专利法26.3)
      - 权利要求支持(专利法26.4)
    columns: [争议技术特征, 现有技术特征, 被诉决定认定, 分析意见]
  COMP-ADM-01:
    tier: publicSubgraph
    name: 行政共性尾部四行
    instances: [行政10类, 行政处罚]
    slots: [复议诉讼情况, 其他说明, 证据清单, 是否存在违法之处综合审查位]
    subRowRule: 勾「是」后 violations[] 每个具体情形独立成子行，逐子行 mapsToElement
  COMP-EXE-01:
    tier: publicSubgraph
    name: 执行事项枚举表
    instances: [执行异议, 执行复议, 执行监督]
    slots: [执行标的, 执行立案, 执行标的额, 查扣冻, 评估鉴定询价议价, 财产处置, 财产分配发放, 执行结案, 其他]
    note: 复议/监督 = 异议 ∪ {惩戒措施}
  COMP-IPR-01: {tier: local, name: 知产权利基础五要素, instances: [知产民事9类, 知产行政6类]}
  COMP-IPR-02: {tier: local, name: 被许可人起诉权限三档, instances: [知产民事9类]}
  COMP-INS-01: {tier: local, name: 保险提示说明双字段, instances: [保证保险, 责任保险, 人身保险]}
  COMP-LEASE-01: {tier: local, name: 互斥双轨诉请, instances: [融资租赁]}
  COMP-SECUR-01: {tier: local, name: 时间四钉+双段因果, instances: [证券虚假陈述]}
  COMP-MAR-01:
    tier: local
    name: 船舶优先权主张位
    instances: [海上人身损害, 船员劳务, 参与分配（执行侧实例）]
    validityPeriod:
      '1993版': '22/28/29'
      '2025修订版': '22/27/28'
      生效: '2026-05-01'
  COMP-DEF-01:
    tier: local
    name: 双段制挂接规则
    instances: [答辩状13类]
    note: v3.4——答辩表态从五值扩为六值（增「附条件」）
  COMP-GJ-01: {tier: local, name: 国赔赔偿项目分型枚举, instances: [国赔4类, 国赔答辩镜像]}
  COMP-PP-01: {tier: local, name: 自诉共用骨架+罪名插槽, instances: [侮辱, 诽谤, 重婚, 拒执]}
  COMP-IPA-01: {tier: local, name: 知产行政争点圈定双勾选, instances: [商标驳回复审, 商标无效]}
  COMP-IV-01:
    tier: local
    name: 质证意见四元组
    instances: [第三人意见陈述书3类型]
    note: 对齐 EvidenceAdmissibilityFinding + EvidenceWeightFinding + subject，不新建类

alignment:
  LKIF-Core:
    norm: qualification(资格认定)，与 Article 分离
    legal-action: ProcedureAct
    role: Role
    modification: Defense 挂钩点
  UFO-L/gUFO:
    relator: LegalRelation
    mediates: mediates
  SKOS:
    ConceptScheme: 案由/罪名
    versioning: changeNote/skosReplacedBy
  PROV-O:
    wasAttributedTo: 全局溯源
    wasDerivedFrom: 推导来源
  OWL-Time:
    time: Instant/Interval
    note: 期间计算规则自建 LimitationPeriod
  AIF/ASPIC+/Dung:
    constructs: Argument/Attack/defeatStatus
    mapsTo: 论证翼

# 出壳过程中发现、但不属于形式问题的待裁决项。
# 按纪律不在本文件自行决定，须走 IMA 12 夹裁决卡。
pending_decisions:
  P1:
    topic: findingBasis 的 JudicialNotice / Admission / Mixed 三项定性
    detail: v3.4 在 findingBasis.range 列出三项，但 classes 段未定义，形成悬空引用
    options:
      - 定为 findingBasis 的枚举取值（推荐，符合 design_rule 6「先加枚举再建类」）
      - 新建三个 L5 类
    blocking: 落库时 range 无法校验
  P2:
    topic: 争议 007「法律关系翼按场景选建」仍标暂定
    detail: 七类必建清单未在骨架内枚举，只在散文中提及
    options:
      - 在 meta.resolved.007 下显式列出七类
      - 转为 enum 并加校验
    blocking: relationWingStatus=degraded 的判定无客观依据
  P3:
    topic: layer '-' 的外围依赖类是否纳入落库范围
    detail: Case/Party/Role 等 7 个类不属 7 层主干，但落库必须存在
    blocking: 图 schema 边界不清
  P4:
    topic: stage 与 stageType 同名属性指向不同枚举（设计缺陷）
    status: 已解决（v3.5.1 G2，2026-10-09）
    resolution: |
      按推荐方案执行：`stage` 重命名为 `procedureStage`（Justification/Excuse/Subsumption），
      绑定表同步，迁移说明见 property_enum_bindings 段 G2 注释。
      沿用 F9（stageType→procedureStageType）命名修正先例，属形式修正，未走裁决卡。
    discovered_by: 校验器 property_enum_bindings 接入时误绑 stageType 被抓出
    date: '2026-10-05'

```
