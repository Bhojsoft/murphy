// Merges hugo-blog/public/* into dist/ after `astro build` has run.
//
// Why this exists: Hugo and Astro both build into the same final site, but
// each owns different URLs (Astro owns "/", "/contact", "/services", etc.;
// Hugo owns the practice-area pages and "/blog/" per the client's URL
// structure sheet). We let Hugo build into its own folder first, then copy
// everything it produced into dist/ — EXCEPT the literal root-level
// index.html/index.xml/sitemap.xml, which are Hugo's own (unused) home page
// artifacts and would otherwise overwrite Astro's real homepage/sitemap.
//
// Run order (see package.json "build" script):
//   1. npm run build:hugo   -> hugo-blog/public/**
//   2. npm run build:astro  -> dist/**
//   3. node scripts/merge-hugo-output.mjs

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HUGO_OUT = path.join(ROOT, "hugo-blog", "public");
const DIST = path.join(ROOT, "dist");

// Root-level files Hugo always emits that we must NOT copy over Astro's own.
const SKIP_AT_ROOT = new Set(["index.html", "index.xml", "sitemap.xml", "404.html"]);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src, dest, isRoot = true) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (isRoot && entry.isFile() && SKIP_AT_ROOT.has(entry.name)) {
      console.log(`  skip (root collision guard): ${entry.name}`);
      continue;
    }
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyDir(srcPath, destPath, false);
    } else {
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  if (!(await exists(HUGO_OUT))) {
    console.error(`Hugo output not found at ${HUGO_OUT} — did "npm run build:hugo" run first?`);
    process.exit(1);
  }
  if (!(await exists(DIST))) {
    console.error(`Astro output not found at ${DIST} — did "npm run build:astro" run first?`);
    process.exit(1);
  }

  console.log(`Merging Hugo output (${HUGO_OUT}) into Astro output (${DIST})...`);
  await copyDir(HUGO_OUT, DIST, true);
  console.log("Merge complete.");
}

main();
