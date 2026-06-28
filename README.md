# Codex's Star Sprint

An original educational browser platformer inspired by classic 8-bit side-scrolling design. The playable character is Codex, the built-in original Codex companion/avatar, with custom level layouts and original naming while preserving the familiar verbs: run, jump, collect coins, bonk blocks, stomp enemies, avoid hazards, and reach the goal.

The adventure currently includes four courses: World 1-1, World 1-2, World 1-3, and World 1-4, with distinct overworld, underground cavern, sky-bridge, and fortress visual themes. The overworld now uses a blocky starting castle plus flat, chunky parallax clouds, hills, and bushes instead of a soft generated backdrop, so the scene reads closer to a classic 8-bit side-scroller while jumping. Score, coins, lives, and power state carry forward between courses through a compact arcade-style score strip, with a black arcade-style world/lives intro before each course. The playfield uses a tighter 768x432 side-scroller viewport with a bottom-locked vertical camera, so characters, blocks, and hazards sit closer to classic platformer framing and jumps move Codex through the world instead of bobbing the whole stage. Overworld and sky-course gaps now render as open bottomless pits instead of spike traps, while fortress courses keep visible lava hazards. Every 100 coins awards an extra life with a visible 1-Up popup and jingle, the clock gives a one-shot hurry-up warning when the final 100 seconds begin, and losing a life now freezes the world for a failure hop and fall before restarting the course clock from the start or a quiet hidden midpoint checkpoint. Enter or P pauses an active course, freezes the world, and preserves the remaining timer until play resumes. World 1-2 now hides a classic-style warp zone near the exit, with an in-world banner and pipe destination labels for skipping ahead to World 1-3 or World 1-4 while preserving score, coins, lives, and power. World 1-3 includes moving sky lifts, paired balance lifts that rise and fall under Codex's weight, falling lifts that shake and drop after Codex lands on them, springboards for high vertical routes, plus timed cannon launchers that fire stompable shots across the playfield. World 1-4 adds lava runs, rotating firebars, arcing hammer throwers, leaping lava bubbles, more cannon pressure, springboard recovery jumps, a fireball-throwing fortress guardian, and a gate switch finale. The camera scrolls forward and locks the left screen edge behind Codex, matching the classic side-scroller pressure to keep moving. Enemies now wake only as the camera nears them, then keep marching off ledges and into gaps instead of pre-simulating the entire course or politely avoiding pits. Basic walkers, shellbacks, and winged shellbacks use crisp two-frame walk or flap cycles while they patrol, making their motion read more like classic side-scroller enemies instead of static sliding hazards. Movement now leans harder into classic inertia: slower acceleration, longer skid-outs, weaker air steering, speed-carried jump height, and small dust puffs for running, skidding, and landing feedback. Coins rotate in place, popped block coins spin upward, and question blocks shimmer until they are spent. Some question blocks can be hit repeatedly for timed coin payouts, a few hide extra-life pickups, and invisible secret blocks appear when bonked from below. Bonked blocks pop upward, ordinary bricks can hide single coins or timed multi-coin payouts, and powered brick smashes burst into themed tumbling chunks. One hidden block grows a climbable vine up to a cloud coin platform. Conduit plants emerge and retreat on timers, staying hidden when Codex is close to the pipe. Growth and spark pickups now briefly freeze play with classic state-flicker feedback before Codex resumes. Hold Down or S while powered up to crouch under low brick lanes. Powered hits now visibly pause, shrink or strip spark power, and grant a classic flickering invulnerability window before a later hit costs a life. Stand on marked conduits and press Down or S to duck into secret coin routes and warp-pipe shortcuts; World 1-1 now drops Codex into a compact blue-brick underground bonus chamber before rising out of the exit pipe. Bonking blocks can knock out enemies standing above them, and powered Codex can smash brick blocks from below. Stomp chains and sliding shells award rising score popups, then turn into 1-Up rewards when the chain keeps going; basic walkers visibly flatten and dust out when stomped. Some enemies tuck into shells when stomped; winged shellbacks first lose their wings, then behave like normal shell enemies. Kick a shell to clear other enemies, ricochet off walls, and strike brick or bonus blocks from the side, but idle shells flash and wake back up if ignored too long. Prism stars pop out of special blocks and briefly let Codex defeat enemies by touch, and spark shots now skip along the ground for a few low bounces before fizzling while still knocking thrown hammers out of the air. Higher banner grabs award bigger flag bonuses, then Codex slides down a pole with a bright top marker, runs into a blocky castle-style goal house, earns timer-digit fireworks when the clock ends in 1, 3, or 6, and cashes out remaining time as score.

Basic walkers now use squat brown mushroom-like silhouettes with a matching flattened stomp frame, so the most common enemy reads closer to a classic side-scroller threat.

Shellbacks now use side-facing shell-creature silhouettes with stronger outlines, visible heads, feet, shell bands, flapping wings, and a clearer tucked-shell warning frame, so stomp/kick states read closer to classic shell enemy behavior at a glance.

Ground, platform, brick, question, and spent-block tiles now share chunkier pixel outlines, brick seams, corner rivets, and a clearer question-mark silhouette, so the first screen reads less like a custom soft platformer and more like an 8-bit side-scroller course.

Conduits now use brighter hard-edged green pipe tiles with dark rims, vertical seams, and matching sharper pipe-plant art, making the repeated pipe obstacles read closer to classic side-scroller landmarks.

Coins and power-ups now use harder pixel outlines and more classic pickup silhouettes: gold rotating coins, red growth mushrooms, green extra-life mushrooms, a flower-like spark upgrade, and a cleaner star.

World 1-1's main route now uses sparser floating coins, keeping dense coin trails for cloud, bonus, and secret routes so the opening stretch feels more like a classic block-and-enemy course than a collectathon.

World 1-1's opening layout now keeps the early ground more continuous, spaces green conduit landmarks more deliberately, and uses brick/question-block formations instead of generic platform chunks through the first-course teaching stretch. The visible ground remains two tiles thick like the classic opening, but only the top row is a playable floor; the lower fill row uses separate art and collision is disabled so powered Codex cannot sink into it.

Hidden blocks placed right beside 食人花 / pipe-plant jump lanes were removed, so dodging or jumping around the plant no longer bonks Codex into a surprise block at the worst moment.

Flagpoles and castle goals now use harder pixel silhouettes: a blocky green banner, outlined pole, pixel top cap, heavier base, and a more crenellated brick castle facade.

Spent blocks still give a small bonk animation and low thud when hit from below, preserving classic block feedback after their reward is gone.

World 1-2 now frames the underground route with a low blue-brick ceiling, then splits into a normal final exit pipe and a raised brick route that rewards exploration with the warp-zone pipes.

World 1-2's warp-zone pipes are short enough to recover from the lower floor if Codex drops below them, while their Down/S warp triggers remain aligned to the pipe tops.

Small-form Codex is scaled closer to classic one-tile character proportions, while powered Codex still grows into a visibly larger form. Growth and extra-life pickups now rise from behind the block before walking away, prism stars sparkle and bounce away, and spark upgrades pop up and wait on the block like a classic flower-style power-up. Power-up blocks keep producing the flower-style spark pickup while Codex is powered, and duplicate spark pickups pay out score without replaying the transformation pause.

Jumps now use a more classic held-rise and fast-fall arc: holding jump preserves the taller run jump, while releasing jump early or descending pulls Codex down more sharply.

Codex's airborne pose now comes from the same original companion spritesheet as idle and run frames, avoiding the occasional one-frame shimmer from swapping to a separate jump image during takeoff and landing.

Course timers now use classic 400/300-style starting counts and tick faster than real seconds, with the hurry-up warning still firing at the final 100 counts.

The in-course HUD now follows the classic four-field strip: Codex score, coin count, world, and time, with lives shown on the world intro instead of during play.

The browser shell now frames the playfield like a simple console capture: the stage is top-aligned on a black surround with no decorative app-card gradient or drop shadow, keeping attention on the pixel course.

World/lives interstitials between courses now auto-advance after a short classic pause, while the first title screen still waits for Start. Course-clear handoffs also use a brief black arcade card and then continue to the next world without a manual button press.

Life loss now resets the course scene through that same world/lives interstitial, preserving score, coins, lives, and hidden midpoint position while restoring enemies, blocks, and pickups.

Flagpole clears now snap Codex to the pole, slide both Codex and the banner down, hop Codex off to the right, and then send Codex into the goal house.

Active courses include a quiet original chiptune loop that starts after play begins, speeds up after the low-time warning, temporarily gives way to a faster original invincibility loop during prism star power, and silences on pause, transitions, life loss, and clear screens.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Controls

- Move: Arrow keys or A/D
- Jump: Up, W, or Space
- Run / spark shot: Shift
- Crouch / enter conduit: Down or S
- Spark shot alternate: X or K after collecting the second-stage power-up
- Start / pause: Enter
- Pause: P
- Restart: R
- Shortcuts: ?
