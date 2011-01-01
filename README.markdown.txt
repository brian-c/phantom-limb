Phantom Limb
============

With some mobile webapp projects coming up at Vodori, I though it might be a good time to clean up Phantom Limb, a little mobile web dev utility I've been using. Phantom Limb does just one thing:

It fires a corresponding touch event for each mouse event on the page
---------------------------------------------------------------------

Mobile browsers ensure some basic compatibility with normal sites by simulating mouse events. When a user touches a DOM node, the following events are fired:

1. `touchstart`, as a finger touches the screen
2. `touchmove`, while the finger moves
3. `touchend`, when the finger lifts off the screen

If that node is clickable (it's a button, a link, or has an click event handler), the browser also rapidly fires off the next series of events:

1. `mouseover`
2. `mousemove` (only once)
3. `mousedown`
4. `mouseup`

And if those events don't change the DOM, the browser finally fires:

* `click`

This behavior is a convenience for the user to ensure that pages that utilize mouse events will generally be somewhat functional in a mouse-less environment, but you're going to have much more control and create a better experience in your mobile webapp by using native touch events. Generally not a problem, except desktop browsers don't do anything with touch events, so you'll have to do all your testing on the device itself (or the iOS Simulator app included with the iOS SDK), without the benefit of a decent debugger or comfortable posture.

Phantom Limb makes desktop browsers simulate touch events by dispatching a custom touch event for every mouse event it receives. A `mousedown` fires a `touchstart`, a `mousemove` fires a `touchmove` if the mouse is down, and a `mouseup` fires a `touchend`. These custom events are also assigned a `touches` array containing a reference to the event, just like a real touch event in a mobile browser.

I've only really been running it in Safari, since I'm primarily writing for iOS, but Chrome and Firefox should work okay too. Gestures/multitouch are not currently supported (that'll be quite the trick).

In Firefox, Phantom Limb converts inline `ontouchstart="doSometing();"` handlers into `node.addEventListener(...)` handlers. Inline event handlers can't be triggered by artificially dispatched events in Firefox. By adding listeners for inline handlers (and removing the inline handler) we can simulate touches for these nodes too.

...I lied. Phantom Limb does something else:

It replaces your mouse cursor with a creepy disembodied hand
------------------------------------------------------------

I added this pretty much for my own amusement, and you can shut it off with the button in the bottom right corner. But it can serve a purpose while you're designing and testing a mobile webapp. Fingers are kinda stubby, for one, and tend to be much less accurate than a mouse cursor. By hiding the cursor and providing a sorta-inaccurate faux-finger to faux-poke the screen with, you'll get a better sense of how easy it'll be to poke the right element on a real mobile device. Also, your hand is opaque (I hope) and usually covers up some portion of the screen on a mobile device. By blocking part of the screen, you'll be able to make sure the user will see everything they need to as they're interacting with your app.

[Here's a basic test page](http://dl.dropbox.com/u/557187/phantom-limb/index.html).

And [here it is in action](http://dl.dropbox.com/u/557187/metronome/index.html), applied to my on-again-off-again metronome iPad webapp. Run it in Safari to get the full effect.

Phantom Limb can be activated from this bookmarklet <[Phantom Limb](#SEE-NOTE-BELOW)>

If you want to include it in your project, the latest source can be found on [GitHub](https://github.com/brian-c/phantom-limb).

---

NOTE TO EDITOR: Here's the bookmarklet. Markdown doesn't like it in the link.

javascript:void(function(scriptSrc,imgSrc){var script=document.createElement('script');script.src=scriptSrc;script.type='text/javascript';script.addEventListener('load',function(){if('phantomLimb'in window){phantomLimb.init({src:imgSrc});}else{console.error('Phantom Limb could not be loaded');}},false);document.getElementsByTagName('head')[0].appendChild(script);}('http://dl.dropbox.com/u/557187/phantom-limb/phantomLimb.js','http://dl.dropbox.com/u/557187/phantom-limb/limb-black.png'));