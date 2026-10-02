# Style contract

The project-root `frame.md` is the only effective visual style source consumed by scene builders. A bundled FRAME and its sample images are upstream inputs. Resolve user changes into `frame.md` and pass only that effective file downstream.

## Bundled styles

This local edition retains the two upstream public styles and adds the red/cream Vermilion Theatre style:

| Style ID | Source | Validation boundary |
|---|---|---|
| `cobalt-grid` | [FRAME](../assets/styles/cobalt-grid/FRAME.md) · [metadata](../assets/styles/cobalt-grid/metadata.json) | A bound new-topic standard-mode short passed user art review. Each new project still needs its own visual review. |
| `editorial-forest` | [FRAME](../assets/styles/editorial-forest/FRAME.md) · [metadata](../assets/styles/editorial-forest/metadata.json) | A bound advanced short passed user art review; a longer cross-topic build retained an overlap deficit. |
| `vermilion-theatre` | [FRAME](../assets/styles/vermilion-theatre/FRAME.md) · [metadata](../assets/styles/vermilion-theatre/metadata.json) | User selected A letterpress from the rendered static proposals on 2026-10-02. Replacement-copy layout checked; no new-topic video approval is claimed. |

Apply a style from the Skill directory:

```sh
node scripts/apply-style.mjs --style cobalt-grid --project <project-directory> --mode <standard|advanced>
node scripts/apply-style.mjs --style editorial-forest --project <project-directory> --mode <standard|advanced>
node scripts/apply-style.mjs --style vermilion-theatre --project <project-directory> --mode <standard|advanced> [--variant <letterpress|rubber|signpaint>]
```

Pass the confirmed `BRIEF.md` production mode to the loader. The tool verifies all declared resource hashes, writes `frame.md`, and copies the selected references and provenance to `assets/references/styles/<style-id>/`. For Cobalt Grid, `standard` selects `samples/` and `advanced` selects `advanced-samples/`; Editorial Forest currently uses its common `samples/` set in both modes. Reapplying identical files leaves them unchanged. A Cobalt Grid mode switch stops if the other mode's references remain; reconcile those files and any conflicting `frame.md` before continuing.

When an existing project has an approved `frame.md`, keep it unless the user requests a change. Record the selected source identity, revision, path, and known license in project provenance. Record unknown fields as unknown.

Vermilion Theatre defaults to the user's approved A letterpress typography, resolved from metadata.selection.approvedDefault. Use an explicit variant for an authorized comparison or requested style change. The loader resolves the common FRAME with that variant and records `selection.json`; only the resolved project `frame.md` goes downstream. Its pack ships local fonts and required notices; it does not ship original Thiings PNGs. A different variant on an existing project is a style change subject to the same preserve-and-reconcile behavior.

Use the selected references only as visual evidence for composition, hierarchy, typography, information density, and finish. Their text and subject matter are not project facts or motion instructions. Record each adopted image path and its specific visual feature in `STORYBOARD.md`; keep the per-image descriptions in the bundled `FRAME.md`. Shared motion behavior remains in [motion-direction.md](motion-direction.md).

Treat a font as prepared only after the rendered browser resolves the intended local family and each used weight. Declare shipped files with `@font-face`, inspect computed family/weight in a captured frame, and keep that proof with the project. When an observed renderer fallback affects a variable font, derive deterministic static instances for the used weights from the same source font and reference those local files; do not change the effective typography in `frame.md` merely to hide a loading failure. The style tool copies manifest-listed resources (including fonts when a pack contains them), not audio, scene code, or a full HyperFrames composition. The two upstream packs still require their fonts to be prepared separately.

If a requested style is absent from this package, report that it is unavailable here. The README may show paid-style covers, but those covers do not provide an installable style or public download.
