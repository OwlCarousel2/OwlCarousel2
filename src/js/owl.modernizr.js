/**
 * Modernizr Plugin
 * Optional Plugin that can be loaded instead of browsersupport
 * @version 2.0.0
 * @author Vivid Planet Software GmbH
 * @license The MIT License (MIT)
 */
;(function($, Modernizr, window, document, undefined) {

	if (!Modernizr) {
		throw new Error('Modernizr is not loaded.');
	}
	if (typeof Modernizr.csstransforms3d == 'undefined') {
		throw new Error('Modernizr csstransforms3d test is not loaded.');
	}

	$.fn.owlCarousel.Constructor.prototype.vendorPrefixed = function(property) {
		return Modernizr.prefixed(property);
	};
	$.fn.owlCarousel.Constructor.prototype.getSupport3d = function() {
		return Modernizr.csstransforms3d;
	};

})(window.Zepto || window.jQuery, window.Modernizr, window, document);
