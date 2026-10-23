# Visual grammar

## Teaching focus and composition

State what the audience should recognize or infer, which visible forms establish it, and which parts change independently. Choose the protagonist for each beat: question, object, relationship, formula or conclusion. Give important questions and takeaways a readable focal state, then transfer attention to their explanation.

A visual premise can help unite a new direction: describe a world, material or metaphor that makes the knowledge relationship tangible, and express it in the frame when adopted. Existing style and content relationships can also supply the composition directly.

Use stable object IDs and semantic groups across changes in detail, grouping and viewpoint. Place objects according to the eye path and relationship; alternate views when the explanation benefits from comparison, detail, overview or text emphasis. Assign readable-view zones for the roles present, keeping required text and objects distinct during reading. Transition overlap follows the planned ownership and reading order. Resolve crowding through hierarchy, spacing or deferring secondary content.

## Production approach

Build around a visible teaching mechanism using suitable relationship components, deliberate typography and reusable subject graphics. Customize content, hierarchy, spacing and handoffs where they improve understanding. Repeated primitives can form one coherent diagram; project-specific geometry supplies essential shapes and internal parts.

Balance familiar expression with content-led variation through [content-led-variation.md](content-led-variation.md). Choose the consequential semantic turns before choosing their novel treatment; material finish and spatial coherence apply throughout.

Let filtering, feedback, comparison or another taught relationship suggest the action. Carry a useful object or gesture forward so its development connects the explanation. Resolve palette, fonts and materials through [style-contract.md](style-contract.md) and the effective frame. The selected public FRAME and its examples supply adoptable guidance. Paid style resources are not bundled.

Source concrete entities through [object-library.md](object-library.md); use SVG for controllable paths, parts and structural changes. Record PNGs as `object_format: png` and `object_role: hero | companion`.

## SVG roles

- `svg_role: hero`: carries the primary visual responsibility of its beat; give it recognizable construction, necessary detail and readable scale.
- `svg_role: companion`: supplies a concrete noun, action, part, quantity or state within the explanation. Use it where it replaces repeated prose or exposes the relationship.

Record the role, source and explanatory responsibility once in the applicable STORYBOARD beat. A recurring object may become context as another concept takes focus.

## Semantic beat coverage

Group neighboring narration cues or screen-text propositions into complete semantic tasks. Every claim receives a visible event or an established state for purposeful reading, comparison or emotional hold. Several sentences may share that process. Preserve the question/takeaway, essential labels, qualifications and adopted narration captions while the demonstration carries explanatory detail.

Describe the viewing process before fixing the layout: what narration supplies; what the image adds; initial state → main change → result; and what carries into the next beat. A mechanism claim is supported by its operation, including a formula's construction where appropriate.

Map `sentence/cue IDs → visible event or purposeful hold → object/source` in the existing `## Frame N` block of `STORYBOARD.md`. The [storyboard example](semantic-storyboard-example.md) demonstrates this grouping. Add motion and reading details through [motion-direction.md](motion-direction.md#storyboard-and-implementation), object sourcing through [object-library.md](object-library.md), supplemental geometry through [svg-library.md](svg-library.md), and other assets through [asset-routing.md](asset-routing.md).

## Scene references

Store original reference images under `assets/references/global/` or `assets/references/<frame-id>/`. Record adopted scope in the relevant STORYBOARD frame:

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
    conflict_resolution: "colors follow frame.md"
```

Scopes are `composition`, `object-shape`, `color`, `typography`, `motion`, `transition`. Distinguish user instructions from inferred guidance and reconcile style changes into the effective frame. A still supplies evidence of subject, hierarchy, alignment, silhouette and density; motion is assessed from video/process evidence.
