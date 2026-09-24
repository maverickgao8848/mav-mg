# Curated SVG primitives

This file defines how recognizable reusable SVG objects enter a Knowledge MG project. The machine-readable inventory and file hashes live only in `assets/svg-primitives/metadata.json`.

## Role boundary

An SVG primitive supplies recognizable geometry such as a thermometer, brain, head, nerve or callout. It does not supply the teaching relationship, scene composition, project palette or motion sequence. The active `frame.md` owns visual style; the storyboard owns why the object appears and how it participates in the explanation.

Use one evolving object across adjacent clauses when it can carry the whole causal step. Add a new primitive when a narrated concrete object or body process would otherwise remain only as text. An abstract claim becomes a diagram, signal path, comparison or labeled state rather than an arbitrary icon.

## Selection and staging

1. Search the local manifest by semantic role.
2. If no local item fits, search HyperFrames registry by the audience-visible object or transformation.
3. For an external source, prefer the official repository or package, record its version, license, source URL and SHA-256, and import only the selected SVG files plus required notices.
4. Preserve the source `viewBox`. Remove fixed colors only in the project copy when needed; keep the archived source geometry byte-identical.
5. Adapt the object through project color roles, line weights, material details and separate semantic groups. A library icon is a geometry seed, not a finished full-frame illustration.
6. Record the primitive ID, source and cue in `STORYBOARD.md`. Verify it at output size and during the motion range in which it enters, changes or hands off.

For color-only use, CSS masks keep the archived SVG immutable. For path drawing or internal deformation, copy the required path into a project-owned semantic group and cite the primitive ID in a `data-source-primitive` attribute.

## Adding one object

The source record in `assets/svg-primitives/metadata.json` keeps the pinned package, upstream URL, preferred asset directory and import script. For Phosphor, choose the regular-weight SVG from the pinned package and run:

```sh
node scripts/import-svg-primitive.mjs --source phosphor-2.1.1 --file <path-to-svg> --id <semantic-id> --roles <role-a,role-b>
```

The importer validates the SVG root and `viewBox`, rejects executable or remote content, preserves the source bytes, copies only that object, and writes its semantic roles and SHA-256 into the existing manifest. Repeating the same import is unchanged; a reused ID or path with different content fails before the manifest changes.

## Current source policy

The initial curated subset uses Phosphor for general objects and Health Icons for body/medical objects. Bioicons remains a discovery source for specialized science illustrations, but each Bioicons item carries its own license and author metadata; do not import one without item-level provenance.
