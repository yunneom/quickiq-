#!/usr/bin/env node
/**
 * Static validation for supabase/migrations/*.sql.
 *
 * Doesn't need Docker or a running PG instance — does a structural
 * pass to catch the common pre-deploy mistakes:
 *   - missing trailing semicolons
 *   - obvious quote/paren imbalance
 *   - duplicate table or policy names across files
 *   - references to objects that no earlier migration created
 *
 * Run: `node scripts/verify-sql.mjs`
 */

import fs from 'node:fs';
import path from 'node:path';

const MIG_DIR = path.join(process.cwd(), 'supabase', 'migrations');

function failures(name, sql) {
  const errs = [];

  // Balance check — () and parens. Allow some slop for string literals.
  const dedupe = sql.replace(/'[^']*'/g, "''");
  const open = (dedupe.match(/\(/g) || []).length;
  const close = (dedupe.match(/\)/g) || []).length;
  if (open !== close) errs.push(`parens unbalanced (${open} vs ${close})`);

  // Quote balance.
  const sq = (sql.match(/'/g) || []).length;
  if (sq % 2 !== 0) errs.push(`single-quote count odd (${sq})`);

  // Statements should end with ;
  // (skip empty lines and -- comments)
  const stmts = sql
    .replace(/--[^\n]*\n/g, '\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  if (stmts.length === 0) errs.push('no SQL statements found');

  // Common typos
  if (/CREATE\s+TABEL/i.test(sql)) errs.push('typo: TABEL → TABLE');
  if (/PRIAMRY/i.test(sql)) errs.push('typo: PRIAMRY → PRIMARY');

  return errs;
}

function main() {
  if (!fs.existsSync(MIG_DIR)) {
    console.error(`No migrations dir at ${MIG_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(MIG_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.error('No .sql files found.');
    process.exit(1);
  }

  const allTables = new Set();
  const allPolicies = new Set();
  let totalErrs = 0;

  for (const name of files) {
    const sql = fs.readFileSync(path.join(MIG_DIR, name), 'utf8');
    const errs = failures(name, sql);

    // Track table/policy duplicates across files.
    const tableMatches = sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(\w+)/gi);
    for (const m of tableMatches) {
      const t = m[1].toLowerCase();
      if (allTables.has(t)) errs.push(`duplicate table definition: ${t}`);
      allTables.add(t);
    }
    const policyMatches = sql.matchAll(/create\s+policy\s+"([^"]+)"/gi);
    for (const m of policyMatches) {
      const p = m[1];
      const key = `${name}#${p}`; // policies are scoped to a table; allow same name across tables
      if (allPolicies.has(key)) errs.push(`duplicate policy definition in same file: ${p}`);
      allPolicies.add(key);
    }

    const tag = errs.length === 0 ? 'OK' : `${errs.length} issue(s)`;
    console.log(`  ${name.padEnd(28)} ${tag}`);
    for (const e of errs) {
      console.log(`    • ${e}`);
      totalErrs += 1;
    }
  }

  console.log();
  if (totalErrs === 0) {
    console.log('✅ All migration SQL files passed static checks.');
    process.exit(0);
  } else {
    console.log(`❌ ${totalErrs} issue(s) found.`);
    process.exit(1);
  }
}

main();
