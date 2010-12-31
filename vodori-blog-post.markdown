Phantom Limb
============

With some mobile web app projects coming up at Vodori, I though it might be a good time to clean up Phantom Limb, a little mobile web dev utility I've been using. Phantom Limb does one thing:

It fires a corresponding touch event for each mouse event on the page
---------------------------------------------------------------------

Mobile browsers ensure some basic compatibility with normal sites by simulating mouse events. When a user touches a DOM node, the following events are fired:

1. touchstart, as a finger touches the screen
2. touchmove, while the finger moves
3. touchend, when the finger lifts off the screen

If that node is clickable (it's a button, a link, or has an click event handler), the browser also rapidly fires off the next series of events:

1. mouseover
2. mousemove (only once)
3. mousedown
4. mouseup

And if those events don't change the DOM, the browser finally fires:

* click

This behavior is a convenience for the user to ensure that pages that utilize mouse events will generally be somewhat functional, but you're going to have much more control and create a better experience in your mobile web app by using native touch events. Not a problem, except desktop browsers don't do anything with touch events, so you'll have to do all your testing on the device itself, without the benefit of a decent debugger or comfortable posture.

**Phantom Limb makes desktop browsers simulate touch events** by dispatching a custom touch event for every mouse event it receives. A mousedown fires a touchstart, a mousemove fires a touchmove if the mouse is down, and a mouseup fires a touchend. These custom events are also assigned a touches property containing the event, just like a real touch event in a mobile browser.

I've only really been running it in Safari, since I'm primarily writing for iOS, but Chrome and Firefox should work okay too. Gestures/multitouch are not currently supported (that'll be quite the trick).

As a sidenote, Phantom Limb also converts inline (ontouchstart="doSometing();") handlers into node.addEventListener handlers. Inline event handlers can't be triggered by artificially dispatched events. By addling listeners for inline handlers (and removing the inline handler) we can simulate touches for these nodes too. Caveat: nodes with inline event listners created after the page loaded won't be converted.

I lied. Phantom Limb does something else:

It replaces your mouse cursor with a creepy disembodied hand
------------------------------------------------------------

I added this pretty much for my own amusement. But it also provides two very practical services for designing and testing a mobile web app. Fingers are kinda stubby, for one, and tend to be much less accurate than a mouse cursor. Hiding the cursor and providing a sorta-inaccurate faux-finger to faux-poke the screen with, you'll get a better sense of how easy it is to be to poke the right element of your design. Also, your hand is opaque and usually covers up some portion of the screen on a mobile device. By blocking part of the screen, you'll be able to make sure the user will see everything they need to as they're interacting with your app.

<a href="#">Here's a basic test page</a>.

And <a href="#">here it is in action</a>, applied to my on-again-off-again metronome app.

Phantom Limb can be run from this bookmarklet (<a href="javascript:void();">Phantom Limb</a>), and if you want to include it in your project, the source can be found on <a href="#">GitHub</a>.