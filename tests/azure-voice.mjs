import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildSsml,
  doctor,
  parseWaveDuration,
  resolveAuthentication,
  synthesizeNarration,
} from "../scripts/azure-tts.mjs";

const root = path.resolve(import.meta.dirname, "..");
const skill = root;
const configPath = path.join(skill, "assets", "voice", "azure-default.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

function wave(seconds, sampleRate = 24_000) {
  const channels = 1;
  const bits = 16;
  const byteRate = sampleRate * channels * bits / 8;
  const dataSize = Math.round(seconds * byteRate);
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(channels * bits / 8, 32);
  buffer.writeUInt16LE(bits, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataSize, 40);
  return buffer;
}

test("Azure Xiaoxiao is the single configured generated-voice default", () => {
  assert.equal(config.provider, "azure-speech");
  assert.equal(config.voice, "zh-CN-XiaoxiaoNeural");
  assert.equal(config.language, "zh-CN");
  const scope = fs.readFileSync(path.join(skill, "references", "release-scope.md"), "utf8");
  const contract = fs.readFileSync(path.join(skill, "references", "voice-contract.md"), "utf8");
  const inputContract = fs.readFileSync(path.join(skill, "references", "input-contract.md"), "utf8");
  assert.match(scope, /voice-contract\.md/);
  assert.match(contract, /azure-default\.json/);
  assert.match(contract, /Do not silently substitute Kokoro/iu);
  assert.match(inputContract, /configured choice in \[voice-contract\.md\]/u);
  assert.match(inputContract, /already confirmed unless the user explicitly requests a different voice/u);
});

test("SSML escapes narration and WAV duration is measured from file metadata", () => {
  const ssml = buildSsml('温度 < 4°C & "稳定"', config);
  assert.match(ssml, /zh-CN-XiaoxiaoNeural/);
  assert.match(ssml, /温度 &lt; 4°C &amp; &quot;稳定&quot;/);
  assert.equal(parseWaveDuration(wave(1.25)), 1.25);
});

test("authentication accepts a user-owned key or Azure CLI token without persisting either", () => {
  const endpoint = "https://example.cognitiveservices.azure.com";
  const keyed = resolveAuthentication({ AZURE_SPEECH_ENDPOINT: endpoint, AZURE_SPEECH_API_KEY: "secret" });
  assert.equal(keyed.mode, "resource-key");
  assert.equal(keyed.headers["Ocp-Apim-Subscription-Key"], "secret");
  const cli = resolveAuthentication(
    { AZURE_SPEECH_ENDPOINT: endpoint, AZURE_SPEECH_RESOURCE_ID: "/subscriptions/s/resourceGroups/g/providers/Microsoft.CognitiveServices/accounts/a" },
    () => "short-lived-token",
  );
  assert.equal(cli.mode, "azure-cli");
  assert.match(cli.headers.Authorization, /^Bearer aad#.*#short-lived-token$/);
});

test("doctor pauses with actionable setup instead of falling back", () => {
  const result = doctor({ env: {}, configPath });
  assert.equal(result.ready, false);
  assert.match(result.message, /AZURE_SPEECH_ENDPOINT/);
  assert.match(result.message, /az login/);
  assert.match(result.message, /Do not paste credentials/);
});

test("synthesis writes measured segment timing and excludes text and credentials from audio_meta", async () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "mav-mg-azure-"));
  try {
    const input = path.join(temporary, "normalized.json");
    const outDirectory = path.join(temporary, "assets", "voice");
    const metaPath = path.join(temporary, "audio_meta.json");
    fs.writeFileSync(input, JSON.stringify({
      timing_mode: "generated_voice",
      cues: [
        { id: "intro", text: "第一句。" },
        { id: "mechanism", text: "第二句。" },
      ],
    }));
    const durations = [1.25, 2.5];
    let requestIndex = 0;
    const metadata = await synthesizeNarration({
      inputPath: input,
      outDirectory,
      metaPath,
      configPath,
      env: { AZURE_SPEECH_ENDPOINT: "https://example.cognitiveservices.azure.com", AZURE_SPEECH_API_KEY: "do-not-persist" },
      fetchImpl: async (_url, request) => {
        assert.match(request.body, /zh-CN-XiaoxiaoNeural/);
        const audio = wave(durations[requestIndex++]);
        return { ok: true, status: 200, arrayBuffer: async () => audio };
      },
    });
    assert.equal(metadata.caption_precision, "segment");
    assert.equal(metadata.voices[0].start_s, config.leading_pause_s);
    assert.equal(metadata.voices[0].duration_s, 1.25);
    assert.equal(metadata.voices[1].start_s, 1.25 + config.leading_pause_s + config.inter_cue_pause_s);
    assert.equal(metadata.composition_duration_s, 1.25 + 2.5 + config.leading_pause_s + config.inter_cue_pause_s + config.trailing_pause_s);
    const serialized = fs.readFileSync(metaPath, "utf8");
    assert.doesNotMatch(serialized, /第一句|第二句|do-not-persist/);
    assert.ok(fs.existsSync(path.join(outDirectory, "001-intro.wav")));
    assert.ok(fs.existsSync(path.join(outDirectory, "002-mechanism.wav")));
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
