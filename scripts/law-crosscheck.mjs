#!/usr/bin/env node
// Cross-check legal citations against two independent commercial legal sources
// (北大法宝 PKULaw and 元典 YuanDian) and report only where they DISAGREE.
//
// Why this exists: verifying a citation against one commercial source proves
// nothing about that source's own error. Two sources that agree are still not
// "true", but two sources that disagree are a definite signal worth a human
// decision. This script automates the comparison, not the judgment.
//
// FAIL-CLOSED CONTRACT (mirrors scripts/audit-gate.mjs):
//   exit 0 = every entry was checked against BOTH sources and they agreed.
//   exit 1 = at least one DISAGREE (needs a decision).
//   exit 2 = we could NOT check (missing credentials, unreachable source,
//            auth/quota failure, or any entry not fully checked).
// "Could not check" must never print the same verdict as "checked and clean",
// so a partial run is always a failure. Tests assert this explicitly.
//
// Usage:
//   PKULAW_MCP_AUTHORIZATION="Bearer ..." YUANDIAN_API_KEY="..." \
//     node scripts/law-crosscheck.mjs --ledger scripts/law-ledger.example.json
//
// Env:
//   PKULAW_MCP_AUTHORIZATION  Bearer token for PKULaw (or ~/.pkulaw/mcp/config.json)
//   YUANDIAN_API_KEY          API key for YuanDian
//   PKULAW_BASE_URL           override (tests only)
//   YUANDIAN_BASE_URL         override (tests only)

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const PKULAW_URL = process.env.PKULAW_BASE_URL ?? "https://apim-gateway.pkulaw.com/mcp-fatiao/mcp";
const YUANDIAN_URL = process.env.YUANDIAN_BASE_URL ?? "https://open.chineselaw.com/mcp";
const PKULAW_TOOL = "get_law_item_content";
const YUANDIAN_TOOL = "yuandian_get_legal_article_detail";

const EXIT_OK = 0;
const EXIT_DISAGREE = 1;
const EXIT_UNCHECKED = 2;

const CN_DIGITS = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
const CN_UNITS = { 十: 10, 百: 100, 千: 1000 };

/**
 * Convert a Chinese article number to the integer PKULaw's `tiao_num` wants.
 * Supports 第二百五十条 -> 250 and 第十七条之一 -> 17.1 (only what the ledger needs).
 * Returns null when it cannot parse, so the caller treats it as UNCHECKED
 * rather than silently sending a wrong number.
 */
export function cnArticleToNumber(article) {
    if (/^\d+(\.\d+)?$/.test(article)) return article;
    const m = String(article).match(/第?([零一二两三四五六七八九十百千]+)条(?:之([一二三四五六七八九]))?/);
    if (!m) return null;
    let total = 0;
    let section = 0;
    let lastDigit = null;
    for (const ch of m[1]) {
        if (ch in CN_DIGITS) {
            lastDigit = CN_DIGITS[ch];
        } else if (ch in CN_UNITS) {
            if (lastDigit === null) section += CN_UNITS[ch];
            else section += lastDigit * CN_UNITS[ch];
            lastDigit = null;
        } else {
            return null;
        }
    }
    total = section + (lastDigit ?? 0);
    if (!total) return null;
    return m[2] ? `${total}.${CN_DIGITS[m[2]]}` : String(total);
}

/**
 * Normalize article text so two providers can be compared.
 * Providers differ cosmetically: PKULaw prefixes "第X条", YuanDian does not;
 * they also differ in whitespace and full/half-width punctuation.
 */
export function normalizeText(text) {
    if (!text) return "";
    return String(text)
        .replace(/^第[零一二两三四五六七八九十百千\d]+条(?:之[一二三四五六七八九])?/, "")
        .replace(/\s+/g, "")
        .replace(/[（）()]/g, "")
        .replace(/[，。、；：""''《》]/g, "")
        .replace(/[,.;:"'<>]/g, "")
        .trim();
}

/** Two texts agree if one contains the other after normalization. */
export function textsAgree(a, b) {
    const na = normalizeText(a);
    const nb = normalizeText(b);
    if (!na && !nb) return true;
    if (!na || !nb) return false;
    return na.includes(nb) || nb.includes(na);
}

/** Read PKULaw credentials from env, or fall back to the CLI's config file. */
function pkulawAuth() {
    const fromEnv = process.env.PKULAW_MCP_AUTHORIZATION?.trim();
    if (fromEnv) return fromEnv;
    try {
        const cfg = JSON.parse(readFileSync(join(homedir(), ".pkulaw", "mcp", "config.json"), "utf8"));
        const auth = cfg?.authorization?.trim();
        if (auth) return auth;
        if (cfg?.bearerToken?.trim()) return `Bearer ${cfg.bearerToken.trim()}`;
    } catch {
        // No CLI config on this machine: caller must supply the env var.
    }
    return null;
}

/** Parse either a plain JSON body or an SSE `data:` framed one. */
function parseMcpBody(body) {
    const trimmed = body.trim();
    if (trimmed.startsWith("{")) return JSON.parse(trimmed);
    for (const line of trimmed.split("\n")) {
        if (line.startsWith("data:")) return JSON.parse(line.slice(5).trim());
    }
    throw new Error("unrecognized MCP response body");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function mcpCall(url, auth, toolName, args, { attempts = 2 } = {}) {
    let lastError = null;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json, text/event-stream",
                    Authorization: auth,
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: attempt,
                    method: "tools/call",
                    params: { name: toolName, arguments: args },
                }),
            });
            // 401/403 mean the credential is wrong: never retry, never pass.
            if (res.status === 401 || res.status === 403) {
                return { ok: false, fatal: true, error: `HTTP ${res.status} (credential rejected)` };
            }
            if (res.status === 429) {
                lastError = "HTTP 429 (rate limited)";
                await sleep(2000 * attempt);
                continue;
            }
            if (!res.ok) {
                lastError = `HTTP ${res.status}`;
                await sleep(500 * attempt);
                continue;
            }
            const payload = parseMcpBody(await res.text());
            if (payload.error) return { ok: false, error: payload.error.message ?? "MCP error" };
            const content = payload?.result?.content?.[0]?.text;
            if (typeof content !== "string") return { ok: false, error: "missing result content" };
            return { ok: true, text: content };
        } catch (err) {
            lastError = err?.message ?? String(err);
            await sleep(500 * attempt);
        }
    }
    return { ok: false, error: lastError ?? "request failed" };
}

async function fetchPkulaw(auth, title, articleNumber) {
    const tiao = cnArticleToNumber(articleNumber);
    if (!tiao) return { ok: false, error: `unparsable article number: ${articleNumber}` };
    const res = await mcpCall(PKULAW_URL, auth, PKULAW_TOOL, { title, tiao_num: Number(tiao) });
    if (!res.ok) return res;
    try {
        const data = JSON.parse(res.text)?.Data;
        return { ok: true, text: data?.FullText ?? null, version: data?.Title ?? null };
    } catch {
        return { ok: false, error: "unparsable PKULaw payload" };
    }
}

async function fetchYuandian(apiKey, title, articleNumber) {
    const res = await mcpCall(YUANDIAN_URL, `Bearer ${apiKey}`, YUANDIAN_TOOL, {
        regulation_name: title,
        article_number: articleNumber,
    });
    if (!res.ok) return res;
    try {
        const data = JSON.parse(res.text)?.data;
        // A successful call can still return no data: that is a miss, not an error.
        return {
            ok: true,
            text: data?.content ?? null,
            version: data?.regulation_name ?? null,
        };
    } catch {
        return { ok: false, error: "unparsable YuanDian payload" };
    }
}

function failClosed(message) {
    console.error(`UNCHECKED: ${message}`);
    process.exit(EXIT_UNCHECKED);
}

async function main() {
    const { values } = parseArgs({
        options: { ledger: { type: "string" }, "min-delay-ms": { type: "string", default: "1200" } },
    });

    if (!values.ledger) failClosed("--ledger <path> is required");
    const ledgerRaw = readFileSync(values.ledger, "utf8");
    const ledger = JSON.parse(ledgerRaw);
    if (!Array.isArray(ledger) || ledger.length === 0) failClosed("ledger is empty");

    const pkulaw = pkulawAuth();
    const yuandian = process.env.YUANDIAN_API_KEY?.trim();
    if (!pkulaw) failClosed("PKULaw credentials missing (set PKULAW_MCP_AUTHORIZATION)");
    if (!yuandian) failClosed("YuanDian credentials missing (set YUANDIAN_API_KEY)");

    const delay = Number(values["min-delay-ms"]) || 0;
    const results = [];
    let unchecked = 0;

    for (const entry of ledger) {
        const { title, article_number: article } = entry;
        if (!title || !article) {
            unchecked += 1;
            results.push({ title, article, status: "UNCHECKED", reason: "invalid ledger entry" });
            continue;
        }

        const ya = await fetchYuandian(yuandian, title, article);
        if (delay) await sleep(delay);
        const pk = await fetchPkulaw(pkulaw, title, article);
        if (delay) await sleep(delay);

        // A fatal credential failure stops the run: continuing would produce a
        // report that looks partial-but-green.
        if (ya.fatal || pk.fatal) {
            failClosed(`credential rejected by ${ya.fatal ? "YuanDian" : "PKULaw"}`);
        }
        if (!ya.ok || !pk.ok) {
            unchecked += 1;
            results.push({
                title,
                article,
                status: "UNCHECKED",
                reason: [ya.ok ? null : `yuandian: ${ya.error}`, pk.ok ? null : `pkulaw: ${pk.error}`]
                    .filter(Boolean)
                    .join("; "),
            });
            continue;
        }

        // A source that answers "success" with no text has NOT been checked.
        // Reporting that as a disagreement would send a human to adjudicate a
        // non-result, so it counts as unchecked instead.
        if (!pk.text || !ya.text) {
            unchecked += 1;
            results.push({
                title,
                article,
                status: "UNCHECKED",
                reason: [
                    pk.text ? null : "pkulaw: no article text returned",
                    ya.text ? null : "yuandian: no article text returned",
                ]
                    .filter(Boolean)
                    .join("; "),
            });
            continue;
        }

        const agree = textsAgree(pk.text, ya.text);
        results.push({
            title,
            article,
            status: agree ? "AGREE" : "DISAGREE",
            pkulawVersion: pk.version,
            yuandianVersion: ya.version,
            pkulawText: pk.text,
            yuandianText: ya.text,
        });
    }

    const agree = results.filter((r) => r.status === "AGREE").length;
    const disagree = results.filter((r) => r.status === "DISAGREE");

    console.log(JSON.stringify({ total: results.length, agree: agree.length, disagree: disagree.length, unchecked, results }, null, 2));

    if (unchecked > 0) {
        console.error(`\n${unchecked} entr(ies) could not be checked against both sources.`);
        process.exit(EXIT_UNCHECKED);
    }
    if (disagree.length > 0) {
        console.error(`\n${disagree.length} disagreement(s) need a decision.`);
        process.exit(EXIT_DISAGREE);
    }
    console.error("\nAll entries agreed across both sources.");
    process.exit(EXIT_OK);
}

// Only run when invoked directly. The test file imports the helpers above, and
// top-level `await main()` would otherwise execute the gate on import.
const invokedDirectly =
    process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
    await main();
}
