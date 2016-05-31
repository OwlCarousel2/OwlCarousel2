/**
 * jQuery Support Plugin
 *
 * @version 1.0.0
 * @author Christian Hain
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
	var supportsEventListenerOptions = false,
		eventListenerTypes = [
			'mousewheel',
			'touchcancel',
			'touchdrag',
			'touchend',
			'touchstart'
		],
		i = 0;

	try {
		// Check to see if the browser can create new Events this way.
		testEvents = new Event('test');

		// Check to see if the browser supports Event Listener options.
		opts = Object.defineProperty({}, 'capture', {
			get: function() {
				supportsEventListenerOptions = true;
			}
		});

		window.addEventListener('test', null, opts);
	} catch (e) {}

	if (supportsEventListenerOptions) {
		for (i = 0; i < eventListenerTypes.length; i++) {
			createSpecialEvent(eventListenerTypes[i]);
		}
	}

	function createSpecialEvent(eventListenerType) {
		$.event.special[eventListenerType] = {
			setup: function(_, ns, handle) {
				if (ns.indexOf('noPreventDefault') > -1) {
					this.addEventListener(eventListenerType, handle, { passive: true });
				} else {
					return false;
				}
			}
		}
	}

})(window.Zepto || window.jQuery, window, document);
