# Art-direction quality gate

This file owns visual review in Xiangsu MG. Record technical validity, style adherence and artistic judgment separately.

```yaml
technical: not_reviewed | revise | pass
design_adherence: not_reviewed | revise | pass
art_direction: not_reviewed | revise | ready_for_review | recommended | approved | accepted_with_deficit
```

## Review checkpoints

### Visual direction

For a new or changed direction, inspect subject, world, eye path, typography, color and material together. A visual premise or metaphor is an optional way to develop that direction. When adopted, judge how it appears in the actual frame. Existing directions can retain their established visual logic.

### Storyboard keyframes

For inherited styles, run `node scripts/inherit-frame.mjs --project <project> --check`. Compare the rendered background, typography, palette and material with the adopted reference and record its frame hash. Compile inline CSS from frozen resources where the renderer requires it.

Complete the selected-source object preflight in [object-library.md](object-library.md): intent-led discovery, inspected candidate comparisons, staged images and planned use, or object-specific exceptions. Inspect rendered states, then run `node scripts/verify-thiings-review.mjs --project <project> --stage keyframes`.

Render focal states for the opening, distinct causal stages, central risk/failure and conclusion. Inspect at output size and thumbnail size beside adopted style references. Save them under `snapshots/keyframes/` and record findings plus `storyboard_keyframes: ready_for_review | revise` in `ART-REVIEW.md` before constructing the finished timeline.

When an unresolved transformation, contact, operation or handoff could cause substantial rework, preview its complete semantic unit with the active timing source and adopted narration. Include cause, main change, result, reading and onward handoff where applicable. Preserve the target's form, text size and key relationships closely enough to judge them. A multi-beat spatial route can share this draft; use its intended rig and inspect departure, passage, landing and focus transfer.

Reuse existing process evidence when version, interval, behavior, material, timing and reading conditions remain applicable. Record that reuse in the same storyboard/review entry and confirm the adaptation in the first complete preview.

### Built preview

Complete a playable preview across the adopted cue range before fine polish. Inspect a contact sheet and watch mechanism/transition ranges at normal speed. Reconcile storyboard promises with rendered behavior. Fix implementation defects in the source; revise the storyboard or frame when the weakness belongs to the plan.

Technical review includes CLI checks, natural playback through exact completion and a reverse seek. Keep screenshots of the last valid frame, natural stopped state and reverse-seek result. Log actual playback/seek times.

### Final decision

The builder records `revise` for observed blocking problems, `not_reviewed` for missing review evidence, or `ready_for_review` after resolving blockers and inspecting required evidence. An independent reviewer may record `recommended`. The user or an explicitly named delegate records `approved`, or `accepted_with_deficit` with the accepted weakness and their words. Bind the decision to the reviewed version.

## Evidence probes

Use the semantic mapping in `STORYBOARD.md` as the review index. At keyframes inspect focal states; at built preview inspect the corresponding normal-speed ranges.

| Probe | Observable result |
|---|---|
| Object selection | The selected entity/state makes the beat legible compared with inspected alternatives; recent reuse serves continuity or the current explanation. Missing metadata matches prompt query expansion, not an unsupported claim of no suitable metaphor |
| Teaching emphasis | Important questions/principles/conclusions receive a readable focus, with a visible handoff into their explanation |
| Mechanism legibility | The relevant part, interface, state change or relationship supplies the causal evidence, supported by concise necessary labels |
| Subject finish | Contours, internal detail, scale and typography meet the explanatory responsibility and adopted reference scope |
| Explanatory progression | Each changed view or purposeful hold contributes to understanding; a shared process can cover several sentences |
| Text and spatial continuity | Rendered actors, channels, path direction, focus, grouping and detail match the planned handoff and reading window; new text, landmarks and revisits behave as authored |

Cite actual files/times, visible findings, severity and disposition. A missing or unreadable planned mechanism, focus or route is a blocking observation. The receiving reviewer inspects the evidence before endorsing it.

## Seven observation areas

| Area | Observable result |
|---|---|
| Concept visibility | The current teaching idea is evident; an adopted visual premise is expressed in the frame |
| Hierarchy and space | A primary focus leads to meaningful secondary information through scale, placement, depth and negative space |
| Subject-specific form | Diagram, environment and metaphor preserve the taught relationship |
| Typography | Display, explanation, data and annotation have purposeful, readable roles |
| Color and material | Texture, light, line and surface form a coherent world and clarify focus |
| Unity and variation | Recurring objects retain meaning as framing, density, scale or view changes for the explanation |
| Finish in motion | Entrances, transformations, handoffs and holds retain hierarchy at normal speed |

Observed weak subject form, unrelated decoration, repeated layouts that obscure changing relationships, lost focus, unreadable required text or missing causal evidence return the work to revision. Diagnose the particular frame/process and revise its cause.

## Evidence record and verification

```yaml
checkpoint: visual_direction | storyboard_keyframes | built_preview | final_decision
reviewer: builder | independent_reviewer | user | delegated_reviewer
outcome: revise | ready_for_review | recommended | approved | accepted_with_deficit
evidence:
  - criterion: concept_visibility
    frame_or_time: "frame-02 / 00:12.400-00:16.800"
    observation: "The thermal mass remains the dominant silhouette as daylight becomes stored heat."
    severity: note | blocking
    disposition: keep | revise_frame | revise_storyboard | revise_motion | revise_implementation
```

Use project-relative evidence paths and actual playback intervals. For final verdicts record `build_sha256` of `index.html`, plus `check_sha256`, `check_error_count` and `check_warning_count` of current `evidence-check.json`. Cite snapshots with full project-relative paths. Early keyframes predate the finished build; final-preview snapshots follow it. The verifier requires at least three cited keyframes and three finished-build snapshots for `ready_for_review`.

Run `node scripts/verify-art-review.mjs --project <project>` before completed-video handoff. It verifies current provenance, selected-source object evidence, checks and snapshot chronology. Visual and playback judgments remain the reviewer's responsibility. Preserve review history and accepted deficits; later user decisions supersede earlier verdicts for that version.

For an explicitly requested static direction proposal, inspect rendered composition, typography, material and object use, and record those observations. Playback and finished-video verification apply when that proposal becomes a timed composition.
