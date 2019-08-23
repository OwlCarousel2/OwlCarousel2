/**
 * @description Plugin for navigating between slides by selecting them, with a click or something else.
 * @version 2.0.0
 * @author Luiz Filipe Machado Barni @odahcam
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {
    /**
     * Creates the navByClick plugin.
     * @class navByClick the Plugin
     * @param {Owl} carousel the Owl Carousel
     */
    var navByClick = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        // set default options
        this._core.options = $.extend({}, navByClick.Defaults, this._core.options);

        // starts the plugin only if navByClick == true
        if (this._core.options.navByClick) {
            this.init();
        }
    };

    /**
     * Default options.
     * @public
     */
    navByClick.Defaults = {
        navByClick: false,
        navByClickTrigger: 'click'
    };

    /**
     * Carry out the to.owl.carousel proxy function
     * @param {int} index
     * @param {int} speed
     */
    navByClick.prototype.toSlide = function(index, speed) {

        index = index || 0;

        this._core.$element.trigger('to.owl.carousel', [index, speed, true]);

        if (this._core.settings.current) {
            this._core._plugins.current.switchTo(index);
        }

        this._core.$element.trigger('navByClicked.owl.carousel', index);

    };

    /**
     * Unset and sets the mouse navigation handlers
     * @param {void}
     */
    navByClick.prototype.resetNavHandlers = function() {
        this.unsetNavHandlers();
        this._core.$element.on(this._handlers_sub, '.owl-item');
    };

    /**
     * Unset the mouse navigation handlers
     * @param {void}
     */
    navByClick.prototype.unsetNavHandlers = function() {
        for (var handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
    };

    /**
     * Destroys the plugin.
     * @protected
     */
    navByClick.prototype.destroy = function() {
        var handler, property;

        this.unsetNavHandlers();

        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] !== 'function' && (this[property] = null);
        }
    };

    navByClick.prototype.init = function() {
        var navTriggers = this._core.options.navByClickTrigger.replace(/\s|$/g, '.owl.item ').replace(/\s$/g, '');

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */

        this._handlers = {
            "refreshed.owl.carousel": $.proxy(function(e) {
                this.resetNavHandlers();
            }, this)
        };

        this._handlers_sub = {};

        // register custom navigation triggers
        this._handlers_sub[navTriggers] = $.proxy(function(e) {
            var clickIndex = $(e.target).closest('.owl-item').index();
            var relativeIndex = this._core.relative(clickIndex);

            this.toSlide(relativeIndex, this._core.options.navSpeed);
        }, this);

        // register event handlers
        this._core.$element.on(this._handlers);
        this._core.$element.on(this._handlers_sub, '.owl-item');
    };

    $.fn.owlCarousel.Constructor.Plugins.navByClick = navByClick;

})(window.Zepto || window.jQuery, window, document);
