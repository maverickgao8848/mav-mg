# Observed implementation lessons

Read this file only while diagnosing composition assembly or regression failures.

## Scope selectors to the composition host

- Trigger: multiple sub-compositions use generic internal class names such as `.unit`.
- Observed failure: a selector rooted through script adjacency expanded across assembled scenes, so one timeline received elements owned by another scene and failed at runtime.
- Applied fix: bind each timeline to its exact `data-composition-id` host, keep composition IDs unique, and query descendants only from that host.
- Regression evidence: the three-scene P3 gallery passes runtime, layout, motion sampling, and representative-frame inspection after the fix.

## Preserve a final frame through natural completion

- Trigger: natural playback reaches the exact composition duration and the final image disappears, although a seek just before the end shows it.
- Observed on HyperFrames 0.8.45: timed roots and clips become hidden at their end; the runtime may also auto-stamp otherwise untimed direct children or tween targets under the main root. Holding the root alone can therefore leave only its background visible.
- Applied fix: keep the final scene's explicit timed host. Place its existing artwork inside a non-timed inner paper wrapper below that host, with a full-canvas background and CSS `visibility:hidden`. The main deterministic timeline sets that wrapper's visibility to `visible` at the final scene start. Reverse seeking restores the initial hidden state. This preserves the actual final artwork without a duplicate snapshot, extra duration or root/clip visibility override.
- Minimal structure: timed final-scene host → non-timed paper wrapper → artwork. Target only the paper wrapper with `mainTimeline.set('#final-paper', {visibility:'visible'}, finalSceneStart)`. Keep its initial hidden state in CSS; do not add a visibility tween to the timed host. Inspect the assembled DOM to ensure the wrapper was not auto-stamped as a clip, especially after changing nesting or runtime versions.
- Verified scope: an actual two-second Studio reproduction and a 61.96904-second five-scene project on 0.8.45 retained the final paper at natural stop and hid it when seeking backward. Treat this as a version-scoped implementation remedy, not a new lifecycle contract. Apply the final playback evidence requirements in [quality.md](quality.md).
