# Reusable asset routing

Classify assets by their primary explanatory responsibility, then choose an implementation.

| Category | Responsibility | Authority |
|---|---|---|
| `relationship` | Comparison, propagation, filtering, hierarchy, feedback or sequence | [component-contract.md](component-contract.md), collection and component metadata |
| `object` | Recognizable entity | [object-library.md](object-library.md); supplemental geometry in [svg-library.md](svg-library.md) |
| `scene` | Arrange primitives/stages into a developing shot | Selected `recipes/` entry |
| `chart` | Encode quantitative data | Selected chart entry and data schema |
| `text` | Reveal or transform text | Selected primitive/project implementation |
| `transition` | Execute an authored boundary | [motion-direction.md](motion-direction.md) and selected implementation |
| `focus` | Camera travel, framing or attention | Motion direction and selected rig/primitive |
| `treatment` | Surface, light, grain, hatch or particles | Selected treatment/project implementation |

## Selection

1. State the audience-visible change required by the beat. Select the teaching relationship before its supporting effects.
2. Source concrete objects through object-library. Search the HyperFrames registry by intent for other reusable primitives before custom authoring a named effect.
3. Verify content capacity, aspect ratio, cue duration, style, handoff state, seeking, implementation availability and provenance.
4. Record ID, category, source and reason in the existing storyboard entry. Give overlapping effects one implementation owner.

## Sources

- Pixel2All: selected entity images; DOM/SVG supplies mechanisms, paths and internal changes.
- Curated SVG: hash-bound object geometry from the [primitive manifest](../assets/svg-primitives/metadata.json).
- HyperFrames registry: native blocks, transitions, captions, camera primitives and treatments.
- video-shotcraft, video-spec-builder and anything2explainer: adoptable shot/structure references; port required implementations into deterministic HyperFrames and use the project's frame.
- MAV Charts: chart selection and templates driven by real data/schema.
- GSAPify: text-motion references adapted to paused, deterministic timelines.

Choose a chart's encoding before its reveal; retain sourced values, units and scales. Reconcile an external visual system through a compatible project implementation or an explicit style exception in `frame.md`.

For text, transition and focus, implement the selected behavior through [motion-direction.md](motion-direction.md#storyboard-and-implementation). Treatments support the established relationship and material world.

## Verified selection example

P21 rain-garden scenes distinguish shared members (`shared-member-intersection`: plants meeting two conditions), contributing causes (`constraint-convergence`: soil, roots and microbes improving water), and retained/excluded entities (`qualitative-set-filter`: water versus debris). Component capacity, stages and availability remain defined by metadata and collection.
