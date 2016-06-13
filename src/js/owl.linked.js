/**
 * Plugin for linking multiple owl instances
 * @version 1.0.0
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
    /**
     * Creates the Linked plugin.
     * @class The Linked Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var Linked = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'dragged.owl.carousel changed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.linked) {
                    this.update(e);
                }
            }, this),
            'link.to.owl.carousel': $.proxy(function(e, index, speed, standard, propagate) {
                if (e.namespace && this._core.settings.linked) {
                    this.toSlide(index, speed, propagate);
                }
            }, this)
        };

        // register event handlers
        this._core.$element.on(this._handlers);

        // set default options
        this._core.options = $.extend({}, Linked.Defaults, this._core.options);
    };

    /**
     * Default options.
     * @public
     */
    Linked.Defaults = {
        linked: false,
        linkSpeed: 300
    };

    /**
     * Updated linked instances
     */
    Linked.prototype.update = function(e) {
        this.toSlide( e.relatedTarget.relative(e.item.index) );
    };

    /**
     * Carry out the to.owl.carousel proxy function
     * @param {int} index
     * @param {int} speed
     * @param {bool} propagate
     */
    Linked.prototype.toSlide = function(index, speed, propagate) {
        var id = this._core.$element.attr('id'),
            linked = typeof this._core.settings.linked === 'string' ? this._core.settings.linked.split(',') : this._core.settings.linked,
            speed = this._core.options.linkSpeed;

        propagate = typeof propagate == 'undefined' ? true : propagate;

        index = index || 0;

        if ( propagate ) {
            $.each(linked, function(i, el){
                $(el).trigger('link.to.owl.carousel', [index, speed, true, false]); // don't propagate
            });
			$(linked[0]).trigger('linked.owl.carousel', index);
        } else {
            this._core.$element.trigger('to.owl.carousel', [index, speed, true]);

            if ( this._core.settings.current ) {
                this._core._plugins.current.switchTo(index);
            }
        }
    };

    /**
     * Destroys the plugin.
     * @protected
     */
    Linked.prototype.destroy = function() {
        var handler, property;

        for (handler in this._handlers) {
            this.$element.off(handler, this._handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.linked = Linked;

})(window.Zepto || window.jQuery, window, document);
