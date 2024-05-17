# aerocenter.site

Aerocenter Site is a project I built back in 2018 while attending the Federal Aviation Administration's ATC Academy. The quality of the code is a bit rough as it was the first time I'd built anything in JavaScript. In 2021, AeroCenter Site received around 200 unique users per month, probably making it the most popular online training tool for ATC Academy attendees. 

# Map

![Map Screenshot](/images/map.png)

The interactive map was the first Aerocenter Site app that I built. The Academy requires students to memorize nearly everything on the map and redraw it from memory. The map contains well over a hundred different attributes that must be memorized, and my goal was to develop a tool easier to use than a whiteboard or stacks of paper that my peers were using. 

The map itself is an SVG that I drew in the open source app InkScape. The main challenge was finding a way to easily keep track of over a hundred `<input>` fields with a position, value, and rotation. My solution was to dynamically generate `<input>` tags that inherit position and rotation values from rectangles drawn on the map in InkScape. This solved the issue of having to manually place all of the `<input>` tags. 

The map supports autocorrect, which immediately highlights incorrect answers with red text and a yellow highlight. If a wrong answer is corrected, the red text is removed, but the highlight remains, which should help the user remember which inputs were forgotten. 

## Contributing to the map

If you want to create a new text box on the map, you need to use an SVG editor like [inkscape](https://inkscape.org) (free) to edit `map/map.svg`.

From there, create a new shape or path on the map. Using the object inspector, note the `id` of the shape or path you created. 

Next, update the array variable `vorArray` in `map/src.js`. The format is `"id_answer"`. For instance, the entry `"rect3800_5000"` in the array means, "find the object on the map with id `rect3800` and put a text box on top of it with the correct answer of 5000". 

Finally update line 224 of `map/index.php`: 

    		<script src="src.js?id=202405141">

You need to change the number after `?id=` to a new value. It can be anything, but using the current date makes sense. This is just to force the user's browser to download your new changes to `src.js` rather than using a cached value. 

Once you've done these steps, test your changes and submit a pull request! I've got a very basic deployment pipeline that will automatically publish your changes once the PR is accepted. 

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
