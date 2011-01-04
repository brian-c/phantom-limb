// Phantom Limb
// Simulate touch events in desktop browsers
// Brian Carstensen <brian.carstensen@gmail.com>

window.phantomLimb = (function() {
	var supportsNativeTouch = 'ontouchstart' in document.createElement('button');
	
	// Some browser checking
	var isMozilla = 'MozAppearance'    in document.createElement('span').style;
	var isWebkit  = 'WebkitAppearance' in document.createElement('span').style;
	
	// This will fake an arbitrary event on a node and add in the extra touch pieces
	var fireTouchEvent = function(originalEvent, newType) {
		var newEvent = document.createEvent('MouseEvent');
		newEvent.initMouseEvent(newType, true, true, window, originalEvent.detail,
				originalEvent.screenX, originalEvent.screenY, originalEvent.clientX, originalEvent.clientY,
				originalEvent.ctrlKey, originalEvent.shiftKey, originalEvent.altKey, originalEvent.metaKey,
				originalEvent.button, originalEvent.relatedTarget
		);
		
		// Touch events have a touches array, which contains kinda-sub-event objects
		// In this case we'll only need the one
		if (!('touches' in newEvent)) newEvent.touches = [newEvent];

		// And and they have "page" coordinates, which I guess are just like screen coordinates
		if (!('pageX' in newEvent)) newEvent.pageX = originalEvent.clientX;
		if (!('pageY' in newEvent)) newEvent.pageY = originalEvent.clientY;

		// TODO: Read the spec, fill in what's missing

		// Set this if we need to, because sometimes I use it
		window.event = window.event || newEvent;

		// Fire off the new event
		originalEvent.target.dispatchEvent(newEvent);

		// And delete the window's event property
		delete window.event;
	};

	// Attach the main mouse event listeners to the document
	var attachDocTouchListeners = function() {
		// Keep track for touchmove
		var mouseIsDown = false;

		document.addEventListener('mousedown', function(e) {
			fireTouchEvent(e, 'touchstart');
			mouseIsDown = true;
		}, false);

		document.addEventListener('mousemove', function(e) {
			if (mouseIsDown) fireTouchEvent(e, 'touchmove');
		}, false);

		document.addEventListener('mouseup', function(e) {
			mouseIsDown = false;
			fireTouchEvent(e, 'touchend');
		}, false);

		// TODO: touchcancel?
	};
	
	// Inline event listeners won't respond to manually dispathed events in Firefox
	var convertInlines = function() {
		touchables = document.querySelectorAll('[ontouchstart], [ontouchmove], [ontouchend]');
		Array.prototype.forEach.call(touchables, function(node) {
			var ontouchstartAttr = node.getAttribute('ontouchstart');
			var ontouchmoveAttr  = node.getAttribute('ontouchmove');
			var ontouchendAttr   = node.getAttribute('ontouchend');
			
			if (ontouchstartAttr || ontouchmoveAttr || ontouchendAttr) {
				console.log('Converting inline touch events to listeners', node);
			}

			if (ontouchstartAttr) {
				node.removeAttribute('ontouchstart');
				node.addEventListener('touchstart', new Function('event', ontouchstartAttr), false);
			}

			if (ontouchmoveAttr) {
				node.removeAttribute('ontouchmove');
				node.addEventListener('touchmove', new Function('event', ontouchmoveAttr), false);
			}

			if (ontouchendAttr) {
				node.removeAttribute('ontouchend');
				node.addEventListener('touchend', new Function('event', ontouchendAttr), false);
			}
		}, this);
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
		document.body.parentNode.style.cursor = 'none';
		
		document.addEventListener('mousemove', function(e) {
			pointer.style.left = e.clientX - options.x + 'px';
			pointer.style.top = e.clientY - options.y + 'px';
			
			var triWidth  = window.innerWidth - e.clientX;
			var triHeight = window.innerHeight - e.clientY
			var triHypo   = Math.sqrt(Math.pow(triWidth, 2) + (Math.pow(triHeight, 2)));
	
			var angle = Math.acos(triHeight / triHypo) / (2 * Math.PI) * 360;
			angle = angle / 1.5;
			
			pointer.style.WebkitTransform = 'rotate(' + -angle + 'deg)';
			pointer.style.MozTransform = 'rotate(' + -angle + 'deg)';
		}, false);
		
		togglePointer(true);
	};
	
	var toggle = document.createElement('button');

	// A toggle switch for the pointer
	var createToggle = function() {
		toggle.innerHTML = '☝';
		toggle.title = 'Phantom Limb';
		
		toggle.style.position = 'fixed';
		toggle.style.left = '50%';
		toggle.style.marginLeft = '-0.75em';
		toggle.style.bottom = '5px';
		toggle.style.zIndex = 9999;
		
		toggle.style.background = '#cf0';
		toggle.style.color = 'black';
		toggle.style.border = '1px solid black';

		toggle.style.cursor = 'pointer';
		
		toggle.style.textShadow = '0 0 1px #000';
		toggle.style.WebkitBoxShadow = '0 0 1px #000 inset';
		
		toggle.style.fontSize = '24px';
		
		toggle.style.margin = 0;
		toggle.style.padding = 0;
		
		toggle.style.width = '1.5em';
		toggle.style.height = '1.5em';
		toggle.style.WebkitBorderRadius = '0.75em';
		toggle.style.MozBorderRadius = '0.75em';
		
		toggle.addEventListener('click', function() {
			togglePointer();
		}, false);

		document.body.appendChild(toggle);
	};
	
	var togglePointer = function(shouldBe) {
		shouldBe = shouldBe || !isPointing;

		if (shouldBe) {
			isPointing = true;
			pointer.style.display = '';
			toggle.style.background = '#cf0';
			document.body.parentNode.style.cursor = 'crosshair';
		} else {
			isPointing = false;
			pointer.style.display = 'none';
			toggle.style.background = '#fff';
			document.body.parentNode.style.cursor = '';
		}
		
		if (isMozilla) convertInlines();
	};
	
	return {
		init: function(options) {
			settings = {
				force: false,
				src: '',
				x: 100,
				y: -5,
				opacity: 1,
				show: true,
				toggle: true
			};
			
			if (options) for (var o in options) settings[o] = options[o];

			if (!supportsNativeTouch || settings.force) {
				console.info('Phantom Limb will attempt to reinterpret touch events as mouse events.');
				attachDocTouchListeners();

				if (isMozilla) {
					console.info('Phantom Limb must convert inline event handlers to attached in Firefox.');
					convertInlines();
				}
				
				if (settings.src) {
					createPointer(settings);
					togglePointer(settings.show);
					if (settings.toggle) createToggle();
				}
			} else {
				console.log('Phantom Limb won\'t do anything because touch is supported natively.');
			}
		},
		
		togglePointer: togglePointer
	};
}());