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

export function applyStyle(options) {
  const optionNames = new Set(["styleId", "projectDirectory", "typographyVariant"]);
  for (const key of Object.keys(options)) {
    if (!optionNames.has(key)) throw new Error(`Unknown style option: ${key}`);
  }
  const { styleId, projectDirectory } = options;
  let { typographyVariant } = options;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(styleId ?? "")) throw new Error("A valid style ID is required");
  if (typeof projectDirectory !== "string" || !projectDirectory) throw new Error("Project directory is required");
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
  const verified = metadata.files.map((entry) => {
    const bytes = fs.readFileSync(assertPlainPath(styleRoot, entry.path));
    if (digest(bytes) !== entry.sha256) throw new Error(`Style hash mismatch: ${entry.path}`);
    return { path: entry.path, bytes };
  });
  const variants = metadata.typographyVariants;
  let variant;
  if (variants) {
    typographyVariant ??= metadata.selection?.approvedDefault;
    variant = Object.hasOwn(variants, typographyVariant ?? "") ? variants[typographyVariant] : null;
    if (!variant) throw new Error(`Choose --variant ${Object.keys(variants).join("|")}; no valid selected variant or approved default`);
    const source = verified.find((item) => item.path === safeRelative(variant.file));
    const frame = verified.find((item) => item.path === "FRAME.md");
    const marker = "{{TYPOGRAPHY_VARIANT}}";
    if (!source || frame.bytes.toString("utf8").split(marker).length !== 2) throw new Error("Invalid typography variant resources");
    frame.bytes = Buffer.from(frame.bytes.toString("utf8").replace(marker, () => source.bytes.toString("utf8").trim()));
  } else if (typographyVariant !== undefined) throw new Error("This style has no typography variants");
  const selectedNames = new Set(names);
  const prepared = verified.map((item) => {
    return {
      relative: item.path === "FRAME.md" ? "frame.md" : `assets/references/styles/${styleId}/${item.path}`,
      bytes: item.bytes,
    };
  });
  prepared.push({ relative: `assets/references/styles/${styleId}/metadata.json`, bytes: metadataBytes });
  // Runtime-bearing styles declare their portable dependency closure. Children
  // can inherit this frame without the style pack or another editorial Skill.
  if (metadata.frameResources !== undefined) {
    if (!Array.isArray(metadata.frameResources) || !metadata.frameResources.length ||
        new Set(metadata.frameResources).size !== metadata.frameResources.length) {
      throw new Error("Invalid portable frame resources");
    }
    const resources = metadata.frameResources.map((name) => {
      safeRelative(name);
      if (name === "FRAME.md" || !selectedNames.has(name)) {
        throw new Error(`Portable frame resource is not selected: ${name}`);
      }
      const item = prepared.find((file) => file.relative === `assets/references/styles/${styleId}/${name}`);
      if (!item) throw new Error(`Portable frame resource is not selected: ${name}`);
      return { path: item.relative, sha256: digest(item.bytes) };
    });
    const manifest = prepared.find((item) => item.relative.endsWith("/metadata.json"));
    resources.push({ path: manifest.relative, sha256: digest(manifest.bytes) });
    prepared.push({ relative: "frame-resources.json", bytes: Buffer.from(JSON.stringify({ styleId, resources }, null, 2) + "\n") });
  }
  if (variant) prepared.push({
    relative: `assets/references/styles/${styleId}/selection.json`,
    bytes: Buffer.from(`${JSON.stringify({ styleId, revision: metadata.revision, typographyVariant, sourceFrameSha256: metadata.files.find((item) => item.path === "FRAME.md").sha256, effectiveFrameSha256: digest(verified.find((item) => item.path === "FRAME.md").bytes) }, null, 2)}\n`),
  });

  // Validate the complete input before creating a project or writing any output.
  fs.mkdirSync(projectDirectory, { recursive: true });
  const projectRoot = fs.realpathSync(projectDirectory);
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
  return { styleId, ...(variant ? { typographyVariant } : {}), status: pending.length ? "applied" : "unchanged", writtenFiles: pending.map((item) => item.relative) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const options = {};
    const allowed = new Set(["--style", "--project", "--variant"]);
    for (let index = 0; index < args.length; index += 2) {
      const key = args[index];
      if (!allowed.has(key) || Object.hasOwn(options, key) || !args[index + 1] || args[index + 1].startsWith("--")) {
        throw new Error("Usage: node apply-style.mjs --style <id> --project <directory> [--variant <id>]");
      }
      options[key] = args[index + 1];
    }
    console.log(JSON.stringify(applyStyle({ styleId: options["--style"], projectDirectory: options["--project"], typographyVariant: options["--variant"] }), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
