---
version: p29.2
name: Open Code — Chinese Knowledge Video Frame
description: >
  A video-first terminal manual: warm near-white paper, near-black ink, local
  monospaced Latin/ASCII, cell-aligned Chinese sans, hairline relationship diagrams,
  bracketed states, and one narratively justified terminal inversion.
unit: the frame — 1920×1080 primary
principle: one terminal/manual voice · the relationship owns the frame · all claims come from the script

colors:
  canvas: "#FDFCFC"
  surface-soft: "#F8F7F7"
  surface-card: "#F1EEEE"
  ink: "#201D1D"
  ink-deep: "#0F0000"
  body: "#424245"
  mute: "#646262"
  ash: "#9A9898"
  on-dark: "#FDFCFC"
  accent: "#007AFF"
  warning: "#D96B00"
  danger: "#D82C24"
  success: "#15803D"

typography:
  latin-mono: "DM Mono"
  chinese-display: "Noto Sans SC"
  chinese-body: "Noto Sans SC"
  display-xl: { cqw: 4.8, weight: 700, lineHeight: 0.98, tracking: "-0.04em" }
  display: { cqw: 3.6, weight: 700, lineHeight: 1.02, tracking: "-0.03em" }
  heading: { cqw: 1.8, weight: 700, lineHeight: 1.15, tracking: "0" }
  body: { cqw: 1.05, weight: 400, lineHeight: 1.45, tracking: "0" }
  label: { cqw: 0.84, weight: 500, lineHeight: 1.2, tracking: "0.04em" }
  caption: { cqw: 0.72, weight: 400, lineHeight: 1.35, tracking: "0.02em" }
  ascii-wordmark: { cqw: 3.2, weight: 700, lineHeight: 0.82, tracking: "0" }

geometry:
  frame-padding-x: 80px
  frame-padding-y: 56px
  hairline: 1px
  rule-strong: 2px
  radius-interactive: 4px
  radius-panel: 0px
  section-gap: 64px
  cell: 24px
---

# Open Code — Chinese Knowledge Video Frame

## Creative premise

Treat each frame as a printed terminal manual coming alive. A changing pointer, branch,
state marker, character cell, or inverted output area explains the knowledge relation.
Whitespace establishes the structure around the main relationship.

Original reference-image sets are omitted from this public distribution. Use this FRAME and the repository showcase to establish terminal/manual composition, restrained color and alignment. Do not request missing sample files.

## Frame system

- Compose for 1920×1080 with an 80px horizontal and 56px vertical safe field.
- Compose the statement and diagram according to the beat: a cover can be typographic;
  an explanation can use a compact title above an anatomy, comparison, or topology.
  Move the title aside only when that handoff helps the audience follow the mechanism.
- Size the diagram so its meaningful internal marks and connections are readable at
  playback size. Keep density inside the explanatory objects and whitespace between groups.
- Align rules, nodes, labels, and terminal rows to a 24px character-cell rhythm.
- Use the warm canvas for most beats. Use one wide dark terminal panel only when the
  inversion marks a meaningful reveal, topology view, or decisive state change.
- Adjacent beats change framing, density, or viewpoint while retaining one recognizable
  node, path, boundary, or character cell as the continuity anchor.

## Chinese and Latin typography

Chinese and Latin share one terminal/manual voice without pretending that one proprietary
Latin font covers both scripts.

- Load local `DM Mono` for Latin, ASCII, numerals, commands, node IDs, and bracket markers.
- Load local `Noto Sans SC` for Chinese display and explanatory text. Use its full-width
  glyphs as two Latin character cells, align mixed-script baselines, and recheck wraps in
  the renderer at every used weight.
- Use Noto Sans SC 600/700 for Chinese display statements and 400/500 for explanation and
  annotation. Use DM Mono 400/500 for terminal content; synthesize no missing weight.
- A mixed line may use the family stack `"DM Mono", "Noto Sans SC", monospace`; wrap
  Chinese spans explicitly when exact character-cell alignment matters.
- Keep prose horizontal. Reserve uppercase for Latin mode labels and state names. Keep Chinese body spacing natural.
- Make display text materially larger than diagram labels. Captions and status metadata
  cannot create the apparent hierarchy.

## Color, surface, and geometry

- Default canvas: `#FDFCFC`; primary ink: `#201D1D`; body hierarchy: `#424245`,
  `#646262`, `#9A9898`.
- Use `#201D1D` as the terminal surface and `#FDFCFC` as its foreground.
- Let ink, open/filled marks, line patterns and inversion carry structure and persistent
  states. Use a restrained semantic accent at the active change; retain distinguishable
  geometry when the accent is removed.
- Build with 1px and 2px rules, square panels, circular node rings, small square state
  markers, compact arrowheads, character blocks, ASCII pipes, and dashed alternate paths.
- Keep surfaces graphic and unshaded: canvas, hairline panel, terminal inversion.
  Shared spatial reframing may change scale and viewing angle while preserving the
  character grid; shadows, gradients and atmospheric texture are outside this material language.
- Allow 4px corners only on prompt rows, compact code cells, and status chips. Structural
  panels and diagrams remain square.

## Component vocabulary

Construct subject graphics from a shared vocabulary of small SVG silhouettes, character
cells, content strokes, nodes and paths. Repetition can form a single focal diagram:
files in a directory, marks inside stored content, or nodes within a graph. Use consistent
stroke weight, square geometry and character-grid alignment. Preserve a recognizable
internal pattern across views; change that pattern when the content changes. These marks
are explanatory structure, not simulated factual data or background decoration.

- `lesson-marker`: bracketed lesson or state metadata tied to the script.
- `terminal-command`: one inverted prompt row containing a verified command or an honest
  subject-specific pseudo-command.
- `diagram-node`: square hairline container with one short identifier and optional state.
- `branch-path`: continuous connector showing ancestry, divergence, handoff, or convergence.
- `code-cell`: compact panel with one to three lines of monospaced content.
- `figure-caption`: one sentence beneath the mechanism naming the visible result.
- `status-chip`: compact meaningful state such as `removed`, `present`, or `overwritten`.
- `terminal-panel`: the sole large dark region for topology, output, or decisive reveal.
- ASCII primitives such as `[+]`, `[-]`, `[x]`, `|`, `o`, `->`, and `...` may become
  graphic marks when they express a real state or relationship.

## Composition families

Choose the family that exposes the current relationship.

1. **Manual cover** — one large question or thesis, one small bracket marker, broad margins.
2. **Binary explanation** — two matched states with one causal arrow and one result line.
3. **Repository anatomy** — three aligned object classes sharing one baseline and scale.
4. **Terminal graph** — one wide dark topology panel; node IDs are secondary to the path.
5. **Detail merge** — distinct inputs converge through continuous paths into one result.
6. **Distributed history** — one source and several copies with explicit directional edges.
7. **Terminal close** — one command or pointer chain becomes a large Chinese conclusion.

## Motion character

Motion is authored per project under the shared motion-direction contract. In this style:

- Use fixed glyph cells, character masks and pointer alignment as the local text vocabulary.
  Text timing, readable windows and revisits follow the shared contract.
- Draw relationship paths from their source node to their destination, then reveal labels
  after the target is recognizable.
- Move whole nodes on the character grid with measured translation; use snapping only as a
  visual idea, never as non-deterministic runtime behavior.
- Characters, pointers, paths and panel edges provide style-native spatial landmarks.
- Use terminal inversion as a climax or decisive state change, not as a generic transition.
- Keep ambient cursor or prompt motion finite, subtle, and subordinate to teaching progress.

## Source and claim boundary

Every count, command, filename, branch name, hash, status, lesson number, and code fragment
must come from the active script or verified project data. Historical sample strings are not project facts. When real terminal output is unnecessary, use a clearly labeled
conceptual state rather than fabricated factual output.

## Pre-render audit

- The premise is recognizable from the dominant statement and relationship image.
- DM Mono owns Latin/ASCII; Noto Sans SC owns Chinese; computed families and used weights
  are verified locally, and mixed-script wraps have been checked at 1920×1080.
- The frame visibly reads as terminal/manual language through cell alignment, bracket marks,
  hairlines, paths, or a justified inversion.
- The mechanism owns the composition; captions, keys, counters, and prompt marks remain
  secondary.
- Paths touch their nodes, labels arrive after their targets, and the natural endpoint is a
  readable settled state.
- Claims and literal terminal content trace to the script or verified project data.
- Adjacent frames differ in framing or density while retaining a semantic continuity anchor.

## Known boundaries

- DM Mono plus Noto Sans SC is the tested local font pairing for this Chinese adaptation.
- The repository showcase demonstrates static composition and material; original reference-image sets are not bundled.
- Only the 1920×1080 frame is currently within this pack's verified output scope.
- The visual atoms are adapted to video-frame composition.
