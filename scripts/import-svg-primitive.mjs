import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const libraryRoot = fileURLToPath(new URL("../assets/svg-primitives/", import.meta.url));
const metadataPath = path.join(libraryRoot, "metadata.json");
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const token = (value, label) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value ?? "")) throw new Error(`Invalid ${label}: ${value}`);
  return value;
};
const sourceToken = (value) => {
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(value ?? "")) throw new Error(`Invalid source ID: ${value}`);
  return value;
};

const unsafeSvg = () => new Error("SVG contains executable or remote content");
const localName = (name) => name.toLowerCase().split(":").at(-1);
const xmlName = /^[A-Za-z_][A-Za-z0-9_.:-]*/;

function decodeEntities(value) {
  let decoded = value;
  for (let pass = 0; pass < 8 && decoded.includes("&"); pass += 1) {
    const next = decoded.replace(/&(?:#([0-9]+)|#x([0-9a-f]+)|(amp|lt|gt|quot|apos));/gi, (match, decimal, hex, named) => {
      if (named) return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[named.toLowerCase()];
      const codepoint = Number.parseInt(decimal ?? hex, decimal ? 10 : 16);
      if (!Number.isSafeInteger(codepoint) || codepoint <= 0 || codepoint > 0x10ffff
        || (codepoint >= 0xd800 && codepoint <= 0xdfff)
        || (codepoint < 0x20 && ![0x09, 0x0a, 0x0d].includes(codepoint))) throw unsafeSvg();
      return String.fromCodePoint(codepoint);
    });
    if (next === decoded) break;
    decoded = next;
  }
  if (/&(?:#|[A-Za-z])/u.test(decoded)) throw unsafeSvg();
  return decoded;
}

function decodePercentTriplets(value) {
  let decoded = value;
  for (let pass = 0; pass < 8; pass += 1) {
    let changed = false;
    const next = decoded.replace(/(?:%[0-9a-f]{2})+/gi, (encoded) => {
      try {
        const replacement = decodeURIComponent(encoded);
        changed ||= replacement !== encoded;
        return replacement;
      } catch {
        throw unsafeSvg();
      }
    });
    decoded = next;
    if (!changed) break;
  }
  return decoded;
}

function decodeCssEscapes(value) {
  return value
    .replace(/\\([0-9a-f]{1,6})(?:\r\n|[\t\n\f\r ])?/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/\\(?:\r\n|[\n\r\f])/g, "")
    .replace(/\\(.)/gs, "$1");
}

function normalizedUri(value) {
  let normalized = decodeEntities(value);
  normalized = decodePercentTriplets(normalized);
  normalized = normalized.replace(/[\u0000-\u0020\u007f\s]+/gu, "").toLowerCase();
  return normalized;
}

function assertLocalReference(value) {
  const normalized = normalizedUri(value);
  if (!/^#[A-Za-z_][A-Za-z0-9_.:-]*$/u.test(normalized)) throw unsafeSvg();
}

function inspectCss(value) {
  let css = decodeEntities(value).replace(/\/\*[\s\S]*?\*\//g, "");
  css = decodePercentTriplets(decodeCssEscapes(css));
  const compact = css.replace(/[\u0000-\u0020\u007f\s]+/gu, "").toLowerCase();
  if (compact.includes("@import") || compact.includes("expression(") || compact.includes("javascript:") || compact.includes("data:")) {
    throw unsafeSvg();
  }
  const urls = css.matchAll(/url\s*\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi);
  for (const match of urls) assertLocalReference(match[1] ?? match[2] ?? match[3] ?? "");
}

function inspectSmil(element, attributes) {
  if (!["set", "animate", "animatetransform"].includes(element)) return;
  const target = normalizedUri(attributes.get("attributename") ?? "");
  if (["href", "xlink:href", "src", "style"].includes(target) || target.startsWith("on")) throw unsafeSvg();
  for (const name of ["to", "from", "by", "values"]) {
    if (!attributes.has(name)) continue;
    const value = attributes.get(name);
    for (const candidate of value.split(";")) {
      const probe = normalizedUri(candidate);
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/u.test(probe)) throw unsafeSvg();
    }
    inspectCss(value);
  }
}

function validateSvg(bytes) {
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/^\uFEFF/, "");
  } catch {
    throw new Error("SVG must be valid UTF-8 XML");
  }
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) throw unsafeSvg();

  let index = 0;
  let rootSeen = false;
  let rootClosed = false;
  let rootHasViewBox = false;
  const stack = [];
  const failStructure = () => { throw new Error("SVG must contain a well-formed <svg> root and viewBox"); };
  const skipSpace = () => { while (/\s/u.test(text[index] ?? "")) index += 1; };
  const readName = () => {
    const match = text.slice(index).match(xmlName);
    if (!match) failStructure();
    index += match[0].length;
    return match[0];
  };

  skipSpace();
  if (text.startsWith("<?xml", index)) {
    const declaration = text.slice(index).match(/^<\?xml\s+[^?]*\?>/u);
    if (!declaration) throw unsafeSvg();
    index += declaration[0].length;
  }

  while (index < text.length) {
    if (text[index] !== "<") {
      const end = text.indexOf("<", index);
      const segment = text.slice(index, end < 0 ? text.length : end);
      decodeEntities(segment);
      if (!stack.length && segment.trim()) failStructure();
      if (stack.at(-1)?.local === "style") stack.at(-1).style += segment;
      index = end < 0 ? text.length : end;
      continue;
    }

    if (text.startsWith("<!--", index)) {
      const end = text.indexOf("-->", index + 4);
      if (end < 0 || text.slice(index + 4, end).includes("--")) failStructure();
      index = end + 3;
      continue;
    }
    if (text.startsWith("<![CDATA[", index)) {
      if (!stack.length) failStructure();
      const end = text.indexOf("]]>", index + 9);
      if (end < 0) failStructure();
      if (stack.at(-1)?.local === "style") stack.at(-1).style += text.slice(index + 9, end);
      index = end + 3;
      continue;
    }
    if (text.startsWith("<!", index) || text.startsWith("<?", index)) throw unsafeSvg();

    if (text.startsWith("</", index)) {
      index += 2;
      const name = readName();
      skipSpace();
      if (text[index] !== ">") failStructure();
      index += 1;
      const opened = stack.pop();
      if (!opened || opened.name !== name) failStructure();
      if (opened.local === "style") inspectCss(opened.style);
      if (!stack.length) rootClosed = true;
      continue;
    }

    index += 1;
    const name = readName();
    const element = localName(name);
    if (stack.at(-1)?.local === "style") throw unsafeSvg();
    if (["script", "foreignobject", "iframe", "object", "embed", "audio", "video"].includes(element)) throw unsafeSvg();
    if (!stack.length && rootSeen) failStructure();

    const attributes = new Map();
    let hasExactViewBox = false;
    let selfClosing = false;
    while (index < text.length) {
      skipSpace();
      if (text.startsWith("/>", index)) {
        selfClosing = true;
        index += 2;
        break;
      }
      if (text[index] === ">") {
        index += 1;
        break;
      }
      const attributeName = readName();
      const normalizedName = attributeName.toLowerCase();
      if (attributes.has(normalizedName)) failStructure();
      if (normalizedName === "xml:base") throw unsafeSvg();
      if (attributeName === "viewBox") hasExactViewBox = true;
      skipSpace();
      if (text[index] !== "=") failStructure();
      index += 1;
      skipSpace();
      const quote = text[index];
      if (quote !== '"' && quote !== "'") failStructure();
      index += 1;
      const end = text.indexOf(quote, index);
      if (end < 0) failStructure();
      const rawValue = text.slice(index, end);
      if (rawValue.includes("<")) failStructure();
      attributes.set(normalizedName, decodeEntities(rawValue));
      index = end + 1;
    }

    if (!rootSeen) {
      if (element !== "svg") failStructure();
      rootSeen = true;
      rootHasViewBox = hasExactViewBox;
    }
    for (const [attribute, value] of attributes) {
      const attributeLocal = localName(attribute);
      if (attributeLocal.startsWith("on")) throw unsafeSvg();
      if (["href", "src"].includes(attributeLocal)) assertLocalReference(value);
      inspectCss(value);
    }
    inspectSmil(element, new Map([...attributes].map(([key, value]) => [localName(key), value])));

    const opened = { name, local: element, style: "" };
    if (selfClosing) {
      if (!stack.length) rootClosed = true;
    } else {
      stack.push(opened);
    }
  }

  if (!rootSeen || !rootClosed || stack.length || !rootHasViewBox) failStructure();
}

export function importSvgPrimitive({ sourceId, inputFile, id, roles }) {
  sourceToken(sourceId);
  token(id, "primitive ID");
  const normalizedRoles = [...new Set((roles ?? []).map((role) => token(role.trim(), "role")))].sort();
  if (!normalizedRoles.length) throw new Error("At least one semantic role is required");

  const input = path.resolve(inputFile ?? "");
  const stat = fs.lstatSync(input);
  if (!stat.isFile() || stat.isSymbolicLink() || path.extname(input).toLowerCase() !== ".svg") throw new Error("Input must be a regular .svg file");
  const bytes = fs.readFileSync(input);
  validateSvg(bytes);
  const sha256 = digest(bytes);

  const manifest = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  const source = manifest.sources?.find((entry) => entry.id === sourceId);
  if (!source) throw new Error(`Unknown SVG source: ${sourceId}`);
  if (!fs.existsSync(path.join(libraryRoot, source.licenseFile))) throw new Error(`Missing source license: ${source.licenseFile}`);

  const filename = path.basename(input);
  const relative = `${sourceId}/${filename}`;
  const allItems = manifest.sources.flatMap((entry) => entry.items);
  const existingId = allItems.find((item) => item.id === id);
  if (existingId) {
    if (existingId.path === relative && existingId.sha256 === sha256 && JSON.stringify([...existingId.roles].sort()) === JSON.stringify(normalizedRoles)) {
      return { status: "unchanged", sourceId, id, path: relative, sha256 };
    }
    throw new Error(`Primitive ID already exists with different content or metadata: ${id}`);
  }
  if (allItems.some((item) => item.path === relative)) throw new Error(`Primitive path already belongs to another ID: ${relative}`);

  const target = path.join(libraryRoot, sourceId, filename);
  let created = false;
  if (fs.existsSync(target)) {
    if (!fs.readFileSync(target).equals(bytes)) throw new Error(`Library file already differs: ${relative}`);
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes, { flag: "wx" });
    created = true;
  }

  const sourceAsset = `${source.intake.assetRoot.replace(/\/$/, "")}/${filename}`;
  source.items.push({ id, path: relative, sourceAsset, sha256, roles: normalizedRoles });
  source.items.sort((a, b) => a.id.localeCompare(b.id));
  const temporary = `${metadataPath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
    fs.renameSync(temporary, metadataPath);
  } catch (error) {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    if (created && fs.existsSync(target)) fs.unlinkSync(target);
    throw error;
  }
  return { status: "imported", sourceId, id, path: relative, sha256 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const value = (flag) => {
      const index = args.indexOf(flag);
      return index < 0 ? null : args[index + 1];
    };
    const roles = value("--roles")?.split(",").filter(Boolean) ?? [];
    const result = importSvgPrimitive({ sourceId: value("--source"), inputFile: value("--file"), id: value("--id"), roles });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
