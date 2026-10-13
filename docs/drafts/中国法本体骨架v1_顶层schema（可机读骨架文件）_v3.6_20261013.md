# 中国法本体骨架 v1 · 顶层 schema v3.6

| 项 | 内容 |
|---|---|
| 归属 | 13_资产库与工具箱 |
| 版本 | v3.6_20261013 |
| 决策依据 | **建模变更**（依据 2026-10-13 用户一次性裁定：争议 010 的 P1／P1-扩展／P2／P3 + 争议 011 + 争议 012）；P4 为形式修正随批执行 |
| 替代 | 顶层 schema v3.5.1；v3.5.1 转入历史存档 |
| 成熟度 | 可解析的本体规格；结构校验通过不等于实例校验、数据库集成或法律正确性已经验证 |

## 1. 本次变更（建模变更，逐条对应裁决）

依据用户 2026-10-13 一次性裁定：

| # | 变更 | 依据 | 性质 |
|---|---|---|---|
| C1 | `findingBasis` 拆分：关系保留、新增 `findingBasisKind` 属性承载司法认知、新建 `AdmissionFinding` 类、删除 Mixed | 争议 010 P1 方案（拆分） | 建模变更 |
| C2 | `findingBasisKind` 枚举范围扩入**法院酌定** | 争议 012 实证发现（四方盲测收敛） | 建模变更 |
| C3 | 新增 `relation_wing_triggers` 结构化段（七类必建清单入骨架，带 `status: 暂定`） | 争议 010 P2 | 建模变更 |
| C4 | 外围依赖类加 `scope` 三分（core／reference／document） | 争议 010 P3 | 建模变更 |
| C5 | `stage` → `procedureStage` 及绑定同步 | 争议 010 P4 | **形式修正**（随批，含迁移对照） |
| C6 | 论证翼四边接入：`usesScheme`／`hasCriticalQuestion`／`attackTargets`／`argumentAddresses` | 争议 011 方案 A | 建模变更 |
| C7 | `judgmentOn`／`attacks`／`issueConcerns` 三处 range 补 `Judgment` | 争议 012 缺口一 方案 A | 建模变更 |
| C8 | `disposition` 枚举增「费用负担」值 | 争议 012 缺口二 方案 A | 建模变更 |
| C9 | 新增 `AppellateRequest` 类（Assertion 子类，与 Claim 并列） | 争议 012 缺口三 方案 B | 建模变更 |

规模：48 类 → **50 类**（+AdmissionFinding、+AppellateRequest）；关系 +4 → 47；枚举 +1（findingBasisKind）；孤立类清零。

---

## 2. 完整 YAML

```yaml
# ============================================================
# 中国法本体骨架 v1 · 顶层 schema（可执行事实源）v3.6
# ------------------------------------------------------------
# 本文件是 IMA「法律本体学」知识库 13_资产库与工具箱 的出壳骨架。
#
# 版本沿革（IMA 侧）：
#   v1_20260921 → v2_20260921（争议裁决 004-008）
#   → v3_20261002（组件并入）→ v3.1（行政侧验证）
#   → v3.2（民事侧验证）→ v3.3（刑事侧验证）
#   → v3.4（答辩侧验证）
#   → v3.4.1-unwrapped（出壳 + F1-F12 形式修正）
#   → v3.5（fix7 判项层 + fix8 仲裁前置，用户 2026-10-06 裁决）
#   → v3.5.1（G1-G4 形式修正，2026-10-09）
#   → **v3.6（本文件：C1-C9 建模变更，依据用户 2026-10-13 一次性裁定）**
#
# v3.6 变更依据（均为建模决策变更，已走 12 夹裁决卡并获裁定）：
#   C1 争议 010 P1：findingBasis 拆分。原 range 列 JudicialNotice/Admission/Mixed
#      三项但 classes 未定义（悬空引用）。按裁决：
#      - findingBasis 关系保留（认定依据，domain 不变）
#      - 新增 findingBasisKind 属性 + 枚举，承载「司法认知」等无独立节点的认定形态
#      - 新建 AdmissionFinding 类（自认认定，与其他认定类节点同构，遵守 design_rule 7）
#      - 删除 Mixed（无独立语义，不单列）
#      依据：争议 010 第 2 节 + 争议 002（三性独立认定节点）的同一手法。
#   C2 争议 012 实证：法院酌定（如精神损害抚慰金酌定、交通费酌定）既非 Evidence
#      亦非 Presumption，原 findingBasis 无法表达。扩入 findingBasisKind 枚举。
#      依据：L3 盲测第一轮四方收敛（实例 A/B/C + kimi 参考样本，2026-10-13）。
#   C3 争议 010 P2：七类必建清单入骨架为 relation_wing_triggers 段。
#      取值照录 13 夹《法律关系翼必建触发清单》第 2 节 T1-T7，不自拟。
#      必须带 status: 暂定——争议 007 理由 5：「写成永久清单比没有清单更危险」。
#   C4 争议 010 P3：外围依赖类加 scope 三分（core/reference/document），
#      明确落库边界，消除「layer '-' 是否落库」的歧义。
#   C5 争议 010 P4（形式修正）：stage → procedureStage 及绑定同步。
#      迁移：v3.5.1 及以前的 stage 一律读作 procedureStage。
#   C6 争议 011 方案 A：论证翼四边接入，零新类。
#      四边 domain/range 全部落在现有类内，自检无悬空。
#   C7 争议 012 缺口一：judgmentOn/attacks/issueConcerns 三处 range 补 Judgment。
#      原「维持原判」等审级判项指向一审 Judgment 时无合法 range。
#   C8 争议 012 缺口二：disposition 增「费用负担」值。
#      诉讼费/鉴定费负担判项原无处安放，只能塞 basis 或 courtFinding（违反 design_rule 17）。
#   C9 争议 012 缺口三：新增 AppellateRequest 类（Assertion 子类）。
#      二审上诉/审级请求原不属 claimType 任何枚举值；与 Claim 并列而非塞入 Claim。
#
# 任何「建模决策」变更必须走 IMA 12_应用与建模争议档案 的裁决卡流程，
# 不得直接改本文件。本文件只跟随裁决结果。
# ============================================================

meta:
  name: 中国法本体骨架 v1
  version: v3.6
  date: 2026-10-13
  derived_from:
    source: IMA 法律本体学 / 13_资产库与工具箱
    document: 中国法本体骨架v1_顶层schema（可机读骨架文件）_v3.5.1_20261009.md
    relation: 建模变更批次（C1-C9；依据用户 2026-10-13 一次性裁定：争议 010/011/012）
  authority: |
    本文件为中国法本体的唯一事实源（single source of truth）。
    代码侧 schemas/litigation_*.yaml 为其投影，不得反向覆盖本文件。
    依据：IMA 12 夹争议 009 裁决。
  main_stem: Case -> Assertion(Claim/Charge/AppellateRequest) -> Element -> Defense -> Fact -> Evidence

  layers:
    - {id: L0, name: 标签层,     note: 案由/罪名，SKOS 概念，不建 OWL 类}
    - {id: L1, name: 主张层,     note: Assertion 抽象父类，Claim/Charge/AppellateRequest 并列}
    - {id: L2, name: 要件层,     note: Element/CrimeElement，I2 映射目标}
    - {id: L3, name: 抗辩出罪层, note: 独立节点，禁做布尔字段}
    - {id: L4, name: 事实要素层, note: 生活事实/要件事实/裁判事实三分}
    - {id: L5, name: 证据举证层, note: 三性与证明力为独立认定节点}
    - {id: L6, name: 程序时间层, note: 程序阶段、行为、期间、时效}
    - {id: L7, name: 裁判层,     note: 'v3.5 新增（fix7）：判项与其金额三要素，裁判结果的唯一落点'}
  crosscutting:
    - {id: R, name: 法律关系翼, note: 按场景选建，七类必建（见 relation_wing_triggers）}
    - {id: A, name: 论证争点翼, note: 对齐 AIF/ASPIC+/Dung；v3.6 四边接入，孤立类清零}
  layer_values: ['-', L0, L1, L2, L3, L4, L5, L6, L7, R, A]

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
      decision: 按场景选建（暂定），七类必建（见 relation_wing_triggers），其余降级并标 relationWingStatus
      status: 暂定
    '008':
      topic: 刑民同父类
      decision: 新增抽象父类 Assertion，Claim/Charge 并列为其子类
    '010':
      topic: findingBasis 三项定性 + 外围类范围 + stage 命名
      decision: >-
        P1 拆分（findingBasis 关系保留 + findingBasisKind 承载司法认知 +
        新建 AdmissionFinding + 删 Mixed）；P2 七类必建清单入
        relation_wing_triggers 段（暂定）；P3 外围类加 scope 三分；
        P4 stage→procedureStage（形式修正）。
      date: '2026-10-13'
    '011':
      topic: 论证翼三孤立类接入
      decision: 方案 A——四边接入（usesScheme/hasCriticalQuestion/attackTargets/argumentAddresses），零新类
      date: '2026-10-13'
    '012':
      topic: L7 判项层三处收敛缺口 + 上诉请求无处安放
      decision: >-
        缺口一：judgmentOn/attacks/issueConcerns 三处 range 补 Judgment；
        缺口二：disposition 增「费用负担」值；
        缺口三：新增 AppellateRequest 类（Assertion 子类，与 Claim 并列）。
        附：法院酌定扩入 findingBasisKind（见 C2）。
      date: '2026-10-13'
      evidence: L3 盲测第一轮，四方独立挂接收敛（实例 A/B/C + kimi 有偏参考样本）

  coverage:
    I2:
      mapped: 67
      total: 67
      status: 收官
      as_of: '2026-10-01'
    articleNumbers:
      reconciled: 26
      outstanding: 0
      as_of: '2026-10-02'
      rule: 引用必带 validity period（design_rule 14）
      note: |
        2026-10-13 外部核验发现：台账「民诉法执行编」三处条号（232/244/246）
        实为 2021 修正规制，现行（2023 修正）应为 236/248/250，差异固定 +4。
        已另立勘误卡（12 夹），本骨架待裁决后同步。

global_properties:
  - {name: id,              note: 节点标识}
  - {name: sourceRef,       note: 原文出处（条号/页码/行号）}
  - {name: wasAttributedTo, note: 对齐 PROV-O，归属主体}
  - {name: assertedBy,      note: 主张方}
  - {name: acceptedBy,      note: 认定方}
  - {name: validFrom,       note: 事实有效起点}
  - {name: validTo,         note: 事实有效终点}
  - {name: schemeVersion,   note: 案由/罪名方案版本}
  # C1：认定形态（无独立节点的认定依据，如司法认知、法院酌定）
  - {name: findingBasisKind, note: 'C1/C2：承载无独立节点的认定形态（司法认知/法院酌定等）'}

classes:
  # ---------- 外围依赖（layer: '-'）----------
  # C4：P3 落库范围三分。core=图 schema 必存；reference=按需引用；document=仅溯源留存。
  Case:          {layer: '-', scope: core, props: [caseNumber, schemeVersion, court, timeInterval, relationWingStatus]}
  Party:         {layer: '-', scope: core, props: [partyType]}
  Role:          {layer: '-', scope: core, props: [roleType, inStage]}
  LegalDocument: {layer: '-', scope: document, props: [docType, docDate]}
  LegalNorm:     {layer: '-', scope: core, props: [normFunction, deonticModality, isForbearance, effectiveFrom, effectiveTo]}
  Article:       {layer: '-', scope: core, props: [articleNumber, statute], note: 条号引用须带 validity period（规则 14）}
  Provision:     {layer: '-', scope: core, props: [provisionNumber]}

  # ---------- L1 主张层 ----------
  Assertion: {layer: L1, abstract: true, props: [assertedByRole, basisNorm, reviewOrder]}
  Claim:
    layer: L1
    parent: Assertion
    props: [claimType, reviewOrder, hohfeldGroup, effect]
    note: v3.2 加 effect——解除等形成权的法律后果子项（返还/恢复原状/赔偿损失），不单列 Claim
  Charge: {layer: L1, parent: Assertion, props: [chargeName, count]}
  # C9（争议 012 缺口三）：审级请求与实体请求分离。
  AppellateRequest:
    layer: L1
    parent: Assertion
    props: [appellateType, targetJudgment, reviewOrder]
    note: |
      C9（2026-10-13）：上诉/抗诉等审级请求独立成类。
      原状：二审请求不属 claimType 任何枚举值，盲测三方各自把上诉请求
      塞进 Claim 或 L3/A 翼（三条不同变通路径），本身即缺口证据。
      与 Claim 并列而非塞入 Claim——审级请求不是新的实体请求权。
      targetJudgment 指向被攻击的判项（Judgment），配合 C7 的 range 扩展。

  # ---------- L2 要件层 ----------
  Element:      {layer: L2, props: [elementName]}
  CrimeElement: {layer: L2, parent: Element, props: [crimeElementType]}
  ReviewStage:  {layer: L2, props: [stageType]}

  # ---------- L3 抗辩出罪层 ----------
  Defense:          {layer: L3, props: [defenseKind, isExOfficio]}
  Justification:    {layer: L3, props: [assertedBy, acceptedBy, procedureStage]}
  Excuse:           {layer: L3, props: [assertedBy, acceptedBy, procedureStage]}
  SentencingFactor: {layer: L3, props: [factorType, affects]}
  # C1：自认认定节点（与三性认定 / 证明力认定同构，遵守 design_rule 7）
  AdmissionFinding:
    layer: L3
    props: [admittedBy, acceptedBy, subject, scope]
    note: |
      C1（争议 010 P1）：自认是三方结构（作出方/对方/认定方），
      与争议 002「三性必须是独立认定节点」同理，不可压成属性。
      subject 取 partySide。

  # ---------- L4 事实要素层 ----------
  Fact:             {layer: L4, props: [factLayer]}
  LifeFact:         {layer: L4, parent: Fact}
  MaterialFact:     {layer: L4, parent: Fact}
  AdjudicativeFact: {layer: L4, parent: Fact, props: [findingBasis]}
  CaseElement:
    layer: L4
    props: [claimantValue, defendantValue, isContested, courtFinding, findingBasis,
            mappedStatus, objectionValue, condition]
  ElementSchema: {layer: L4, props: [elementName, valueType, enumValues, causeOfAction, version]}

  # ---------- L5 证据举证层 ----------
  Evidence: {layer: L5, props: [evidenceType, submittedBy, submittedAt]}
  EvidenceAdmissibilityFinding:
    layer: L5
    props: [authenticity, legality, relevance, assertedBy, acceptedBy, subject]
    note: 三性独立认定节点（争议 002）
  EvidenceWeightFinding: {layer: L5, props: [weightQualitative]}
  Subsumption:      {layer: L5, props: [isContested, acceptedBy, procedureStage]}
  BurdenAssignment: {layer: L5, props: [burdenKind, holder, isReversed]}
  ProofStandard:    {layer: L5, props: [standardType]}
  Presumption:      {layer: L5, props: [isRebuttable, rebuttalStandard]}

  # ---------- L6 程序时间层 ----------
  ProcedureStage:   {layer: L6, props: [procedureStageType, court, timeInterval]}
  ProcedureAct:     {layer: L6, props: [actType, actor, occurredAt]}
  TimePeriod:       {layer: L6, props: [startRule, endRule]}
  LimitationPeriod: {layer: L6, props: [startRule, interruptionEvents, suspensionEvents]}

  # ---------- L7 裁判层 ----------
  Judgment:
    layer: L7
    props: [disposition, amount, basis, rate, effectiveDate]
    note: |
      判项节点。一个 Judgment 对应裁判文书主文中的一项判决。
      disposition 为判项类型；amount/basis/rate 承载金额判项三要素。
      v3.6 C8：disposition 增「费用负担」，使诉讼费/鉴定费判项可挂，
      不再违反 design_rule 17。

  # ---------- L0 标签层（SKOS）----------
  CauseOfAction: {layer: L0, as: skos:Concept, props: [prefLabel, altLabel, notation, broader, narrower, scopeNote, changeNote, deprecated, skosReplacedBy]}
  ChargeName:    {layer: L0, as: skos:Concept, props: [prefLabel, altLabel, notation, broader, narrower, scopeNote, changeNote, deprecated, skosReplacedBy]}

  # ---------- R 法律关系翼 ----------
  LegalRelation:      {layer: R, props: [relationType, hasScope]}
  HohfeldRelation:    {layer: R, props: [hohfeldPosition, timeInterval]}
  LegalRelationEvent: {layer: R, props: [eventType, triggerType]}
  CapacityAssessment: {layer: R, props: [capacityType, scope, timeInterval]}
  LegalObject:        {layer: R, props: [objectType, needsStatutoryBasis]}

  # ---------- A 论证争点翼 ----------
  Issue:            {layer: A, props: [issueStatus, raisedBy]}
  Argument:         {layer: A, props: [defeatStatus]}
  ArgumentScheme:   {layer: A, props: [schemeType], note: 'C6：usesScheme 接入（原孤立）'}
  CriticalQuestion: {layer: A, props: [cqText, isAnswered], note: 'C6：hasCriticalQuestion 接入（原孤立）'}
  Attack:           {layer: A, note: 'C6：attackTargets 接入（原孤立）；attackType 由 attacks 边携带'}
  Preference:       {layer: A, props: [basis]}

relations:
  - {name: isExpressedIn,  domain: [LegalNorm], range: [Article]}
  - {name: hasProvision,   domain: [Article],   range: [Provision]}
  - {name: caseHasCauseOfAction, domain: [Case], range: [CauseOfAction], cardinality: '1..n', props: [schemeVersion, isPrimaryCauseOfAction, causeRole]}
  - {name: caseHasCharge,  domain: [Case], range: [ChargeName]}
  - {name: causeOfActionInvolvesNorms, domain: [CauseOfAction], range: [LegalNorm], interface: [I1]}
  - {name: partyHasRole,   domain: [Party], range: [Role]}
  - {name: roleInCase,     domain: [Role],  range: [Case]}
  - {name: asserts,        domain: [Role],  range: [Assertion]}
  - {name: claimArisesFromNorm, domain: [Assertion], range: [LegalNorm]}
  - {name: hasElement,     domain: [Assertion], range: [Element]}
  - {name: elementBelongsToStage, domain: [CrimeElement], range: [ReviewStage], interface: [I3]}
  - {name: mapsToElement, domain: [CaseElement, MaterialFact], range: [Element], interface: [I2]}
  - {name: isProvedBy, domain: [AdjudicativeFact], range: [Evidence], interface: [I4]}
  # C1：findingBasis 关系保留，range 去掉悬空的 JudicialNotice/Admission/Mixed，
  #     改为指向实际存在的 AdmissionFinding，无节点形态走 findingBasisKind 属性。
  - name: findingBasis
    domain: [AdjudicativeFact, CaseElement]
    range: [Evidence, Presumption, AdmissionFinding]
    interface: [I4]
    range_note: |
      C1（争议 010 P1，2026-10-13 裁定）：v3.4 列 JudicialNotice/Admission/Mixed
      三项但 classes 未定义，形成悬空引用。裁定为拆分：
      - Admission（自认）→ 建 AdmissionFinding 类，入 range
      - JudicialNotice（司法认知）→ 无独立节点，由 findingBasisKind 属性承载
      - Mixed → 删除（无独立语义）
      - 法院酌定（C2，争议 012 实证）→ 同由 findingBasisKind 承载
  - {name: hasBurden,        domain: [Element, MaterialFact], range: [BurdenAssignment]}
  - {name: requiredStandard, domain: [Element], range: [ProofStandard]}
  - {name: defendsAgainst,   domain: [Defense, Justification, Excuse], range: [Assertion]}
  - {name: raisesDefense,    domain: [Role], range: [Defense]}
  - {name: assertedBy, domain: [Defense, Justification, Excuse, Evidence, AdmissionFinding], range: [Role], interface: [I6]}
  - {name: acceptedBy, domain: [Defense, Justification, Excuse, Evidence, AdmissionFinding], range: [Role], interface: [I6]}
  - {name: concursWith,      domain: [Assertion], range: [Assertion], interface: [I5]}
  - {name: isSubsumedUnder,  domain: [Subsumption], range: [Element]}
  - {name: subsumesFact,     domain: [Subsumption], range: [Fact]}
  - {name: hasIssue,         domain: [Case], range: [Issue], interface: [I8]}
  # C7：issueConcerns range 补 Judgment
  - {name: issueConcerns, domain: [Issue], range: [Assertion, Element, CaseElement, Judgment], interface: [I8]}
  - {name: mediates,     domain: [LegalRelation], range: [Party]}
  - {name: hasObject,    domain: [LegalRelation], range: [LegalObject]}
  - {name: correlativeOf, domain: [HohfeldRelation], range: [HohfeldRelation]}
  - {name: oppositeOf,   domain: [HohfeldRelation], range: [HohfeldRelation]}
  - {name: outranks, domain: [LegalRelation, HohfeldRelation], range: [LegalRelation, HohfeldRelation], note: 禁止数字 rank，必带 rankBasis/rankTime/ruleRef}
  - {name: hasRelationEvent, domain: [LegalRelation], range: [LegalRelationEvent]}
  - {name: requiresCapacity, domain: [ProcedureAct, LegalRelationEvent], range: [CapacityAssessment]}
  - {name: supports, domain: [Argument], range: [Argument, Assertion]}
  # C7：attacks range 补 Judgment
  - {name: attacks,  domain: [Argument], range: [Argument, Assertion, Judgment], props: [attackType]}
  - {name: preferredOver, domain: [Preference], range: [Argument]}
  - {name: appealsFrom,   domain: [Case], range: [Case]}
  - {name: occursInStage, domain: [ProcedureAct], range: [ProcedureStage]}
  - {name: triggerFillsElement, domain: [ProcedureAct], range: [Element, CaseElement], interface: [I2, L6]}
  - {name: wasAttributedTo, domain: ['*'], range: [Role]}
  - {name: wasDerivedFrom, domain: ['*'], range: ['*']}
  # C7：judgmentOn range 补 Judgment（二审「维持」判项可指向一审判项）
  - {name: judgmentOn, domain: [Judgment], range: [Assertion, CaseElement, Judgment], interface: [I9]}
  # C6（争议 011）：论证翼四边接入
  - {name: usesScheme, domain: [Argument], range: [ArgumentScheme], note: 'C6：AIF 的 RA 节点挂 scheme'}
  - {name: hasCriticalQuestion, domain: [ArgumentScheme], range: [CriticalQuestion], note: 'C6：图式天然携带一组批判性问题（Walton）'}
  - {name: attackTargets, domain: [Attack], range: [Argument, Assertion, Judgment], note: 'C6：AIF 的 CA 节点；C7 同步补 Judgment'}
  - {name: argumentAddresses, domain: [Argument], range: [Issue], note: 'C6：论证回应争点'}
  - {name: arbitrationPrecedes, domain: [ProcedureStage], range: [ProcedureStage], interface: [I9]}
  - {name: arbitratedAs, domain: [Claim], range: [Claim], interface: [I9]}

enums:
  claimType:
    - 合同履行
    - 违约
    - 缔约过失
    - 无因管理
    - 不当得利
    - 物权请求权
    - 侵权
    - 继承
    - 形成权
    - statutoryPriority
    - 撤销行政行为
    - 确认违法
    - 确认无效
    - 变更行政行为
    - 责令采取补救措施
    - 行政赔偿
    - 履行法定职责
    - 给付
    - 确认合同无效
    - 确认合同未成立
    - 撤销合同
    - 继续履行
    - 订立本约
  # C9：AppellateRequest 的类型（审级请求，与 claimType 分离）
  appellateType: [上诉, 抗诉, 再审申请, 执行异议之诉]
  # C1/C2：无独立节点的认定形态
  findingBasisKind: [司法认知, 法院酌定, 经验法则, 交易习惯]
  defenseKind:      [抗辩, 抗辩权, 例外]
  crimeElementType: [犯罪客体, 犯罪客观方面, 犯罪主体, 犯罪主观方面]
  stageType:        [该当性, 违法性, 有责性]
  factLayer:        [生活事实, 要件事实, 裁判事实]
  evidenceType:     [当事人陈述, 书证, 物证, 视听资料, 电子数据, 证人证言, 鉴定意见, 勘验笔录]
  hohfeldPosition:  [right, duty, privilege, no-right, power, liability, immunity, disability]
  standardType:     [优势证据, 高度盖然性, 排除合理怀疑]
  attackType:       [rebut, undermine, undercut]
  procedureStageType: [仲裁, 立案, 一审, 二审, 再审, 执行]
  objectType:       [物, 智力成果, 数据, 网络虚拟财产, 人格利益]
  normFunction:     [构成性规则, 调整性规则]
  deonticModality:  [应当, 禁止, 许可]
  hohfeldGroup:     [claim, power]
  causeRole:        [立案案由, 审理案由, 并列案由]
  relationWingStatus: [built, degraded, notBuilt]
  mappedStatus:     [mapped, unmapped]
  partySide:        [原告侧, 被告侧]
  objectionValue:   [无异议, 有异议, 部分异议, 不争执, 不知悉, 附条件]
  # C8（争议 012 缺口二）
  disposition:
    - 支持
    - 驳回
    - 部分支持
    - 部分支持（含基数/标准调整）
    - 维持
    - 撤销
    - 改判
    - 发回重审
    - 费用负担
  eventType:        [creates, modifies, transfers, extinguishes]
  triggerType:      [juristicAct, factualAct, prescribedEvent, otherStatutory]

enum_constraints:
  - enum: objectionValue
    value: 附条件
    requires: [condition]
  - enum: claimType
    value: 形成权
    requires_prop: {hohfeldGroup: power}
    forbids: [reviewOrder]
  - enum: disposition
    value: 部分支持（含基数/标准调整）
    requires: [basis]
  # C8：费用负担判项必带 amount（否则不知负担多少）
  - enum: disposition
    value: 费用负担
    requires: [amount]
    note: |
      C8（争议 012 缺口二）：取此值时 Judgment.amount 必填。
      费用负担不是对实体诉请的支持程度判断，故独立成值而非并入「部分支持」。

property_enum_bindings:
  - {property: subject,            enum: partySide,          applies_to: [EvidenceAdmissibilityFinding, AdmissionFinding]}
  - {property: disposition,        enum: disposition,         applies_to: [Judgment]}
  - {property: procedureStageType, enum: procedureStageType,  applies_to: [ProcedureStage]}
  - {property: stageType,          enum: stageType,           applies_to: [ReviewStage]}
  # C5：stage → procedureStage（形式修正，迁移见下）
  - {property: procedureStage,     enum: procedureStageType,  applies_to: [Justification, Excuse, Subsumption]}
  - {property: claimType,          enum: claimType,           applies_to: [Claim]}
  - {property: appellateType,      enum: appellateType,       applies_to: [AppellateRequest]}
  - {property: findingBasisKind,   enum: findingBasisKind,    applies_to: [AdjudicativeFact, CaseElement]}
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
  - {property: eventType,          enum: eventType,           applies_to: [LegalRelationEvent]}
  - {property: triggerType,        enum: triggerType,         applies_to: [LegalRelationEvent]}

design_rules:
  - {id: 1,  rule: 规范(LegalNorm)、条文(Article)、条款(Provision) 必须分三层，不得合并}
  - {id: 2,  rule: 抗辩与出罪事由必须是独立节点，禁止做成 Claim 的布尔字段}
  - {id: 3,  rule: 证据三性必须是独立认定节点，禁止做成 Evidence 的属性, source: 争议 002}
  - {id: 4,  rule: 举证责任必须挂在 Element / MaterialFact 上，禁止挂在 Party 上}
  - {id: 5,  rule: 案由罪名为 SKOS 概念，禁止建 OWL 类继承}
  - {id: 6,  rule: 要建子类前先考虑加枚举属性}
  - {id: 7,  rule: 任何认定类节点必须同时具备 assertedBy 与 acceptedBy}
  - {id: 8,  rule: 时间建模默认时间戳字段，仅在时效/期间场景启用 LimitationPeriod}
  - {id: 9,  rule: 形成权入 claimType 枚举并用 hohfeldGroup=power 标注，禁止另建顶层类，且 reviewOrder 留空, source: 争议 004}
  - {id: 10, rule: 案由多值共存但主案由唯一，统计与类案分组键只用主案由, source: 争议 005}
  - {id: 11, rule: mapsToElement 未覆盖的行必须显式标 unmapped，缺口不得静默隐藏, source: 争议 006}
  - {id: 12, rule: R 法律关系翼按场景选建——七类必建，其余降级并在 Case.relationWingStatus 标注, source: 争议 007（暂定）}
  - {id: 13, rule: Assertion 为抽象父类，禁止直接实例化；新增民刑公共属性一律上提至 Assertion, source: 争议 008}
  - {id: 14, rule: 条号引用必须带 validity period 三要素——法律修订位移是常态}
  - {id: 15, rule: 组件升 L2 公共子图标准——复用 ≥3 次且跨案由，或攻防双侧复用，满足其一即升}
  - {id: 16, rule: 质证不新建类——映射到 EvidenceAdmissibilityFinding + EvidenceWeightFinding + subject 属性, aligns: [3, 6]}
  - {id: 17, rule: 判项必须建成 Judgment 节点，禁止塞进 CaseElement.courtFinding, source: v3.5 fix7}
  - {id: 18, rule: 仲裁前置案由必须建 procedureStageType=仲裁 的阶段节点并用 arbitrationPrecedes 连到诉讼阶段, source: v3.5 fix8}
  # C9（争议 012 缺口三）
  - id: 19
    rule: 审级请求（上诉/抗诉/再审申请）必须建成 AppellateRequest 节点，禁止塞入 Claim 或 claimType 枚举
    source: 争议 012（缺口三，2026-10-13）
    note: |
      二审请求不是新的实体请求权。塞进 Claim 会让「上诉请求」在统计上
      与实体诉请混同；落入 L3/A 翼则完全查不到——盲测中三方各选其一，
      正是缺口的实证表现。
  # C1（争议 010 P1）
  - id: 20
    rule: 自认必须建成 AdmissionFinding 独立认定节点，禁止做成 AdjudicativeFact 的属性
    source: 争议 010 P1（2026-10-13）
    aligns: [3, 7]
    note: 与争议 002「三性独立认定节点」同理——自认是三方结构，压成属性会丢认定方。

# C3（争议 010 P2）：七类必建清单入骨架。
# 取值照录 13 夹《法律关系翼必建触发清单：七类判据·降级写法·丢失能力·校验规则_v1_20261008》第 2 节，不自拟。
relation_wing_triggers:
  status: 暂定
  source: 争议 007 裁定 + 13 夹《法律关系翼必建触发清单》v1_20261008
  note: |
    必须带 status: 暂定——争议 007 理由 5 原话：
    「写成永久清单，映射表一旦扩展，清单失效却无人修订，反而比没有清单更危险」。
    随案由映射表修订。
  excluded:
    - CapacityAssessment（不是必建触发，仅在行为能力/主体资格本身成为争点时建）
    - 刑事侧追缴、退赔与涉案财物处置（本次不纳入，留刑事扩展包评估）
  triggers:
    - {id: T1, name: 担保物权与保证, 判据: 存在抵押/质押/留置/保证任一形态，含共同担保、混合担保、最高额担保}
    - {id: T2, name: 债权／债务转让与抵销, 判据: 存在债权转让、债务承担、债务加入或抵销主张}
    - {id: T3, name: 破产清偿顺位与执行分配, 判据: 破产债权确认、破产分配方案、执行分配、参与分配任一}
    - {id: T4, name: 共有与分割, 判据: 按份共有／共同共有的权属争议、共有物处分、分割请求}
    - {id: T5, name: 善意取得, 判据: 主张或抗辩涉及善意取得}
    - {id: T6, name: 优先顺位冲突（兜底，优先过）, 判据: 同一客体或同一责任财产上存在多个主张不能同时实现的任何场景}
    - {id: T7, name: 确认之诉／形成之诉, 判据: 诉讼标的是法律关系的产生／变更／消灭本身，含争议 004 的形成权行使}

components:
  COMP-SEC-01: {tier: publicSubgraph, name: 担保七连问, instances: [金融借款, 信用卡, 融资租赁, 执行担保]}
  COMP-IPA-02: {tier: publicSubgraph, name: 专利有效性五分项攻防表, instances: [专利驳回复审, 专利无效]}
  COMP-ADM-01: {tier: publicSubgraph, name: 行政共性尾部四行, instances: [行政10类, 行政处罚]}
  COMP-EXE-01: {tier: publicSubgraph, name: 执行事项枚举表, instances: [执行异议, 执行复议, 执行监督]}
  COMP-IPR-01: {tier: local, name: 知产权利基础五要素}
  COMP-IPR-02: {tier: local, name: 被许可人起诉权限三档}
  COMP-INS-01: {tier: local, name: 保险提示说明双字段}
  COMP-LEASE-01: {tier: local, name: 互斥双轨诉请}
  COMP-SECUR-01: {tier: local, name: 时间四钉+双段因果}
  COMP-MAR-01:
    tier: local
    name: 船舶优先权主张位
    validityPeriod: {'1993版': '22/28/29', '2025修订版': '22/27/28', 生效: '2026-05-01'}
  COMP-DEF-01: {tier: local, name: 双段制挂接规则}
  COMP-GJ-01: {tier: local, name: 国赔赔偿项目分型枚举}
  COMP-PP-01: {tier: local, name: 自诉共用骨架+罪名插槽}
  COMP-IPA-01: {tier: local, name: 知产行政争点圈定双勾选}
  COMP-IV-01: {tier: local, name: 质证意见四元组}

alignment:
  LKIF-Core: {norm: qualification, legal-action: ProcedureAct, role: Role, modification: Defense 挂钩点}
  UFO-L/gUFO: {relator: LegalRelation, mediates: mediates}
  SKOS: {ConceptScheme: 案由/罪名, versioning: changeNote/skosReplacedBy}
  PROV-O: {wasAttributedTo: 全局溯源, wasDerivedFrom: 推导来源}
  OWL-Time: {time: Instant/Interval}
  AIF/ASPIC+/Dung: {constructs: Argument/Attack/defeatStatus, mapsTo: 论证翼, note: 'v3.6 C6 四边接入后完整对齐'}

pending_decisions:
  P1:
    status: 已解决（v3.6 C1+C2，2026-10-13）
    resolution: 拆分——findingBasis 关系保留、findingBasisKind 承载司法认知与法院酌定、新建 AdmissionFinding、删除 Mixed
  P2:
    status: 已解决（v3.6 C3，2026-10-13）
    resolution: "七类必建清单入 relation_wing_triggers 段，带 status: 暂定"
  P3:
    status: 已解决（v3.6 C4，2026-10-13）
    resolution: 外围依赖类加 scope 三分（core/reference/document）
  P4:
    status: 已解决（v3.5.1 G2 形式修正 + v3.6 C5 随批，2026-10-13）
    resolution: stage → procedureStage，绑定同步，迁移说明见 property_enum_bindings 段
  民诉法执行编条号:
    status: 新登记，待裁决（2026-10-13 外部核验发现）
    detail: |
      台账「民诉法执行编」三处条号（232/244/246）实为 2021 修正规制，
      现行（2023 修正）应为 236/248/250，差异固定 +4。
      另「执行 9 类资产件」整段引用疑同为 2021 修正规制，需整体重推。
      已立勘误卡（12 夹），待裁决后同步本骨架与下游资产件。
    blocking: 下游资产件条号引用错误
```

---

## 3. 验证与边界（如实声明）

- **本版未跑官方校验器**：`test_validate_skeleton.py` 不在本次编辑环境可用范围内
  （v3.5.1 已声明同一问题）。本次以**自建结构自检脚本**代替
  （`mike/scripts/skeleton-structure-check.mjs`），覆盖：
  YAML 可解析、关系 domain/range 无未知类、枚举绑定目标存在、孤立类检查、
  enum_constraint 取值存在。
- **未跑缺陷注入回归**；未连接生产数据库；未跑完整真实案件回归；未迁移 Rust 存储。
- 下游应重跑官方 `test_validate_skeleton.py` 后再用于生产。

### 3.1 自检结果（2026-10-13）

| 指标 | v3.5.1（对照） | v3.6 |
|---|---|---|
| 类 | 48 | **50** |
| 关系 | 43 | **47** |
| 枚举 | 22 | **24** |
| 悬空引用错误 | 0 | **0** |
| 孤立类 | **10** | **7** |

**孤立类由 10 降为 7**——减少的三个正是争议 011 的目标
（ArgumentScheme／CriticalQuestion／Attack），C6 四边接入生效。
两个新类（AdmissionFinding、AppellateRequest）均被关系引用，未新增孤立。

**剩余 7 个孤立类为 v3.5.1 既有状态，不在本次裁决范围，未擅自处理**：
`LegalDocument`、`SentencingFactor`、`ElementSchema`、
`EvidenceAdmissibilityFinding`、`EvidenceWeightFinding`、`TimePeriod`、`LimitationPeriod`。

其中需注意：`EvidenceAdmissibilityFinding`／`EvidenceWeightFinding` 是争议 002 与
design_rule 3/16 明确要求存在的认定节点，却在关系段无 domain/range 引用——
**这与争议 011「散文层已备、机读层断裂」属同一类吸收断层**，
建议后续按同一手法另立争议卡接入（本次未裁，不擅自动手）。

- 争议 012 的三处缺口依据为**同家族（Kimi 系）四方盲测收敛**，
  置信度低于跨家族验证；建议有条件时以异家族模型复核。

## 4. 迁移说明（v3.5.1 → v3.6）

| 旧 | 新 | 说明 |
|---|---|---|
| `stage` 属性 | `procedureStage` | C5，形式修正；旧数据按此对照迁移 |
| findingBasis range 的 `Admission` | `AdmissionFinding` 类 | C1 |
| findingBasis range 的 `JudicialNotice`/`Mixed` | `findingBasisKind` 属性（Mixed 删除） | C1/C2 |
| 二审上诉请求塞入 Claim | `AppellateRequest` 类 | C9 |
| 诉讼费/鉴定费判项塞 basis | `disposition=费用负担` + `amount` 必填 | C8 |
| 外围类无落库标记 | `scope`（core/reference/document） | C4 |

不可静默改名：P4/争议 010 动作清单第 4 项要求出旧名→新名对照后重跑校验。
