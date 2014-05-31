/**
 * Animate Plugin
 * @since 2.0.0
 */
;(function($, window, document, undefined) {

	Animate = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, Animate.Defaults, this.owl.options);

		if (!this.owl.options.animateIn && !this.owl.options.animateOut) {
			return;
		}

		this.owl.dom.$el.on({
			'drag.owl.carousel dragged.owl.carousel translated.owl.carousel': $.proxy(function(e) {
				this.swapping = e.type == 'translated';
			}, this),
			'translate.owl.carousel': $.proxy(function(e) {
				if (this.swapping) {
					this.swap();
				}
			}, this)
		});
	};

	Animate.Defaults = {
		animateOut: false,
		animateIn: false
	};

	Animate.prototype.swap = function() {

		if (this.owl.options.items !== 1 || !this.owl.support3d) {
			return false;
		}

		this.owl.setSpeed(0);

		var pos, tIn, tOut, that,
			prevItem = this.owl.dom.$items.eq(this.owl.pos.prev),
			prevPos = Math.abs(prevItem.data('owl-item').width) * this.owl.pos.prev,
			currentItem = this.owl.dom.$items.eq(this.owl.pos.currentAbs),
			currentPos = Math.abs(currentItem.data('owl-item').width) * this.owl.pos.currentAbs;

		if (this.owl.pos.currentAbs === this.owl.pos.prev) {
			return false;
		}

		pos = currentPos - prevPos;
		tIn = this.owl.options.animateIn;
		tOut = this.owl.options.animateOut;
		that = this.owl;

		removeStyles = function() {
			$(this).css({
				'left': ''
			}).removeClass('animated owl-animated-out owl-animated-in').removeClass(tIn).removeClass(tOut);

			that.transitionEnd();
		};

		if (tOut) {
			prevItem.css({
				'left': pos + 'px'
			}).addClass('animated owl-animated-out ' + tOut).one(
				'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', removeStyles);
		}

		if (tIn) {
			currentItem.addClass('animated owl-animated-in ' + tIn).one(
				'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', removeStyles);
		}
	};

	Animate.prototype.destroy = function() {
		this.owl.dom.$el.off('.owl');
	};

	$.fn.owlCarousel.Constructor.Plugins.animate = Animate;

})(window.Zepto || window.jQuery, window, document);
