/**
 * Hash Plugin
 * @version 2.0.0
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
	'use strict';

	/**
	 * Creates the hash plugin.
	 * @class The Hash Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var Hash = function(carousel) {
		// define members
		this.carousel = carousel;
		this.options = $.extend({}, Hash.Defaults, this.carousel.options);
		this.hashes = {};
		this.$element = this.carousel.dom.$el;

		// check plugin is enabled
		if (!this.options.URLhashListener) {
			return false;
		}

		// defines event handlers
		this.handlers = {
			'initialized.owl.carousel': $.proxy(function() {
				if (window.location.hash.substring(1)) {
					$(window).trigger('hashchange.owl.navigation');
				}
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (this.filling) {
					e.property.value.data('owl-item').hash
						= $(':first-child', e.property.value).find('[data-hash]').andSelf().data('hash');
					this.hashes[e.property.value.data('owl-item').hash] = e.property.value;
				}
			}, this),
			'change.owl.carousel': $.proxy(function(e) {
				if (e.property.name == 'position' && e.property.value == 'URLHash') {
					e.data = this.hashes[window.location.hash.substring(1)];
				}
				this.filling = e.property.name == 'item' && e.property.value && e.property.value.is(':empty');
			}, this),
		};

		// register the event handlers
		this.$element.on(this.handlers);

		// register event listener for hash navigation
		$(window).on('hashchange.owl.navigation', $.proxy(function() {
			var hash = window.location.hash.substring(1),
				position = this.hashes[hash] && this.hashes[hash].index() || 0;

			if (!hash) {
				return false;
			}

			this.carousel.dom.oStage.scrollLeft = 0;
			this.carousel.to(position);
		}, this));
	}

	/**
	 * Default options.
	 * @public
	 */
	Hash.Defaults = {
		URLhashListener: false
	}

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Hash.prototype.destroy = function() {
		var handler, property;

		$(window).off('hashchange.owl.navigation');

		for (handler in this.handlers) {
			this.owl.dom.$el.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	}

	$.fn.owlCarousel.Constructor.Plugins.Hash = Hash;

})(window.Zepto || window.jQuery, window, document);
