# Component contract

The machine-readable schema at `assets/components/schema.json` is the authority for component metadata fields. This document explains how to use those fields without duplicating their definitions.

## Selection

The shared selection set at `assets/components/collection.json` is the authority for allowed, preferred and unused component IDs. Keep capability and implementation details in each component's metadata rather than copying them into the collection.

Select by teaching relationship first, then verify content capacity, aspect ratio, style roles, stage events, and handoff anchors. Prefer the smallest component that makes the relationship observable. A metadata entry does not make a component available unless its `implementation.entry` exists.

Use `status: candidate` only in a gallery or a user-approved test. Production selection requires `status: validated` or an explicit current-project exception. Record the selected component ID and reason in the scene’s storyboard block so the frame packet receives it.

## Runtime use

Map each component’s relative stage events onto the scene-local cue window. Preserve the event order while allowing the scene to stretch or trim optional holds. Style roles are semantic inputs resolved from the project `frame.md`; component source must not become a second style authority.

Component anchors identify reusable targets for the shared [motion handoff](motion-direction.md#trajectory-rhythm-and-handoff). Reference the existing storyboard entry from the scene packet. Component stage order governs its local mechanism, not stops on the camera route.

## Evidence

The metadata `evidence` field points to a real project, scene and verification state. Gallery presence proves that a candidate is playable; only the listed checks and human decision determine whether it moves to `validated`.
