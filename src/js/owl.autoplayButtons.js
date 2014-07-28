/**
 * Autoplay Buttons Plugin
 * @version 1.0.0
 * @author Vivid Planet GmbH
 * @license The MIT License (MIT)
 *
 * HowTo:
 * set {autoplayButtons: true} in owl-carousel constructor
 * owl.autoplay.js must be included!
 */
;(function($, window, document, undefined) {
	'use strict';

	var AutoplayButtons = function(carousel) {

		this._core = carousel;
		this.$element = this._core.$element;

		// set default options
		this._core.options = $.extend({}, AutoplayButtons.Defaults, this._core.options);

		this.controls = {};
		this.controls.$play = $('<a href="#" class="'+this._core.options.buttonsClass[0]+'">'+this._core.options.buttonsText[0]+'</a>');
		this.controls.$stop = $('<a href="#" class="'+this._core.options.buttonsClass[1]+'">'+this._core.options.buttonsText[1]+'</a>');

		this.template = '<div class="'+this._core.options.buttonsContainerClass+'"></div>';

		this._handlers = {
			'initialize.owl.carousel': $.proxy(function(e) {
				if (!e.namespace) {
					return;
				}

				var $template = $(this.template);

				$template.insertAfter(this.$element);

				$template.append(this.controls.$stop);
				$template.append(this.controls.$play);

				this.controls.$stop.on('click', $.proxy(function(e){
					this.stop(this);
				}, this));

				this.controls.$play.on('click', $.proxy(function(e){
					this.play(this);
				}, this));

			}, this)
		};

		if(!this._core.options.autoplayButtons) return;

		// register event handlers
		this.$element.on(this._handlers);
	};

	AutoplayButtons.Defaults = {
		buttonsContainerClass: 'owl-autoplay-controls',
		buttonsText: ['play', 'stop'],
		buttonsClass: ['play', 'stop']
	};

	// Handle the play click
	AutoplayButtons.prototype.play = function(ev) {
		if(!this._core.settings.autoplay)
			this._core.settings.autoplay = true;

		this.$element.trigger('play.autoplay.owl', [5000]);
	};

	// Handle the stop click
	AutoplayButtons.prototype.stop = function(ev) {
		this.$element.trigger('stop.autoplay.owl');
	};

	$.fn.owlCarousel.Constructor.Plugins.AutoplayButtons = AutoplayButtons;

})(window.Zepto || window.jQuery, window, document);
