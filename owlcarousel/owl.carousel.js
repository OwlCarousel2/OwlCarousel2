/**
 * @name Owl Carousel - code name Phenix
 * @author Bartosz Wojciechowski
 * @release 2014
 * Licensed under MIT
 * 
 * @version 2.0.0-beta.0.4
 * @versionNotes Not compatibile with Owl Carousel <2.0.0
 */

/*

{0,0}
 )_)
 ""

To do:

* Lazy Load Icon
* Text navigation 
* Responsive images 
* Thumbnail images
* prevent animationend bubling
* itemsScaleUp 
* Test Zepto
* autoplay pause //on hover

Callback events list:

:onBeforeInit
:onAfterInit
:onBeforeResponsive
:onAfterResponsive
:onAnimationStart
:onAnimationEnd
:onStartTouch
:onEndTouch
:onChange
:onLazyLoaded
:onPlayVideo
:onStopVideo

//to do
:onPlay
:onStop

Custom events list:

:owl.next
:owl.next
:owl.goTo
:owl.jumpTo
:owl.addItem
:owl.removeItem
:owl.refresh

*/


;(function ( $, window, document, undefined ) {

	var defaults = {
		items:				3,
		loop:				false,
		center:				false,
		lazyLoad:			false,
		mouseDrag:			true,
		touchDrag:			true,

		margin:				0,
		stagePadding:		0,

		merge:				false,
		mergeFit:			true,
		autoWidth:			false,

		startPosition:		0,
		navigation: 		false,
		navText: 			['next','prev'],
		slideBy:			1,
		pagination: 		true,
		paginationEach:		false,
		dotsName:			false,
		URLhashListener:	false,

		autoplay:			false,
		autoplayTimeout:	5000,//ap interval
		autoplayHoverPause:	false,

		smartSpeed:			250,
		fluidSpeed:			false,
		autoplaySpeed:		false,
		naviSpeed:			false,
		paginationSpeed:	false,
		dragEndSpeed:		false,
		
		callbacks:			false,
		responsive: 		{},
		responsiveRefreshRate : 200,
		responsiveBaseElement: window,

		video:				false,
		videoHeight:		false,
		videoWidth:			false,

		mobileBoost: 		false,
		fallbackEasing:		'swing',

		createStucture:		true,

		//Classes and Names
		clonedClasses:		false,
		themeClass: 		'owl-theme',
		baseClass:			'owl-carousel',
		itemClass:			'owl-item',
		centerClass:		'center',
		activeClass: 		'active',
		navContainerClass:	'owl-nav',
		navClass:			['owl-prev','owl-next'],
		controlsClass:		'owl-controls',
		pagiDotClass: 		'owl-dot',
		pagiClass:			'owl-pagination',
		mobileBoostClass:	'owl-mobile',
		autoHeightClass:	'owl-height'

	};

	// Reference to DOM elements
	// Those with $ sign are jQuery objects

	var dom = {
		el:			null,	// main element 
		$el:		null,	// jQuery main element 
		wrp:		null,	// wrapper
		$wrp:		null,	// jQuery wrapper
		oWrp:		null,	// outer wrp
		$oWrp:		null,	// outer wrp
		$items:		null,	// all items, clones and originals included 
		$oItems:	null,	// original items
		$cItems:	null,	// cloned items only
		$cc:		null,
		$navPrev:	null,
		$navNext:	null,
		$page:		null,
		$nav:		null
	};

	/**
	 * Variables
	 * @since 2.0.0
	 */

	// Only for development process

	// Widths

	var width = {
		el:			0,
		wrp:		0,
		item:		0,
		prevWindow:	0,
		cloneLast:  0
	};

	// Numbers

	var num = {
		items:				0,
		oItems: 			0,
		cItems:				0,
		active:				0,
		merged:				[],
		nav:				[]
	};

	// Positions

	var pos = {
		start:		0,
		max:		0,
		maxValue:	0,
		prev:		0,
		current:	0,
		currentAbs:	0,
		currentPage:0,
		wrp:		0,
		items:		[]
	};

	// Drag/Touches

	var drag = {
		start:		0,
		startX:		0,
		startY:		0,
		current:	0,
		currentX:	0,
		currentY:	0,
		offsetX:	0,
		offsetY:	0,
		distance:	null,
		startTime:	0,
		endTime:	0,
		updatedX:	0,
		targetEl:	null
	};

	// Speeds

	var speed = {
		onDragEnd: 	300,
		navi:		300,
		css2speed:	0

	};

	// States

	var state = {
		isTouch:		false,
		isScrolling:	false,
		isSwiping:		false,
		direction:		false,
		inMotion:		false,
		autoplay:		false
	};

	// Event functions references

	var e = {
		_onDragStart:	null,
		_onDragMove:	null,
		_onDragEnd:		null,
		_transitionEnd: null,
		_resizer:		null,
		_responsiveCall:null,
		_goToLoop:		null,
		_checkVisibile: null,
		_autoplay:		null,
		_pause:			null,
		_play:			null,
		_stop:			null
	};

	function Owl( element, options ) {

		// add basic Owl information to dom element

		element.owlCarousel = {
			'name':		'Owl Carousel',
			'author':	'Bartosz Wojciechowski',
			'version':	'2.0.0-beta.0.4',
			'released':	'16.04.2014'
		};

		// Attach variables to object
		// Only for development process

		this.options = 		$.extend( {}, defaults, options);
		this._options =		$.extend( {}, defaults, options);
		this.dom =			$.extend( {}, dom);
		this.width =		$.extend( {}, width);
		this.num =			$.extend( {}, num);
		this.pos =			$.extend( {}, pos);
		this.drag =			$.extend( {}, drag);
		this.speed =		$.extend( {}, speed);
		this.state =		$.extend( {}, state);
		this.e =			$.extend( {}, e);

		this.dom.el =		element;
		this.dom.$el =		$(element);
		this.init();
	}

	/**
	 * init
	 * @since 2.0.0
	 */

	Owl.prototype.preloadVariousImages = function(allImgs){
		var loaded = 0;
		for(var i = 0; i<allImgs.length;i++){
	 		var img = new Image();
	 		img.onload = function(){
	 			loaded++;
	 			if(loaded >= allImgs.length){
	 				this.state.imagesLoaded = true;
	 				this.init();
	 			}
			}.bind(this);
			// To do - check if image has src
			img.src = allImgs[i].src;
	 	}
	};

	Owl.prototype.init = function(){

		this.fireCallback('onBeforeInit');

		// set opacity 0 to main element 
		this.dom.el.style.opacity = '0';

		//Add base class
		if(!this.dom.$el.hasClass(this.options.baseClass)){
			this.dom.$el.addClass(this.options.baseClass);
		}

		//Add theme class
		if(!this.dom.$el.hasClass(this.options.themeClass)){
			this.dom.$el.addClass(this.options.themeClass);
		}

		// Check support 
		this.support3d = 			isTransform3d();
		this.transformProperty =	isTransformProperty();
		this.state.orientation = 	window.orientation;

		if(this.transformProperty !== false){
			this.vendorName =  			this.transformProperty.replace(/Transform/i,'');
			this.vendorName = 			this.vendorName !== '' ? '-'+this.vendorName.toLowerCase()+'-' : '';
		}

		// Sort responsive items in array
		this.sortOptions();

		// Update options.items on given size
		this.setResponsiveOptions();

		if(this.options.autoWidth){
			var allImgs = this.dom.$el.find('img');
			if(allImgs.length){
				if(this.state.imagesLoaded !== true){
					this.preloadVariousImages(allImgs);
					return false;
				}
			}
		}

		// Get and store window width
		// iOS safari likes to trigger unnecessary resize event
		this.width.prevWindow = this.windowWidth();

		if(this.options.createStucture){
			// create wrp object
			this.createWrp();

			// Append local content 
			this.appendLocalItems();
		}

		// Check options
		this.optionsLogic();

		// Update local content
		this.updateLocalContent();

		//Check for videos ( YouTube and Vimeo currently supported)
		this.checkVideoLinks();

		// Create clones for infinity loop
		this.loopClone();

		// Zepto require main element to be displayed befor data collection
		this.dom.el.style.display = 'block';

		// Update item positions in data object
		this.calculate();

		this.dom.el.style.opacity = '1';

		// attach generic events 
		this.eventsCall();

		// attach custom control events
		this.addCustomEvents();

		// attach generic events 
		this.internalEvents();

		// Set init positions 
		this.initPosition();

		// Find visible/center items 
		this.updateItemState();

		// play
		this.autoplay();

		// check if el is visible - handy for hidden content in tabs etc.
		this.watchVisibility();

		this.fireCallback('onAfterInit');
	};
	/**
	 * sortOptions
	 * @desc Sort responsive sizes 
	 * @since 2.0.0
	 */

	Owl.prototype.sortOptions = function(){

		var resOpt = this.options.responsive;
		this.responsiveSorted = {};
		var keys = [],
		i, j, k;
		for (i in resOpt){
		    keys.push(i);
		}
		keys.sort();
		for (j = 0; j < keys.length; j++){
		    k = keys[j];
		    this.responsiveSorted[k] = resOpt[k];
		}

	};

	/**
	 * setResponsiveOptions
	 * @since 2.0.0
	 */

	Owl.prototype.setResponsiveOptions = function(){
		if(this.options.responsive === false){return false;}

		var width = this.windowWidth();
		var resOpt = this.options.responsive;
		var i,j,k, minWidth;

		// overwrite non resposnive options
		for(k in this._options){
			if(k !== "responsive"){
				this.options[k] = this._options[k];
			}
		}

		// find responsive width
		for (i in this.responsiveSorted){
	        if(i<= width){
	        	minWidth = i;
    			// set responsive options
				for(j in this.responsiveSorted[minWidth]){
					this.options[j] = this.responsiveSorted[minWidth][j];
				}
	        }
		}
	};

	/**
	 * optionsLogic
	 * @desc Update option logic if necessery
	 * @since 2.0.0
	 */

	Owl.prototype.optionsLogic = function(){
		// Toggle Center class
		this.dom.$wrp.toggleClass('owl-center',this.options.center);

		// Scroll per - 'page' option will scroll per visible items number
		// You can set this to any other number below visible items.
		if(this.options.slideBy && this.options.slideBy === 'page'){
			this.options.slideBy = this.options.items;
		} else if(this.options.slideBy > this.options.items){
			this.options.slideBy = this.options.items;
		}

		if(this.num.oItems <= this.options.items){
			this.options.loop = false;
		}

		if(this.options.mobileBoost){
			this.dom.$wrp.addClass(this.options.mobileBoostClass);
		} else {
			this.dom.$wrp.removeClass(this.options.mobileBoostClass);
		}

		if(this.options.autoHeight){
			this.dom.$oWrp.addClass(this.options.autoHeightClass);
		} else {
			this.dom.$oWrp.removeClass(this.options.autoHeightClass).css('height','');
		}

		if(this.options.autoWidth){
			this.options.stagePadding = false;
			this.options.paginationEach = 1;
			this.options.merge = false;
			//this.options.lazyLoad = false;
		}
	};

	/**
	 * createWrp
	 * @desc Create wrapper and Outer-wrapper divs
	 * @since 2.0.0
	 */

	Owl.prototype.createWrp = function(){
		var outerWrp = document.createElement('div');
		var wrp = document.createElement('div');

		outerWrp.className = 'owl-wrapper-outer';
		wrp.className = 'owl-wrapper';

		outerWrp.appendChild(wrp);
		this.dom.el.appendChild(outerWrp);

		this.dom.oWrp =	outerWrp;
		this.dom.$oWrp = $(outerWrp);
		this.dom.wrp = 	wrp;
		this.dom.$wrp = $(wrp);

		outerWrp = null;
		wrp = null;
	};

	/**
	 * createItem
	 * @desc Create item container
	 * @since 2.0.0
	 */

	Owl.prototype.createItem = function(){
		var item = document.createElement('div');
		item.className = this.options.itemClass;
		return item;
	};

	/**
	 * setData
	 * @desc Set item jQuery Data 
	 * @since 2.0.0
	 * @param [item] - dom - passed owl-item
	 * @param [cloneObj] - $dom - passed clone item
	 */


	Owl.prototype.setData = function(item,cloneObj,dotName){

		var itemData = {
			index:		false,
			indexAbs:	false,
			posLeft:	false,
			clone:		false,
			active:		false,
			loaded:		false,
			lazyLoad:	false,
			current:	false,
			width:		false,
			center:		false,
			page:		false,
			hasVideo:	false,
			playVideo:	false,
			dotName:	dotName || false,
			hash:		false
		};

		// copy itemData to cloned item 

		if(cloneObj){
			itemData = $.extend({}, itemData, cloneObj.data('owl-item'));
		}

		$(item).data('owl-item', itemData);
	};

	/**
	 * fillItem
	 * @desc Fill empty item container with provided content
	 * @since 2.0.0
	 * @param [content] - string/$dom - passed owl-item
	 * @param [i] - index in jquery object
	 * return $ new object
	 */

	Owl.prototype.fillItem = function(content,i){
		var emptyItem = this.createItem();
		var c = content[i] || content;
		// set item data 
		var dotName = this.traversContent(c)
		this.setData(emptyItem,false,dotName);
		return $(emptyItem).append(c);
	};

	/**
	 * traversContent
	 * @desc find name for pagination text
	 * @since 2.0.0
	 * @param [c] - content
	 * return $ data attribute
	 */

	Owl.prototype.traversContent = function(c){
		if(this.options.dotsName){
			return c.getAttribute('data-dotname');
		}
	}

	/**
	 * updateLocalContent
	 * @since 2.0.0
	 */

	Owl.prototype.updateLocalContent = function(){
		this.dom.$oItems = this.dom.$wrp.children('.owl-item').filter(function(){
			return $(this).data('owl-item').clone === false;
		});

		this.num.oItems = this.dom.$oItems.length;

		// update index on original items
		for(var k = 0; k<this.num.oItems; k++){
			var item = this.dom.$oItems.eq(k);
			item.data('owl-item').index = k;

			// update URL hash
			if(this.options.URLhashListener){
				var hash = item.find('[data-hash]').data('hash');
				item.data('owl-item').hash = hash;
			}
		}

	};

	/**
	 * checkVideoLinks
	 * @desc Check if for any videos links
	 * @since 2.0.0
	 */

	Owl.prototype.checkVideoLinks = function(){
		if(!this.options.video){return false;}
		var videoEl,item;

		for(var i = 0; i<this.num.oItems; i++){

			item = this.dom.$oItems.eq(i);
			if(item.data('owl-item').hasVideo){
				continue;
			}

			videoEl = item.find('.owl-video');
			if(videoEl.length){
				this.state.hasVideos = true;
				this.dom.$oItems.eq(i).data('owl-item').hasVideo = true;
				videoEl.css('display','none');
				this.getVideoInfo(videoEl,item);
			}
		}
	}

	/**
	 * getVideoInfo
	 * @desc Get Video ID and Type (YouTube/Vimeo only)
	 * @since 2.0.0
	 */

	Owl.prototype.getVideoInfo = function(videoEl,item){

        var info, type, id
        	vimeoId = videoEl.data('vimeo-id'),
        	youTubeId = videoEl.data('youtube-id'),
        	width = videoEl.data('width') || this.options.videoWidth;
       		height = videoEl.data('height') || this.options.videoHeight;
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
	    }
	    
	    // Check dimensions
	    var dimensions = width && height ? 'style="width:'+width+'px;height:'+height+'px;"' : '';

	    // wrap video content into owl-video-wrapper div
		videoEl.wrap('<div class="owl-video-wrapper"'+dimensions+'></div>');

	    this.createVideoTn(videoEl,info);
	}

	/**
	 * createVideoTn
	 * @desc Create Video Thumbnail
	 * @since 2.0.0
	 */

	Owl.prototype.createVideoTn = function(videoEl,info){

		var tnLink,icon,height;
		var customTn = videoEl.find('img');
		var srcType = 'src';
		var lazyClass = '';

		if(this.options.lazyLoad){
			srcType = 'data-src';
			lazyClass = 'owl-lazy-background'
		}

		// Custom thumbnail

		if(customTn.length){
			addThumbnail(customTn.attr('src'));
			customTn.remove();
			return false;
		}
		
		var that = this;
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

		var that = this;
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
						that.refresh();
					}
				}
			});
		}
	}

	/**
	 * stopVideo
	 * @since 2.0.0
	 */

	Owl.prototype.stopVideo = function(){
		this.fireCallback('onStopVideo');
		var item = this.dom.$items.eq(this.state.videoPlayIndex);
		item.find('.owl-video-frame').remove();
		item.removeClass('owl-video-playing');
		this.state.videoPlay = false;
	}

	/**
	 * playVideo
	 * @since 2.0.0
	 */

	Owl.prototype.playVideo = function(ev){
		this.fireCallback('onPlayVideo');

		if(this.state.videoPlay){
			this.stopVideo();
		}
		var target = $(ev.target || ev.srcElement);
		var item = target.closest('.'+this.options.itemClass);

		var videoType = item.data('owl-item').videoType;
		var id = item.data('owl-item').videoId;

		var width = item.data('owl-item').videoWidth || Math.floor(item.data('owl-item').width - this.options.margin);
		var height = item.data('owl-item').videoHeight || this.dom.$wrp.height();

		if(videoType === 'youtube'){
			var videoLink = "<iframe width=\""+ width +"\" height=\""+ height +"\" src=\"http://www.youtube.com/embed/" + id + "?autoplay=1&v=" + id + "\" frameborder=\"0\" allowfullscreen></iframe>";
		} else if(videoType === 'vimeo'){
			var videoLink = '<iframe src="http://player.vimeo.com/video/'+ id +'?autoplay=1" width="'+ width +'" height="'+ height +'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
		}
		
		item.addClass('owl-video-playing');
		this.state.videoPlay = true;
		this.state.videoPlayIndex = item.data('owl-item').indexAbs;

		var videoWrap = $('<div style="height:'+ height +'px; width:'+ width +'px" class="owl-video-frame">' + videoLink + '</div>');
		target.after(videoWrap);
	};


	/**
	 * appendLocalItems
	 * @desc Append local items into wrapper
	 * @since 2.0.0
	 */

	Owl.prototype.appendLocalItems = function(){
		// get local data information (children etc.)
		var content	= this.dom.$el.children().not(".owl-wrapper-outer");
		this.num.oItems = content.length;

		for(var i = 0; i < this.num.oItems; i++){

			// fill 'owl-item' with content 
			var item = this.fillItem(content,i);

			// append into wrp 
			this.dom.$wrp.append(item);
		}

		// remove local content references
		content = null;
	};

	/**
	 * loopClone
	 * @desc Make a clones for infinity loop
	 * @since 2.0.0
	 */

	Owl.prototype.loopClone = function(){
		if(!this.options.loop){return false;}

		var firstClone,	lastClone, i,
			num	=		this.options.items, 
			lastNum =	this.num.oItems-1;

		// if neighbour margin then add one more duplicat
		if(this.options.stagePadding && this.options.items === 1){
			num+=1;
		}
		this.num.cItems = num * 2;

		for(i = 0; i < num; i++){
			// Clone item 
			var first =		this.dom.$oItems.eq(i).clone(true,true);
			var last =		this.dom.$oItems.eq(lastNum-i).clone(true,true);
			firstClone = 	$(first[0]).addClass('cloned');
			lastClone = 	$(last[0]).addClass('cloned');

			// set clone data 
			// Somehow data has reference to same data id in cash 

			this.setData(firstClone[0],first);
			this.setData(lastClone[0],last);

			firstClone.data('owl-item').clone = true;
			lastClone.data('owl-item').clone = true;

			this.dom.$wrp.append(firstClone);
			this.dom.$wrp.prepend(lastClone);

			firstClone = lastClone = null;
		}

		this.dom.$cItems = this.dom.$wrp.children('.owl-item').filter(function(){
			return $(this).data('owl-item').clone === true;
		});
	};

	/**
	 * reClone
	 * @desc Update Cloned elements
	 * @since 2.0.0
	 */

	Owl.prototype.reClone = function(){

		// remove cloned items 
		if(this.dom.$cItems !== null){
			this.dom.$cItems.remove();
			this.dom.$cItems = null;
			this.num.cItems = 0;
		}

		if(!this.options.loop){
			return;
		}
		// generete new elements 
		this.loopClone();
	};

	/**
	 * calculate
	 * @desc Update item index data
	 * @since 2.0.0
	 */

	Owl.prototype.calculate = function(){

		var i,j,k,dist,posLeft=0,fullWidth=0;

		// element width minus neighbour 
		this.width.el = this.dom.$el.width() - (this.options.stagePadding*2);

		//to check
		this.width.stage = this.dom.$el.width();

		// calculate width minus addition margins 
		var elMinusMargin = this.width.el - (this.options.margin * (this.options.items === 1 ? 0 : this.options.items -1));

		// calculate element width and item width 
		this.width.el =  	this.width.el + this.options.margin;
		this.width.item = 	Math.floor(elMinusMargin / this.options.items) + this.options.margin;

		this.dom.$items = 	this.dom.$wrp.find('.owl-item');
		this.num.items = 	this.dom.$items.length;

		//change to autoWidths
		if(this.options.autoWidth){
			this.dom.$items.css('width','');
		}

		// Set grid array 
		this.pos.items = 	[];
		this.num.merged = 	[];
		this.num.nav = 		[];

		// item distances
		dist = this.options.center ? (this.width.el)/2 : 0;
		
		this.width.mergeWrp = 0;

		// Calculate items positions
		for(i = 0; i<this.num.items; i++){

			// check merged items

			if(this.options.merge){
				var mergeNumber = this.dom.$items.eq(i).find('[data-merge]').attr('data-merge') || 1;
				if(this.options.mergeFit && mergeNumber > this.options.items){
					mergeNumber = this.options.items;
				}
				this.num.merged.push(parseInt(mergeNumber));
				this.width.mergeWrp += this.width.item * this.num.merged[i];
			} else {
				this.num.merged.push(1)
			}

			// Array based on merged items used by pagination and navigation
			if(this.options.loop){
				if(i>=this.num.cItems/2 && i<this.num.cItems/2+this.num.oItems){
					this.num.nav.push(this.num.merged[i]);
				}
			} else {
				this.num.nav.push(this.num.merged[i]);
			}

			var iWidth = this.width.item * this.num.merged[i];

			// autoWidth item size
			if(this.options.autoWidth){
				iWidth = this.dom.$items.eq(i).width() + this.options.margin;
				this.dom.$items[i].style.marginRight = this.options.margin + 'px';
			}

			// push item position into array

			this.pos.items.push(dist);

			// update item data

			this.dom.$items.eq(i).data('owl-item').posLeft = posLeft;
			this.dom.$items.eq(i).data('owl-item').width = iWidth;

			// dist starts from middle of stage if center
			// posLeft always starts from 0

			dist -= iWidth;
			posLeft -= iWidth;
			fullWidth -= Math.abs(iWidth);

			// update position if center
			if(this.options.center){
				this.pos.items[i] -= (iWidth/2 );
			}
		}

		if(this.options.autoWidth){
			this.width.wrp = this.options.center ? Math.abs(fullWidth) : Math.abs(dist);
		} else {
			this.width.wrp = Math.abs(fullWidth);
		}

		// update indexAbs on all items 
		for(j = 0; j< this.num.oItems + this.num.cItems; j++){
			this.dom.$items.eq(j).data('owl-item').indexAbs = j;
		}

		// Set Min and Max
		this.setMinMax()

		// Recalculate grid 
		this.setSizes();

	};

	/**
	 * setMinMax
	 * @since 2.0.0
	 */

	Owl.prototype.setMinMax = function(){

		// set Min
		var minimum = this.dom.$oItems.eq(0).data('owl-item').indexAbs;
		this.pos.min = 0;
		this.pos.minValue = this.pos.items[minimum];

		// set max position
		if(!this.options.loop){
			this.pos.max = this.num.oItems-1;
		}

		if(this.options.loop){
			this.pos.max = this.num.oItems+this.options.items;
		}

		if(!this.options.loop && !this.options.center){
			this.pos.max = this.num.oItems-this.options.items;
		}

		if(this.options.loop && this.options.center){
			this.pos.max = this.num.oItems+this.options.items;
		}

		//set max value
		this.pos.maxValue = this.pos.items[this.pos.max];

		//Max for autoWidth content 
		if((!this.options.loop && !this.options.center && this.options.autoWidth) || (this.options.merge && !this.options.center) ){
			for (i = 0; i < this.pos.items.length; i++) {
				if( (this.pos.items[i] * -1) < this.width.wrp-this.width.el ){
					this.pos.max = i+1;
				}
			}
			this.pos.maxValue = -(this.width.wrp-this.width.el);
			this.pos.items[this.pos.max] = this.pos.maxValue
		}

		// Set loop boundries
		if(this.options.center){
			this.pos.loop = this.pos.items[0]-this.pos.items[this.num.oItems];
		} else {
			this.pos.loop = -this.pos.items[this.num.oItems]
		}

		//if is less items
		if(this.num.oItems < this.options.items){
			this.pos.max = 0;
		}
	}


	/**
	 * setSizes
	 * @desc Set sizes on elements (from collectData function)
	 * @since 2.0.0
	 */

	Owl.prototype.setSizes = function(){

		// show neighbours 
		if(this.options.stagePadding !== false){
			this.dom.oWrp.style.paddingLeft = 	this.options.stagePadding + 'px';
			this.dom.oWrp.style.paddingRight = 	this.options.stagePadding + 'px';
		}


		if(this.width.wrpPrev > this.width.wrp){
			window.setTimeout(function(){
				this.dom.wrp.style.width = this.width.wrp + 'px';
			}.bind(this),0);
		} else{
			this.dom.wrp.style.width = this.width.wrp + 'px';
		}

		for(var i=0; i<this.num.items; i++){

			// Set items width
			if(!this.options.autoWidth){
				this.dom.$items[i].style.width = this.width.item - (this.options.margin) + 'px';
			}
			// add margin
			this.dom.$items[i].style.marginRight = this.options.margin + 'px';

			if(this.num.merged[i] !== 1 && !this.options.autoWidth){
				this.dom.$items[i].style.width = (this.width.item * this.num.merged[i]) - (this.options.margin) + 'px';
			}

		}

		// save prev wrapper size 
		this.width.wrpPrev = this.width.wrp;
	};

	/**
	 * responsive
	 * @desc Responsive function update all data by calling refresh() 
	 * @since 2.0.0
	 */

	Owl.prototype.responsive = function(){

		// If El width hasnt change then stop responsive 
		var elChanged = this.isElWidthChanged();
		if(!elChanged){return false;}

		// if Vimeo Fullscreen mode
		var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
		if(fullscreenElement){
			if($(fullscreenElement.parentNode).hasClass('owl-video-frame')){
				this.setSpeed(0);
				this.state.isFullScreen = true;
			}
		}

		if(fullscreenElement && this.state.isFullScreen && this.state.videoPlay){
			return false;
		}

		// Comming back from fullscreen
		if(this.state.isFullScreen){
			this.state.isFullScreen = false;
			return false;
		}

		// check full screen mode and window orientation
		if (this.state.videoPlay) {
			if(this.state.orientation !== window.orientation){
				this.state.orientation = window.orientation;
				return false;
			}
		}

		if(this.state.videoPlay){
			this.stopVideo();
		}

		this.fireCallback('onBeforeResponsive');
		this.state.responsive = true;
		this.refresh();
		this.state.responsive = false;
		this.fireCallback('onAfterResponsive');
	};

	/**
	 * refresh
	 * @desc Refresh method is basically collection of functions that are responsible for Owl responsive functionality
	 * @since 2.0.0
	 */

	Owl.prototype.refresh = function(){
		this.watchVisibility();

		// Update Options for given width
		this.setResponsiveOptions();

		// udpate options
		this.optionsLogic();

		// update info about local content
		this.updateLocalContent();

		//Check for videos ( YouTube and Vimeo currently supported)
		this.checkVideoLinks();

		// if no items then stop 
		if(this.num.oItems === 0){return false;}

		// Hide and Show methods helps here to set a proper widths.
		// This prevents Scrollbar to be calculated in wrapper width
		this.dom.$wrp.addClass('owl-refresh');
		
		// Remove clones and generate new ones
		this.reClone();

		// calculate 
		this.calculate();

		//aaaand show.
		this.dom.$wrp.removeClass('owl-refresh');
		// update internal position information
		//this.updatePosition(this.pos.current);

		this.updateItemState();

		// jump to last position 		
		this.jumpTo(this.pos.current,false); // fix that 

		// Update controls
		this.rebuildDots();

		this.updateControls();

		// update drag events
		this.updateEvents();

		// update autoplay
		this.autoplay();

		this.autoHeight();

		this.state.orientation = window.orientation;
	};

	/**
	 * updateItemState
	 * @desc Update information about current state of items (visibile, hidden, active, etc.)
	 * @since 2.0.0
	 */

	Owl.prototype.updateItemState = function(){
		var i,j,item,ipos,iwidth,wpos,stage;

		// clear states
		for(i = 0; i<this.num.items; i++){
			this.dom.$items.eq(i).data('owl-item').active = false;
			this.dom.$items.eq(i).data('owl-item').current = false;
			this.dom.$items.eq(i).removeClass(this.options.activeClass).removeClass(this.options.centerClass);
			if(this.options.mobileBoost){
				this.dom.$items.eq(i).removeClass('active');
			}
		}

		this.num.active = 0;

		for(j = 0; j<this.pos.items.length-1; j++){

				item = this.dom.$items.eq(j);
				ipos = item.data('owl-item').posLeft;


				iwidth = item.data('owl-item').width-2;
				wpos = this.pos.wrp;
				stage = -this.width.stage;

			if((ipos <= wpos && ipos > wpos + stage) || (ipos - iwidth < wpos && ipos - iwidth > wpos + stage)){
				this.num.active++;

				item.data('owl-item').active = true;
				item.data('owl-item').current = true;
				item.addClass(this.options.activeClass);

				if(!this.options.lazyLoad){
					item.data('owl-item').loaded = true;
				}

				if(this.options.loop && (this.options.lazyLoad || this.options.center)){
					this.updateClonedItemsState(item.data('owl-item').index);
				}
			}
		}

		if(this.options.center){
			this.dom.$items.eq(this.pos.currentAbs)
			.addClass(this.options.centerClass)
			.data('owl-item').center = true;
		}

		if(this.options.lazyLoad){
			this.lazyLoad();
		}

	};

	/**
	 * updateClonedItemsState
	 * @desc Set current state on sibilings items for lazyLoad and center
	 * @since 2.0.0
	 */

	Owl.prototype.updateClonedItemsState = function(activeIndex){

		//find cloned center
		if(this.options.center){
			var center = this.dom.$items.eq(this.pos.currentAbs).data('owl-item').index;
		}

		for(var i = 0; i<this.num.items; i++){
			var $el = this.dom.$items.eq(i);
			if( $el.data('owl-item').index === activeIndex ){
				$el.data('owl-item').current = true;

				if(this.options.mobileBoost){
					$el.addClass(this.options.activeClass);
				}
				if($el.data('owl-item').index === center ){
					$el.addClass(this.options.centerClass);
				}
			}
		}
	}

	/**
	 * eventsCall
	 * @desc Save internal event references and add event based functions like transitionEnd,responsive etc.
	 * @since 2.0.0
	 */

	Owl.prototype.eventsCall = function(){
		// Save events references 
		this.e._onDragStart =	function(e){this.onDragStart(e);		}.bind(this);
		this.e._onDragMove =	function(e){this.onDragMove(e);			}.bind(this);
		this.e._onDragEnd =		function(e){this.onDragEnd(e);			}.bind(this);
		this.e._transitionEnd =	function(e){this.transitionEnd(e);		}.bind(this);
		this.e._resizer =		function(){this.responsiveTimer();		}.bind(this);
		this.e._responsiveCall =function(){this.responsive();			}.bind(this);
		this.e._preventClick =	function(e){this.preventClick(e);		}.bind(this);
		this.e._goToHash =		function(){this.goToHash();				}.bind(this);
		this.e._goToPage =		function(e){this.goToPage(e);			}.bind(this);
		this.e._ap = 			function(){this.autoplay();					}.bind(this);
		this.e._play = 			function(){this.play();					}.bind(this);
		this.e._pause = 		function(){this.pause();					}.bind(this);
		this.e._playVideo = 	function(e){this.playVideo(e);			}.bind(this);
	};

	/**
	 * responsiveTimer
	 * @desc Check Window resize event with 200ms delay / this.options.responsiveRefreshRate
	 * @since 2.0.0
	 */

	Owl.prototype.responsiveTimer = function(){
		if(this.windowWidth() === this.width.prevWindow){
			return false;
		}
		window.clearInterval(this.e._autoplay);
		window.clearTimeout(this.resizeTimer);
		this.resizeTimer = window.setTimeout(this.e._responsiveCall, this.options.responsiveRefreshRate);
		this.width.prevWindow = this.windowWidth();
	};

	/**
	 * internalEvents
	 * @desc Checks for touch/mouse drag options and add necessery event handlers.
	 * @since 2.0.0
	 */

	Owl.prototype.internalEvents = function(){
		var isTouch = isTouchSupport();
		var isTouchIE = isTouchSupportIE();

		if(isTouch && !isTouchIE){
			this.dragType = ["touchstart","touchmove","touchend","touchcancel"];
		} else if(isTouchIE){
			this.dragType = ["MSPointerDown","MSPointerMove","MSPointerUp","MSPointerCancel"];
		} else {
			this.dragType = ["mousedown","mousemove","mouseup"];
		}

		if( (isTouch || isTouchIE) && this.options.touchDrag){
			//touch cancel event 
			this.on(document, this.dragType[3], this.e._onDragEnd);

		} else {
			// firefox startdrag fix - addeventlistener doesnt work here :/
			this.dom.$wrp.on("dragstart", function() {return false;});

			//disable text select
			this.dom.wrp.onselectstart = function(){return false;};
		}

		// Video Play Button event delegation
		this.dom.$wrp.on('click', '.owl-video-play-icon',this.e._playVideo);

		if(this.options.URLhashListener){
			this.on(window, 'hashchange', this.e._goToHash, false);
		}

		if(this.options.autoplayHoverPause){
			var that = this;
			this.dom.$wrp.on("mouseover", this.e._pause )
			this.dom.$wrp.on("mouseleave", this.e._ap )
		}
		
		if(this.options.navigation){
			this.e.next =	function(e){this.next();}.bind(this);
			this.e.prev =	function(e){this.prev();}.bind(this);
		}

		// Catch transitionEnd event
		this.transitionType = isTransitionEnd();
		if(this.transitionType){
			this.on(this.dom.wrp, this.transitionType, this.e._transitionEnd, false);
		}
		
		// Responsive
		if(this.options.responsive !== false){
			this.on(window, 'resize', this.e._resizer, false);
		}

		this.updateEvents();
	};

	/**
	 * updateEvents
	 * @since 2.0.0
	 */

	Owl.prototype.updateEvents = function(){

		if(this.options.touchDrag && (this.dragType[0] === "touchstart" || this.dragType[0] === "MSPointerDown")){
			this.on(this.dom.wrp, this.dragType[0], this.e._onDragStart,false);

		} else if(this.options.mouseDrag && this.dragType[0] === "mousedown"){
			this.on(this.dom.wrp, this.dragType[0], this.e._onDragStart,false);

		} else {
			this.off(this.dom.wrp, this.dragType[0], this.e._onDragStart);
		}
	}

	/**
	 * onDragStart
	 * @desc touchstart/mousedown event
	 * @since 2.0.0
	 */

	Owl.prototype.onDragStart = function(event){
		var ev = event.originalEvent || event || window.event;
		// prevent right click
		if (ev.which === 3) { 
			return false;
		}

		if(this.dragType[0] === 'mousedown'){
			this.dom.$wrp.addClass('owl-grab');
		}

		this.fireCallback("onStartTouch");
		this.drag.startTime = new Date().getTime();
		this.setSpeed(0);
		this.state.isTouch = true;
		this.state.isScrolling = false;
		this.state.isSwiping = false;
		this.drag.distance = 0;

		// if is 'touchstart'
		var isTouchEvent = ev.type === 'touchstart';
		var pageX = isTouchEvent ? event.targetTouches[0].pageX : (ev.pageX || ev.clientX);
		var pageY = isTouchEvent ? event.targetTouches[0].pageY : (ev.pageY || ev.clientY);

		//get wrp position left
		this.drag.offsetX = this.dom.$wrp.position().left - this.options.stagePadding;
		this.drag.offsetY = this.dom.$wrp.position().top;

		//catch position // ie to fix
		if(this.state.inMotion && this.support3d ){
			var animatedPos = this.getTransformProperty();
			this.drag.offsetX = animatedPos;
			this.wrpMoveTo(animatedPos);
		}
		
		this.drag.startX = pageX - this.drag.offsetX;
		this.drag.startY = pageY - this.drag.offsetY;

		this.drag.start = pageX - this.drag.startX;
		this.drag.targetEl = ev.target || ev.srcElement;
		this.drag.updatedX = this.drag.start;

		//prevent links and images dragging;
		this.drag.targetEl.draggable = false;

		this.on(document, this.dragType[1], this.e._onDragMove, false);
		this.on(document, this.dragType[2], this.e._onDragEnd, false);
	};

	/**
	 * onDragMove
	 * @desc touchmove/mousemove event
	 * @since 2.0.0
	 */

	Owl.prototype.onDragMove = function(event){
		if (!this.state.isTouch){
			return;
		}

		if (this.state.isScrolling){
			return;
		}

		var neighbourItemWidth=0;
		var ev = event.originalEvent || event || window.event;

		// if is 'touchstart'
		var isTouchEvent = ev.type == 'touchmove';
		var pageX = isTouchEvent ? ev.targetTouches[0].pageX : (ev.pageX || ev.clientX);
		var pageY = isTouchEvent ? ev.targetTouches[0].pageY : (ev.pageY || ev.clientY);

		// Drag Direction 
		this.drag.currentX = pageX - this.drag.startX;
		this.drag.currentY = pageY - this.drag.startY;
		this.drag.distance = this.drag.currentX - this.drag.offsetX;

		// Check move direction 
		if (this.drag.distance < 0) {
			this.state.direction = "left";
		} else if(this.drag.distance > 0){
			this.state.direction = "right";
		}

		// Loop
		if(this.options.loop){

			if(this.drag.currentX > this.pos.minValue && this.state.direction === "right" ){
				this.drag.currentX -= this.pos.loop;
			}else if(this.drag.currentX < this.pos.maxValue && this.state.direction === "left" ){//-this.width.wrp - neighbourItemWidth + (2*this.width.el)
				this.drag.currentX += this.pos.loop;
			}
			
		} else {
			// Strain 
			this.drag.currentX = Math.max(Math.min(this.drag.currentX, this.pos.minValue + this.drag.distance / 5), this.pos.maxValue + this.drag.distance / 5);
		}

		// Lock browser if swiping horizontal

		if ((this.drag.distance > 8 || this.drag.distance < -8)) {
			if (ev.preventDefault !== undefined) {
				ev.preventDefault();
			} else {
				ev.returnValue = false;
			}
			this.state.isSwiping = true;
		}

		this.drag.updatedX = this.drag.currentX;

		// Lock Owl if scrolling 

		if ((this.drag.currentY > 16 || this.drag.currentY < -16) && this.state.isSwiping === false) {
			 this.state.isScrolling = true;
			 this.drag.updatedX = this.drag.start;
		}
		
		this.wrpMoveTo(this.drag.updatedX);
	};

	/**
	 * onDragEnd 
	 * @desc touchend/mouseup event
	 * @since 2.0.0
	 */

	Owl.prototype.onDragEnd = function(event){
		if (!this.state.isTouch){
			return;
		}
		if(this.dragType[0] === 'mousedown'){
			this.dom.$wrp.removeClass('owl-grab');
		}

		//prevent links and images dragging;
		this.drag.targetEl.draggable = true;

		//remove drag event listeners

		this.state.isTouch = false;
		this.state.isScrolling = false;
		this.state.isSwiping = false;

		if(this.drag.distance === 0 && this.state.inMotion !== true){
			this.state.inMotion = false;
			return false;
		}

		// prevent clicks while scrolling

		this.drag.endTime = new Date().getTime();
		var compareTimes = this.drag.endTime - this.drag.startTime;
		var distanceAbs = Math.abs(this.drag.distance);

		//to test
		if(distanceAbs > 3 || compareTimes > 300){
			this.removeClick(this.drag.targetEl);
		}

		var closest = this.closest(this.drag.updatedX);

		this.setSpeed(this.options.dragEndSpeed, false, true);

		this.wrpMoveTo(this.pos.items[closest]);
		this.drag.distance = 0;

		this.off(document, this.dragType[1], this.e._onDragMove);
		this.off(document, this.dragType[2], this.e._onDragEnd);
	};

	/**
	 * removeClick
	 * @desc Attach preventClick function to disable link while swipping
	 * @since 2.0.0
	 * @param [target] - clicked dom element
	 */

	Owl.prototype.removeClick = function(target){
		this.drag.targetEl = target;
		this.on(target,'click', this.e._preventClick, false);
	};

	/**
	 * preventClick
	 * @desc Add preventDefault for any link and then remove removeClick event hanlder
	 * @since 2.0.0
	 */

	Owl.prototype.preventClick = function(ev){
		if(ev.preventDefault) {
			ev.preventDefault();
		}else {
			ev.returnValue = false;
		}
		if(ev.stopPropagation){
			ev.stopPropagation();
		}
		this.off(this.drag.targetEl,'click',this.e._preventClick,false);
	};

	/**
	 * getTransformProperty
	 * @desc catch wrapper position while animate (only css3)
	 * @since 2.0.0
	 */

	Owl.prototype.getTransformProperty = function(){
		var transform = window.getComputedStyle(this.dom.wrp, null).getPropertyValue(this.vendorName + 'transform');
		//var transform = this.dom.$wrp.css(this.vendorName + 'transform')
		transform = transform.replace(/matrix(3d)?\(|\)/g, '').split(',');
		var matrix3d = transform.length === 16;

		return matrix3d !== true ? transform[4] : transform[12];
	};

	/**
	 * closest
	 * @desc Get closest item after touchend/mouseup
	 * @since 2.0.0
	 * @param [x] - curent position in pixels
	 * return position in pixels
	 */

	Owl.prototype.closest = function(x){
		var newX = 0,
			pull = 30;

		// Check closest item
		for(var i = 0; i< this.num.items; i++){
			if(x > this.pos.items[i]-pull && x < this.pos.items[i]+pull){
				newX = i;
			} else if(x < this.pos.items[i] && x > this.pos.items[i+1 || this.pos.items[i] - this.width.el]){
				newX = this.state.direction === "left" ? i+1 : i;
			}
		}
		//non loop boundries
		if(!this.options.loop){
			if(x > this.pos.minValue ){
				newX = this.pos.min;
			} else if(x < this.pos.maxValue){
				newX = this.pos.max;
			}
		}

		// set positions
		this.pos.currentAbs = newX;
		this.pos.current = this.dom.$items.eq(newX).data('owl-item').index;


		return newX;
	};

	/**
	 * wrpMoveTo
	 * @desc animate wrapper position (both css3/css2)
	 * @since 2.0.0
	 * @param [x] - curent position in pixels
	 */

	Owl.prototype.wrpMoveTo = function(pos){

		// if speed is 0 the set inMotion to false
		if(this.speed.current !== 0){
			this.fireCallback('onAnimationStart');
			this.state.inMotion = true;
		}

		var posX = this.pos.wrp = pos,
			style = this.dom.wrp.style;

		if(this.support3d){
			translate = 'translate3d(' + posX + 'px'+',0px, 0px)';
			style[this.transformProperty] = translate;
		} else if(this.state.isTouch){
			style.left = posX+'px';
		} else {
			this.dom.$wrp.animate({left: posX},this.speed.css2speed, this.options.fallbackEasing, function(){
				this.transitionEnd();
			}.bind(this));
		}

		this.onChange();
	};

	/**
	 * updatePosition
	 * @desc Update current positions
	 * @since 2.0.0
	 * @param [pos] - number - new position
	 */

	Owl.prototype.updatePosition = function(pos){
		
		// if no items then stop 
		if(this.num.oItems === 0){return false;}
		if(pos === undefined){return false;}

		//pos - new current position
		var nextPos = pos;
		this.pos.prev = this.pos.currentAbs;

		if(this.state.revert){
			this.pos.current = this.dom.$items.eq(nextPos).data('owl-item').index;
			this.pos.currentAbs = nextPos;
			return;
		}

		if(!this.options.loop){
			nextPos = nextPos > this.pos.max ? this.pos.max : (nextPos <= 0 ? 0 : nextPos);
		}
		

		this.pos.current = this.dom.$oItems.eq(nextPos).data('owl-item').index;
		this.pos.currentAbs = this.dom.$oItems.eq(nextPos).data('owl-item').indexAbs;
	};

	/**
	 * setSpeed
	 * @since 2.0.0
	 * @param [speed] - number
	 * @param [pos] - number - next position - use this param to calculate smartSpeed
	 * @param [drag] - boolean - if drag is true then smart speed is disabled
	 * return speed
	 */

	Owl.prototype.setSpeed = function(speed,pos,drag) {
		var s = speed,
			nextPos = pos;

		if(s === false && s !== 0 && drag !== true){

			//Double check this
			// var nextPx = this.pos.items[nextPos];
			// var currPx = this.pos.wrp 
			// var diff = Math.abs(nextPx-currPx);
			// var s = diff/1
			// if(s>1000){
			// 	s = 1000;
			// }
			
			var diff = Math.abs(nextPos - this.pos.prev);
			diff = diff === 0 ? 1 : diff;
			if(diff>6){diff = 6}
			s = diff * this.options.smartSpeed;
		}

		if(s === false && drag === true){
			s = this.options.smartSpeed;
		}

		if(s === 0){s=0;};

		if(this.support3d){
			var style = this.dom.wrp.style;
			style.webkitTransitionDuration = style.MsTransitionDuration = style.msTransitionDuration = style.MozTransitionDuration = style.OTransitionDuration = style.transitionDuration = (s / 1000) + 's';
		} else{
			this.speed.css2speed = s;
		}
		this.speed.current = s;
		return s;
	};

	/**
	 * jumpTo
	 * @since 2.0.0
	 * @param [pos] - number - next position - use this param to calculate smartSpeed
	 * @param [update] - boolean - if drag is true then smart speed is disabled
	 */

	Owl.prototype.jumpTo = function(pos,update){

		this.updatePosition(pos);
		this.setSpeed(0);
		this.wrpMoveTo(this.pos.items[this.pos.currentAbs]);
		if(update !== true){
			this.updateItemState();
		}
	};

	/**
	 * goTo
	 * @since 2.0.0
	 * @param [pos] - number
	 * @param [speed] - speed in ms
	 * @param [speed] - speed in ms
	 * @param [naviLoop] - boolean - if loop is enabled then calculate position by all items including cloned - used by navigation
	 */

	Owl.prototype.goTo = function(pos,speed,naviloop){
		this.updatePosition(pos,naviloop);
		this.setSpeed(speed,this.pos.currentAbs);
		this.wrpMoveTo(this.pos.items[this.pos.currentAbs]);
	};

	/**
	 * next
	 * @since 2.0.0
	 */

	Owl.prototype.next = function(optionalSpeed){
		if(this.options.loop){
			this.goToLoop(this.options.slideBy, optionalSpeed || this.options.naviSpeed);
		}else{
			this.goTo(this.pos.current + this.options.slideBy, optionalSpeed || this.options.naviSpeed);
		}
	};

	/**
	 * prev
	 * @since 2.0.0
	 */

	Owl.prototype.prev = function(optionalSpeed){
		if(this.options.loop){
			this.goToLoop(-this.options.slideBy, optionalSpeed || this.options.naviSpeed);
		}else{
			this.goTo(this.pos.current-this.options.slideBy, optionalSpeed || this.options.naviSpeed);
		}
	};

	/**
	 * goToLoop
	 * @desc Go to given position if loop is enabled - used only internal
	 * @since 2.0.0
	 * @param [distance] - number -how far to go
	 * @param [speed] - number - speed in ms
	 */

	Owl.prototype.goToLoop = function(distance,speed){

		var revert = this.pos.currentAbs,
			prevPositon = this.pos.currentAbs,
			newPosition = this.pos.currentAbs + distance,
			direction = prevPositon - newPosition < 0 ? true : false;

		this.state.revert = true

		if(newPosition < 1 && direction === false){
			this.state.jumpToLoop = true;
			revert = this.num.items - (this.options.items-prevPositon) - this.options.items;
			this.jumpTo(revert,true);
		} else if(newPosition >= this.num.items - this.options.items && direction === true ){
			this.state.jumpToLoop = true;
			revert = prevPositon - this.num.oItems;
			this.jumpTo(revert,true);
		}

		window.clearTimeout(this.e._goToLoop);
		this.e._goToLoop = window.setTimeout(function(){
			this.state.jumpToLoop = false;
			this.goTo(revert + distance,this.options.naviSpeed);
			this.state.revert = false
		}.bind(this), 30);
	};

	/**
	 * initPosition
	 * @since 2.0.0
	 */

	Owl.prototype.initPosition = function(){
		var pos = this.options.startPosition;

		if(this.options.startPosition === 'URLHash'){
			pos = this.hashPosition();
		} else if(typeof this.options.startPosition !== Number && !this.options.center){
			this.options.startPosition = 0;
		}

		this.dom.oWrp.scrollLeft = 0;
		this.goTo(pos,0);
	};

	/**
	 * goToHash
	 * @since 2.0.0
	 */

	Owl.prototype.goToHash = function(){
		var pos = this.hashPosition();
		if(pos === false){
			pos = 0;
		}
		this.dom.oWrp.scrollLeft = 0;
		this.goTo(pos,this.options.naviSpeed);
	};

	/**
	 * hashPosition
	 * @desc Find hash in URL then look into items to find contained ID
	 * @since 2.0.0
	 * return hashPos - number of item
	 */

	Owl.prototype.hashPosition = function(){
		var hash = window.location.hash.substring(1);
		if(hash === ""){return false;}

		for(var i=0;i<this.num.oItems; i++){
			if(hash === this.dom.$oItems.eq(i).data('owl-item').hash){
				var hashPos = i;
			}
		}
		return hashPos;
	};

	// Owl.prototype.updateHash = function(){
	// 	var hashItem = this.dom.$oItems.eq(this.pos.current).data('owl-item').hash;
	// 	if(hashItem){
	// 		this.state.updateHash = true;
	// 		window.location.hash = hashItem;
	// 	}
	// };


	/**
	 * Autoplay
	 * @since 2.0.0
	 */

	Owl.prototype.autoplay = function(){
		if(this.options.autoplay && !this.state.videoPlay){
			window.clearInterval(this.e._autoplay);
			this.e._autoplay = window.setInterval(this.e._play, this.options.autoplayTimeout);
		} else {
			window.clearInterval(this.e._autoplay);
			this.state.autoplay=false;
		}
	};

	/**
	 * play
	 * @param [timeout] - Integrer
	 * @param [speed] - Integrer
	 * @since 2.0.0
	 */

	Owl.prototype.play = function(timeout, speed){

		// if tab is inactive - doesnt work in <IE10
		if(isPageHidden() === true){return false;}

		// overwrite default options (custom options are always priority)
		if(!this.options.autoplay){
			this._options.autoplay = this.options.autoplay = true;
			this._options.autoplayTimeout = this.options.autoplayTimeout = timeout || this.options.autoplayTimeout || 4000;
			this._options.autoplaySpeed = speed || this.options.autoplaySpeed;
		}

		if(this.options.autoplay === false || this.state.isTouch || this.state.isScrolling || this.state.isSwiping || this.state.inMotion){
			window.clearInterval(this.e._autoplay);
			return false;
		}

		if(!this.options.loop && this.pos.current >= this.pos.max){
			window.clearInterval(this.e._autoplay);
			this.goTo(0);
		} else {
			this.next(this.options.autoplaySpeed);
		}
		this.state.autoplay=true;
	};

	/**
	 * stop
	 * @since 2.0.0
	 */

	Owl.prototype.stop = function(){
		this._options.autoplay = this.options.autoplay = false;
		this.state.autoplay = false;
		window.clearInterval(this.e._autoplay);
	};

	Owl.prototype.pause = function(){
		window.clearInterval(this.e._autoplay);
	};

	/**
	 * transitionEnd
	 * @desc event used by css3 animation end and $.animate callback like transitionEnd,responsive etc.
	 * @since 2.0.0
	 */

	Owl.prototype.transitionEnd = function(event){
		// if css2 animation then event object is undefined 
		if(event !== undefined){
			event.stopPropagation();

			// Catch only owl-wrapper transitionEnd event
			var eventTarget = event.target || event.srcElement || event.originalTarget;
			if(eventTarget !== this.dom.wrp){ // may try eventTarget.className !== 'owl-wrapper'
				return false;
			}
		}

		this.state.inMotion = false;
		this.updateItemState();
		
		this.autoplay();
			
		this.fireCallback('onAnimationEnd');
	};

	/**
	 * isElWidthChanged
	 * @desc Check if element width has changed
	 * @since 2.0.0
	 */

	Owl.prototype.isElWidthChanged = function(){
		var newElWidth = 	this.dom.$el.width() - this.options.stagePadding,//to check
			prevElWidth = 	this.width.el + this.options.margin;
		return newElWidth !== prevElWidth;
	};

	/**
	 * windowWidth
	 * @desc Get Window/responsiveBaseElement width
	 * @since 2.0.0
	 */

	Owl.prototype.windowWidth = function() {
		if(this.options.responsiveBaseElement !== window){
			this.width.window =  $(this.options.responsiveBaseElement).width();
		} else if (window.innerWidth){
			this.width.window = window.innerWidth;
		} else if (document.documentElement && document.documentElement.clientWidth){
			this.width.window = document.documentElement.clientWidth;
		}
		return this.width.window;
	};

	/**
	 * Controls
	 * @desc Calls controls container, navigation and pagination creator
	 * @since 2.0.0
	 */

	Owl.prototype.controls = function(){
		var cc = document.createElement('div');
		cc.className = this.options.controlsClass;
		this.dom.$el.append(cc);
		this.dom.$cc = $(cc);
	};

	/**
	 * updateControls 
	 * @since 2.0.0
	 */

	Owl.prototype.updateControls = function(){
	
		if(this.dom.$cc === null && (this.options.navigation || this.options.pagination)){
			this.controls();
		}

		if(this.dom.$nav === null && this.options.navigation){
			this.createNavigation(this.dom.$cc[0]);
		}
		
		if(this.dom.$page === null && this.options.pagination){
			this.createPagination(this.dom.$cc[0]);
		}

		if(this.dom.$nav !== null){
			if(this.options.navigation){
				this.dom.$nav.show();
				this.updateNavigation();
			} else {
				this.dom.$nav.hide();
			}
		}

		if(this.dom.$page !== null){
			if(this.options.pagination){
				this.dom.$page.show();
				this.updatePagination();
			} else {
				this.dom.$page.hide();
			}
		}
	}

	/**
	 * createNavigation
	 * @since 2.0.0
	 * @param [cc] - dom element - Controls Container
	 */

	Owl.prototype.createNavigation = function(cc){

		// Create nav container
		var nav = document.createElement('div');
		nav.className = this.options.navContainerClass;
		cc.appendChild(nav);

		// Create left and right buttons
		var navPrev = document.createElement('div'),
			navNext = document.createElement('div');

		navPrev.className = this.options.navClass[0];
		navNext.className = this.options.navClass[1];

		nav.appendChild(navPrev);
		nav.appendChild(navNext);

		this.dom.$nav = $(nav);
		this.dom.$navPrev = $(navPrev).html(this.options.navText[0]);
		this.dom.$navNext = $(navNext).html(this.options.navText[1]);

		// add events to do
		this.on(navPrev, this.dragType[2], this.e.prev, false);
		this.on(navNext, this.dragType[2], this.e.next, false);
	};

	/**
	 * createNavigation
	 * @since 2.0.0
	 * @param [cc] - dom element - Controls Container
	 */

	Owl.prototype.createPagination = function(cc){

		// Create pagination container
		var page = document.createElement('div');
		page.className = this.options.pagiClass;
		cc.appendChild(page);

		// save reference
		this.dom.$page = $(page);

		// add events
		this.on(this.dom.$page[0], this.dragType[2], this.e._goToPage, false);

		// build dots
		this.rebuildDots();
	};

	/**
	 * goToPage
	 * @desc Event used by pagination dots
	 * @since 2.0.0
	 */

	Owl.prototype.goToPage = function(event){
		var target = event ? event.target : window.event.srcElement;

		// if you click on span then take parant as target
		if ( target.nodeName.toLowerCase() === 'span' ){
			target = target.parentNode
		}
		// if is loop then add option items to page number (problem with duplicated elements here)
		var page = $(target).data('page')//this.options.loop ? $(target).data('page') + this.options.items : $(target).data('page');
		this.goTo(page,this.options.paginationSpeed);
		return false;
	};

	/**
	 * rebuildDots
	 * @desc Event used by pagination dots
	 * @since 2.0.0
	 */

	Owl.prototype.rebuildDots = function(){
		if(this.dom.$page === null){return false;}
		var each, dot, span, counter = 0, last = 0, i, page=0, roundPages = 0, dotName;

		each = this.options.paginationEach || this.options.items;

		// display full dots if center
		if(this.options.center){
			each = 1;
		}

		// clear pagination
		this.dom.$page.html('');

		for(i = 0; i < this.num.nav.length; i++){

			if(counter >= each || counter === 0){

				dot = document.createElement('div');
				dot.className = this.options.pagiDotClass;
				span = document.createElement('span');
				dot.appendChild(span);
				$(dot).data('page',page);
				$(dot).data('goToPage',roundPages);
				this.dom.$page.append(dot);

				counter = 0;
				roundPages++;
			}
			this.dom.$oItems.eq(i).data('owl-item').page = roundPages-1;

			//add merged items
			counter += this.num.nav[i];
			page++;
		}
		// find rest of pagination
		if(!this.options.loop && !this.options.center){
			for(var j = this.num.nav.length-1; j >= 0; j--){
				last += this.num.nav[j];
				this.dom.$oItems.eq(j).data('owl-item').page = roundPages-1;
				if(last >= each){
					break;
				}
			}
		}
		this.num.allPages = roundPages-1;
	};

	/**
	 * updatePagination
	 * @since 2.0.0
	 */

	Owl.prototype.updatePagination = function(){

		var dots = this.dom.$page.children();
		var itemIndex = this.dom.$oItems.eq(this.pos.current).data('owl-item').page;
		
		for(var i = 0; i < dots.length; i++){
			var dotData = dots.eq(i).data('goToPage');

			if(dotData===itemIndex){
				this.pos.currentPage = i;
				dots.eq(i).addClass('active');
			}else{
				dots.eq(i).removeClass('active');
			}
		}
	}

	/**
	 * updateNavigation
	 * @since 2.0.0
	 */

	Owl.prototype.updateNavigation = function(){

		var isNav = this.options.navigation;

		this.dom.$navNext.toggleClass('disabled',!isNav);
		this.dom.$navPrev.toggleClass('disabled',!isNav);

		if(!this.options.loop && isNav){
			if(this.pos.current <= 0){
				this.dom.$navNext.removeClass('disabled');
				this.dom.$navPrev.addClass('disabled');
			} else if(this.pos.current >= this.pos.max){
				this.dom.$navNext.addClass('disabled');
				this.dom.$navPrev.removeClass('disabled');
			}
		}
	}



	/**
	 * addItem - Add an item
	 * @since 2.0.0
	 * @param [content] - dom element / string '<div>content</div>'
	 * @param [pos] - number - position
	 */

	Owl.prototype.addItem = function(content,pos){
		// wrap content
		var item = this.fillItem(content);

		// if carousel is empty then append item
		if(this.dom.$oItems.length === 0){
			this.dom.$wrp.append(item);
		} else {
			// append item
			var it = this.dom.$oItems.eq(pos);
			if(pos !== -1){it.before(item);} else {it.after(item);}
		}
		// update and calculate carousel
		this.refresh();
	};

	/**
	 * removeItem - Remove an Item
	 * @since 2.0.0
	 * @param [pos] - number - position
	 */

	Owl.prototype.removeItem = function(pos){
		this.dom.$oItems.eq(pos).remove();
		this.refresh();
	};

	/**
	 * addCustomEvents
	 * @desc Add custom events by jQuery .on method
	 * @since 2.0.0
	 */

	Owl.prototype.addCustomEvents = function(){

		this.e.next = function(e,s){this.next(s);			}.bind(this);
		this.e.prev = function(e,s){this.prev(s);			}.bind(this);
		this.e.goTo = function(e,p,s){this.goTo(p,s);		}.bind(this);
		this.e.jumpTo = function(e,p){this.jumpTo(p);		}.bind(this);
		this.e.addItem = function(e,c,p){this.addItem(c,p);	}.bind(this);
		this.e.removeItem = function(e,p){this.removeItem(p);}.bind(this);
		this.e.refresh = function(e){this.refresh();		}.bind(this);
		this.e.stop = function(){this.stop();				}.bind(this);
		this.e.play = function(e,t,s){this.play(t,s);		}.bind(this);

		this.dom.$el.on('owl.next',this.e.next);
		this.dom.$el.on('owl.prev',this.e.prev);
		this.dom.$el.on('owl.goTo',this.e.goTo);
		this.dom.$el.on('owl.jumpTo',this.e.jumpTo);
		this.dom.$el.on('owl.addItem',this.e.addItem);
		this.dom.$el.on('owl.removeItem',this.e.removeItem);
		this.dom.$el.on('owl.refresh',this.e.refresh);
		this.dom.$el.on('owl.play',this.e.play);
		this.dom.$el.on('owl.stop',this.e.stop);
		this.dom.$el.on('owl.stopVideo',this.e.stop);
	
	};

	/**
	 * on
	 * @desc On method for adding internal events
	 * @since 2.0.0
	 */

	Owl.prototype.on = function (element, event, listener, capture) {
		if (element.addEventListener) {
			element.addEventListener(event, listener, capture);
		}
		else if (element.attachEvent) {
			element.attachEvent('on' + event, listener);
		}
	};

	/**
	 * off
	 * @desc Off method for removing internal events
	 * @since 2.0.0
	 */

	Owl.prototype.off = function (element, event, listener, capture) {
		if (element.removeEventListener) {
			element.removeEventListener(event, listener, capture);
		}
		else if (element.detachEvent) {
			element.detachEvent('on' + event, listener);
		}
	};

	/**
	 * fireCallback
	 * @since 2.0.0
	 * @param event - string - event name
	 * @param data - object - additional options - to do
	 */

	Owl.prototype.fireCallback = function(event, data){
		if(!this.options.callbacks){return;}

		if(this.dom.el.dispatchEvent){

			// dispatch event

			var evt = document.createEvent('CustomEvent');

			//evt.initEvent(event, false, true );

			evt.initCustomEvent(event, false, true, data);
			return this.dom.el.dispatchEvent(evt);

		} else if (!this.dom.el.dispatchEvent){

			//	There is no clean solution for custom events name in >=IE8 
			//	But if you know better way, please let me know :) 

			return this.dom.$el.trigger(event);
		}
	};

	/**
	 * watchVisibility
	 * @desc check if el is visible - handy if Owl is inside hidden content (tabs etc.)
	 * @since 2.0.0
	 */

	Owl.prototype.watchVisibility = function(){
		if (!this.dom.$el.is(":visible")) {
			this.dom.$el.css({opacity: 0});
			window.clearInterval(this.e._checkVisibile);
			this.e._checkVisibile = window.setInterval(checkVisible.bind(this),500);
		}

		function checkVisible(){
			if (this.dom.$el.is(":visible")) {
				this.dom.$el.css({opacity: 1});
				this.refresh();
				window.clearInterval(this.e._checkVisibile);
			}
		}
	};

	/**
	 * onChange
	 * @since 2.0.0
	 */

	Owl.prototype.onChange = function(){

		if(!this.state.isTouch && !this.state.jumpToLoop && !this.state.responsive ){
			
			if (this.options.navigation || this.options.pagination) {
				this.updateControls();
			}

			this.autoHeight();

			this.fireCallback('onChange');
		}

		if(!this.state.isTouch && !this.state.jumpToLoop){

			// set Status to do
			this.storeInfo();

			// stopVideo 
			if(this.state.videoPlay){
				this.stopVideo();
			}
		}
	}

	/**
	 * storeInfo
	 * store basic information about current states
	 * @since 2.0.0
	 */

	Owl.prototype.storeInfo = function(){

		this.info = {	
			items: 			this.options.items,
			allItems:		this.num.oItems,
			currentPosition:this.pos.current,
			currentPage:	this.pos.currentPage,
			allPages:		this.num.allPages,
			autoplay:		this.state.autoplay,
			windowWidth:	this.width.window,
			stageWidth:		this.width.stage
		}

		if (typeof this.options.info === "function") {
			this.options.info.apply(this,[this.info]);
		}
	}

	/**
	 * autoHeight
	 * @since 2.0.0
	 */

	Owl.prototype.autoHeight = function(){
		if(!this.options.autoHeight){return false;}

		var loaded = this.dom.$items.eq(this.pos.currentAbs);
		var wrp = this.dom.$oWrp;
		var iterations = 0;

		var isLoaded = window.setInterval(function() {
			iterations += 1;
			if(loaded.data('owl-item').loaded){
				wrp.height(loaded.height() + 'px');
				clearInterval(isLoaded);
			} else if(iterations === 500){
				clearInterval(isLoaded);
			}
		}, 100);
	}

	/**
	 * lazyLoad
	 * @desc lazyLoad images
	 * @since 2.0.0
	 */

	Owl.prototype.lazyLoad = function(){
		var attr = isRetina() ? "data-src-retina" : "data-src";
		var src, img, type, i;

		for(i = 0; i < this.num.items; i++){
			var $item = this.dom.$items.eq(i);

			if( $item.data('owl-item').current === true && $item.data('owl-item').loaded === false){
				img = $item.find('.owl-lazy, .owl-lazy-background');

				if(img.hasClass('owl-lazy-background')){
					type='bg';
				}

				src = img.attr(attr);
				src = src || img.attr("data-src");
				if(src){
					img.css('opacity','0');
					this.preload(img,$item,type);
				}
			}
		}
	};

	/**
	 * preload
	 * @since 2.0.0
	 */

	 Owl.prototype.preload = function(images,$item,type){
	 	var that = this; // fix this later
	 	images.each(function(i,el){
	 		var $el = $(el);
	 		var img = new Image();
	 		img.onload = function(){
				//el.fadeIn(500);
				$item.loaded = true;
				if(type!=='bg'){
					$el.attr('src',img.src)
				}else{
					$el.css('background-image','url(' + img.src + ')')
				}
				
				$el.css('opacity',1);
				$el.removeClass('owl-lazy');
				that.fireCallback('onLazyLoaded');
			};
			img.src = $el.attr("data-src") || $el.attr("data-src-retina");
	 	});
	 };

	/**
	 * destroy
	 * @desc Remove Owl structure and events :(
	 * @since 2.0.0
	 */

	Owl.prototype.destroy = function(){

		window.clearInterval(this.e._autoplay);

		if(this.options.responsive !== false){
			this.off(window, 'resize', this.e._resizer);
		}

		if(this.transitionType){
			this.off(this.dom.wrp, this.transitionType, this.e._transitionEnd);
		}

		if(this.options.mouseDrag || this.options.touchDrag){
			this.off(this.dom.wrp, this.dragType[0], this.e._onDragStart);
			if(this.options.mouseDrag){
				this.off(document, this.dragType[3], this.e._onDragStart);
			}
			if(this.options.mouseDrag){
				this.dom.$wrp.off("dragstart", function() {return false;});
				this.dom.wrp.onselectstart = function(){};
			}
		}

		if(this.options.URLhashListener){
			this.off(window, 'hashchange', this.e._goToHash);
		}

		if(this.options.navigation){
			this.off(this.dom.$navPrev[0], this.dragType[2], this.e.prev);
			this.off(this.dom.$navNext[0], this.dragType[2], this.e.next);
		}

		if(this.options.pagination){
			this.off(this.dom.$page[0], this.dragType[2], this.e._goToPage);
		}

		this.dom.$el.off('owl.next',this.e.next);
		this.dom.$el.off('owl.prev',this.e.prev);
		this.dom.$el.off('owl.goTo',this.e.goTo);
		this.dom.$el.off('owl.jumpTo',this.e.jumpTo);
		this.dom.$el.off('owl.addItem',this.e.addItem);
		this.dom.$el.off('owl.removeItem',this.e.removeItem);
		this.dom.$el.off('owl.refresh',this.e.refresh);	
		this.dom.$wrp.off('click',this.e._playVideo);

		if(this.dom.$cc !== null){
			this.dom.$cc.remove();
		}
		if(this.dom.$cItems !== null){
			this.dom.$cItems.remove();
		}
		this.e = null;
		this.dom.$el.data('owlCarousel',null);
		delete this.dom.el.owlCarousel;

		this.dom.$wrp.unwrap();
		this.dom.$items.unwrap()
		this.dom.$items.contents().unwrap();
		this.dom = null;
	};

	// Pivate methods 

	function isTransitionEnd(){
		var t;
		var el = document.createElement('fake');
		var transitions = {
		  'transition':			'transitionend',
		  'OTransition':		'oTransitionEnd',
		  'MozTransition':		'transitionend',
		  'WebkitTransition':	'webkitTransitionEnd'
		};
		for(t in transitions){
			if( el.style[t] !== undefined ){
				return transitions[t];
			}
		}
		el = null;
	};

	function isTransformProperty() {
		var node = document.createElement('fake');
		var properties = ['WebkitTransform','msTransform','OTransform','transform','MozTransform'];
		var p;
		while (p = properties.shift()) {
			if (typeof node.style[p] !== 'undefined') {
				node = null;
				return p;
			}
		}
		return false;
	};

	function isTransform3d(){
		var d = document.createElement('fake').style;
		var test = ('webkitPerspective' in d || 'MozPerspective' in d || 'OPerspective' in d || 'MsPerspective' in d || 'perspective' in d);
		d = null;
		return test;
	};

	function isTouchSupport(){
		return 'ontouchstart' in window || !!(navigator.msMaxTouchPoints);
	};

	function isTouchSupportIE(){
		return window.navigator.msPointerEnabled;
	};

	function isPageHidden(){
		return document.hidden;
	};

	function isRetina(){
		return window.devicePixelRatio > 1;
	};


	$.fn.owlCarousel = function ( options ) {
		return this.each(function () {
			if (!$(this).data('owlCarousel')) {
				$(this).data( 'owlCarousel',
				new Owl( this, options ));
			}
		});

	};

})( window.Zepto || window.jQuery, window,  document );

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
//The bind() method creates a new function that, when called, has its this keyword set to the provided value, with a given sequence of arguments preceding any provided when the new function is called.

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
	if (typeof this !== "function") {
		// closest thing possible to the ECMAScript 5 internal IsCallable function
		throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
	}

	var aArgs = Array.prototype.slice.call(arguments, 1), 
		fToBind = this, 
		fNOP = function () {},
		fBound = function () {
			return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
		};
	fNOP.prototype = this.prototype;
	fBound.prototype = new fNOP();
	return fBound;
  };
}