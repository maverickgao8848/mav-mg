# Inherit an upstream frame

For MG embedded in an editorial film, resolve the style before asking for a bundled style. Use an explicitly supplied frame first; otherwise keep an existing child frame; for a new child discover the nearest ancestor `frame.md`, up to the workspace/repository boundary. When a parent frame is found, it is the selected style. Ask for a bundled style only if neither the user nor the project supplies a style. A request to keep the film's style is sufficient authorization to inherit it. A later explicit request to change styles takes precedence.

If the output is in a different tree from the original video, pass `--source <original-video-or-input-directory>` to discover its nearest upstream frame after the destination ancestry. Editorial prepare performs the same source-folder search automatically before using its kit default.

From the selected 像素 MG installation:

```sh
node scripts/inherit-frame.mjs --project <film/animations/beat> --search-root <film-or-workspace>
node scripts/inherit-frame.mjs --project <child> --upstream <path/to/frame.md>
node scripts/inherit-frame.mjs --project <child> --check
```

The importer copies the complete original bytes into project `frame.md` and a source snapshot, and records the source path, SHA-256 and resource hashes in `frame-provenance.json`. The copy preserves original bytes, language and newlines. Background color and layers, dots/grain/grid, exact typography/weights, palette, optics, borders, translucency and lighting all remain present. Put this topic's teaching objects, timings and camera plan in BRIEF/STORYBOARD; upstream topic examples and timing/audio settings stay in provenance. Record the actual custom-frame identity.

`frame-resources.json` beside the source can declare `{ "styleId": "custom-id", "resources": [{ "path": "assets/style/background.css", "sha256": "..." }] }`. Paths refer to files relative to that frame and are copied at the same relative destinations. A resource may specify `source` for an alternative source path; keep portable resource paths equal to their staged path. Copy the full dependency closure: CSS/JS, referenced fonts and weights, images, notices and required optical runtime. Existing parent provenance carries its resources forward, including offline portable copies. The upstream producer supplies the frozen font files for each required family and weight. Missing or mismatched declared resources stop the import before writes.

For an authorized style correction only, use `--upstream ... --replace` after preserving project history. This replaces the effective frame, snapshot, provenance and selected resources; the revised preview receives its own review. An existing differing child is otherwise protected. A changed live upstream source or modified inherited file fails `--check`; review and explicitly re-import before continuing. Without access to the original machine, the local source snapshot and resource hashes remain verifiable.

Build against the inherited resources. Inspect rendered background texture, font families/weights, palette and material behavior against the actual upstream reference. Record the frame hash and visible findings in ART-REVIEW. The final-review verifier checks provenance when present; the builder still checks the rendered design. The parent composition preserves the completed MG’s adopted background and palette.
