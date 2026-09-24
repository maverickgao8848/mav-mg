# Input contract

## One entry confirmation

At the start of a new production or a materially changed request, summarize the known specification once:

- audience and the one thing they should understand;
- destination, aspect ratio, and target length;
- source-text handling, voice choice, and timing mode;
- current style, allowed component set, and supplied scene references;
- captions, deliverables, and desired review points.

Ask only about missing decisions that change the result. For an existing project, read and reuse confirmed values. A user instruction to keep the previous specification and proceed is confirmation. Internal building, checking, and repair do not restart the interview.

## Style and production mode

For a new project, resolve these two choices in order: select the visual style first, then select `production_mode: standard | advanced`. Reuse an explicit choice already present in the request or project `BRIEF.md`; ask only for a missing choice. A style may recommend one mode, but both modes remain selectable unless the user gives a project-specific restriction.

Record the selected style identity and `production_mode` in `BRIEF.md`. Keep effective color, typography and material rules only in `frame.md`, and keep beat-level protagonists, SVG roles and custom graphics only in `STORYBOARD.md`. The mode selects a production strategy from [visual-grammar.md](visual-grammar.md); it does not create a second style source, motion contract, quality gate or HyperFrames implementation path.

`standard` permits an economical execution model. `advanced` requires a runtime-confirmed GPT-6 model before creative planning or production begins. Confirm the active model from host-provided model identity or configuration, and record that observed identity in `BRIEF.md`; a user request, model self-description or desired model name is not verification. If GPT-6 cannot be verified or selected, report the unmet prerequisite and pause advanced production. Do not claim a model switch, silently continue as `standard`, or label non-GPT-6 work as advanced.

## Preserve sources

Copy or reference user inputs under `assets/source/`; never overwrite them. A selected narration belongs in `SCRIPT.md`. A derived cue file records its source path and precision.

## Timing modes

Each project has one active timing mode:

- `generated_voice`: plain text or an article becomes selected narration; generated audio duration becomes authoritative.
- `fixed`: source audio/video timing is authoritative. Keep cue positions and fit visuals inside them.
- `reference`: supplied timestamps explain the old structure but may be superseded by newly generated audio. Once new audio exists, it is the only active timing source.

Use seconds internally. Give every cue a stable ID. Record `start`, `end`, `text`, source, and precision when available. Word timing exists only when supplied by a trusted source or obtained through alignment; otherwise declare segment precision.

If fixed windows cannot hold the narration or required explanation, reduce secondary motion first and report the remaining conflict. Do not silently accelerate speech, drop qualifications, or move fixed cues.

## Duration limit decision

The finished timeline is limited to 300 seconds, including the opening, pauses, transitions, and ending. Normalize every input before production and read `duration_assessment`. Timed input uses the latest cue end; untimed narration uses a planning estimate of four spoken units per second, where each Han character and each non-Han word or number token counts as one unit. Generated audio remains authoritative once it exists, so reassess against its real duration before building the final timeline.

When `over_limit` is true, return the explicit `refine_or_split` decision and present both supplied suggestions: refine secondary explanation while preserving conclusions and qualifications, or split at stable cue IDs so each episode can fit. Keep every source cue and its final segment in the normalized record while the user decides; never implement the limit by truncating text.

## Normalized record

`scripts/normalize-input.mjs` produces:

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

This record is an adapter input, not a second editable timeline. Once `audio_meta.json` exists, downstream scene timing reads it.
