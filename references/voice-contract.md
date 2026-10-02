# Voice contract

This file owns generated-narration setup and authentication behavior. Effective provider, voice, audio format, speaking rate, and pause defaults live only in [`assets/voice/azure-default.json`](../assets/voice/azure-default.json); tools and project records read those values instead of copying them.

## Default route

For `generated_voice`, synthesize each normalized cue with the configured Azure Speech voice by running [`scripts/azure-tts.mjs`](../scripts/azure-tts.mjs). The measured WAV duration becomes authoritative and the script writes one `audio_meta.json` record keyed by the original cue IDs. This route records segment precision; it does not claim word alignment.

Keep Azure as the only automatic provider. If authentication or synthesis fails, report the failing preflight and pause voice generation. Do not silently substitute Kokoro, Edge TTS, another Azure voice, or estimated timings.

## User-owned authentication

The distributed Skill contains no credential and does not create an Azure resource. Before the first synthesis, run:

```bash
node <SKILL_DIR>/scripts/azure-tts.mjs --doctor
```

When preflight is not ready, ask the user to complete one of the following setups and resume after they confirm. Do not ask them to paste a secret into chat, a project file, or `BRIEF.md`.

### Personal sign-in with Azure CLI

This is the preferred path for an individual author because the credential remains in the user's Azure CLI session.

1. Create an Azure Speech resource in the user's own subscription and select the Free F0 tier when eligible.
2. Assign the signed-in identity the `Cognitive Services Speech User` role on that resource.
3. Install Azure CLI and run `az login` themselves.
4. Expose the resource endpoint and full resource ID to the current shell:

PowerShell:

```powershell
$env:AZURE_SPEECH_ENDPOINT="https://<resource-name>.cognitiveservices.azure.com"
$env:AZURE_SPEECH_RESOURCE_ID="/subscriptions/<subscription-id>/resourceGroups/<group>/providers/Microsoft.CognitiveServices/accounts/<resource-name>"
```

Bash:

```bash
export AZURE_SPEECH_ENDPOINT="https://<resource-name>.cognitiveservices.azure.com"
export AZURE_SPEECH_RESOURCE_ID="/subscriptions/<subscription-id>/resourceGroups/<group>/providers/Microsoft.CognitiveServices/accounts/<resource-name>"
```

The script obtains a short-lived token from the existing `az login` session for `https://cognitiveservices.azure.com/.default`. It never saves that token.

### Speech resource key

Users who prefer key authentication set the resource endpoint and key in their own environment:

PowerShell:

```powershell
$env:AZURE_SPEECH_ENDPOINT="https://<resource-name>.cognitiveservices.azure.com"
$env:AZURE_SPEECH_API_KEY="<speech-resource-key>"
```

Bash:

```bash
export AZURE_SPEECH_ENDPOINT="https://<resource-name>.cognitiveservices.azure.com"
export AZURE_SPEECH_API_KEY="<speech-resource-key>"
```

`AZURE_SPEECH_KEY` is accepted as a compatibility alias. Environment variables are runtime configuration, not project inputs: never copy them into source assets, generated metadata, logs, or a release package.

Azure setup references:

- https://learn.microsoft.com/azure/ai-services/speech-service/rest-text-to-speech
- https://learn.microsoft.com/azure/ai-services/speech-service/how-to-configure-azure-ad-auth

## Generate narration

Normalize the selected narration first, then synthesize it:

```bash
node <SKILL_DIR>/scripts/normalize-input.mjs --input SCRIPT.md --out normalized-input.json
node <SKILL_DIR>/scripts/azure-tts.mjs \
  --input normalized-input.json \
  --out-dir assets/voice \
  --meta audio_meta.json
```

The input must use `generated_voice`. Existing or user-supplied audio stays on the `fixed` route and is not sent to Azure.

The generated project record contains provider and voice identity, measured clip durations, cue placement, and segment timing precision. It contains no editable narration text and no authentication material. Downstream storyboard and composition timing read only that project `audio_meta.json`.
