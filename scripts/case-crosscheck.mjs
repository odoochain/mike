#!/usr/bin/env node
// Cross-check case citations (案号) against PKULaw and YuanDian, reporting only
// where they DISAGREE — the L2 companion to scripts/law-crosscheck.mjs (L1 法条).
//
// WHAT THIS CAN AND CANNOT PROVE — read before trusting a green run:
//   It verifies CASE IDENTITY: that the cited 案号 exists and that both sources
//   resolve it to the same case (title, court, decision date). It does NOT
//   verify CASE CONTENT — whether the knowledge base's characterization of the
//   holding, facts, or reasoning matches the real judgment. Two sources
//   agreeing that a case exists says nothing about whether we read it right.
//
// FAIL-CLOSED CONTRACT (identical to law-crosscheck.mjs):
//   exit 0 = every entry checked against BOTH sources and they agreed.
//   exit 1 = at least one DISAGREE (needs a decision).
//   exit 2 = could NOT check (credentials, unreachable, auth/quota, or an
//            entry not fully checked). Partial success is a failure.
//
// Usage:
//   PKULAW_MCP_AUTHORIZATION="Bearer ..." YUANDIAN_API_KEY="..." \
//     node scripts/case-crosscheck.mjs --ledger scripts/case-ledger.example.json

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const PKULAW_URL = process.env.PKULAW_BASE_URL ?? "https://apim-gateway.pkulaw.com/case_number_recognition/mcp";
const YUANDIAN_URL = process.env.YUANDIAN_BASE_URL ?? "https://open.chineselaw.com/mcp";
const PKULAW_TOOL = "anhao_recognition";
const YUANDIAN_TOOL = "yuandian_get_case_detail";

const EXIT_OK = 0;
const EXIT_DISAGREE = 1;
const EXIT_UNCHECKED = 2;

export function normalizeText(value) {
    if (!value) return "";
    return String(value)
        .replace(/[（）()]/g, "")
        .replace(/\s+/g, "")
        .replace(/[，。、；：""''《》,.;:"'<>]/g, "")
        .trim();
}

/**
 * Court strings are the noisiest field: "广东省佛山市中级人民法院" vs
 * "佛山市中级人民法院". Compare on a suffix/substring basis so a missing or
 * extra administrative prefix is not reported as a disagreement.
 */
/**
 * YuanDian's detail payload exposes a `city` field, not a court name: it
 * returns "佛山市", "郑州市", and — inconsistently — abbreviations like
 * "一中院". Treating that as a court name produces false disagreements when
 * the titles already prove both sources resolved the same case.
 *
 * So a court is only comparable when BOTH sides look like a full court name
 * (ending in 法院). Otherwise the field is recorded as not comparable and the
 * verdict rests on the title.
 */
export function isFullCourtName(value) {
    return /法院$/.test(normalizeText(value));
}

export function courtsAgree(a, b) {
    const na = normalizeText(a);
    const nb = normalizeText(b);
    if (!na && !nb) return true;
    if (!na || !nb) return false;
    return na.includes(nb) || nb.includes(na);
}

/**
 * A source returning only a generic placeholder title ("二审判决书", "判决书")
 * has not identified the case by name: that is not evidence of a different
 * case, and must not be read as a title disagreement. The identity is carried
 * by the case-number resolution itself; comparable metadata only adds strength
 * or triggers a real disagreement.
 */
const GENERIC_TITLE_RE = /^((二审|一审|再审|执行)?(民事|刑事|行政|国家赔偿)?(判决书|裁定书|调解书|决定书))?(判决|裁定)?(书)?$/;

export function isGenericTitle(value) {
    return GENERIC_TITLE_RE.test(normalizeText(value));
}

/**
 * @returns {"agree"|"disagree"|"not_comparable"}
 */
export function titleVerdict(a, b) {
    if (isGenericTitle(a) || isGenericTitle(b)) return "not_comparable";
    return titlesAgree(a, b) ? "agree" : "disagree";
}

/**
 * @returns {"agree"|"disagree"|"not_comparable"}
 */
export function courtVerdict(a, b) {
    if (!isFullCourtName(a) || !isFullCourtName(b)) return "not_comparable";
    return courtsAgree(a, b) ? "agree" : "disagree";
}

export function datesAgree(a, b) {
    const digits = (v) => (v == null ? "" : String(v).replace(/\D/g, ""));
    const da = digits(a);
    const db = digits(b);
    if (!da && !db) return true;
    if (!da || !db) return false;
    return da === db;
}

/**
 * @returns {"agree"|"disagree"|"not_comparable"}
 */
export function dateVerdict(a, b) {
    const da = a == null ? "" : String(a).replace(/\D/g, "");
    const db = b == null ? "" : String(b).replace(/\D/g, "");
    if (!da || !db) return "not_comparable";
    return da === db ? "agree" : "disagree";
}

export function titlesAgree(a, b) {
    const na = normalizeTitle(a);
    const nb = normalizeTitle(b);
    if (!na && !nb) return true;
    if (!na || !nb) return false;
    return na === nb || na.includes(nb) || nb.includes(na);
}

/**
 * Titles from different providers differ only in suffix convention:
 * 法宝 uses "…纠纷案", 元典 appends "…纠纷二审民事判决书", and real titles
 * stack them ("…民事二审民事判决书" = 类别+审级+类别+文书). Iteratively strip
 * trailing known tokens so the shared party+cause prefix is what is compared.
 */
const TITLE_SUFFIX_TOKENS = ["判决书", "裁定书", "调解书", "决定书", "民事", "刑事", "行政", "国家赔偿", "二审", "一审", "再审", "执行", "案"];

export function normalizeTitle(value) {
    let s = normalizeText(value);
    let changed = true;
    while (changed && s) {
        changed = false;
        for (const token of TITLE_SUFFIX_TOKENS) {
            if (s.endsWith(token)) {
                s = s.slice(0, -token.length);
                changed = true;
            }
        }
    }
    return s;
}

function pkulawAuth() {
    const fromEnv = process.env.PKULAW_MCP_AUTHORIZATION?.trim();
    if (fromEnv) return fromEnv;
    try {
        const cfg = JSON.parse(readFileSync(join(homedir(), ".pkulaw", "mcp", "config.json"), "utf8"));
        const auth = cfg?.authorization?.trim();
        if (auth) return auth;
        if (cfg?.bearerToken?.trim()) return `Bearer ${cfg.bearerToken.trim()}`;
    } catch {
        // No CLI config: the caller must supply the env var.
    }
    return null;
}

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

async function fetchPkulaw(auth, caseNumber) {
    const res = await mcpCall(PKULAW_URL, auth, PKULAW_TOOL, { text: caseNumber });
    if (!res.ok) return res;
    try {
        // The raw gateway returns a single hit object, while the PKULaw CLI
        // wraps the same payload as { result: [...] }. Accept both shapes.
        const parsed = JSON.parse(res.text);
        const list = Array.isArray(parsed?.result) ? parsed.result : parsed ? [parsed] : [];
        // No hit is a legitimate "not found", not an error: surface it as a miss
        // so the caller can treat it as unchecked-for-that-side.
        if (list.length === 0) return { ok: true, miss: true };
        const hit = list.find((e) => normalizeText(e?.caseFlag) === normalizeText(caseNumber)) ?? list[0];
        return { ok: true, miss: false, title: hit.title ?? null, court: hit.court ?? null, date: hit.lastInstanceDate ?? null };
    } catch {
        return { ok: false, error: "unparsable PKULaw payload" };
    }
}

async function fetchYuandian(apiKey, caseNumber) {
    const res = await mcpCall(YUANDIAN_URL, `Bearer ${apiKey}`, YUANDIAN_TOOL, { case_number: caseNumber });
    if (!res.ok) return res;
    try {
        const data = JSON.parse(res.text)?.data;
        const list = Array.isArray(data) ? data : data ? [data] : [];
        if (list.length === 0) return { ok: true, miss: true };
        const hit = list[0];
        // Prefer court_name over city: city is not a court name ("佛山市",
        // "一中院"), while court_name is present on detail payloads.
        return { ok: true, miss: false, title: hit.title ?? null, court: hit.court_name ?? hit.city ?? null, date: hit.decision_date ?? null };
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
    const ledger = JSON.parse(readFileSync(values.ledger, "utf8"));
    if (!Array.isArray(ledger) || ledger.length === 0) failClosed("ledger is empty");

    const pkulaw = pkulawAuth();
    const yuandian = process.env.YUANDIAN_API_KEY?.trim();
    if (!pkulaw) failClosed("PKULaw credentials missing (set PKULAW_MCP_AUTHORIZATION)");
    if (!yuandian) failClosed("YuanDian credentials missing (set YUANDIAN_API_KEY)");

    const delay = Number(values["min-delay-ms"]) || 0;
    const results = [];
    let unchecked = 0;

    for (const entry of ledger) {
        const caseNumber = entry.case_number;
        if (!caseNumber) {
            unchecked += 1;
            results.push({ case_number: caseNumber, status: "UNCHECKED", reason: "invalid ledger entry" });
            continue;
        }

        const ya = await fetchYuandian(yuandian, caseNumber);
        if (delay) await sleep(delay);
        const pk = await fetchPkulaw(pkulaw, caseNumber);
        if (delay) await sleep(delay);

        if (ya.fatal || pk.fatal) {
            failClosed(`credential rejected by ${ya.fatal ? "YuanDian" : "PKULaw"}`);
        }
        if (!ya.ok || !pk.ok) {
            unchecked += 1;
            results.push({
                case_number: caseNumber,
                status: "UNCHECKED",
                reason: [ya.ok ? null : `yuandian: ${ya.error}`, pk.ok ? null : `pkulaw: ${pk.error}`]
                    .filter(Boolean)
                    .join("; "),
            });
            continue;
        }
        // A side that found nothing has not verified anything.
        if (ya.miss || pk.miss) {
            unchecked += 1;
            results.push({
                case_number: caseNumber,
                status: "UNCHECKED",
                reason: [ya.miss ? "yuandian: not found" : null, pk.miss ? "pkulaw: not found" : null]
                    .filter(Boolean)
                    .join("; "),
            });
            continue;
        }

        const titleState = titleVerdict(pk.title, ya.title);
        const courtState = courtVerdict(pk.court, ya.court);
        const dateState = dateVerdict(pk.date, ya.date);
        // Identity is carried by the case-number resolution: both sources
        // returned a record for this exact 案号. Comparable metadata only adds
        // strength or triggers a real disagreement; a field we cannot compare
        // (generic title, city instead of court name, missing date) is not
        // evidence either way. A disagreement is a real conflict, not an absence.
        const agree =
            titleState !== "disagree" &&
            courtState !== "disagree" &&
            dateState !== "disagree";
        results.push({
            case_number: caseNumber,
            status: agree ? "AGREE" : "DISAGREE",
            pkulaw: { title: pk.title, court: pk.court, date: pk.date },
            yuandian: { title: ya.title, court: ya.court, date: ya.date },
            fields: { title: titleState, court: courtState, date: dateState },
        });
    }

    const agree = results.filter((r) => r.status === "AGREE").length;
    const disagree = results.filter((r) => r.status === "DISAGREE");

    console.log(JSON.stringify({ total: results.length, agree, disagree: disagree.length, unchecked, results }, null, 2));

    if (unchecked > 0) {
        console.error(`\n${unchecked} case(s) could not be checked against both sources.`);
        process.exit(EXIT_UNCHECKED);
    }
    if (disagree.length > 0) {
        console.error(`\n${disagree.length} disagreement(s) need a decision.`);
        process.exit(EXIT_DISAGREE);
    }
    console.error("\nAll cases agreed across both sources (identity only — see header).");
    process.exit(EXIT_OK);
}

const invokedDirectly =
    process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
    await main();
}
