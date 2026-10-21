# Voice contract

This file owns generated-narration setup and authentication behavior. Effective provider, voice, audio format, speaking rate, and pause defaults live only in [`assets/voice/azure-default.json`](../assets/voice/azure-default.json); tools and project records read those values instead of copying them.

## Default route

For `generated_voice`, synthesize each normalized cue with the configured Azure Speech voice by running [`scripts/azure-tts.mjs`](../scripts/azure-tts.mjs). The measured WAV duration becomes authoritative and the script writes one `audio_meta.json` record keyed by the original cue IDs. This route records segment precision.

Use the configured Azure provider and voice. If preflight or synthesis fails, report it and resume synthesis after the required setup is ready.

## User-owned authentication

Use the user’s existing Azure Speech setup. Before the first synthesis, run:

```bash
node <SKILL_DIR>/scripts/azure-tts.mjs --doctor
```

When preflight is not ready, ask the user to complete one of the following setups and resume after they confirm. Credentials are configured locally in the user’s Azure CLI session or environment.

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

The script obtains a short-lived token from the existing `az login` session for `https://cognitiveservices.azure.com/.default`. The token remains transient in memory.

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

`AZURE_SPEECH_KEY` is accepted as a compatibility alias. Read credentials from the local runtime environment; project artifacts store only voice identity and measured timing.

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

Use `generated_voice` for synthesis and `fixed` for existing/user-supplied audio.

The generated project record contains provider and voice identity, measured clip durations, cue placement, and segment timing precision. Selected narration stays in SCRIPT.md and authentication stays in the local runtime. Downstream storyboard and composition timing read only that project `audio_meta.json`.
