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
			if (this.element.classList.contains('touch')) {
				this.element.addEventListener('touchstart', bind(this._onContact, this), false);
				this.element.addEventListener('touchmove', bind(this._onMove, this), false);
				this.element.addEventListener('touchend', bind(this._onDocRelease, this), false);
			}

			if (this.element.classList.contains('gesture')) {
				this.element.addEventListener('gesturestart', bind(this._onContact, this), false);
				this.element.addEventListener('gesturechange', bind(this._onMove, this), false);
				this.element.addEventListener('gestureend', bind(this._onDocRelease, this), false);
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

			if (e.targetTouches) for (var i = 0; i < e.targetTouches.length; i++) {
				this.log(i, e.touches[i].target.id, e.targetTouches[i].pageX, e.targetTouches[i].pageY);
			}

			if (~e.type.indexOf('gesture') || e.touches.length === 2) {
				this.log('scale', e.scale);
				this.log('rotation', e.rotation);
			}

			this.log.apply(this, Object.keys(e));
		},

		log: function() {
			var message = document.createElement('div');
			message.innerHTML = Array.prototype.join.call(arguments, ' | ');
			message.id = 'div-' + Math.floor(Math.random() * 1000000);
			this.element.appendChild(message);
		}
	};

	GLOBAL.Surface = Surface;
}(this));
