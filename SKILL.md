---
name: knowledge-mg
description: Turn Chinese plain or timestamped narration and per-frame image references into editable educational Motion Graphics projects for HyperFrames. Use for Chinese knowledge explainers, mechanism animations, teaching MG, or revisions to an existing HyperFrames explainer within the technical-preview release scope.
metadata:
  version: "0.1.0-preview.17"
---

# Knowledge MG

Create editable, deterministic educational Motion Graphics whose visual changes help the audience understand a mechanism, relationship, comparison, or process.

Requires Node.js and a working HyperFrames installation. Speech generation additionally requires the voice tool selected for the project.

## Start or resume

1. Read [release-scope.md](references/release-scope.md) before describing support or accepting a delivery target. Keep promises within its verified technical-preview boundary.
2. Read the project’s `AGENTS.md` and existing `BRIEF.md`, `SCRIPT.md`, `STORYBOARD.md`, `frame.md`, and `audio_meta.json` when present.
3. Read [input-contract.md](references/input-contract.md) before importing or confirming inputs. Resolve style and production mode there, enforce its model prerequisite, and ask once for only the decisions still missing. Write confirmed choices to `BRIEF.md` so downstream work does not interview the user again.
4. Read [visual-grammar.md](references/visual-grammar.md) when applying the confirmed production mode, references are supplied, a semantic graphic must be drawn, or scenes need composition planning. Read [svg-library.md](references/svg-library.md) before sourcing or adapting a reusable SVG object.
5. Read [style-contract.md](references/style-contract.md) when selecting, importing, or changing a `frame.md`.
6. Before confirming a new or changed visual direction, read the visual-direction checkpoint in [quality.md](references/quality.md). Keep technical, design-adherence, and art-direction outcomes independent.
7. Read [motion-direction.md](references/motion-direction.md) before planning or revising motion in any narrated or screen-text explainer, across all styles and both modes. When selecting reusable relationship components, also read [component-contract.md](references/component-contract.md) and the allowed/preferred set in `assets/components/collection.json`.
8. Read [asset-routing.md](references/asset-routing.md) when selecting text effects, transitions, charts, camera/focus primitives, treatments, external shot recipes or other reusable visual assets.
9. Use the `general-video` workflow and `hyperframes-core` composition contract for implementation. Reuse public HyperFrames capabilities before creating local code.

## Build

Write project prompts and storyboard directions as concise, positive, observable actions: name the subject, its change, and the intended reading or teaching result. Retain a negative constraint only for a demonstrated failure; keep each reusable rule in its linked authority rather than copying it into project prompts.

1. Preserve original text and media under `assets/source/`. Treat `SCRIPT.md` as the selected narration, not as permission to overwrite the source.
2. Normalize cues with `scripts/normalize-input.mjs`. Keep exactly one active timing source: generated voice, fixed source timing, or reference timing superseded by new audio.
3. Plan one teaching spine, then apply the beat-level focus and semantic coverage mapping in [visual-grammar.md](references/visual-grammar.md). Plan spatial relationships and the camera route in the same entries under [motion-direction.md](references/motion-direction.md). A continuing scene may contain several short explanatory beats; it is not one fixed illustration per narration segment.
4. Store the effective style in the project `frame.md`. Reference images guide only the scopes explicitly recorded in the relevant `STORYBOARD.md` frame. Before approving the storyboard visual plan, run the storyboard-keyframe checkpoint in [quality.md](references/quality.md) on rendered opening, main-mechanism, and conclusion keyframes. Prose, motif names, and planned object lists are not keyframe evidence; return upstream before building the full timeline when the rendered frames trigger a blocking observation.
5. Generate or retain audio, then map scene actions to actual cue windows, including the text beats and boundary handoffs specified in [motion-direction.md](references/motion-direction.md#storyboard-and-implementation). Never label averaged character timing as word-level alignment.
6. Build seek-safe HyperFrames sub-compositions with deterministic timelines, explicit semantic SVG groups, and clear handoff states.
7. Select components from `collection.json.allowed`; try `collection.json.preferred` first when more than one component fits. Also require metadata status `validated`, unless a candidate is explicitly accepted for the current test. A component ID must resolve to the implementation named in its metadata.
8. Classify supporting reusable assets before use and record their source and reason in the storyboard. Do not add text effects, transitions, charts, focus primitives or treatments to the relationship-component allow-list.
9. If assembled scenes exhibit cross-scene targeting, runtime leakage, or a blank natural endpoint, read [lessons.md](references/lessons.md) before changing selectors or visibility ownership.

## Validate and hand off

Run HyperFrames checks, inspect representative frames from the opening, mechanism, transition, and conclusion, and start Studio preview. Before the final-look preview, run the built-preview and final-decision checkpoints in [quality.md](references/quality.md) using a contact sheet and normal-speed playback evidence. Once the builder has inspected that evidence, record `revise` for every blocking failure or `ready_for_review` when none remain; do not invent a waiting status or ask the user to discover the failure first. Fix observed problems without adding unrelated rules or effects. Render only when the active HyperFrames workflow and the user’s authorization allow it.

A result is complete only when the project is editable, arbitrary-time seeking is correct, references are traceable to scenes, captions use honest timing, and the visible preview communicates the intended knowledge.
