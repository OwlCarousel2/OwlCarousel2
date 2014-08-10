/**
 * Status Plugin
 * @version 2.0.0
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the status plugin.
	 * @class The Info Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var Status = function(carousel) {

		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;
	};

	/**
	 * Adds status information to every triggered event.
	 * @param {Event} event - The event object.
	 * @protected
	 */
	Status.prototype.onTrigger = function(event) {
		var settings = this._core.settings;

		event.status = {
			page: {
				count: this._core.pages().length,
				current: this._core.current('page'),
				size: settings && (settings.center || settings.autoWidth || settings.dotsData
					? 1 : settings.dotsEach || settings.items)
			},
			item: {
				count: this._core.items().length,
				current: this._core.relative(this._core.current())
			}
		};
	};

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Status.prototype.destroy = function() {
		var property;

		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Status = Status;

})(window.Zepto || window.jQuery, window, document);
