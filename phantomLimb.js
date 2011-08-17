// Phantom Limb
// Simulate touch events in desktop browsers
// Brian Carstensen <brian.carstensen@gmail.com>

window.phantomLimb = (function() {
	debug = false;

	var supportsNativeTouch = 'ontouchstart' in document.createElement('button');
	
	// This will fake an arbitrary event on a node and add in the extra touch-related properties
	var fireTouchEvent = function(originalEvent, newType) {
		var newEvent = document.createEvent('MouseEvent');
		newEvent.initMouseEvent(newType, true, true, window, originalEvent.detail,
				originalEvent.screenX, originalEvent.screenY, originalEvent.clientX, originalEvent.clientY,
				originalEvent.ctrlKey, originalEvent.shiftKey, originalEvent.altKey, originalEvent.metaKey,
				originalEvent.button, originalEvent.relatedTarget
		);
		
		// Touch events have a touches array, which contains kinda-sub-event objects
		// In this case we'll only need the one
		if (!('touches' in newEvent)) newEvent.touches = newEvent.targetTouches = [newEvent];

		// And and they have "page" coordinates, which I guess are just like screen coordinates
		if (!('pageX' in newEvent)) newEvent.pageX = originalEvent.clientX;
		if (!('pageY' in newEvent)) newEvent.pageY = originalEvent.clientY;

		// TODO: Read the spec, fill in what's missing

		if (debug) console.log('Created simulated ' + newType + ' event', newEvent);

		// Fire off the new event
		if (debug) console.log('Firing simulated ' + newType + ' event', originalEvent.target);
		originalEvent.target.dispatchEvent(newEvent);
	};
	
	// node.ontouch* must be added as an event listener
	var convertPropped = function(node, event) {
		var handler = node['on'+event];
		if (!handler) return;

		console.info('Phantom Limb is converting an on'+event + ' event handler property to an added event listener', node);
		node.addEventListener(event, handler, false);

		delete node['on'+event];
	};
	
	// <node ontouch*="" /> must be added as an event listener
	var convertInlined = function(node, event) {
		var handler = node.getAttribute('on'+event);
		if (!handler) return;
		
		console.info('Phantom Limb is converting an inline ' + event + ' event handler to an added event listener', node);

		node.removeAttribute('on'+event);
		node.addEventListener(event, new Function('event', handler), false);
	};

	// Attach the main mouse event listeners to the document
	var attachDocTouchListeners = function() {
		// Keep track for touchmove
		var mouseIsDown = false;

		document.addEventListener('mousedown', function(e) {
			convertPropped(e.target, 'touchstart');
			convertInlined(e.target, 'touchstart');

			fireTouchEvent(e, 'touchstart');

			mouseIsDown = true;
		}, false);

		document.addEventListener('mousemove', function(e) {
			if (!mouseIsDown) return;
			
			convertPropped(e.target, 'touchmove');
			convertInlined(e.target, 'touchmove');

			fireTouchEvent(e, 'touchmove');
		}, false);

		document.addEventListener('mouseup', function(e) {
			convertPropped(e.target, 'touchend');
			convertInlined(e.target, 'touchend');

			mouseIsDown = false;

			fireTouchEvent(e, 'touchend');
		}, false);

		// TODO: touchcancel?
	};
	
	var pointer = document.createElement('img');
	var isPointing = false;
	
	// Create a cheesy finger that follows around the cursor
	// "options" includes src, x, y, and opacity
	createPointer = function(options) {
		pointer.src = options.src;

		pointer.style.position = 'fixed';
		pointer.style.left = '9999em';
		pointer.style.top = '9999em';
		pointer.style.zIndex = 9999;

		pointer.style.opacity = options.opacity;
		pointer.style.WebkitTransformOrigin = options.x + 'px ' + options.y + 'px';
		pointer.style.MozTransformOrigin = options.x + 'px ' + options.y + 'px';

		document.body.appendChild(pointer);
		document.documentElement.style.cursor = 'crosshair';
		
		document.addEventListener('mousemove', function(e) {
			pointer.style.left = e.clientX - options.x + 'px';
			pointer.style.top = e.clientY - options.y + 'px';
			
			var triWidth  = (options.lefty ? 0 : -window.innerWidth) + e.clientX;
			var triHeight = window.innerHeight - e.clientY;
			var triHypo   = Math.sqrt(Math.pow(triWidth, 2) + (Math.pow(triHeight, 2)));
	
			var angle = Math.acos(triHeight / triHypo) / (2 * Math.PI) * 360;
			angle = angle / 1.5;
			
			pointer.style.WebkitTransform = 'rotate(' + (options.lefty ? 1 : -1) * angle + 'deg) scaleX(' + (options.lefty ? -1 : 1) + ')';
			pointer.style.MozTransform = 'rotate(' + (options.lefty ? 1 : -1) * angle + 'deg) scaleX(' + (options.lefty ? -1 : 1) + ')';
		}, false);
	};
	
	return {
		init: function(options) {
			settings = {
				debug: false,
				force: false,
				src: '',
				x: 100,
				y: -7,
				opacity: 1,
			};
			
			for (var o in options || {}) settings[o] = options[o];

			debug = settings.debug;

			if (!supportsNativeTouch || settings.force) {
				console.info('Phantom Limb will attempt to reinterpret touch events as mouse events.');
				attachDocTouchListeners();
				
				if (settings.src) createPointer(settings);
			} else {
				console.log('Phantom Limb won\'t do anything because touch is supported natively.');
			}
		},
		
		// Show or hide the floating hand
		togglePointer: function() {
			pointer.style.display = pointer.style.display === 'none' ? '' : 'none';
		}
	};
}());