# Motion direction

This file owns shared camera, motion, reading and boundary behavior. User direction overrides its creative defaults; resolve style-specific expression through the effective project `frame.md`.

## Shared world and teaching action

Default to a continuous, explorable visual world: reach each new explanatory view through visible spatial movement. Carry objects and their relationships across beats and scene boundaries. Plan the world and route together with the teaching spine, before implementing individual scenes. Several teaching beats may occupy one continuous composition.

Arrange concepts by their relationship: neighbors, nesting, branching, layers, convergence or return. The viewport is a window onto that arrangement. A glimpse of the next destination, a continuing path or a familiar landmark can establish space beyond the frame. A finite authored world is sufficient; an opening overview is optional.

Before placing objects, map each consequential handoff to the relationship the viewer must learn: travel between peers, enter a part, follow a cause, compare branches, return along a process, or gather parts into a whole. Place the destinations so their spatial relationship can be discovered through the view, then choose the camera route. Run a route-contrast pass across the whole piece: when the teaching relationship changes, make the camera's framing behavior change with it through a meaningful difference in travel direction, scale, viewing angle/depth, focal tracking, or coordinated object reconfiguration. If several different relationships all become the same single-axis slide between separate panels, revise the world layout before animating. A genuinely linear relationship can use a linear route; preserve its clarity instead of adding an unrelated move.

Let the world develop visibly. Evidence can gather into a group; a detailed object can become a node inside its parent; a structure can unfold as the camera retreats. Preserve recognizable identities and explain changed positions through visible motion. Revisited places retain a comprehensible relationship to their surroundings.

Establish the relevant objects, show the explanatory change, allow comparison, then carry the result forward. These are local teaching functions, not mandatory camera stops. Control one explanatory variable when the comparison requires it; camera, objects and labels may otherwise move together around one primary attention target. Camera travel complements the mechanism it exposes.

## Choose and combine moves

Choose by what the audience should discover. These are reusable choices, not a closed catalog or a required effect count. Combine translation, scale, viewing angle and object choreography around one traceable route; derive distances and timing from the actual layout and reading task.

| Intended discovery | Useful move and visible result |
| --- | --- |
| Inspect a detail or enter a mechanism | **Push-in / pull-out:** approach a recognizable region; retreat to restore its context. Carry the boundary into an interior view when the content genuinely continues there. |
| Compare neighbors or browse evidence | **Lateral/diagonal tracking:** travel along an aligned field or angled gallery; adjacent objects supply orientation while the active item takes focus. |
| Follow a cause to its result | **Follow / lead:** accompany a signal or object along its route, keeping the focal action relatively steady in screen space; lead the turn toward its destination. |
| Discover another side or reveal hidden structure | **Arc / orbit:** travel around an anchor while keeping it recognizable; changing occlusion and perspective reveals the other side. Use coherent depth for a true orbit; use a curved planar route when the world is flat. |
| Reveal levels or the whole system | **Rise / descend / crane-like reveal:** change viewing height and, where useful, distance or angle; resolve local activity into its larger layout. A vertical planar scan is also valid when depth adds nothing. |
| Cross into an adjacent area or chapter | **Foreground reveal / passage:** approach a meaningful edge or opening, let it cross the view, then reveal the next destination with consistent direction and depth. |
| Make an urgent, connected handoff | **Whip / rapid sweep:** accelerate along an established direction, transfer the recognizable anchor and decelerate at the next focus. Keep orientation legible; blur is optional and the reading view is clear. |
| Recognize the same relationship at another scale | **Match-and-transform / nested reveal:** align a shared shape, contour or structure through continuous motion; simplify detail as the object becomes part of its parent. |
| Collect evidence, summarize or revisit | **Gather + reframe / overview return:** coordinate object grouping with camera retreat or approach; reveal previously visited places in one meaningful arrangement. |

For a justified change in perceived depth, a **dolly-zoom-like move** can keep the subject's projected size steady while background spacing changes. This requires actual depth and coupled camera distance/projection; scaling a flat scene does not establish it. Treat it as a selective emphasis, not a default transition. Focus transfer between depth planes may support a reveal, but focus alone does not provide spatial travel.

Allow decisive travel: a region may cross the full viewport, a detail may fill it, and a foreground shape may briefly crop beyond it. Vary path, distance, angle, speed and landing composition according to content. Repeated paths are useful for repeated processes; otherwise revise adjacent moves that all use the same small zoom or same-direction slide. Keep an intelligible visual motif across the variation.

Name a move by what the viewer actually sees. Entering a detail keeps the source object identifiable as its projected size grows and its interior takes over; sliding to a separate detail panel is travel between peers. Following a signal keeps that signal relatively stable in screen space while the surrounding route changes. Returning to an overview reveals how the visited parts fit together. Use these visible relationships to distinguish a designed camera move from a label attached to a generic translation.

## Trajectory, rhythm and handoff

Use one continuity contract within and across implementation boundaries: retained identity; projected position and size; orientation and visible detail; occlusion/layer ownership; travel direction and velocity trend. Record only the channels needed for the actual move. The outgoing state, passage and arriving state should make the route understandable without a spoken location cue. A cut followed by an unrelated entrance or a repeated color alone does not meet this default; an explicit user choice of cuts overrides it.

Keep tangent and speed coherent through travel waypoints. Shape acceleration for departure, passage, turning and arrival instead of restarting an ease-out at every cue. Reading stops, deliberate reversals and close passes followed by retreat are valid when their trajectories are visible. Combine short, large transfers with longer explanatory views; continuous space does not require continuous high speed.

Map actions to the active timing authority in [input-contract.md](input-contract.md). Preserve fixed audio windows. When a reveal finishes early, use necessary comparison, a causal development or approach to the next focus; shorten only timing that is actually editable. Repeated ambient motion stays finite and subordinate.

## Text and reading

Choose a readable window appropriate to the task: stop for exact comparisons or formulas; follow a moving focus so its screen position stays stable; or reveal a short claim during a slow approach/retreat. Required information has sufficient size, contrast and time in that window. During travel, peripheral content may crop, overlap or become too small to read while the focal anchor remains trackable.

For narrated and screen-text explainers, author semantic text-motion beats in the hook, a mechanism turn and the conclusion. Animate consequential words or glyph groups through assembly, reveal, spacing, emphasis or transformation that expresses their meaning. Whole-world camera motion alone does not fulfill text choreography. Keep ordinary labels and captions promptly readable.

Distinguish three cases: new text is concealed until its entrance cue, which creates its first appearance; a distant landmark may already exist before receiving readable focus, without prematurely revealing a withheld answer; a revisit retains the known text rather than hiding and retyping it. The storyboard identifies which case applies. A moving heading can become a landmark after its authored entrance.

At changing scales, keep the identity and the detail needed by the current claim. A near view may show document contents; its parent view may show only a recognizable document and short label. Author that detail handoff only where needed. Object labels belong to the world; narration captions may remain in a separate screen-space reading layer.

## Storyboard and implementation

Extend the existing `STORYBOARD.md` beat/boundary entry once with: cue window and intended discovery; world relationship and focal object; departure, passage and arrival views with the camera/object channels that actually change; continuity anchor and changed detail; readable window and text case; implementation selector/timeline and source. Compare the successive entries using the route-contrast pass above before committing to the world layout. Do not create a parallel camera plan or require the same pose sequence for every beat.

Reuse appropriate HyperFrames primitives first. A project-authored path is valid when the storyboard points to its real implementation; a recipe name is not evidence of an effect. Carry the approved rough route's camera poses and transform owner into the finished timeline; retime them against measured cues as needed rather than replacing the route with generic panel translations. Use a shared visual wrapper for planar camera transforms, shared perspective for depth when useful, and true 3D only when the needed geometry/viewpoint warrants it. Give camera movement, local object motion and text reveals separate transform owners. Implement animated text spacing through glyph/group transforms so browser text reflow does not introduce stepping. Keep framework-owned clip lifecycle intact; all these states derive from the same seekable composition time, including grouping and detail handoffs.

Review actual travel, readable states, returns and seek behavior under [quality.md](quality.md). Match the visual claim to the evidence: flat reframing, depth travel and object self-rotation are different operations.
