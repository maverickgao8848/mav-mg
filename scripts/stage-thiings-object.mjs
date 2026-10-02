import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const source = JSON.parse(fs.readFileSync(new URL("../assets/object-sources/thiings/source.json", import.meta.url), "utf8"));
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const token = (value) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value ?? "")) throw new Error(`Invalid semantic ID/role: ${value}`);
  return value;
};

export function stageThiingsObject({ inputFile, id, sourcePage, projectDirectory, roles, usage = "personal-noncommercial", licenseEvidence = null }) {
  token(id);
  const semanticRoles = [...new Set((roles ?? []).map(token))].sort();
  if (!semanticRoles.length) throw new Error("At least one semantic role is required");
  const url = new URL(sourcePage);
  if (url.protocol !== "https:" || url.hostname !== "www.thiings.co" || url.username || url.password || !/^\/things\/[^/]+\/?$/.test(url.pathname)) throw new Error("Use the official individual Thiings object page");
  if (!projectDirectory) throw new Error("Project directory is required");
  if (!["personal-noncommercial", "commercial"].includes(usage)) throw new Error("Invalid usage");
  if (usage === "commercial" && !licenseEvidence?.trim()) throw new Error("Commercial usage requires actual license evidence");
  if (!inputFile) throw new Error("Selected PNG file is required");
  const input = path.resolve(inputFile);
  const stat = fs.lstatSync(input);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("Input must be a regular PNG file");
  const bytes = fs.readFileSync(input);
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || bytes.toString("ascii", 12, 16) !== "IHDR") throw new Error("Invalid PNG header");
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20), colorType = bytes[25];
  if (!width || !height) throw new Error("Invalid PNG dimensions");
  let transparency = colorType === 4 || colorType === 6;
  let offset = 8, ended = false, imageData = false;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset), type = bytes.toString("ascii", offset + 4, offset + 8);
    if (offset + 12 + length > bytes.length) throw new Error("Truncated PNG");
    if (type === "tRNS") transparency = true;
    if (type === "IDAT") imageData = true;
    if (type === "IEND") { ended = true; break; }
    offset += length + 12;
  }
  if (!ended || !imageData) throw new Error("Incomplete PNG");
  if (!transparency) throw new Error("PNG needs alpha or tRNS for stage integration");

  fs.mkdirSync(projectDirectory, { recursive: true });
  const root = fs.realpathSync(projectDirectory);
  let directory = root;
  for (const segment of ["assets", "objects", "thiings"]) {
    directory = path.join(directory, segment);
    if (fs.existsSync(directory) && (fs.lstatSync(directory).isSymbolicLink() || !fs.statSync(directory).isDirectory())) throw new Error("Object destination must be a plain directory");
  }
  const target = path.join(directory, `${id}.png`), manifestPath = path.join(directory, "metadata.json");
  for (const file of [target, manifestPath]) {
    if (fs.existsSync(file) && (fs.lstatSync(file).isSymbolicLink() || !fs.statSync(file).isFile())) throw new Error("Object destination must contain regular files");
  }
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : { schemaVersion: 1, sourceId: source.id, items: [] };
  if (manifest.schemaVersion !== 1 || manifest.sourceId !== source.id || !Array.isArray(manifest.items)) throw new Error("Invalid project object manifest");
  const entry = {
    id, path: `assets/objects/thiings/${id}.png`, sourceId: source.id, category: "object", sourcePage: url.href,
    sha256: digest(bytes), bytes: bytes.length, width, height, alphaCapable: true,
    roles: semanticRoles, usage, licenseUrl: source.licenseUrl, licenseEvidence,
    attribution: usage === "personal-noncommercial" ? source.attribution : null,
  };
  const existing = manifest.items.find((item) => item.id === id);
  if (existing) {
    const { stagedOn, ...record } = existing;
    if (JSON.stringify(record) === JSON.stringify(entry) && fs.existsSync(target) && fs.readFileSync(target).equals(bytes)) return { status: "unchanged", ...existing };
    throw new Error(`Existing object differs; preserve and reconcile: ${id}`);
  }
  if (fs.existsSync(target)) throw new Error(`Unregistered object already exists: ${id}`);
  // Date is acquisition metadata only; no wall clock enters a rendered composition.
  entry.stagedOn = new Date().toISOString().slice(0, 10);
  manifest.items.push(entry);
  manifest.items.sort((a, b) => a.id.localeCompare(b.id));
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(target, bytes, { flag: "wx" });
  const temporary = `${manifestPath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
    fs.renameSync(temporary, manifestPath);
  } catch (error) {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    fs.unlinkSync(target);
    throw error;
  }
  return { status: "staged", ...entry };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), options = {};
    const allowed = new Set(["--file", "--id", "--source-page", "--project", "--roles", "--usage", "--license-evidence"]);
    for (let index = 0; index < args.length; index += 2) {
      if (!allowed.has(args[index]) || Object.hasOwn(options, args[index]) || !args[index + 1] || args[index + 1].startsWith("--")) throw new Error("Invalid staging arguments");
      options[args[index]] = args[index + 1];
    }
    console.log(JSON.stringify(stageThiingsObject({ inputFile: options["--file"], id: options["--id"], sourcePage: options["--source-page"], projectDirectory: options["--project"], roles: options["--roles"]?.split(","), usage: options["--usage"], licenseEvidence: options["--license-evidence"] }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
