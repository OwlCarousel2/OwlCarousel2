/**
 * Animate Plugin
 * @since 2.0.0
 */

;(function ($, window, document, undefined) {

    Animate = function(scope){
    	this.owl = scope;
    }

    Animate.prototype.swap = function(){
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
	Animate.prototype.destroy = function(){};
	$.fn.owlCarousel.Constructor.Plugins['animate'] = Animate;
	
}(jQuery, this, this.document));

