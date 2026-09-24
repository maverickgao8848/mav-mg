# Reusable asset routing

This document is the authority for classifying and routing reusable visual assets that are not already governed by the relationship-component contract. It prevents text effects, transitions, chart templates and surface treatments from being mistaken for teaching relationships.

## Categories and owners

| Category | Responsibility | Authority after selection |
|---|---|---|
| `relationship` | Make a teaching relationship observable: comparison, propagation, filtering, hierarchy, feedback or sequence | [component-contract.md](component-contract.md), component metadata and `assets/components/collection.json` |
| `object` | Supply a recognizable reusable entity such as a thermometer, brain, organ, tool or vehicle | [svg-library.md](svg-library.md) and `assets/svg-primitives/metadata.json` |
| `scene` | Arrange several primitives or relationship stages into one developing shot | The selected file under `recipes/` |
| `chart` | Encode supplied quantitative data as comparison, trend, composition, distribution, relationship, flow or progress | The selected chart library entry and its data schema |
| `text` | Reveal or transform a title, term, sentence or paragraph | The installed primitive or project implementation |
| `transition` | Implement the boundary behavior selected under motion-direction | The installed primitive or project implementation, linked from the storyboard |
| `focus` | Implement camera travel, reframing or local attention cues | The installed primitive or project implementation; route design belongs to motion-direction |
| `treatment` | Change surface, light, grain, hatch or particle character | The installed treatment or project implementation |

An asset receives one primary category based on what would be lost if it were removed. Add secondary role tags such as `reveal`, `compare`, `sequence`, `cycle`, `annotate`, `handoff`, `headline`, `paragraph`, `chart`, `subject`, `quiet`, `technical`, `organic` or `high-energy` only when they improve selection.

## Selection order

1. State the audience-visible change required by the cue or scene.
2. If that change explains a knowledge relationship, select a `relationship` component first. Do not substitute a reveal, transition or treatment for missing teaching logic.
3. Select the smallest supporting asset category needed by the scene. Search the curated SVG manifest for concrete objects and the current HyperFrames registry by intent before porting or authoring a named effect.
4. Verify content capacity, aspect ratio, real cue duration, style compatibility, handoff state, deterministic seeking, implementation availability and asset provenance.
5. Record the selected ID, primary category, source and reason in the scene storyboard. A source-library listing is a reference, not evidence that the item works in HyperFrames.

Keep one implementation owner for overlapping effects. When a native HyperFrames item already performs the required move, treat external examples as visual references rather than maintaining a parallel port.

## Source boundaries

- **Curated SVG primitives** provide locally archived, hash-bound object geometry under [svg-library.md](svg-library.md). They do not define a scene or teaching relationship.
- **HyperFrames registry** is the first implementation source for native blocks, components, transitions, captions, camera moves and effects. Installation does not promote an item into the relationship-component collection.
- **video-shotcraft** supplies shot behavior and motion references. Its Remotion implementations require a deterministic, seek-safe HyperFrames port before project use.
- **video-spec-builder** supplies content-type vocabulary, use/don't-use distinctions and expected input fields. Its catalog IDs do not claim a local implementation.
- **anything2explainer** supplies explainer structure, continuity and quality-control lessons. Its fixed Remotion visual system does not override the project `frame.md`.
- **MAV Charts** supplies chart selection and real chart templates. Choose charts by communication intent and required data. Do not copy all chart IDs into the relationship-component collection.
- **GSAPify** supplies micro-motion references for text. Rebuild samples around paused, timeline-driven animation; replace unseeded randomness and verify arbitrary-time seeking before use.

## Charts and project style

Choose the chart type before choosing its reveal. A hatch wipe, particle fill or count-up is a motion treatment applied to an already-correct data encoding, not a substitute for chart selection. Use only supplied or sourced data and keep units, scales and annotations traceable.

When an external chart library brings its own visual system, record either an explicit project style exception or a compatible project implementation. Do not silently create a second global style authority beside `frame.md`.

## Text, transitions and emphasis

After selecting a text or transition asset, implement it through [motion-direction.md](motion-direction.md#storyboard-and-implementation), the authority for required motion beats and boundary behavior. Select shaders only when they implement the chosen boundary behavior or a topic-matched accent; selection alone does not establish a handoff.

Plan camera routes alongside the explanatory state sequence under motion-direction, then select their implementations here. Add local focus and surface treatments as needed; a spotlight, HUD, grain field or light pass does not substitute for teaching progress.

## Verified relation-selection example

P21 的雨水花园短片验证了同一叙事内的相近关系选择：

- “哪些候选植物同时耐短时积水与间歇干旱”问的是共同成员，选择 `shared-member-intersection`；两个条件集合的真实重叠区域直接着色，成员放入交集。
- “土壤、根系与微生物怎样一起改善水质”问的是不同因素共同产生结果，选择 `constraint-convergence`；各因素保留独立身份并汇入结果，不画成集合交集。
- “留下雨水、拦住落叶与垃圾”问的是对象的保留/排除，选择 `qualitative-set-filter`；它既不是共同成员，也不是二元后果分支。

这个例子只补充已验证的选型边界；容量、阶段和可用状态仍以各组件 metadata 与 collection 为准。
