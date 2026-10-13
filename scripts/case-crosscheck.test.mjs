// Regression tests for scripts/case-crosscheck.mjs — the FAIL-CLOSED contract
// and the field-comparison helpers.
//
// Run: node --test scripts/case-crosscheck.test.mjs
//
// These assert exit codes, mirroring audit-gate.mjs and law-crosscheck.test.mjs:
// a source being down, rejecting credentials, or returning "success" with no
// case must never look like a clean verification.

import { strictEqual } from "node:assert";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { courtsAgree, courtVerdict, datesAgree, isFullCourtName, isGenericTitle, normalizeText, normalizeTitle, titlesAgree, titleVerdict } from "./case-crosscheck.mjs";

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), "case-crosscheck.mjs");

test("court strings tolerate administrative-prefix differences", () => {
    strictEqual(courtsAgree("广东省佛山市中级人民法院", "佛山市中级人民法院"), true);
    strictEqual(courtsAgree("佛山市中级人民法院", "佛山市"), true);
    strictEqual(courtsAgree("广东省佛山市中级人民法院", "北京市高级人民法院"), false);
    // One side empty is not agreement.
    strictEqual(courtsAgree("", "佛山市中级人民法院"), false);
});

test("courtVerdict marks non-court-name fields not comparable", () => {
    // YuanDian returns a city ("佛山市", "郑州市") or an abbreviation ("一中院"),
    // not a court name. Comparing those against a full court name produced a
    // false DISAGREE on a case whose titles matched exactly.
    strictEqual(isFullCourtName("天津市第一中级人民法院"), true);
    strictEqual(isFullCourtName("一中院"), false);
    strictEqual(isFullCourtName("佛山市"), false);
    strictEqual(courtVerdict("天津市第一中级人民法院", "一中院"), "not_comparable");
    strictEqual(courtVerdict("广东省佛山市中级人民法院", "佛山市"), "not_comparable");
    strictEqual(courtVerdict("广东省佛山市中级人民法院", "佛山市中级人民法院"), "agree");
    strictEqual(courtVerdict("广东省佛山市中级人民法院", "北京市高级人民法院"), "disagree");
});

test("generic placeholder titles are not a disagreement", () => {
    strictEqual(isGenericTitle("二审判决书"), true);
    strictEqual(isGenericTitle("判决书"), true);
    strictEqual(isGenericTitle("周丽、李城欢等房屋买卖合同纠纷民事二审民事判决书"), false);
    strictEqual(titleVerdict("二审判决书", "邱荣珍与永诚财产保险股份有限公司江苏分公司案"), "not_comparable");
    strictEqual(titleVerdict("张三案", "李四案"), "disagree");
});

test("titlesAgree ignores punctuation and whitespace", () => {
    strictEqual(titlesAgree("周丽、李城欢等房屋买卖合同纠纷民事二审民事判决书", "周丽、李城欢等房屋买卖合同纠纷民事二审民事判决书"), true);
    strictEqual(titlesAgree("张三案", "李四案"), false);
});

test("titlesAgree strips provider suffix conventions (案 vs 判决书)", () => {
    strictEqual(
        titlesAgree(
            "邱荣珍与永诚财产保险股份有限公司江苏分公司、张银生机动车交通事故责任纠纷案",
            "邱荣珍与永诚财产保险股份有限公司江苏分公司、张银生机动车交通事故责任纠纷二审民事判决书",
        ),
        true,
    );
    strictEqual(normalizeTitle("…纠纷案"), "…纠纷");
    strictEqual(normalizeTitle("…纠纷二审民事判决书"), "…纠纷");
});

test("datesAgree compares digits across separator styles", () => {
    strictEqual(datesAgree("2022.01.28", "2022-01-28"), true);
    strictEqual(datesAgree("2022.01.28", "2023-01-28"), false);
});

test("normalizeText strips punctuation and whitespace", () => {
    strictEqual(normalizeText("（2021）粤06民终16502号"), "2021粤06民终16502号");
});

function runGate({ ledger, pkulawHandler, yuandianHandler, env = {} }) {
    const dir = mkdtempSync(join(tmpdir(), "case-crosscheck-"));
    const ledgerPath = join(dir, "ledger.json");
    writeFileSync(ledgerPath, JSON.stringify(ledger), "utf8");

    const server = createServer((req, res) => {
        const source = req.url.startsWith("/pkulaw") ? "pkulaw" : "yuandian";
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => {
            const out = (source === "pkulaw" ? pkulawHandler : yuandianHandler)();
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

const okPkulaw = (hit) => () => ({
    payload: { result: { content: [{ type: "text", text: JSON.stringify({ result: hit ? [hit] : [] }) }] } },
});
const okYuandian = (hit) => () => ({
    payload: { result: { content: [{ type: "text", text: JSON.stringify({ success: true, data: hit ? [hit] : [] }) }] } },
});
const LEDGER = [{ case_number: "(2021)粤06民终16502号" }];
const PK_HIT = {
    caseFlag: "(2021)粤06民终16502号",
    court: "广东省佛山市中级人民法院",
    title: "周丽、李城欢等房屋买卖合同纠纷民事二审民事判决书",
    lastInstanceDate: "2022.01.28",
};
const YD_HIT = {
    title: "周丽、李城欢等房屋买卖合同纠纷民事二审民事判决书",
    city: "佛山市",
};

after(() => {
    // Servers are closed per-test; nothing shared to tear down.
});

test("exit 0 when one side returns a generic title (identity carried by 案号)", async () => {
    const r = await runGate({
        ledger: LEDGER,
        pkulawHandler: okPkulaw(PK_HIT),
        yuandianHandler: okYuandian({ title: "二审判决书", court_name: "广东省佛山市中级人民法院" }),
    });
    strictEqual(r.code, 0);
});

test("exit 0 when both sources resolve the case to the same identity", async () => {
    const r = await runGate({ ledger: LEDGER, pkulawHandler: okPkulaw(PK_HIT), yuandianHandler: okYuandian(YD_HIT) });
    strictEqual(r.code, 0);
});

test("exit 1 when the sources resolve to different cases", async () => {
    const r = await runGate({
        ledger: LEDGER,
        pkulawHandler: okPkulaw(PK_HIT),
        yuandianHandler: okYuandian({ title: "另案判决书", city: "佛山市" }),
    });
    strictEqual(r.code, 1);
});

test("exit 2 when a source cannot find the case (miss is not agreement)", async () => {
    const r = await runGate({ ledger: LEDGER, pkulawHandler: okPkulaw(PK_HIT), yuandianHandler: okYuandian(null) });
    strictEqual(r.code, 2);
});

test("exit 2 when a source returns 401", async () => {
    const r = await runGate({
        ledger: LEDGER,
        pkulawHandler: () => ({ status: 401, body: "unauthorized" }),
        yuandianHandler: okYuandian(YD_HIT),
    });
    strictEqual(r.code, 2);
});

test("exit 2 when a source is unreachable", async () => {
    const r = await runGate({
        ledger: LEDGER,
        pkulawHandler: () => ({ status: 500, body: "boom" }),
        yuandianHandler: okYuandian(YD_HIT),
    });
    strictEqual(r.code, 2);
});

test("exit 2 when credentials are absent", async () => {
    const r = await runGate({
        ledger: LEDGER,
        pkulawHandler: okPkulaw(PK_HIT),
        yuandianHandler: okYuandian(YD_HIT),
        env: { PKULAW_MCP_AUTHORIZATION: "", YUANDIAN_API_KEY: "" },
    });
    strictEqual(r.code, 2);
});
