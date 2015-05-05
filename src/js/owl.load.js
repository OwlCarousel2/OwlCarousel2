/**
 * Load Plugin
 * @version 2.0.0
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the load plugin.
	 * @class The Load Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var Load = function(carousel) {

		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialize.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.options.load && this._core.options.loadingClass) {
					this._core.$element.addClass(this._core.options.loadingClass);
				}
			}, this),
			'initialized.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.options.load && this._core.options.loadingClass && !this._core.is('loading')) {
					this._core.$element.removeClass(this._core.options.loadingClass);
					this._core.$element.addClass(this._core.options.loadedClass);
					console.log('initialized');
				}
			}, this),
			'prepared.owl.carousel': $.proxy(function(e) {
				if (e.namespace && this._core.options.load && this._core.is('initializing')) {
					this.load(e.item, e.index);
				}
			}, this)
		};

		// set the default options
		this._core.options = $.extend({}, Load.Defaults, this._core.options);

		// register event handler
		this._core.$element.on(this._handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	Load.Defaults = {
		load: 'current',
		loadingClass: 'owl-loading',
		loadedClass: 'owl-loaded'
	};

	/**
	 * Loads all resources of an item.
	 * @param {jQuery|HTMLElement} item - The item.
	 * @param {jQuery|HTMLElement} item - The item.
	 * @protected
	 */
	Load.prototype.load = function(item, position) {
		$(item).find('img').not(function() {
			return this.complete;
		}).each($.proxy(function(index, element) {
			if (this._core.options.load !== 'current' || this._core.settings.startPosition === position) {
				this._core.enter('loading');
			}

			$(element).one('load.owl.load', $.proxy(function() {
				if (this._core.options.load !== 'current' || this._core.settings.startPosition === position) {
					this._core.leave('loading');
				}

				if (this._core.settings.autoWidth && !this._core.is('initializing')) {
					this._core.invalidate('width');
					this._core.update();
				}

				if (this._core.options.loadingClass && !this._core.is('loading')) {
					this._core.$element.removeClass(this._core.options.loadingClass);
					this._core.$element.addClass(this._core.options.loadedClass);
				}
			}, this));
		}, this));
	};

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Load.prototype.destroy = function() {
		var handler, property;

		for (handler in this.handlers) {
			this._core.$element.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Load = Load;

})(window.Zepto || window.jQuery, window, document);
