# aerocenter.site

Aerocenter Site is a project I built back in 2018 while attending the Federal Aviation Administration's ATC Academy. The quality of the code is a bit rough as it was the first time I'd built anything in JavaScript. In 2021, AeroCenter Site received around 200 unique users per month, probably making it the most popular online training tool for ATC Academy attendees. In 2025, this has increased to around 400 users per month! 

# Map

![Map Screenshot](/images/map.png)

The interactive map was the first Aerocenter Site app that I built. The Academy requires students to memorize nearly everything on the map and redraw it from memory. The map contains well over a hundred different attributes that must be memorized, and my goal was to develop a tool easier to use than a whiteboard or stacks of paper that my peers were using. 

The map itself is an SVG that I drew in the open source app InkScape. The main challenge was finding a way to easily keep track of over a hundred `<input>` fields with a position, value, and rotation. My solution was to dynamically generate `<input>` tags that inherit position and rotation values from rectangles drawn on the map in InkScape. This solved the issue of having to manually place all of the `<input>` tags. 

The map supports autocorrect, which immediately highlights incorrect answers with red text and a yellow highlight. If a wrong answer is corrected, the red text is removed, but the highlight remains, which should help the user remember which inputs were forgotten. 

## Contributing to the map

If you want to create a new text box on the map, you need to use an SVG editor like [inkscape](https://inkscape.org) (free) to edit `map/map.svg`.

From there, create a new shape or path on the map. Using the object inspector, note the `id` of the shape or path you created.

Next, add a new entry to the `mapQuizItems` array in `map/quizItems.js`. Each entry is an object with three fields:

    { id: "rect3800", answer: "5000", type: "boundary" }

| Field    | What it means |
|----------|---------------|
| `id`     | The `id` of the SVG shape or path you want to put a text box on top of (from the InkScape object inspector). |
| `answer` | The correct answer the user is being quizzed on (e.g. `"5000"`, `"V417"`, `"MHZ"`). |
| `type`   | Determines how the input box is rendered. One of: |
|          | • `"label"` — airport/NAVAID/intersection labels (text input, placeholder `ABC`). |
|          | • `"airway"` — airway names like V417 (text input, placeholder `V00`). |
|          | • `"vorDegree"` — radial degrees around a VOR (numeric input, rotated around the VOR center using the degree value as the angle). |
|          | • `"boundary"` — boundary/altitude numbers in diamond boxes (numeric input, placeholder `00`; `rect*` IDs also inherit the SVG's `transform` rotation). |

So the entry `{ id: "rect3800", answer: "5000", type: "boundary" }` means, "find the object on the map with id `rect3800` and put a boundary text box on top of it with the correct answer of 5000."

Finally update the `?id=` query parameter on both script tags in `map/index.html`:

    		<script src="quizItems.js?id=202405141"></script>
    		<script src="src.js?id=202405141"></script>

You need to change the number after `?id=` to a new value (use the same value on both tags). It can be anything, but using the current date makes sense. This is just to force the user's browser to download your new changes rather than using a cached value.

Once you've done these steps, test your changes and submit a pull request (PR)! Your PR should have three files changed: (1) map.svg, (2) the array in quizItems.js, and (3) the `?id=` values in index.html. Please attach a screenshot to the PR of what your changes look like. Once I review and accept your PR, your changes will be automatically deployed onto the live site. Thank you for helping to keep Aerocenter Site up to date! 

# Clock

![Clock Screenshot](/images/clock.png)

A large part of training involved rehearsing ATC scenarios against a clock. In order to practice, some students would resort to resetting their phone's system time to align with the scenario clock. This was messy and problematic, especially when attempting to pause a scenario. I developed this clock app with the goals of making it easy to set and pause. 

The table of text below the clock is represents METAR weather data for airports within the Aerocenter airspace. The altimeter values randomly update each time the clock's hour changes. 

# Grid

![Grid Screenshot](/images/grid.png)

Students are required to memorize a selection of aircraft characteristics. The grid is a simple flash card game with the added benefit of pictures to help with memorization.

Aircraft are sorted into columns indicating their speed (in knots, at the top row), and type (1 P S = single engine, piston, small).

# Radar

![Radar Screenshot](/images/radar.png)

The radar simulator is the most ambitious and complex app in the AeroCenter Site suite. It is an interactive ERAM radar simulation which uses `requestAnimationFrame()` to update at 60 frames per second. 

This app contains a basic command line interpreter which is modeled after real ERAM commands. For instance, the user can enter a `fp` command to generate a target with a flight plan and speed, which will appear on the map and fly to the points provided in the flight plan. Other commands can adjust a plane's altitude or simulate a point out to adjacent sectors. 

One challenge was mapping the screen coordinate space (in pixels) to real world coordinates. The map's real world location was determined using the location of JAN VORTAC (in the center of the screen). The app contains a database of all airports and navigation fixes in the country, which allows targets to actually "fly" to any airport offscreen in the correct direction. 

Multiple commands can be saved as a script which are activated according to the clock. This allows the user to generate scenarios with airplanes that automatically take off or fly through the sector. 
