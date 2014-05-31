/**
 * lazyLoad Plugin
 * @since 2.0.0
 */
;(function($, window, document, undefined) {

	LazyLoad = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, LazyLoad.Defaults, this.owl.options);

		if (!this.owl.options.lazyLoad) {
			return;
		}

		this.handlers = {
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.property.name == 'items' && e.property.value && !e.property.value.is(':empty')) {
					this.check();
				}
			}, this)
		};

		this.owl.dom.$el.on(this.handlers);
	};

	LazyLoad.Defaults = {
		lazyLoad: false
	};

	LazyLoad.prototype.check = function() {

		var attr = window.devicePixelRatio > 1 ? 'data-src-retina' : 'data-src',
			src, img, i, $item;

		for (i = 0; i < this.owl.num.items; i++) {
			$item = this.owl.dom.$items.eq(i);

			if ($item.data('owl-item').current === true && $item.data('owl-item').loaded === false) {
				img = $item.find('.owl-lazy');
				src = img.attr(attr);
				src = src || img.attr('data-src');
				if (src) {
					img.css('opacity', '0');
					this.preload(img, $item);
				}
			}
		}
	};

	LazyLoad.prototype.preload = function(images, $item) {
		var $el, img, srcType;

		images.each($.proxy(function(i, el) {

			this.owl.trigger('load', null, 'lazy');

			$el = $(el);
			img = new Image();
			srcType = window.devicePixelRatio > 1 ? $el.attr('data-src-retina') : $el.attr('data-src');
			srcType = srcType || $el.attr('data-src');

			img.onload = $.proxy(function() {
				$item.data('owl-item').loaded = true;
				if ($el.is('img')) {
					$el.attr('src', img.src);
				} else {
					$el.css('background-image', 'url(' + img.src + ')');
				}

				$el.css('opacity', 1);
				this.owl.trigger('loaded', null, 'lazy');
			}, this);
			img.src = srcType;
		}, this));
	};

	LazyLoad.prototype.destroy = function() {
		for (var handler in this.handlers) {
			this.owl.dom.$el.off(handler, this.handlers[handler]);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.lazyLoad = LazyLoad;

})(window.Zepto || window.jQuery, window, document);
