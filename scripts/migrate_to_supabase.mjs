#!/usr/bin/env node
/**
 * migrate_to_supabase.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time migration: reads db.json and bulk-inserts products + posts into
 * Supabase via the REST API (no SDK dependency — works with all key formats).
 *
 * Usage:
 *   node scripts/migrate_to_supabase.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// ── Read .env ─────────────────────────────────────────────────────────────────
const envVars = {};
try {
  fs.readFileSync(path.join(ROOT, ".env"), "utf8")
    .split("\n")
    .forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...rest] = trimmed.split("=");
        envVars[key.trim()] = rest.join("=").trim();
      }
    });
} catch (e) {
  console.error("Could not read .env:", e.message);
  process.exit(1);
}

const SUPABASE_URL = envVars["VITE_SUPABASE_URL"];
const SUPABASE_KEY = envVars["VITE_SUPABASE_ANON_KEY"];

if (
  !SUPABASE_URL || SUPABASE_URL.includes("your-project-id") ||
  !SUPABASE_KEY || SUPABASE_KEY === "your-anon-key-here"
) {
  console.error("❌  Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env first.");
  process.exit(1);
}

const HEADERS = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Prefer": "resolution=merge-duplicates",  // upsert on conflict
};

// ── Load db.json ──────────────────────────────────────────────────────────────
let db;
try {
  db = JSON.parse(fs.readFileSync(path.join(ROOT, "db.json"), "utf8"));
} catch (e) {
  console.error("Could not read db.json:", e.message);
  process.exit(1);
}

const products = db.products || [];
const posts    = db.posts    || [];

console.log(`\n📦  db.json loaded:`);
console.log(`    ${products.length} products`);
console.log(`    ${posts.length} posts\n`);

// ── Shape converters ──────────────────────────────────────────────────────────
function productToRow(p) {
  return {
    id:              p.id,
    name:            p.name,
    sku:             p.sku             ?? "",
    price:           p.price           ?? "",
    unit:            p.unit            ?? "",
    category:        p.category        ?? "",
    badge:           p.badge           ?? "",
    image:           p.image           ?? "",
    hidden:          p.hidden          ?? false,
    featured:        p.featured        ?? false,
    description:     p.description     ?? null,
    source:          p.source          ?? null,
    source_url:      p.sourceUrl       ?? null,
    source_category: p.sourceCategory  ?? null,
  };
}

function postToRow(p) {
  return {
    id:         p.id,
    title:      p.title,
    body:       p.body       ?? "",
    image_url:  p.imageUrl   ?? "",
    category:   p.category   ?? "Product",
    created_at: p.createdAt  ?? new Date().toISOString(),
  };
}

// ── REST upsert in batches ────────────────────────────────────────────────────
async function upsertBatch(table, rows, batchSize = 200) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const url = `${SUPABASE_URL}/rest/v1/${table}`;

    const res = await fetch(url, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(batch),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`\n  ❌  Batch [${i}–${i + batch.length}] failed (${res.status}): ${text}`);
      throw new Error(`HTTP ${res.status}`);
    }

    inserted += batch.length;
    process.stdout.write(`\r  ✔  ${inserted}/${rows.length} rows upserted…`);
  }
  console.log(); // newline
}

// ── Migrate ───────────────────────────────────────────────────────────────────
console.log("🔄  Migrating products →");
try {
  await upsertBatch("products", products.map(productToRow));
  console.log("✅  Products done.\n");
} catch {
  console.error("Migration failed for products.\n");
  process.exit(1);
}

if (posts.length > 0) {
  console.log("🔄  Migrating posts →");
  try {
    await upsertBatch("posts", posts.map(postToRow));
    console.log("✅  Posts done.\n");
  } catch {
    console.error("Migration failed for posts.\n");
    process.exit(1);
  }
} else {
  console.log("ℹ   No posts in db.json — skipping.\n");
}

console.log("🎉  Migration complete! Your Supabase tables are ready.");
console.log("    → Go create the 'chamrud-images' Storage bucket (public) if not done yet.");
console.log("    → Run: npm run dev\n");
