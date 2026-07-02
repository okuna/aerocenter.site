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

### Map (bundled web app)

The map quiz is a 1400×1200 SVG with over a hundred dynamically positioned
`<input>` overlays (see the main README), so rebuilding it natively would
mean forking the quiz logic. Instead the app renders the same code the
website runs, bundled as a single self-contained page
(`AeroCenter/Resources/map.html`) in a `WKWebView`, which provides the
pinch-zoom and text entry the site already relies on. Google Analytics and
the "Back to AeroCenter Site" button are stripped; everything else (Fill
Answers, Hint, Check Answers, Autocorrect, Toggle Airspace) is unchanged.

`map.html` is **generated** — don't edit it by hand. After changing
`map/map.svg`, `map/quizItems.js`, `map/src.js`, or `map/index.html`,
regenerate it with:

    npm run build:ios-map

(The SVG and scripts are inlined into one file because `fetch()` and
cross-file references don't work reliably from `file://` pages inside
`WKWebView`.)

## Project format

The Xcode project uses Xcode 16's filesystem-synchronized groups, so any
file added under `ios/AeroCenter/` is picked up automatically — there is no
file list to maintain in `project.pbxproj`.
