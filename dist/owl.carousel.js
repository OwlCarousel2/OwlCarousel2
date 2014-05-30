/**
 * Owl Carousel
 * 
 * @todo Lazy Load Icon
 * @todo prevent animationend bubling
 * @todo itemsScaleUp
 * @todo Test Zepto
 */
;(function($, window, document, undefined) {

	var defaults = {
		items: 3,
		loop: false,
		center: false,

		mouseDrag: true,
		touchDrag: true,
		pullDrag: true,
		freeDrag: false,

		margin: 0,
		stagePadding: 0,

		merge: false,
		mergeFit: true,
		autoWidth: false,

		startPosition: 0,
		URLhashListener: false,

		nav: false,
		navRewind: true,
		navText: [ 'prev', 'next' ],
		slideBy: 1,
		dots: true,
		dotsEach: false,
		dotData: false,

		smartSpeed: 250,
		fluidSpeed: false,
		navSpeed: false,
		dotsSpeed: false,
		dragEndSpeed: false,

		responsive: {},
		responsiveRefreshRate: 200,
		responsiveBaseElement: window,
		responsiveClass: false,

		fallbackEasing: 'swing',

		info: false,

		nestedItemSelector: false,
		itemElement: 'div',
		stageElement: 'div',
		navElement: 'div',

		navContainer: false,
		dotsContainer: false,

		// Classes and Names
		themeClass: 'owl-theme',
		baseClass: 'owl-carousel',
		itemClass: 'owl-item',
		centerClass: 'center',
		activeClass: 'active',
		navContainerClass: 'owl-nav',
		navClass: [ 'owl-prev', 'owl-next' ],
		controlsClass: 'owl-controls',
		dotClass: 'owl-dot',
		dotsClass: 'owl-dots'

	};

	// Each item has following data:

	var item = {
		index: false,
		indexAbs: false,
		posLeft: false,
		clone: false,
		active: false,
		loaded: false,
		lazyLoad: false,
		current: false,
		width: false,
		center: false,
		page: false,
		hasVideo: false,
		playVideo: false
	};

	// Reference to DOM elements
	// Those with $ sign are jQuery objects

	var dom = {
		el: null, // main element
		$el: null, // jQuery main element
		stage: null, // stage
		$stage: null, // jQuery stage
		oStage: null, // outer stage
		$oStage: null, // $ outer stage
		$items: null, // all items, clones and originals included
		$oItems: null, // original items
		$cItems: null, // cloned items only
		$cc: null,
		$navPrev: null,
		$navNext: null,
		$page: null,
		$nav: null,
		$content: null
	};

	/**
	 * Variables
	 * 
	 * @since 2.0.0
	 */
	// Only for development process
	// Widths
	var width = {
		el: 0,
		stage: 0,
		item: 0,
		prevWindow: 0,
		cloneLast: 0
	};

	// Numbers

	var num = {
		items: 0,
		oItems: 0,
		cItems: 0,
		active: 0,
		merged: [],
		nav: [],
		allPages: 0
	};

	// Positions

	var pos = {
		start: 0,
		max: 0,
		maxValue: 0,
		prev: 0,
		current: 0,
		currentAbs: 0,
		currentPage: 0,
		stage: 0,
		items: [],
		lsCurrent: 0
	};

	// Drag/Touches

	var drag = {
		start: 0,
		startX: 0,
		startY: 0,
		current: 0,
		currentX: 0,
		currentY: 0,
		offsetX: 0,
		offsetY: 0,
		distance: null,
		startTime: 0,
		endTime: 0,
		updatedX: 0,
		targetEl: null
	};

	// Speeds

	var speed = {
		onDragEnd: 300,
		nav: 300,
		css2speed: 0

	};

	// States

	var state = {
		isTouch: false,
		isScrolling: false,
		isSwiping: false,
		direction: false,
		inMotion: false
	};

	// Event functions references

	var e = {
		_onDragStart: null,
		_onDragMove: null,
		_onDragEnd: null,
		_transitionEnd: null,
		_resizer: null,
		_responsiveCall: null,
		_goToLoop: null,
		_checkVisibile: null
	};

	function Owl(element, options) {

		// add basic Owl information to dom element

		element.owlCarousel = {
			'name': 'Owl Carousel',
			'author': 'Bartosz Wojciechowski',
			'version': '2.0.0-beta.2.1'
		};

		// Attach variables to object
		// Only for development process

		this.options = $.extend({}, defaults, options);
		this._options = $.extend({}, defaults, this.options);
		this.itemData = $.extend({}, item);

		this.dom = $.extend({}, dom);
		this.width = $.extend({}, width);
		this.num = $.extend({}, num);
		this.pos = $.extend({}, pos);
		this.drag = $.extend({}, drag);
		this.speed = $.extend({}, speed);
		this.state = $.extend({}, state);
		this.e = $.extend({}, e);

		this.dom.el = element;
		this.dom.$el = $(element);

		this.plugins = {};

		for ( var plugin in Owl.Plugins) {
			this.plugins[plugin] = new Owl.Plugins[plugin](this);
		}

		this.suppressedEvents = {};

		this.init();
	}

	Owl.Plugins = {};

	/**
	 * init
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.init = function() {

		this.trigger('initialize');

		// Add base class
		if (!this.dom.$el.hasClass(this.options.baseClass)) {
			this.dom.$el.addClass(this.options.baseClass);
		}

		// Add theme class
		if (!this.dom.$el.hasClass(this.options.themeClass)) {
			this.dom.$el.addClass(this.options.themeClass);
		}

		// Add theme class
		if (this.options.rtl) {
			this.dom.$el.addClass('owl-rtl');
		}

		// Check support
		this.browserSupport();

		// Sort responsive items in array
		this.sortOptions();

		// Update options.items on given size
		this.setResponsiveOptions();

		if (this.options.autoWidth && this.state.imagesLoaded !== true) {
			var imgs = this.dom.$el.find('img');
			var nestedSelector = this.options.nestedItemSelector ? '.' + this.options.nestedItemSelector : undefined;
			var width = this.dom.$el.children(nestedSelector).width();

			if (imgs.length && width <= 0) {
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
		this.addTriggerableEvents();

		// attach generic events
		this.internalEvents();

		this.dom.$el.addClass('owl-loading');
		this.refresh(true);
		this.dom.$el.removeClass('owl-loading').addClass('owl-loaded');

		this.trigger('initialized');
	};

	/**
	 * sortOptions
	 * 
	 * @desc Sort responsive sizes
	 * @since 2.0.0
	 */
	Owl.prototype.sortOptions = function() {

		var resOpt = this.options.responsive;
		this.responsiveSorted = {};
		var keys = [], i, j, k;
		for (i in resOpt) {
			keys.push(i);
		}

		keys = keys.sort(function(a, b) {
			return a - b;
		});

		for (j = 0; j < keys.length; j++) {
			k = keys[j];
			this.responsiveSorted[k] = resOpt[k];
		}

	};

	/**
	 * setResponsiveOptions
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.setResponsiveOptions = function() {
		if (this.options.responsive === false) {
			return false;
		}

		var width = this.windowWidth();
		var resOpt = this.options.responsive;
		var i, j, k, minWidth;

		// overwrite non resposnive options
		for (k in this._options) {
			if (k !== 'responsive') {
				this.options[k] = this._options[k];
			}
		}

		// find responsive width
		for (i in this.responsiveSorted) {
			if (i <= width) {
				minWidth = i;
				// set responsive options
				for (j in this.responsiveSorted[minWidth]) {
					this.options[j] = this.responsiveSorted[minWidth][j];
				}

			}
		}
		this.num.breakpoint = minWidth;

		// Responsive Class
		if (this.options.responsiveClass) {
			this.dom.$el.attr('class', function(i, c) {
				return c.replace(/\b owl-responsive-\S+/g, '');
			}).addClass('owl-responsive-' + minWidth);
		}
	};

	/**
	 * optionsLogic
	 * 
	 * @desc Update option logic if necessery
	 * @since 2.0.0
	 */
	Owl.prototype.optionsLogic = function() {
		// Toggle Center class
		this.dom.$el.toggleClass('owl-center', this.options.center);

		// Scroll per - 'page' option will scroll per visible items number
		// You can set this to any other number below visible items.
		if (this.options.slideBy && this.options.slideBy === 'page') {
			this.options.slideBy = this.options.items;
		} else if (this.options.slideBy > this.options.items) {
			this.options.slideBy = this.options.items;
		}

		// if items number is less than in body
		if (this.options.loop && this.num.oItems < this.options.items) {
			this.options.loop = false;
		}

		if (this.num.oItems <= this.options.items && !this.options.center) {
			this.options.navRewind = false;
		}

		if (this.options.autoWidth) {
			this.options.stagePadding = false;
			this.options.dotsEach = 1;
			this.options.merge = false;
		}
	};

	/**
	 * createStage
	 * 
	 * @desc Create stage and Outer-stage elements
	 * @since 2.0.0
	 */
	Owl.prototype.createStage = function() {
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
	 * 
	 * @desc Create item container
	 * @since 2.0.0
	 */
	Owl.prototype.createItem = function() {
		var item = document.createElement(this.options.itemElement);
		item.className = this.options.itemClass;
		return item;
	};

	/**
	 * fetchContent
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.fetchContent = function(extContent) {
		if (extContent) {
			this.dom.$content = (extContent instanceof jQuery) ? extContent : $(extContent);
		} else if (this.options.nestedItemSelector) {
			this.dom.$content = this.dom.$el.find('.' + this.options.nestedItemSelector).not('.owl-stage-outer');
		} else {
			this.dom.$content = this.dom.$el.children().not('.owl-stage-outer');
		}
		// content length
		this.num.oItems = this.dom.$content.length;

		// init Structure
		if (this.num.oItems !== 0) {
			this.initStructure();
		}
	};

	/**
	 * initStructure
	 * 
	 * @param [refresh] -
	 *            if refresh and not lazyContent then dont create normal
	 *            structure
	 * @since 2.0.0
	 */
	Owl.prototype.initStructure = function() {
		// create normal structure
		this.createNormalStructure();
	};

	/**
	 * createNormalStructure
	 * 
	 * @desc Create normal structure for small/mid weight content
	 * @since 2.0.0
	 */
	Owl.prototype.createNormalStructure = function() {
		for (var i = 0; i < this.num.oItems; i++) {
			// fill 'owl-item' with content
			var item = this.fillItem(this.dom.$content, i);
			// append into stage
			this.dom.$stage.append(item);
		}
		this.dom.$content = null;
	};

	/**
	 * createCustomStructure
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.createCustomStructure = function(howManyItems) {
		for (var i = 0; i < howManyItems; i++) {
			var emptyItem = this.createItem();
			var item = $(emptyItem);

			this.setData(item, false);
			this.dom.$stage.append(item);
		}
	};

	/**
	 * fillItem
	 * 
	 * @desc Fill empty item container with provided content
	 * @since 2.0.0
	 * @param [content] -
	 *            string/$dom - passed owl-item
	 * @param [i] -
	 *            index in jquery object return $ new object
	 */
	Owl.prototype.fillItem = function(content, i) {
		var emptyItem = this.createItem();
		var c = content[i] || content;
		// set item data
		var traversed = this.traversContent(c);
		this.setData(emptyItem, false, traversed);
		return $(emptyItem).append(c);
	};

	/**
	 * traversContent
	 * 
	 * @since 2.0.0
	 * @param [c] -
	 *            content return object
	 */
	Owl.prototype.traversContent = function(c) {
		var $c = $(c), dotValue, hashValue;
		if (this.options.dotData) {
			dotValue = $c.find('[data-dot]').andSelf().data('dot');
		}
		// update URL hash
		if (this.options.URLhashListener) {
			hashValue = $c.find('[data-hash]').andSelf().data('hash');
		}
		return {
			dot: dotValue || false,
			hash: hashValue || false
		};
	};

	/**
	 * setData
	 * 
	 * @desc Set item jQuery Data
	 * @since 2.0.0
	 * @param [item] -
	 *            dom - passed owl-item
	 * @param [cloneObj] -
	 *            $dom - passed clone item
	 */
	Owl.prototype.setData = function(item, cloneObj, traversed) {

		var data = this.itemData;

		if (traversed) {
			var travers = {
				dot: traversed.dot,
				hash: traversed.hash
			};
			data = $.extend({}, data, travers);
		}

		// copy data to cloned item
		if (cloneObj) {
			data = $.extend({}, data, cloneObj.data('owl-item'));
		}

		$(item).data('owl-item', data);
	};

	/**
	 * updateLocalContent
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.updateLocalContent = function() {
		this.dom.$oItems = this.dom.$stage.find('.' + this.options.itemClass).filter(function() {
			return $(this).data('owl-item').clone === false;
		});

		this.num.oItems = this.dom.$oItems.length;
		// update index on original items

		for (var k = 0; k < this.num.oItems; k++) {
			var item = this.dom.$oItems.eq(k);
			item.data('owl-item').index = k;
		}
	};

	/**
	 * loopClone
	 * 
	 * @desc Make a clones for infinity loop
	 * @since 2.0.0
	 */
	Owl.prototype.loopClone = function() {
		if (!this.options.loop || this.num.oItems < this.options.items) {
			return false;
		}

		var firstClone, lastClone, i, num = this.options.items, lastNum = this.num.oItems - 1;

		// if neighbour margin then add one more duplicat
		if (this.options.stagePadding && this.options.items === 1) {
			num += 1;
		}
		this.num.cItems = num * 2;

		for (i = 0; i < num; i++) {
			// Clone item
			var first = this.dom.$oItems.eq(i).clone(true, true);
			var last = this.dom.$oItems.eq(lastNum - i).clone(true, true);
			firstClone = $(first[0]).addClass('cloned');
			lastClone = $(last[0]).addClass('cloned');

			// set clone data
			// Somehow data has reference to same data id in cash

			this.setData(firstClone[0], first);
			this.setData(lastClone[0], last);

			firstClone.data('owl-item').clone = true;
			lastClone.data('owl-item').clone = true;

			this.dom.$stage.append(firstClone);
			this.dom.$stage.prepend(lastClone);

			firstClone = lastClone = null;
		}

		this.dom.$cItems = this.dom.$stage.find('.' + this.options.itemClass).filter(function() {
			return $(this).data('owl-item').clone === true;
		});
	};

	/**
	 * reClone
	 * 
	 * @desc Update Cloned elements
	 * @since 2.0.0
	 */
	Owl.prototype.reClone = function() {
		// remove cloned items
		if (this.dom.$cItems !== null) { // && (this.num.oItems !== 0 &&
			// this.num.oItems <=
			// this.options.items)){
			this.dom.$cItems.remove();
			this.dom.$cItems = null;
			this.num.cItems = 0;
		}

		if (!this.options.loop) {
			return;
		}
		// generete new elements
		this.loopClone();
	};

	/**
	 * calculate
	 * 
	 * @desc Update item index data
	 * @since 2.0.0
	 */
	Owl.prototype.calculate = function() {

		var i, j, k, dist, posLeft = 0, fullWidth = 0;

		// element width minus neighbour
		this.width.el = this.dom.$el.width() - (this.options.stagePadding * 2);

		// to check
		this.width.view = this.dom.$el.width();

		// calculate width minus addition margins
		var elMinusMargin = this.width.el
			- (this.options.margin * (this.options.items === 1 ? 0 : this.options.items - 1));

		// calculate element width and item width
		this.width.el = this.width.el + this.options.margin;
		this.width.item = ((elMinusMargin / this.options.items) + this.options.margin).toFixed(3);

		this.dom.$items = this.dom.$stage.find('.owl-item');
		this.num.items = this.dom.$items.length;

		// change to autoWidths
		if (this.options.autoWidth) {
			this.dom.$items.css('width', '');
		}

		// Set grid array
		this.pos.items = [];
		this.num.merged = [];
		this.num.nav = [];

		// item distances
		if (this.options.rtl) {
			dist = this.options.center ? -((this.width.el) / 2) : 0;
		} else {
			dist = this.options.center ? (this.width.el) / 2 : 0;
		}

		this.width.mergeStage = 0;

		// Calculate items positions
		for (i = 0; i < this.num.items; i++) {

			// check merged items

			if (this.options.merge) {
				var mergeNumber = this.dom.$items.eq(i).find('[data-merge]').attr('data-merge') || 1;
				if (this.options.mergeFit && mergeNumber > this.options.items) {
					mergeNumber = this.options.items;
				}
				this.num.merged.push(parseInt(mergeNumber));
				this.width.mergeStage += this.width.item * this.num.merged[i];
			} else {
				this.num.merged.push(1);
			}

			// Array based on merged items used by dots and navigation
			if (this.options.loop) {
				if (i >= this.num.cItems / 2 && i < this.num.cItems / 2 + this.num.oItems) {
					this.num.nav.push(this.num.merged[i]);
				}
			} else {
				this.num.nav.push(this.num.merged[i]);
			}

			var iWidth = this.width.item * this.num.merged[i];

			// autoWidth item size
			if (this.options.autoWidth) {
				iWidth = this.dom.$items.eq(i).width() + this.options.margin;
				if (this.options.rtl) {
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
			if (this.options.rtl) {
				dist += iWidth;
				posLeft += iWidth;
			} else {
				dist -= iWidth;
				posLeft -= iWidth;
			}

			fullWidth -= Math.abs(iWidth);

			// update position if center
			if (this.options.center) {
				this.pos.items[i] = !this.options.rtl ? this.pos.items[i] - (iWidth / 2) : this.pos.items[i]
					+ (iWidth / 2);
			}
		}

		if (this.options.autoWidth) {
			this.width.stage = this.options.center ? Math.abs(fullWidth) : Math.abs(dist);
		} else {
			this.width.stage = Math.abs(fullWidth);
		}

		// update indexAbs on all items
		var allItems = this.num.oItems + this.num.cItems;

		for (j = 0; j < allItems; j++) {
			this.dom.$items.eq(j).data('owl-item').indexAbs = j;
		}

		// Set Min and Max
		this.setMinMax();

		// Recalculate grid
		this.setSizes();
	};

	/**
	 * setMinMax
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.setMinMax = function() {

		// set Min
		var minimum = this.dom.$oItems.eq(0).data('owl-item').indexAbs;
		this.pos.min = 0;
		this.pos.minValue = this.pos.items[minimum];

		// set max position
		if (!this.options.loop) {
			this.pos.max = this.num.oItems - 1;
		}

		if (this.options.loop) {
			this.pos.max = this.num.oItems + this.options.items;
		}

		if (!this.options.loop && !this.options.center) {
			this.pos.max = this.num.oItems - this.options.items;
		}

		if (this.options.loop && this.options.center) {
			this.pos.max = this.num.oItems + this.options.items;
		}

		// set max value
		this.pos.maxValue = this.pos.items[this.pos.max];

		// Max for autoWidth content
		if ((!this.options.loop && !this.options.center && this.options.autoWidth)
			|| (this.options.merge && !this.options.center)) {
			var revert = this.options.rtl ? 1 : -1;
			for (i = 0; i < this.pos.items.length; i++) {
				if ((this.pos.items[i] * revert) < this.width.stage - this.width.el) {
					this.pos.max = i + 1;
				}
			}
			this.pos.maxValue = this.options.rtl ? this.width.stage - this.width.el
				: -(this.width.stage - this.width.el);
			this.pos.items[this.pos.max] = this.pos.maxValue;
		}

		// Set loop boundries
		if (this.options.center) {
			this.pos.loop = this.pos.items[0] - this.pos.items[this.num.oItems];
		} else {
			this.pos.loop = -this.pos.items[this.num.oItems];
		}

		// if is less items
		if (this.num.oItems < this.options.items && !this.options.center) {
			this.pos.max = 0;
			this.pos.maxValue = this.pos.items[0];
		}
	};

	/**
	 * setSizes
	 * 
	 * @desc Set sizes on elements (from collectData function)
	 * @since 2.0.0
	 */
	Owl.prototype.setSizes = function() {

		// show neighbours
		if (this.options.stagePadding !== false) {
			this.dom.oStage.style.paddingLeft = this.options.stagePadding + 'px';
			this.dom.oStage.style.paddingRight = this.options.stagePadding + 'px';
		}

		// CRAZY FIX!!! Doublecheck this!
		// if(this.width.stagePrev > this.width.stage){
		if (this.options.rtl) {
			window.setTimeout(function() {
				this.dom.stage.style.width = this.width.stage + 'px';
			}.bind(this), 0);
		} else {
			this.dom.stage.style.width = this.width.stage + 'px';
		}

		for (var i = 0; i < this.num.items; i++) {

			// Set items width
			if (!this.options.autoWidth) {
				this.dom.$items[i].style.width = this.width.item - (this.options.margin) + 'px';
			}
			// add margin
			if (this.options.rtl) {
				this.dom.$items[i].style.marginLeft = this.options.margin + 'px';
			} else {
				this.dom.$items[i].style.marginRight = this.options.margin + 'px';
			}

			if (this.num.merged[i] !== 1 && !this.options.autoWidth) {
				this.dom.$items[i].style.width = (this.width.item * this.num.merged[i]) - (this.options.margin) + 'px';
			}
		}

		// save prev stage size
		this.width.stagePrev = this.width.stage;
	};

	/**
	 * responsive
	 * 
	 * @desc Responsive function update all data by calling refresh()
	 * @since 2.0.0
	 */
	Owl.prototype.responsive = function() {

		if (!this.num.oItems) {
			return false;
		}
		// If El width hasnt change then stop responsive
		var elChanged = this.isElWidthChanged();
		if (!elChanged) {
			return false;
		}

		if (this.trigger('resize').isDefaultPrevented()) {
			return false;
		}

		this.state.responsive = true;
		this.refresh();
		this.state.responsive = false;

		this.trigger('resized');
	};

	/**
	 * refresh
	 * 
	 * @desc Refresh method is basically collection of functions that are
	 *       responsible for Owl responsive functionality
	 * @since 2.0.0
	 */
	Owl.prototype.refresh = function(init) {

		this.trigger('refresh');

		// Update Options for given width
		this.setResponsiveOptions();

		// update info about local content
		this.updateLocalContent();

		// udpate options
		this.optionsLogic();

		// if no items then stop
		if (this.num.oItems === 0) {
			if (this.dom.$page !== null) {
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

		// aaaand show.
		this.dom.$stage.removeClass('owl-refresh');

		this.initPosition(init);

		// jump to last position
		if (!init) {
			this.jumpTo(this.pos.current, false); // fix that
		}

		this.updateItemState();

		// Update controls
		this.rebuildDots();

		this.updateControls();

		this.state.orientation = window.orientation;

		this.watchVisibility();

		this.trigger('refreshed');
	};

	/**
	 * updateItemState
	 * 
	 * @desc Update information about current state of items (visibile, hidden,
	 *       active, etc.)
	 * @since 2.0.0
	 */
	Owl.prototype.updateItemState = function(update) {

		this.trigger('update');

		if (this.options.center) {
			this.dom.$items.eq(this.pos.currentAbs).addClass(this.options.centerClass).data('owl-item').center = true;
		}

		this.trigger('updated');
	};

	/**
	 * updateActiveItems
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.updateActiveItems = function() {
		var i, j, item, ipos, iwidth, wpos, stage, outsideView, foundCurrent;
		// clear states
		for (i = 0; i < this.num.items; i++) {
			this.dom.$items.eq(i).data('owl-item').active = false;
			this.dom.$items.eq(i).data('owl-item').current = false;
			this.dom.$items.eq(i).removeClass(this.options.activeClass).removeClass(this.options.centerClass);
		}

		this.num.active = 0;
		stageX = this.pos.stage;
		view = this.options.rtl ? this.width.view : -this.width.view;

		for (j = 0; j < this.num.items; j++) {

			item = this.dom.$items.eq(j);
			ipos = item.data('owl-item').posLeft;
			iwidth = item.data('owl-item').width;
			outsideView = this.options.rtl ? ipos + iwidth : ipos - iwidth;

			if ((this.op(ipos, '<=', stageX) && (this.op(ipos, '>', stageX + view)))
				|| (this.op(outsideView, '<', stageX) && this.op(outsideView, '>', stageX + view))) {

				this.num.active++;

				if (this.options.freeDrag && !foundCurrent) {
					foundCurrent = true;
					this.pos.current = item.data('owl-item').index;
					this.pos.currentAbs = item.data('owl-item').indexAbs;
				}

				item.data('owl-item').active = true;
				item.data('owl-item').current = true;
				item.addClass(this.options.activeClass);

				if (!this.options.lazyLoad) {
					item.data('owl-item').loaded = true;
				}
				if (this.options.loop) {
					this.updateClonedItemsState(item.data('owl-item').index);
				}
			}
		}
	};

	/**
	 * updateClonedItemsState
	 * 
	 * @desc Set current state on sibilings items for lazyLoad and center
	 * @since 2.0.0
	 */
	Owl.prototype.updateClonedItemsState = function(activeIndex) {

		// find cloned center
		var center, $el, i;
		if (this.options.center) {
			center = this.dom.$items.eq(this.pos.currentAbs).data('owl-item').index;
		}

		for (i = 0; i < this.num.items; i++) {
			$el = this.dom.$items.eq(i);
			if ($el.data('owl-item').index === activeIndex) {
				$el.data('owl-item').current = true;
				if ($el.data('owl-item').index === center) {
					$el.addClass(this.options.centerClass);
				}
			}
		}
	};

	/**
	 * eventsCall
	 * 
	 * @desc Save internal event references and add event based functions like
	 *       transitionEnd,responsive etc.
	 * @since 2.0.0
	 */
	Owl.prototype.eventsCall = function() {
		// Save events references
		this.e._onDragStart = function(e) {
			this.onDragStart(e);
		}.bind(this);
		this.e._onDragMove = function(e) {
			this.onDragMove(e);
		}.bind(this);
		this.e._onDragEnd = function(e) {
			this.onDragEnd(e);
		}.bind(this);
		this.e._transitionEnd = function(e) {
			this.transitionEnd(e);
		}.bind(this);
		this.e._resizer = function() {
			this.responsiveTimer();
		}.bind(this);
		this.e._responsiveCall = function() {
			this.responsive();
		}.bind(this);
		this.e._preventClick = function(e) {
			this.preventClick(e);
		}.bind(this);
		this.e._goToHash = function() {
			this.goToHash();
		}.bind(this);
		this.e._goToPage = function(e) {
			this.goToPage(e);
		}.bind(this);

		this.e._navNext = function(e) {
			if ($(e.target).hasClass('disabled')) {
				return false;
			}
			e.preventDefault();
			this.next();
		}.bind(this);

		this.e._navPrev = function(e) {
			if ($(e.target).hasClass('disabled')) {
				return false;
			}
			e.preventDefault();
			this.prev();
		}.bind(this);

	};

	/**
	 * responsiveTimer
	 * 
	 * @desc Check Window resize event with 200ms delay /
	 *       this.options.responsiveRefreshRate
	 * @since 2.0.0
	 */
	Owl.prototype.responsiveTimer = function() {
		if (this.windowWidth() === this.width.prevWindow) {
			return false;
		}
		window.clearTimeout(this.resizeTimer);

		this.resizeTimer = window.setTimeout(this.e._responsiveCall, this.options.responsiveRefreshRate);
		this.width.prevWindow = this.windowWidth();
	};

	/**
	 * internalEvents
	 * 
	 * @desc Checks for touch/mouse drag options and add necessery event
	 *       handlers.
	 * @since 2.0.0
	 */
	Owl.prototype.internalEvents = function() {
		var isTouch = isTouchSupport();
		var isTouchIE = isTouchSupportIE();

		if (isTouch && !isTouchIE) {
			this.dragType = [ 'touchstart', 'touchmove', 'touchend', 'touchcancel' ];
		} else if (isTouch && isTouchIE) {
			this.dragType = [ 'MSPointerDown', 'MSPointerMove', 'MSPointerUp', 'MSPointerCancel' ];
		} else {
			this.dragType = [ 'mousedown', 'mousemove', 'mouseup' ];
		}

		if ((isTouch || isTouchIE) && this.options.touchDrag) {
			// touch cancel event
			this.on(document, this.dragType[3], this.e._onDragEnd);

		} else {
			// firefox startdrag fix - addeventlistener doesnt work here :/
			this.dom.$stage.on('dragstart', function() {
				return false;
			});

			if (this.options.mouseDrag) {
				// disable text select
				this.dom.stage.onselectstart = function() {
					return false;
				};
			} else {
				// enable text select
				this.dom.$el.addClass('owl-text-select-on');
			}
		}

		if (this.options.URLhashListener) {
			this.on(window, 'hashchange', this.e._goToHash, false);
		}

		// Catch transitionEnd event
		if (this.transitionEndVendor) {
			this.on(this.dom.stage, this.transitionEndVendor, this.e._transitionEnd, false);
		}

		// Responsive
		if (this.options.responsive !== false) {
			this.on(window, 'resize', this.e._resizer, false);
		}

		this.dragEvents();
	};

	/**
	 * dragEvents
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.dragEvents = function() {

		if (this.options.touchDrag && (this.dragType[0] === 'touchstart' || this.dragType[0] === 'MSPointerDown')) {
			this.on(this.dom.stage, this.dragType[0], this.e._onDragStart, false);
		} else if (this.options.mouseDrag && this.dragType[0] === 'mousedown') {
			this.on(this.dom.stage, this.dragType[0], this.e._onDragStart, false);
		} else {
			this.off(this.dom.stage, this.dragType[0], this.e._onDragStart);
		}
	};

	/**
	 * onDragStart
	 * 
	 * @desc touchstart/mousedown event
	 * @since 2.0.0
	 */
	Owl.prototype.onDragStart = function(event) {
		var ev = event.originalEvent || event || window.event;
		// prevent right click
		if (ev.which === 3) {
			return false;
		}

		if (this.dragType[0] === 'mousedown') {
			this.dom.$stage.addClass('owl-grab');
		}

		this.trigger('drag');
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

		// get stage position left
		this.drag.offsetX = this.dom.$stage.position().left - this.options.stagePadding;
		this.drag.offsetY = this.dom.$stage.position().top;

		if (this.options.rtl) {
			this.drag.offsetX = this.dom.$stage.position().left + this.width.stage - this.width.el
				+ this.options.margin;
		}

		// catch position // ie to fix
		if (this.state.inMotion && this.support3d) {
			var animatedPos = this.getTransformProperty();
			this.drag.offsetX = animatedPos;
			this.animStage(animatedPos);
		} else if (this.state.inMotion && !this.support3d) {
			this.state.inMotion = false;
			return false;
		}

		this.drag.startX = pageX - this.drag.offsetX;
		this.drag.startY = pageY - this.drag.offsetY;

		this.drag.start = pageX - this.drag.startX;
		this.drag.targetEl = ev.target || ev.srcElement;
		this.drag.updatedX = this.drag.start;

		// to do/check
		// prevent links and images dragging;
		if (this.drag.targetEl.tagName === "IMG" || this.drag.targetEl.tagName === "A") {
			this.drag.targetEl.draggable = false;
		}

		this.on(document, this.dragType[1], this.e._onDragMove, false);
		this.on(document, this.dragType[2], this.e._onDragEnd, false);
	};

	/**
	 * onDragMove
	 * 
	 * @desc touchmove/mousemove event
	 * @since 2.0.0
	 */
	Owl.prototype.onDragMove = function(event) {
		if (!this.state.isTouch) {
			return;
		}

		if (this.state.isScrolling) {
			return;
		}

		var neighbourItemWidth = 0;
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
		} else if (this.drag.distance > 0) {
			this.state.direction = this.options.rtl ? 'left' : 'right';
		}
		// Loop
		if (this.options.loop) {
			if (this.op(this.drag.currentX, '>', this.pos.minValue) && this.state.direction === 'right') {
				this.drag.currentX -= this.pos.loop;
			} else if (this.op(this.drag.currentX, '<', this.pos.maxValue) && this.state.direction === 'left') {
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
	 * 
	 * @desc touchend/mouseup event
	 * @since 2.0.0
	 */
	Owl.prototype.onDragEnd = function(event) {
		if (!this.state.isTouch) {
			return;
		}
		if (this.dragType[0] === 'mousedown') {
			this.dom.$stage.removeClass('owl-grab');
		}

		this.trigger('dragged');

		// prevent links and images dragging;
		this.drag.targetEl.removeAttribute("draggable");

		// remove drag event listeners

		this.state.isTouch = false;
		this.state.isScrolling = false;
		this.state.isSwiping = false;

		// to check
		if (this.drag.distance === 0 && this.state.inMotion !== true) {
			this.state.inMotion = false;
			return false;
		}

		// prevent clicks while scrolling

		this.drag.endTime = new Date().getTime();
		var compareTimes = this.drag.endTime - this.drag.startTime;
		var distanceAbs = Math.abs(this.drag.distance);

		// to test
		if (distanceAbs > 3 || compareTimes > 300) {
			this.removeClick(this.drag.targetEl);
		}

		var closest = this.closest(this.drag.updatedX);
		var closestPos = this.pos.items[closest];

		// trigger "moved" event when item is changed
		if (closestPos !== this.drag.start) {
			this.trigger('moved');
		}

		this.setSpeed(this.options.dragEndSpeed, false, true);
		this.animStage(closestPos);

		// if pullDrag is off then fire transitionEnd event manually when stick
		// to border
		if (!this.options.pullDrag && this.drag.updatedX === this.pos.items[closest]) {
			this.transitionEnd();
		}

		this.drag.distance = 0;

		this.off(document, this.dragType[1], this.e._onDragMove);
		this.off(document, this.dragType[2], this.e._onDragEnd);
	};

	/**
	 * removeClick
	 * 
	 * @desc Attach preventClick function to disable link while swipping
	 * @since 2.0.0
	 * @param [target] -
	 *            clicked dom element
	 */
	Owl.prototype.removeClick = function(target) {
		this.drag.targetEl = target;
		$(target).on('click.preventClick', this.e._preventClick);
		// to make sure click is removed:
		window.setTimeout(function() {
			$(target).off('click.preventClick');
		}, 300);
	};

	/**
	 * preventClick
	 * 
	 * @desc Add preventDefault for any link and then remove removeClick event
	 *       hanlder
	 * @since 2.0.0
	 */
	Owl.prototype.preventClick = function(ev) {
		if (ev.preventDefault) {
			ev.preventDefault();
		} else {
			ev.returnValue = false;
		}
		if (ev.stopPropagation) {
			ev.stopPropagation();
		}
		$(ev.target).off('click.preventClick');
	};

	/**
	 * getTransformProperty
	 * 
	 * @desc catch stage position while animate (only css3)
	 * @since 2.0.0
	 */
	Owl.prototype.getTransformProperty = function() {
		var transform = window.getComputedStyle(this.dom.stage, null).getPropertyValue(this.vendorName + 'transform');
		// var transform = this.dom.$stage.css(this.vendorName + 'transform')
		transform = transform.replace(/matrix(3d)?\(|\)/g, '').split(',');
		var matrix3d = transform.length === 16;

		return matrix3d !== true ? transform[4] : transform[12];
	};

	/**
	 * closest
	 * 
	 * @desc Get closest item after touchend/mouseup
	 * @since 2.0.0
	 * @param [x] -
	 *            curent position in pixels return position in pixels
	 */
	Owl.prototype.closest = function(x) {
		var newX = 0, pull = 30;

		if (!this.options.freeDrag) {
			// Check closest item
			for (var i = 0; i < this.num.items; i++) {
				if (x > this.pos.items[i] - pull && x < this.pos.items[i] + pull) {
					newX = i;
				} else if (this.op(x, '<', this.pos.items[i])
					&& this.op(x, '>', this.pos.items[i + 1 || this.pos.items[i] - this.width.el])) {
					newX = this.state.direction === 'left' ? i + 1 : i;
				}
			}
		}
		// non loop boundries
		if (!this.options.loop) {
			if (this.op(x, '>', this.pos.minValue)) {
				newX = x = this.pos.min;
			} else if (this.op(x, '<', this.pos.maxValue)) {
				newX = x = this.pos.max;
			}
		}

		if (!this.options.freeDrag) {
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
	 * 
	 * @desc animate stage position (both css3/css2) and perform onChange
	 *       functions/events
	 * @since 2.0.0
	 * @param [x] -
	 *            curent position in pixels
	 */
	Owl.prototype.animStage = function(pos) {

		// if speed is 0 then set inMotion to false
		if (this.speed.current !== 0 && this.pos.currentAbs !== this.pos.min) {
			this.trigger('translate');
			this.state.inMotion = true;
		}

		var posX = this.pos.stage = pos, style = this.dom.stage.style;

		if (this.support3d) {
			translate = 'translate3d(' + posX + 'px' + ',0px, 0px)';
			style[this.transformVendor] = translate;
		} else if (this.state.isTouch) {
			style.left = posX + 'px';
		} else {
			this.dom.$stage.animate({
				left: posX
			}, this.speed.css2speed, this.options.fallbackEasing, function() {
				if (this.state.inMotion) {
					this.transitionEnd();
				}
			}.bind(this));
		}

		this.onChange();
	};

	/**
	 * updatePosition
	 * 
	 * @desc Update current positions
	 * @since 2.0.0
	 * @param [pos] -
	 *            number - new position
	 */
	Owl.prototype.updatePosition = function(pos) {

		// if no items then stop
		if (this.num.oItems === 0) {
			return false;
		}
		// to do
		// if(pos > this.num.items){pos = 0;}
		if (pos === undefined) {
			return false;
		}

		// pos - new current position
		var nextPos = pos;
		this.pos.prev = this.pos.currentAbs;

		if (this.state.revert) {
			this.pos.current = this.dom.$items.eq(nextPos).data('owl-item').index;
			this.pos.currentAbs = nextPos;
			return;
		}

		if (!this.options.loop) {
			if (this.options.navRewind) {
				if (this.pos.current >= this.pos.max) {
					nextPos = nextPos > this.pos.max ? this.pos.min : (nextPos < 0 ? this.pos.max : nextPos);
				} else {
					nextPos = nextPos > this.pos.max ? this.pos.max : (nextPos < 0 ? this.pos.max : nextPos);
				}
			} else {
				nextPos = nextPos > this.pos.max ? this.pos.max : (nextPos <= 0 ? 0 : nextPos);
			}
		} else {
			nextPos = nextPos >= this.num.oItems ? this.num.oItems - 1 : nextPos;
		}

		this.pos.current = this.dom.$oItems.eq(nextPos).data('owl-item').index;
		this.pos.currentAbs = this.dom.$oItems.eq(nextPos).data('owl-item').indexAbs;

	};

	/**
	 * setSpeed
	 * 
	 * @since 2.0.0
	 * @param [speed] -
	 *            number
	 * @param [pos] -
	 *            number - next position - use this param to calculate
	 *            smartSpeed
	 * @param [drag] -
	 *            boolean - if drag is true then smart speed is disabled return
	 *            speed
	 */
	Owl.prototype.setSpeed = function(speed, pos, drag) {
		var s = speed, nextPos = pos;

		if ((s === false && s !== 0 && drag !== true) || s === undefined) {

			// Double check this
			// var nextPx = this.pos.items[nextPos];
			// var currPx = this.pos.stage
			// var diff = Math.abs(nextPx-currPx);
			// var s = diff/1
			// if(s>1000){
			// s = 1000;
			// }

			var diff = Math.abs(nextPos - this.pos.prev);
			diff = diff === 0 ? 1 : diff;
			if (diff > 6) {
				diff = 6;
			}
			s = diff * this.options.smartSpeed;
		}

		if (s === false && drag === true) {
			s = this.options.smartSpeed;
		}

		if (s === 0) {
			s = 0;
		}

		if (this.support3d) {
			var style = this.dom.stage.style;
			style.webkitTransitionDuration = style.MsTransitionDuration = style.msTransitionDuration = style.MozTransitionDuration = style.OTransitionDuration = style.transitionDuration = (s / 1000)
				+ 's';
		} else {
			this.speed.css2speed = s;
		}
		this.speed.current = s;
		return s;
	};

	/**
	 * jumpTo
	 * 
	 * @since 2.0.0
	 * @param [pos] -
	 *            number - next position - use this param to calculate
	 *            smartSpeed
	 * @param [update] -
	 *            boolean - if drag is true then smart speed is disabled
	 */
	Owl.prototype.jumpTo = function(pos, update) {
		this.updatePosition(pos);
		this.setSpeed(0);
		this.animStage(this.pos.items[this.pos.currentAbs]);
		if (update !== true) {
			this.updateItemState();
		}
	};

	/**
	 * goTo
	 * 
	 * @since 2.0.0
	 * @param [pos] -
	 *            number
	 * @param [speed] -
	 *            speed in ms
	 * @param [speed] -
	 *            speed in ms
	 */
	Owl.prototype.goTo = function(pos, speed) {
		this.updatePosition(pos);

		this.setSpeed(speed, this.pos.currentAbs);

		this.trigger('animate');

		this.animStage(this.pos.items[this.pos.currentAbs]);
	};

	/**
	 * next
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.next = function(optionalSpeed) {
		var s = optionalSpeed || this.options.navSpeed;
		if (this.options.loop) {
			this.goToLoop(this.options.slideBy, s);
		} else {
			this.goTo(this.pos.current + this.options.slideBy, s);
		}
	};

	/**
	 * prev
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.prev = function(optionalSpeed) {
		var s = optionalSpeed || this.options.navSpeed;
		if (this.options.loop) {
			this.goToLoop(-this.options.slideBy, s);
		} else {
			this.goTo(this.pos.current - this.options.slideBy, s);
		}
	};

	/**
	 * goToLoop
	 * 
	 * @desc Go to given position if loop is enabled - used only internal
	 * @since 2.0.0
	 * @param [distance] -
	 *            number -how far to go
	 * @param [speed] -
	 *            number - speed in ms
	 */
	Owl.prototype.goToLoop = function(distance, speed) {

		var revert = this.pos.currentAbs, prevPosition = this.pos.currentAbs, newPosition = this.pos.currentAbs
			+ distance, direction = prevPosition - newPosition < 0 ? true : false;

		this.state.revert = true;

		if (newPosition < this.options.items && direction === false) {

			this.state.bypass = true;
			revert = this.num.items - (this.options.items - prevPosition) - this.options.items;
			this.jumpTo(revert, true);

		} else if (newPosition >= this.num.items - this.options.items && direction === true) {

			this.state.bypass = true;
			revert = prevPosition - this.num.oItems;
			this.jumpTo(revert, true);

		}
		window.clearTimeout(this.e._goToLoop);
		this.e._goToLoop = window.setTimeout(function() {
			this.state.bypass = false;
			this.goTo(revert + distance, speed);
			this.state.revert = false;

		}.bind(this), 30);
	};

	/**
	 * initPosition
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.initPosition = function(init) {

		if (!this.dom.$oItems || !init) {
			return false;
		}
		var pos = this.options.startPosition;

		if (this.options.startPosition === 'URLHash') {
			pos = this.options.startPosition = this.hashPosition();
		} else if (typeof this.options.startPosition !== Number && !this.options.center) {
			this.options.startPosition = 0;
		}
		this.dom.oStage.scrollLeft = 0;
		this.jumpTo(pos, true);
	};

	/**
	 * goToHash
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.goToHash = function() {
		var pos = this.hashPosition();
		if (pos === false) {
			pos = 0;
		}
		this.dom.oStage.scrollLeft = 0;
		this.goTo(pos, this.options.navSpeed);
	};

	/**
	 * hashPosition
	 * 
	 * @desc Find hash in URL then look into items to find contained ID
	 * @since 2.0.0 return hashPos - number of item
	 */
	Owl.prototype.hashPosition = function() {
		var hash = window.location.hash.substring(1), hashPos;
		if (hash === "") {
			return false;
		}

		for (var i = 0; i < this.num.oItems; i++) {
			if (hash === this.dom.$oItems.eq(i).data('owl-item').hash) {
				hashPos = i;
			}
		}
		return hashPos;
	};

	/**
	 * transitionEnd
	 * 
	 * @desc event used by css3 animation end and $.animate callback like
	 *       transitionEnd,responsive etc.
	 * @since 2.0.0
	 */
	Owl.prototype.transitionEnd = function(event) {

		// if css2 animation then event object is undefined
		if (event !== undefined) {
			event.stopPropagation();

			// Catch only owl-stage transitionEnd event
			var eventTarget = event.target || event.srcElement || event.originalTarget;
			if (eventTarget !== this.dom.stage) {
				return false;
			}
		}

		this.state.inMotion = false;
		this.updateItemState();
		this.trigger('translated');
	};

	/**
	 * isElWidthChanged
	 * 
	 * @desc Check if element width has changed
	 * @since 2.0.0
	 */
	Owl.prototype.isElWidthChanged = function() {
		var newElWidth = this.dom.$el.width() - this.options.stagePadding, // to
		// check
		prevElWidth = this.width.el + this.options.margin;
		return newElWidth !== prevElWidth;
	};

	/**
	 * windowWidth
	 * 
	 * @desc Get Window/responsiveBaseElement width
	 * @since 2.0.0
	 */
	Owl.prototype.windowWidth = function() {
		if (this.options.responsiveBaseElement !== window) {
			this.width.window = $(this.options.responsiveBaseElement).width();
		} else if (window.innerWidth) {
			this.width.window = window.innerWidth;
		} else if (document.documentElement && document.documentElement.clientWidth) {
			this.width.window = document.documentElement.clientWidth;
		}
		return this.width.window;
	};

	/**
	 * Controls
	 * 
	 * @desc Calls controls container, navigation and dots creator
	 * @since 2.0.0
	 */
	Owl.prototype.controls = function() {
		var cc = document.createElement('div');
		cc.className = this.options.controlsClass;
		this.dom.$el.append(cc);
		this.dom.$cc = $(cc);
	};

	/**
	 * updateControls
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.updateControls = function() {

		if (this.dom.$cc === null && (this.options.nav || this.options.dots)) {
			if (!this.options.navContainer || !this.options.dotsContainer) {
				this.controls();
			}
		}

		if (this.dom.$nav === null && this.options.nav) {
			this.createNavigation();
		}

		if (this.dom.$page === null && this.options.dots) {
			this.createDots();
		}

		if (this.dom.$nav !== null) {
			if (this.options.nav) {
				this.dom.$nav.show();
				this.updateNavigation();
			} else {
				this.dom.$nav.hide();
			}
		}

		if (this.dom.$page !== null) {
			if (this.options.dots) {
				this.dom.$page.show();
				this.updateDots();
			} else {
				this.dom.$page.hide();
			}
		}
	};

	/**
	 * createNavigation
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.createNavigation = function() {

		var cc = this.options.navContainer ? $(this.options.navContainer).get(0) : this.dom.$cc.get(0);

		// Create nav container
		var nav = document.createElement('div');
		nav.className = this.options.navContainerClass;
		cc.appendChild(nav);

		// Create left and right buttons
		var navPrev = document.createElement(this.options.navElement), navNext = document
			.createElement(this.options.navElement);

		navPrev.className = this.options.navClass[0];
		navNext.className = this.options.navClass[1];

		nav.appendChild(navPrev);
		nav.appendChild(navNext);

		this.dom.$nav = $(nav);
		this.dom.$navPrev = $(navPrev).html(this.options.navText[0]);
		this.dom.$navNext = $(navNext).html(this.options.navText[1]);

		// add events to do
		// this.on(navPrev, this.dragType[2], this.e._navPrev, false);
		// this.on(navNext, this.dragType[2], this.e._navNext, false);

		// FF fix?
		this.dom.$nav.on(this.dragType[2], '.' + this.options.navClass[0], this.e._navPrev);
		this.dom.$nav.on(this.dragType[2], '.' + this.options.navClass[1], this.e._navNext);
	};

	/**
	 * createNavigation
	 * 
	 * @since 2.0.0
	 * @param [cc] -
	 *            dom element - Controls Container
	 */
	Owl.prototype.createDots = function() {

		var cc = this.options.dotsContainer ? $(this.options.dotsContainer).get(0) : this.dom.$cc.get(0);

		// Create dots container
		var page = document.createElement('div');
		page.className = this.options.dotsClass;
		cc.appendChild(page);

		// save reference
		this.dom.$page = $(page);

		// add events
		// this.on(page, this.dragType[2], this.e._goToPage, false);

		// FF fix? To test!
		var that = this;
		this.dom.$page.on(this.dragType[2], '.' + this.options.dotClass, goToPage);

		function goToPage(e) {
			e.preventDefault();
			var page = $(this).data('page');
			that.goTo(page, that.options.dotsSpeed);
		}
		// build dots
		this.rebuildDots();
	};

	/**
	 * rebuildDots
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.rebuildDots = function() {
		if (this.dom.$page === null) {
			return false;
		}
		var each, dot, span, counter = 0, last = 0, i, page = 0, roundPages = 0;

		each = this.options.dotsEach || this.options.items;

		// display full dots if center
		if (this.options.center || this.options.dotData) {
			each = 1;
		}

		// clear dots
		this.dom.$page.html('');

		for (i = 0; i < this.num.nav.length; i++) {

			if (counter >= each || counter === 0) {

				dot = document.createElement('div');
				dot.className = this.options.dotClass;
				span = document.createElement('span');
				dot.appendChild(span);
				var $dot = $(dot);

				if (this.options.dotData) {
					$dot.html(this.dom.$oItems.eq(i).data('owl-item').dot);
				}

				$dot.data('page', page);
				$dot.data('goToPage', roundPages);

				this.dom.$page.append(dot);

				counter = 0;
				roundPages++;
			}

			this.dom.$oItems.eq(i).data('owl-item').page = roundPages - 1;

			// add merged items
			counter += this.num.nav[i];
			page++;
		}
		// find rest of dots
		if (!this.options.loop && !this.options.center) {
			for (var j = this.num.nav.length - 1; j >= 0; j--) {
				last += this.num.nav[j];
				this.dom.$oItems.eq(j).data('owl-item').page = roundPages - 1;
				if (last >= each) {
					break;
				}
			}
		}

		this.num.allPages = roundPages - 1;
	};

	/**
	 * updateDots
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.updateDots = function() {
		var dots = this.dom.$page.children();
		var itemIndex = this.dom.$oItems.eq(this.pos.current).data('owl-item').page;

		for (var i = 0; i < dots.length; i++) {
			var dotPage = dots.eq(i).data('goToPage');

			if (dotPage === itemIndex) {
				this.pos.currentPage = i;
				dots.eq(i).addClass('active');
			} else {
				dots.eq(i).removeClass('active');
			}
		}
	};

	/**
	 * updateNavigation
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.updateNavigation = function() {

		var isNav = this.options.nav;

		this.dom.$navNext.toggleClass('disabled', !isNav);
		this.dom.$navPrev.toggleClass('disabled', !isNav);

		if (!this.options.loop && isNav && !this.options.navRewind) {

			if (this.pos.current <= 0) {
				this.dom.$navPrev.addClass('disabled');
			}
			if (this.pos.current >= this.pos.max) {
				this.dom.$navNext.addClass('disabled');
			}
		}
	};

	Owl.prototype.insertContent = function(content) {
		this.dom.$stage.empty();
		this.fetchContent(content);
		this.refresh();
	};

	/**
	 * addItem - Add an item
	 * 
	 * @since 2.0.0
	 * @param [content] -
	 *            dom element / string '<div>content</div>'
	 * @param [pos] -
	 *            number - position
	 */
	Owl.prototype.addItem = function(content, pos) {
		pos = pos || 0;

		// wrap content
		var item = this.fillItem(content);
		// if carousel is empty then append item
		if (this.dom.$oItems.length === 0) {
			this.dom.$stage.append(item);
		} else {
			// append item
			var it = this.dom.$oItems.eq(pos);
			if (pos !== -1) {
				it.before(item);
			} else {
				it.after(item);
			}
		}
		// update and calculate carousel
		this.refresh();

	};

	/**
	 * removeItem - Remove an Item
	 * 
	 * @since 2.0.0
	 * @param [pos] -
	 *            number - position
	 */
	Owl.prototype.removeItem = function(pos) {
		this.dom.$oItems.eq(pos).remove();
		this.refresh();
	};

	/**
	 * addTriggerableEvents
	 * 
	 * @desc Add triggerable events by jQuery's `on` method
	 * @since 2.0.0
	 */
	Owl.prototype.addTriggerableEvents = function() {
		var handler = $.proxy(function(callback, event) {
			return $.proxy(function() {
				this.suppressedEvents[event] = true;
				callback.apply(this, [].slice.call(arguments, 1));
				delete this.suppressedEvents[event];
			}, this);
		}, this);

		$.each({
			'next': this.next,
			'prev': this.prev,
			'to': this.goTo,
			'destroy': this.destroy,
			'refresh': this.refresh,
			'replace': this.insertContent,
			'add': this.addItem,
			'remove': this.removeItem
		}, $.proxy(function(event, callback) {
			this.dom.$el.on(event + '.owl.carousel', handler(callback, event + '.owl.carousel'));
		}, this));

	};

	/**
	 * watchVisibility
	 * 
	 * @desc check if el is visible - handy if Owl is inside hidden content
	 *       (tabs etc.)
	 * @since 2.0.0
	 */
	Owl.prototype.watchVisibility = function() {

		// test on zepto
		if (!isElVisible(this.dom.el)) {
			this.dom.$el.addClass('owl-hidden');
			window.clearInterval(this.e._checkVisibile);
			this.e._checkVisibile = window.setInterval(checkVisible.bind(this), 500);
		}

		function isElVisible(el) {
			return el.offsetWidth > 0 && el.offsetHeight > 0;
		}

		function checkVisible() {
			if (isElVisible(this.dom.el)) {
				this.dom.$el.removeClass('owl-hidden');
				this.refresh();
				window.clearInterval(this.e._checkVisibile);
			}
		}
	};

	/**
	 * onChange
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.onChange = function() {

		if (!this.state.isTouch && !this.state.bypass && !this.state.responsive) {

			if (this.options.nav || this.options.dots) {
				this.updateControls();
			}
		}

		if (!this.state.isTouch && !this.state.bypass) {

			this.updateActiveItems();

			// set Status to do
			this.storeInfo();
			this.trigger('changed');
		}

	};

	/**
	 * storeInfo store basic information about current states
	 * 
	 * @since 2.0.0
	 */
	Owl.prototype.storeInfo = function() {
		this.info = {
			items: this.options.items,
			allItems: this.num.oItems,
			currentPosition: this.pos.current,
			currentPage: this.pos.currentPage,
			allPages: this.num.allPages,
			windowWidth: this.width.window,
			elWidth: this.width.el,
			breakpoint: this.num.breakpoint
		};

		if (typeof this.options.info === 'function') {
			this.options.info.apply(this, [ this.info, this.dom.el ]);
		}
	};

	/**
	 * preloadAutoWidthImages
	 * 
	 * @desc still to test
	 * @since 2.0.0
	 */
	Owl.prototype.preloadAutoWidthImages = function(imgs) {
		var loaded = 0;
		var that = this;
		imgs.each(function(i, el) {
			var $el = $(el);
			var img = new Image();

			img.onload = function() {
				loaded++;
				$el.attr('src', img.src);
				$el.css('opacity', 1);
				if (loaded >= imgs.length) {
					that.state.imagesLoaded = true;
					that.init();
				}
			};

			img.src = $el.attr('src') || $el.attr('data-src') || $el.attr('data-src-retina');
		});
	};

	/**
	 * destroy
	 * 
	 * @desc Remove Owl structure and events :(
	 * @since 2.0.0
	 */
	Owl.prototype.destroy = function() {

		if (this.dom.$el.hasClass(this.options.themeClass)) {
			this.dom.$el.removeClass(this.options.themeClass);
		}

		if (this.options.responsive !== false) {
			this.off(window, 'resize', this.e._resizer);
		}

		if (this.transitionEndVendor) {
			this.off(this.dom.stage, this.transitionEndVendor, this.e._transitionEnd);
		}

		for ( var i in this.plugins) {
			this.plugins[i].destroy();
		}

		if (this.options.mouseDrag || this.options.touchDrag) {
			this.off(this.dom.stage, this.dragType[0], this.e._onDragStart);
			if (this.options.mouseDrag) {
				this.off(document, this.dragType[3], this.e._onDragStart);
			}
			if (this.options.mouseDrag) {
				this.dom.$stage.off('dragstart', function() {
					return false;
				});
				this.dom.stage.onselectstart = function() {
				};
			}
		}

		if (this.options.URLhashListener) {
			this.off(window, 'hashchange', this.e._goToHash);
		}

		// Remove event handlers in the ".owl.carousel" namespace
		this.dom.$el.off('.owl');

		if (this.dom.$cc !== null) {
			this.dom.$cc.remove();
		}
		if (this.dom.$cItems !== null) {
			this.dom.$cItems.remove();
		}
		this.e = null;
		this.dom.$el.data('owlCarousel', null);
		delete this.dom.el.owlCarousel;

		this.dom.$stage.unwrap();
		this.dom.$items.unwrap();
		this.dom.$items.contents().unwrap();
		this.dom = null;
	};

	/**
	 * Opertators
	 * 
	 * @desc Used to calculate RTL
	 * @param [a] -
	 *            Number - left side
	 * @param [o] -
	 *            String - operator
	 * @param [b] -
	 *            Number - right side
	 * @since 2.0.0
	 */
	Owl.prototype.op = function(a, o, b) {
		var rtl = this.options.rtl;
		switch (o) {
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
	 * on
	 * 
	 * @desc On method for adding internal events
	 * @since 2.0.0
	 */
	Owl.prototype.on = function(element, event, listener, capture) {

		if (element.addEventListener) {
			element.addEventListener(event, listener, capture);
		} else if (element.attachEvent) {
			element.attachEvent('on' + event, listener);
		}
	};

	/**
	 * off
	 * 
	 * @desc Off method for removing internal events
	 * @since 2.0.0
	 */
	Owl.prototype.off = function(element, event, listener, capture) {
		if (element.removeEventListener) {
			element.removeEventListener(event, listener, capture);
		} else if (element.detachEvent) {
			element.detachEvent('on' + event, listener);
		}
	};

	/**
	 * trigger
	 * 
	 * @since 2.0.0
	 * @param event -
	 *            string - event name
	 * @param data -
	 *            object - additional options - to do
	 * @param namespace
	 */
	Owl.prototype.trigger = function(name, data, namespace) {
		var status = {
			page: {size: this.options.items, count: this.num.allPages, index: this.pos.currentPage}, 
			item: {count: this.num.oItems, index: this.pos.current}
		}, handler = $.camelCase(
			$.grep([ 'on', name, namespace ], 
			function(v) {return v}).join('-').toLowerCase()
		), event = $.Event(
			[ name, 'owl', namespace || 'carousel' ].join('.').toLowerCase(), 
			$.extend(status, data)
		);

		if (!this.suppressedEvents[event.type]) {
			this.dom.$el.trigger(event);
		}

		if (typeof this.options[handler] === 'function') {
			this.options[handler].apply(this, event);
		}

		return event;
	};

	/**
	 * Opertators
	 * 
	 * @desc Used to calculate RTL
	 * @since 2.0.0
	 */
	Owl.prototype.browserSupport = function() {
		this.support3d = isPerspective();

		if (this.support3d) {
			this.transformVendor = isTransform();

			// take transitionend event name by detecting transition
			var endVendors = [ 'transitionend', 'webkitTransitionEnd', 'transitionend', 'oTransitionEnd' ];
			this.transitionEndVendor = endVendors[isTransition()];

			// take vendor name from transform name
			this.vendorName = this.transformVendor.replace(/Transform/i, '');
			this.vendorName = this.vendorName !== '' ? '-' + this.vendorName.toLowerCase() + '-' : '';
		}

		this.state.orientation = window.orientation;
	};

	// Pivate methods

	// CSS detection;
	function isStyleSupported(array) {
		var p, s, fake = document.createElement('div'), list = array;
		for (p in list) {
			s = list[p];
			if (typeof fake.style[s] !== 'undefined') {
				fake = null;
				return [ s, p ];
			}
		}
		return [ false ];
	}

	function isTransition() {
		return isStyleSupported([ 'transition', 'WebkitTransition', 'MozTransition', 'OTransition' ])[1];
	}

	function isTransform() {
		return isStyleSupported([ 'transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform' ])[0];
	}

	function isPerspective() {
		return isStyleSupported([ 'perspective', 'webkitPerspective', 'MozPerspective', 'OPerspective', 'MsPerspective' ])[0];
	}

	function isTouchSupport() {
		return 'ontouchstart' in window || !!(navigator.msMaxTouchPoints);
	}

	function isTouchSupportIE() {
		return window.navigator.msPointerEnabled;
	}

	function isRetina() {
		return window.devicePixelRatio > 1;
	}

	$.fn.owlCarousel = function(options) {
		return this.each(function() {
			if (!$(this).data('owlCarousel')) {
				$(this).data('owlCarousel', new Owl(this, options));
			}
		});

	};

	$.fn.owlCarousel.Constructor = Owl;

})(window.Zepto || window.jQuery, window, document);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
// The bind() method creates a new function that, when called, has its this
// keyword set to the provided value, with a given sequence of arguments
// preceding any provided when the new function is called.

if (!Function.prototype.bind) {
	Function.prototype.bind = function(oThis) {
		if (typeof this !== 'function') {
			// closest thing possible to the ECMAScript 5 internal IsCallable
			// function
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {
		}, fBound = function() {
			return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice
				.call(arguments)));
		};
		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();
		return fBound;
	};
}

/**
 * lazyLoad Plugin
 * 
 * @since 2.0.0
 */
;(function($, window, document, undefined) {

	LazyLoad = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, LazyLoad.Defaults, this.owl.options);

		this.owl.dom.$el.on({
			'updated.owl.carousel': $.proxy(function(e) {
				if (this.owl.options.lazyLoad)
					this.check();
			}, this)
		});
	};

	LazyLoad.Defaults = {
		lazyLoad: false
	};

	LazyLoad.prototype.check = function() {

		var attr = window.devicePixelRatio > 1 ? 'data-src-retina' : 'data-src';
		var src, img, i;

		for (i = 0; i < this.owl.num.items; i++) {
			var $item = this.owl.dom.$items.eq(i);

			if ($item.data('owl-item').current === true && $item.data('owl-item').loaded === false) {
				img = $item.find('.owl-lazy');
				src = img.attr(attr);
				src = src || img.attr('data-src');
				if (src) {
					img.css('opacity', '0');
					this.preload(img, $item);
				}
			}
		}
	};

	LazyLoad.prototype.preload = function(images, $item) {
		images.each($.proxy(function(i, el) {
			this.owl.trigger('load', null, 'lazy');
			var $el = $(el);
			var img = new Image();
			var srcType = window.devicePixelRatio > 1 ? $el.attr('data-src-retina') : $el.attr('data-src');
			srcType = srcType || $el.attr('data-src');

			img.onload = $.proxy(function() {
				$item.data('owl-item').loaded = true;
				if ($el.is('img')) {
					$el.attr('src', img.src);
				} else {
					$el.css('background-image', 'url(' + img.src + ')');
				}

				$el.css('opacity', 1);
				this.owl.trigger('loaded', null, 'lazy');
			}, this);
			img.src = srcType;
		}, this));
	};

	LazyLoad.prototype.destroy = function() {
		this.owl.dom.$el.off('.owl');
	};

	$.fn.owlCarousel.Constructor.Plugins.lazyLoad = LazyLoad;

})(window.Zepto || window.jQuery, window, document);
/**
 * AutoHeight Plugin
 * 
 * @since 2.0.0
 */
;(function($, window, document, undefined) {

	AutoHeight = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, AutoHeight.Defaults, this.owl.options);

		this.owl.dom.$el.on({
			'refreshed.owl.carousel changed.owl.carousel': $.proxy(function(e) {
				if (this.owl.options.autoHeight)
					this.setHeight();
			}, this)
		});
	};

	AutoHeight.Defaults = {
		autoHeight: false,
		autoHeightClass: 'owl-height'
	};

	AutoHeight.prototype.setHeight = function(callback) {

		if (this.owl.options.autoHeight !== true && callback !== true) {
			return false;
		}
		if (!this.owl.dom.$oStage.hasClass(this.owl.options.autoHeightClass)) {
			this.owl.dom.$oStage.addClass(this.owl.options.autoHeightClass);
		}

		var loaded = this.owl.dom.$items.eq(this.owl.pos.currentAbs);
		var stage = this.owl.dom.$oStage;
		var iterations = 0;

		var isLoaded = window.setInterval(function() {
			iterations += 1;
			if (loaded.data('owl-item').loaded) {
				stage.height(loaded.height() + 'px');
				clearInterval(isLoaded);
			} else if (iterations === 500) {
				clearInterval(isLoaded);
			}
		}, 100);

	};

	AutoHeight.prototype.destroy = function() {
		this.owl.dom.$el.off('.owl');
	};

	$.fn.owlCarousel.Constructor.Plugins.autoHeight = AutoHeight;

})(window.Zepto || window.jQuery, window, document);

/**
 * Video Plugin
 * 
 * @since 2.0.0
 */
;(function($, window, document, undefined) {

	Video = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, Video.Defaults, this.owl.options);

		this.owl.dom.$el.on('click.owl.video', '.owl-video-play-icon', $.proxy(function(e) {
			this.playVideo(e);
		}, this));

		this.owl.dom.$el.on({
			'resize.owl.carousel': $.proxy(function(e) {
				if (this.owl.options.video && !this.isInFullScreen())
					e.preventDefault();
			}, this),
			'refresh.owl.carousel changed.owl.carousel': $.proxy(function(e) {
				if (this.owl.state.videoPlay)
					this.stopVideo();
			}, this),
			'refresh.owl.carousel': $.proxy(function(e) {
				if (!this.owl.options.video)
					return false;
				this.owl.dom.$el.one('updated.owl.carousel', $.proxy(this.checkVideoLinks, this));
			}, this)
		});
	};

	Video.Defaults = {
		video: false,
		videoHeight: false,
		videoWidth: false
	};

	/**
	 * checkVideoLinks
	 * 
	 * @desc Check if for any videos links
	 * @since 2.0.0
	 */
	Video.prototype.checkVideoLinks = function() {
		var videoEl, item;

		for (var i = 0; i < this.owl.num.items; i++) {

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
	 * getVideoInfo
	 * 
	 * @desc Get Video ID and Type (YouTube/Vimeo only)
	 * @since 2.0.0
	 */
	Video.prototype.getVideoInfo = function(videoEl, item) {

		var info, type, id, vimeoId = videoEl.data('vimeo-id'), youTubeId = videoEl.data('youtube-id'), width = videoEl
			.data('width')
			|| this.owl.options.videoWidth, height = videoEl.data('height') || this.owl.options.videoHeight, url = videoEl
			.attr('href');

		if (vimeoId) {
			type = 'vimeo';
			id = vimeoId;
		} else if (youTubeId) {
			type = 'youtube';
			id = youTubeId;
		} else if (url) {
			id = url
				.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

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
		var dimensions = width && height ? 'style="width:' + width + 'px;height:' + height + 'px;"' : '';

		// wrap video content into owl-video-wrapper div
		videoEl.wrap('<div class="owl-video-wrapper"' + dimensions + '></div>');

		this.createVideoTn(videoEl, info);
	};

	/**
	 * createVideoTn
	 * 
	 * @desc Create Video Thumbnail
	 * @since 2.0.0
	 */
	Video.prototype.createVideoTn = function(videoEl, info) {

		var tnLink, icon, height;
		var customTn = videoEl.find('img');
		var srcType = 'src';
		var lazyClass = '';
		var that = this.owl;

		if (this.owl.options.lazyLoad) {
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

			if (that.options.lazyLoad) {
				tnLink = '<div class="owl-video-tn ' + lazyClass + '" ' + srcType + '="' + tnPath + '"></div>';
			} else {
				tnLink = '<div class="owl-video-tn" style="opacity:1;background-image:url(' + tnPath + ')"></div>';
			}
			videoEl.after(tnLink);
			videoEl.after(icon);
		}

		if (info.type === 'youtube') {
			var path = "http://img.youtube.com/vi/" + info.id + "/hqdefault.jpg";
			addThumbnail(path);
		} else if (info.type === 'vimeo') {
			$.ajax({
				type: 'GET',
				url: 'http://vimeo.com/api/v2/video/' + info.id + '.json',
				jsonp: 'callback',
				dataType: 'jsonp',
				success: function(data) {
					var path = data[0].thumbnail_large;
					addThumbnail(path);
					if (that.options.loop) {
						that.updateItemState();
					}
				}
			});
		}
	};

	/**
	 * stopVideo
	 * 
	 * @since 2.0.0
	 */
	Video.prototype.stopVideo = function() {
		this.owl.trigger('stop', null, 'video');
		var item = this.owl.dom.$items.eq(this.owl.state.videoPlayIndex);
		item.find('.owl-video-frame').remove();
		item.removeClass('owl-video-playing');
		this.owl.state.videoPlay = false;
	};

	/**
	 * playVideo
	 * 
	 * @since 2.0.0
	 */
	Video.prototype.playVideo = function(ev) {
		this.owl.trigger('play', null, 'video');

		if (this.owl.state.videoPlay) {
			this.stopVideo();
		}
		var videoLink, videoWrap, target = $(ev.target || ev.srcElement), item = target.closest('.'
			+ this.owl.options.itemClass);

		var videoType = item.data('owl-item').videoType, id = item.data('owl-item').videoId, width = item
			.data('owl-item').videoWidth
			|| Math.floor(item.data('owl-item').width - this.owl.options.margin), height = item.data('owl-item').videoHeight
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

	Video.prototype.isInFullScreen = function() {

		// if Vimeo Fullscreen mode
		var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement
			|| document.webkitFullscreenElement;
		if (fullscreenElement) {
			if ($(fullscreenElement.parentNode).hasClass('owl-video-frame')) {
				this.owl.setSpeed(0);
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

	Video.prototype.destroy = function() {
		this.owl.dom.$el.off('.owl');
		this.owl.dom.$el.off('.owl.video');
	};

	$.fn.owlCarousel.Constructor.Plugins.video = Video;

})(window.Zepto || window.jQuery, window, document);

/**
 * Animate Plugin
 * 
 * @since 2.0.0
 */
;(function($, window, document, undefined) {

	Animate = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, Animate.Defaults, this.owl.options);

		this.owl.dom.$el.on({
			'animate.owl.carousel': $.proxy(function(e) {
				if (this.owl.options.animateIn || this.owl.options.animateOut)
					this.swap();
			}, this)
		});
	};

	Animate.Defaults = {
		animateOut: false,
		animateIn: false
	};

	Animate.prototype.swap = function() {
		// speed = 0;
		this.owl.setSpeed(0);

		if (this.owl.options.items === 1 && this.owl.support3d) {
			this.owl.state.animate = true;
		} else {
			this.owl.state.animate = false;
		}

		var prevItem = this.owl.dom.$items.eq(this.owl.pos.prev), 
			prevPos = Math.abs(prevItem.data('owl-item').width) * this.owl.pos.prev, 
			currentItem = this.owl.dom.$items.eq(this.owl.pos.currentAbs), 
			currentPos = Math.abs(currentItem.data('owl-item').width) * this.owl.pos.currentAbs;

		if (this.owl.pos.currentAbs === this.owl.pos.prev) {
			return false;
		}

		var pos = currentPos - prevPos;
		var tIn = this.owl.options.animateIn;
		var tOut = this.owl.options.animateOut;
		var that = this.owl;

		removeStyles = function() {
			$(this).css({
				"left": ""
			}).removeClass('animated owl-animated-out owl-animated-in').removeClass(tIn).removeClass(tOut);

			that.transitionEnd();
		};

		if (tOut) {
			prevItem.css({
				"left": pos + "px"
			}).addClass('animated owl-animated-out ' + tOut).one(
				'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', removeStyles);
		}

		if (tIn) {
			currentItem.addClass('animated owl-animated-in ' + tIn).one(
				'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', removeStyles);
		}
	};
	Animate.prototype.destroy = function() {
		this.owl.dom.$el.off('.owl');
	};
	$.fn.owlCarousel.Constructor.Plugins.animate = Animate;

})(window.Zepto || window.jQuery, window, document);
/**
 * Autoplay Plugin
 * 
 * @since 2.0.0
 */
;(function($, window, document, undefined) {

	Autoplay = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, Autoplay.Defaults, this.owl.options);

		this.owl.dom.$el.on({
			'translated.owl.carousel refreshed.owl.carousel': $.proxy(function(e) {
				this.autoplay();
			}, this),
			'play.owl.autoplay': $.proxy(function(e, t, s) {
				this.play(t, s);
			}, this),
			'stop.owl.autoplay': $.proxy(function(e) {
				this.stop();
			}, this)
		});

		if (this.owl.options.autoplayHoverPause) {
			this.owl.dom.$el.on('mouseover.ap.owl', '.owl-stage', $.proxy(function(e) {
				this.pause();
			}, this));
			this.owl.dom.$el.on('mouseleave.ap.owl', '.owl-stage', $.proxy(function(e) {
				this.autoplay();
			}, this));
		}
	};

	Autoplay.Defaults = {
		autoplay: false,
		autoplayTimeout: 5000,
		autoplayHoverPause: false,
		autoplaySpeed: false
	};

	/**
	 * Autoplay
	 * 
	 * @since 2.0.0
	 */

	Autoplay.prototype.autoplay = function() {
		if (this.owl.options.autoplay && !this.owl.state.videoPlay) {
			window.clearInterval(this.apInterval);

			this.apInterval = window.setInterval(function() {
				this.play();
			}.bind(this), this.owl.options.autoplayTimeout);

		} else {
			window.clearInterval(this.apInterval);
			this.autoplayState = false;
		}
	};

	/**
	 * play
	 * 
	 * @param [timeout] -
	 *            Integrer
	 * @param [speed] -
	 *            Integrer
	 * @since 2.0.0
	 */
	Autoplay.prototype.play = function(timeout, speed) {
		// if tab is inactive - doesnt work in <IE10
		if (document.hidden === true) {
			return false;
		}

		// overwrite default options (custom options are always priority)
		if (!this.owl.options.autoplay) {
			this.owl._options.autoplay = this.owl.options.autoplay = true;
			this.owl._options.autoplayTimeout = this.owl.options.autoplayTimeout = timeout
				|| this.owl.options.autoplayTimeout || 4000;
			this.owl._options.autoplaySpeed = speed || this.owl.options.autoplaySpeed;
		}

		if (this.owl.options.autoplay === false || this.owl.state.isTouch || this.owl.state.isScrolling
			|| this.owl.state.isSwiping || this.owl.state.inMotion) {
			window.clearInterval(this.apInterval);
			return false;
		}

		if (!this.owl.options.loop && this.owl.pos.current >= this.owl.pos.max) {
			window.clearInterval(this.e._autoplay);
			this.owl.goTo(0);
		} else {
			this.owl.next(this.owl.options.autoplaySpeed);
		}
		this.autoplayState = true;
	};

	/**
	 * stop
	 * 
	 * @since 2.0.0
	 */
	Autoplay.prototype.stop = function() {
		this.owl._options.autoplay = this.owl.options.autoplay = false;
		this.autoplayState = false;
		window.clearInterval(this.apInterval);
	};

	/**
	 * pause
	 * 
	 * @since 2.0.0
	 */
	Autoplay.prototype.pause = function() {
		window.clearInterval(this.apInterval);
	};

	Autoplay.prototype.destroy = function() {
		window.clearInterval(this.apInterval);
		this.owl.dom.$el.off('.owl');
	};

	$.fn.owlCarousel.Constructor.Plugins.autoplay = Autoplay;

})(window.Zepto || window.jQuery, window, document);
