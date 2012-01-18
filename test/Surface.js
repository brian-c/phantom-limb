(function(GLOBAL) {
	"use strict";

	function bind(func, context) {
		function boundFunction() {
			return func.apply(context, arguments);
		}

		return boundFunction;
	}

	function descendsFrom(child, elder) {
		var parent = child;
		while (parent !== elder && parent !== document && parent) {
			parent = parent.parentNode;
		}

		return parent === elder;
	}

	var touch = !!~navigator.userAgent.indexOf('iP');

	function Surface(element) {
		this.element = element;
	}

	Surface.prototype = {
		element: null,

		active: false,

		init: function() {
			if (true || touch) {
				this.element.addEventListener('touchstart', bind(this._onContact, this), false);
				this.element.addEventListener('touchmove', bind(this._onMove, this), false);
				this.element.addEventListener('touchend', bind(this._onDocRelease, this), false);
			} else {
				this.element.addEventListener('mousedown', bind(this._onContact, this), false);
				this.element.addEventListener('mousemove', bind(this._onMove, this), false);
				document.addEventListener('mouseup', bind(this._onDocRelease, this), false);
			}
		},

		activate: function() {
			this.active = true;
			this.element.classList.add('active');
		},

		deactivate: function() {
			this.active = false;
			this.element.classList.remove('active');
		},

		_onContact: function(e) {
			// e.preventDefault();
			this.activate();
			this.onContact(e);
		},

		_onMove: function(e) {
			if (this.active) this.onDrag(e);
		},

		_onDocRelease: function(e) {
			if (!this.active) return;

			var stillActive = false;

			if (e.touches) {
				for (var i = 0; i < e.touches.length; i++) {
					if (descendsFrom(e.touches[i].target, this.element)) stillActive = true;
				}
			}

			if (!stillActive) {
				this.deactivate();	
				this.onRelease(e);
			}
		},

		onContact: function(e) {
			this.render(e);
		},

		onDrag: function(e) {
			this.render(e);
		},

		onRelease: function(e) {
			this.render(e);
		},

		render: function(e) {
			this.element.innerHTML = '';

			this.log('type', e.type, e.target.id, e.currentTarget.id);
			this.log('touches', e.touches ? e.touches.length : 'n/a');
			this.log('targetTouches', e.targetTouches ? e.targetTouches.length : 'n/a');
			this.log('changedTouches', e.changedTouches ? e.changedTouches.length : 'n/a');

			if (e.touches) {
				for (var i = 0; i < e.targetTouches.length; i++) {
					this.log(i, e.touches[i].target.id, e.targetTouches[i].clientX, e.targetTouches[i].clientY);
				}

				if (e.targetTouches.length === 2) {
					this.log('scale', e.scale);
					this.log('rotation', e.rotation);
				}
			} else {
				this.log('clientX', e.clientX);
				this.log('clientY', e.clientY);
			}
		},

		log: function(string) {
			var message = document.createElement('p');
			message.innerHTML = Array.prototype.join.call(arguments, ' | ');
			message.id = 'div-' + Math.floor(Math.random() * 1000000);
			this.element.appendChild(message);
		}
	};

	GLOBAL.Surface = Surface;
}(this));
