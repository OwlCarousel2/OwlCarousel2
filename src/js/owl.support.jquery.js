/**
 * jQuery Support Plugin
 *
 * @version 1.0.0
 * @author Christian Hain
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
	var eventListenerTypes = [
		'mousewheel',
		'touchcancel',
		'touchdrag',
		'touchend',
		'touchstart'
	],
	i = 0;

	for (i = 0; i < eventListenerTypes.length; i++) {
		createSpecialEvent(eventListenerTypes[i]);
	}

	function createSpecialEvent(eventListenerType) {
		$.event.special[eventListenerType] = {
			setup: function(data, namespaces, eventHandle) {
				if (namespaces.includes('noPreventDefault')) {
					this.addEventListener(eventListenerType, eventHandle, { passive: true });
				} else {
					return false;
				}
			}
		}
	}

})(window.Zepto || window.jQuery, window, document);
