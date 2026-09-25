# Visual grammar

## Teaching focus

Before drawing, state what the audience must recognize or infer, which shapes carry that recognition, which parts need independent motion, and which details are required for accuracy. Use a small reusable vocabulary of shapes while retaining the internal structure and meaningful detail needed to recognize the subject and follow its changes.

Choose the visual protagonist from the **current beat's core concept or relationship**, not from the topic's most impressive illustration. The protagonist may be a question, object, connection, comparison, formula, principle or key result. During creative planning, identify the questions the viewer should consider and the conclusions or principles they should retain. Give the consequential ones a distinct focus beat before unpacking or demonstrating them: isolate or enlarge the carrier, allow a readable hold, and defer competing diagrams. Then hand attention to the explanation through a topic-related gesture. For example, a wind question may be carried away by a gust that introduces the coast; this illustrates semantic continuity, not a required effect or centered layout. Contrast these emphasis beats with denser explanatory beats so everything is not equally loud. A permanently dominant SVG is not required.

Give recurring knowledge objects stable IDs and semantic groups. Preserve recognizable identity as their detail, grouping or viewpoint changes. Plan world relationships and handoffs through [motion-direction.md](motion-direction.md#storyboard-and-implementation), in the same beat entries.

Before animation, assign readable-view zones to the title, main teaching object, annotations, and captions in `STORYBOARD.md`, wherever those roles are present. These zones describe the viewing window, not limits on world coordinates; travel can expose previously offscreen content. The main teaching object is the active concept carrier, including a formula or relationship. Choose placement for each beat's relationship and eye path; titles are optional actors, not a fixed upper-left slot. Keep semantic groups from unintentionally covering one another while a beat is readable. An authored transition may briefly overlap incoming and outgoing groups when ownership and reading order remain clear. Check both representative keyframes and the transition range; if the frame is crowded, remove or defer a secondary element before shrinking the protagonist.

Let the layout develop within a scene as attention changes: a question or principle can first occupy the center or most of the canvas, then shrink or move aside as the explanatory object unfolds. Across adjacent beats, choose full-width diagrams, localized close-ups, aligned comparisons or text-led conclusions according to the teaching relationship. Use a left-text/right-diagram split when simultaneous reading helps that relationship, and vary the next beat's hierarchy when its purpose changes. Preserve object identity through these moves. These are compositional options, not a fixed sequence, centering requirement or layout quota.

## Production modes

Read the confirmed `production_mode` from `BRIEF.md`. Both modes use the same teaching focus, semantic beat coverage, project `frame.md`, motion direction, quality gate and HyperFrames contract. Mode changes where design effort is spent, not the minimum bar for clarity, composition or finish.

### Standard

Build around one strong visual mechanism using validated relationship components, deliberate typography, semantic color and reusable subject graphics. Reduce construction effort through repeated primitives and mature structures, while preserving the active style's information density and finish. Customize their internal content, hierarchy, spacing and handoffs to the topic. One focal diagram may comprise many small objects whose grouping and connections express one relationship. Draw project-specific geometry when reusable structures cannot make the subject recognizable.

### Advanced

Define a topic-specific visual thesis, then invest in the few custom decisions that most improve it: object construction, hero silhouette, typographic choreography, material language or action staging. Let those decisions recur and develop across beats so the result feels authored rather than effect-stacked. A complex main SVG is optional; use it only when its independent parts and motion clarify the concept. Advanced mode is not an element-count, layer-count or SVG-count quota.

## SVG roles

Classify each semantic SVG in `STORYBOARD.md` as either a **hero SVG** or a **companion SVG**. The distinction is about narrative responsibility, not file size.

- A hero SVG carries the primary visual responsibility for its assigned beat. Give it the dominant silhouette, subject-specific construction, independent motion and enough scale to remain recognizable in a small thumbnail. Let a recurring hero preserve its identity across scenes while its state, viewpoint or structure changes; it can become supporting context when a formula or relationship takes the lead.
- A companion SVG externalizes a concrete noun, action or judgment, or supplies meaningful identity, internal structure, quantity or state within a larger diagram. Place it where that relationship is read, including inside the primary object. Reuse it when it can replace explanatory words or make a change directly visible: a thermometer exposes temperature; repeated content fragments show what survives an operation. Keep it subordinate to the current concept carrier and animate a readable gesture when its state changes.

When a body-text cluster grows beyond two short lines, first ask whether a companion SVG can carry one of its ideas. Shorten repeated prose after the SVG makes the noun or action visible. A decorative mark that does not reduce text or clarify the teaching relation is not a companion SVG.

Record the assignment once as `svg_role: hero | companion`, plus the object/source and the text it replaces or structural evidence it supplies, within the applicable beat. Several SVGs may coexist, but only one concept carrier owns the primary focus at a time.

## Semantic beat coverage

Break every narration cue or screen-text proposition into short explanatory beats around its nouns, actions and judgments. Give each sentence at least one visible change that carries its meaning: introduce the named concrete object, transform an existing object, move a signal, expose an internal structure or compare states. Let that demonstration replace redundant explanatory prose; retain the question or takeaway, concise labels, essential qualifications and required narration captions. Typing a sentence is not a substitute for showing its mechanism, while constructing or transforming a formula can itself be the explanation.

A beat ends when its local point is understood, not when a large illustration has filled an audio segment. Favor short, connected developments without imposing a universal seconds-per-shot quota. Several beats may share one scene and its objects; the new beat still advances what the audience sees or understands. Use [motion-direction.md](motion-direction.md) for the actual handoff and timing.

Record this mapping once in `STORYBOARD.md` as `sentence → visible event → object/source`; in that same entry identify the beat's core concept or relation, protagonist and next handoff. A sentence represented only by already-arranged text is an uncovered beat. When the event is an SVG, include its `svg_role`. Use [svg-library.md](svg-library.md) for reusable concrete objects and [asset-routing.md](asset-routing.md) for text, transition, focus and treatment assets.

## Scene references

Store original reference files without modification under `assets/references/global/` or `assets/references/<frame-id>/`. Record adoption only in that frame’s `STORYBOARD.md` entry using this structure:

```yaml
frame_id: f02
references:
  - path: assets/references/f02/reference-01.png
    type: image
    scope: [composition, typography]
    intent: follow-major-layout
    focus: "left subject and right annotation rail"
    user_requirement: "use this arrangement"
    inferred_guidance: "preserve asymmetric negative space"
    conflict_resolution: "colors remain controlled by frame.md"
```

Allowed `scope` values are `composition`, `object-shape`, `color`, `typography`, `motion`, and `transition`. Use a short free-text focus when only one region matters.

Separate the user’s instruction from inferred guidance. A supplied reference does not automatically override the project style. Resolve conflicts using the repository priority order and pass only the effective choice downstream.

## Images

For images, inspect subject, hierarchy, negative space, alignment, silhouette, and information density. An image proves a static state, not an unseen animation.

## Bundled style evidence

The selected style references and their authority are defined in [style-contract.md](style-contract.md) and the active `FRAME.md`. Use the mode selected in `BRIEF.md` when loading references; record each adopted image and feature in `STORYBOARD.md`.
