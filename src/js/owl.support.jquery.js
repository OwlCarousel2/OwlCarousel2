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
			setup: function(_, ns, handle) {
				try {
					if (ns.includes('noPreventDefault')) {
						this.addEventListener(eventListenerType, handle, { passive: true });
					} else {
						return false;
					}
				} catch(e) {
					return false;
				}
			}
		}
	}

})(window.Zepto || window.jQuery, window, document);
