/**
 * Navigation Plugin
 * @version 2.0.0
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
	'use strict';

	/**
	 * Creates the animate plugin.
	 * @class The Navigation Plugin
	 * @param {Owl} carousel - The Owl Carousel.
	 */
	var Navigation = function(carousel) {
		// define members
		this.core = carousel;
		this.core.options = $.extend({}, Navigation.Defaults, this.core.options);
		this.refreshing = false;
		this.initialized = false;
		this.page = null;
		this.pages = [];
		this.controls = {};
		this.template = null;
		this.$element = this.core.dom.$el;

		// check plugin is enabled
		if (!this.core.options.nav && !this.core.options.dots) {
			return false;
		}

		// define the event handlers
		this.handlers = {
			'initialized.owl.carousel': $.proxy(function() {
				if (!this.initialized) {
					this.initialize();
				}
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.property.name == 'items' && this.initialized) {
					this.update();
				}
				if (this.filling) {
					e.property.value.data('owl-item').dot
						= $(':first-child', e.property.value).find('[data-dot]').andSelf().data('dot');
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
				this.filling
					= this.core.options.dotsData && e.property.name == 'item' && e.property.value && e.property.value.is(':empty');
			}, this),
			'refresh.owl.carousel refreshed.owl.carousel': $.proxy(function(e) {
				this.refreshing = e.type == 'refresh';
			}, this),
			'refreshed.owl.carousel': $.proxy(function() {
				if (this.initialized) {
					this.refresh();
				}
			}, this)
		};

		// register the event handlers
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
	 * Initializes the plugin.
	 * @protected
	 */
	Navigation.prototype.initialize = function() {
		var $container,
			options = this.core.options;

		// refresh internal data
		this.refresh();

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
		if (options.dots) {
			this.$indicators = options.dotsContainer ? $(options.dotsContainer)
				: $('<div>').addClass(options.dotsClass).appendTo(this.controls.$container);

			this.$indicators.on(this.core.dragType[2], 'div', $.proxy(function(e) {
				var index = $(e.target).parent().is(this.$indicators)
					? $(e.target).index() : $(e.target).parent().index();

				e.preventDefault();

				this.core.to(
					this.pages[index].start,
					options.dotsSpeed
				);
			}, this));
		}

		// create DOM structure for relative navigation
		if (options.nav) {
			$container = options.navContainer ? $(options.navContainer)
				: $('<div>').addClass(options.navContainerClass).prependTo(this.controls.$container);

			this.controls.$next = $('<' + options.navElement + '>');
			this.controls.$previous = this.controls.$next.clone();

			this.controls.$previous
				.addClass(options.navClass[0])
				.text(options.navText[0])
				.prependTo($container)
				.on(this.core.dragType[2], $.proxy(function(e) {
					this.core.to(this.core.pos.current - options.slideBy);
				}, this));
			this.controls.$next
				.addClass(options.navClass[1])
				.text(options.navText[1])
				.appendTo($container)
				.on(this.core.dragType[2], $.proxy(function(e) {
					this.core.to(this.core.pos.current + options.slideBy);
				}, this));
		}

		// update the created DOM structures
		this.update();

		this.initialized = true;
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
	 * Refreshes the internal data of the plugin.
	 * @protected
	 */
	Navigation.prototype.refresh = function() {
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
	 * Updates the DOM structures of the plugin.
	 * @protected
	 */
	Navigation.prototype.update = function() {
		var difference, i, html = '',
			options = this.core.options,
			$items = this.core.dom.$oItems,
			index = this.core.pos.current;

		if (options.nav && !options.loop && !options.navRewind) {
			this.controls.$previous.toggleClass('disabled', index <= 0);
			this.controls.$next.toggleClass('disabled', index >= this.core.pos.max);
		}

		if (options.dots) {
			difference = this.pages.length - this.$indicators.children().length;

			this.page = $.grep(this.pages, function(o) {
				return o.start <= index && o.end >= index;
			}).pop();

			if (difference > 0) {
				for (i = 0; i < Math.abs(difference); i++) {
					html += options.dotData ? $items.eq(i).data('owl-item').dot : this.template;
				}
				this.$indicators.append(html);
			} else if (difference < 0) {
				this.$indicators.children().slice(difference).remove();
			}

			this.$indicators.find('.active').removeClass('active');
			this.$indicators.children().eq(this.pages.indexOf(this.page) % $items.length).addClass('active');
		}
	}

	/**
	 * Extends event data.
	 * @protected
	 * @param {Event} event - The event object which gets thrown.
	 */
	Navigation.prototype.onTrigger = function(event) {
		var options = this.core.options;

		event.page = {
			index: this.pages.indexOf(this.page),
			count: this.pages.length,
			size: options.center || options.autoWidth || options.dotData
				? 1 : options.dotsEach || options.items
		};
	}

	$.fn.owlCarousel.Constructor.Plugins.Navigation = Navigation;

})(window.Zepto || window.jQuery, window, document);
