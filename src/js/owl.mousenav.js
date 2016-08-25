/**
 * @description Plugin for navigating between slides by selecting them, with a click or something else.
 * @version 1.1.0
 * @author Luiz Filipe Machado Barni @odahcam
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {
    /**
     * Creates the MouseNav plugin.
     * @class MouseNav the Plugin
     * @param {Owl} carousel the Owl Carousel
     */
    var MouseNav = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        // set default options
        this._core.options = $.extend({}, MouseNav.Defaults, this._core.options);

        // starts the plugin only if mouseNav == true
        if (this._core.options.mouseNav) {
            this.init();
        }
    };

    /**
     * Default options.
     * @public
     */
    MouseNav.Defaults = {
        mouseNav: false,
        mouseNavTrigger: 'click'
    };

    /**
     * Carry out the to.owl.carousel proxy function
     * @param {int} index
     * @param {int} speed
     */
    MouseNav.prototype.toSlide = function(index, speed) {

        index = index || 0;

        this._core.$element.trigger('to.owl.carousel', [index, speed, true]);

        if (this._core.settings.current) {
            this._core._plugins.current.switchTo(index);
        }

        this._core.$element.trigger('mouseNaved.owl.carousel', index);

    };

    /**
     * Unset and sets the mouse navigation handlers
     * @param {void}
     */
    MouseNav.prototype.resetNavHandlers = function() {
        this.unsetNavHandlers();
        this._core.$element.on(this._handlers_sub, '.owl-item');
    };

    /**
     * Unset the mouse navigation handlers
     * @param {void}
     */
    MouseNav.prototype.unsetNavHandlers = function() {
        for (var handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
    };

    /**
     * Destroys the plugin.
     * @protected
     */
    MouseNav.prototype.destroy = function() {
        var handler, property;

        this.unsetNavHandlers();

        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] !== 'function' && (this[property] = null);
        }
    };

    MouseNav.prototype.init = function() {
        var navTriggers = this._core.options.mouseNavTrigger.replace(/\s|$/g, '.owl.item ').replace(/\s$/g, '');

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

    $.fn.owlCarousel.Constructor.Plugins.MouseNav = MouseNav;

})(window.Zepto || window.jQuery, window, document);
