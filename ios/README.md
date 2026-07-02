# AeroCenter iOS

A native iOS port of the two most-used AeroCenter Site tools: the interactive
map quiz and the non-radar clock.

## Building

Open `ios/AeroCenter.xcodeproj` in Xcode 16 or later, select your team under
Signing & Capabilities, and run on a simulator or device. There are no
external dependencies.

## How it's put together

The app is a SwiftUI `TabView` with two tabs:

### Clock (native)

`AeroCenter/Clock/` is a straight port of the logic in `clock/index.php`:

- A once-per-second timer drives the clock, which starts at the current
  local time and can be offset with the ±1:00 / ±0:10 / ±0:01 controls.
- Start/Pause/Reset/`<<` behave exactly like the website, including the
  green/orange clock background.
- The JAN/GWO/MLU/VKS altimeter table regenerates a random altimeter setting
  (A2980–A3004) and simulated METAR whenever the hour changes.
- The website loads NoSleep.js to keep the screen on; the app disables the
  idle timer while the clock tab is visible instead.

### Map (native)

`AeroCenter/Map/` is a fully native port of the map quiz — no WebKit. The
website positions its 174 quiz `<input>` overlays at runtime from the SVG's
element geometry (see the main README); the app does that measurement once
at **build time** instead:

- `scripts/build-ios-map.js` opens the map in headless Chromium, computes
  every input's position/rotation/alignment with the same placement rules as
  `map/src.js`, extracts the airspace sector overlay text, and writes
  `AeroCenter/Resources/mapData.json`. It also rasterizes `map/map.svg` to
  `AeroCenter/Resources/map.png` at 2x.
- `MapQuizView` renders the raster inside a `UIScrollView`-backed pinch-zoom
  view with a `TextField` positioned over it for each quiz item, and
  `MapQuizModel` ports the quiz logic from `map/src.js` (prefix matching,
  red/yellow wrong-answer highlighting, locking correct answers in green).
- The toolbar has the same actions as the website: Fill Answers, Reset,
  Toggle Airspace, Hint!, Check Answers, and an Autocorrect toggle that
  grades on every keystroke.

`mapData.json` and `map.png` are **generated** — don't edit them by hand.
After changing `map/map.svg`, `map/quizItems.js`, `map/src.js`, or the
sector overlay in `map/index.html`, regenerate them with:

    npm run build:ios-map

(Requires the Playwright Chromium from `npx playwright install chromium`;
set `CHROMIUM_EXECUTABLE` to use a different Chromium binary.) `npm test`
fails if `mapData.json` drifts from the map sources.

## Project format

The Xcode project uses Xcode 16's filesystem-synchronized groups, so any
file added under `ios/AeroCenter/` is picked up automatically — there is no
file list to maintain in `project.pbxproj`.
