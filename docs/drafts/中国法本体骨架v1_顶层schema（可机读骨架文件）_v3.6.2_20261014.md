# 中国法本体骨架 v1 · 顶层 schema v3.6.1

| 项 | 内容 |
|---|---|
| 归属 | 13_资产库与工具箱 |
| 版本 | v3.6.2_20261014 |
| 决策依据 | 争议010/011/012已裁（v3.6.1落实）+ 民诉法执行编条号勘误裁决（方案A，2026-10-14）；本版仅更新 pending 状态登记，无建模结构变更 |
| 替代 | 顶层 schema v3.6.1；保留旧版并在新版读回核验后标记历史存档 |
| 成熟度 | 裁决实现纠偏版；本地结构与范围验收不代表生产迁移或法律正确性已验证 |

## 1. 本次修订

| 项 | v3.6.1处理 | 裁决依据 |
|---|---|---|
| P1 | 移除两处同名 `findingBasis` 属性；`findingBasisKind` 直接声明于适用类；自认认定回到L5并补齐相对方、撤销与阶段字段 | 010 P1 |
| 认定类型 | 基础四值“证据/推定/司法认知/自认”加已采纳的“法院酌定”；不保留未裁扩展“经验法则/交易习惯” | 010 P1及扩展 |
| P2 | 补齐七类触发的必建结构、降级及能力损失、复核条件；案由映射仍需人工确认 | 010 P2及13夹触发清单 |
| P3 | `LegalNorm/Article/Provision` 改为 `reference`；三种scope均必存，区分去重与生命周期 | 010 P3 |
| P4 | 沿用v3.5.1 G2，不重复新增或要求重复迁移 | 010 P4 |
| 011 | 四边保留；`attackTargets` 恢复已裁值域 `[Argument, Assertion]` | 011 A |
| 012 | 三处已裁值域、费用负担枚举、`AppellateRequest` 保留；移除未单列裁定的“执行异议之诉”扩展 | 012 A/A/B |
| 保真 | 恢复v3.6重写时遗漏的组件字段、覆盖说明及既有关系语义，不改其取值 | v3.5.1原文 |

仍为50类、47关系、24组枚举；仅论证翼的三个目标孤立类完成接入，另七个既有孤立类不在本轮修复范围内。新版本验收范围见第3节。

---

## 2. 完整 YAML

```yaml
# 中国法本体骨架 v1 · 顶层 schema v3.6.2
# 来源：IMA 13夹；v3.6.2 仅登记民诉法执行编条号勘误裁决的执行结果（事实性，非建模变更）。
# 沿革：v3.4.1形式修正 → v3.5判项与仲裁 → v3.5.1 G1-G4
#       → v3.6（2026-10-13裁定实现）→ v3.6.1（同日实现纠偏）
#       → v3.6.2（2026-10-14 条号勘误裁决落地，状态登记）。
# P4命名修正已在v3.5.1完成，不再算新增裁决。
# 旧版未裁字段扩展不自动获得裁决效力；模型身份和独立性不以文件名推断。
# 建模决策变更仍须有12夹裁决，本版本不处理七个继承孤立类。

meta:
  name: 中国法本体骨架 v1
  version: v3.6.2
  date: 2026-10-14
  derived_from:
    source: IMA 法律本体学 / 13_资产库与工具箱
    document: 中国法本体骨架v1_顶层schema（可机读骨架文件）_v3.6.1_20261013.md
    relation: 登记条号勘误裁决执行结果；骨架结构较 v3.6.1 无变更
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
      evidence: A/B/C三份实例产出及一份非独立参考样本；裁定不等于独立性或正确性证明

  coverage:
    I2:
      mapped: 67
      total: 67
      status: 收官
      as_of: '2026-10-01'
      note: |
        67/67为历史总纲及骨架收官报告，本次未重审所有映射。
        不得将文档报告值当作当前机器核验结果。
    I4:
      defendant_side_categories: 13
      third_party_statement_types: 3
      ip_administrative_layers: [自认/异议, 举证, 质证, 攻防对照]
    articleNumbers:
      reconciled: 26
      outstanding: 0
      as_of: '2026-10-02'
      rule: 引用必带 validity period（design_rule 14）
      note: 历史快照未重核；独立的条号勘误仍待处置，本轮不确认所有引用正确

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
  # ---------- 外围依赖（layer: '-'）----------
  # C4：三种scope均须落库；reference按法源版本身份去重，document按文书身份去重。
  Case:          {layer: '-', scope: core, props: [caseNumber, schemeVersion, court, timeInterval, relationWingStatus]}
  Party:         {layer: '-', scope: core, props: [partyType]}
  Role:          {layer: '-', scope: core, props: [roleType, inStage]}
  LegalDocument: {layer: '-', scope: document, props: [docType, docDate]}
  LegalNorm:     {layer: '-', scope: reference, props: [normFunction, deonticModality, isForbearance, effectiveFrom, effectiveTo]}
  Article:       {layer: '-', scope: reference, props: [articleNumber, statute], note: 条号引用须带 validity period（规则 14）}
  Provision:     {layer: '-', scope: reference, props: [provisionNumber]}

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

  # ---------- L4 事实要素层 ----------
  Fact:             {layer: L4, props: [factLayer]}
  LifeFact:         {layer: L4, parent: Fact}
  MaterialFact:     {layer: L4, parent: Fact}
  AdjudicativeFact: {layer: L4, parent: Fact, props: [findingBasisKind]}
  CaseElement:
    layer: L4
    props: [claimantValue, defendantValue, isContested, courtFinding, findingBasisKind,
            mappedStatus, objectionValue, condition]
  ElementSchema: {layer: L4, props: [elementName, valueType, enumValues, causeOfAction, version]}

  # ---------- L5 证据举证层 ----------
  AdmissionFinding:
    layer: L5
    props: [admittedBy, counterparty, scope, isRevoked, revocationBasis, procedureStage]
    note: |
      自认认定的作出方、相对方、范围与撤销依据分别保留。
      assertedBy与acceptedBy通过同名关系连接Role，不重复定义为属性。
      admittedBy/counterparty为角色引用字段，不能用partySide代替相对方身份。
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
  - {name: attackTargets, domain: [Attack], range: [Argument, Assertion], note: 'C6：攻击节点的目标；本轮未裁定扩到Judgment'}
  - {name: argumentAddresses, domain: [Argument], range: [Issue], note: 'C6：论证回应争点'}
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
  # 审级类型不包含实体性执行异议之诉；扩展类别须另有裁定。
  appellateType: [上诉, 抗诉, 再审申请]
  findingBasisKind: [证据, 推定, 司法认知, 自认, 法院酌定]
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
  - {property: subject,            enum: partySide,          applies_to: [EvidenceAdmissibilityFinding]}
  - {property: disposition,        enum: disposition,         applies_to: [Judgment]}
  - {property: procedureStageType, enum: procedureStageType,  applies_to: [ProcedureStage]}
  - {property: stageType,          enum: stageType,           applies_to: [ReviewStage]}
  # v3.5.1 G2已完成命名修正，自认认定采用相同程序阶段枚举。
  - {property: procedureStage,     enum: procedureStageType,  applies_to: [Justification, Excuse, Subsumption, AdmissionFinding]}
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
  - id: 19
    rule: 审级请求（上诉/抗诉/再审申请）必须建成 AppellateRequest 节点，禁止塞入 Claim 或 claimType 枚举
    source: 争议 012（缺口三，2026-10-13）
  - id: 20
    rule: 自认必须建成 AdmissionFinding 独立认定节点，禁止做成 AdjudicativeFact 的属性
    source: 争议 010 P1（2026-10-13）
    aligns: [3, 7]
  - id: 21
    rule: findingBasis允许多条关系并存，禁止以单一Mixed取值掩盖各依据；findingBasisKind仅标类型，不替代依据节点
    source: 争议 010 P1（多依据并存）

# C3（争议 010 P2）：七类必建清单入骨架。
# 取值照录 13 夹《法律关系翼必建触发清单：七类判据·降级写法·丢失能力·校验规则_v1_20261008》第 2 节，不自拟。
relation_wing_triggers:
  status: 暂定
  source: 13夹《法律关系翼必建触发清单》v1_20261008（争议007/010）
  mappingStatus: manual
  evaluationOrder: [T6, T1, T2, T3, T4, T5, T7]
  note: |
    typicalCauses只照录来源列出的形态示例，不代表完整案由映射。
    人工确认触发类型后再校验结构；不得因未匹配案由名称而自动判无需建翼。
    命中任一触发要求built；degradeOption仅记录损失和未命中场景的近似方法，
    不作为静默放行必建场景的豁免。
  baseNeeds:
    classes: [LegalRelation, HohfeldRelation, LegalRelationEvent]
    relations: [mediates, correlativeOf, hasRelationEvent]
    conditional:
      - {when: 涉及客体, classes: [LegalObject], relations: [hasObject]}
      - {when: 存在顺位冲突, classes: [], relations: [outranks]}
  degradeOptions:
    a:
      representation: Claim以引用属性记录所担保的主债权
      lostCapability: 主债权转让消灭时担保联动及共同担保内部分担
    b:
      representation: 排序近似仅作备注，不以数字rank充当顺位结论
      lostCapability: 跨场景比较、优先依据、无偏序的按比例清偿
    c:
      representation: 以ProcedureAct或时间属性近似转让变动
      lostCapability: 对当事人与对债务人生效的双时点分离
  review_trigger:
    - 案由映射覆盖后人工复核成本高于全建时复核是否改全局必建
    - 清单外场景反复答错时评估扩入清单
    - 降级造成实质结论错误时评估该场景升为必建
    - 写入量超预算时复核清单但至少保留担保与顺位
    - degraded占比过高或状态长期为空时重新校准
  excluded:
    - CapacityAssessment不是必建触发，仅在行为能力或主体资格成为争点时建
    - 刑事追缴、退赔及涉案财物处置留待扩展包
  triggers:
    - id: T1
      name: 担保物权与保证
      predicate: 存在抵押、质押、留置、保证，含共同担保、混合担保、最高额担保
      typicalCauses: [抵押, 质押, 留置, 保证, 共同担保, 混合担保, 最高额担保]
      needs:
        classes: [LegalRelation, HohfeldRelation, LegalRelationEvent]
        relations: [mediates, correlativeOf, hasRelationEvent]
        requirements:
          - 担保关系到主债权的从属性须以边表达，具体边名尚待与已有资产对齐
          - 多担保人场景建立outranks或明确无偏序
      degradeOption: [a, b]
      lostCapability: 主债权变动与担保联动、共同担保内部分担
    - id: T2
      name: 债权／债务转让与抵销
      predicate: 存在债权转让、债务承担、债务加入或抵销主张
      typicalCauses: [债权转让, 债务承担, 债务加入, 抵销]
      needs:
        classes: [LegalRelation, HohfeldRelation, LegalRelationEvent]
        relations: [mediates, correlativeOf, hasRelationEvent]
        requirements:
          - 转让记录对当事人生效与对债务人生效两个时点
          - 抵销分开记录power行使事件与债权消灭事件
      degradeOption: [c]
      lostCapability: 双时点分离及向原债权人清偿效力判断
    - id: T3
      name: 破产清偿顺位与执行分配
      predicate: 涉及破产债权确认、破产分配方案、执行分配或参与分配
      typicalCauses: [破产债权确认, 破产分配方案, 执行分配, 参与分配]
      needs:
        classes: [LegalRelation, HohfeldRelation, LegalRelationEvent]
        relations: [mediates, correlativeOf, hasRelationEvent, outranks]
        requirements:
          - outranks保留rankBasis、rankTime、ruleRef、scope四元组
          - 同类按比例分配显式记录无偏序而非伪造顺序
      degradeOption: [b]
      lostCapability: 跨场景顺位区分、优先理由及比例清偿的无偏序表达
    - id: T4
      name: 共有与分割
      predicate: 按份共有或共同共有的权属争议、共有物处分、分割请求
      typicalCauses: [按份共有, 共同共有, 共有物处分, 分割请求]
      needs:
        classes: [LegalRelation, HohfeldRelation, LegalRelationEvent, LegalObject]
        relations: [mediates, correlativeOf, hasRelationEvent, hasObject]
        requirements:
          - 一客体多主体以mediates多方结构表达
          - 份额信息位于关系侧而不是当事人节点
      degradeOption: []
      lostCapability: 份额与处分同意规则及部分共有人处分效力
    - id: T5
      name: 善意取得
      predicate: 主张或抗辩涉及善意取得
      typicalCauses: [善意取得]
      needs:
        classes: [LegalRelation, HohfeldRelation, LegalRelationEvent]
        relations: [mediates, correlativeOf, hasRelationEvent]
        requirements:
          - 原权利extinguishes与受让人creates各记一个事件
          - 不用outranks替代权利变动截断
      degradeOption: [c]
      lostCapability: 原权利消灭与新权利产生的截断结构
    - id: T6
      name: 优先顺位冲突
      predicate: 同一客体或责任财产上的多个主张不能同时实现
      typicalCauses: [留置与抵押并存, 价款优先权, 建设工程价款优先受偿]
      needs:
        classes: [LegalRelation, HohfeldRelation, LegalRelationEvent]
        relations: [mediates, correlativeOf, hasRelationEvent, outranks]
        requirements:
          - outranks保留rankBasis、rankTime、ruleRef、scope四元组
          - 禁止跨scope比较
      degradeOption: [b]
      lostCapability: 跨场景顺位区分及优先依据
    - id: T7
      name: 以法律关系本身为诉讼标的
      predicate: 确认之诉或形成之诉涉及法律关系本身的产生、变更、消灭
      typicalCauses: [确认之诉, 形成之诉]
      needs:
        classes: [LegalRelation, HohfeldRelation, LegalRelationEvent]
        relations: [mediates, correlativeOf, hasRelationEvent]
        requirements:
          - 形成权行使与关系变动分开记录
          - Claim.hohfeldGroup为power且reviewOrder留空
      degradeOption: [c]
      lostCapability: 形成权行使与返还、恢复原状及损害赔偿后果的关联
  unresolvedChecks:
    - T1从属性具体边名和全部案由级映射未在本轮裁定，不自拟关系名
    - 降级选项空列表表示来源无对应近似写法，不表示无能力损失

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
    status: 已解决（2026-10-14，方案A裁定并执行）
    resolution: 执行编按2023修正整体重推（232→236、237、238-240、242、248、249、250；范围235-269）；仲裁法不予执行条款63→76（2025修订，2026-03-01施行）连带核销；台账v2与执行资产件v2已入库
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
