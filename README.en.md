# MAV-MG

[中文](README.md) · **English** · [Download the public Skill](https://github.com/maverickgao8848/mav-mg/releases/download/v0.1.0-preview.19/mav-mg-0.1.0-preview.19.zip) · [Download the original video](https://github.com/maverickgao8848/mav-mg/releases/download/v0.1.0-preview.18/bank-run-v3-music.mp4) · [Skill entry](SKILL.md)

**Turn Chinese narration into editable educational motion graphics.** Plan the teaching beats, choose a visual direction, demonstrate each mechanism on screen, and build a HyperFrames project for preview and rendering.

https://github.com/user-attachments/assets/257d441e-305a-428f-a1b9-2fbf370635a9

**Sample video:** *Bank Run* v3 with music, 70.7 seconds at 1920×1080 and 30 fps. Play it directly on this page; use the link above to download the original.

## Choose a style visually

These are HyperFrames preview frames and style reference images. **The public package includes only Cobalt Grid and Editorial Forest.** Click either image to read its `FRAME.md`. The images show visual direction, not promised output or factual content for a new topic.

<table>
<tr>
<td width="50%"><a href="assets/styles/cobalt-grid/FRAME.md"><img src="assets/showcase/styles/cobalt-grid.jpg" alt="Cobalt Grid preview" width="480"></a><br><b>Cobalt Grid · Included</b><br>Research, data and systems<br><code>cobalt-grid</code></td>
<td width="50%"><a href="assets/styles/editorial-forest/FRAME.md"><img src="assets/showcase/styles/editorial-forest.jpg" alt="Editorial Forest preview" width="480"></a><br><b>Editorial Forest · Included</b><br>Nature, materials and everyday science<br><code>editorial-forest</code></td>
</tr>
</table>

Other styles are reserved for a future paid package and are not included in this repository or download. Sales are not open yet.

## Get started

1. Download and unzip the package. Put `mav-mg` in `~/.codex/skills/` or your project's `.agents/skills/`.
2. Install Node.js and HyperFrames. We recommend **`gpt-6-sol` or a more capable GPT-6 model**. Advanced mode also requires the runtime model check in the [input contract](references/input-contract.md). Voice generation additionally needs the voice tool selected for your project.
3. In Codex, provide Chinese narration or timed cues and state your target duration and style:

```text
Use mav-mg to make this Chinese narration into educational MG.
Choose cobalt-grid and standard mode.
Confirm the teaching beats and storyboard, then build an editable HyperFrames project.
```

From the Skill directory, apply an included style:

```powershell
node scripts/apply-style.mjs --style cobalt-grid --project <project-directory> --mode advanced
```

`editorial-forest` is also accepted. Set `--mode` to `standard` or `advanced`; Cobalt Grid uses a separate seven-image reference set for each mode. The tool checks resource hashes, writes the project `frame.md`, and copies selected references. Reconcile a conflicting existing project style before continuing.

## Technical preview boundary

This package targets **Chinese educational explainers at 1920×1080 and 30 fps**. It accepts plain narration, fixed cues and reference cues, and produces an editable, seek-safe HyperFrames project. Advanced mode has a model prerequisite in the [input contract](references/input-contract.md). The [release scope](references/release-scope.md) records validated lengths and known visual limitations. Review each new project through real preview frames and normal-speed playback.

## License and commercial use

Repository code and public resources are provided under the [PolyForm Noncommercial License 1.0.0](LICENSE). Commercial use requires separate authorization. Check each asset's metadata for its own provenance and rights. Future paid-package terms will be stated when it is released.
