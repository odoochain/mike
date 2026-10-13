# 盲测挂接结果（实例B）：（2016）苏09民终867号 机动车交通事故责任纠纷（二审）

骨架版本：v3.5.1_20261009 ｜ 比对基准：仅任务书、判决书原文、骨架定义三份文件

**Case 节点**：案号（2016）苏09民终867号；court=江苏省盐城市中级人民法院；relationWingStatus=notBuilt（本任务未要求建 R 翼）；主案由（L0，SKOS 概念，不建 OWL 类）：机动车交通事故责任纠纷，caseRole=立案案由；schemeVersion 不确定（判决书未载案由方案版本，无法填）。

---

## L1 主张层

本诉（一审）Claims，assertedByRole=原审原告邱荣珍，hohfeldGroup=claim，claimType=侵权（人身损害赔偿诸项均挂此值）：

- Claim-C1 医疗费 62868.3 元（含张银生垫付 46748.77 元）｜claimType=侵权
- Claim-C2 营养费 1200 元（120天×10元）｜claimType=侵权
- Claim-C3 住院伙食补助费 2100 元（105天×20元）｜claimType=侵权
- Claim-C4 残疾赔偿金 65257.4 元｜claimType=侵权
- Claim-C5 误工费 28000 元（240天×3500元/月）｜claimType=侵权
- Claim-C6 护理费 9000 元（150天×60元/天）｜claimType=侵权
- Claim-C7 交通费 1000 元｜claimType=侵权
- Claim-C8 精神损害抚慰金 5000 元｜claimType=侵权
- Claim-C9 财物损失（车辆）500 元｜claimType=侵权
- Claim-C10 拐杖费 110 元｜claimType=侵权
- Claim-C11 鉴定费 1310 元｜claimType **无适配枚举值**（claimType 枚举无「费用/鉴定费」项；勉强就近挂「侵权」属于强挂，标注：**枚举无落点**）
- Claim-C12 诉讼费用由被告承担｜claimType **枚举无落点**（程序费用负担请求，枚举中无任何对应值）

反诉：**无**（判决书全文无反诉记载；张银生垫付款系一审"为减少讼累一并处理"，非反诉）。

上诉请求（二审，assertedByRole=上诉人永诚财保江苏分公司）：请求二审撤销/变更一审部分认定（医疗费扣 15%、鉴定违法、三期超限、误工费不支持、残疾赔偿金按农村标准）。挂接结论：若建为 Claim，claimType **枚举无落点**（无「上诉」类值）；实质内容为对一审认定的攻击，本案将其落在 L3 抗辩层与 A 翼，L1 不另建节点，标注：**上诉请求作为独立 Assertion 无 claimType 落点（骨架缺口）**。

源文书数据矛盾登记：原告诉请"合计129596.93元"与各分项之和（176345.7 元）不符，属原文书自身问题，非骨架问题，如实登记。

---

## L2 要件层

Element 节点（elementName 为自拟规范名；I2 映射见下注）：

- E1 侵权行为（违规开车门）｜承接 Claim-C1~C10（hasElement）
- E2 过错（事故全部责任）
- E3 损害后果（人身损害、车辆损失）
- E4 因果关系（事故与损害之间）
- E5 交强险责任要件（投保事实＋事故发生于保险期间）
- E6 商业三者险责任要件（30 万不计免赔、保险期间、不足部分按合同赔付）
- E7 各损失项目及数额（C1~C10 逐项的金额要素，挂 E3 之下）

I2 要素映射（mapsToElement，关系挂 CaseElement→Element，见 L4）：本案各行均建立映射边，但 **mappedStatus=不确定**——理由：盲测包未附 I2 的 67/67 ElementSchema 清单，无法核验 elementName 与官方要素模板的逐字对应及 version，按 design_rule 11 精神显式标注，不静默。

---

## L3 抗辩层

Defense 节点（isExOfficio=false；assertedBy/acceptedBy 按 design_rule 7 以关系连 Role；acceptedBy=二审法院，全部**不予采纳**）：

- D1 医疗费合理性抗辩：要求剔除无关用药、医保外费用、多计费用，主张按均值扣 15%｜defenseKind=抗辩｜一审、二审均提出（书面申请对用药相关性/合理性鉴定）
- D2 鉴定时机抗辩：内固定取出术（2015-08-01）距评残鉴定（2015-09-16）不足三月，主张鉴定违法｜defenseKind=抗辩
- D3 三期超限抗辩：GA/T1193-2014 规范 10.2.13 上限（误工 180/护理 90/营养 60 日）vs 鉴定结论（240/150/120 日），超出部分不应支持｜defenseKind=抗辩
- D4 误工费证据虚假抗辩：工资发放表签字同一时间一次性书写、仅一名员工，主张证据虚假｜defenseKind=抗辩
- D5 标准抗辩：伤残等级即使成立，残疾赔偿金亦应按农村标准计算｜defenseKind=抗辩（让步式/附随论证）
- D6 程序异议：一审法官称庭后调查但未说明结果｜defenseKind 取值**不确定**——理由：defenseKind 仅三值（抗辩/抗辩权/例外），程序瑕疵异议勉强归入「抗辩」，但骨架无程序异议专门类型，属枚举覆盖不足的边缘情形
- D7 交通费部分认可（仅认可 200 元）｜defenseKind=抗辩
- D8 拐杖费不认可（手写发票）｜defenseKind=抗辩
- D9 车辆损失不认可（无证据）｜defenseKind=抗辩

defendsAgainst 关系：D1→C1；D2→C4（及鉴定意见派生各行）；D3→C5/C6/C2；D4→C5；D5→C4；D6→一审整体认定（无单一 Assertion 可指，标**指向悬空风险**）；D7→C7；D8→C10；D9→C9。

objectionValue 说明：该属性在骨架中位于 CaseElement（L4）而非 Defense，逐行取值见 L4 表。

---

## L4 事实要素层

CaseElement 行（claimantValue ／ defendantValue ／ objectionValue ／ courtFinding；findingBasis 另列）：

- CE1 医疗费：62868.3（含垫付）／ 主张扣 15% ／ 有异议 ／ 认定 62625.7（按票据），垫付款一并处理
- CE2 营养费：1200（120×10）／ 期限异议 ／ 有异议 ／ 1080（120×9）
- CE3 住院伙食补助费：2100（105×20）／ 判决未载被告表态 ／ objectionValue **不确定**（"无异议"与"未记载"不可等同；如实填「不知悉」亦属推断）／ 1890（105×18）
- CE4 残疾赔偿金：65257.4 ／ 伤残等级及城镇标准均异议 ／ 有异议 ／ 65257.4（34346元/年×19年×0.1，按城镇标准）
- CE5 误工费：28000 ／ 证据虚假、不应支持 ／ 有异议 ／ 22560（240天×94元/天，按城镇标准酌定日额）
- CE6 护理费：9000（150×60）／ 期限异议 ／ 有异议 ／ 9000（全额支持）
- CE7 交通费：1000 ／ 仅认可 200 ／ 部分异议 ／ 200
- CE8 精神损害抚慰金：5000 ／ 判决未载表态 ／ 不确定（同 CE3 理由）／ 3000
- CE9 财物损失：500 ／ 不认可 ／ 有异议 ／ 不支持（0）
- CE10 拐杖费：110 ／ 手写发票不认可 ／ 有异议 ／ 不支持（0）
- CE11 鉴定费：1310 ／ 未载 ／ 不确定 ／ 由张银生负担（落于费用负担段，未计入损失合计 165613.1）
- CE12 公兴卫生院医疗费票据：金额并入 C1 ／ **附条件**（condition：须"有建湖县中医院的医嘱要求"，否则不予认可；condition 指向 CE1）｜objectionValue=附条件——本案唯一的六值中「附条件」实例

MaterialFact（要件事实，经 mapsToElement 挂 L2）：

- MF1 事故事实：2014-05-26 17:45，张银生临时停车开车门与邱荣珍电动自行车碰撞→E1/E4
- MF2 责任认定：张银生负全部责任，邱荣珍无责任→E2
- MF3 伤情：左胫骨平台粉碎性骨折、左腓骨近端骨折，十级伤残→E3
- MF4 三期：误工 240 日、护理 150 日（单人）、营养 120 日→E7
- MF5 保险事实：交强险＋30 万不计免赔商业险，事故在保险期内→E5/E6
- MF6 垫付事实：张银生垫付 46748.77 元→E7（费用勾稽）
- MF7 城镇居民属性事实：长期从事非农工作、主要收入来自非农、跟随子女在城镇生活→E7（赔偿标准）
- MF8 住院 105 天→E7

AdjudicativeFact（裁判事实，findingBasis 关系）：

- AF1 事故责任认定"并无不当，作为定案依据"｜findingBasis→EV1（事故认定书）
- AF2 鉴定意见"程序合法，作为定案依据"｜findingBasis→EV2（司法鉴定意见书）
- AF3 医疗费认定 62625.7｜findingBasis→EV3/EV4（医疗费票据）
- AF4 按城镇标准计算残疾赔偿金｜findingBasis→EV6（居委会证明）＋EV5（村委会证明）
- AF5 误工费按城镇标准（"在企业从事体力劳动"）｜findingBasis→EV5＋EV11（楚某调查笔录）
- AF6 交通费酌定 200 元｜findingBasis→EV9（部分发票）＋被告认可 200 元；**被告认可属自认（Admission），findingBasis range 仅 [Evidence, Presumption]，自认无落点（P1 悬空引用，如实标注）**
- AF7 精神损害抚慰金酌定 3000 元｜**findingBasis 无落点**——司法酌定既非 Evidence 亦非 Presumption
- AF8 住院伙食补助 18 元/日、营养费 9 元/日之标准酌定｜**findingBasis 无落点**（同 AF7）
- AF9 非医保扣除主张不采信｜findingBasis→无（上诉人未举证；以 BurdenAssignment 表达，见 L5）

---

## L5 证据举证层

Evidence 节点（evidenceType／submittedBy；submittedAt 多数未载，不确定）：

- EV1 道路交通事故认定书（第201455052602号，2014-06-04）｜书证｜submittedBy 不确定（认定书由交警作出，判决书未载举证方）
- EV2 司法鉴定意见书（盐阜司法【2015】临鉴字第413号）｜鉴定意见｜submittedBy=一审法院委托（法院委托鉴定，非当事人提交）
- EV3 建湖县中医院医疗费票据｜书证｜邱荣珍
- EV4 阜宁县公兴卫生院医疗票据｜书证｜邱荣珍
- EV5 双河村村民委员会证明（长期从事非农工作）｜书证｜邱荣珍
- EV6 公兴居委会证明（跟随子女在城镇生活）｜书证｜邱荣珍
- EV7 飞腾石油机械公司证明（月薪 3500 元）｜书证｜邱荣珍
- EV8 工资发放表｜书证｜邱荣珍
- EV9 交通费发票（仅部分原件）｜书证｜邱荣珍
- EV10 拐杖手写发票｜书证｜邱荣珍
- EV11 楚某调查笔录（2015-12-02 一审法院调查取得）｜证人证言｜法院调查取证
- EV12 二审阶段医药费发票合计 16119.53 元（2015-11-24 一审庭审提供，二审予以查明）｜书证｜邱荣珍

EvidenceAdmissibilityFinding（三性独立认定节点，争议 002；subject 取 partySide 值）：

- EAF1 对 EV3：authenticity=无异议（二审质证明确）｜assertedBy=上诉人，acceptedBy=二审法院｜subject=被告侧
- EAF2 对 EV4：附条件认可（须医嘱，条件文本见 CE12）——"附条件"在三性属性上**无枚举可挂**，authenticity 属性取值域骨架未定义（无绑定枚举），如实记自由文本｜subject=被告侧
- EAF3 对 EV2：legality 有异议（鉴定时机违法）→ 法院认定程序合法、机构及人员具备资格，异议不成立｜assertedBy=上诉人，acceptedBy=二审法院｜subject=被告侧
- EAF4 对 EV8：authenticity 有异议（一次性书写、单一员工，主张虚假）→ 经法院调查（EV11）佐证，未被推翻｜subject=被告侧
- EAF5 对 EV10：authenticity 有异议（手写发票不认可）→ 法院采纳异议，该诉请不支持｜subject=被告侧
- 三性各属性的**取值均无枚举绑定**（骨架未为 authenticity/legality/relevance 定义枚举），全部取值为自由文本，标注不确定。

EvidenceWeightFinding：

- EWF1 EV2 鉴定意见：weightQualitative="作为定案依据"（高证明力）
- EWF2 EV9 交通费票据：仅部分原件，证明力不足（酌定 200 元的依据之一）
- EWF3 EV8 工资表：受真实性攻击，经 EV11 法院调查证据佐证后仍被采信（与误工标准认定联动）

BurdenAssignment（按 design_rule 4 挂 Element/MaterialFact，不挂 Party）：

- BA1 挂 E7-医疗费行（hasBurden）：非医保用药的种类、范围及医保内同类标准之举证责任｜holder=上诉人｜burdenKind **无枚举可填**（骨架未定义 burdenKind 枚举，自由文本"结果责任/举证责任"，不确定）｜后果：未举证→主张不采信
- BA2 上诉人主张的"用药清单提供义务在被上诉人，拒不提供应承担举证不利后果"：系上诉人的责任分配主张，**法院未接受**｜holder=被上诉人（主张配置）｜isReversed 不确定（上诉人主张实质含举证责任移转，但判决书未用"倒置"表述）

ProofStandard：民事案件通常应为"高度盖然性"，但**判决书未明言**，按纪律不推断，本层不建节点（标注：不确定，理由如上）。

Subsumption：法院对各损失项的涵摄已分散表达于 CE 行 courtFinding，未单建 Subsumption 节点（骨架允许但判决书无独立涵摄表述可锚定）。

---

## L6 程序时间层

ProcedureStage：

- PS1 一审｜procedureStageType=一审｜court=江苏省阜宁县人民法院｜案号（2015）阜东民初字第0347号｜timeInterval：起点**不确定**（立案日未载），已载锚点：开庭 2015-11-24、调查 2015-12-02；一审判决日期未载
- PS2 二审｜procedureStageType=二审｜court=江苏省盐城市中级人民法院｜timeInterval=2016-02-22（立案受理）至 2016-04-20（判决）

审级关系：appealsFrom：Case（2016）苏09民终867 → Case（2015）阜东民初字第0347号。

ProcedureAct：

- PA1 提起上诉｜actor=永诚财保江苏分公司｜occurredAt **不确定**（未载上诉状提交日）｜occursInStage→PS2（上诉行为跨阶段的时点归属，按受理阶段挂）
- PA2 二审立案受理｜actor=盐城中院｜2016-02-22｜occursInStage→PS2
- PA3 一审开庭｜actor=阜宁县法院｜2015-11-24｜occursInStage→PS1
- PA4 法院调查（询问楚某）｜actor=阜宁县法院｜2015-12-02｜occursInStage→PS1
- PA5 鉴定委托｜actor=阜宁县法院｜occurredAt 不确定（仅知鉴定意见书系 2015 年作出、评残日 2015-09-16 系从上诉理由推得）｜occursInStage→PS1
- PA6 上诉人书面申请用药相关性/合理性鉴定｜actor=永诚财保｜occurredAt 与所属阶段均**不确定**（上诉理由转述，未载明系一审还是二审提出）
- PA7 二审判决宣告｜actor=盐城中院合议庭｜2016-04-20｜occursInStage→PS2

TimePeriod/LimitationPeriod：履行期"判决生效后 10 日内"——按 design_rule 8，非时效/期间争议场景，不建 LimitationPeriod；履行期记在 L7 判项备注。事故认定作出（2014-06-04）、内固定取出术（2015-08-01）、评残鉴定（2015-09-16）系生活事实时间，落 L4 事实时间戳，不建 L6 节点。

---

## L7 裁判层

一审判项（Judgment 节点）：

- J1-1 交强险限额内赔偿｜disposition=支持｜amount=110017.4｜judgmentOn→C1~C8 对应 Claims｜"交强险限额内"这一**限额层次属性无落点**（Judgment 无 limitType/保险层次属性）
- J1-2 商业险限额内赔偿｜disposition=支持｜amount=55595.7｜judgmentOn→C1~C8｜同上，限额层次无落点
- J1-3 向邱荣珍实付 120870.33 元（总额 165613.1 扣减垫付 46748.77 及张应负担费用后）｜disposition=支持｜amount=120870.33｜**判项间勾稽关系（总额=110017.4+55595.7；实付=总额-垫付-费用）无关系/属性落点**
- J1-4 向张银生支付 44742.77 元（垫付返还扣减其负担费用 2006）｜disposition=支持｜amount=44742.77｜**judgmentOn 悬空**：张未提反诉/独立诉请，无 Assertion 可指——"无诉之判（职权一并处理）"骨架无承接
- J1-5 驳回原告其他诉讼请求｜disposition=驳回｜judgmentOn→C9、C10 及各行超额部分
- J1-6 案件受理费 696＋鉴定费 1310＝2006 元由张银生负担｜disposition **枚举无落点**（八值中无「费用负担」）｜amount=2006
- effectiveDate：一审判决因上诉未生效；"生效后10日内履行"系履行期而非生效日，按 v3.5.1 规则不自动推断，留空。

二审判项：

- J2-1 驳回上诉，维持原判｜disposition=维持（复合判项取主值；"驳回上诉"一翼若单列则为 disposition=驳回，但其指向对象"上诉请求"在 L1 无 Assertion 落点，见上）｜**judgmentOn 结构性无落点**：range 仅 [Assertion, CaseElement]，"维持"的语义对象是一审判决本身（Judgment→Judgment），不在合法 range 内；若强挂一审 Claims 则语义失真（维持的是原判，不是对诉请重新裁判）
- J2-2 二审案件受理费 696 元由上诉人负担｜disposition **枚举无落点**（同 J1-6）｜amount=696

basis/rate：本案判项无基数调整、无利率，两属性留空（不适用，非缺失）。

---

## A 论证争点翼

Issue（issueStatus **无枚举绑定**——骨架未定义该枚举，自由文本标注，不确定）：

- IS1 医疗费合理性及 15% 非医保扣除是否成立｜raisedBy=上诉人｜issueConcerns→CE1｜状态：二审驳回
- IS2 评残鉴定时机是否违法、十级伤残是否成立｜raisedBy=上诉人｜issueConcerns→CE4（及 EV2）｜状态：二审驳回
- IS3 三期鉴定结论是否超出 GA/T1193-2014 规范上限｜raisedBy=上诉人｜issueConcerns→CE2/CE5/CE6｜状态：二审驳回
- IS4 误工费证据真实性及城镇/农村赔偿标准｜raisedBy=上诉人｜issueConcerns→CE4/CE5｜状态：二审驳回
- hasIssue：Case→IS1~IS4

Argument / Attack（attacks 边携带 attackType）：

- AR1（上诉人）医疗费异议论证——attacks→一审 CE1 认定，attackType=rebut；其下"被上诉人拒不提供用药清单应自担不利后果"——attacks→举证责任默认分配，attackType=undermine
- AR2（上诉人）鉴定时机违法论证（内固定取出未满三月、鉴定人置之不理）——attacks→EV2 鉴定意见，attackType=undermine（攻击证据合法性前提）
- AR3（上诉人）三期超规范上限论证——attacks→CE2/CE5/CE6 认定，attackType=rebut
- AR4（上诉人）工资表虚假论证——attacks→EV8，attackType=undermine
- AR5（上诉人）让步论证："伤残等级即使成立也应按农村标准"——attacks→CE4 城镇标准认定，attackType=rebut（让步式攻击骨架无专门标注，记于属性备注）
- AR6（二审法院）"能够取出内固定说明伤情基本痊愈，取出后一个多月评残并无不当"——attacks→AR2，attackType=rebut
- AR7（二审法院）"上诉人未举证证明非医保种类范围及同类标准"——attacks→AR1，attackType=undermine（攻击其举证前提缺失）
- AR8（二审法院）"鉴定程序合法、机构人员具备资格、异议无证据"——attacks→AR3，attackType=rebut；supports→AF2
- AR9（二审法院）"楚某证言佐证在企业从事体力劳动，城镇标准符合法律规定"——supports→AF4/AF5，间接 attacks→AR4/AR5

被上诉人邱荣珍未答辩、张银生未述称：A 翼无其 Argument 节点（如实登记，非遗漏）。

Preference：

- P1 鉴定意见（EV2）preferredOver 上诉人异议（AR2/AR3）｜basis=程序合法＋鉴定机构及人员具备资质＋异议方未提供反证
- P2 法院调查证言（EV11）＋村委会证明 preferredOver 工资表真实性攻击（AR4）｜basis=法院依职权调查核实

---

## 判项落点专项说明

**结论：v3.5.1 中判项有落点**——L7 Judgment 类（fix7）＋ judgmentOn 关系＋ disposition 八值枚举已就位，一审"赔偿/驳回"判项与二审"维持"判项均能建成 Judgment 节点，不再出现 fix7 之前"判项无落点"的状态。

但本案暴露出 L7 的五个具体缺口（均如实标注，未强挂）：

1. disposition 枚举无「诉讼费/鉴定费负担」值，一审 J1-6、二审 J2-2 两个费用判项**枚举无落点**。
2. judgmentOn 的 range 为 [Assertion, CaseElement]，**不含 Judgment**——二审"维持原判"的被裁判对象是一审判项本身，合法 range 内无承接节点。
3. 判项间勾稽（总额＝交强险＋商业险；实付＝总额−垫付−费用负担）无任何关系或属性落点。
4. "无诉之判"（向未提诉请的张银生返还垫付款 44742.77 元）judgmentOn 悬空。
5. 复合判项"驳回上诉，维持原判"在单值 disposition 下的取舍无规则可依；且"交强险限额内/商业险限额内"的保险层次在 Judgment 属性组（disposition/amount/basis/rate/effectiveDate）中无位。

---

## 无落点／缺口汇总（本盲测最有价值部分）

1. **上诉请求无 claimType 枚举落点**（枚举无上诉类值；二审攻击改由 L3/A 翼承接属变通）。
2. **费用负担判项无 disposition 枚举值**（诉讼费、鉴定费负担，两级法院各一次）。
3. **judgmentOn range 不含 Judgment**：二审维持/改判/撤销判项无法指向原判。
4. **判项间勾稽关系无落点**（总额拆分、垫付扣减）。
5. **无诉之判 judgmentOn 悬空**（职权一并处理的垫付返还）。
6. **司法酌定无 findingBasis 落点**（精神抚慰金酌定 3000、交通费酌定 200、伙食 18 元/日、营养 9 元/日四项；range 仅 [Evidence, Presumption]，与 P1 同族但 P1 未覆盖"酌定"）。
7. **自认（Admission）无 findingBasis 落点**（被告认可交通费 200 元；P1 已登记的悬空引用，本案实证命中）。
8. **程序异议在 defenseKind 三值中无精确落点**（一审"调查未说明"异议，勉强入「抗辩」）。
9. **"交强险/商业险限额内"层次属性无落点**（Judgment 属性组不含限额类型）。
10. **举证责任移转主张**（上诉人主张用药清单提供义务在被上诉人）在 BurdenAssignment.isReversed 上语义不全——isReversed 描述法定倒置，不覆盖"当事人主张的责任移转"。
11. **无枚举绑定的自由文本属性**（非硬缺口但影响可复现性）：burdenKind、issueStatus、EvidenceAdmissibilityFinding 三性取值、EvidenceWeightFinding.weightQualitative——多个盲测方各自填词必然产生分歧。
12. **源文书数据矛盾**（非骨架问题，登记）：原告诉请合计 129596.93 与分项之和 176345.7 不符；"双方车辆过不同程度受损"疑为原文笔误。
13. **不确定项登记**（判决书未载，按纪律不推断）：一审立案日与判决日、上诉提交日、PA6 鉴定申请所属阶段、CE3/CE8/CE11 的 objectionValue、ProofStandard（未明言高度盖然性）、各项 submittedAt、案由 schemeVersion。
