import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const stylesRoot = fileURLToPath(new URL("../assets/styles/", import.meta.url));
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

function safeRelative(value) {
  if (typeof value !== "string" || !value || value.includes("\\") || value.includes(":") ||
      path.posix.isAbsolute(value) || value.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error(`Invalid style resource path: ${value}`);
  }
  return value;
}

function assertPlainPath(root, relative) {
  let current = root;
  for (const part of relative.split("/")) {
    current = path.join(current, part);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Linked resource path: ${relative}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return current;
}

export function applyStyle({ styleId, projectDirectory, productionMode = "standard" }) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(styleId ?? "")) throw new Error("A valid style ID is required");
  if (typeof projectDirectory !== "string" || !projectDirectory) throw new Error("Project directory is required");
  if (productionMode !== "standard" && productionMode !== "advanced") throw new Error("Production mode must be standard or advanced");
  const styleRoot = assertPlainPath(stylesRoot, styleId);
  const metadataPath = assertPlainPath(styleRoot, "metadata.json");
  const metadataBytes = fs.readFileSync(metadataPath);
  const metadata = JSON.parse(metadataBytes);
  if (metadata.schemaVersion !== 1 || metadata.id !== styleId || !Array.isArray(metadata.files)) {
    throw new Error("Invalid style metadata");
  }
  const names = metadata.files.map((entry) => safeRelative(entry.path));
  if (new Set(names).size !== names.length || !names.includes("FRAME.md") || names.includes("metadata.json")) {
    throw new Error("Style manifest must contain one FRAME.md and unique resource paths");
  }
  const advancedFiles = metadata.advancedFiles ?? [];
  if (!Array.isArray(advancedFiles)) throw new Error("Invalid advanced style resources");
  const advancedNames = advancedFiles.map((entry) => safeRelative(entry.path));
  if (new Set([...names, ...advancedNames]).size !== names.length + advancedNames.length ||
      advancedNames.some((name) => !name.startsWith("advanced-samples/"))) {
    throw new Error("Advanced style resources must have unique advanced-samples paths");
  }
  const verified = [...metadata.files, ...advancedFiles].map((entry) => {
    const bytes = fs.readFileSync(assertPlainPath(styleRoot, entry.path));
    if (digest(bytes) !== entry.sha256) throw new Error(`Style hash mismatch: ${entry.path}`);
    return { path: entry.path, bytes };
  });
  const selectedNames = productionMode === "advanced" && advancedFiles.length
    ? new Set(["FRAME.md", ...advancedNames])
    : new Set(names);
  const prepared = verified.filter((item) => selectedNames.has(item.path)).map((item) => {
    return {
      relative: item.path === "FRAME.md" ? "frame.md" : `assets/references/styles/${styleId}/${item.path}`,
      bytes: item.bytes,
    };
  });
  prepared.push({ relative: `assets/references/styles/${styleId}/metadata.json`, bytes: metadataBytes });

  // Validate the complete input before creating a project or writing any output.
  fs.mkdirSync(projectDirectory, { recursive: true });
  const projectRoot = fs.realpathSync(projectDirectory);
  if (advancedFiles.length) {
    const opposite = productionMode === "advanced" ? names.filter((name) => name !== "FRAME.md") : advancedNames;
    for (const name of opposite) {
      const relative = `assets/references/styles/${styleId}/${name}`;
      if (fs.existsSync(assertPlainPath(projectRoot, relative))) {
        throw new Error(`Other mode references already exist; reconcile before applying: ${relative}`);
      }
    }
  }
  const pending = [];
  for (const item of prepared) {
    const target = assertPlainPath(projectRoot, item.relative);
    if (fs.existsSync(target)) {
      if (!fs.statSync(target).isFile() || !fs.readFileSync(target).equals(item.bytes)) {
        throw new Error(`Existing project content differs; preserve and reconcile before applying: ${item.relative}`);
      }
    } else pending.push({ ...item, target });
  }
  const created = [];
  try {
    for (const item of pending) {
      fs.mkdirSync(path.dirname(item.target), { recursive: true });
      const fd = fs.openSync(item.target, "wx");
      created.push(item.target);
      try { fs.writeFileSync(fd, item.bytes); } finally { fs.closeSync(fd); }
    }
  } catch (error) {
    for (const target of created.reverse()) fs.unlinkSync(target);
    throw error;
  }
  return { styleId, status: pending.length ? "applied" : "unchanged", writtenFiles: pending.map((item) => item.relative) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if ((args.length !== 4 && args.length !== 6) || args[0] !== "--style" || args[2] !== "--project" ||
        (args.length === 6 && args[4] !== "--mode")) {
      throw new Error("Usage: node apply-style.mjs --style <id> --project <directory> [--mode standard|advanced]");
    }
    console.log(JSON.stringify(applyStyle({ styleId: args[1], projectDirectory: args[3], productionMode: args[5] ?? "standard" }), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
