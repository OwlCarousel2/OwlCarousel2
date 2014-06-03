/**
 * Navigation Plugin
 * @version 2.0.0
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
	'use strict';

	/**
	 * Creates the navigation plugin.
	 * @class The Navigation Plugin
	 * @param {Owl} carousel - The Owl Carousel.
	 */
	var Navigation = function(carousel) {
		/**
		 * Reference to the core.
		 * @type {Owl}
		 */
		this.core = carousel;

		/**
		 * Indicates whether the plugin is initialized or not.
		 * @type {Boolean}
		 */
		this.initialized = false;

		/**
		 * The current paging indexes.
		 * @type {Array}
		 */
		this.pages = [];

		/**
		 * All DOM elements of the user interface.
		 * @type {Object}
		 */
		this.controls = {};

		/**
		 * Markup for an indicator.
		 * @type {String}
		 */
		this.template = null;

		/**
		 * The carousel element.
		 * @type {jQuery}
		 */
		this.$element = this.core.dom.$el;

		/**
		 * All event handlers.
		 * @type {Object}
		 */
		this.handlers = {
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.property.name == 'items') {
					if (!this.initialized) {
						this.initialize();
						this.initialized = true;
					}
					this.update();
					this.draw();
				}
				if (this.filling) {
					e.property.value.data('owl-item').dot = $(':first-child', e.property.value)
						.find('[data-dot]').andSelf().data('dot');
				}
			}, this),
			'change.owl.carousel': $.proxy(function(e) {
				if (e.property.name == 'position' && !this.core.state.revert
					&& !this.core.options.loop && this.core.options.navRewind) {
					var position = this.core.pos;
					e.data = e.property.value > position.max
						? position.current >= position.max ? position.min : position.max
						: e.property.value < 0 ? position.max : e.property.value;
				}
				this.filling = this.core.options.dotsData && e.property.name == 'item'
					&& e.property.value && e.property.value.is(':empty');
			}, this),
			'refreshed.owl.carousel': $.proxy(function() {
				if (this.initialized) {
					this.update();
					this.draw();
				}
			}, this)
		};

		// set default options
		this.core.options = $.extend({}, Navigation.Defaults, this.core.options);

		// register event handlers
		this.$element.on(this.handlers);
	}

	/**
	 * Default options.
	 * @public
	 * @todo Rename `slideBy` to `navBy`
	 */
	Navigation.Defaults = {
		nav: false,
		navRewind: true,
		navText: [ 'prev', 'next' ],
		navSpeed: false,
		navElement: 'div',
		navContainer: false,
		navContainerClass: 'owl-nav',
		navClass: [ 'owl-prev', 'owl-next' ],
		slideBy: 1,
		dotClass: 'owl-dot',
		dotsClass: 'owl-dots',
		dots: true,
		dotsEach: false,
		dotData: false,
		dotsSpeed: false,
		dotsContainer: false,
		controlsClass: 'owl-controls'
	}

	/**
	 * Initializes the layout of the plugin.
	 * @protected
	 */
	Navigation.prototype.initialize = function() {
		var $container,
			options = this.core.options;

		// create the indicator template
		if (!options.dotsData) {
			this.template = $('<div>')
				.addClass(options.dotClass)
				.append($('<span>'))
				.prop('outerHTML');
		}

		// create controls container if needed
		if (!options.navContainer || !options.dotsContainer) {
			this.controls.$container = $('<div>')
				.addClass(options.controlsClass)
				.appendTo(this.$element);
		}

		// create DOM structure for absolute navigation
		this.controls.$indicators = options.dotsContainer ? $(options.dotsContainer)
			: $('<div>').hide().addClass(options.dotsClass).appendTo(this.controls.$container);

		this.controls.$indicators.on(this.core.dragType[2], 'div', $.proxy(function(e) {
			var index = $(e.target).parent().is(this.controls.$indicators)
				? $(e.target).index() : $(e.target).parent().index();

			e.preventDefault();

			this.core.to(
				this.pages[index].start,
				options.dotsSpeed
			);
		}, this));

		// create DOM structure for relative navigation
		$container = options.navContainer ? $(options.navContainer)
			: $('<div>').addClass(options.navContainerClass).prependTo(this.controls.$container);

		this.controls.$next = $('<' + options.navElement + '>');
		this.controls.$previous = this.controls.$next.clone();

		this.controls.$previous
			.addClass(options.navClass[0])
			.text(options.navText[0])
			.hide()
			.prependTo($container)
			.on(this.core.dragType[2], $.proxy(function(e) {
				this.core.to(this.core.pos.current - options.slideBy);
			}, this));
		this.controls.$next
			.addClass(options.navClass[1])
			.text(options.navText[1])
			.hide()
			.appendTo($container)
			.on(this.core.dragType[2], $.proxy(function(e) {
				this.core.to(this.core.pos.current + options.slideBy);
			}, this));
	}

	/**
	 * Destroys the plugin.
	 * @protected
	 */
	Navigation.prototype.destroy = function() {
		var handler, control, property;

		for (handler in this.handlers) {
			this.$element.off(handler, this.handlers[handler]);
		}
		for (control in this.controls) {
			this.controls[control].remove();
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	}

	/**
	 * Updates the internal state.
	 * @protected
	 */
	Navigation.prototype.update = function() {
		var i, j, k,
			options = this.core.options,
			lower = this.core.num.cItems / 2,
			upper = this.core.num.items - lower,
			items = this.core.num.oItems,
			size = options.center || options.autoWidth || options.dotData
				? 1 : options.dotsEach || options.items;

		if (options.nav) {
			options.navRewind = items > options.items || options.center;

			if (options.slideBy && options.slideBy === 'page') {
				options.slideBy = options.items;
			} else {
				options.slideBy = Math.min(options.slideBy, options.items);
			}
		}

		if (options.dots) {
			this.pages = [];

			for (i = lower, j = 0, k = 0; i < upper; i++) {
				if (j >= size || j === 0) {
					this.pages.push({
						start: i - lower,
						end: i - lower + size - 1
					});
					j = 0, ++k;
				}
				j += this.core.num.merged[i];
			}
		}
	}

	/**
	 * Draws the user interface.
	 * @protected
	 */
	Navigation.prototype.draw = function() {
		var difference, i, html = '',
			options = this.core.options,
			$items = this.core.dom.$oItems,
			index = this.core.pos.current;

		if (options.nav && !options.loop && !options.navRewind) {
			this.controls.$previous.toggleClass('disabled', index <= 0);
			this.controls.$next.toggleClass('disabled', index >= this.core.pos.max);
		}

		this.controls.$previous.toggle(options.nav);
		this.controls.$next.toggle(options.nav);

		if (options.dots) {
			difference = this.pages.length - this.controls.$indicators.children().length;

			if (difference > 0) {
				for (i = 0; i < Math.abs(difference); i++) {
					html += options.dotData ? $items.eq(i).data('owl-item').dot : this.template;
				}
				this.controls.$indicators.append(html);
			} else if (difference < 0) {
				this.controls.$indicators.children().slice(difference).remove();
			}

			this.controls.$indicators.find('.active').removeClass('active');
			this.controls.$indicators.children().eq(this.pages.indexOf(this.getCurrentPage())).addClass('active');
		}

		this.controls.$indicators.toggle(options.dots);
	}

	/**
	 * Extends event data.
	 * @protected
	 * @param {Event} event - The event object which gets thrown.
	 */
	Navigation.prototype.onTrigger = function(event) {
		var options = this.core.options;

		event.page = {
			index: this.pages.indexOf(this.getCurrentPage()),
			count: this.pages.length,
			size: options.center || options.autoWidth || options.dotData
				? 1 : options.dotsEach || options.items
		};
	}

	/**
	 * Gets the current page of the carousel.
	 * @protected
	 * @returns {Number}
	 */
	Navigation.prototype.getCurrentPage = function() {
		var index = this.core.pos.current;
		return $.grep(this.pages, function(o) {
			return o.start <= index && o.end >= index;
		}).pop();
	}

	$.fn.owlCarousel.Constructor.Plugins.Navigation = Navigation;

})(window.Zepto || window.jQuery, window, document);
