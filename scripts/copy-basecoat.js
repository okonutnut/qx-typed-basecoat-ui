/**
 * copy-basecoat.js
 *
 * Copies all Basecoat UI source files, assets, and theme into a target
 * qx-typed project.  Reads file lists from basecoat-manifest.json.
 *
 * Usage:
 *   node scripts/copy-basecoat.js ../my-target-project
 */

const fs = require("fs");
const path = require("path");

const MANIFEST_FILE = path.join(__dirname, "..", "basecoat-manifest.json");
const SRC_ROOT = path.join(__dirname, "..");

// ---- helpers ----

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`  [skip] source directory not found: ${src}`);
    return;
  }
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else copyFile(s, d);
  }
}

function relativePath(absPath) {
  return path.relative(SRC_ROOT, absPath);
}

/**
 * Expand a simple glob pattern into absolute file paths.
 * Supports `dir/*.ts` patterns and exact paths.
 */
function expandGlob(pattern) {
  const starIndex = pattern.indexOf("*");
  if (starIndex === -1) {
    // Exact path
    if (fs.existsSync(pattern)) {
      const stat = fs.statSync(pattern);
      if (stat.isDirectory()) return [];
      return [pattern];
    }
    return [];
  }
  // `dir/*.ext` style
  const dirPart = pattern.substring(0, starIndex - 1);
  const ext = pattern.substring(starIndex + 1);
  if (!fs.existsSync(dirPart)) return [];
  const entries = fs.readdirSync(dirPart);
  return entries
    .filter((e) => e.endsWith(ext))
    .map((e) => path.join(dirPart, e))
    .filter((f) => fs.statSync(f).isFile());
}

// ---- main ----

function main() {
  const destRaw = process.argv[2];
  if (!destRaw) {
    console.error("Usage: node scripts/copy-basecoat.js <target-project-path>");
    process.exit(1);
  }

  const dest = path.resolve(destRaw);
  if (!fs.existsSync(dest)) {
    console.error(`Target does not exist: ${dest}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8"));

  // ---- 1. Copy source files ----
  const patternSet = new Set();
  for (const pattern of manifest.source) {
    const absPattern = path.join(SRC_ROOT, pattern);
    const matches = expandGlob(absPattern);
    for (const m of matches) patternSet.add(m);
  }

  for (const absFile of patternSet) {
    const rel = relativePath(absFile);
    const target = path.join(dest, rel);
    copyFile(absFile, target);
    console.log(`  source  ${rel}`);
  }

  // ---- 2. Copy assets ----
  for (const assetPattern of manifest.assets) {
    const absPath = path.join(SRC_ROOT, assetPattern);
    const rel = relativePath(absPath);
    const target = path.join(dest, rel);
    if (fs.statSync(absPath).isDirectory()) {
      copyDir(absPath, target);
      console.log(`  assets  ${rel}/`);
    } else {
      copyFile(absPath, target);
      console.log(`  assets  ${rel}`);
    }
  }

  // ---- 3. Copy theme ----
  if (manifest.theme) {
    const themeSrc = path.join(SRC_ROOT, manifest.theme);
    const themeDest = path.join(dest, manifest.theme);
    copyFile(themeSrc, themeDest);
    console.log(`  theme   ${manifest.theme}`);
  }

  // ---- 4. Patch tsconfig.json ----
  const tsconfigPath = path.join(dest, "tsconfig.json");
  if (fs.existsSync(tsconfigPath)) {
    let tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
    const entries = [
      "src/components/ui/**/*.ts",
      "src/components/InlineSvgIcon.ts",
      "src/app-colors.ts",
      "src/components/Layout.ts",
      "src/interfaces/**/*.ts",
      "src/types/custom-components.d.ts",
    ];
    if (!tsconfig.include) tsconfig.include = [];
    for (const entry of entries) {
      if (!tsconfig.include.includes(entry)) tsconfig.include.push(entry);
    }
    // Also ensure lib includes DOM (needed for InlineSvgIcon, etc.)
    if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
    const neededLibs = ["DOM", "ES2015"];
    if (!tsconfig.compilerOptions.lib) {
      tsconfig.compilerOptions.lib = neededLibs;
    } else {
      for (const lib of neededLibs) {
        if (!tsconfig.compilerOptions.lib.includes(lib))
          tsconfig.compilerOptions.lib.push(lib);
      }
    }
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + "\n");
    console.log(`  config  tsconfig.json (patched include/lib)`);
  }

  // ---- 5. Summary ----
  console.log("\n=== Basecoat UI copied successfully ===");
  console.log(`  Source: ${SRC_ROOT}`);
  console.log(`  Target: ${dest}`);
  console.log(`  Sources: ${patternSet.size} files`);
  console.log(`  Assets: ${manifest.assets.length} entries`);
  console.log("\nNext steps in the target project:");
  console.log(
    "  1. Add to index.html <head> (order matters):"
  );
  for (const req of manifest.htmlRequirements) {
    console.log(`     ${req}`);
  }
  console.log("  2. In your qooxdooMain(), set before use:");
  console.log(
    '     InlineSvgIcon.iconsBaseUrl = "resource/app/icons/";'
  );
  console.log("  3. Build: npx tsc");
  console.log(
    "  4. Start using: new BsButton(...), new MainLayout(...), etc."
  );
}

main();
