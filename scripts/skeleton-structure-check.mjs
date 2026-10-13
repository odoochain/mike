#!/usr/bin/env node
// Structural self-check for the skeleton schema (stand-in for the official
// test_validate_skeleton.py, which is NOT available in this environment).
//
// Why this exists: v3.5.1 explicitly declared "未跑缺陷注入回归——校验器脚本不在
// 本次编辑环境可用范围内". Rather than ship a modelling change unverified, this
// script performs the structural checks the skeleton itself claims to care about:
//   1. YAML parses
//   2. Every relation domain/range references a defined class (or '*')
//   3. Every property_enum_binding targets a defined enum and a known class/relation
//   4. No orphan classes (no parent, and not referenced by any relation) — this is
//      the check that exposed ArgumentScheme/CriticalQuestion/Attack in v3.5.1
//   5. Every enum referenced by a binding exists
//
// FAIL-CLOSED: any failure exits non-zero. A partially-checked skeleton must never
// look clean.
//
// Usage:
//   node scripts/skeleton-structure-check.mjs --file <skeleton.md> [--yaml-module <path>]

import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const { values } = parseArgs({
    options: {
        file: { type: "string" },
        "yaml-module": { type: "string" },
    },
});

if (!values.file) {
    console.error("Usage: node skeleton-structure-check.mjs --file <skeleton.md>");
    process.exit(2);
}

// js-yaml may not be installed in-repo; allow passing a module path explicitly.
const yamlModulePath = values["yaml-module"];
if (!yamlModulePath) {
    console.error("UNCHECKED: --yaml-module <path to js-yaml> is required (no YAML parser in-repo).");
    process.exit(2);
}
// Windows absolute paths are not valid ESM specifiers; convert to a file:// URL.
const moduleUrl = /^[a-zA-Z]:[\\/]/.test(yamlModulePath)
    ? pathToFileURL(yamlModulePath).href
    : yamlModulePath;
const yaml = (await import(moduleUrl)).default ?? (await import(moduleUrl));

/** Extract the fenced ```yaml block from a Markdown skeleton document. */
export function extractYaml(markdown) {
    const m = String(markdown).match(/```yaml\r?\n([\s\S]*?)```/);
    if (!m) throw new Error("no ```yaml block found");
    return m[1];
}

const text = readFileSync(values.file, "utf8");
let doc;
try {
    doc = yaml.load(extractYaml(text));
} catch (err) {
    console.error(`UNCHECKED: YAML parse failed: ${err.message}`);
    process.exit(2);
}

const errors = [];
const classNames = new Set(Object.keys(doc.classes ?? {}));
const enumNames = new Set(Object.keys(doc.enums ?? {}));
const relations = doc.relations ?? [];

function isWildcard(v) {
    return v === "*";
}

// Build the set of classes referenced anywhere by a relation.
const referenced = new Set();
for (const rel of relations) {
    for (const side of ["domain", "range"]) {
        for (const c of rel[side] ?? []) {
            if (!isWildcard(c)) referenced.add(c);
        }
    }
}

// 1. Relation domain/range must reference defined classes.
for (const rel of relations) {
    for (const side of ["domain", "range"]) {
        for (const c of rel[side] ?? []) {
            if (isWildcard(c)) continue;
            if (!classNames.has(c)) {
                errors.push(`relation "${rel.name}" ${side} references unknown class "${c}"`);
            }
        }
    }
}

// 2. Enum bindings must target a defined enum.
for (const b of doc.property_enum_bindings ?? []) {
    if (!enumNames.has(b.enum)) {
        errors.push(`binding property "${b.property}" targets unknown enum "${b.enum}"`);
    }
    for (const target of b.applies_to ?? []) {
        // applies_to may be a class OR a relation name.
        const isClass = classNames.has(target);
        const isRelation = relations.some((r) => r.name === target);
        if (!isClass && !isRelation) {
            errors.push(`binding property "${b.property}" applies_to unknown target "${target}"`);
        }
    }
}

// 3. Orphan classes: no parent, and not referenced by any relation.
//    Exempt abstract roots and L0 SKOS concepts if they are referenced elsewhere.
const orphans = [];
for (const [name, def] of Object.entries(doc.classes ?? {})) {
    const d = def ?? {};
    const hasParent = Boolean(d.parent);
    const referencedByClass = Object.values(doc.classes ?? {}).some((other) => other?.parent === name);
    if (!hasParent && !referenced.has(name) && !referencedByClass) {
        orphans.push(name);
    }
}

// 4. Enum values referenced in enum_constraints must exist.
for (const c of doc.enum_constraints ?? []) {
    const list = doc.enums?.[c.enum];
    if (!list) {
        errors.push(`enum_constraint references unknown enum "${c.enum}"`);
        continue;
    }
    if (!list.includes(c.value)) {
        errors.push(`enum_constraint value "${c.value}" not present in enum "${c.enum}"`);
    }
}

console.log(JSON.stringify({
    file: values.file,
    version: doc?.meta?.version ?? "(unknown)",
    classes: classNames.size,
    relations: relations.length,
    enums: enumNames.size,
    orphanClasses: orphans,
    errors,
}, null, 2));

if (errors.length > 0) {
    console.error(`\n${errors.length} structural error(s).`);
    process.exit(1);
}
if (orphans.length > 0) {
    console.error(`\n${orphans.length} orphan class(es) — modelling gap, not a hard error.`);
    process.exit(1);
}
console.error("\nStructural checks passed (no dangling refs, no orphans).");
process.exit(0);
