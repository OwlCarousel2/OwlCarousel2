/**
 * Autoplay Plugin
 * @since 2.0.0
 */
;(function($, window, document, undefined) {

	Autoplay = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, Autoplay.Defaults, this.owl.options);

		this.owl.dom.$el.on({
			'translated.owl.carousel refreshed.owl.carousel': $.proxy(function() {
				this.autoplay();
			}, this),
			'play.owl.autoplay': $.proxy(function(e, t, s) {
				this.play(t, s);
			}, this),
			'stop.owl.autoplay': $.proxy(function() {
				this.stop();
			}, this)
		});

		if (this.owl.options.autoplayHoverPause) {
			this.owl.dom.$el.on('mouseover.ap.owl', '.owl-stage', $.proxy(function() {
				this.pause();
			}, this));
			this.owl.dom.$el.on('mouseleave.ap.owl', '.owl-stage', $.proxy(function() {
				this.autoplay();
			}, this));
		}
	};

	Autoplay.Defaults = {
		autoplay: false,
		autoplayTimeout: 5000,
		autoplayHoverPause: false,
		autoplaySpeed: false
	};

	/**
	 * Autoplay
	 * @since 2.0.0
	 */

	Autoplay.prototype.autoplay = function() {
		if (this.owl.options.autoplay && !this.owl.state.videoPlay) {
			window.clearInterval(this.apInterval);

			this.apInterval = window.setInterval(function() {
				this.play();
			}.bind(this), this.owl.options.autoplayTimeout);

		} else {
			window.clearInterval(this.apInterval);
			this.autoplayState = false;
		}
	};

	/**
	 * play
	 * @param [timeout] - Integrer
	 * @param [speed] - Integrer
	 * @since 2.0.0
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
			this.owl.goTo(0);
		} else {
			this.owl.next(this.owl.options.autoplaySpeed);
		}
		this.autoplayState = true;
	};

	/**
	 * stop
	 * @since 2.0.0
	 */
	Autoplay.prototype.stop = function() {
		this.owl._options.autoplay = this.owl.options.autoplay = false;
		this.autoplayState = false;
		window.clearInterval(this.apInterval);
	};

	/**
	 * pause
	 * @since 2.0.0
	 */
	Autoplay.prototype.pause = function() {
		window.clearInterval(this.apInterval);
	};

	Autoplay.prototype.destroy = function() {
		window.clearInterval(this.apInterval);
		this.owl.dom.$el.off('.owl');
	};

	$.fn.owlCarousel.Constructor.Plugins.autoplay = Autoplay;

})(window.Zepto || window.jQuery, window, document);
