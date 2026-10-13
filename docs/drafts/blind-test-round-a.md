# 盲测挂接结果（实例A）：（2016）苏09民终867号 机动车交通事故责任纠纷（二审）

## L0 标签层（补充，供定位）

- `CauseOfAction`（SKOS 概念，不建 OWL 类）：prefLabel=机动车交通事故责任纠纷；`caseHasCauseOfAction`（Case→CauseOfAction），cardinality 1，isPrimaryCauseOfAction=true，causeRole=审理案由；schemeVersion 不确定（判决书未载案由方案版本）。
- 外围：`Case`×2——二审案 caseNumber=（2016）苏09民终867号，court=江苏省盐城市中级人民法院；一审案 caseNumber=（2015）阜东民初字第0347号，court=江苏省阜宁县人民法院。relationWingStatus=notBuilt（本盲测未建 R 翼；机动车事故责任法律关系不在已知「七类必建」清单内，且该清单未在骨架枚举——不确定+理由：P2 未裁决，清单无客观依据）。
- `Party`×4：邱荣珍（partyType 不确定——骨架无 partyType 枚举，取值如「自然人」属自拟）；张银生；永诚财保江苏分公司；盐城市飞腾石油机械有限公司（非当事人，仅证据来源，是否建 Party 不确定——partyType 无「案外人」定义）。
- `Role`：邱荣珍 roleType=原审原告/被上诉人；张银生 roleType=原审被告；保险公司 roleType=原审被告/上诉人。roleType 无枚举绑定，取值自拟（不确定）。Role.inStage 挂对应 ProcedureStage。

## L1 主张层

- `Claim` C1（本诉主请求，assertedByRole=邱荣珍-原审原告）：claimType=**侵权**；hohfeldGroup=claim；reviewOrder 不确定（骨架未给 reviewOrder 枚举，按文义可填 1）；内容为 11 项赔偿合计 129596.93 元。骨架未提供「一项 Claim 下的赔偿子项目」建模位——11 个赔偿子项（医疗费/营养费/住院伙食补助费/残疾赔偿金/误工费/护理费/交通费/精神抚慰金/财物损失/拐杖/鉴定费）挂在哪一层**不确定**：可拆为 11 个 Claim（claimType 同为侵权），也可整体一个 Claim、子项落 CaseElement 行（本挂接采用后者，理由：v3.5 fix7 note「一条诉请可有多个 Judgment」支持按要素行裁断；但 claimType 枚举无「人身损害赔偿分项」取值，拆方案同样会撞枚举缺口）。
- `Claim` C2（诉讼费用负担请求，assertedByRole=邱荣珍）：「由被告承担本案诉讼费用」。claimType **无落点**——枚举 23 值中无「诉讼费用负担」类型；强行标「侵权」会污染统计，标注无落点。
- 反诉：本案**无反诉**（张银生未反诉；垫付款返还是一审法院「为减少讼累一并处理」，非独立 Claim——其落点见 L7，本身无 Claim 落点，标注：垫付抵扣安排在 L1 无落点）。
- `Claim` C3–C6（上诉请求，assertedByRole=保险公司-上诉人）：上诉状四项实质请求（核减医疗费含扣 15% 非医保用药；否定十级伤残鉴定；按 GA/T1193-2014 上限核减三期费用；否定误工费/按农村标准计残疾赔偿金）。claimType **无落点/不确定**——枚举无「上诉请求」类取值；上诉请求是程序性救济请求而非实体请求权，挂 Claim 属权宜（理由：Assertion 抽象禁实例化，Claim 是唯一可用子类；但这是骨架缺口，非自然落点）。尾部「请求二审法院查明事实，以维护合法权益」为概括上诉请求，无具体改判内容，不单列 Claim（不确定——也可视为撤销请求，但 claimType 无「撤销判决」值，行政侧「撤销行政行为」值不适用民事）。

## L2 要件层

- `Element` E1–E4（侵权责任一般四要件，经 `hasElement` 挂 C1）：E1 elementName=侵权行为（张银生开车门碰撞）；E2 elementName=过错/责任（事故全责认定）；E3 elementName=损害后果（人身伤害+十级伤残）；E4 elementName=因果关系。不确定+理由：I2 的 67 条要素映射清单未随包提供，本层 Element 名称系按侵权责任构成通说自拟，**mapsToElement 的具体 I2 目标无法核验**；若总纲已有「机动车交通事故责任纠纷」专用要素集，则上述命名为条号位移级差异，待 diff。
- `Element` E5（赔偿责任主体/保险赔付顺序要件：交强险限额内赔付→商业险按合同赔付→不足部分侵权人赔）：elementName=保险赔付顺位。不确定：此为裁判规则型要件，I2 是否收录不确定。
- 赔偿项目各金额行（医疗费金额、三期时长、伤残等级、城镇/农村标准等）**不作为 Element 建立**，按争议 006 落 L4 的 CaseElement 行（见 L4），mapsToElement 指向 E3（损害后果）——不确定：I2 是否把「赔偿项目」单列为 Element 未知，若单列则应逐行映射，此处标 `mappedStatus` 待核。
- `ReviewStage`（三阶层）：不适用（民事案件，不建）。

## L3 抗辩层

- `Defense` D1：defenseKind=抗辩，isExOfficio=false；`raisesDefense`（保险公司-Role→D1）；`defendsAgainst`（D1→C1 医疗费部分）。内容：医疗费合理性异议＋按均值扣 15% 非医保用药。acceptedBy=未获采纳（一、二审均不采信）。
- `Defense` D2：defenseKind=抗辩；内容：伤残鉴定时机违法（内固定取出术后未满 3 个月即鉴定，鉴定程序违法）。`defendsAgainst`→C1 残疾赔偿金部分。acceptedBy=未获采纳。
- `Defense` D3：defenseKind=抗辩；内容：三期鉴定结果超 GA/T1193-2014 规范上限（误工 240>180 日、护理 150>90 日、营养 120>60 日），超出部分不应支持。`defendsAgainst`→C1 误工费/护理费/营养费部分。acceptedBy=未获采纳。
- `Defense` D4：defenseKind=抗辩；内容：误工证据（工资发放表）系伪造，误工费不应支持；伤残赔偿金应按农村标准。`defendsAgainst`→C1 误工费/残疾赔偿金部分。acceptedBy=未获采纳。
- 一审中的抗辩表态（不独立建 Defense，落 CaseElement.objectionValue，见 L4）：交通费只认可 200 元；拐杖手写发票不认可；财物损失（车损）不认可；二审质证中对公兴卫生院票据「无医嘱则不认可」（附条件表态）。
- 说明：D1–D4 同时具有「攻击证据/鉴定意见」性质，其论证面挂在 A 翼（Attack 节点），Defense 节点只记抗辩主张与采纳结论，两者不合并。objectionValue 不是 Defense 的属性（骨架设计上属 CaseElement），抗辩层对 objectionValue 的承载**无落点**——若需记录「保险公司对某要素行的六值表态」必须落到 L4 CaseElement，跨层语义在此由设计强制分流，特此标注。

## L4 事实要素层

- `LifeFact` LF1（factLayer=生活事实）：2014-05-26 17:45 张银生停车开车门与邱荣珍电动自行车碰撞，邱受伤、双方车辆受损。
- `LifeFact` LF2（生活事实）：邱荣珍 2015-08-01 行内固定取出术（二审争议相关背景事实）。
- `MaterialFact` MF1（要件事实）：张银生负事故全部责任、邱荣珍无责任。mapsToElement→E2；`hasBurden`→BurdenAssignment 不确定（责任认定书属公文书证，举证责任分配判决书未明示，不填）。
- `MaterialFact` MF2（要件事实）：邱荣珍左胫骨平台粉碎性骨折等，后遗症构成十级伤残；误工期 240 日、护理期 150 日、营养期 120 日。mapsToElement→E3。
- `MaterialFact` MF3（要件事实）：涉案车辆投保交强险及 30 万元不计免赔商业险，事故发生于保险期内。mapsToElement→E5。
- `MaterialFact` MF4（要件事实）：邱荣珍虽农村户籍，但长期在城镇生活、主要收入来自非农。mapsToElement→E3（赔偿标准子项，不确定——见 L2 说明）。
- `MaterialFact` MF5（要件事实）：医疗费合理性无法鉴定系因申请人未提供医疗费清单（鉴定意见书载明）。mapsToElement→E3 医疗费子项。该事实涉及举证妨碍，其责任分配见 L5 BurdenAssignment。
- `AdjudicativeFact` AF1（裁判事实）：二审「原审查明的事实属实，本院予以确认」——findingBasis 指一审全部在案证据（整体确认）。**挂接困难标注**：findingBasis 的 range 仅 [Evidence, Presumption]，「对一审查明事实的整体确认」以「二审未重新举证、一审证据已在卷」为依据，属于 P1 待裁决的 Mixed/JudicialNotice 类形态——当前只能逐个挂到各 Evidence，「整体确认」这一认定形态本身**无独立落点（P1 未决）**。
- `AdjudicativeFact` AF2（裁判事实）：楚某调查陈述印证邱从事体力劳动。findingBasis→EV10（见 L5）。
- `CaseElement` 要素行（claimantValue / defendantValue / isContested / courtFinding / objectionValue）：
  - CE1 医疗费：claimantValue=62868.3 元；defendantValue=应扣 15% 非医保用药（部分异议）；isContested=true；courtFinding=62625.7 元；objectionValue=有异议；findingBasis→EV3。
  - CE2 住院伙食补助费：claimantValue=2100（105 天×20）；defendantValue 未载；isContested=false；courtFinding=1890（105×18）；objectionValue 未载（不确定——法院依职权调标准，非因被告异议）。
  - CE3 营养费：claimantValue=1200（120×10）；isContested=true（二审 D3）；courtFinding=1080（120×9）；objectionValue=有异议。
  - CE4 残疾赔偿金：claimantValue=65257.4；isContested=true（二审 D2/D4）；courtFinding=65257.4（34346 元/年×19×0.1，城镇标准）；objectionValue=有异议。
  - CE5 误工费：claimantValue=28000（240×3500/月）；isContested=true；courtFinding=22560（240×94/天）；objectionValue=有异议。
  - CE6 护理费：claimantValue=9000（150×60）；isContested=true（二审 D3）；courtFinding=9000；objectionValue=有异议。
  - CE7 交通费：claimantValue=1000；defendantValue=200；isContested=true；courtFinding=200；objectionValue=部分异议。
  - CE8 精神损害抚慰金：claimantValue=5000；defendantValue 未载；isContested=false；courtFinding=3000（法院酌减，职权性调整）；objectionValue=无异议（不确定——判决书未载被告对该项表态）。
  - CE9 财物损失（车损）：claimantValue=500；isContested=true；courtFinding=不予支持；objectionValue=有异议。
  - CE10 拐杖费：claimantValue=110；isContested=true；courtFinding=不予支持；objectionValue=有异议。
  - CE11 鉴定费：claimantValue=1310；courtFinding=由张银生负担（落判项负担部分）。**mappedStatus 标注**：鉴定费属程序费用而非损害赔偿要素，mapsToElement **无落点**，按 design_rule 11 显式标 unmapped。
  - CE12 二审新争金额：2015-11-24 邱提供医药费发票合计 16119.53 元——系已认定 62625.7 元的票据补强抑或新增费用，判决书未明说，**不确定**（理由：文义为开庭时补充举证一审医疗费的票据）；保险公司质证表态 objectionValue=附条件（condition：「如没有建湖县中医院医嘱要求，不予认可」——仅针对公兴卫生院票据部分）。
  - CE13 诉讼费用：无要素性质，不建行；负担落 L7（且无合适 disposition，见 L7）。
- `Subsumption`：isContested=true（D1–D4 所及各行）；acceptedBy=二审法院（均维持一审涵摄）；procedureStage=二审。涵摄结论：事故事实+全责+保险→保险公司交强险/商业险顺位赔付。
- `Presumption`：未建（本案无明确推定适用记载；「未提供清单致无法鉴定」按举证责任处理，不建 Presumption——不确定，若视为举证妨碍推定，骨架 Presumption 可落但判决书未作此表述）。

## L5 证据举证层

- `Evidence` EV1：道路交通事故认定书（第201455052602号）；evidenceType=书证（不确定——事故认定书在证据种类中的归属有「书证/鉴定意见/独立种类」之争，骨架 8 值枚举无「事故认定书」专值，暂挂书证）；submittedBy=邱荣珍；submittedAt=一审。
- `Evidence` EV2：盐阜司法【2015】临鉴字第413号司法鉴定意见书；evidenceType=鉴定意见；submittedBy 标注「一审法院委托」——submittedBy 语义为提交方，法院委托鉴定非当事人提交，取值不确定（骨架无「法院调查取证」来源标识，缺口候选）；submittedAt=一审。
- `Evidence` EV3：医疗费票据（建湖县中医院等）；evidenceType=书证；submittedBy=邱荣珍（一审部分票据在张银生处——「票据和用药清单并不在其手中」，归属流转本身**无落点**，骨架无证据持有/流转属性）。
- `Evidence` EV4：阜宁县东沟镇双河村村委会证明（长期从事非农工作）；书证；邱荣珍。
- `Evidence` EV5：阜宁县东沟镇公兴居委会证明（随子女在城镇生活）；书证；邱荣珍。
- `Evidence` EV6：盐城市飞腾石油机械有限公司证明（月薪 3500 元，无劳动合同）；书证；邱荣珍。
- `Evidence` EV7：工资发放表（上诉人指其签名一次性书写、仅一名员工，称系伪造）；书证；邱荣珍。
- `Evidence` EV8：交通费发票（仅部分原件）；书证；邱荣珍。
- `Evidence` EV9：拐杖手写发票；书证；邱荣珍。
- `Evidence` EV10：一审法院 2015-12-02 对楚某（飞腾公司工作人员）的调查笔录；evidenceType=证人证言；submittedBy=法院依职权调查——同 EV2 缺口（不确定）。
- `EvidenceAdmissibilityFinding` EAF1：subject=被告侧；对象 EV2；legality 异议（上诉人：鉴定时机违法、程序违法）；authenticity/relevance 未单独争执；assertedBy=保险公司；acceptedBy=两级法院均不采纳异议，结论「鉴定程序合法、机构人员具备资格、可作定案依据」。注：三性为独立认定节点，不写入 Evidence 属性（遵守争议 002/规则 3）。
- `EvidenceAdmissibilityFinding` EAF2：对象 EV8；authenticity 部分异议（仅部分原件）；assertedBy=保险公司；acceptedBy=法院部分采纳（酌定 200 元）。
- `EvidenceAdmissibilityFinding` EAF3：对象 EV9；authenticity 异议（手写发票非正规票据）；acceptedBy=法院采纳异议（该项诉请不支持）。
- `EvidenceAdmissibilityFinding` EAF4：对象 EV7；authenticity 异议（伪造主张）；assertedBy=保险公司；acceptedBy=不采纳（二审以楚某调查笔录及一审查明事实维持）。EAF4 与 D4 一体两面。
- `EvidenceAdmissibilityFinding` EAF5：对象 CE12 中公兴卫生院票据；relevance/authenticity 附条件异议（condition 见 CE12）；acceptedBy 未载明二审单独认定——不确定（二审整体维持，未对该票据单独表态）。
- `EvidenceWeightFinding` EWF1：对象 EV2；weightQualitative=「作为定案依据」（高证明力结论性表述；骨架无枚举绑定，取值自拟，不确定）。
- `BurdenAssignment` BA1：burdenKind 自拟=举证责任（无枚举绑定，不确定）；holder=保险公司；isReversed=false；挂接点：CE1/医疗费 MaterialFact（MF5）——裁判要旨「上诉人主张扣 15% 非医保用药，应举证证明非医保用药种类范围及医保同类标准，未举证故不支持」。遵守规则 4（挂要素/事实，不挂 Party）。
- `ProofStandard`：判决书未明示证明标准，**不建**（不确定是否默认高度盖然性，不自拟）。

## L6 程序时间层

- `ProcedureStage` PS1：procedureStageType=一审；court=江苏省阜宁县人民法院；timeInterval=立案日不确定—一审判决日不确定（判决书均未载一审立案/宣判日期）。
- `ProcedureStage` PS2：procedureStageType=二审；court=江苏省盐城市中级人民法院；timeInterval=2016-02-22（立案受理）—2016-04-20（判决）。
- 审级关系：`appealsFrom`（Case[（2016）苏09民终867号] → Case[（2015）阜东民初字第0347号]）。
- `ProcedureAct` PA1：actType=上诉（自拟，无枚举）；actor=保险公司；occurredAt 不确定（上诉期届满前，具体日未载）；occursInStage→PS2。
- `ProcedureAct` PA2：actType=开庭举证质证；actor=邱荣珍/保险公司；occurredAt=2015-11-24；occursInStage→PS1。
- `ProcedureAct` PA3：actType=法院调查取证；actor=一审法院；occurredAt=2015-12-02；occursInStage→PS1。triggerFillsElement→CE5（误工费要素行补强）——符合 fix5 语义。
- `ProcedureAct` PA4：actType=委托鉴定；actor=一审法院；occurredAt 不确定（鉴定意见书文号 2015 年，具体委托日未载）；occursInStage→PS1。
- `ProcedureAct` PA5：actType=申请鉴定（上诉人就用药合理性书面申请鉴定）；actor=保险公司；occurredAt 不确定；occursInStage 不确定（文义似在一审，未明载）。
- `TimePeriod` TP1：startRule=「本判决生效」；endRule=「生效后 10 日内」——一审履行期；被二审维持后其起算**不确定**（一审判决经二审维持后生效时点为二审判决送达，判决书未载送达日）。
- `LimitationPeriod`：不建（无时效争议）。
- 「本判决为终审判决」：程序定性宣示，**无落点**（骨架无判决既判力/终审属性位；最接近 Case 或 Judgment 的附注，均无对应 prop）。

## L7 裁判层（判项落点专项说明）

- `Judgment` J1（二审主文）：disposition=**维持**（兼含驳回上诉——「驳回上诉，维持原判」为一项主文两个效果；骨架 disposition 单值，取「维持」；「驳回上诉」效果无并列表达位，不确定是否应建两个 Judgment——倾向一个，因主文为一项）；`judgmentOn`→C3–C6（上诉请求）及 J2/J3（被维持的一审判项）。amount/basis/rate 空。effectiveDate 留空（终审判决送达生效，送达日未载，遵守「不按 disposition 自动推定」）。
- `Judgment` J2（一审判项一，主给付判项）：disposition=**部分支持（含基数/标准调整）**；amount=165613.1（交强险 110017.4＋商业险 55595.7；实付邱荣珍 120870.33、实付张银生 44742.77）；basis=**必填**：诉请 129596.93 → 认定损失 165613.1（注：认定额反高于诉请额，系残疾赔偿金 65257.4 等项经法院核算后的总额，判决书原文如此；基数调整点多处——医疗费 62868.3→62625.7、伙食补助标准 20→18 元/日、营养标准 10→9 元/日、误工标准 3500 元/月→94 元/日、交通费 1000→200、精神抚慰金 5000→3000，另扣减张银生垫付 46748.77 及其负担的诉讼费鉴定费）；rate 空；`judgmentOn`→C1。
  - 结构性标注：一个 Judgment 承载「两险分摊＋双向给付＋垫付款扣减返还」复合内容，骨架 Judgment 无「给付对象/收款账户」「两险限额分摊」属性——交强险 110017.4 与商业险 55595.7 的分摊结构只能塞进 amount/basis 文本，**无结构化落点**（缺口候选）；向张银生支付 44742.77 实为垫付款返还安排，非对被诉 Claim 的裁判，judgmentOn 的 range（Assertion/CaseElement）**无落点**——无对应 Claim 可指（见 L1 垫付款标注）。
- `Judgment` J3（一审判项二）：disposition=驳回；`judgmentOn`→C1 之未支持子项（拐杖 110、财物损失 500 及各项超出认定额部分）。按 fix7 note「一条诉请可有多个 Judgment」，J2/J3 并列不合并。
- `Judgment` J4（诉讼费用负担判项）：一审「案件受理费 696 元、鉴定费 1310 元，合计 2006 元，由张银生负担（邱已预交）」；二审「受理费 696 元由上诉人负担」。disposition **无落点**——八值枚举（支持/驳回/部分支持/部分支持含调整/维持/撤销/改判/发回重审）无「费用负担」取值；judgmentOn 亦无合适 target（诉讼费负担不对应任何 Assertion/CaseElement）。**整项费用负担判项只能以 Judgment 节点＋空 disposition＋amount=2006/696 勉强落位，属骨架缺口**（fix7 已覆盖实体判项，未覆盖费用负担判项与执行告知）。
- 「限于本判决生效后 10 日内履行完毕」（含收款账户信息）：履行期限与账户指示，骨架无落点（最近似 TimePeriod/effectiveDate，但 effectiveDate 语义是判项生效日而非履行宽限期，账户信息无任何属性位）——标注**无落点**。

## A 论证争点翼

- `Issue` I1：医疗费合理性及 15% 非医保用药应否扣除；raisedBy=保险公司；issueStatus 取值自拟=已裁决（骨架未为 issueStatus 定义枚举，不确定）；`hasIssue`（Case→I1）；`issueConcerns`→CE1。
- `Issue` I2：伤残鉴定时机是否合法、鉴定意见可否作为定案依据；raisedBy=保险公司；issueConcerns→CE4、EV2。
- `Issue` I3：三期（误工/护理/营养）鉴定结论是否超规范、应否核减；raisedBy=保险公司；issueConcerns→CE3/CE5/CE6。
- `Issue` I4：误工证据真实性与赔偿标准（城镇/农村）；raisedBy=保险公司；issueConcerns→CE5/CE4、EV7。
- `Argument` AR1（支持扣减）：supports→D1；依据「拒不提供用药清单应承担举证不利后果」。
- `Argument` AR2（法院方反驳）：attacks→AR1，attackType=**rebut**（未举证证明不合理之处及非医保用药种类范围/同类标准，异议不成立）。
- `Argument` AR3（鉴定违法论）：supports→D2（内固定取出未满 3 月即鉴定，违反相关规定，已口头告知鉴定人员）。
- `Argument` AR4：attacks→AR3，attackType=**undermine**（「能够取出内固定说明伤情基本痊愈，取出后一月余评残并无不当」——直接攻击其前提；同时法院另以「异议人未提供证据证明鉴定存在不合理之处」作 burden 型反驳，可并记 rebut，一条 attacks 边仅带一个 attackType，需建两条 attacks 边或标注歧义——不确定，骨架未说明一边多 type 是否允许）。
- `Argument` AR5（三期超规范论）：supports→D3（援引 GA/T1193-2014 §10.2.13 上限）；法院未逐项回应规范适用，而以 EAF1（程序合法、有资格）+未举证不合理整体驳回——`attacks` AR5，attackType=**undercut**（切断「超规范→鉴定不可采」的推论：规范为参照而非强制，判决书隐含此意——不确定，法院说理原文未明述 undercut 结构，此定性含解释成分）。
- `Argument` AR6（误工证据伪造论）：supports→D4；`Argument` AR7 attacks→AR6，attackType=**undermine**（楚某调查笔录+「一直在外打工」村委会证明印证劳动事实，伪造主张无证据支持）。
- `Preference` P1：preferredOver→AR1/AR3/AR5/AR6（法院认证意见优先于上诉人异议）；basis=「鉴定程序合法、鉴定机构及人员具备资格；异议方均未提供证据证明不合理之处」。
- `ArgumentScheme`/`CriticalQuestion`：未实例化（判决书说理未呈现可识别的图式结构，不自拟）。
- `Attack` 孤立类说明：攻击类型已由 attacks 边携带（G1 后），Attack 节点类本身本案不建（骨架自注「孤立类，待批次 2 接入」）。

## 缺口汇总（挂不上的，按发现优先级）

1. **诉讼费用负担判项无 disposition 取值、无 judgmentOn 目标**（J4）——fix7 后仍存的判项缺口。
2. **上诉请求无 claimType 落点**（C3–C6）——claimType 枚举全是实体请求类型，二审程序性请求无处安放。
3. **垫付款抵扣/返还安排无 Claim 落点、judgmentOn 无可指对象**（J2 的双向给付部分）。
4. **两险（交强险/商业险）限额分摊结构无结构化属性**（只能塞 amount/basis 文本）。
5. **findingBasis 对「整体确认一审事实」的形态无落点**——命中已知 P1（JudicialNotice/Mixed 未决）。
6. **法院委托鉴定/依职权调查证据的来源标识缺失**（EV2/EV10 的 submittedBy 取值困难）。
7. **「终审判决」宣示、履行期与收款账户指示、证据持有流转（票据在被告处）无落点**。
8. **多个自拟枚举取值待登记**：partyType、roleType、actType、burdenKind、weightQualitative、issueStatus、reviewOrder 均无骨架枚举绑定；鉴定费要素行按规则 11 显式标 unmapped。
