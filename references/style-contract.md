# Public style contract

Project-root `frame.md` is the effective visual source. Keep scene content in BRIEF/STORYBOARD. Children inherit the complete frame and resources through [upstream-frame.md](upstream-frame.md).

## Available styles

Seven packs are included for noncommercial use. Inclusion does not extend their recorded art approval.

| 中文名称 | Style ID | Resources and scope |
|---|---|---|
| 朱砂活字剧场 | `vermilion-theatre` | [FRAME](../assets/styles/vermilion-theatre/FRAME.md), local fonts, approved A letterpress typography; static review does not certify every video |
| 工程图册 | `gable-reed` | [FRAME](../assets/styles/gable-reed/FRAME.md), dark engineering atlas, measured paths; recorded 22-second arch sample |
| 建筑剖面轴测 · 三维意境 | `architectural-section` | [FRAME](../assets/styles/architectural-section/FRAME.md), fonts and selected static 3D reference; motion not verified |
| 钴蓝网格 | `cobalt-grid` | [FRAME](../assets/styles/cobalt-grid/FRAME.md), historical pack, available by explicit choice |
| 终端手册 | `opencode` | [FRAME](../assets/styles/opencode/FRAME.md), historical pack, available by explicit choice |
| 复古电脑目录 | `dell-1996` | [FRAME](../assets/styles/dell-1996/FRAME.md), historical pack, available by explicit choice |
| 巨字海报 | `broadside` | [FRAME](../assets/styles/broadside/FRAME.md), historical pack, available by explicit choice |

Offer Vermilion Theatre / Engineering Atlas when unresolved. Use Chinese display names and resolve to IDs. Respect an explicit public-style choice or supplied custom frame. Prepare and stage fonts required by the FRAME: some historical packs describe families without bundling them. Preserve licenses and inspect browser font resolution.

Pixel Emerald / 像素绿宝石 (`glass-lime`) and Pixel Platinum / 像素白金 (`baijin-black-texture`) are paid packs. Their specifications, runtime resources and complete templates are absent. Do not treat README previews as installable resources. If requested, explain the boundary and offer a public style or the author's authorization channel. Independently authorized parent projects may retain their own frame/resources; do not replace them with missing public-pack paths.

## Apply and inherit

```sh
node scripts/apply-style.mjs --style vermilion-theatre --project <project>
node scripts/apply-style.mjs --style gable-reed --project <project>
node scripts/apply-style.mjs --style architectural-section --project <project>
```

Vermilion optionally accepts `--variant letterpress|rubber|signpaint`; metadata selects the approved default. There is no `standard`/`advanced` switch in the current loader.

The loader verifies hashes, writes `frame.md`, and stages resources under `assets/references/styles/<style-id>/`. Identical application is unchanged; differing files require reconciliation. Where declared, `metadata.frameResources` produces `frame-resources.json` for portable inheritance.

Original `samples/` and `mechanism-samples/` images for Cobalt Grid, Engineering Atlas and Terminal Manual are omitted because public redistribution permission is not recorded. Metadata records the omissions. Use written specifications and the permitted showcase, without requesting missing sample files.

Facts, quantities, narration and motion come from the active script and storyboard. Review approval remains bound to the actual preview.
