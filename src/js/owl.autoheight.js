/**
 * AutoHeight Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the auto height plugin.
	 * @class The Auto Height Plugin
	 * @param {Owl} scope - The Owl Carousel
	 */
	AutoHeight = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, AutoHeight.Defaults, this.owl.options);

		this.owl.dom.$el.on({
			'refreshed.owl.carousel changed.owl.carousel': $.proxy(function() {
				if (this.owl.options.autoHeight) {
					this.setHeight();
				}
			}, this)
		});
	};

	/**
	 * Default options.
	 * @public
	 */
	AutoHeight.Defaults = {
		autoHeight: false,
		autoHeightClass: 'owl-height'
	};

	/**
	 *
	 * @param {Boolean} callback - Whether
	 * @returns {Boolean}
	 */
	AutoHeight.prototype.setHeight = function() {
		var loaded = this.owl.dom.$items.eq(this.owl.pos.currentAbs),
			stage = this.owl.dom.$oStage,
			iterations = 0,
			isLoaded;

		if (!this.owl.dom.$oStage.hasClass(this.owl.options.autoHeightClass)) {
			this.owl.dom.$oStage.addClass(this.owl.options.autoHeightClass);
		}

		isLoaded = window.setInterval(function() {
			iterations += 1;
			if (loaded.data('owl-item').loaded) {
				stage.height(loaded.height() + 'px');
				clearInterval(isLoaded);
			} else if (iterations === 500) {
				clearInterval(isLoaded);
			}
		}, 100);

	};

	AutoHeight.prototype.destroy = function() {
		this.owl.dom.$el.off('.owl');
	};

	$.fn.owlCarousel.Constructor.Plugins.autoHeight = AutoHeight;

})(window.Zepto || window.jQuery, window, document);
