# 盲测挂接结果（实例C）：（2016）苏09民终867号 机动车交通事故责任纠纷（二审）

> 说明：本挂接严格按 v3.5.1 的类/关系/枚举/规则/组件逐层落点。盲测方无法查阅 I2 要素总纲、无法查阅本库已有挂接结果，凡涉及 I2 总纲核验的内容一律标"不确定+理由"。凡骨架无落点的内容一律标"无落点"，绝不强行挂接。

---

## L0 标签层（案由）

- 节点：`CauseOfAction`（SKOS 概念，layer=L0，as=skos:Concept）
  - prefLabel：机动车交通事故责任纠纷
  - relation：`caseHasCauseOfAction`（Case → CauseOfAction，cardinality 1..n）
    - isPrimaryCauseOfAction：true（主案由，统计键）
    - causeRole：立案案由 / 审理案由（判决书既作立案案由又作审理案由，取值不确定——盲测方无法区分立案/审理阶段案由登记，倾向"审理案由"）
- 案件 `Case`（layer='-'，外围依赖类）
  - caseNumber：（2016）苏09民终867号（二审案号）；一审案号（2015）阜东民初字第0347号
  - court：江苏省盐城市中级人民法院
  - relationWingStatus：notBuilt（本案为侵权纠纷，非担保等七类必建，按 design_rule 12 降级，标 notBuilt）

---

## L1 主张层（Assertion / Claim）

> 一审为本诉，二审为上诉审。本诉 Claim 由一审原告邱荣珍提起；二审上诉人永诚财保的"上诉请求"性质见下文标注。

### 本诉 Claim（一审原告邱荣珍）

- 节点：`Claim`（layer=L1，parent=Assertion）
  - id：C1-侵权损害赔偿
  - claimType：侵权（机动车交通事故责任纠纷归入侵权 claimType）
  - hohfeldGroup：claim
  - effect：赔偿损失（design_rule 9 不适用，本案非形成权）
  - reviewOrder：不确定——本案为一般侵权赔偿请求，reviewOrder 是否需要排序无明确依据，留空
  - assertedByRole：邱荣珍（原告侧 Role）
  - basisNorm：侵权责任法/道路交通安全法相关赔偿规范（具体条号见下文 L6/L7，须带 validity period，design_rule 14）
  - 关系：
    - `claimArisesFromNorm`：Claim → LegalNorm（侵权损害赔偿请求权规范）
    - `hasElement`：Claim → Element（见 L2）
    - `asserts`：邱荣珍 Role → C1

- 节点：`Claim`（layer=L1）
  - id：C2-诉讼费用承担
  - claimType：不确定——"诉讼费用由被告承担"在 claimType 枚举（合同履行/违约/缔约过失/无因管理/不当得利/物权请求权/侵权/继承/形成权/statutoryPriority/行政八值/民事确认形成五值）中无对应值。该请求是附属于主诉请的程序性费用主张，**无落点（claimType 无对应值）**。理由：诉讼费负担请求非实体请求权，不属于上述任一枚举。

### 二审上诉请求（上诉人永诚财保）

- 上诉请求"撤销/改判一审判决，查明事实维护合法权益"——**无落点（claimType 无对应值，且上诉请求非独立 Claim）**。理由：上诉请求是对一审判决结果的整体攻击，不是新的实体请求权，不落入 Claim 的 claimType 任何值；骨架未定义"上诉请求/审级请求"类。
  - 处理：将其拆解为两个挂接位——
    - 程序性"撤销一审判决"请求 → 挂 A 翼 `Issue`（见 A 翼 Issue5）
    - 实体性抗辩理由（医疗费扣 15%、鉴定违法、三期超标、误工虚假/农村标准）→ 挂 L3 `Defense`（见 L3）
  - 标注：这是骨架缺口候选——"审级请求（上诉/抗诉请求）无独立 Assertion 子类或 claimType 取值"。

### 二审被上诉人邱荣珍

- "被上诉人邱荣珍未作答辩"——无 Defense 节点、无新 Claim。属正常（二审可依一审证据维持），无需挂接。

### 原审被告张银生

- "原审被告张银生未作述称"——无新主张/抗辩。但张银生为一审共同被告，其在 L1 仍是被诉对象（C1 的被诉方），不另立 Claim。

---

## L2 要件层（Element / I2 映射）

> 机动车交通事故责任纠纷的侵权要件 + 保险赔付要件 + 赔偿标准要件。I2 总纲已 67/67 收官（coverage.I2.mapped=67/total=67），但盲测方无法查阅 I2 总纲逐行映射资产，故每个 `mapsToElement` 的 `mappedStatus` 标"不确定（无法查阅 I2 总纲核实）"，仅给 elementName。

### 侵权责任要件（针对侵权人张银生）

- 节点：`Element`（layer=L2）
  - id：E1-违法行为
  - elementName：违法行为（违章临时停车、开车门妨碍他人通行）
  - mapsToElement：CaseElement/MaterialFact → E1；mappedStatus：不确定（I2 总纲未核实）
  - 关联规范：《道路交通安全法实施条例》关于开关车门不得妨碍他人的条款（条号须带 validity period，design_rule 14；盲测方不补具体条号，标"不确定+须带有效期"）

- 节点：`Element`
  - id：E2-损害事实
  - elementName：损害事实（邱荣珍人身伤害：左胫骨平台粉碎性骨折、左腓骨近端骨折、十级伤残；车辆受损）
  - mapsToElement：mappedStatus 不确定

- 节点：`Element`
  - id：E3-因果关系
  - elementName：因果关系（开车门行为 → 碰撞 → 受伤/伤残）
  - mapsToElement：mappedStatus 不确定

- 节点：`Element`
  - id：E4-过错
  - elementName：过错（张银生全责，交通事故认定书认定）
  - mapsToElement：mappedStatus 不确定
  - 注意：机动车与非机动车事故依《道路交通安全法》76 条，机动车一方适用无过错责任（非过错责任），但本案张银生全责、邱荣珍无责，过错要件与无过错责任要件并存。**无落点（骨架 Element 无"归责原则"字段区分过错责任/无过错责任）**——这是缺口候选：归责原则类型无字段。只能通过 elementName 文本描述，无法结构化区分。

### 保险赔付要件（针对永诚财保江苏分公司）

- 节点：`Element`
  - id：E5-交强险合同
  - elementName：交强险保险合同（肇事车投保交强险、事故在保险期内）
  - mapsToElement：mappedStatus 不确定

- 节点：`Element`
  - id：E6-商业三者险合同
  - elementName：商业第三者责任险合同（30 万元不计免赔、事故在内）
  - mapsToElement：mappedStatus 不确定

### 赔偿标准要件

- 节点：`Element`
  - id：E7-残疾赔偿金计算标准
  - elementName：残疾赔偿金标准（城镇标准 vs 农村标准）
  - mapsToElement：mappedStatus 不确定

- 节点：`Element`
  - id：E8-误工费计算标准
  - elementName：误工费标准（城镇非农收入）
  - mapsToElement：mappedStatus 不确定

- 节点：`Element`
  - id：E9-伤残等级及三期
  - elementName：伤残等级 / 误工护理营养期（司法鉴定结论）
  - mapsToElement：mappedStatus 不确定

### `ReviewStage`（stageType 该当性/违法性/有责性）

- 本案为民事侵权，不适用刑事三阶层 ReviewStage。`ReviewStage`/`elementBelongsToStage` 关系（domain=CrimeElement）**无落点**——本案无 CrimeElement，ReviewStage 不挂。属正常（ReviewStage 为刑事专用）。

---

## L3 抗辩出罪层（Defense / Justification / Excuse）

> 永诚财保（原审被告/二审上诉人）在一审与二审中提出的实体抗辩。`Defense` props：defenseKind、isExOfficio。`Justification`/`Excuse` props：assertedBy、acceptedBy、procedureStage。

### 一审抗辩（一审被告永诚财保）

- 节点：`Defense`（layer=L3）
  - id：D1-非医保用药扣除
  - defenseKind：抗辩
  - isExOfficio：false（当事人主张，非法院依职权）
  - defendsAgainst：D1 → C1（侵权损害赔偿 Claim）
  - objectionValue：有异议（对医疗费主张扣 15%）
  - acceptedBy（认定方）：一审法院（不予采信，因未提供证据）→ 二审法院维持不予支持
  - 关联 `Justification`（procedureStage=一审/二审）：永诚财保主张扣除非医保用药 15%
    - acceptedBy：一审法院（不采信）/ 二审法院（不予支持）
    - 理由：未提供证据证明非医保用药种类、范围及医保同类标准

### 二审上诉理由（实体性，挂 L3 Defense）

- 节点：`Defense`（layer=L3）
  - id：D2-用药合理性鉴定申请
  - defenseKind：抗辩
  - isExOfficio：false
  - defendsAgainst：D2 → C1（医疗费部分）
  - objectionValue：有异议
  - 要点：申请用药相关性/合理性鉴定；主张被上诉人拒不提供用药清单应承担举证不利，按均值扣 15%
  - acceptedBy：二审法院（不予支持）
  - 关联 `BurdenAssignment`（L5）：举证责任由永诚财保承担（主张扣减方举证），isReversed=false

- 节点：`Defense`
  - id：D3-伤残鉴定违法
  - defenseKind：抗辩
  - isExOfficio：false
  - defendsAgainst：D3 → C1（伤残赔偿金/三期部分）
  - objectionValue：有异议
  - 要点：内固定取出术（2015-8-1）与鉴定（2015-9-16）间隔过近；活动受限可能是手术原因；规范要求内固定取出术三月后鉴定；鉴定人员置之不理
  - acceptedBy：二审法院（不采纳，认定鉴定无不当）

- 节点：`Defense`
  - id：D4-三期超出规范
  - defenseKind：抗辩
  - isExOfficio：false
  - defendsAgainst：D4 → C1（误工费/护理费/营养费部分）
  - objectionValue：有异议
  - 要点：参照 GA/T1193-2014，胫骨平台骨折手术误工最长 180 日、护理 90 日、营养 60 日；鉴定 240/150/120 日超标，超出部分不应支持
  - acceptedBy：二审法院（不采纳，维持鉴定结论）

- 节点：`Defense`
  - id：D5-误工证据虚假/应按农村标准
  - defenseKind：抗辩
  - isExOfficio：false
  - defendsAgainst：D5 → C1（误工费部分）
  - objectionValue：有异议
  - 要点：工资发放表手写签字系一次性书写；工资发放表不可能只有一名员工；误工证据虚假；误工费不应支持；伤残等级即使成立也应按农村标准
  - acceptedBy：二审法院（不采纳，按城镇标准）

> 注意：D2–D5 同时具有"对一审判决的攻击"性质，双重挂接——既挂 L3 Defense（实体抗辩），又通过 A 翼 Attack 关联对应 Argument（见 A 翼）。这是骨架允许的（Defense 是独立节点，design_rule 2；Argument 可 attacks Assertion）。双重挂接是否过度，留待比对裁决。

### `SentencingFactor`（factorType、affects）

- `SentencingFactor` 为刑事量刑情节类，本案民事**无落点**。正常。

---

## L4 事实要素层（MaterialFact / AdjudicativeFact / CaseElement）

> 三分：生活事实（LifeFact）、要件事实（MaterialFact）、裁判事实（AdjudicativeFact）。`CaseElement` 为要素行（带 claimantValue/defendantValue/isContested/courtFinding/findingBasis/objectionValue/mappedStatus/condition）。

### LifeFact / MaterialFact（生活事实/要件事实）

- 节点：`LifeFact`（layer=L4，parent=Fact，factLayer=生活事实）
  - id：F1-事故经过
  - 内容：2014-5-26 17:45，张银生驾驶苏J×××××号小型普通客车临时停于阜宁县东沟镇公兴社区长治路公兴中心小学东侧，开车门时与东向西行驶的邱荣珍驾驶的阜宁073850号电动自行车碰撞，致邱荣珍受伤、双方车辆受损
  - validFrom：2014-05-26T17:45

- 节点：`MaterialFact`（layer=L4，factLayer=要件事实）
  - id：F2-交通事故认定
  - 内容：2014-6-4 阜宁县公安局交通巡逻警察大队第201455052602号认定书，张银生全责、邱荣珍无责
  - mapsToElement：F2 → E4（过错）/E1（违法行为）；mappedStatus 不确定（I2 总纲未核实）
  - 关系：`isProvedBy`（AdjudicativeFact → Evidence）：法院认定的"张银生全责"由交通事故认定书证明

- 节点：`MaterialFact`
  - id：F3-伤情与治疗
  - 内容：邱荣珍左胫骨平台粉碎性骨折、左腓骨近端骨折；建湖县中医院住院治疗，医疗费 62625.7 元（含张银生垫付 46748.77 元）；住院 105 天
  - mapsToElement：F3 → E2（损害事实）

- 节点：`MaterialFact`
  - id：F4-保险关系
  - 内容：肇事车在永诚财保江苏分公司投保交强险 + 30 万不计免赔商业险，事故在保险期内
  - mapsToElement：F4 → E5/E6

- 节点：`MaterialFact`
  - id：F5-非农收入/城镇生活
  - 内容：邱荣珍户籍农村，但阜宁县东沟镇双河村村委会证明长期从事非农工作、主要收入来自非农；公兴居委会证明随子女在城镇生活；飞腾石油机械公司证明在此工作（月薪 3500）；一审法院调查楚某陈述其为勤杂工（除锈、打磨等体力劳动）
  - mapsToElement：F5 → E7（残疾赔偿金城镇标准）/E8（误工费城镇标准）

- 节点：`MaterialFact`
  - id：F6-内固定取出术
  - 内容：2015-8-1 邱荣珍行内固定取出术；2015-9-16 司法鉴定
  - mapsToElement：F6 → E9（伤残/三期）

### AdjudicativeFact（裁判事实，经法院认定，带 findingBasis）

> findingBasis range=[Evidence, Presumption]（interface I4）。注意 P1 待裁决：findingBasis 的 JudicialNotice/Admission/Mixed 三项悬空（v3.4 列出但 classes 段未定义）。本案一审法院对交通事故认定书"予以确认并作为定案依据"——是否属 JudicialNotice（司法认知）？**无落点**（P1 未裁决，三项定性不定），只能挂 Evidence。

- 节点：`AdjudicativeFact`（layer=L4，factLayer=裁判事实，findingBasis）
  - id：AF1-医疗费认定
  - courtFinding：62625.7 元（原告主张 62868.3，法院按票据认定 62625.7）
  - findingBasis：医疗费票据（Evidence）
  - 关系：`isProvedBy`：AF1 → 医疗费票据 Evidence

- 节点：`AdjudicativeFact`
  - id：AF2-住院伙食补助费认定
  - courtFinding：1890 元（105 天×18 元/天；原告主张 105 天×20 元=2100）
  - findingBasis：住院天数 105 天（医疗记录 Evidence）

- 节点：`AdjudicativeFact`
  - id：AF3-营养费认定
  - courtFinding：1080 元（120 天×9 元/天；原告主张 120 天×10 元=1200）
  - findingBasis：司法鉴定意见书（营养期 120 天，Evidence）

- 节点：`AdjudicativeFact`
  - id：AF4-残疾赔偿金认定
  - courtFinding：65257.4 元（34346 元/年×19 年×0.1，城镇标准）
  - findingBasis：居委会证明（城镇生活）+ 司法鉴定意见书（十级伤残）

- 节点：`AdjudicativeFact`
  - id：AF5-误工费认定
  - courtFinding：22560 元（240 天×94 元/天，城镇标准）
  - findingBasis：村委会证明（非农收入）+ 飞腾公司证明 + 楚某调查笔录

- 节点：`AdjudicativeFact`
  - id：AF6-护理费认定
  - courtFinding：9000 元（150 天×60 元/天）
  - findingBasis：司法鉴定意见书（护理期 150 天）

- 节点：`AdjudicativeFact`
  - id：AF7-交通费认定
  - courtFinding：200 元（原告主张 1000，被告认可 200）
  - findingBasis：部分交通费发票原件 + 被告自认（被告认可 200 元属 Admission？**无落点**——Admission 未定义，P1 待裁决）

- 节点：`AdjudicativeFact`
  - id：AF8-精神损害抚慰金认定
  - courtFinding：3000 元（原告主张 5000，法院结合伤情酌定）
  - findingBasis：司法鉴定意见书（十级伤残）+ 法院酌定（法院酌定属何种 findingBasis？**不确定**——既非 Evidence 也非 Presumption，法院自由裁量无对应 findingBasis 取值，缺口候选）

- 节点：`AdjudicativeFact`
  - id：AF9-拐杖费/车辆损失认定
  - courtFinding：不予支持（拐杖无正规票据、车辆损失无证据）
  - findingBasis：无（举证不足，驳回）

- 节点：`AdjudicativeFact`
  - id：AF10-损失合计
  - courtFinding：165613.1 元

### CaseElement（要素行，含主张值/异议值/认定值）

> 每行对应一个赔偿项目，带 claimantValue/defendantValue/courtFinding/objectionValue/mappedStatus/findingBasis。

- 节点：`CaseElement`（layer=L4）
  - id：CE1-医疗费行
  - claimantValue：62868.3 元
  - defendantValue：扣 15% 非医保用药（永诚财保异议）
  - isContested：true
  - courtFinding：62625.7 元
  - objectionValue：部分异议（金额由 62868.3 调为 62625.7，且被告主张扣 15%）
  - mappedStatus：不确定（I2 总纲未核实）
  - findingBasis：医疗费票据
  - mapsToElement：CE1 → E2（损害）/相关侵权要件

- 节点：`CaseElement`
  - id：CE2-住院伙食补助费行
  - claimantValue：2100 元（105×20）
  - defendantValue：未明确异议（标准）
  - isContested：true
  - courtFinding：1890 元（105×18）
  - objectionValue：部分异议
  - mappedStatus：不确定
  - findingBasis：住院天数记录

- 节点：`CaseElement`
  - id：CE3-营养费行
  - claimantValue：1200 元（120×10）
  - courtFinding：1080 元（120×9）
  - objectionValue：部分异议
  - mappedStatus：不确定
  - findingBasis：司法鉴定意见书

- 节点：`CaseElement`
  - id：CE4-残疾赔偿金行
  - claimantValue：65257.4 元（城镇标准）
  - defendantValue：应按农村标准（永诚财保二审主张）
  - isContested：true
  - courtFinding：65257.4 元（城镇标准）
  - objectionValue：有异议
  - mappedStatus：不确定
  - findingBasis：居委会证明 + 司法鉴定意见书

- 节点：`CaseElement`
  - id：CE5-误工费行
  - claimantValue：28000 元（240×3500/月）
  - defendantValue：证据虚假、应按农村标准
  - isContested：true
  - courtFinding：22560 元（240×94/天，城镇标准）
  - objectionValue：有异议
  - mappedStatus：不确定
  - findingBasis：村委会证明 + 飞腾公司证明 + 楚某调查笔录

- 节点：`CaseElement`
  - id：CE6-护理费行
  - claimantValue：9000 元（150×60）
  - defendantValue：三期超标（护理期应 90 日）
  - isContested：true
  - courtFinding：9000 元
  - objectionValue：有异议
  - mappedStatus：不确定
  - findingBasis：司法鉴定意见书

- 节点：`CaseElement`
  - id：CE7-交通费行
  - claimantValue：1000 元
  - defendantValue：认可 200 元
  - isContested：true
  - courtFinding：200 元
  - objectionValue：部分异议（被告认可 200，可视为附条件自认？）
  - condition：不确定——若按"附条件"异议需填 condition，但被告"认可 200"更接近部分自认，Admission 无落点（P1）
  - mappedStatus：不确定
  - findingBasis：部分发票 + 被告认可

- 节点：`CaseElement`
  - id：CE8-精神损害抚慰金行
  - claimantValue：5000 元
  - defendantValue：（未明确异议金额）
  - isContested：true
  - courtFinding：3000 元
  - objectionValue：部分异议
  - mappedStatus：不确定
  - findingBasis：司法鉴定意见书 + 法院酌定（法院酌定 findingBasis 无落点，见 AF8）

- 节点：`CaseElement`
  - id：CE9-财物损失行
  - claimantValue：500 元
  - defendantValue：不予认可
  - isContested：true
  - courtFinding：不支持
  - objectionValue：有异议
  - mappedStatus：不确定
  - findingBasis：无（举证不足）

- 节点：`CaseElement`
  - id：CE10-拐杖费行
  - claimantValue：110 元
  - defendantValue：手写发票不予认可
  - isContested：true
  - courtFinding：不支持
  - objectionValue：有异议
  - mappedStatus：不确定
  - findingBasis：无（无正规票据）

- 节点：`CaseElement`
  - id：CE11-鉴定费行
  - claimantValue：1310 元
  - courtFinding：1310 元（由张银生负担）
  - objectionValue：无异议
  - mappedStatus：不确定
  - findingBasis：鉴定费票据

---

## L5 证据举证层（Evidence / EvidenceAdmissibilityFinding / Subsumption / BurdenAssignment / ProofStandard / Presumption）

> design_rule 3：三性必须是独立认定节点（EvidenceAdmissibilityFinding），不得做成 Evidence 属性。design_rule 16：质证不新建类，映射到 EvidenceAdmissibilityFinding + EvidenceWeightFinding + subject。

### Evidence 节点（evidenceType）

- 节点：`Evidence`（layer=L5）
  - id：EV1-道路交通事故认定书
  - evidenceType：书证（交警认定书属公文书证）
  - submittedBy：交警部门（非当事人，属公权力文书）—— uncertain：submittedBy 枚举无"交警/行政机关"取值，提交方是交警，但作为证据由当事人举证。标"不确定（submittedBy 为交警还是举证人）"
  - submittedAt：2014-6-4

- 节点：`Evidence`
  - id：EV2-医疗费票据
  - evidenceType：书证
  - submittedBy：邱荣珍（一审开庭 2015-11-24 提供 16119.53 元发票；张银生垫付 4 万余元部分票据不在邱荣珍手中）
  - submittedAt：2015-11-24（一审开庭）

- 节点：`Evidence`
  - id：EV3-司法鉴定意见书（盐阜司法【2015】临鉴字第413号）
  - evidenceType：鉴定意见
  - submittedBy：一审法院委托（非当事人直接提交）—— uncertain：submittedBy 应为"法院委托"还是"鉴定机构"，标"不确定（法院委托鉴定，提交方非典型当事人）"
  - submittedAt：2015-9-16

- 节点：`Evidence`
  - id：EV4-双河村村民委员会证明
  - evidenceType：书证
  - submittedBy：邱荣珍
  - 内容：长期从事非农工作、主要收入来自非农

- 节点：`Evidence`
  - id：EV5-公兴居委会证明
  - evidenceType：书证
  - submittedBy：邱荣珍
  - 内容：随子女在城镇生活

- 节点：`Evidence`
  - id：EV6-飞腾石油机械公司证明
  - evidenceType：书证
  - submittedBy：邱荣珍
  - 内容：在此公司工作，月薪 3500

- 节点：`Evidence`
  - id：EV7-工资发放表
  - evidenceType：书证
  - submittedBy：邱荣珍
  - 争议：上诉人主张手写签字一次性书写、虚假

- 节点：`Evidence`
  - id：EV8-交通费发票（部分原件）
  - evidenceType：书证
  - submittedBy：邱荣珍

- 节点：`Evidence`
  - id：EV9-拐杖手写发票
  - evidenceType：书证
  - submittedBy：邱荣珍
  - 争议：无正规票据，被告不予认可

- 节点：`Evidence`
  - id：EV10-楚某调查笔录
  - evidenceType：证人证言
  - submittedBy：一审法院依职权调查（2015-12-2）—— uncertain：submittedBy 为"法院"还是"证人楚某"，标"不确定"

### EvidenceAdmissibilityFinding（三性独立认定，design_rule 3）

> props：authenticity（真实性）、legality（合法性）、relevance（相关性）、assertedBy、acceptedBy、subject（partySide）。

- 节点：`EvidenceAdmissibilityFinding`
  - id：EAF1-司法鉴定意见书三性
  - authenticity：认可（程序合法、机构人员有资格）
  - legality：认可（一审法院委托、程序合法）
  - relevance：认可（符合伤情）
  - assertedBy：一审法院（委托作出）/ 二审法院（认定可作为定案依据）
  - acceptedBy：一审法院、二审法院
  - subject：原告侧（邱荣珍伤情，partySide=原告侧）—— uncertain：subject 枚举为 partySide（原告侧/被告侧），鉴定意见书证明对象为邱荣珍伤情，倾向"原告侧"
  - 一审认定：依法予以认定，作为定案依据
  - 二审认定：鉴定程序合法、机构人员具备资格、上诉人未证明不合理之处，可作为定案依据

- 节点：`EvidenceAdmissibilityFinding`
  - id：EAF2-建湖县中医院医药费发票三性
  - authenticity：认可（上诉人对真实性无异议）
  - legality：不确定——上诉人对阜宁县公兴卫生院票据附条件异议（无建湖县中医院医嘱要求不予认可）
  - relevance：认可
  - assertedBy：永诚财保（质证方）
  - acceptedBy：二审法院
  - subject：被告侧

- 节点：`EvidenceAdmissibilityFinding`
  - id：EAF3-阜宁县公兴卫生院医药票据三性
  - authenticity：附条件认可
  - legality：不确定
  - relevance：附条件（如无建湖县中医院医嘱要求则不予认可）
  - assertedBy：永诚财保
  - acceptedBy：二审法院
  - subject：被告侧
  - 对应 CaseElement objectionValue=附条件，condition="如没有建湖县中医院的医嘱要求"（指向 CE1 医疗费行）

- 节点：`EvidenceAdmissibilityFinding`
  - id：EAF4-工资发放表三性
  - authenticity：异议（上诉人主张手写签字一次性书写、虚假）
  - legality：不确定
  - relevance：异议
  - assertedBy：永诚财保
  - acceptedBy：一审/二审法院（未明确采信，但一审按城镇标准认定误工费，实际未采纳"虚假"主张）
  - subject：被告侧

- 节点：`EvidenceAdmissibilityFinding`
  - id：EAF5-交通事故认定书三性
  - authenticity：认可
  - legality：认可
  - relevance：认可
  - assertedBy：一审法院（"予以确认"）
  - acceptedBy：一审法院、二审法院（"原审查明的事实属实，本院予以确认"）
  - subject：不确定——交通事故认定书证明对象为张银生全责（对被告不利），但由交警作出。subject 取 partySide，倾向"原告侧"（证明被告过错），标"不确定"
  - 注意：一审法院对交通事故认定书"予以确认并作为定案依据"——是否属 JudicialNotice（司法认知）？**无落点**（P1 待裁决，JudicialNotice 未定义）。只能挂 Evidence + EvidenceAdmissibilityFinding。

### EvidenceWeightFinding（证明力，weightQualitative）

- 节点：`EvidenceWeightFinding`
  - id：EWF1-司法鉴定意见书证明力
  - weightQualitative：高（一审、二审均作为定案依据）
- 节点：`EvidenceWeightFinding`
  - id：EWF2-工资发放表证明力
  - weightQualitative：低/存疑（上诉人质疑虚假，但法院未明确否定，仍按城镇标准认定——证明力认定不一致，标"不确定"）

### Subsumption（涵摄，isContested/acceptedBy/procedureStage）

- 节点：`Subsumption`（layer=L5）
  - id：S1-侵权责任涵摄
  - isContested：false（侵权责任成立无争议，张银生全责）
  - acceptedBy：一审/二审法院
  - procedureStage：一审/二审（procedureStageType）
  - isSubsumedUnder：S1 → E1/E2/E3/E4（侵权要件）
  - subsumesFact：S1 → F1/F2/F3

### BurdenAssignment（举证责任，burdenKind/holder/isReversed）

- 节点：`BurdenAssignment`（layer=L5）
  - id：BA1-用药合理性举证责任
  - burdenKind：主张扣减方举证（永诚财保主张扣 15% 非医保，应举证）
  - holder：永诚财保
  - isReversed：false
  - hasBurden：BA1 → E2（损害要件中的医疗费部分）/MaterialFact
  - 二审认定：永诚财保未举证证明非医保用药种类范围及医保标准，承担举证不利后果

- 节点：`BurdenAssignment`
  - id：BA2-误工费举证责任
  - burdenKind：主张方举证（邱荣珍主张误工费）
  - holder：邱荣珍
  - isReversed：false

### ProofStandard / Presumption

- 节点：`ProofStandard`（layer=L5）
  - id：PS1-民事证明标准
  - standardType：高度盖然性（民事侵权适用高度盖然性）
  - requiredStandard：PS1 → 相关 Element

- 节点：`Presumption`（layer=L5）
  - 无明显法律推定。**无落点**（本案无适用推定的要件）。正常。

---

## L6 程序时间层（ProcedureStage / ProcedureAct / TimePeriod / LimitationPeriod）

### ProcedureStage（procedureStageType/court/timeInterval）

- 节点：`ProcedureStage`（layer=L6）
  - id：PS-一审
  - procedureStageType：一审
  - court：江苏省阜宁县人民法院
  - timeInterval：（2015）阜东民初字第0347号（一审立案时间不确定——判决书未载一审立案日，标"不确定"；一审开庭 2015-11-24，一审判决时间不确定，判决书未载一审宣判日）

- 节点：`ProcedureStage`
  - id：PS-二审
  - procedureStageType：二审
  - court：江苏省盐城市中级人民法院
  - timeInterval：立案 2016-2-22 至判决 2016-4-20

- 节点：`ProcedureStage`
  - id：PS-立案
  - procedureStageType：立案
  - court：江苏省盐城市中级人民法院（二审立案）
  - timeInterval：2016-2-22

- 仲裁阶段：**无落点**（本案非劳动争议等仲裁前置案由，design_rule 18 不适用，正常不建仲裁阶段）

### appealsFrom 关系（Case → Case）

- 关系：`appealsFrom`
  - 二审 Case（（2016）苏09民终867号）appealsFrom 一审 Case（（2015）阜东民初字第0347号）
  - 注意：骨架 Case 为外围类（layer='-'），appealsFrom 是 Case→Case 关系，可挂。

### ProcedureAct（actType/actor/occurredAt）

- 节点：`ProcedureAct`（layer=L6）
  - id：PA1-事故行为
  - actType：不确定——张银生驾驶/停车/开门是侵权行为还是程序行为？骨架 ProcedureAct 偏程序行为（立案/审理/委托鉴定等）。事故行为更接近 LifeFact/侵权行为。**倾向不挂 ProcedureAct，挂 LifeFact F1**。标"不确定（事故行为非典型程序行为）"
  - 退而挂：交通事故认定书的作出可作 ProcedureAct（交警认定行为）
    - actType：交警事故认定
    - actor：阜宁县公安局交通巡逻警察大队
    - occurredAt：2014-6-4
    - occursInStage：PA1 → PS-一审（认定行为发生在诉讼前，但用于一审）—— uncertain：事故发生在 2014-6-4，一审在 2015，认定行为发生在立案前，stage 关联"立案"或前置？标"不确定"

- 节点：`ProcedureAct`
  - id：PA2-一审法院委托司法鉴定
  - actType：法院委托鉴定
  - actor：江苏省阜宁县人民法院
  - occurredAt：2015（具体委托日不确定，鉴定作出 2015-9-16）
  - occursInStage：PA2 → PS-一审

- 节点：`ProcedureAct`
  - id：PA3-一审开庭质证
  - actType：开庭审理
  - actor：江苏省阜宁县人民法院
  - occurredAt：2015-11-24
  - occursInStage：PA3 → PS-一审

- 节点：`ProcedureAct`
  - id：PA4-一审法院调查飞腾公司
  - actType：法院依职权调查
  - actor：江苏省阜宁县人民法院（调查楚某）
  - occurredAt：2015-12-2
  - occursInStage：PA4 → PS-一审

- 节点：`ProcedureAct`
  - id：PA5-二审立案
  - actType：立案
  - actor：江苏省盐城市中级人民法院
  - occurredAt：2016-2-22
  - occursInStage：PA5 → PS-立案/PS-二审

- 节点：`ProcedureAct`
  - id：PA6-二审合议庭审理
  - actType：合议庭审理
  - actor：江苏省盐城市中级人民法院（审判长郑治、代理审判员姚海斌、郑娟娟）
  - occurredAt：2016（具体审理日不确定）
  - occursInStage：PA6 → PS-二审

- 节点：`ProcedureAct`
  - id：PA7-二审判决
  - actType：判决
  - actor：江苏省盐城市中级人民法院
  - occurredAt：2016-4-20
  - occursInStage：PA7 → PS-二审

### triggerFillsElement（程序触发器→要素补全，fix5）

- 本案无公安协助取证/网络协助勾选等程序触发器补全主体身份的场景。**无落点**。正常。

### TimePeriod / LimitationPeriod

- 节点：`TimePeriod`（layer=L6）
  - id：TP1-履行期
  - startRule：本判决生效后
  - endRule：本判决生效后 10 日内（一审判决主文"限于本判决生效后 10 日内履行完毕"）
  - 注意：这是一审判决的履行期，二审维持原判故延续。但二审判决主文未重述履行期——**不确定**（二审维持是否延续一审 10 日履行期，留待法律判断，盲测只标结构）

- 节点：`LimitationPeriod`
  - 人身损害赔偿诉讼时效——本案未涉及时效争议。**无落点**（未启用，design_rule 8）。正常。

---

## L7 裁判层（Judgment，v3.5 fix7 新增）

> Judgment props：disposition/amount/basis/rate/effectiveDate。design_rule 17：判项必须建成 Judgment 节点，禁止塞 CaseElement.courtFinding。judgmentOn 关系：Judgment → Assertion/CaseElement（range 不含 Judgment）。

### 一审判决主文判项（被二审"维持"，作为本案生效判项）

> 一审主文含多项判项，一项诉请可有多个 Judgment（design_rule 17 注）。

- 节点：`Judgment`（layer=L7）
  - id：J1-交强险赔偿
  - disposition：支持
  - amount：110017.4 元
  - basis：交强险限额内赔偿
  - rate：无（非利率/违约金判项）
  - effectiveDate：不确定——二审判决为终审，但判决书未明确载生效日；"本判决为终审判决"不等于 effectiveDate 依据（骨架明确"未知留空，不按 disposition 自动推定"）。留空。
  - judgmentOn：J1 → C1（侵权损害赔偿 Claim，整项诉请）/或 CE1 等 CaseElement（医疗费等具体行）。倾向 judgmentOn → C1（整项诉请被判赔交强险部分）

- 节点：`Judgment`
  - id：J2-商业险赔偿
  - disposition：支持
  - amount：55595.7 元
  - basis：商业险限额内赔偿（不足部分根据保险合同）
  - rate：无
  - effectiveDate：留空（同上）
  - judgmentOn：J2 → C1

- 节点：`Judgment`
  - id：J3-支付分配（向邱荣珍/张银生分别支付）
  - disposition：部分支持（含基数/标准调整）——理由：法院调整了多项计算标准（住院伙食 18 元/天、营养 9 元/天、交通 200、精神抚慰 3000、误工 94 元/天城镇标准），且扣减张银生垫付及应负担费用后分配支付，属基数/标准调整
  - amount：向邱荣珍支付 120870.33 元 + 向张银生支付 44742.77 元
  - basis：扣减张银生垫付 46748.77 元及应负担诉讼费鉴定费后分配（必填，enum_constraint 要求 disposition=部分支持（含基数/标准调整）时 basis 必填，已满足）
  - rate：无
  - effectiveDate：留空
  - judgmentOn：J3 → C1 / CE1–CE8（各项要素行）

- 节点：`Judgment`
  - id：J4-驳回其他诉讼请求
  - disposition：驳回
  - amount：无
  - basis：驳回拐杖费、车辆损失等
  - judgmentOn：J4 → CE9/CE10（财物损失、拐杖费行）

- 节点：`Judgment`
  - id：J5-一审诉讼费鉴定费负担
  - disposition：**无落点**——诉讼费负担判项（"案件受理费 696 元、鉴定费 1310 元由张银生负担"）在 disposition 枚举（支持/驳回/部分支持/部分支持（含基数/标准调整）/维持/撤销/改判/发回重审）中无对应值。这是骨架缺口候选：诉讼费/鉴定费负担判项无 disposition 取值。
  - 临时处理：标"无落点（诉讼费负担无 disposition 值）"，不强行挂支持/驳回。
  - amount：2006 元（696+1310）
  - judgmentOn：J5 → C2（诉讼费用承担 Claim，但 C2 本身 claimType 无落点，见 L1）

### 二审判决主文判项（本案主文）

- 节点：`Judgment`（layer=L7）
  - id：J6-驳回上诉维持原判
  - disposition：维持
  - amount：无
  - basis：一审判决认定事实清楚、适用法律正确（二审"本院认为"理由）
  - rate：无
  - effectiveDate：留空（终审但无明确生效日依据，不按 disposition 自动推定）
  - judgmentOn：**无落点**——"维持原判"的 judgmentOn 应指向被维持的一审判决主文（一审 Judgment J1–J5）或上诉请求。但 judgmentOn range=[Assertion, CaseElement]，**不含 Judgment**。故"维持原判"判项指向一审 Judgment 时无落点。这是骨架缺口候选：judgmentOn range 不含 Judgment，"维持/撤销/改判/发回重审"等审级判项指向下级 Judgment 时无落点。
  - 临时处理：若把"上诉请求"勉强作为 Assertion 挂（但上诉请求 claimType 无落点，见 L1），则 judgmentOn → 上诉请求 Assertion。但这是双重无落点，不强行。标"无落点（judgmentOn range 不含 Judgment）"。
  - 关联规范：basisNorm = 《民事诉讼法》第 170 条第一款第（一）项（须带 validity period，design_rule 14；2012 年民诉法 170 条，盲测方不补具体有效期，标"须带 validity period"）

- 节点：`Judgment`
  - id：J7-二审诉讼费负担
  - disposition：**无落点**——"二审案件受理费 696 元由上诉人负担"同样无 disposition 对应值（同 J5 缺口）
  - amount：696 元
  - judgmentOn：J7 → C2（诉讼费用承担，C2 无 claimType 落点）

### 判项落点专项说明

- 一审赔偿判项（J1/J2/J3）：可挂 Judgment，disposition 取值可走通（支持/部分支持（含基数/标准调整）），**有落点**。
- 一审驳回判项（J4）：disposition=驳回，**有落点**。
- 一审/二审诉讼费负担判项（J5/J7）：disposition 无对应值，**无落点**（缺口候选）。
- 二审"驳回上诉维持原判"（J6）：disposition=维持有取值，但 judgmentOn 指向一审 Judgment 时 range 不含 Judgment，**无落点**（缺口候选）。
- effectiveDate：本案判决书载"本判决为终审判决"，但无明确生效日；骨架明确"不按 disposition 自动推定"，故所有 Judgment 的 effectiveDate 均留空（**不确定/留空**，非缺口，是规则要求）。
- "本判决为终审判决"——终审属性本身：**无落点**（骨架 Judgment 无"是否终审/审级"字段，Case 有 appealsFrom 但 Judgment 无审级字段）。缺口候选：Judgment 缺审级/终审标志字段。

---

## A 论证争点翼（Issue / Argument / Attack / Preference）

> 对齐 AIF/ASPIC+/Dung。Issue props：issueStatus/raisedBy。Argument props：defeatStatus。Attack 类本身无自有属性（G1，attackType 由 attacks 边携带）。Preference props：basis。

### Issue 节点

- 节点：`Issue`（layer=A）
  - id：I1-医疗费争点（用药合理性/非医保扣除）
  - issueStatus：已裁决（二审不予支持扣 15%）
  - raisedBy：永诚财保（上诉人）
  - issueConcerns：I1 → C1 / CE1（医疗费行）/ D1/D2
  - 关系：`hasIssue`：Case → I1

- 节点：`Issue`
  - id：I2-伤残鉴定合法性争点
  - issueStatus：已裁决（鉴定无不当）
  - raisedBy：永诚财保
  - issueConcerns：I2 → EV3（鉴定意见书）/ D3 / E9

- 节点：`Issue`
  - id：I3-三期超标争点
  - issueStatus：已裁决（维持鉴定结论）
  - raisedBy：永诚财保
  - issueConcerns：I3 → EV3 / D4 / CE3/CE5/CE6

- 节点：`Issue`
  - id：I4-误工费标准与证据真实性争点
  - issueStatus：已裁决（按城镇标准）
  - raisedBy：永诚财保
  - issueConcerns：I4 → CE5 / D5 / EV6/EV7 / E8

- 节点：`Issue`
  - id：I5-一审判决公正性/应否撤销争点（程序性上诉请求）
  - issueStatus：已裁决（维持原判）
  - raisedBy：永诚财保
  - issueConcerns：I5 → J6（二审维持判项）/ 一审判决整体
  - 注意：上诉请求"撤销一审判决"本身无 claimType 落点（见 L1），挂 Issue 作争点。但 Issue.issueConcerns range=[Assertion, Element, CaseElement]，不含 Judgment——I5 指向一审判决（Judgment）时**无落点**（同 judgmentOn 缺口）。倾向 issueConcerns → C1（侵权 Claim，作为被上诉请求攻击的对象）。

### Argument 节点（defeatStatus）

- 节点：`Argument`（layer=A）
  - id：AR1-永诚财保：扣 15% 非医保用药主张
  - defeatStatus：被击败（二审不予支持）
  - supports：AR1 → D1/D2（抗辩）
  - attacks：AR1 → C1（侵权赔偿 Claim，attackType=rebut）

- 节点：`Argument`
  - id：AR2-永诚财保：鉴定违法主张
  - defeatStatus：被击败
  - attacks：AR2 → EV3（鉴定意见书，attackType=undermine）/ E9

- 节点：`Argument`
  - id：AR3-永诚财保：三期超标主张
  - defeatStatus：被击败
  - attacks：AR3 → EV3（attackType=undermine）

- 节点：`Argument`
  - id：AR4-永诚财保：误工证据虚假/应按农村标准
  - defeatStatus：被击败
  - attacks：AR4 → EV6/EV7（attackType=rebut）/ E8

- 节点：`Argument`
  - id：AR5-永诚财保：一审判决不公正应撤销（上诉请求整体）
  - defeatStatus：被击败
  - attacks：AR5 → 一审判决（Judgment，**range 不含 Judgment，无落点**）；退而 attacks → C1（Claim）

- 节点：`Argument`
  - id：AR6-二审法院：维持原判理由
  - defeatStatus：未击败（采纳）
  - supports：AR6 → 一审认定/AF1–AF10 / C1（部分）
  - 关联 Judgment J6

### Attack 关系（attackType 由 attacks 边携带）

- AR1 attacks C1（attackType=rebut）
- AR2 attacks EV3（attackType=undermine——攻击鉴定合法性，属削弱证明力/合法性，倾向 undermine；不确定：rebut vs undermine，标"倾向 undermine"）
- AR3 attacks EV3（attackType=undermine——攻击三期结论超出规范）
- AR4 attacks EV6/EV7（attackType=rebut——攻击误工证据真实性，直接反驳）
- AR5 attacks 一审判决：**无落点**（attacks range=[Argument, Assertion]，不含 Judgment）

### Preference 节点（basis）

- 节点：`Preference`（layer=A）
  - id：PR1-二审法院对鉴定意见的偏好
  - basis：鉴定程序合法、机构人员有资格、上诉人未证明不合理之处
  - preferredOver：PR1 → AR2/AR3（上诉人攻击鉴定意见的 Argument）

- 节点：`Preference`
  - id：PR2-二审法院对城镇标准的偏好
  - basis：邱荣珍在企业从事体力劳动，一审按城镇标准符合法律规定
  - preferredOver：PR2 → AR4

- 节点：`Preference`
  - id：PR3-二审法院对维持原判的偏好
  - basis：一审认定事实清楚、适用法律正确
  - preferredOver：PR3 → AR5

### ArgumentScheme / CriticalQuestion

- 本案未显式引用论证方案（如法律三段论方案）。`ArgumentScheme`/`CriticalQuestion` **无落点**（判决书未结构化呈现论证方案/批判问题）。属正常（非每案必建）。

---

## R 法律关系翼（按场景选建，design_rule 12）

- 本案为机动车交通事故侵权，非担保等七类必建。`Case.relationWingStatus`=notBuilt。
- `LegalRelation`/`HohfeldRelation`/`LegalRelationEvent`/`CapacityAssessment`/`LegalObject` **无落点**（不建）。
- 例外：可考虑建 HohfeldRelation 描述邱荣珍对张银生/永诚财保的 right（赔偿请求权）与对方的 duty。但按 design_rule 12"按场景选建，七类必建，其余降级"，本案非必建，倾向 notBuilt。标"无落点（非七类必建，降级 notBuilt）"。

---

## 缺口汇总（最有价值的发现）

按任务书要求，"挂不上"是最有价值的发现。本次盲测识别以下骨架缺口：

### 高置信缺口（结构确证无法走通）

1. **上诉请求无 claimType 落点**（L1）
   - 上诉人永诚财保"撤销一审判决/改判"请求不属于 claimType 任一枚举值，且非独立 Claim。骨架无"审级请求/上诉请求"Assertion 子类。
   - 影响：二审上诉请求只能拆解为 A 翼 Issue + L3 Defense，无独立 L1 落点。

2. **诉讼费用承担 Claim 无 claimType 落点**（L1）
   - "诉讼费用由被告承担"无对应 claimType 值。一审/二审均涉诉讼费负担请求。

3. **judgmentOn range 不含 Judgment**（L7）
   - "驳回上诉维持原判"（disposition=维持）的 judgmentOn 应指向一审 Judgment，但 range=[Assertion, CaseElement]，不含 Judgment。同理"撤销/改判/发回重审"等审级判项指向下级 Judgment 时均无落点。
   - 影响：所有二审审级判项（维持/撤销/改判/发回重审）的指向对象无落点。这是 fix7 判项层的关键遗留缺口。

4. **诉讼费/鉴定费负担判项无 disposition 取值**（L7）
   - disposition 枚举（支持/驳回/部分支持/部分支持（含基数/标准调整）/维持/撤销/改判/发回重审）无"费用负担"语义值。一审 J5、二审 J7 均无落点。
   - 影响：费用负担判项只能塞进 basis 或 courtFinding，违反 design_rule 17。

5. **Judgment 缺审级/终审标志字段**（L7）
   - "本判决为终审判决"无字段承接。Judgment 无 isFinal/courtLevel 字段，Case.appealsFrom 只解决案号关系，不解决判项审级属性。

### 中置信缺口（属性取值悬空）

6. **findingBasis 的 JudicialNotice/Admission/Mixed 三项悬空**（P1 待裁决，L5）
   - 本案一审法院对交通事故认定书"予以确认并作为定案依据"接近 JudicialNotice（司法认知）；被告对交通费"认可 200 元"接近 Admission（自认）；但 classes 段未定义三项，P1 未裁决。只能挂 Evidence，无法表达"司法认知/自认"性质。

7. **法院酌定无 findingBasis 取值**（L4/L5）
   - AF8 精神损害抚慰金 3000 元、AF7 交通费 200 元均含"法院酌定"成分，既非 Evidence 也非 Presumption，findingBasis 无对应取值。

8. **归责原则无 Element 字段区分**（L2）
   - 机动车与非机动车事故适用无过错责任（道交法 76 条），但骨架 Element 无"归责原则"字段，无法结构化区分过错责任/无过错责任/过错推定。

9. **attacks/issueConcerns/judgmentOn 三处 range 不含 Judgment**（A 翼/L7）
   - AR5 attacks 一审判决、I5 issueConcerns 一审判决、J6 judgmentOn 一审判决，三处均因 range 不含 Judgment 而无落点。这是同一根因（Judgment 未纳入这些关系的 range）的三个表现。

### 低置信/不确定项（须带 validity period 或须查阅 I2 总纲）

10. **条号引用须带 validity period**（design_rule 14）
    - 本判决引用《民事诉讼法》第 170 条第一款第（一）项，未带 validity period 三要素。盲测方不补具体有效期，标"须带 validity period"。

11. **I2 总纲 mapsToElement 的 mappedStatus 不确定**（L2/L4）
    - 所有 mapsToElement 关系的 mappedStatus 标"不确定（无法查阅 I2 总纲核实该要素是否已映射）"。design_rule 11 要求未覆盖行显式标 unmapped，但盲测方无法区分"已映射未覆盖"与"未映射"，只能标不确定。

12. **submittedBy 取值非典型当事人**（L5）
    - 司法鉴定意见书（法院委托）、交通事故认定书（交警作出）、楚某调查笔录（法院依职权调查）的 submittedBy 非当事人，枚举无对应取值。

13. **subject（partySide）取值不确定**（L5）
    - 交通事故认定书、司法鉴定意见书的 subject（证明对象对哪一方有利）需主观判断，标"不确定"。

14. **事故行为的 ProcedureAct 归属不确定**（L6）
    - 张银生驾驶/停车/开门是侵权行为还是程序行为？倾向挂 LifeFact 而非 ProcedureAct。

15. **D2–D5 双重挂接（L3 Defense + A 翼 Argument）是否过度**（L3/A）
    - 上诉理由既挂 L3 Defense（实体抗辩）又挂 A 翼 Argument（对一审判决的攻击），双重挂接是否过度，留待比对裁决。

### 非缺口（正常无落点）

- `ReviewStage`/`CrimeElement`/`elementBelongsToStage`：本案民事非刑事，正常不建。
- `SentencingFactor`：刑事量刑，正常不建。
- `Presumption`：本案无法律推定，正常不建。
- 仲裁阶段/`arbitrationPrecedes`/`arbitratedAs`：本案非仲裁前置案由，正常不建。
- R 法律关系翼：非七类必建，降级 notBuilt，正常。
- `triggerFillsElement`：无程序触发器补全场景，正常不建。
- `ArgumentScheme`/`CriticalQuestion`：判决书未结构化呈现，正常不建。

---

## 挂接完整性自检

- L1 主张层：本诉 Claim（C1 侵权）有落点；C2 诉讼费承担、上诉请求无落点（缺口 1、2）。
- L2 要件层：侵权/保险/标准要件 Element 有落点；归责原则无字段（缺口 8）；I2 mappedStatus 不确定（缺口 11）。
- L3 抗辩层：D1–D5 有落点；SentencingFactor 正常无落点。
- L4 事实层：LifeFact/MaterialFact/AdjudicativeFact/CaseElement 有落点；findingBasis 的 JudicialNotice/Admission/法院酌定无落点（缺口 6、7）。
- L5 证据层：Evidence/EvidenceAdmissibilityFinding/EvidenceWeightFinding/Subsumption/BurdenAssignment/ProofStandard 有落点；submittedBy/subject 部分不确定（缺口 12、13）；Presumption 正常无落点。
- L6 程序层：ProcedureStage/ProcedureAct/TimePeriod/appealsFrom 有落点；事故行为 ProcedureAct 归属不确定（缺口 14）；仲裁/triggerFillsElement/LimitationPeriod 正常无落点。
- L7 裁判层：J1/J2/J3/J4/J6 的 disposition 有取值；J5/J7 诉讼费负担无 disposition 值（缺口 4）；J6 judgmentOn 指向一审 Judgment 无落点（缺口 3）；终审标志无字段（缺口 5）；effectiveDate 规则性留空。
- A 论证翼：Issue/Argument/Attack/Preference 有落点；AR5/I5 指向一审 Judgment 无落点（缺口 9）。
- R 法律关系翼：正常 notBuilt。
- 判项落点专项：见 L7 节"判项落点专项说明"。

本挂接结果未修改任何文件，仅作为最终回复交付。所有缺口均按任务书要求如实标注，未为产出好看而强行挂接。
