// Tests for scripts/blind-test-diff.mjs — parsing loose and the gap signal.
//
// Run: node --test scripts/blind-test-diff.test.mjs
//
// The contract that matters most: when one round produces NO entries for a
// layer the modeler populated, that layer must be flagged as a gap, not folded
// into a quiet "all matched". A missing layer is the strongest signal that the
// skeleton挂接 collapsed for some modeler, which is the whole point of L3.

import { strictEqual } from "node:assert";
import { test } from "node:test";
import { diffLayer, bigramsOf, itemsAgree, parseSubmission } from "./blind-test-diff.mjs";

test("parseSubmission groups items under their layer heading", () => {
    const out = parseSubmission(`# L1 主张层

- Claim-01：赔偿医疗费
- Claim-02：承担诉讼费用

## L5 证据层

- Evidence：医疗费票据
`);
    strictEqual(out["L1主张层"].length, 2);
    strictEqual(out["L5证据层"].length, 1);
});

test("bigramsOf strips punctuation and whitespace", () => {
    const g = bigramsOf("Claim-01：赔偿医疗费（含被告垫付）");
    strictEqual(g.has("赔偿"), true);
    strictEqual(g.has("医疗"), true);
    strictEqual(g.has("01"), false);
});

test("itemsAgree matches on a shared token", () => {
    strictEqual(itemsAgree("Claim-01：赔偿医疗费", "医疗费赔偿请求"), true);
    strictEqual(itemsAgree("精神抚慰金5000元", "残疾赔偿金65257元"), false);
});

test("diffLayer flags a gap when a round has no items", () => {
    const d = diffLayer(["Claim-01：医疗费", "Claim-02：诉讼费"], []);
    strictEqual(d.gap, true);
    strictEqual(d.unmatched.length, 2);
});

test("diffLayer reports matched and unmatched when a round partially covers", () => {
    const d = diffLayer(
        ["Claim-01：赔偿医疗费", "Claim-02：诉讼费用"],
        ["医疗费赔偿请求"],
    );
    strictEqual(d.matched, 1);
    strictEqual(d.unmatched.length, 1);
    strictEqual(d.gap, false);
});

test("diffLayer reports all matched when both sides align", () => {
    const d = diffLayer(
        ["Claim-01：赔偿医疗费"],
        ["医疗费赔偿请求"],
    );
    strictEqual(d.matched, 1);
    strictEqual(d.unmatched.length, 0);
});
