/**
 * Modernizr Plugin
 * Optional Plugin that can be loaded instead of support, reuses already existing Modernizr
 * @version 2.0.0
 * @author Vivid Planet Software GmbH
 * @license The MIT License (MIT)
 */
;(function($, Modernizr, window, document, undefined) {

	if (!Modernizr) {
		throw new Error('Modernizr is not loaded.');
	}
	if (typeof Modernizr.touch == 'undefined') {
		throw new Error('Modernizr touch test is not loaded.');
	}
	if (typeof Modernizr.pointerevents == 'undefined') {
		throw new Error('Modernizr pointerevents test is not loaded.');
	}
	if (typeof Modernizr.csstransitions == 'undefined') {
		throw new Error('Modernizr csstransitions test is not loaded.');
	}
	if (typeof Modernizr.csstransforms == 'undefined') {
		throw new Error('Modernizr csstransforms test is not loaded.');
	}
	if (typeof Modernizr.csstransforms3d == 'undefined') {
		throw new Error('Modernizr csstransforms3d test is not loaded.');
	}

	var Owl = $.fn.owlCarousel.Constructor;
	Owl.Support = {};

	/**
	* Indicates whether touch events are supported or not.
	* @type {Boolean}
	*/
	Owl.Support.touch = Modernizr.touch;

	/**
	* Indicates whether pointer events are supported or not.
	* @type {Boolean}
	*/
	Owl.Support.pointer = Modernizr.pointerevents;

	var transition = false;
	if (Modernizr.csstransitions) {
		var transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',// Saf 6, Android Browser
			'MozTransition':    'transitionend',      // only for FF < 15
			'transition':       'transitionend'       // IE10, Opera, Chrome, FF 15+, Saf 7+
		};
		transition = transEndEventNames[ Modernizr.prefixed('transition') ];
	}
	/**
	* Is `false` when CSS3 transitions are not supported or an object which
	* includes a `end` property with the available `transitionend` event name.
	* Similiar to Twitter's Bootstrap.
	* @type {Boolean|Object}
	*/
	Owl.Support.transition = transition;

	var transform = false;
	if (Modernizr.csstransforms) {
		transform = {
			'2d': Modernizr.csstransforms,
			'3d': Modernizr.csstransforms3d
		};
	}
	/**
	* Is `false` when CSS3 transforms are not supported at all. Otherwise it's an object
	* with two boolean members `2d` and `3d` which indicates the availability of CSS3
	* 2D and 3D tranformations.
	* @type {Boolean|Object}
	* @todo I'm not sure if 2D and 3D would make sense to check
	* @see http://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
	*/
	Owl.Support.transform = transform;


})(window.Zepto || window.jQuery, window.Modernizr, window, document);
