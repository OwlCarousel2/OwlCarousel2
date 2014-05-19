
/*

{0,0}
 )_)
 ""

To do:

* Lazy Load Icon
* prevent animationend bubling
* itemsScaleUp 
* Test Zepto

Callback events list:

onInitBefore
onInitAfter
onResponsiveBefore
onResponsiveAfter
onTransitionStart
onTransitionEnd
onTouchStart
onTouchEnd
onChangeState
onLazyLoaded
onVideoPlay
onVideoStop

Custom events list:

next.owl
prev.owl
goTo.owl
jumpTo.owl
addItem.owl
removeItem.owl
refresh.owl
play.owl
stop.owl
stopVideo.owl

*/


;(function ( $, window, document, undefined ) {

	var defaults = {
		items:				3,
		loop:				false,
		center:				false,

		mouseDrag:			true,
		touchDrag:			true,
		pullDrag: 			true,
		freeDrag:			false,

		margin:				0,
		stagePadding:		0,

		merge:				false,
		mergeFit:			true,
		autoWidth:			false,
		autoHeight:			false,

		startPosition:		0,
		URLhashListener:	false,

		nav: 				false,
		navRewind:			true,
		navText: 			['prev','next'],
		slideBy:			1,
		dots: 				true,
		dotsEach:			false,
		dotData:			false,

		lazyLoad:			false,
		lazyContent:		false,

		autoplay:			false,
		autoplayTimeout:	5000,
		autoplayHoverPause:	false,

		smartSpeed:			250,
		fluidSpeed:			false,
		autoplaySpeed:		false,
		navSpeed:			false,
		dotsSpeed:			false,
		dragEndSpeed:		false,
		
		responsive: 		{},
		responsiveRefreshRate: 200,
		responsiveBaseElement: window,
		responsiveClass:	false,

		animateOut:			false,
		animateIn:			false,

		fallbackEasing:		'swing',

		callbacks:			true,
		info: 				false,

		nestedItemSelector:	false,
		itemElement:		'div',
		stageElement:		'div',

		navContainer: 		false,
		dotsContainer: 		false,

		//Classes and Names
		themeClass: 		'owl-theme',
		baseClass:			'owl-carousel',
		itemClass:			'owl-item',
		centerClass:		'center',
		activeClass: 		'active',
		navContainerClass:	'owl-nav',
		navClass:			['owl-prev','owl-next'],
		controlsClass:		'owl-controls',
		dotClass: 			'owl-dot',
		dotsClass:			'owl-dots',
		autoHeightClass:	'owl-height'

	};

	// Reference to DOM elements
	// Those with $ sign are jQuery objects

	var dom = {
		el:			null,	// main element 
		$el:		null,	// jQuery main element 
		stage:		null,	// stage
		$stage:		null,	// jQuery stage
		oStage:		null,	// outer stage
		$oStage:	null,	// $ outer stage
		$items:		null,	// all items, clones and originals included 
		$oItems:	null,	// original items
		$cItems:	null,	// cloned items only
		$cc:		null,
		$navPrev:	null,
		$navNext:	null,
		$page:		null,
		$nav:		null,
		$content:	null
	};

	/**
	 * Variables
	 * @since 2.0.0
	 */

	// Only for development process

	// Widths

	var width = {
		el:			0,
		stage:		0,
		item:		0,
		prevWindow:	0,
		cloneLast:  0
	};

	// Numbers

	var num = {
		items:			0,
		oItems: 		0,
		cItems:			0,
		active:			0,
		merged:			[],
		nav:			[],
		allPages:		0
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
		stage:		0,
		items:		[],
		lsCurrent:	0
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
		nav:		300,
		css2speed:	0

	};

	// States

	var state = {
		isTouch:		false,
		isScrolling:	false,
		isSwiping:		false,
		direction:		false,
		inMotion:		false,
		autoplay:		false,
		lazyContent:	false
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
			'version':	'2.0.0-beta.1.9',
			'released':	'14.05.2014'
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

	Owl.Plugins = {};

	/**
	 * init
	 * @since 2.0.0
	 */

	Owl.prototype.init = function(){

		this.fireCallback('onInitBefore');

		//Add base class
		if(!this.dom.$el.hasClass(this.options.baseClass)){
			this.dom.$el.addClass(this.options.baseClass);
		}

		//Add theme class
		if(!this.dom.$el.hasClass(this.options.themeClass)){
			this.dom.$el.addClass(this.options.themeClass);
		}

		//Add theme class
		if(this.options.rtl){
			this.dom.$el.addClass('owl-rtl');
		}

		// Check support
		this.browserSupport();

		// Sort responsive items in array
		this.sortOptions();

		// Update options.items on given size
		this.setResponsiveOptions();

		if(this.options.autoWidth && this.state.imagesLoaded !== true){
			var imgs = this.dom.$el.find('img');
			var nestedSelector = this.options.nestedItemSelector ? '.'+this.options.nestedItemSelector : undefined;
			var width = this.dom.$el.children(nestedSelector).width();

			if(imgs.length && width <= 0){
				this.preloadAutoWidthImages(imgs);
				return false;
			}
		}

		// Get and store window width
		// iOS safari likes to trigger unnecessary resize event
		this.width.prevWindow = this.windowWidth();

		// create stage object
		this.createStage();

		// Append local content 
		this.fetchContent();

		// attach generic events 
		this.eventsCall();

		// attach custom control events
		this.addCustomEvents();

		// attach generic events 
		this.internalEvents();

		this.plugins = {};

        for (var plugin in Owl.Plugins) {
            this.plugins[plugin] = new Owl.Plugins[plugin](this);
        }

		this.dom.$el.addClass('owl-loading');
		this.refresh(true);
		this.dom.$el.removeClass('owl-loading').addClass('owl-loaded');

		this.fireCallback('onInitAfter');
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

		keys = keys.sort(function (a, b) {return a - b;});

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
			if(k !== 'responsive'){
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
		this.num.breakpoint = minWidth;

		// Responsive Class
		if(this.options.responsiveClass){
			this.dom.$el.attr('class',
				function(i, c){
				return c.replace(/\b owl-responsive-\S+/g, '');
			}).addClass('owl-responsive-'+minWidth);
		}


	};

	/**
	 * optionsLogic
	 * @desc Update option logic if necessery
	 * @since 2.0.0
	 */

	Owl.prototype.optionsLogic = function(){
		// Toggle Center class
		this.dom.$el.toggleClass('owl-center',this.options.center);

		// Scroll per - 'page' option will scroll per visible items number
		// You can set this to any other number below visible items.
		if(this.options.slideBy && this.options.slideBy === 'page'){
			this.options.slideBy = this.options.items;
		} else if(this.options.slideBy > this.options.items){
			this.options.slideBy = this.options.items;
		}

		// if items number is less than in body
		if(this.options.loop && this.num.oItems < this.options.items){
			this.options.loop = false;
		}

		if(this.num.oItems <= this.options.items && !this.options.center){
			this.options.navRewind = false;
		}

		if(this.options.autoWidth){
			this.options.stagePadding = false;
			this.options.dotsEach = 1;
			this.options.merge = false;
		}
		if(this.state.lazyContent){
			this.options.loop = false;
			this.options.merge = false;
			this.options.dots = false;
			this.options.freeDrag = false;
			this.options.lazyContent = true;
		}

		if((this.options.animateIn || this.options.animateOut) && this.options.items === 1 && this.support3d && this.plugins.animate){
			this.state.animate = true;
		} else {this.state.animate = false;}

		this.options.lazyLoad = this.plugins.lazyLoad && this.options.lazyLoad ? true : false;

	};

	/**
	 * createStage
	 * @desc Create stage and Outer-stage elements
	 * @since 2.0.0
	 */

	Owl.prototype.createStage = function(){
		var oStage = document.createElement('div');
		var stage = document.createElement(this.options.stageElement);

		oStage.className = 'owl-stage-outer';
		stage.className = 'owl-stage';

		oStage.appendChild(stage);
		this.dom.el.appendChild(oStage);

		this.dom.oStage = oStage;
		this.dom.$oStage = $(oStage);
		this.dom.stage = stage;
		this.dom.$stage = $(stage);

		oStage = null;
		stage = null;
	};

	/**
	 * createItem
	 * @desc Create item container
	 * @since 2.0.0
	 */

	Owl.prototype.createItem = function(){
		var item = document.createElement(this.options.itemElement);
		item.className = this.options.itemClass;
		return item;
	};

	/**
	 * fetchContent
	 * @since 2.0.0
	 */

	Owl.prototype.fetchContent = function(extContent){
		if(extContent){
			this.dom.$content = (extContent instanceof jQuery) ? extContent : $(extContent);
		}
		else if(this.options.nestedItemSelector){
			this.dom.$content= this.dom.$el.find('.'+this.options.nestedItemSelector).not('.owl-stage-outer');
		} 
		else {
			this.dom.$content= this.dom.$el.children().not('.owl-stage-outer');
		}
		// content length
		this.num.oItems = this.dom.$content.length;

		// init Structure
		if(this.num.oItems !== 0){
			this.initStructure();
		}
	};


	/**
	 * initStructure
	 * @param [refresh] - if refresh and not lazyContent then dont create normal structure
	 * @since 2.0.0
	 */

	Owl.prototype.initStructure = function(){

		// lazyContent needs at least 3*items 

		if(this.options.lazyContent && this.num.oItems >= this.options.items*3){
			this.state.lazyContent = true;
		} else {
			this.state.lazyContent = false;
		}

		if(this.state.lazyContent){

			// start position
			this.pos.currentAbs = this.options.items;

			//remove lazy content from DOM
			this.dom.$content.remove();

		} else {
			// create normal structure
			this.createNormalStructure();
		}
	};

	/**
	 * createNormalStructure
	 * @desc Create normal structure for small/mid weight content
	 * @since 2.0.0
	 */

	Owl.prototype.createNormalStructure = function(){
		for(var i = 0; i < this.num.oItems; i++){
			// fill 'owl-item' with content 
			var item = this.fillItem(this.dom.$content,i);
			// append into stage 
			this.dom.$stage.append(item);
		}
		this.dom.$content = null;
	};

	/**
	 * createCustomStructure
	 * @since 2.0.0
	 */

	Owl.prototype.createCustomStructure = function(howManyItems){
		for(var i = 0; i < howManyItems; i++){
			var emptyItem = this.createItem();
			var item = $(emptyItem);

			this.setData(item,false);
			this.dom.$stage.append(item);
		}
	};

	/**
	 * createLazyContentStructure
	 * @desc Create lazyContent structure for large content and better mobile experience
	 * @since 2.0.0
	 */

	Owl.prototype.createLazyContentStructure = function(refresh){
		if(!this.state.lazyContent){return false;}

		// prevent recreate - to do
		if(refresh && this.dom.$stage.children().length === this.options.items*3){
			return false;
		}
		// remove items from stage
		this.dom.$stage.empty();

		// create custom structure
		this.createCustomStructure(3*this.options.items);
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
		var traversed = this.traversContent(c);
		this.setData(emptyItem,false,traversed);
		return $(emptyItem).append(c);
	};

	/**
	 * traversContent
	 * @since 2.0.0
	 * @param [c] - content
	 * return object
	 */

	Owl.prototype.traversContent = function(c){
		var $c = $(c), dotValue, hashValue;
		if(this.options.dotData){
			dotValue = $c.find('[data-dot]').andSelf().data('dot');
		}
		// update URL hash
		if(this.options.URLhashListener){
			hashValue = $c.find('[data-hash]').andSelf().data('hash');
		}
		return {
			dot : dotValue || false,
			hash : hashValue  || false
		};
	};


	/**
	 * setData
	 * @desc Set item jQuery Data 
	 * @since 2.0.0
	 * @param [item] - dom - passed owl-item
	 * @param [cloneObj] - $dom - passed clone item
	 */


	Owl.prototype.setData = function(item,cloneObj,traversed){
		var dot,hash;
		if(traversed){
			dot = traversed.dot;
			hash = traversed.hash;
		}
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
			dot:		dot,
			hash:		hash
		};

		// copy itemData to cloned item 

		if(cloneObj){
			itemData = $.extend({}, itemData, cloneObj.data('owl-item'));
		}

		$(item).data('owl-item', itemData);
	};

	/**
	 * updateLocalContent
	 * @since 2.0.0
	 */

	Owl.prototype.updateLocalContent = function(){
		this.dom.$oItems = this.dom.$stage.find('.'+this.options.itemClass).filter(function(){
			return $(this).data('owl-item').clone === false;
		});

		this.num.oItems = this.dom.$oItems.length;
		//update index on original items

		for(var k = 0; k<this.num.oItems; k++){
			var item = this.dom.$oItems.eq(k);
			item.data('owl-item').index = k;
		}
	};

	/**
	 * loopClone
	 * @desc Make a clones for infinity loop
	 * @since 2.0.0
	 */

	Owl.prototype.loopClone = function(){
		if(!this.options.loop || this.state.lazyContent || this.num.oItems < this.options.items){return false;}

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

			this.dom.$stage.append(firstClone);
			this.dom.$stage.prepend(lastClone);

			firstClone = lastClone = null;
		}

		this.dom.$cItems = this.dom.$stage.find('.'+this.options.itemClass).filter(function(){
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
		if(this.dom.$cItems !== null){ // && (this.num.oItems !== 0 && this.num.oItems <= this.options.items)){
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
		this.width.view = this.dom.$el.width();

		// calculate width minus addition margins 
		var elMinusMargin = this.width.el - (this.options.margin * (this.options.items === 1 ? 0 : this.options.items -1));

		// calculate element width and item width 
		this.width.el =  	this.width.el + this.options.margin;
		this.width.item = 	((elMinusMargin / this.options.items) + this.options.margin).toFixed(3);

		this.dom.$items = 	this.dom.$stage.find('.owl-item');
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
		if(this.options.rtl){
			dist = this.options.center ? -((this.width.el)/2) : 0;
		} else {
			dist = this.options.center ? (this.width.el)/2 : 0;
		}
		
		this.width.mergeStage = 0;

		// Calculate items positions
		for(i = 0; i<this.num.items; i++){

			// check merged items

			if(this.options.merge){
				var mergeNumber = this.dom.$items.eq(i).find('[data-merge]').attr('data-merge') || 1;
				if(this.options.mergeFit && mergeNumber > this.options.items){
					mergeNumber = this.options.items;
				}
				this.num.merged.push(parseInt(mergeNumber));
				this.width.mergeStage += this.width.item * this.num.merged[i];
			} else {
				this.num.merged.push(1);
			}

			// Array based on merged items used by dots and navigation
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
				if(this.options.rtl){
					this.dom.$items[i].style.marginLeft = this.options.margin + 'px';
				} else {
					this.dom.$items[i].style.marginRight = this.options.margin + 'px';
				}
				
			}
			// push item position into array
			this.pos.items.push(dist);

			// update item data
			this.dom.$items.eq(i).data('owl-item').posLeft = posLeft;
			this.dom.$items.eq(i).data('owl-item').width = iWidth;

			// dist starts from middle of stage if center
			// posLeft always starts from 0
			if(this.options.rtl){
				dist += iWidth;
				posLeft += iWidth;
			} else{
				dist -= iWidth;
				posLeft -= iWidth;
			}

			fullWidth -= Math.abs(iWidth);

			// update position if center
			if(this.options.center){
				this.pos.items[i] = !this.options.rtl ? this.pos.items[i] - (iWidth/2) : this.pos.items[i] + (iWidth/2);
			}
		}

		if(this.options.autoWidth){
			this.width.stage = this.options.center ? Math.abs(fullWidth) : Math.abs(dist);
		} else {
			this.width.stage = Math.abs(fullWidth);
		}

		//update indexAbs on all items 
		var allItems = this.num.oItems + this.num.cItems;

		for(j = 0; j< allItems; j++){
			this.dom.$items.eq(j).data('owl-item').indexAbs = j;
		}

		// Set Min and Max
		this.setMinMax();

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
			var revert = this.options.rtl ? 1 : -1;
			for (i = 0; i < this.pos.items.length; i++) {
				if( (this.pos.items[i] * revert) < this.width.stage-this.width.el ){
					this.pos.max = i+1;
				}
			}
			this.pos.maxValue = this.options.rtl ? this.width.stage-this.width.el : -(this.width.stage-this.width.el);
			this.pos.items[this.pos.max] = this.pos.maxValue;
		}

		// Set loop boundries
		if(this.options.center){
			this.pos.loop = this.pos.items[0]-this.pos.items[this.num.oItems];
		} else {
			this.pos.loop = -this.pos.items[this.num.oItems];
		}

		//if is less items
		if(this.num.oItems < this.options.items && !this.options.center){
			this.pos.max = 0;
			this.pos.maxValue = this.pos.items[0];
		}
	};

	/**
	 * setSizes
	 * @desc Set sizes on elements (from collectData function)
	 * @since 2.0.0
	 */

	Owl.prototype.setSizes = function(){

		// show neighbours 
		if(this.options.stagePadding !== false){
			this.dom.oStage.style.paddingLeft = 	this.options.stagePadding + 'px';
			this.dom.oStage.style.paddingRight = 	this.options.stagePadding + 'px';
		}

		// CRAZY FIX!!! Doublecheck this!
		//if(this.width.stagePrev > this.width.stage){
		if(this.options.rtl){
			window.setTimeout(function(){
				this.dom.stage.style.width = this.width.stage + 'px';
			}.bind(this),0);
		} else{
			this.dom.stage.style.width = this.width.stage + 'px';
		}

		for(var i=0; i<this.num.items; i++){

			// Set items width
			if(!this.options.autoWidth){
				this.dom.$items[i].style.width = this.width.item - (this.options.margin) + 'px';
			}
			// add margin
			if(this.options.rtl){
				this.dom.$items[i].style.marginLeft = this.options.margin + 'px';
			} else {
				this.dom.$items[i].style.marginRight = this.options.margin + 'px';
			}
			
			if(this.num.merged[i] !== 1 && !this.options.autoWidth){
				this.dom.$items[i].style.width = (this.width.item * this.num.merged[i]) - (this.options.margin) + 'px';
			}
		}

		// save prev stage size 
		this.width.stagePrev = this.width.stage;
	};

	/**
	 * responsive
	 * @desc Responsive function update all data by calling refresh() 
	 * @since 2.0.0
	 */

	Owl.prototype.responsive = function(){

		if(!this.num.oItems){return false;}
		// If El width hasnt change then stop responsive 
		var elChanged = this.isElWidthChanged();
		if(!elChanged){return false;}

		var event = $.Event('resize.owl.carousel');
		this.dom.$el.trigger(event)
		if (event.isDefaultPrevented()) return false;

		this.state.responsive = true;
		this.refresh();
		this.state.responsive = false;

		this.dom.$el.trigger('resized.owl.carousel')
	};

	/**
	 * refresh
	 * @desc Refresh method is basically collection of functions that are responsible for Owl responsive functionality
	 * @since 2.0.0
	 */

	Owl.prototype.refresh = function(init){

		var event = $.Event('refresh.owl.carousel');
		this.dom.$el.trigger(event);
		if (event.isDefaultPrevented()) return false;

		// Update Options for given width
		this.setResponsiveOptions();

		//set lazy structure
		this.createLazyContentStructure(true);

		// update info about local content
		this.updateLocalContent();

		// udpate options
		this.optionsLogic();

		// if no items then stop 
		if(this.num.oItems === 0){
			if(this.dom.$page !== null){
				this.dom.$page.hide();
			}
			return false;
		}

		// Hide and Show methods helps here to set a proper widths.
		// This prevents Scrollbar to be calculated in stage width
		this.dom.$stage.addClass('owl-refresh');
		
		// Remove clones and generate new ones
		this.reClone();

		// calculate 
		this.calculate();

		//aaaand show.
		this.dom.$stage.removeClass('owl-refresh');

		// to do
		// lazyContent last position on refresh
		if(this.state.lazyContent){
			this.pos.currentAbs = this.options.items;
		}

		this.initPosition(init);

		// jump to last position 
		if(!this.state.lazyContent && !init){
			this.jumpTo(this.pos.current,false); // fix that 
		}

		this.updateItemState();

		// Update controls
		this.rebuildDots();

		this.updateControls();

		// update drag events
		//this.updateEvents();

		// update autoplay
		this.autoplay();

		if(this.plugins.autoHeight){
			this.plugins.autoHeight.setHeight();
		}

		this.state.orientation = window.orientation;

		this.watchVisibility();
		
		this.dom.$el.trigger('refreshed.owl.carousel')
	};

	/**
	 * updateItemState
	 * @desc Update information about current state of items (visibile, hidden, active, etc.)
	 * @since 2.0.0
	 */

	Owl.prototype.updateItemState = function(update){

		this.dom.$el.trigger('update.owl.carousel');
		
		if(this.state.lazyContent){
			this.updateLazyContent(update);
		}

		if(this.options.center){
			this.dom.$items.eq(this.pos.currentAbs)
			.addClass(this.options.centerClass)
			.data('owl-item').center = true;
		}
		if(this.options.lazyLoad){
			this.plugins.lazyLoad.check();
		}
		
		this.dom.$el.trigger('updated.owl.carousel');
	};

	/**
	 * updateActiveItems
	 * @since 2.0.0
	 */


	Owl.prototype.updateActiveItems = function(){
		var i,j,item,ipos,iwidth,wpos,stage,outsideView,foundCurrent;
		// clear states
		for(i = 0; i<this.num.items; i++){
			this.dom.$items.eq(i).data('owl-item').active = false;
			this.dom.$items.eq(i).data('owl-item').current = false;
			this.dom.$items.eq(i).removeClass(this.options.activeClass).removeClass(this.options.centerClass);
		}

		this.num.active = 0;
		stageX = this.pos.stage;
		view = this.options.rtl ? this.width.view : -this.width.view;

		for(j = 0; j<this.num.items; j++){

				item = this.dom.$items.eq(j);
				ipos = item.data('owl-item').posLeft;
				iwidth = item.data('owl-item').width;
				outsideView = this.options.rtl ? ipos + iwidth : ipos - iwidth;

			if( (this.op(ipos,'<=',stageX) && (this.op(ipos,'>',stageX + view))) || 
				(this.op(outsideView,'<',stageX) && this.op(outsideView,'>',stageX + view)) 
				){

				this.num.active++;

				if(this.options.freeDrag && !foundCurrent){
					foundCurrent = true;
					this.pos.current = item.data('owl-item').index;
					this.pos.currentAbs = item.data('owl-item').indexAbs;
				}

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
	};

	/**
	 * updateClonedItemsState
	 * @desc Set current state on sibilings items for lazyLoad and center
	 * @since 2.0.0
	 */

	Owl.prototype.updateClonedItemsState = function(activeIndex){

		//find cloned center
		var center, $el,i;
		if(this.options.center){
			center = this.dom.$items.eq(this.pos.currentAbs).data('owl-item').index;
		}

		for(i = 0; i<this.num.items; i++){
			$el = this.dom.$items.eq(i);
			if( $el.data('owl-item').index === activeIndex ){
				$el.data('owl-item').current = true;
				if($el.data('owl-item').index === center ){
					$el.addClass(this.options.centerClass);
				}
			}
		}
	};

	/**
	 * updateLazyPosition
	 * @desc Set current state on sibilings items for lazyLoad and center
	 * @since 2.0.0
	 */

	Owl.prototype.updateLazyPosition = function(){
		var jumpTo = this.pos.goToLazyContent || 0;

		this.pos.lcMovedBy = Math.abs(this.options.items - this.pos.currentAbs);

		if(this.options.items < this.pos.currentAbs ){
			this.pos.lcCurrent += this.pos.currentAbs - this.options.items;
			this.state.lcDirection = 'right';
		} else if(this.options.items > this.pos.currentAbs ){
			this.pos.lcCurrent -= this.options.items - this.pos.currentAbs;
			this.state.lcDirection = 'left';
		}

		this.pos.lcCurrent = jumpTo !== 0 ? jumpTo : this.pos.lcCurrent;

		if(this.pos.lcCurrent >= this.dom.$content.length){
			this.pos.lcCurrent = this.pos.lcCurrent-this.dom.$content.length;
		} else if(this.pos.lcCurrent < -this.dom.$content.length+1){
			this.pos.lcCurrent = this.pos.lcCurrent+this.dom.$content.length;
		}

		if(this.options.startPosition>0){
			this.pos.lcCurrent = this.options.startPosition;
			this._options.startPosition = this.options.startPosition = 0;
		}

		this.pos.lcCurrentAbs = this.pos.lcCurrent < 0 ? this.pos.lcCurrent+this.dom.$content.length : this.pos.lcCurrent;

	};

	/**
	 * updateLazyContent
	 * @param [update] - boolean - update call by content manipulations
	 * @since 2.0.0
	 */

	Owl.prototype.updateLazyContent = function(update){

		if(this.pos.lcCurrent === undefined){
			this.pos.lcCurrent = 0;
			this.pos.current = this.pos.currentAbs = this.options.items;
		}


		if(!update){
			this.updateLazyPosition();
		}
		var i,j,item,contentPos,content,freshItem,freshData;

		this.pos.current = this.pos.currentAbs = this.options.items;
		this.setSpeed(0);

		if(this.state.lcDirection !== false){
			for(i = 0; i<this.pos.lcMovedBy; i++){

				if(this.state.lcDirection === 'right'){
					item = this.dom.$stage.find('.owl-item').eq(0); 
					item.appendTo(this.dom.$stage);
				}
				if(this.state.lcDirection === 'left'){
					item = this.dom.$stage.find('.owl-item').eq(-1);
					item.prependTo(this.dom.$stage);
				}
				item.data('owl-item').active = false;
			}
		}

		// recollect 
		this.dom.$items = this.dom.$stage.find('.owl-item');

		for(j = 0; j<this.num.items; j++){

			// to do
			//this.dom.$items.eq(j).removeClass(this.options.centerClass);

			// get Content 
			contentPos = this.pos.lcCurrent + j - this.options.items;// + this.options.startPosition;

			if(contentPos >= this.dom.$content.length){
				contentPos = contentPos - this.dom.$content.length;
			}
			if(contentPos < -this.dom.$content.length){
				contentPos = contentPos + this.dom.$content.length;
			}

			content = this.dom.$content.eq(contentPos);
			freshItem = this.dom.$items.eq(j);
			freshData = freshItem.data('owl-item');

			if(freshData.active === false || this.pos.goToLazyContent !== 0 || update === true){

				freshItem.empty();
				freshItem.append(content.clone(true,true));
				freshData.active = true;
				freshData.current = true;
				if(!this.options.lazyLoad){
					freshData.loaded = true;
				} else {
					freshData.loaded = false;
				}
			}
		}
		this.animStage(this.pos.items[this.options.items]);
		this.pos.goToLazyContent = 0;
		
	};

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
		this.e._ap = 			function(){this.autoplay();				}.bind(this);
		this.e._play = 			function(){this.play();					}.bind(this);
		this.e._pause = 		function(){this.pause();				}.bind(this);

		this.e._navNext = function(e){
			if($(e.target).hasClass('disabled')){return false;}
			e.preventDefault();
			this.next();				
		}.bind(this);

		this.e._navPrev = function(e){
			if($(e.target).hasClass('disabled')){return false;}
			e.preventDefault();
			this.prev();
		}.bind(this);

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
			this.dragType = ['touchstart','touchmove','touchend','touchcancel'];
		} else if(isTouch && isTouchIE){
			this.dragType = ['MSPointerDown','MSPointerMove','MSPointerUp','MSPointerCancel'];
		} else {
			this.dragType = ['mousedown','mousemove','mouseup'];
		}

		if( (isTouch || isTouchIE) && this.options.touchDrag){
			//touch cancel event 
			this.on(document, this.dragType[3], this.e._onDragEnd);

		} else {
			// firefox startdrag fix - addeventlistener doesnt work here :/
			this.dom.$stage.on('dragstart', function() {return false;});

			if(this.options.mouseDrag){
				//disable text select
				this.dom.stage.onselectstart = function(){return false;};
			} else {
				// enable text select
				this.dom.$el.addClass('owl-text-select-on');
			}
		}

		if(this.options.URLhashListener){
			this.on(window, 'hashchange', this.e._goToHash, false);
		}

		if(this.options.autoplayHoverPause){
			var that = this;
			this.dom.$stage.on('mouseover', this.e._pause );
			this.dom.$stage.on('mouseleave', this.e._ap );
		}

		// Catch transitionEnd event
		if(this.transitionEndVendor){
			this.on(this.dom.stage, this.transitionEndVendor, this.e._transitionEnd, false);
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

		if(this.options.touchDrag && (this.dragType[0] === 'touchstart' || this.dragType[0] === 'MSPointerDown')){
			this.on(this.dom.stage, this.dragType[0], this.e._onDragStart,false);
		} else if(this.options.mouseDrag && this.dragType[0] === 'mousedown'){
			this.on(this.dom.stage, this.dragType[0], this.e._onDragStart,false);

		} else {
			this.off(this.dom.stage, this.dragType[0], this.e._onDragStart);
		}
	};

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
			this.dom.$stage.addClass('owl-grab');
		}

		this.fireCallback('onTouchStart');
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

		//get stage position left
		this.drag.offsetX = this.dom.$stage.position().left - this.options.stagePadding;
		this.drag.offsetY = this.dom.$stage.position().top;

		if(this.options.rtl){
			this.drag.offsetX = this.dom.$stage.position().left + this.width.stage - this.width.el + this.options.margin;
		}

		//catch position // ie to fix
		if(this.state.inMotion && this.support3d){
			var animatedPos = this.getTransformProperty();
			this.drag.offsetX = animatedPos;
			this.animStage(animatedPos);
		} else if(this.state.inMotion && !this.support3d ){
			this.state.inMotion = false;
			return false;
		}

		this.drag.startX = pageX - this.drag.offsetX;
		this.drag.startY = pageY - this.drag.offsetY;

		this.drag.start = pageX - this.drag.startX;
		this.drag.targetEl = ev.target || ev.srcElement;
		this.drag.updatedX = this.drag.start;

		// to do/check
		//prevent links and images dragging;
		if(this.drag.targetEl.tagName === "IMG" || this.drag.targetEl.tagName === "A"){
			this.drag.targetEl.draggable = false;
		}

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
			this.state.direction = this.options.rtl ? 'right' : 'left';
		} else if(this.drag.distance > 0){
			this.state.direction = this.options.rtl ? 'left' : 'right';
		}
		// Loop
		if(this.options.loop){
			if(this.op(this.drag.currentX, '>', this.pos.minValue) && this.state.direction === 'right' ){
				this.drag.currentX -= this.pos.loop;
			}else if(this.op(this.drag.currentX, '<', this.pos.maxValue) && this.state.direction === 'left' ){
				this.drag.currentX += this.pos.loop;
			}
		} else {
			// pull
			var minValue = this.options.rtl ? this.pos.maxValue : this.pos.minValue;
			var maxValue = this.options.rtl ? this.pos.minValue : this.pos.maxValue;
			var pull = this.options.pullDrag ? this.drag.distance / 5 : 0;
			this.drag.currentX = Math.max(Math.min(this.drag.currentX, minValue + pull), maxValue + pull);
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

		this.animStage(this.drag.updatedX);
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
			this.dom.$stage.removeClass('owl-grab');
		}

		this.fireCallback('onTouchEnd');

		//prevent links and images dragging;
		this.drag.targetEl.removeAttribute("draggable");

		//remove drag event listeners

		this.state.isTouch = false;
		this.state.isScrolling = false;
		this.state.isSwiping = false;

		//to check
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
		this.animStage(this.pos.items[closest]);
		
		//if pullDrag is off then fire transitionEnd event manually when stick to border
		if(!this.options.pullDrag && this.drag.updatedX === this.pos.items[closest]){
			this.transitionEnd();
		}

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
		$(target).on('click.preventClick', this.e._preventClick);
		// to make sure click is removed:
		window.setTimeout(function(){
			$(target).off('click.preventClick');
		},300);
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
		$(ev.target).off('click.preventClick')
	};

	/**
	 * getTransformProperty
	 * @desc catch stage position while animate (only css3)
	 * @since 2.0.0
	 */

	Owl.prototype.getTransformProperty = function(){
		var transform = window.getComputedStyle(this.dom.stage, null).getPropertyValue(this.vendorName + 'transform');
		//var transform = this.dom.$stage.css(this.vendorName + 'transform')
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

		if(!this.options.freeDrag){
			// Check closest item
			for(var i = 0; i< this.num.items; i++){
				if(x > this.pos.items[i]-pull && x < this.pos.items[i]+pull){
					newX = i;
				}else if(this.op(x,'<',this.pos.items[i]) && this.op(x,'>',this.pos.items[i+1 || this.pos.items[i] - this.width.el]) ){
					newX = this.state.direction === 'left' ? i+1 : i;
				}
			}
		}
		//non loop boundries
		if(!this.options.loop){
			if(this.op(x,'>',this.pos.minValue)){
				newX = x = this.pos.min;
			} else if(this.op(x,'<',this.pos.maxValue)){
				newX = x = this.pos.max;
			}
		}

		if(!this.options.freeDrag){
			// set positions
			this.pos.currentAbs = newX;
			this.pos.current = this.dom.$items.eq(newX).data('owl-item').index;
		} else {
			this.updateItemState();
			return x;
		}

		return newX;
	};

	/**
	 * animStage
	 * @desc animate stage position (both css3/css2) and perform onChange functions/events
	 * @since 2.0.0
	 * @param [x] - curent position in pixels
	 */

	Owl.prototype.animStage = function(pos){

		// if speed is 0 the set inMotion to false
		if(this.speed.current !== 0 && this.pos.currentAbs !== this.pos.min){
			this.fireCallback('onTransitionStart');
			this.state.inMotion = true;
		}

		var posX = this.pos.stage = pos,
			style = this.dom.stage.style;

		if(this.support3d){
			translate = 'translate3d(' + posX + 'px'+',0px, 0px)';
			style[this.transformVendor] = translate;
		} else if(this.state.isTouch){
			style.left = posX+'px';
		} else {
			this.dom.$stage.animate({left: posX},this.speed.css2speed, this.options.fallbackEasing, function(){
				if(this.state.inMotion){
					this.transitionEnd();
				}
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
		// to do
		//if(pos > this.num.items){pos = 0;}
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
			if(this.options.navRewind){
				if(this.pos.current >= this.pos.max){
					nextPos = nextPos > this.pos.max ? this.pos.min : (nextPos < 0 ? this.pos.max : nextPos);
				} else {
					nextPos = nextPos > this.pos.max ? this.pos.max : (nextPos < 0 ? this.pos.max : nextPos);
				}
			} else {
				nextPos = nextPos > this.pos.max ? this.pos.max : (nextPos <= 0 ? 0 : nextPos);
			}
		} else {
			nextPos = nextPos >= this.num.oItems ? this.num.oItems-1 : nextPos;
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

		if((s === false && s !== 0 && drag !== true) || s === undefined){

			//Double check this
			// var nextPx = this.pos.items[nextPos];
			// var currPx = this.pos.stage 
			// var diff = Math.abs(nextPx-currPx);
			// var s = diff/1
			// if(s>1000){
			// 	s = 1000;
			// }
			
			var diff = Math.abs(nextPos - this.pos.prev);
			diff = diff === 0 ? 1 : diff;
			if(diff>6){diff = 6;}
			s = diff * this.options.smartSpeed;
		}

		if(s === false && drag === true){
			s = this.options.smartSpeed;
		}

		if(s === 0){s=0;}

		if(this.support3d){
			var style = this.dom.stage.style;
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
		if(this.state.lazyContent){
			this.pos.goToLazyContent = pos;
		}
		this.updatePosition(pos);
		this.setSpeed(0);
		this.animStage(this.pos.items[this.pos.currentAbs]);
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
	 */

	Owl.prototype.goTo = function(pos,speed){
		if(this.state.lazyContent && this.state.inMotion){
			return false;
		}

		this.updatePosition(pos);

		if(this.state.animate){speed = 0;}
		this.setSpeed(speed,this.pos.currentAbs);

		if(this.state.animate){
			this.plugins.animate.swap();
		}
		this.animStage(this.pos.items[this.pos.currentAbs]);
	
	};

	/**
	 * next
	 * @since 2.0.0
	 */

	Owl.prototype.next = function(optionalSpeed){
		var s = optionalSpeed || this.options.navSpeed;
		if(this.options.loop && !this.state.lazyContent){
			this.goToLoop(this.options.slideBy, s);
		}else{
			this.goTo(this.pos.current + this.options.slideBy, s);
		}
	};

	/**
	 * prev
	 * @since 2.0.0
	 */

	Owl.prototype.prev = function(optionalSpeed){
		var s = optionalSpeed || this.options.navSpeed;
		if(this.options.loop && !this.state.lazyContent){
			this.goToLoop(-this.options.slideBy, s);
		}else{
			this.goTo(this.pos.current-this.options.slideBy, s);
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
			prevPosition = this.pos.currentAbs,
			newPosition = this.pos.currentAbs + distance,
			direction = prevPosition - newPosition < 0 ? true : false;

		this.state.revert = true;

		if(newPosition < this.options.items && direction === false){

			this.state.bypass = true;
			revert = this.num.items - (this.options.items-prevPosition) - this.options.items;
			this.jumpTo(revert,true);

		} else if(newPosition >= this.num.items - this.options.items && direction === true ){

			this.state.bypass = true;
			revert = prevPosition - this.num.oItems;
			this.jumpTo(revert,true);

		}
		window.clearTimeout(this.e._goToLoop);
		this.e._goToLoop = window.setTimeout(function(){
			this.state.bypass = false;
			this.goTo(revert + distance, speed);
			this.state.revert = false;

		}.bind(this), 30);
	};

	/**
	 * initPosition
	 * @since 2.0.0
	 */

	Owl.prototype.initPosition = function(init){

		if( !this.dom.$oItems || !init || this.state.lazyContent ){return false;}
		var pos = this.options.startPosition;

		if(this.options.startPosition === 'URLHash'){
			pos = this.options.startPosition = this.hashPosition();
		} else if(typeof this.options.startPosition !== Number && !this.options.center){
			this.options.startPosition = 0;
		}
		this.dom.oStage.scrollLeft = 0;
		this.jumpTo(pos,true);
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
		this.dom.oStage.scrollLeft = 0;
		this.goTo(pos,this.options.navSpeed);
	};

	/**
	 * hashPosition
	 * @desc Find hash in URL then look into items to find contained ID
	 * @since 2.0.0
	 * return hashPos - number of item
	 */

	Owl.prototype.hashPosition = function(){
		var hash = window.location.hash.substring(1),
			hashPos;
		if(hash === ""){return false;}

		for(var i=0;i<this.num.oItems; i++){
			if(hash === this.dom.$oItems.eq(i).data('owl-item').hash){
				hashPos = i;
			}
		}
		return hashPos;
	};

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
		if(document.hidden === true){return false;}

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

			// Catch only owl-stage transitionEnd event
			var eventTarget = event.target || event.srcElement || event.originalTarget;
			if(eventTarget !== this.dom.stage){ 
				return false;
			}
		}

		this.state.inMotion = false;
		this.updateItemState();
		this.autoplay();
		this.fireCallback('onTransitionEnd');
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
	 * @desc Calls controls container, navigation and dots creator
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

		if(this.dom.$cc === null && (this.options.nav || this.options.dots)){
			if(!this.options.navContainer || !this.options.dotsContainer){
				this.controls();
			}
		}

		if(this.dom.$nav === null && this.options.nav){
			this.createNavigation();
		}
		
		if(this.dom.$page === null && this.options.dots){
			this.createDots();
		}

		if(this.dom.$nav !== null){
			if(this.options.nav){
				this.dom.$nav.show();
				this.updateNavigation();
			} else {
				this.dom.$nav.hide();
			}
		}

		if(this.dom.$page !== null){
			if(this.options.dots){
				this.dom.$page.show();
				this.updateDots();
			} else {
				this.dom.$page.hide();
			}
		}
	};

	/**
	 * createNavigation
	 * @since 2.0.0
	 */

	Owl.prototype.createNavigation = function(){

		var cc = this.options.navContainer ? $(this.options.navContainer).get(0) : this.dom.$cc.get(0);

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
		//this.on(navPrev, this.dragType[2], this.e._navPrev, false);
		//this.on(navNext, this.dragType[2], this.e._navNext, false);

		//FF fix?
		this.dom.$nav.on(this.dragType[2], '.'+this.options.navClass[0], this.e._navPrev);
		this.dom.$nav.on(this.dragType[2], '.'+this.options.navClass[1], this.e._navNext);
	};

	/**
	 * createNavigation
	 * @since 2.0.0
	 * @param [cc] - dom element - Controls Container
	 */

	Owl.prototype.createDots = function(){

		var cc = this.options.dotsContainer ? $(this.options.dotsContainer).get(0) : this.dom.$cc.get(0);

		// Create dots container
		var page = document.createElement('div');
		page.className = this.options.dotsClass;
		cc.appendChild(page);

		// save reference
		this.dom.$page = $(page);

		// add events
		//this.on(page, this.dragType[2], this.e._goToPage, false);

		// FF fix? To test!
		var that = this;
		this.dom.$page.on(this.dragType[2], '.'+this.options.dotClass, goToPage);

		function goToPage(e){
			e.preventDefault();
			var page = $(this).data('page');
			that.goTo(page,that.options.dotsSpeed);
		}
		// build dots
		this.rebuildDots();
	};

	/**
	 * rebuildDots
	 * @since 2.0.0
	 */

	Owl.prototype.rebuildDots = function(){
		if(this.dom.$page === null){return false;}
		var each, dot, span, counter = 0, last = 0, i, page=0, roundPages = 0;

		each = this.options.dotsEach || this.options.items;

		// display full dots if center
		if(this.options.center || this.options.dotData){
			each = 1;
		}

		// clear dots
		this.dom.$page.html('');

		for(i = 0; i < this.num.nav.length; i++){

			if(counter >= each || counter === 0){

				dot = document.createElement('div');
				dot.className = this.options.dotClass;
				span = document.createElement('span');
				dot.appendChild(span);
				var $dot = $(dot);

				if(this.options.dotData){
					$dot.html(this.dom.$oItems.eq(i).data('owl-item').dot);
				}

				$dot.data('page',page);
				$dot.data('goToPage',roundPages);

				this.dom.$page.append(dot);

				counter = 0;
				roundPages++;
			}

			this.dom.$oItems.eq(i).data('owl-item').page = roundPages-1;

			//add merged items
			counter += this.num.nav[i];
			page++;
		}
		// find rest of dots
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
	 * updateDots
	 * @since 2.0.0
	 */

	Owl.prototype.updateDots = function(){
		var dots = this.dom.$page.children();
		var itemIndex = this.dom.$oItems.eq(this.pos.current).data('owl-item').page;
		
		for(var i = 0; i < dots.length; i++){
			var dotPage = dots.eq(i).data('goToPage');

			if(dotPage===itemIndex){
				this.pos.currentPage = i;
				dots.eq(i).addClass('active');
			}else{
				dots.eq(i).removeClass('active');
			}
		}
	};

	/**
	 * updateNavigation
	 * @since 2.0.0
	 */

	Owl.prototype.updateNavigation = function(){

		var isNav = this.options.nav;

		this.dom.$navNext.toggleClass('disabled',!isNav);
		this.dom.$navPrev.toggleClass('disabled',!isNav);

		if(!this.options.loop && isNav && !this.options.navRewind){

			if(this.pos.current <= 0){
				this.dom.$navPrev.addClass('disabled');
			} 
			if(this.pos.current >= this.pos.max){
				this.dom.$navNext.addClass('disabled');
			}
		}
	};

	Owl.prototype.insertContent = function(content){
		this.dom.$stage.empty();
		this.fetchContent(content);
		this.refresh();
	};

	/**
	 * addItem - Add an item
	 * @since 2.0.0
	 * @param [content] - dom element / string '<div>content</div>'
	 * @param [pos] - number - position
	 */

	Owl.prototype.addItem = function(content,pos){
		pos = pos || 0;

		if(this.state.lazyContent){
			this.dom.$content = this.dom.$content.add($(content));
			this.updateItemState(true);
		} else {
			// wrap content
			var item = this.fillItem(content);
			// if carousel is empty then append item
			if(this.dom.$oItems.length === 0){
				this.dom.$stage.append(item);
			} else {
				// append item
				var it = this.dom.$oItems.eq(pos);
				if(pos !== -1){it.before(item);} else {it.after(item);}
			}
			// update and calculate carousel
			this.refresh();
		}

	};

	/**
	 * removeItem - Remove an Item
	 * @since 2.0.0
	 * @param [pos] - number - position
	 */

	Owl.prototype.removeItem = function(pos){
		if(this.state.lazyContent){
			this.dom.$content.splice(pos,1);
			this.updateItemState(true);
		} else {
			this.dom.$oItems.eq(pos).remove();
			this.refresh();
		}
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
		this.e.destroy = function(e){this.destroy();		}.bind(this);
		this.e.stop = function(){this.stop();				}.bind(this);
		this.e.play = function(e,t,s){this.play(t,s);		}.bind(this);
		this.e.insertContent = function(e,d){this.insertContent(d);	}.bind(this);

		this.dom.$el.on('next.owl',this.e.next);
		this.dom.$el.on('prev.owl',this.e.prev);
		this.dom.$el.on('goTo.owl',this.e.goTo);
		this.dom.$el.on('jumpTo.owl',this.e.jumpTo);
		this.dom.$el.on('addItem.owl',this.e.addItem);
		this.dom.$el.on('removeItem.owl',this.e.removeItem);
		this.dom.$el.on('destroy.owl',this.e.destroy);
		this.dom.$el.on('refresh.owl',this.e.refresh);
		this.dom.$el.on('play.owl',this.e.play);
		this.dom.$el.on('stop.owl',this.e.stop);
		this.dom.$el.on('insertContent.owl',this.e.insertContent);
	
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

		if (typeof this.options[event] === 'function') {
			this.options[event].apply(this,[this.dom.el,this.info,event]);
		}

		if(this.dom.el.dispatchEvent){

			// dispatch event
			var evt = document.createEvent('CustomEvent');

			//evt.initEvent(event, false, true );
			evt.initCustomEvent(event, true, true, data);
			return this.dom.el.dispatchEvent(evt);

		} else if (!this.dom.el.dispatchEvent){

			//	There is no clean solution for custom events name in <=IE8 
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

		// test on zepto
		if(!isElVisible(this.dom.el)) {
			this.dom.$el.addClass('owl-hidden');
			window.clearInterval(this.e._checkVisibile);
			this.e._checkVisibile = window.setInterval(checkVisible.bind(this),500);
		}

		function isElVisible(el) {
		    return el.offsetWidth > 0 && el.offsetHeight > 0;
		}

		function checkVisible(){
			if (isElVisible(this.dom.el)) {
				this.dom.$el.removeClass('owl-hidden');
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
		
		var event = $.Event('change.owl.carousel');
		this.dom.$el.trigger(event)
		if (event.isDefaultPrevented()) return false;
		
		if(!this.state.isTouch && !this.state.bypass && !this.state.responsive ){
			
			if(this.options.nav || this.options.dots) {
				this.updateControls();
			}

			if(this.plugins.autoHeight){
				this.plugins.autoHeight.setHeight();
			}
		}

		if(!this.state.isTouch && !this.state.bypass){
			
			if(!this.state.lazyContent){
				this.updateActiveItems();
			}

			// set Status to do
			this.storeInfo();
		}
		
		this.dom.$el.trigger('changed.owl.carousel');
	};

	/**
	 * storeInfo
	 * store basic information about current states
	 * @since 2.0.0
	 */

	Owl.prototype.storeInfo = function(){
		var currentPosition = this.state.lazyContent ? this.pos.lcCurrentAbs || 0 : this.pos.current;
		var allItems = this.state.lazyContent ? this.dom.$content.length-1 : this.num.oItems;
		
		this.info = {	
			items: 			this.options.items,
			allItems:		allItems,
			currentPosition:currentPosition,
			currentPage:	this.pos.currentPage,
			allPages:		this.num.allPages,
			autoplay:		this.state.autoplay,
			windowWidth:	this.width.window,
			elWidth:		this.width.el,
			breakpoint:		this.num.breakpoint
		};

		if (typeof this.options.info === 'function') {
			this.options.info.apply(this,[this.info,this.dom.el]);
		}
	};

	/**
	 * preloadAutoWidthImages
	 * @desc still to test
	 * @since 2.0.0
	 */

	Owl.prototype.preloadAutoWidthImages = function(imgs){
		var loaded = 0;
		var that = this;
		imgs.each(function(i,el){
			var $el = $(el);
			var img = new Image();

			img.onload = function(){
				loaded++;
				$el.attr('src',img.src);
				$el.css('opacity',1);
				if(loaded >= imgs.length){
					that.state.imagesLoaded = true;
					that.init();
				}
			}

			img.src = $el.attr('src') ||  $el.attr('data-src') || $el.attr('data-src-retina');;
		})
	};

	/**
	 * destroy
	 * @desc Remove Owl structure and events :(
	 * @since 2.0.0
	 */

	Owl.prototype.destroy = function(){

		window.clearInterval(this.e._autoplay);

		if(this.dom.$el.hasClass(this.options.themeClass)){
			this.dom.$el.removeClass(this.options.themeClass);
		}

		if(this.options.responsive !== false){
			this.off(window, 'resize', this.e._resizer);
		}

		if(this.transitionEndVendor){
			this.off(this.dom.stage, this.transitionEndVendor, this.e._transitionEnd);
		}

		for (var i in this.plugins) {
            this.plugins[i].destroy();
        }

		if(this.options.mouseDrag || this.options.touchDrag){
			this.off(this.dom.stage, this.dragType[0], this.e._onDragStart);
			if(this.options.mouseDrag){
				this.off(document, this.dragType[3], this.e._onDragStart);
			}
			if(this.options.mouseDrag){
				this.dom.$stage.off('dragstart', function() {return false;});
				this.dom.stage.onselectstart = function(){};
			}
		}

		if(this.options.URLhashListener){
			this.off(window, 'hashchange', this.e._goToHash);
		}

		this.dom.$el.off('next.owl',this.e.next);
		this.dom.$el.off('prev.owl',this.e.prev);
		this.dom.$el.off('goTo.owl',this.e.goTo);
		this.dom.$el.off('jumpTo.owl',this.e.jumpTo);
		this.dom.$el.off('addItem.owl',this.e.addItem);
		this.dom.$el.off('removeItem.owl',this.e.removeItem);
		this.dom.$el.off('refresh.owl',this.e.refresh);
		this.dom.$el.off('play.owl',this.e.play);
		this.dom.$el.off('stop.owl',this.e.stop);
		this.dom.$stage.off('click',this.e._playVideo);

		if(this.dom.$cc !== null){
			this.dom.$cc.remove();
		}
		if(this.dom.$cItems !== null){
			this.dom.$cItems.remove();
		}
		this.e = null;
		this.dom.$el.data('owlCarousel',null);
		delete this.dom.el.owlCarousel;

		this.dom.$stage.unwrap();
		this.dom.$items.unwrap();
		this.dom.$items.contents().unwrap();
		this.dom = null;
	};

	/**
	 * Opertators 
	 * @desc Used to calculate RTL
	 * @param [a] - Number - left side
	 * @param [o] - String - operator 
	 * @param [b] - Number - right side
	 * @since 2.0.0
	 */

	Owl.prototype.op = function(a,o,b){
		var rtl = this.options.rtl;
		switch(o) {
			case '<':
				return rtl ? a > b : a < b;
			case '>':
				return rtl ? a < b : a > b;
			case '>=':
				return rtl ? a <= b : a >= b;
			case '<=':
				return rtl ? a >= b : a <= b;
			default:
				break;
		}
	};

	/**
	 * Opertators 
	 * @desc Used to calculate RTL
	 * @since 2.0.0
	 */

	Owl.prototype.browserSupport = function(){
		this.support3d = isPerspective();

		if(this.support3d){
			this.transformVendor = isTransform();

			// take transitionend event name by detecting transition
			var endVendors = ['transitionend','webkitTransitionEnd','transitionend','oTransitionEnd'];
			this.transitionEndVendor = endVendors[isTransition()];

			// take vendor name from transform name
			this.vendorName = this.transformVendor.replace(/Transform/i,'');
			this.vendorName = this.vendorName !== '' ? '-'+this.vendorName.toLowerCase()+'-' : '';
		}

		this.state.orientation = window.orientation;
	};

	// Pivate methods 

	// CSS detection;
	function isStyleSupported(array){
		var p,s,fake = document.createElement('div'),list = array;
		for(p in list){
			s = list[p]; 
			if(typeof fake.style[s] !== 'undefined'){
				fake = null;
				return [s,p];
			}
		}
		return [false];
	}

	function isTransition(){
		return isStyleSupported(['transition','WebkitTransition','MozTransition','OTransition'])[1];
	}
 
	function isTransform() {
		return isStyleSupported(['transform','WebkitTransform','MozTransform','OTransform','msTransform'])[0];
	}

	function isPerspective(){
		return isStyleSupported(['perspective','webkitPerspective','MozPerspective','OPerspective','MsPerspective'])[0];
	}

	function isTouchSupport(){
		return 'ontouchstart' in window || !!(navigator.msMaxTouchPoints);
	}

	function isTouchSupportIE(){
		return window.navigator.msPointerEnabled;
	}

	function isRetina(){
		return window.devicePixelRatio > 1;
	}

	$.fn.owlCarousel = function ( options ) {
		return this.each(function () {
			if (!$(this).data('owlCarousel')) {
				$(this).data( 'owlCarousel',
				new Owl( this, options ));
			}
		});

	};

	$.fn.owlCarousel.Constructor = Owl

})( window.Zepto || window.jQuery, window,  document );

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
//The bind() method creates a new function that, when called, has its this keyword set to the provided value, with a given sequence of arguments preceding any provided when the new function is called.

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
	if (typeof this !== 'function') {
		// closest thing possible to the ECMAScript 5 internal IsCallable function
		throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
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