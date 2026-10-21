# Input contract

## Confirm effective inputs

For a new or materially changed production, reuse known decisions and ask only for missing choices affecting the result: audience and teaching goal; destination, duration and aspect ratio; source-text handling, narration and timing; style and references; captions and deliverables. Record confirmed choices in `BRIEF.md`.

Resolve style through [upstream-frame.md](upstream-frame.md): explicit user choice, existing project frame, nearest upstream frame for a new child, then the default choice in [style-contract.md](style-contract.md). The production approach is defined in [visual-grammar.md](visual-grammar.md).

Record `object_source: pixel2all` on its own line and follow [object-library.md](object-library.md). Store the effective visual system in `frame.md` and beat-specific content in `STORYBOARD.md`.

## Sources and timing

Preserve user inputs under `assets/source/`; selected narration belongs in `SCRIPT.md`. Derived cue records identify the source and timing precision.

Each project has one active timing authority:

- `generated_voice`: selected narration is synthesized under [voice-contract.md](voice-contract.md); measured audio duration becomes authoritative.
- `fixed`: supplied audio/video and its cue positions remain authoritative; fit the explanation within those windows.
- `reference`: supplied timestamps describe the reference structure; newly generated audio supersedes them when adopted.

Use seconds and stable cue IDs. Record start, end, text, source and precision where available. Trusted word timestamps or alignment support word precision; synthesis segments and duration estimates use segment or planning precision. A fixed window that remains too short after reducing secondary motion requires a content/timing decision from the user.

## Duration assessment

The supported engineering timeline is 300 seconds, including pauses and transitions. `scripts/normalize-input.mjs` assesses timed input by latest cue end; untimed narration uses four spoken units per second, counting each Han character and each non-Han word or number token as one unit. Reassess generated narration against measured audio.

When `over_limit` is true, present `refine_or_split`: refine secondary explanation while retaining conclusions and qualifications, or split at stable cue IDs. Preserve the complete source and proposed episode mapping while the user decides.

## Normalized record

```json
{
  "version": 1,
  "timing_mode": "generated_voice",
  "timing_precision": "none",
  "source": { "path": "...", "type": "text" },
  "duration_assessment": {
    "limit_seconds": 300,
    "basis": "estimated_narration",
    "assessed_seconds": 42,
    "over_limit": false,
    "decision": "proceed",
    "text_preserved": true,
    "estimate_rate_spoken_units_per_second": 4
  },
  "cues": [{ "id": "cue-001", "start": null, "end": null, "text": "..." }]
}
```

This is the input adapter record. Once adopted audio exists, downstream scenes read `audio_meta.json` for timing.
