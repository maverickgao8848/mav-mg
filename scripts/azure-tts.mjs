#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_PATH = path.resolve(SCRIPT_DIRECTORY, "../assets/voice/azure-default.json");
const TOKEN_SCOPE = "https://cognitiveservices.azure.com/.default";

function valueAfter(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
}

function round(value, places = 6) {
  return Number(value.toFixed(places));
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildSsml(text, config) {
  const language = escapeXml(config.language);
  const voice = escapeXml(config.voice);
  const rate = escapeXml(config.prosody_rate);
  return `<speak version="1.0" xml:lang="${language}"><voice name="${voice}"><prosody rate="${rate}">${escapeXml(text)}</prosody></voice></speak>`;
}

export function parseWaveDuration(bytes) {
  const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  if (buffer.length < 44 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("Azure Speech did not return a RIFF/WAVE file");
  }

  let byteRate = null;
  let dataSize = null;
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const body = offset + 8;
    if (body + size > buffer.length) throw new Error(`Invalid WAV chunk ${id}`);
    if (id === "fmt " && size >= 12) byteRate = buffer.readUInt32LE(body + 8);
    if (id === "data") dataSize = size;
    offset = body + size + (size % 2);
  }
  if (!byteRate || dataSize == null) throw new Error("WAV is missing fmt or data metadata");
  return dataSize / byteRate;
}

export function loadNarrationInput(inputPath) {
  const resolved = path.resolve(inputPath);
  const raw = fs.readFileSync(resolved, "utf8").replace(/^\uFEFF/u, "");
  const parsed = JSON.parse(raw);
  if ((parsed.timing_mode || "generated_voice") !== "generated_voice") {
    throw new Error("Azure synthesis accepts only generated_voice input; retain fixed source audio instead");
  }
  if (!Array.isArray(parsed.cues) || parsed.cues.length === 0) throw new Error("Narration input has no cues");
  const seen = new Set();
  return parsed.cues.map((cue, index) => {
    const id = String(cue.id || `cue-${String(index + 1).padStart(3, "0")}`);
    const text = String(cue.text || "").trim();
    if (!text) throw new Error(`Cue ${id} has no text`);
    if (seen.has(id)) throw new Error(`Duplicate cue id: ${id}`);
    seen.add(id);
    return { id, text };
  });
}

function loadConfig(configPath = DEFAULT_CONFIG_PATH) {
  const config = JSON.parse(fs.readFileSync(path.resolve(configPath), "utf8"));
  for (const key of ["provider", "voice", "language", "output_format", "prosody_rate"]) {
    if (!config[key]) throw new Error(`Voice config is missing ${key}`);
  }
  for (const key of ["leading_pause_s", "inter_cue_pause_s", "trailing_pause_s"]) {
    if (!Number.isFinite(config[key]) || config[key] < 0) throw new Error(`Voice config has invalid ${key}`);
  }
  return config;
}

function normalizedEndpoint(env) {
  const value = String(env.AZURE_SPEECH_ENDPOINT || "").trim().replace(/\/+$/u, "");
  if (!value) throw new Error("AZURE_SPEECH_ENDPOINT is not set");
  const endpoint = new URL(value);
  if (endpoint.protocol !== "https:") throw new Error("AZURE_SPEECH_ENDPOINT must use https");
  return endpoint.toString().replace(/\/+$/u, "");
}

function azureCliToken() {
  const result = spawnSync(
    "az",
    ["account", "get-access-token", "--scope", TOKEN_SCOPE, "--query", "accessToken", "-o", "tsv"],
    { encoding: "utf8", windowsHide: true },
  );
  if (result.error?.code === "ENOENT") throw new Error("Azure CLI is not installed; install it and run az login");
  if (result.status !== 0) {
    const detail = String(result.stderr || result.stdout || "").trim();
    throw new Error(`Azure CLI login is unavailable${detail ? `: ${detail}` : "; run az login"}`);
  }
  const token = result.stdout.trim();
  if (!token) throw new Error("Azure CLI returned an empty access token; run az login again");
  return token;
}

export function resolveAuthentication(env = process.env, getCliToken = azureCliToken) {
  const endpoint = normalizedEndpoint(env);
  const key = String(env.AZURE_SPEECH_API_KEY || env.AZURE_SPEECH_KEY || "").trim();
  if (key) return { endpoint, mode: "resource-key", headers: { "Ocp-Apim-Subscription-Key": key } };

  const resourceId = String(env.AZURE_SPEECH_RESOURCE_ID || "").trim();
  if (!resourceId) {
    throw new Error("Azure Speech is not authenticated: set AZURE_SPEECH_RESOURCE_ID after az login, or set AZURE_SPEECH_API_KEY");
  }
  const token = getCliToken();
  return {
    endpoint,
    mode: "azure-cli",
    headers: { Authorization: `Bearer aad#${resourceId}#${token}` },
  };
}

function safeFileStem(id) {
  const value = id.normalize("NFKC").replace(/[^A-Za-z0-9_-]+/gu, "-").replace(/^-+|-+$/gu, "");
  return value || "cue";
}

function assertUniqueStems(cues) {
  const stems = new Set();
  return cues.map((cue, index) => {
    const base = safeFileStem(cue.id);
    const stem = `${String(index + 1).padStart(3, "0")}-${base}`;
    if (stems.has(stem)) throw new Error(`Cue filenames collide at ${cue.id}`);
    stems.add(stem);
    return { ...cue, stem };
  });
}

function setupHelp() {
  return [
    "Azure Speech setup is required before narration generation.",
    "Recommended: create a Speech resource, assign Cognitive Services Speech User, run az login,",
    "then set AZURE_SPEECH_ENDPOINT and AZURE_SPEECH_RESOURCE_ID in your shell.",
    "Alternative: set AZURE_SPEECH_ENDPOINT and AZURE_SPEECH_API_KEY.",
    "Do not paste credentials into project files or chat.",
    "See references/voice-contract.md in the MAV-MG Skill.",
  ].join("\n");
}

export function doctor({ env = process.env, getCliToken = azureCliToken, configPath = DEFAULT_CONFIG_PATH } = {}) {
  const config = loadConfig(configPath);
  try {
    const auth = resolveAuthentication(env, getCliToken);
    return { ready: true, message: `ready: ${config.provider} ${config.voice} via ${auth.mode}` };
  } catch (error) {
    return { ready: false, message: `${error.message}\n${setupHelp()}` };
  }
}

export async function synthesizeNarration({
  inputPath,
  outDirectory,
  metaPath,
  configPath = DEFAULT_CONFIG_PATH,
  env = process.env,
  getCliToken = azureCliToken,
  fetchImpl = globalThis.fetch,
  force = false,
}) {
  if (typeof fetchImpl !== "function") throw new Error("This script requires Node.js 18 or newer with fetch support");
  const config = loadConfig(configPath);
  const auth = resolveAuthentication(env, getCliToken);
  const cues = assertUniqueStems(loadNarrationInput(inputPath));
  const outputRoot = path.resolve(outDirectory);
  const metadataPath = path.resolve(metaPath);
  fs.mkdirSync(outputRoot, { recursive: true });
  if (!force && fs.existsSync(metadataPath)) throw new Error(`Refusing to overwrite existing metadata: ${metadataPath}`);

  const voices = [];
  let cursor = config.leading_pause_s;
  for (const [index, cue] of cues.entries()) {
    const outputPath = path.join(outputRoot, `${cue.stem}.wav`);
    if (!force && fs.existsSync(outputPath)) throw new Error(`Refusing to overwrite existing audio: ${outputPath}`);
    const response = await fetchImpl(`${auth.endpoint}/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        ...auth.headers,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": config.output_format,
        "User-Agent": "mav-mg-azure-tts",
      },
      body: buildSsml(cue.text, config),
    });
    if (!response.ok) {
      const detail = (await response.text()).trim();
      throw new Error(`Azure Speech failed for ${cue.id}: HTTP ${response.status}${detail ? ` ${detail}` : ""}`);
    }
    const audio = Buffer.from(await response.arrayBuffer());
    const duration = round(parseWaveDuration(audio));
    const temporaryPath = `${outputPath}.tmp`;
    fs.writeFileSync(temporaryPath, audio);
    fs.renameSync(temporaryPath, outputPath);
    const start = round(cursor);
    const end = round(start + duration);
    voices.push({
      id: cue.id,
      path: path.relative(path.dirname(metadataPath), outputPath).split(path.sep).join("/"),
      start_s: start,
      duration_s: duration,
      end_s: end,
    });
    cursor = end + (index === cues.length - 1 ? config.trailing_pause_s : config.inter_cue_pause_s);
  }

  const totalVoiceDuration = round(voices.reduce((sum, voice) => sum + voice.duration_s, 0));
  const metadata = {
    schema_version: 1,
    timing_mode: "generated_voice",
    tts_provider: config.provider,
    voice_id: config.voice,
    language: config.language,
    prosody_rate: config.prosody_rate,
    auth_mode: auth.mode,
    timing_basis: "measured_segment_duration",
    caption_precision: "segment",
    leading_pause_s: config.leading_pause_s,
    inter_cue_pause_s: config.inter_cue_pause_s,
    trailing_pause_s: config.trailing_pause_s,
    total_voice_duration_s: totalVoiceDuration,
    composition_duration_s: round(cursor),
    voices,
    bgm: null,
    sfx: [],
  };
  const temporaryMetaPath = `${metadataPath}.tmp`;
  fs.mkdirSync(path.dirname(metadataPath), { recursive: true });
  fs.writeFileSync(temporaryMetaPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  fs.renameSync(temporaryMetaPath, metadataPath);
  return metadata;
}

async function main() {
  const args = process.argv.slice(2);
  const configPath = valueAfter(args, "--config") || DEFAULT_CONFIG_PATH;
  if (args.includes("--doctor")) {
    const result = doctor({ configPath });
    (result.ready ? process.stdout : process.stderr).write(`${result.message}\n`);
    process.exitCode = result.ready ? 0 : 2;
    return;
  }

  const inputPath = valueAfter(args, "--input") || args.find((arg) => !arg.startsWith("--"));
  if (!inputPath) {
    throw new Error("Usage: node azure-tts.mjs --input <normalized-input.json> [--out-dir assets/voice] [--meta audio_meta.json] [--force]");
  }
  const metadata = await synthesizeNarration({
    inputPath,
    outDirectory: valueAfter(args, "--out-dir") || "assets/voice",
    metaPath: valueAfter(args, "--meta") || "audio_meta.json",
    configPath,
    force: args.includes("--force"),
  });
  process.stdout.write(`${JSON.stringify({
    provider: metadata.tts_provider,
    voice: metadata.voice_id,
    cues: metadata.voices.length,
    duration_s: metadata.composition_duration_s,
    timing_precision: metadata.caption_precision,
  })}\n`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
