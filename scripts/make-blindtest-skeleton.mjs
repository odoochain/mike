#!/usr/bin/env node
// 从骨架文档提取纯 YAML 块，生成盲测净版骨架。
//
// 为什么必须提取：骨架文档的 §1 本次修订 / §3 验证与边界 / §4 迁移说明
// 含 fix7/fix8、Judgment 类、arbitrationPrecedes 等**已知缺口的修复记录**。
// 盲测方若读到"判项落点是 fix7 新增的"，就知道判项有落点——盲测即失效。
// 净版只给类/关系/枚举/规则/组件定义，这是盲测方需要的全部。
//
// 用法：node scripts/make-blindtest-skeleton.mjs [--source <骨架.md>] [--out <输出.md>]

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
    options: {
        source: { type: "string" },
        out: { type: "string" },
    },
});

const source = resolve(
    values.source ??
        "docs/drafts/中国法本体骨架v1_顶层schema（可机读骨架文件）_v3.6.2_20261014.md",
);
const out = resolve(values.out ?? "blind-test/skeleton-for-blindtest.md");

const text = readFileSync(source, "utf8");

// 骨架文档恰好含一个 ```yaml 块（官方校验器也要求"必须且只能包含一个"）。
const m = text.match(/```ya?ml[^\n]*\r?\n([\s\S]*?)^```[ \t]*\r?$/m);
if (!m) {
    console.error("FATAL: 未找到 YAML 块");
    process.exit(2);
}
const yamlBlock = m[1];

// 剥离上一轮盲测的过程记录：它写明了上一轮三方各自把上诉请求塞进 Claim 或
// L3/A 翼（三条变通路径）。把这段交给新盲测方等于把答案递过去——盲测即失效。
// 内容锚定删除（原状：… 本身即缺口证据。），删除后由下方断言兜底。
// 源骨架 md 在 Windows 上是 CRLF；若直接照抄，生成的净版每行结尾带 \r，
// 会被 git 判为 trailing whitespace（git diff --check 报满屏）。统一归一化为 LF。
const sanitized = yamlBlock
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]*原状：[\s\S]*?本身即缺口证据。/, "");

// 版本行自检：净版必须与源文档版本一致，防止提取错版本。
const verMatch = sanitized.match(/^\s*version:\s*(\S+)/m);
const version = verMatch ? verMatch[1] : "(未找到)";

// 安全检查：YAML 块内不得出现具体案号或已用案件当事人（防挂接暗示泄漏）。
const leaks = sanitized.match(/(2016)苏09|16502|129号|1195号|周×|李××|陈某某|雷某/g);
if (leaks) {
    console.error(`FATAL: YAML 块内发现案件暗示：${[...new Set(leaks)].join(", ")}`);
    process.exit(2);
}

// fail-closed：剥离后不得残留任何"盲测"过程史。若源文档改写了这段措辞，
// 上面的锚定会失效，此处必须拦下，而不是静默产出带答案的净版。
const residual = sanitized.match(/盲测/g);
if (residual) {
    console.error(`FATAL: 仍残留 ${residual.length} 处盲测过程史，剥离锚点可能已失效`);
    process.exit(2);
}

const header = `# 盲测用骨架（净版）：中国法本体骨架 ${version}

> 本文件由 scripts/make-blindtest-skeleton.mjs 从现行骨架文档自动提取，
> 仅含类/关系/枚举/设计规则/组件的机读定义，不含修订记录与验证声明。
> 盲测方只需本文件 + 判决书原文。

\`\`\`yaml
${sanitized}\`\`\`
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, header, "utf8");
console.log(`已生成 ${out}`);
console.log(`版本：${version}，YAML ${sanitized.split("\n").length} 行`);
