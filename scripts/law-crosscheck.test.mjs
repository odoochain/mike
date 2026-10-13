// Regression tests for the FAIL-CLOSED contract of scripts/law-crosscheck.mjs,
// plus the pure helpers it depends on.
//
// Run: node --test scripts/law-crosscheck.test.mjs
//
// The bug this file exists to prevent is the one audit-gate.mjs already had:
// "we could not verify" printing the same verdict as "we verified and it is
// clean". For a cross-check that is the whole ballgame — a source going down,
// a quota running out, or a credential being rejected must never look green.
// So these tests assert exit codes for the failure paths, not just parsing.

import { strictEqual } from "node:assert";
import { createServer } from "node:http";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import {
    cnArticleToNumber,
    normalizeText,
    textsAgree,
} from "./law-crosscheck.mjs";

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), "law-crosscheck.mjs");

test("cnArticleToNumber handles the ledger's plain and 之一 forms", () => {
    strictEqual(cnArticleToNumber("第二百五十条"), "250");
    strictEqual(cnArticleToNumber("第十七条之一"), "17.1");
    strictEqual(cnArticleToNumber("73"), "73");
    strictEqual(cnArticleToNumber(""), null);
    strictEqual(cnArticleToNumber("第X条"), null);
});

test("textsAgree ignores cosmetic provider differences", () => {
    const pkulaw = "第二百五十条　申请执行的期间为二年。";
    const yuandian = "申请执行的期间为二年。";
    strictEqual(textsAgree(pkulaw, yuandian), true);
    strictEqual(textsAgree("申请执行的期间为二年", "合同无效"), false);
    // Empty on either side is not agreement: that is a miss, not a match.
    strictEqual(textsAgree("", "申请执行"), false);
});

test("normalizeText strips article prefixes and punctuation", () => {
    strictEqual(normalizeText("第二百四十六条 人民检察院有权监督"), "人民检察院有权监督");
});

/**
 * Spin up two fake MCP servers and run the real script against them.
 * `handler` receives (source, body) and returns { status, payload }.
 */
function runGate({ ledger, pkulawHandler, yuandianHandler, env = {} }) {
    const dir = mkdtempSync(join(tmpdir(), "law-crosscheck-"));
    const ledgerPath = join(dir, "ledger.json");
    writeFileSync(ledgerPath, JSON.stringify(ledger), "utf8");

    const server = createServer((req, res) => {
        const source = req.url.startsWith("/pkulaw") ? "pkulaw" : "yuandian";
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => {
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            const out = (source === "pkulaw" ? pkulawHandler : yuandianHandler)(body);
            res.writeHead(out.status ?? 200, { "Content-Type": "application/json" });
            res.end(out.body ?? JSON.stringify(out.payload));
        });
    });

    return new Promise((resolve) => {
        server.listen(0, "127.0.0.1", () => {
            const port = server.address().port;
            const child = spawn(process.execPath, [scriptPath, "--ledger", ledgerPath, "--min-delay-ms", "0"], {
                env: {
                    ...process.env,
                    PKULAW_BASE_URL: `http://127.0.0.1:${port}/pkulaw`,
                    YUANDIAN_BASE_URL: `http://127.0.0.1:${port}/yuandian`,
                    PKULAW_MCP_AUTHORIZATION: "Bearer test",
                    YUANDIAN_API_KEY: "test",
                    ...env,
                },
            });
            let stdout = "";
            let stderr = "";
            child.stdout.on("data", (d) => (stdout += d));
            child.stderr.on("data", (d) => (stderr += d));
            child.on("close", (code) => {
                server.close();
                resolve({ code, stdout, stderr });
            });
        });
    });
}

const okPkulaw = (text) => () => ({
    payload: { result: { content: [{ type: "text", text: JSON.stringify({ Message: "成功", Data: { Title: "X(2023修正)", FullText: text } }) }] } },
});
const okYuandian = (text) => () => ({
    payload: { result: { content: [{ type: "text", text: JSON.stringify({ success: true, data: { regulation_name: "X(2023修正)", content: text } }) }] } },
});
const LEDGER = [{ title: "中华人民共和国民事诉讼法", article_number: "第二百五十条" }];

after(() => {
    // No shared state to tear down; servers are closed per-test.
});

test("exit 0 when both sources agree", async () => {
    const r = await runGate({
        ledger: LEDGER,
        pkulawHandler: okPkulaw("第二百五十条 申请执行的期间为二年。"),
        yuandianHandler: okYuandian("申请执行的期间为二年。"),
    });
    strictEqual(r.code, 0);
});

test("exit 1 when the sources disagree", async () => {
    const r = await runGate({
        ledger: LEDGER,
        pkulawHandler: okPkulaw("第二百五十条 申请执行的期间为二年。"),
        yuandianHandler: okYuandian("人民检察院有权对民事执行活动实行法律监督。"),
    });
    strictEqual(r.code, 1);
});

test("exit 2 when a source returns 401 (credential rejected)", async () => {
    const r = await runGate({
        ledger: LEDGER,
        pkulawHandler: () => ({ status: 401, body: "unauthorized" }),
        yuandianHandler: okYuandian("申请执行的期间为二年。"),
    });
    strictEqual(r.code, 2);
});

test("exit 2 when a source is unreachable", async () => {
    const r = await runGate({
        ledger: LEDGER,
        pkulawHandler: () => ({ status: 500, body: "boom" }),
        yuandianHandler: okYuandian("申请执行的期间为二年。"),
    });
    strictEqual(r.code, 2);
});

test("exit 2 when a successful call returns no data (miss is not agreement)", async () => {
    const r = await runGate({
        ledger: LEDGER,
        pkulawHandler: okPkulaw("第二百五十条 申请执行的期间为二年。"),
        yuandianHandler: () => ({
            payload: { result: { content: [{ type: "text", text: JSON.stringify({ success: true }) }] } },
        }),
    });
    strictEqual(r.code, 2);
});

test("exit 2 when credentials are absent", async () => {
    const r = await runGate({
        ledger: LEDGER,
        pkulawHandler: okPkulaw("x"),
        yuandianHandler: okYuandian("x"),
        env: { PKULAW_MCP_AUTHORIZATION: "", YUANDIAN_API_KEY: "" },
    });
    strictEqual(r.code, 2);
});
