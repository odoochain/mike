#!/usr/bin/env node
// Diff the挂接 outputs of multiple blind-test rounds against the modeler's.
//
// Each blind-test submission is a Markdown file with the same section structure
// produced by blind-test-package.md: L1/L2/L3/L4/L5/L6/论证翼/判项, each
// followed by bullet items describing nodes.
//
// WHAT THIS SCRIPT MEASURES (and what it deliberately cannot):
//   It catches "挂不上" (a layer with no entries in one submission but present
//   in others) and rough structural divergence. It does NOT judge whether the
//   structural挂接 is legally correct — that needs a human. So a green run is
//   "structurally reproducible across submissions", not "verified correct".
//
// Output: a per-layer matrix showing which submissions produced which items,
// flagging layers where submissions diverge or where any submission had no
// entry (the gap signal that matters most).
//
// Usage:
//   node scripts/blind-test-diff.mjs --modeler <path> --rounds <r1.md> <r2.md> ...

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

/**
 * Parse a blind-test submission into { layer: string[] }.
 * The package's section headers are the layer keys. Items under each section
 * are the挂接 nodes; we keep them as raw strings because each blind-test
 * round is free-form prose, not structured data.
 *
 * Lines starting with `#` or `##` define sections; any `#`-prefixed line resets
 * the current section. Empty lines separate items but do not reset.
 */
export function parseSubmission(text) {
    const layers = {};
    let current = null;
    for (const raw of String(text).split("\n")) {
        const line = raw.replace(/\r$/, "");
        if (/^#{1,3}\s/.test(line)) {
            // Strip markdown and trailing punctuation, keep a short key.
            current = line
                .replace(/^#{1,3}\s+/, "")
                .replace(/\s+/g, "")
                .replace(/[:：].*$/, "")
                .trim()
                .slice(0, 30);
            if (current && !layers[current]) layers[current] = [];
            continue;
        }
        const trimmed = line.trim();
        if (!trimmed || !current) continue;
        // A bullet item is evidence of an entry. Plain prose under a heading is
        // collapsed: one item per non-empty, non-meta line.
        if (/^[-*•]/.test(trimmed)) {
            layers[current].push(trimmed.replace(/^[-*•]\s*/, ""));
        } else if (!/^(待|说明|产出|请|本|{)/.test(trimmed)) {
            layers[current].push(trimmed);
        }
    }
    // Drop empty layers and merge near-duplicate keys (case differences).
    const out = {};
    for (const [k, v] of Object.entries(layers)) {
        if (v.length === 0) continue;
        const key = k.length > 6 ? k.slice(0, 6) : k;
        (out[key] ??= []).push(...v);
    }
    return out;
}

/**
 * Two items "match" if they share a meaningful token (party name, claim type,
 * evidence keyword). Matching is deliberately loose: submissions describe the
 * same node in different words, and exact equality would over-report gaps.
 */
const STOPWORDS = new Set([
    "的", "与", "及", "和", "为", "在", "上", "下", "由", "其", "该", "本案", "本案中",
    "原审", "原审中", "一审", "二审", "上诉", "被上诉", "the", "and", "of", "to",
]);

/** Character bigrams after stripping punctuation/whitespace. Chinese text has no
 * spaces, so word-token matching under-fires: two descriptions of the same node
 * ("赔偿医疗费" vs "医疗费赔偿请求") share bigrams, not exact tokens. */
export function bigramsOf(item) {
    const s = String(item)
        .replace(/[（）()，。、；：""''《》,.;:"'<>0-9.\s]/g, "")
        .trim();
    const out = new Set();
    for (let i = 0; i < s.length - 1; i += 1) out.add(s.slice(i, i + 2));
    return out;
}

export function itemsAgree(a, b) {
    const A = bigramsOf(a);
    const B = bigramsOf(b);
    if (A.size === 0 || B.size === 0) return false;
    let overlap = 0;
    for (const g of A) if (B.has(g)) overlap += 1;
    // Loose match: at least two shared bigrams, or ≥50% of the shorter item
    // covered. This catches the same node described in different words without
    // collapsing onto generic one-bigram coincidences like "偿金".
    return overlap >= 2 || overlap >= 0.5 * Math.min(A.size, B.size);
}

/**
 * For one layer, classify each item of the modeler's set against each round.
 * Returns: matchedCount, unmatched (modeler items with no counterpart in a round),
 * extra (round items not matched by any modeler item), and a per-round gap flag.
 *
 * `extra` is the round-side divergence signal: entries a blind round produced
 * that the modeler never挂接. Earlier this was dead code (`matched.some(() =>
 * false)` is always false, so extra silently equaled all roundItems and was
 * never returned). It now tracks which round items were actually hit.
 */
export function diffLayer(modelerItems, roundItems) {
    const matched = [];
    const unmatched = [];
    const hitRoundIdx = new Set();
    for (const m of modelerItems) {
        let hitRound = -1;
        for (let i = 0; i < roundItems.length; i += 1) {
            if (itemsAgree(m, roundItems[i])) {
                hitRound = i;
                break;
            }
        }
        if (hitRound >= 0) {
            matched.push(m);
            hitRoundIdx.add(hitRound);
        } else {
            unmatched.push(m);
        }
    }
    // Round items no modeler item matched. A round item matched by several
    // modeler items is still "hit" and not extra.
    const extra = roundItems.filter((_, i) => !hitRoundIdx.has(i));
    return {
        modelerCount: modelerItems.length,
        roundCount: roundItems.length,
        matched: matched.length,
        unmatched,
        extra,
        gap: roundItems.length === 0 && modelerItems.length > 0,
    };
}

function read(path) {
    return readFileSync(path, "utf8");
}

const invokedDirectly =
    process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

async function main() {
    const { values, positionals } = parseArgs({
        options: {
            modeler: { type: "string" },
            rounds: { type: "string", multiple: true },
        },
        allowPositionals: true,
    });

    // `--rounds a.md b.md` collects repeated flags; bare positionals after the
    // last flag are also rounds, so both calling styles work.
    const roundPaths = [...(values.rounds ?? []), ...positionals];
    if (!values.modeler || roundPaths.length === 0) {
        console.error("Usage: node blind-test-diff.mjs --modeler <path> --rounds <r1.md> [r2.md ...]");
        process.exit(2);
    }

    const modeler = parseSubmission(read(values.modeler));
    const rounds = roundPaths.map((p) => ({ path: p, parsed: parseSubmission(read(p)) }));

    const layerKeys = Array.from(
        new Set([...Object.keys(modeler), ...rounds.flatMap((r) => Object.keys(r.parsed))]),
    );

    const report = { modeler: values.modeler, rounds: values.rounds, layers: [] };
    let gapCount = 0;
    let divergenceCount = 0;
    // Convergence = the fraction of the modeler's entries that at least one
    // round reproduced, per layer and overall. This is the single number the
    // blind-test judgment actually reads ("四方三方以上收敛"): high convergence
    // means the structure is reproducible across independent submissions.
    let totalModelerItems = 0;
    let totalConvergedItems = 0;

    for (const key of layerKeys) {
        const mItems = modeler[key] ?? [];
        const perRound = rounds.map((r) => r.parsed[key] ?? []);
        const diffs = perRound.map((items) => diffLayer(mItems, items));
        const anyGap = diffs.some((d) => d.gap);
        const anyDivergence = diffs.some((d) => d.unmatched.length > 0);
        if (anyGap) gapCount += 1;
        if (anyDivergence) divergenceCount += 1;

        // A modeler item "converges" if any round matched it. Union across rounds.
        const converged = mItems.filter((m) =>
            perRound.some((items) => items.some((r) => itemsAgree(m, r))),
        );
        totalModelerItems += mItems.length;
        totalConvergedItems += converged.length;
        const layerConvergence = mItems.length === 0 ? 1 : converged.length / mItems.length;

        report.layers.push({
            layer: key,
            modelerCount: mItems.length,
            convergedCount: converged.length,
            convergence: Number(layerConvergence.toFixed(3)),
            rounds: diffs,
        });
    }

    const overallConvergence =
        totalModelerItems === 0 ? 1 : totalConvergedItems / totalModelerItems;
    report.convergence = {
        modelerItems: totalModelerItems,
        convergedItems: totalConvergedItems,
        ratio: Number(overallConvergence.toFixed(3)),
    };

    console.log(JSON.stringify(report, null, 2));
    console.error(
        `\n${report.layers.length} layers compared across ${rounds.length} round(s).`,
    );
    console.error(
        `Convergence: ${totalConvergedItems}/${totalModelerItems} modeler items reproduced ` +
            `by at least one round (${(overallConvergence * 100).toFixed(1)}%).`,
    );
    console.error(`${gapCount} layer(s) with a gap (a round had no entries where the modeler did).`);
    console.error(`${divergenceCount} layer(s) with unmatched modeler items (divergence signal).`);
    console.error("Note: matched/unmatched is keyword-loose; legal correctness is not assessed.");

    if (gapCount > 0 || divergenceCount > 0) {
        process.exit(1);
    }
    process.exit(0);
}

if (invokedDirectly) {
    await main();
}
