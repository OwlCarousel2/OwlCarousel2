/**
 * Browser Support Plugin
 * @version 2.0.0
 * @author Vivid Planet Software GmbH
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
		* Checks for CSS support.
		* @private
		* @param {Array} array - The CSS properties to check for.
		* @returns {Array} - Contains the supported CSS property name and its index or `false`.
		*/
	function isStyleSupported(array) {
		var p, s, fake = document.createElement('div'), list = array;
		for (p in list) {
			s = list[p];
			if (typeof fake.style[s] !== 'undefined') {
				fake = null;
				return [ s, p ];
			}
		}
		return [ false ];
	}

	/**
		* Checks for CSS transform support.
		* @private
		* @returns {String} The supported property name or false.
		*/
	function isTransform() {
		return isStyleSupported([ 'transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform' ])[0];
	}

	/**
		* Checks for CSS perspective support.
		* @private
		* @returns {String} The supported property name or false.
		*/
	function isPerspective() {
		return isStyleSupported([ 'perspective', 'webkitPerspective', 'MozPerspective', 'OPerspective', 'MsPerspective' ])[0];
	}

	var support3d = isPerspective(),
		vendorName = '',
		transformVendor

	if (support3d) {
		transformVendor = isTransform();

		// take vendor name from transform name
		vendorName = transformVendor.replace(/Transform/i, '');
		vendorName = vendorName !== '' ? '-' + vendorName.toLowerCase() + '-' : '';
	}

	$.fn.owlCarousel.Constructor.prototype.vendorPrefixed = function(property) {
		return vendorName + property;
	};
	$.fn.owlCarousel.Constructor.prototype.getSupport3d = function() {
		return support3d;
	};

})(window.Zepto || window.jQuery, window, document);
