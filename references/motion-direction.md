# Motion direction

This file owns Xiangsu MG's camera, text, object and boundary choreography. User direction controls creative choices; the effective project `frame.md` supplies visual character.

## Shared world and teaching action

Arrange concepts through their relationship: neighbors, nesting, branching, layers, convergence or return. For connected beats, carry recognizable objects through a continuous world or graphic handoff. A fixed view supports a beat with strong internal action or a reading task; unrelated chapters may cut clearly.

Plan consequential handoffs before fixing the layout: move between peers, enter a part, follow a cause, compare branches, return or gather a whole. Place destinations so their relationship is discoverable. Across the piece, match framing behavior to these tasks through direction, scale, viewpoint, tracking or object reconfiguration. A linear process can use a linear route; changes in relationship can motivate changes in the route.

Let evidence gather, a detail become a node, or a structure unfold as framing changes. Retain recognizable identity and show consequential regrouping. Stage establishment, explanation, readable result and onward handoff within the actual cue window.

## Choose and combine moves

| Intended discovery | Move and visible result |
|---|---|
| Inspect a detail | Push toward an identifiable region; pull back to restore its parent context |
| Compare neighbors | Track along the relevant aligned field; adjacent objects retain orientation |
| Follow a cause | Track a signal/object along its route while the surrounding relationship develops |
| Discover another side | Arc/orbit using coherent geometry or multi-view media; changing surfaces and occlusion reveal the side |
| Reveal levels | Rise/descend through a section, resolving local activity into the larger arrangement |
| Enter a new environment | Carry a meaningful actor, edge or opening through the view and reveal the next destination |
| Make a rapid handoff | Accelerate along an established route, transfer the anchor and decelerate at the next focus |
| Recognize another scale | Carry a common contour or structure into its parent/detail, adapting detail for the new scale |
| Summarize or revisit | Gather existing objects and reframe to show how the visited parts fit together |

Derive distance, duration and landing from actual layout and reading needs. A depth-relation change may use coupled camera distance/projection to maintain subject size while background spacing changes. Name moves by the rendered result: planar reframing, depth travel, signal tracking and object rotation have distinct visible evidence.

## Choreograph the boundary actor

Use an existing object, heading, value or container to lead into the next idea. A value can leave its evidence panel and join a comparison; contents can regroup; a topic-related prop can pass through the foreground; visited parts can shrink into an overview. Preserve the identifying detail linking old and new roles.

Coordinate actor, camera and arriving composition. The next structure may form while the actor departs or changes role; time attention transfer from its visible action. [Actor handoffs](../recipes/actor-handoffs.md) supplies reference-grounded authoring examples, with [asset-routing.md](asset-routing.md) selecting implementations.

For the content-led share of the piece, derive the handoff from the current mechanism under [content-led-variation.md](content-led-variation.md#转场从当前内容长出来). Preserve its reasoning and continuity rather than repeating a sample's prop or camera route.

## Trajectory, rhythm and handoff

For each important crossing, preserve relevant identity, projected position/size, orientation/detail, occlusion owner, direction and velocity trend. Connect path waypoints with coherent tangent and speed; reserve purposeful deceleration for observation, operation and reading. A visible reversal or retreat can supply its own continuity.

Use the active timing source under [input-contract.md](input-contract.md). Allocate the main change, necessary reading and next handoff first. When an editable reveal finishes early, use a relevant comparison or causal development; fixed audio retains its window. Keep ambient loops finite and subordinate.

## Spatial depth and focus

Guide attention through establish position → move → transfer focus → read. Use occlusion, differential parallax, projected scale and selective sharpness as the chosen view needs them. Assign an old → new focus target. Keep the active object and required text sharp during reading; an overview restores necessary labels. Resolve peripheral fragments through framing and spacing.

Match projection and material to the promised view. A single PNG supports planar movement and limited 2.5D; coherent new faces and interiors require geometry, multi-view material or source video. Orthographic geometry supports changing viewed surfaces; perspective supports a near/far approach. Build the surfaces and depth the route exposes.

For approach, operation or interior reading, specify the observer's scale/eye position, target face and available movement in the existing storyboard. Distinguish camera position, look direction and local object motion. Track moving targets with their local anchors transformed into world coordinates. Let opening surfaces expose content before reading it; bind that content to its page, screen or interior, retaining a recognizable boundary. Coordinate gaze, travel and operation according to when the relevant surface becomes available.

Starting values for exploration: 1.1–1.3× detail reframing, 0.4–0.9s short travel, 0.2–0.4s focus transfer, 2–5px secondary DOM blur at 1080p. Object bounds, resolution, cue density and reading needs determine the actual values.

## Text and reading

Use a stable reading view for exact comparisons/formulas, track a readable focus, or reveal a concise claim during slow approach. Count reading time from the complete, clear, unobstructed state at usable size. Comparisons need a shared readable window.

Author semantic text-motion beats for the hook, mechanism turn and conclusion in narrated or screen-text explainers. Word/glyph assembly, reveal, spacing or transformation should express the selected claim; ordinary labels and captions appear promptly.

Distinguish new text, distant landmarks and revisits. New text enters at its cue; landmarks can exist before receiving focus while preserving the planned reveal; revisits retain established content. Adapt detail with scale while preserving identity and the current claim. World labels follow their targets; narration captions may stay in screen space.

## Storyboard and implementation

Extend the existing beat entry with cue window/discovery; current → next attention target; consequential departure/passage/arrival framing and changed channels; focus and required reading set; continuity anchor, changed role/detail/container; readable window and text case; actual selector/timeline and source. Record the channels needed by that beat.

Reuse appropriate HyperFrames primitives and existing rigs. Carry the reviewed process draft's identities, state changes, poses and transform owners into the finished timeline, retimed to measured cues. Use planar wrappers, shared perspective or real geometry according to the view. Camera, local object motion, text and focus each have a property owner. Glyph/group transforms implement animated spacing predictably.

Drive grouping, detail, focus and local motion from the same seekable composition time, preserving framework clip lifecycle. Apply CSS focus to leaf visuals so the depth rig retains its projection. Photographic media use framework media treatments. Edit the generator and regenerate its HTML/motion data when the project is generated.

For procedural SVG mechanisms, derive labels, paths and moving actors from the same state/projection. When the motion diagnostic cannot identify a dynamically created actor, expose its real position/scale through selector-addressable keyframes, preserving one transform owner. Check the actor's painted attachment and occlusion at contact; a proxy changing internally is not visible-motion evidence.

Review normal-speed travel, changes of visible surface, readable landings, returns, natural completion and reverse/random seek under [quality.md](quality.md). Test a consequential handoff with the intended camera/projection before refining unresolved geometry. Content replacement requires recalculating affected landings and reading windows.
