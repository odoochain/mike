#!/usr/bin/env node
// mike 侧骨架校验入口：委托 legal-visualization-skills 的官方校验器。
//
// 为什么是委托而不是自研：本文件的前身 skeleton-structure-check.mjs 是在
// "官方校验器不在本次编辑环境可用范围内"的前提下写的替身。该前提后来被证伪——
// 官方校验器（tools/validate_skeleton.py）不仅存在，还带 32 项缺陷注入回归、
// 裁决核对（--decisions）、保真对照（--baseline）、实例校验（--instances），
// 并已接入 CI（.github/workflows/skeleton-validator.yml）。替身随即下线。
// 一个门禁，一个属主：结构校验的唯一事实源是官方校验器。
//
// 运行的命令与 CI 的 current-skeleton job 完全一致：
//   validate_skeleton.py --schema <最新骨架>
//     --decisions
//     --baseline docs/drafts/skeleton-v3.5.1.md
//     --instances scripts/decision-instance.example.json
//
// 退出码沿用官方契约：0 通过 / 1 有 ERROR / 2 没能检查。
// "没能检查"（解释器缺失、姊妹仓未检出、选版失败）一律 exit 2，
// 绝不能与"检查通过"同结果。
//
// 用法：npm run check:skeleton

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lvsRoot = resolve(repoRoot, "../legal-visualization-skills");
const validator = join(lvsRoot, "tools", "validate_skeleton.py");
const picker = join(lvsRoot, "tools", "pick_current_skeleton.py");

for (const [what, p] of [["官方校验器", validator], ["选版脚本", picker]]) {
    if (!existsSync(p)) {
        console.error(`FATAL: ${what}不存在：${p}`);
        console.error("mike 预期与 legal-visualization-skills 同级检出（同一工作区）。");
        process.exit(2);
    }
}

// 解释器解析：MIKE_PYTHON 环境变量 > 本机已知 mamba 环境 > PATH。
// 本机 PATH 上的 `python` 是 Microsoft Store 占位符（运行即报错），所以已知
// 环境排在 PATH 前；其他机器用 MIKE_PYTHON 覆盖。
const candidates = [
    process.env.MIKE_PYTHON,
    "D:/packages/mamba/envs/py312/python.exe",
    "python",
    "python3",
].filter(Boolean);

let python = null;
for (const c of candidates) {
    const probe = spawnSync(c, ["--version"], { encoding: "utf8" });
    if (probe.status === 0) {
        python = c;
        break;
    }
}
if (!python) {
    console.error("FATAL: 找不到可用的 Python 解释器（可设 MIKE_PYTHON 指向 py312）。");
    process.exit(2);
}

function runPy(script, args) {
    return spawnSync(python, ["-X", "utf8", script, ...args], {
        stdio: ["ignore", "pipe", "pipe"],
        encoding: "utf8",
    });
}

// 1) 选现行骨架。绝不硬编码版本——硬编码会让骨架升版后静默校验旧文件，
//    这正是"看起来在跑、其实没用"。选版逻辑以官方 pick_current_skeleton.py
//    为准，这里不复制第二份。
const pick = runPy(picker, [join(repoRoot, "docs", "drafts")]);
if (pick.status !== 0) {
    process.stderr.write(pick.stderr || "");
    console.error(`FATAL: pick_current_skeleton.py 失败（exit ${pick.status}）。`);
    process.exit(2);
}
const picked = {};
for (const line of (pick.stdout || "").split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i > 0) picked[line.slice(0, i)] = line.slice(i + 1);
}
if (!picked.path || !existsSync(picked.path)) {
    console.error(`FATAL: 选版结果无效：${picked.path || "(空)"}`);
    process.exit(2);
}

// 2) 跑完整门禁，参数与 CI current-skeleton job 一致。
const gate = runPy(validator, [
    "--schema", picked.path,
    "--decisions",
    "--baseline", join(repoRoot, "docs", "drafts", "skeleton-v3.5.1.md"),
    "--instances", join(repoRoot, "scripts", "decision-instance.example.json"),
]);
process.stdout.write(gate.stdout || "");
process.stderr.write(gate.stderr || "");
console.log(`\n[check:skeleton] ${picked.version} → exit ${gate.status}`);
process.exit(gate.status ?? 2);
