/**
 * Video Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the video plugin.
	 * @class The Video Plugin
	 * @param {Owl} scope - The Owl Carousel
	 */
	Video = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, Video.Defaults, this.owl.options);

		this.handlers = {
			'resize.owl.carousel': $.proxy(function(e) {
				if (this.owl.settings.video && !this.isInFullScreen()) {
					e.preventDefault();
				}
			}, this),
			'refresh.owl.carousel changed.owl.carousel': $.proxy(function(e) {
				if (this.owl.state.videoPlay) {
					this.stopVideo();
				}
			}, this),
			'refresh.owl.carousel refreshed.owl.carousel': $.proxy(function(e) {
				if (!this.owl.settings.video) {
					return false;
				}
				this.refreshing = e.type == 'refresh';
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (this.refreshing && e.property.name == 'items' && e.property.value && !e.property.value.is(':empty')) {
					this.checkVideoLinks();
				}
			}, this)
		};

		this.owl.dom.$el.on(this.handlers);

		this.owl.dom.$el.on('click.owl.video', '.owl-video-play-icon', $.proxy(function(e) {
			this.playVideo(e);
		}, this));
	};

	/**
	 * Default options.
	 * @public
	 */
	Video.Defaults = {
		video: false,
		videoHeight: false,
		videoWidth: false
	};

	/**
	 * Checks if for any videos links exists.
	 * @protected
	 */
	Video.prototype.checkVideoLinks = function() {
		var videoEl, item, i;

		for (i = 0; i < this.owl.num.items; i++) {

			item = this.owl.dom.$items.eq(i);
			if (item.data('owl-item').hasVideo) {
				continue;
			}

			videoEl = item.find('.owl-video');
			if (videoEl.length) {
				this.owl.state.hasVideos = true;
				this.owl.dom.$items.eq(i).data('owl-item').hasVideo = true;
				videoEl.css('display', 'none');
				this.getVideoInfo(videoEl, item);
			}
		}
	};

	/**
	 * Gets the video ID and the type (YouTube/Vimeo only).
	 * @protected
	 * @param {jQuery} videoEl - The element containing the video data.
	 * @param {jQuery} item - The item containing the video.
	 */
	Video.prototype.getVideoInfo = function(videoEl, item) {

		var info, type, id, dimensions,
			vimeoId = videoEl.data('vimeo-id'),
			youTubeId = videoEl.data('youtube-id'),
			width = videoEl.data('width') || this.owl.settings.videoWidth,
			height = videoEl.data('height') || this.owl.settings.videoHeight,
			url = videoEl.attr('href');

		if (vimeoId) {
			type = 'vimeo';
			id = vimeoId;
		} else if (youTubeId) {
			type = 'youtube';
			id = youTubeId;
		} else if (url) {
			id = url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

			if (id[3].indexOf('youtu') > -1) {
				type = 'youtube';
			} else if (id[3].indexOf('vimeo') > -1) {
				type = 'vimeo';
			}
			id = id[6];
		} else {
			throw new Error('Missing video link.');
		}

		item.data('owl-item').videoType = type;
		item.data('owl-item').videoId = id;
		item.data('owl-item').videoWidth = width;
		item.data('owl-item').videoHeight = height;

		info = {
			type: type,
			id: id
		};

		// Check dimensions
		dimensions = width && height ? 'style="width:' + width + 'px;height:' + height + 'px;"' : '';

		// wrap video content into owl-video-wrapper div
		videoEl.wrap('<div class="owl-video-wrapper"' + dimensions + '></div>');

		this.createVideoTn(videoEl, info);
	};

	/**
	 * Creates video thumbnail.
	 * @protected
	 * @param {jQuery} videoEl - The element containing the video data.
	 * @param {Object} info - The video info object.
	 * @see `getVideoInfo`
	 */
	Video.prototype.createVideoTn = function(videoEl, info) {

		var tnLink, icon, path,
			customTn = videoEl.find('img'),
			srcType = 'src',
			lazyClass = '',
			that = this.owl;

		if (this.owl.settings.lazyLoad) {
			srcType = 'data-src';
			lazyClass = 'owl-lazy';
		}

		// Custom thumbnail

		if (customTn.length) {
			addThumbnail(customTn.attr(srcType));
			customTn.remove();
			return false;
		}

		function addThumbnail(tnPath) {
			icon = '<div class="owl-video-play-icon"></div>';

			if (that.settings.lazyLoad) {
				tnLink = '<div class="owl-video-tn ' + lazyClass + '" ' + srcType + '="' + tnPath + '"></div>';
			} else {
				tnLink = '<div class="owl-video-tn" style="opacity:1;background-image:url(' + tnPath + ')"></div>';
			}
			videoEl.after(tnLink);
			videoEl.after(icon);
		}

		if (info.type === 'youtube') {
			path = "http://img.youtube.com/vi/" + info.id + "/hqdefault.jpg";
			addThumbnail(path);
		} else if (info.type === 'vimeo') {
			$.ajax({
				type: 'GET',
				url: 'http://vimeo.com/api/v2/video/' + info.id + '.json',
				jsonp: 'callback',
				dataType: 'jsonp',
				success: function(data) {
					path = data[0].thumbnail_large;
					addThumbnail(path);
					if (that.settings.loop) {
						that.updateActiveItems();
					}
				}
			});
		}
	};

	/**
	 * Stops the current video.
	 * @public
	 */
	Video.prototype.stopVideo = function() {
		this.owl.trigger('stop', null, 'video');
		var item = this.owl.dom.$items.eq(this.owl.state.videoPlayIndex);
		item.find('.owl-video-frame').remove();
		item.removeClass('owl-video-playing');
		this.owl.state.videoPlay = false;
	};

	/**
	 * Starts the current video.
	 * @public
	 * @param {Event} ev - The event arguments.
	 */
	Video.prototype.playVideo = function(ev) {
		this.owl.trigger('play', null, 'video');

		if (this.owl.state.videoPlay) {
			this.stopVideo();
		}
		var videoLink, videoWrap, videoType,
			target = $(ev.target || ev.srcElement),
			item = target.closest('.' + this.owl.settings.itemClass);

		videoType = item.data('owl-item').videoType, id = item.data('owl-item').videoId, width = item
			.data('owl-item').videoWidth
			|| Math.floor(item.data('owl-item').width - this.owl.settings.margin), height = item.data('owl-item').videoHeight
			|| this.owl.dom.$stage.height();

		if (videoType === 'youtube') {
			videoLink = "<iframe width=\"" + width + "\" height=\"" + height + "\" src=\"http://www.youtube.com/embed/"
				+ id + "?autoplay=1&v=" + id + "\" frameborder=\"0\" allowfullscreen></iframe>";
		} else if (videoType === 'vimeo') {
			videoLink = '<iframe src="http://player.vimeo.com/video/' + id + '?autoplay=1" width="' + width
				+ '" height="' + height
				+ '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
		}

		item.addClass('owl-video-playing');
		this.owl.state.videoPlay = true;
		this.owl.state.videoPlayIndex = item.data('owl-item').indexAbs;

		videoWrap = $('<div style="height:' + height + 'px; width:' + width + 'px" class="owl-video-frame">'
			+ videoLink + '</div>');
		target.after(videoWrap);
	};

	/**
	 * Checks whether an video is currently in full screen mode or not.
	 * @protected
	 * @returns {Boolean}
	 */
	Video.prototype.isInFullScreen = function() {

		// if Vimeo Fullscreen mode
		var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement
			|| document.webkitFullscreenElement;
		if (fullscreenElement) {
			if ($(fullscreenElement.parentNode).hasClass('owl-video-frame')) {
				this.owl.speed(0);
				this.owl.state.isFullScreen = true;
			}
		}

		if (fullscreenElement && this.owl.state.isFullScreen && this.owl.state.videoPlay) {
			return false;
		}

		// Comming back from fullscreen
		if (this.owl.state.isFullScreen) {
			this.owl.state.isFullScreen = false;
			return false;
		}

		// check full screen mode and window orientation
		if (this.owl.state.videoPlay) {
			if (this.owl.state.orientation !== window.orientation) {
				this.owl.state.orientation = window.orientation;
				return false;
			}
		}
		return true;
	};

	/**
	 * Destroys the plugin.
	 */
	Video.prototype.destroy = function() {
		var handler, property;

		this.owl.dom.$el.off('click.owl.video');

		for (handler in this.handlers) {
			this.owl.dom.$el.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.video = Video;

})(window.Zepto || window.jQuery, window, document);
