/**
 * Video Plugin
 * @since 2.0.0
 */

;(function ($, window, document, undefined) {

	Video = function(scope){
		this.owl = scope;
		this.owl.options = $.extend(Video.Defaults, this.owl.options);
		
		if (!this.owl.options.video) return;

		this.owl.dom.$stage.on(this.owl.dragType[2], '.owl-video-play-icon', $.proxy(function(e) {
			this.playVideo(e);
		}, this));

		this.owl.dom.$el.on({
			'resize.owl.carousel': $.proxy(function(e) {
				if (!this.isInFullScreen()) e.preventDefault();
			}, this),
			'refresh.owl.carousel changed.owl.carousel': $.proxy(function(e) {
				if (this.owl.state.videoPlay) this.stopVideo();
			}, this),
			'refresh.owl.carousel': $.proxy(function(e) {
				this.owl.dom.$el.one('update.owl.carousel', $.proxy(this.checkVideoLinks, this));
			}, this)
		});
	}
	
	Video.Defaults = {
		video:			false,
		videoHeight:	false,
		videoWidth:		false
	}

	/**
	 * checkVideoLinks
	 * @desc Check if for any videos links
	 * @since 2.0.0
	 */

	Video.prototype.checkVideoLinks = function(){
		if(!this.owl.options.video){return false;}
		var videoEl,item;

		for(var i = 0; i<this.owl.num.items; i++){

			item = this.owl.dom.$items.eq(i);
			if(item.data('owl-item').hasVideo){
				continue;
			}

			videoEl = item.find('.owl-video');
			if(videoEl.length){
				this.owl.state.hasVideos = true;
				this.owl.dom.$items.eq(i).data('owl-item').hasVideo = true;
				videoEl.css('display','none');
				this.getVideoInfo(videoEl,item);
			}
		}
	};

	/**
	 * getVideoInfo
	 * @desc Get Video ID and Type (YouTube/Vimeo only)
	 * @since 2.0.0
	 */

	Video.prototype.getVideoInfo = function(videoEl,item){

		var info, type, id,
			vimeoId = videoEl.data('vimeo-id'),
			youTubeId = videoEl.data('youtube-id'),
			width = videoEl.data('width') || this.owl.options.videoWidth,
			height = videoEl.data('height') || this.owl.options.videoHeight,
			url = videoEl.attr('href');

		if(vimeoId){
			type = 'vimeo';
			id = vimeoId;
		} else if(youTubeId){
			type = 'youtube';
			id = youTubeId;
		} else if(url){
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
		var dimensions = width && height ? 'style="width:'+width+'px;height:'+height+'px;"' : '';

		// wrap video content into owl-video-wrapper div
		videoEl.wrap('<div class="owl-video-wrapper"'+dimensions+'></div>');

		this.createVideoTn(videoEl,info);
	};

	/**
	 * createVideoTn
	 * @desc Create Video Thumbnail
	 * @since 2.0.0
	 */

	Video.prototype.createVideoTn = function(videoEl,info){

		var tnLink,icon,height;
		var customTn = videoEl.find('img');
		var srcType = 'src';
		var lazyClass = '';
		var that = this.owl;

		if(this.owl.options.lazyLoad){
			srcType = 'data-src';
			lazyClass = 'owl-lazy';
		}

		// Custom thumbnail

		if(customTn.length){
			addThumbnail(customTn.attr(srcType));
			customTn.remove();
			return false;
		}
		
		function addThumbnail(tnPath){
			icon = '<div class="owl-video-play-icon"></div>';

			if(that.options.lazyLoad){
				tnLink = '<div class="owl-video-tn '+ lazyClass +'" '+ srcType +'="'+ tnPath +'"></div>';
			} else{
				tnLink = '<div class="owl-video-tn" style="opacity:1;background-image:url(' + tnPath + ')"></div>';
			}
			videoEl.after(tnLink);
			videoEl.after(icon);
		}

		if(info.type === 'youtube'){
			var path = "http://img.youtube.com/vi/"+ info.id +"/hqdefault.jpg";
			addThumbnail(path);
		} else
		if(info.type === 'vimeo'){
			$.ajax({
				type:'GET',
				url: 'http://vimeo.com/api/v2/video/' + info.id + '.json',
				jsonp: 'callback',
				dataType: 'jsonp',
				success: function(data){
					var path = data[0].thumbnail_large;
					addThumbnail(path);
					if(that.options.loop){
						that.updateItemState();
					}
				}
			});
		}
	};

	/**
	 * stopVideo
	 * @since 2.0.0
	 */

	Video.prototype.stopVideo = function(){
		this.owl.fireCallback('onVideoStop');
		var item = this.owl.dom.$items.eq(this.owl.state.videoPlayIndex);
		item.find('.owl-video-frame').remove();
		item.removeClass('owl-video-playing');
		this.owl.state.videoPlay = false;
	};

	/**
	 * playVideo
	 * @since 2.0.0
	 */

	Video.prototype.playVideo = function(ev){
		this.owl.fireCallback('onVideoPlay');

		if(this.owl.state.videoPlay){
			this.stopVideo();
		}
		var videoLink,videoWrap,
			target = $(ev.target || ev.srcElement),
			item = target.closest('.'+this.owl.options.itemClass);

		var videoType = item.data('owl-item').videoType,
			id = item.data('owl-item').videoId,
			width = item.data('owl-item').videoWidth || Math.floor(item.data('owl-item').width - this.owl.options.margin),
			height = item.data('owl-item').videoHeight || this.owl.dom.$stage.height();

		if(videoType === 'youtube'){
			videoLink = "<iframe width=\""+ width +"\" height=\""+ height +"\" src=\"http://www.youtube.com/embed/" + id + "?autoplay=1&v=" + id + "\" frameborder=\"0\" allowfullscreen></iframe>";
		} else if(videoType === 'vimeo'){
			videoLink = '<iframe src="http://player.vimeo.com/video/'+ id +'?autoplay=1" width="'+ width +'" height="'+ height +'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
		}
		
		item.addClass('owl-video-playing');
		this.owl.state.videoPlay = true;
		this.owl.state.videoPlayIndex = item.data('owl-item').indexAbs;

		videoWrap = $('<div style="height:'+ height +'px; width:'+ width +'px" class="owl-video-frame">' + videoLink + '</div>');
		target.after(videoWrap);
	};

	Video.prototype.isInFullScreen = function(){

		// if Vimeo Fullscreen mode
		var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
		if(fullscreenElement){
			if($(fullscreenElement.parentNode).hasClass('owl-video-frame')){
				this.owl.setSpeed(0);
				this.owl.state.isFullScreen = true;
			}
		}

		if(fullscreenElement && this.owl.state.isFullScreen && this.owl.state.videoPlay){
			return false;
		}

		// Comming back from fullscreen
		if(this.owl.state.isFullScreen){
			this.owl.state.isFullScreen = false;
			return false;
		}

		// check full screen mode and window orientation
		if (this.owl.state.videoPlay) {
			if(this.owl.state.orientation !== window.orientation){
				this.owl.state.orientation = window.orientation;
				return false;
			}
		}
	}

	Video.prototype.destroy = function(){
		this.owl.dom.$stage.off(this.owl.dragType[2]);
	}

	$.fn.owlCarousel.Constructor.Plugins['video'] = Video;

}(jQuery, this, this.document));
