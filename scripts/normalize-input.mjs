import { readFileSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";

const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
};
const inputArg = valueAfter("--input") || args.find((arg) => !arg.startsWith("--"));
const outputArg = valueAfter("--out");
if (!inputArg) throw new Error("Usage: node normalize-input.mjs --input <file> [--out <file>]");

const inputPath = resolve(inputArg);
const extension = extname(inputPath).toLowerCase();
const raw = readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "");
const MAX_DURATION_SECONDS = 300;
const ESTIMATED_SPOKEN_UNITS_PER_SECOND = 4;

const asCue = (cue, index) => {
  const normalized = {
    id: String(cue.id || `cue-${String(index + 1).padStart(3, "0")}`),
    start: cue.start == null ? null : Number(cue.start),
    end: cue.end == null ? null : Number(cue.end),
    text: String(cue.text || "").trim(),
  };
  const title = String(cue.title || "").trim();
  if (title) normalized.title = title;
  return normalized;
};

const countSpokenUnits = (text) => {
  const hanCount = [...text.matchAll(/\p{Script=Han}/gu)].length;
  const nonHanText = text.replace(/\p{Script=Han}/gu, " ");
  const wordCount = [...nonHanText.matchAll(/[\p{L}\p{N}]+/gu)].length;
  return hanCount + wordCount;
};

let timingMode = "generated_voice";
let sourceType = "text";
let cues;

if (extension === ".json") {
  const parsed = JSON.parse(raw);
  timingMode = parsed.timing_mode || parsed.timingMode || "generated_voice";
  sourceType = parsed.source_type || "timestamped-text";
  cues = (parsed.cues || []).map(asCue);
} else {
  cues = raw.split(/\r?\n+/).map((text) => text.trim()).filter(Boolean).map((text, index) => asCue({ text }, index));
}

if (!["generated_voice", "fixed", "reference"].includes(timingMode)) throw new Error(`Unsupported timing mode: ${timingMode}`);
if (!cues.length) throw new Error("No cues found");
for (const cue of cues) {
  if (!cue.text) throw new Error(`Cue ${cue.id} has no text`);
  if ((cue.start == null) !== (cue.end == null)) throw new Error(`Cue ${cue.id} must provide both start and end`);
  if (cue.start != null && (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < 0 || cue.end <= cue.start)) throw new Error(`Cue ${cue.id} has an invalid time range`);
  if (timingMode === "fixed" && cue.start == null) throw new Error(`Fixed timing requires start/end for ${cue.id}`);
}
for (let i = 1; i < cues.length; i += 1) {
  if (cues[i].start != null && cues[i - 1].start != null && cues[i].start < cues[i - 1].start) throw new Error(`Cue order regresses at ${cues[i].id}`);
}

const hasTiming = cues.every((cue) => cue.start != null);
const assessedSeconds = hasTiming
  ? Math.max(...cues.map((cue) => cue.end))
  : Math.ceil(cues.reduce((total, cue) => total + countSpokenUnits(cue.text), 0) / ESTIMATED_SPOKEN_UNITS_PER_SECOND);
const overLimit = assessedSeconds > MAX_DURATION_SECONDS;
const durationAssessment = {
  limit_seconds: MAX_DURATION_SECONDS,
  basis: hasTiming
    ? (timingMode === "fixed" ? "fixed_cue_end" : "reference_cue_end")
    : "estimated_narration",
  assessed_seconds: assessedSeconds,
  over_limit: overLimit,
  decision: overLimit ? "refine_or_split" : "proceed",
  text_preserved: true,
};
if (!hasTiming) durationAssessment.estimate_rate_spoken_units_per_second = ESTIMATED_SPOKEN_UNITS_PER_SECOND;
if (overLimit) {
  durationAssessment.suggestions = [
    { action: "refine", detail: "精简次要说明，同时保留结论、限定条件和来源文本。" },
    { action: "split", detail: "按稳定 cue ID 分集，并让每集各自满足 300 秒上限。" },
  ];
}
const result = {
  version: 1,
  timing_mode: timingMode,
  timing_precision: hasTiming ? "segment" : "none",
  source: { path: inputArg.replaceAll("\\", "/"), type: sourceType },
  duration_assessment: durationAssessment,
  cues,
};
const json = `${JSON.stringify(result, null, 2)}\n`;
if (outputArg) writeFileSync(resolve(outputArg), json, "utf8");
else process.stdout.write(json);
