(function() {
	window.phantomLimb = {
		supportsNativeTouch: 'ontouchstart' in document.createElement('button'),
		
		init: function() {
			console.info('Phantom Limb will attempt to reinterpret touch event listeners for use with your mouse');
	
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
			}
	
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
	
			// Inline event listeners won't respond to manually dispathed events
			// TODO: Should we delegate this to the document to catch nodes created later?
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
		}
	};
})();
