/**
 * Animate Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the animate plugin.
	 * @class The Navigation Plugin
	 * @param {Owl} scope - The Owl Carousel
	 */
	Animate = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, Animate.Defaults, this.owl.options);
		this.swapping = true;

		if (!this.owl.options.animateIn && !this.owl.options.animateOut) {
			return;
		}

		this.handlers = {
			'drag.owl.carousel dragged.owl.carousel translated.owl.carousel': $.proxy(function(e) {
				this.swapping = e.type == 'translated';
			}, this),
			'translate.owl.carousel': $.proxy(function(e) {
				if (this.swapping) {
					this.swap();
				}
			}, this)
		};

		this.owl.dom.$el.on(this.handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	Animate.Defaults = {
		animateOut: false,
		animateIn: false
	};

	/**
	 * Toggles the animation classes whenever an translations starts.
	 * @protected
	 * @returns {Boolean|undefined}
	 */
	Animate.prototype.swap = function() {

		if (this.owl.options.items !== 1 || !this.owl.support3d) {
			return false;
		}

		this.owl.setSpeed(0);

		var pos, tIn, tOut, that,
			prevItem = this.owl.dom.$items.eq(this.owl.pos.prev),
			prevPos = Math.abs(prevItem.data('owl-item').width) * this.owl.pos.prev,
			currentItem = this.owl.dom.$items.eq(this.owl.pos.currentAbs),
			currentPos = Math.abs(currentItem.data('owl-item').width) * this.owl.pos.currentAbs;

		if (this.owl.pos.currentAbs === this.owl.pos.prev) {
			return false;
		}

		pos = currentPos - prevPos;
		tIn = this.owl.options.animateIn;
		tOut = this.owl.options.animateOut;
		that = this.owl;

		removeStyles = function() {
			$(this).css({
				'left': ''
			}).removeClass('animated owl-animated-out owl-animated-in').removeClass(tIn).removeClass(tOut);

			that.transitionEnd();
		};

		if (tOut) {
			prevItem.css({
				'left': pos + 'px'
			}).addClass('animated owl-animated-out ' + tOut).one(
				'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', removeStyles);
		}

		if (tIn) {
			currentItem.addClass('animated owl-animated-in ' + tIn).one(
				'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', removeStyles);
		}
	};

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Animate.prototype.destroy = function() {
		var handler, property;

		for (handler in this.handlers) {
			this.owl.dom.$el.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.animate = Animate;

})(window.Zepto || window.jQuery, window, document);
