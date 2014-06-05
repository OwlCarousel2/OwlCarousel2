/**
 * Autoplay Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the autoplay plugin.
	 * @class The Autoplay Plugin
	 * @param {Owl} scope - The Owl Carousel
	 */
	Autoplay = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, Autoplay.Defaults, this.owl.options);

		this.handlers = {
			'translated.owl.carousel refreshed.owl.carousel': $.proxy(function() {
				this.autoplay();
			}, this),
			'play.owl.autoplay': $.proxy(function(e, t, s) {
				this.play(t, s);
			}, this),
			'stop.owl.autoplay': $.proxy(function() {
				this.stop();
			}, this),
			'mouseover.owl.autoplay': $.proxy(function() {
				if (this.owl.options.autoplayHoverPause) {
					this.pause();
				}
			}, this),
			'mouseleave.owl.autoplay': $.proxy(function() {
				if (this.owl.options.autoplayHoverPause) {
					this.autoplay();
				}
			}, this)
		};

		this.owl.dom.$el.on(this.handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	Autoplay.Defaults = {
		autoplay: false,
		autoplayTimeout: 5000,
		autoplayHoverPause: false,
		autoplaySpeed: false
	};

	/**
	 * @protected
	 * @todo Must be documented.
	 */
	Autoplay.prototype.autoplay = function() {
		if (this.owl.options.autoplay && !this.owl.state.videoPlay) {
			window.clearInterval(this.apInterval);

			this.apInterval = window.setInterval($.proxy(function() {
				this.play();
			}, this), this.owl.options.autoplayTimeout);
		} else {
			window.clearInterval(this.apInterval);
			this.autoplayState = false;
		}
	};

	/**
	 * Starts the autoplay.
	 * @public
	 * @param {Number} [timeout] - ...
	 * @param {Number} [speed] - ...
	 * @returns {Boolean|undefined} - ...
	 * @todo Must be documented.
	 */
	Autoplay.prototype.play = function(timeout, speed) {
		// if tab is inactive - doesnt work in <IE10
		if (document.hidden === true) {
			return false;
		}

		// overwrite default options (custom options are always priority)
		if (!this.owl.options.autoplay) {
			this.owl._options.autoplay = this.owl.options.autoplay = true;
			this.owl._options.autoplayTimeout = this.owl.options.autoplayTimeout = timeout
				|| this.owl.options.autoplayTimeout || 4000;
			this.owl._options.autoplaySpeed = speed || this.owl.options.autoplaySpeed;
		}

		if (this.owl.options.autoplay === false || this.owl.state.isTouch || this.owl.state.isScrolling
			|| this.owl.state.isSwiping || this.owl.state.inMotion) {
			window.clearInterval(this.apInterval);
			return false;
		}

		if (!this.owl.options.loop && this.owl.pos.current >= this.owl.pos.max) {
			window.clearInterval(this.e._autoplay);
			this.owl.to(0);
		} else {
			this.owl.next(this.owl.options.autoplaySpeed);
		}
		this.autoplayState = true;
	};

	/**
	 * Stops the autoplay.
	 * @public
	 */
	Autoplay.prototype.stop = function() {
		this.owl._options.autoplay = this.owl.options.autoplay = false;
		this.autoplayState = false;
		window.clearInterval(this.apInterval);
	};

	/**
	 * Pauses the autoplay.
	 * @public
	 */
	Autoplay.prototype.pause = function() {
		window.clearInterval(this.apInterval);
	};

	/**
	 * Destroys the plugin.
	 */
	Autoplay.prototype.destroy = function() {
		var handler, property;

		window.clearInterval(this.apInterval);

		for (handler in this.handlers) {
			this.owl.dom.$el.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.autoplay = Autoplay;

})(window.Zepto || window.jQuery, window, document);
