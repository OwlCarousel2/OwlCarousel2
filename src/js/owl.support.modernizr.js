/**
 * Modernizr Support Plugin
 *
 * @version 2.0.0-beta.3
 * @author Vivid Planet Software GmbH
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, Modernizr, window, document, undefined) {

	var events = {
		transition: {
			end: {
				WebkitTransition: 'webkitTransitionEnd',
				MozTransition: 'transitionend',
				OTransition: 'oTransitionEnd',
				transition: 'transitionend'
			}
		},
		animation: {
			end: {
				WebkitAnimation: 'webkitAnimationEnd',
				MozAnimation: 'animationend',
				OAnimation: 'oAnimationEnd',
				animation: 'animationend'
			}
		}
	};

	if (!Modernizr) {
		throw new Error('Modernizr is not loaded.');
	}

	$.each([ 'cssanimations', 'csstransitions', 'csstransforms', 'csstransforms3d', 'prefixed' ], function(i, property) {
		if (typeof Modernizr[property] == 'undefined') {
			throw new Error([ 'Modernizr "', property, '" is not loaded.' ].join(''));
		}
	});

	if (Modernizr.csstransitions) {
		/* jshint -W053 */
		$.support.transition = new String(Modernizr.prefixed('transition'))
		$.support.transition.end = events.transition.end[ $.support.transition ];
	}

	if (Modernizr.cssanimations) {
		/* jshint -W053 */
		$.support.animation = new String(Modernizr.prefixed('animation'))
		$.support.animation.end = events.animation.end[ $.support.animation ];
	}

	if (Modernizr.csstransforms) {
		/* jshint -W053 */
		$.support.transform = new String(Modernizr.prefixed('transform'));
		$.support.transform3d = Modernizr.csstransforms3d;
	}
})(window.Zepto || window.jQuery, window.Modernizr, window, document);
