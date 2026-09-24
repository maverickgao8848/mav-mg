# Style contract

The project-root `frame.md` is the only effective visual style source consumed by scene builders. A bundled FRAME and its sample images are upstream inputs. Resolve user changes into `frame.md` and pass only that effective file downstream.

## Public styles

This public package contains two installable styles:

| Style ID | Source | Validation boundary |
|---|---|---|
| `cobalt-grid` | [FRAME](../assets/styles/cobalt-grid/FRAME.md) · [metadata](../assets/styles/cobalt-grid/metadata.json) | A bound new-topic standard-mode short passed user art review. Each new project still needs its own visual review. |
| `editorial-forest` | [FRAME](../assets/styles/editorial-forest/FRAME.md) · [metadata](../assets/styles/editorial-forest/metadata.json) | A bound advanced short passed user art review; a longer cross-topic build retained an overlap deficit. |

Apply either style from the Skill directory:

```sh
node scripts/apply-style.mjs --style cobalt-grid --project <project-directory>
node scripts/apply-style.mjs --style editorial-forest --project <project-directory>
```

The tool verifies resource hashes, writes `frame.md`, and copies samples and provenance to `assets/references/styles/<style-id>/`. Reapplying identical files leaves them unchanged. Reconcile any conflicting existing `frame.md` before continuing.

When an existing project has an approved `frame.md`, keep it unless the user requests a change. Record the selected source identity, revision, path, and known license in project provenance. Record unknown fields as unknown.

Use the paired samples only as visual evidence for composition, hierarchy, typography, information density, and finish. Their text and subject matter are not project facts or motion instructions. Record the adopted scope of any supplied reference in `STORYBOARD.md`; shared motion behavior remains in [motion-direction.md](motion-direction.md).

Prepare the font families and weights named by the selected FRAME locally. Verify them in a rendered browser frame. The style tool prepares reference files, not fonts, audio, scene code, or a full HyperFrames composition.

If a requested style is absent from this package, report that it is unavailable here. The README showcase describes additional visual directions but supplies no corresponding FRAME files.
