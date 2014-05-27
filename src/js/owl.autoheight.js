/**
 * AutoHeight Plugin
 * 
 * @since 2.0.0
 */
;(function($, window, document, undefined) {

	AutoHeight = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, AutoHeight.Defaults, this.owl.options);

		this.owl.dom.$el.on({
			'refreshed.owl.carousel changed.owl.carousel': $.proxy(function(e) {
				if (this.owl.options.autoHeight)
					this.setHeight();
			}, this)
		});
	};

	AutoHeight.Defaults = {
		autoHeight: false,
		autoHeightClass: 'owl-height'
	};

	AutoHeight.prototype.setHeight = function(callback) {

		if (this.owl.options.autoHeight !== true && callback !== true) {
			return false;
		}
		if (!this.owl.dom.$oStage.hasClass(this.owl.options.autoHeightClass)) {
			this.owl.dom.$oStage.addClass(this.owl.options.autoHeightClass);
		}

		var loaded = this.owl.dom.$items.eq(this.owl.pos.currentAbs);
		var stage = this.owl.dom.$oStage;
		var iterations = 0;

		var isLoaded = window.setInterval(function() {
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
