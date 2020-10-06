# aerocenter.site

This is a project I built back in 2018 while attending the Federal Aviation Administration's ATC Academy. It turns out that I enjoy programming a bit more than doing ATC work. The quality of the code is a bit rough as this was my first project built in JavaScript. 

AeroCenter Site has four parts: 

# Map

The interactive map is the first app that was built. In order to pass the Academy, students have to memorize all of the numbers on the map and then draw it from memory. Since there are so many numbers to memorize (over a hundred, I think), I wanted an easier way of studying rather than using a whiteboard or piece of paper. The itself is an SVG that I drew in the open source app InkScape. The main challenge was finding a way to easily keep track of over a hundred input fields with a position, value, and rotation. Most of the inputs are directly attached to SVG elements, which takes care of position and rotation. The input's value was encoded into the id of the SVG element. 

# Clock

A large part of training involves rehearsing ATC scenarios against a clock. In order to practice, some students would resort to resetting their phone's system time to align with the scenario clock. This was messy and problematic, especially when trying to pause the scenario. I developed this clock app to help in this situation. The goal was to make the clock very easy to set, reset, and pause. 

# Grid

Students are required to memorize a selection of aircraft characteristics. The grid is a simple flash card game with the added benefit of pictures to help with memorization.

# Radar

The most ambitious and complex app in the AeroCenter Site suite. It is an interactive ERAM radar simulation which uses requestAnimationFrame() to update at 60 fps. Rather than use canvas, I went for a vector-based approach. To control the targets, I wrote a basic command line interpreter that uses real ERAM commands. Multiple ERAM commands can be saved into a script which can then be used to create entire scenarios. 
