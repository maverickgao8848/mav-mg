# Component contract

`assets/components/schema.json` defines metadata fields. `assets/components/collection.json` defines allowed/preferred IDs; each component metadata defines semantics, capacity, stages, implementation and evidence.

## Selection

Select by teaching relationship, then verify capacity, aspect ratio, style roles, stage events and handoff anchors. Prefer the smallest fitting component and `collection.preferred` where appropriate. Check that its declared `implementation.entry` exists.

Production uses `status: validated` or an explicit current-project exception. Candidates can be exercised in a gallery or accepted test. Record ID and reason in the scene's storyboard block.

## Runtime and evidence

Map relative stage events to scene-local cue windows, preserving order and adjusting optional holds. Resolve style roles from project `frame.md`. Use anchors for [motion handoffs](motion-direction.md#trajectory-rhythm-and-handoff) in the same storyboard entry.

The metadata evidence identifies reviewed projects, scenes and checks. A gallery establishes playability; promotion to validated follows the recorded technical and human review outcome.
