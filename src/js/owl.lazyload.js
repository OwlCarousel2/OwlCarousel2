/**
 * Lazy Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the lazy plugin.
	 * @class The Lazy Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var Lazy = function(carousel) {

		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		/**
		 * Already loaded items.
		 * @protected
		 * @type {Array.<jQuery>}
		 */
		this._loaded = [];

		/**
		 * Event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			'initialized.owl.carousel change.owl.carousel': $.proxy(function(e) {
				if (!e.namespace || !this._core.settings || this._core.settings.lazyLoad === false) {
					return;
				}

				if ((e.property && e.property.name === 'position') || e.type === 'initialized') {
					var position = e.property && e.property.value || this._core.current(),
						positions = this.positions(position),
						clones = this._core.clones().length,
						iterator = positions.length,
						load = $.proxy(function(i, v) { this.load(v) }, this);

					console.log(positions);

					while (iterator--) {
						this.load(clones / 2 + positions[iterator]);
						clones && $.each(this._core.clones(positions[iterator]), load);
					}
				}
			}, this)
		};

		// set the default options
		this._core.options = $.extend({}, Lazy.Defaults, this._core.options);

		// register event handler
		this._core.$element.on(this._handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	Lazy.Defaults = {
		lazyLoad: false,
		lazyPrefetch: 'page'
	};

	/**
	 * Gets the positions to load for the given position.
	 * @todo Page size doesn't work with auto width or merge and might be a missing feature of the core.
	 * @param {Numer} current - The absolute current position of the carousel.
	 * @returns {Array}
	 */
	Lazy.prototype.positions = function(current) {
		var result = [],
			settings = this._core.settings,
			relative = this._core.relative(current),
			backward = settings.loop || settings.center && relative > 0,
			before = settings.center && (relative > 0 || settings.loop),
			page = settings.items + (before && settings.items % 2 === 0 ? 1 : 0),
			prefetch = settings.lazyPrefetch === 'page' ? page : settings.lazyPrefetch,
			iterator = page,
			offset = before ? -Math.ceil(settings.items / 2) : 0;

		while (prefetch--) {
			backward && result.unshift(this._core.relative(current - prefetch + offset - 1));
			result.unshift(this._core.relative(current + page + prefetch + offset));
		}

		while (iterator--) {
			result.unshift(this._core.relative(current + iterator + offset));
		}

		return result;
	};

	/**
	 * Loads all resources of an item at the specified position.
	 * @param {Number} position - The absolute position of the item.
	 * @protected
	 */
	Lazy.prototype.load = function(position) {
		var $item = this._core.$stage.children().eq(position),
			$elements = $item && $item.find('.owl-lazy');

		if (!$elements || $.inArray($item.get(0), this._loaded) > -1) {
			return;
		}

		$elements.each($.proxy(function(index, element) {
			var $element = $(element), image,
				url = (window.devicePixelRatio > 1 && $element.attr('data-src-retina')) || $element.attr('data-src');

			this._core.trigger('load', { element: $element, url: url }, 'lazy');

			if ($element.is('img')) {
				$element.one('load.owl.lazy', $.proxy(function() {
					$element.css('opacity', 1);
					this._core.trigger('loaded', { element: $element, url: url }, 'lazy');
					if (this._core.settings.autoWidth) {
						this._core.invalidate('width');
						this._core.update();
					}
				}, this)).attr('src', url);
			} else {
				$(new Image()).one('load.owl.lazy', $.proxy(function() {
					$element.css({
						'background-image': 'url(' + url + ')',
						'opacity': '1'
					});
					this._core.trigger('loaded', { element: $element, url: url }, 'lazy');
				}, this)).attr('src', url);
			}
		}, this));

		this._loaded.push($item.get(0));
	};

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Lazy.prototype.destroy = function() {
		var handler, property;

		for (handler in this.handlers) {
			this._core.$element.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.Lazy = Lazy;

})(window.Zepto || window.jQuery, window, document);
