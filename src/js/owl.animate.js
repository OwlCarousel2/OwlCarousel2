/**
 * Animate Plugin
 * @since 2.0.0
 */

;(function ( $, window, document, undefined ) {

    Animate = function(scope){
    	this.owl = scope;
    	this.owl.options = $.extend({}, Animate.Defaults, this.owl.options);

    	this.owl.dom.$el.on({
			'onAnimate.owl': $.proxy(function(e) {
				if (this.owl.options.animateIn || this.owl.options.animateOut) this.swap();
			}, this)
		});
    };

	Animate.Defaults = {
		animateOut:	false,
		animateIn: false
	};

    Animate.prototype.swap = function(){
    	//speed = 0;
    	this.owl.setSpeed(0);

    	if( this.owl.options.items === 1 && this.owl.support3d){
			this.owl.state.animate = true;
		} else {
			this.owl.state.animate = false;
		}

		var prevItem = this.owl.dom.$items.eq(this.owl.pos.prev),
			prevPos = Math.abs(prevItem.data('owl-item').width) * this.owl.pos.prev,
			currentItem = this.owl.dom.$items.eq(this.owl.pos.currentAbs),
			currentPos = Math.abs(currentItem.data('owl-item').width) * this.owl.pos.currentAbs;

		if(this.owl.pos.currentAbs === this.owl.pos.prev){
			return false;
		}

		var pos = currentPos - prevPos;
		var tIn = this.owl.options.animateIn;
		var tOut = this.owl.options.animateOut;
		var that = this.owl;

		removeStyles = function(){
			$(this).css({
                "left" : ""
            })
            .removeClass('animated owl-animated-out owl-animated-in')
            .removeClass(tIn)
            .removeClass(tOut);

            that.transitionEnd();
        };

		if(tOut){
			prevItem
			.css({
				"left" : pos + "px"
			})
			.addClass('animated owl-animated-out '+tOut)
			.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', removeStyles);
		}

		if(tIn){
			currentItem
			.addClass('animated owl-animated-in '+tIn)
			.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', removeStyles);
		}
	};
	Animate.prototype.destroy = function(){
		this.owl.dom.$el.off('.owl');
	};
	$.fn.owlCarousel.Constructor.Plugins.animate = Animate;
	
})( window.Zepto || window.jQuery, window,  document );