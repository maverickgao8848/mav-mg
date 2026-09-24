# Art-direction quality gate

This file is the single runtime authority for visual-quality review in `knowledge-mg`. Technical validity and fidelity to a design specification are necessary inputs, but neither one proves that the art direction is strong.

## Independent outcomes

Record these outcomes separately so one cannot silently promote another:

```yaml
technical: not_reviewed | revise | pass
design_adherence: not_reviewed | revise | pass
art_direction: not_reviewed | revise | ready_for_review | recommended | approved | accepted_with_deficit
```

- `technical` reports HyperFrames lint, runtime, layout, motion, contrast, and seek behavior.
- `design_adherence` reports whether the built frames follow the active `frame.md`.
- `art_direction` reports whether the visible concept and execution are worth presenting as finished work.

Keep `art_direction: revise` when the composition is technically valid but visually generic or under-resolved. Use `accepted_with_deficit` only when the user knowingly accepts a named visual deficit; it preserves the deficit and does not mean `approved`.
Use `ready_for_review` only after the builder has inspected the required frame/time evidence and found no blocking observation. It is a handoff state, not a recommendation or approval.

## Review checkpoints

### Visual direction

Before confirming a new or changed visual direction, state one creative premise that can be seen without reading the design explanation. Name the main knowledge object, the physical or graphic world it inhabits, the intended eye path, the type register, and the material/color behavior. Return to `frame.md` when these choices do not form one coherent premise.

### Storyboard keyframes

Before approving a storyboard visual plan, inspect representative keyframes for the opening, the main mechanism, and the conclusion. Judge the seven observation areas below at actual output size and as small unlabeled thumbnails. Return to `STORYBOARD.md` for weak scene structure or variation, and to `frame.md` when the weakness belongs to the whole visual language.

### Built preview

Before showing the final-look preview, inspect a contact sheet and watch the mechanism and transition ranges at normal speed. Static frames reveal composition and finish; normal-speed playback reveals whether hierarchy, typography, material, and motion remain legible in time. Return to the composition or motion sidecar for implementation defects, and return upstream when the implementation faithfully exposes a weak visual plan.

### Final decision

The builder may set `revise` or `ready_for_review`. An independent reviewer may set `recommended` after reviewing frame/time evidence. The user, or a delegate explicitly named by the user, sets `approved`. If the user accepts a known weakness, record their words and use `accepted_with_deficit`; do not rewrite the weakness as a pass. A builder may clear local preflight issues but cannot self-upgrade the final art-direction result to `recommended` or `approved`.

## Checkpoint completion

A checkpoint is complete only when its evidence has been inspected and its outcome uses the status vocabulary above. `not_reviewed` means the evidence has not yet been judged; `ready_for_review` means builder preflight found no blocking observation. Do not create variants such as `pending_user_review`.

For `storyboard_keyframes`, evidence is an actual rendered image or snapshot at the target aspect ratio for the opening, main mechanism, and conclusion. Storyboard prose, named motifs, object inventories, CSS, and file existence do not prove the visual plan. If a rendered keyframe triggers a blocking observation, return to `STORYBOARD.md` or `frame.md` before building the full timeline.

For `built_preview`, the builder must apply the reproducible failure signals below before user handoff. Any visible blocking signal sets `art_direction: revise` and returns the work upstream. The user review decides direction and approval; it is not the first line of quality control.

### Evidence probes

Use the existing sentence/beat mapping in `STORYBOARD.md` as the review index; do not create a second narration or focus plan. At the keyframe checkpoint, inspect the planned focal states. At built-preview review, verify their actual changes at normal speed using these probes. Store findings in the existing evidence record, with the applicable observation-area criterion.

| Probe | Evidence to inspect and decision |
|---|---|
| Teaching emphasis | For each consequential question, principle and conclusion identified in the beat mapping, inspect before/focus/after frames and the intervening playback range. Name where the eye is led, what becomes dominant, and how attention passes to the explanation. A heading appearing beside an unchanged dominant diagram does not demonstrate that handoff. Mark missing or ineffective emphasis as blocking. |
| Mechanism legibility | For each central causal claim, inspect the part, interface, state change or relationship that establishes it at playback size. Temporarily disregard narration and explanatory paragraphs, retaining necessary labels: the visual must supply the claimed relationship, rather than require the prose to assert it. Simplification is valid only while that evidence remains visible. A moving object alone is insufficient when the claim concerns an unresolved internal interaction. |
| Subject finish | Compare actual hero/detail frames with the active style references at comparable display size, within their adopted scope. Identify concrete strengths or gaps in contour construction, meaningful internal detail, spatial hierarchy and typography. A matching palette/font or a recognizable silhouette alone cannot establish finish. Without a supplied reference, judge those same qualities against the diagram's explanatory responsibility. Do not import reference subject matter or add ornamental detail to satisfy this probe. |
| Explanatory progression | Inspect adjacent beats together, naming what becomes newly understandable from their visible difference. Reusing a view is valid for a comparison or reversal when it exposes that difference. When a new concept needs a different level of detail but receives only changed text, paper color or whole-object travel, mark it blocking and return to the storyboard. No fixed camera, shot-count or zoom quota is implied. |
| Authored text and spatial continuity | Audit the [motion contract](motion-direction.md) against the existing beat/boundary mapping. Inspect departures, travel midpoints, reading windows and returns at normal speed. Can the eye follow the anchor to the next destination, recognize an earlier detail inside its parent and read the required claim? Inspect direction/velocity seams, occlusion, grouping and detail handoffs. Distinguish new text entrances from distant landmarks and revisits; reverse-seek before each authored entrance to verify its concealed state. Cite actual text-internal changes and spatial travel. Unexplained teleporting, repeated token zooms without a narrative reason, missing required choreography or unreadable focal states are blocking. A recipe citation, tween count, midpoint sheet or technical pass alone is insufficient. |

For every probe, cite actual files/times and the visible finding, including gaps; statements such as “topic-specific,” “clear hierarchy” or “consistent style” without that evidence do not complete review. Reconcile planned events with rendered events: an emphasis or detail described in the storyboard but absent or unreadable in playback is a failure, not evidence of compliance. Missing required evidence keeps the checkpoint `not_reviewed`; an observed failure makes it `revise`. Neither may be promoted to `ready_for_review`.

At handoff, the receiving reviewer must inspect the evidence and apply these probes before endorsing or presenting the result as review-ready; copying the builder's verdict does not constitute review. Record any disagreement against the current version. This is a review responsibility, not authorization to create another agent or task.

Technical completion also includes natural playback through the exact stop and a reverse seek to an earlier scene. Retain screenshots of the last valid frame, natural stopped state and reverse-seek result. A requested endpoint seek may be clamped before the stop; log the actual time and do not substitute it for natural completion. A blank endpoint or stale end layer sets `technical: revise` even if the CLI sample grid passes.

## Seven observation areas

Review every area with a specific frame or time range. These are lenses for judgment, not additive points or an element-count quota.

| Area | Observable result |
|---|---|
| Concept visibility | The premise is recognizable in the image itself; the design explanation names what the viewer can already see. |
| Hierarchy and spatial composition | One primary focus leads to meaningful secondary information through scale, placement, depth, and negative space. |
| Subject-specific form | Silhouettes, diagrams, environments, and visual metaphors belong to this topic and preserve the taught relationship. |
| Typographic role | Display, explanation, data, and annotation voices are intentional, readable at playback size, and active in the composition rather than pasted on top. |
| Color and material | Palette, texture, light, line, and surface behavior create a coherent world and make the current teaching focus visible. |
| Cross-scene unity and variation | Recurring objects keep their meaning while successive scenes change framing, density, scale, or viewpoint for a reason. |
| Finish in motion | Entrances, transformations, handoffs, and holds preserve hierarchy at normal speed and make the chosen visual character perceptible over time. |

## Reproducible failure signals

Mark `art_direction: revise` when frame/time evidence shows any of these conditions:

- The named creative premise is not visible without explanatory prose.
- The primary composition could be exchanged with an unrelated topic without meaningful redesign.
- Small metadata, thin rules, or interface chrome supplies most of the apparent detail while the teaching object remains visually weak.
- Nearby scenes repeat the same webpage, dashboard, card-grid, or centered-stack skeleton without a semantic reason.
- Decoration has no relationship to the knowledge object, hierarchy, transition, or chosen material world.
- The main focus or required text cannot be followed at normal playback speed.
- Any evidence probe above exposes an unresolved blocking gap in emphasis, mechanism legibility, subject finish or explanatory progression.

Treat these as diagnoses, not a banned-style list. A deliberate interface, card, or centered composition can pass when the subject calls for it and the evidence shows a specific visual purpose.

## Evidence record

For each checkpoint, keep a compact record:

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

Use paths relative to the project. Evidence must point to a real snapshot, contact sheet frame, or playback range. Scores, pixel differences, CSS-token compliance, and motion counts may help locate a problem, but they cannot decide `art_direction` on their own.

## Exit condition

Builder `ready_for_review` permits a review handoff only after the required probes have been inspected and blocking observations resolved. An independent endorsement requires `recommended` evidence; final artistic acceptance requires `approved` evidence from the user or their explicitly named delegate. Bind each verdict to the reviewed version hash. A later rejection supersedes the earlier handoff status for that version; preserve the earlier record as history. Preserve every `accepted_with_deficit` item in the handoff and in the next iteration's baseline.
