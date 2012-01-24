(function(GLOBAL) {
	// Phantom Limb
	// http://viewinglens.com/phantom-limb
	// Brian Carstensen <brian.carstensen@gmail.com>

	"use strict";

	if (!!~navigator.userAgent.indexOf('iP')) return;

	var config = mixin({
		debug: false,
		css: true
	}, GLOBAL.phantomLimb || {});

	if (GLOBAL.phantomLimb) GLOBAL.phantomLimb = config;

	function log() {
		if (config.debug) console.log.apply(console, arguments);
	}

	function mixin(base, over) {
		for (var propertyName in over) {
			if (!over.hasOwnProperty(propertyName)) continue;
			base[propertyName] = over[propertyName];
		}

		return base;
	}

	function bind(fn, context) {
		function boundFn() {
			fn.apply(context, arguments);
		}

		return boundFn;
	}

	function listen(target, eventName, context, handler, _capture) {
		if (typeof context === 'function') {
			_capture = handler;
			handler = context;
			context = target;
		}

		if (typeof handler === 'string') {
			handler = bind(context[handler], context);
		}

		target.addEventListener(eventName, handler, _capture);
	}

	function capture(target, eventName, context, handler) {
		var args = Array.prototype.slice.call(arguments).concat([true]);
		listen.apply(null, args);
	}

	// Keep track of whether the mouse is down.
	var mouseIsDown = false;

	// A Finger is a representation on the screen.
	// It keeps track of its position and the node that it's over.
	function Finger(options) {
		mixin(this, options);

		this.node = document.createElement('span');
		this.node.classList.add('_phantom-limb_finger');

		// Add a node per finger.
		// Probably not the most efficient way to do this.
		if (document.readyState === 'complete') {
			document.body.appendChild(this.node);
		} else {
			listen(window, 'load', this, 'place');
		}
	}

	Finger.prototype = {
		node: null,

		x: NaN,
		y: NaN,

		target: null,

		place: function() {
			document.body.appendChild(this.node);
		},

		hide: function() {
			this.node.style.display = 'none';
		},

		show: function() {
			this.node.style.display = '';
		},

		move: function(x, y) {
			if (isNaN(x) || isNaN(y)) {
				this.hide();

				this.target = null;
				this.startTarget = null;
			} else {
				this.show();

				this.node.style.left = x + 'px';
				this.node.style.top = y + 'px';

				this.x = x;
				this.y = y;

				if (!mouseIsDown) this.target = document.elementFromPoint(x, y);
			}
		}
	};

	// Here we'll instantiate the fingers we'll use in the rest of the script.
	var fingers = [
		new Finger(),
		new Finger()
	];

	// Create a synthetic event from a real event and a finger.
	function createMouseEvent(eventName, original, finger) {
		var e = document.createEvent('MouseEvent');

		e.initMouseEvent(eventName, true, true,
			original.view, original.detail,
			finger.x || original.screenX, finger.y || original.screenY,
			finger.x || original.clientX, finger.y || original.clientY,
			original.ctrlKey, original.shiftKey,
			original.altKey, original.metaKey,
			original.button, finger.target || original.relatedTarget
		);

		e.synthetic = true;

		return e;
	}

	var startDistance = NaN;
	var startAngle = NaN;

	// Given a mouse event, fire a touch event for each finger.
	// Add the appropriate touch-specific event properties.
	function fireTouchEvents(eventName, originalEvent) {
		// All touch events, including "touchend".
		var events = [];

		// For each finger with a target, create a touch event.
		fingers.forEach(function(finger) {
			if (!finger.target) return;

			// Convert "ontouch*" properties and attributes to listeners.
			var onEventName = 'on' + eventName;

			if (onEventName in finger.target) {
				console.warn('Converting `' + onEventName + '` property to event listener.', finger.target);
				listen(finger.target, eventName, finger.target[onEventName]);
				delete finger.target[onEventName];
			}

			if (finger.target.hasAttribute(onEventName)) {
				console.warn('Converting `' + onEventName + '` attribute to event listener.', finger.target);
				var handler = new Function('event', finger.target.getAttribute(onEventName));
				listen(finger.target, eventName, handler);
				finger.target.removeAttribute(onEventName);
			}

			// Set up a new event with the coordinates of the finger.
			var touch = createMouseEvent(eventName, originalEvent, finger);

			// Set this so we can match shared targets later.
			touch._fingerTarget = finger.target;

			// These will be filled in once all touch events are created.
			touch.touches = [];
			touch.changedTouches = [];
			touch.targetTouches = [];

			events.push(touch);
		});

		// Figure out scale and rotation.
		// TODO: Gesture support.
		if (events.length > 1) {
			var x = events[0].pageX - events[1].pageX;
			var y = events[0].pageY - events[1].pageY;

			var distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
			var angle = Math.atan2(x, y) * (180 / Math.PI);

			if (eventName === 'touchstart') {
				startDistance = distance;
				startAngle = angle;
			}

			events.forEach(function(event) {
				event.scale = distance / startDistance;
				event.rotation = startAngle - angle;
			});
		}

		// Loop through the events array and fill in each touch array.
		events.forEach(function(touch) {
			touch.touches = events.filter(function(e) {
				return e.type !== 'touchend';
			});

			touch.changedTouches = events.filter(function(e) {
				return e._fingerTarget === touch._fingerTarget;
			});

			touch.targetTouches = touch.changedTouches.filter(function(e) {
				return e.type !== 'touchend';
			});
		});

		// Then fire the events.
		events.forEach(function(event) {
			event._fingerTarget.dispatchEvent(event);
		});
	}

	// Prevent all mousedown event from doing anything.
	// We'll fire one manually at touchend.
	function phantomTouchStart(e) {
		if (e.synthetic) return;

		mouseIsDown = true;

		e.preventDefault();
		e.stopPropagation();

		fireTouchEvents('touchstart', e);
	}

	// The center between two fingers
	var centerX = NaN;
	var centerY = NaN;

	// Set each finger's position target.
	// Pressing alt engages the second finger.
	// Pressing shift locks the second finger's position relative to the first's.
	function moveFingers(e) {
		// We'll use this if the second is locked with the first.
		var changeX = e.pageX - fingers[0].x || 0;
		var changeY = e.pageY - fingers[0].y || 0;

		// The first finger just follows the mouse.
		fingers[0].move(e.pageX, e.pageY);

		// TODO: Determine modifier keys independent of mouse movement.

		if (e.altKey) {
			// Reset the center.
			if (!centerX && !centerY) {
				centerX = window.innerWidth / 2;
				centerY = window.innerHeight / 2;
			}

			// Lock the center with the first finger.
			if (e.shiftKey) {
				centerX += changeX;
				centerY += changeY;
			}

			var secondX = centerX + (centerX - e.pageX);
			var secondY = centerY + (centerY - e.pageY);

			fingers[1].move(secondX, secondY);
		} else {
			// Disengage the second finger.
			fingers[1].move(NaN, NaN);

			// Reset the center next time the alt key is held.
			centerX = NaN;
			centerY = NaN;
		}
	}

	// Prevent all mousemove events from firing.
	// We'll fire one (and only one) manually at touchend.
	function phantomTouchMove(e) {
		if (e.synthetic) return;

		e.preventDefault();
		e.stopPropagation();

		moveFingers(e);

		if (mouseIsDown) {
			fireTouchEvents('touchmove', e);
		}
	}

	// Prevent all mouseup events from firing.
	// We'll fire one manually at touchend.
	function phantomTouchEnd(e) {
		if (e.synthetic) return;

		mouseIsDown = false;

		e.preventDefault();
		e.stopPropagation();

		fireTouchEvents('touchend', e);

		fingers.forEach(function(finger) {
			if (!finger.target) return;

			// Mobile Safari moves all the mouse event to fire after the touchend event.
			finger.target.dispatchEvent(createMouseEvent('mouseover', e, finger));
			finger.target.dispatchEvent(createMouseEvent('mousemove', e, finger));
			finger.target.dispatchEvent(createMouseEvent('mousedown', e, finger));

			// TODO: These two only fire if content didn't change. How can we tell?
			finger.target.dispatchEvent(createMouseEvent('mouseup', e, finger));
			finger.target.dispatchEvent(createMouseEvent('click', e, finger));
		});
	}

	// Prevent clicks. We'll handle them manually.
	function phantomClick(e) {
		if (e.synthetic) return;

		e.preventDefault();
		e.stopPropagation();
	}

	// TODO: Make these toggleable?
	capture(document, 'mousedown', phantomTouchStart);
	capture(document, 'mousemove', phantomTouchMove);
	capture(document, 'mouseup', phantomTouchEnd);
	capture(document, 'click', phantomClick);

	// Finally, we'll add a class to the root element.
	document.documentElement.classList.add('_phantom-limb');
}(this));
