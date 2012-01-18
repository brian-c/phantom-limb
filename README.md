Phantom Limb
============

Brian Carstensen
<<brian.carstensen@gmail.com>>

Phantom Limb simulates basic touch events in desktop browsers, allowing you to utilize the debugging goodness of the WebKit Inspector and Firebug while developing a mobile web app.

This is a complete rewrite of the old version. Totally unfinished.

2.0 Improvements
----------------

* Multi-touch support. Like the Apple's iOS Simulator app, hold down option to get a second finger, and shift to lock that finger's position relative to the first.

* Closer to the actual mobile Safari series of events. All mouse events are captured and stopped, and re-fired after the last touch event takes place.

* No configuration or initialization. It should work by just dropping the script in. Maybe a CSS file. I'd like to add some support for flipping it off and on too.
