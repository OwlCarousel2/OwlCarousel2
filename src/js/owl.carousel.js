/**
 * Owl Carousel
 *
 * @todo Lazy Load Icon
 * @todo prevent animationend bubling
 * @todo itemsScaleUp
 * @todo Test Zepto
 * @todo stagePadding calculate wrong active classes
 */
;(function($, window, document, undefined) {

	var defaults, item, dom, width, num, pos, drag, speed, state, e;

	defaults = {
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

		smartSpeed: 250,
		fluidSpeed: false,
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

		// Classes and Names
		themeClass: 'owl-theme',
		baseClass: 'owl-carousel',
		itemClass: 'owl-item',
		centerClass: 'center',
		activeClass: 'active'
	};

	// Each item has following data:

	item = {
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

	dom = {
		el: null, // main element
		$el: null, // jQuery main element
		stage: null, // stage
		$stage: null, // jQuery stage
		oStage: null, // outer stage
		$oStage: null, // $ outer stage
		$items: null, // all items, clones and originals included
		$oItems: null, // original items
		$cItems: null, // cloned items only
		$content: null
	};

	/**
	 * Variables
	 *
	 * @since 2.0.0
	 */

	// Only for development process
	// Widths

	width = {
		el: 0,
		stage: 0,
		item: 0,
		prevWindow: 0,
		cloneLast: 0
	};

	// Numbers

	num = {
		items: 0,
		oItems: 0,
		cItems: 0,
		active: 0,
		merged: []
	};

	// Positions

	pos = {
		start: 0,
		max: 0,
		maxValue: 0,
		prev: 0,
		current: 0,
		currentAbs: 0,
		stage: 0,
		items: [],
		lsCurrent: 0
	};

	// Drag/Touches

	drag = {
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

	speed = {
		onDragEnd: 300,
		css2speed: 0
	};

	// States

	state = {
		isTouch: false,
		isScrolling: false,
		isSwiping: false,
		direction: false,
		inMotion: false
	};

	// Event functions references

	e = {
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

		for (var plugin in Owl.Plugins) {
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
			var imgs, nestedSelector, width;
			imgs = this.dom.$el.find('img');
			nestedSelector = this.options.nestedItemSelector ? '.' + this.options.nestedItemSelector : undefined;
			width = this.dom.$el.children(nestedSelector).width();

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

		// attach generic events
		this.internalEvents();

		this.dom.$el.addClass('owl-loading');
		this.refresh(true);
		this.dom.$el.removeClass('owl-loading').addClass('owl-loaded');

		this.trigger('initialized');

		// attach custom control events
		this.addTriggerableEvents();
	};

	/**
	 * sortOptions
	 * @desc Sort responsive sizes
	 * @since 2.0.0
	 */
	Owl.prototype.sortOptions = function() {

		var resOpt, keys = [], i, j, k;

		resOpt = this.options.responsive;
		this.responsiveSorted = {};

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
	 * @since 2.0.0
	 */
	Owl.prototype.setResponsiveOptions = function() {
		if (this.options.responsive === false) {
			return false;
		}

		var width, resOpt, i, j, k, minWidth;

		width = this.windowWidth();
		resOpt = this.options.responsive;

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
	 * @desc Update option logic if necessery
	 * @since 2.0.0
	 */
	Owl.prototype.optionsLogic = function() {
		// Toggle Center class
		this.dom.$el.toggleClass('owl-center', this.options.center);

		// if items number is less than in body
		if (this.options.loop && this.num.oItems < this.options.items) {
			this.options.loop = false;
		}

		if (this.options.autoWidth) {
			this.options.stagePadding = false;
			this.options.merge = false;
		}
	};

	/**
	 * createStage
	 * @desc Create stage and Outer-stage elements
	 * @since 2.0.0
	 */
	Owl.prototype.createStage = function() {
		var oStage = document.createElement('div'),
			stage = document.createElement(this.options.stageElement);

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
	Owl.prototype.createItemContainer = function() {
		var item = document.createElement(this.options.itemElement);
		item.className = this.options.itemClass;
		return $(item);
	};

	/**
	 * fetchContent
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
	 * @desc Create normal structure for small/mid weight content
	 * @since 2.0.0
	 */
	Owl.prototype.createNormalStructure = function() {
		var i, $item;
		for (i = 0; i < this.num.oItems; i++) {
			$item = this.createItemContainer();
			this.initializeItemContainer($item, this.dom.$content[i]);
			this.dom.$stage.append($item);
		}
		this.dom.$content = null;
	};

	/**
	 * createCustomStructure
	 * @since 2.0.0
	 */
	Owl.prototype.createCustomStructure = function(howManyItems) {
		var i, $item;
		for (i = 0; i < howManyItems; i++) {
			$item = this.createItemContainer();
			this.createItemContainerData($item);
			this.dom.$stage.append($item);
		}
	};

	/**
	 * initializeItemContainer
	 * @desc Fill empty item container with provided content
	 * @since 2.0.0
	 * @param [content] -
	 *            string/$dom - passed owl-item
	 * @param [i] -
	 *            index in jquery object return $ new object
	 */
	Owl.prototype.initializeItemContainer = function(item, content) {
		this.trigger('change', { property: { name: 'item', value: item } });

		this.createItemContainerData(item);
		item.append(content);

		this.trigger('changed', { property: { name: 'item', value: item } });
	};

	/**
	 * Creates item container data.
	 * @since 2.0.0
	 * @protected
	 * @param {jQuery} item - The item for which the data are to be set.
	 * @param {jQuery} [source] - The item whose data are to be copied.
	 */
	Owl.prototype.createItemContainerData = function(item, source) {
		var data = $.extend({}, this.itemData);

		if (source) {
			$.extend(data, source.data('owl-item'));
		}

		item.data('owl-item', data);
	};

	/**
	 * Clones an item container.
	 * @since 2.0.0
	 * @protected
	 * @param {jQuery} item - The item to clone.
	 * @returns {jQuery} - The cloned item.
	 */
	Owl.prototype.cloneItemContainer = function(item) {
		var $clone = item.clone(true, true).addClass('cloned');
		// somehow data references the same object
		this.createItemContainerData($clone, $clone);
		$clone.data('owl-item').clone = true;
		return $clone;
	};

	/**
	 * updateLocalContent
	 * @since 2.0.0
	 */
	Owl.prototype.updateLocalContent = function() {

		var k, item;

		this.dom.$oItems = this.dom.$stage.find('.' + this.options.itemClass).filter(function() {
			return $(this).data('owl-item').clone === false;
		});

		this.num.oItems = this.dom.$oItems.length;
		// update index on original items

		for (k = 0; k < this.num.oItems; k++) {
			item = this.dom.$oItems.eq(k);
			item.data('owl-item').index = k;
		}
	};

	/**
	 * loopClone
	 * @desc Make a clones for infinity loop
	 * @since 2.0.0
	 */
	Owl.prototype.loopClone = function() {
		if (!this.options.loop || this.num.oItems < this.options.items) {
			return false;
		}

		var append, prepend, i,
			items = this.options.items,
			last = this.num.oItems - 1;

		// if neighbour margin then add one more duplicat
		if (this.options.stagePadding && this.options.items === 1) {
			items += 1;
		}
		this.num.cItems = items * 2;

		for (i = 0; i < items; i++) {
			append = this.cloneItemContainer(this.dom.$oItems.eq(i));
			prepend = this.cloneItemContainer(this.dom.$oItems.eq(last - i));

			this.dom.$stage.append(append);
			this.dom.$stage.prepend(prepend);
		}

		this.dom.$cItems = this.dom.$stage.find('.' + this.options.itemClass).filter(function() {
			return $(this).data('owl-item').clone === true;
		});
	};

	/**
	 * reClone
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
	 * @desc Update item index data
	 * @since 2.0.0
	 */
	Owl.prototype.calculate = function() {

		var i, j, elMinusMargin, dist, allItems, iWidth,  mergeNumber,  posLeft = 0, fullWidth = 0;

		// element width minus neighbour
		this.width.el = this.dom.$el.width() - (this.options.stagePadding * 2);

		// to check
		this.width.view = this.dom.$el.width();

		// calculate width minus addition margins
		elMinusMargin = this.width.el - (this.options.margin * (this.options.items === 1 ? 0 : this.options.items - 1));

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
				mergeNumber = this.dom.$items.eq(i).find('[data-merge]').attr('data-merge') || 1;
				if (this.options.mergeFit && mergeNumber > this.options.items) {
					mergeNumber = this.options.items;
				}
				this.num.merged.push(parseInt(mergeNumber));
				this.width.mergeStage += this.width.item * this.num.merged[i];
			} else {
				this.num.merged.push(1);
			}

			iWidth = this.width.item * this.num.merged[i];

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
		allItems = this.num.oItems + this.num.cItems;

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
	 * @since 2.0.0
	 */
	Owl.prototype.setMinMax = function() {

		var minimum, revert;

		// set Min
		minimum = this.dom.$oItems.eq(0).data('owl-item').indexAbs;
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
			revert = this.options.rtl ? 1 : -1;
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

		if (init) {
			this.initPosition();
		}

		//jump to last position
		if (!init) {
			this.jumpTo(this.pos.current, false); // fix that
		}

		this.state.orientation = window.orientation;

		this.watchVisibility();

		this.trigger('refreshed');
	};

	/**
	 * updateActiveItems
	 * @desc Update information about current state of items (visibile, hidden,
	 *       active, etc.)
	 * @since 2.0.0
	 */
	Owl.prototype.updateActiveItems = function() {
		this.trigger('change', { property: { name: 'items', value: this.dom.$items } });

		var i, j, item, ipos, iwidth, outsideView, foundCurrent;

		// clear states
		for (i = 0; i < this.num.items; i++) {
			this.dom.$items.eq(i).data('owl-item').active = false;
			this.dom.$items.eq(i).data('owl-item').current = false;
			this.dom.$items.eq(i).removeClass(this.options.activeClass).removeClass(this.options.centerClass);
		}

		this.num.active = 0;
		padding = this.options.stagePadding * 2;
		stageX = this.pos.stage + padding;
		view = this.options.rtl ? this.width.view : -this.width.view;

		for (j = 0; j < this.num.items; j++) {

			item = this.dom.$items.eq(j);
			ipos = item.data('owl-item').posLeft;
			iwidth = item.data('owl-item').width;
			outsideView = this.options.rtl ? ipos - iwidth - padding : ipos - iwidth + padding;

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

		if (this.options.center) {
			this.dom.$items.eq(this.pos.currentAbs).addClass(this.options.centerClass).data('owl-item').center = true;
		}
		this.trigger('changed', { property: { name: 'items', value: this.dom.$items } });
	};

	/**
	 * updateClonedItemsState
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
	};

	/**
	 * responsiveTimer
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
	 * @desc Checks for touch/mouse drag options and add necessery event
	 *       handlers.
	 * @since 2.0.0
	 */
	Owl.prototype.internalEvents = function() {
		var isTouch = isTouchSupport(),
			isTouchIE = isTouchSupportIE();

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
	 * @desc touchstart/mousedown event
	 * @since 2.0.0
	 */
	Owl.prototype.onDragStart = function(event) {
		var ev, isTouchEvent, pageX, pageY, animatedPos;

		ev = event.originalEvent || event || window.event;

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
		isTouchEvent = ev.type === 'touchstart';
		pageX = isTouchEvent ? event.targetTouches[0].pageX : (ev.pageX || ev.clientX);
		pageY = isTouchEvent ? event.targetTouches[0].pageY : (ev.pageY || ev.clientY);

		// get stage position left
		this.drag.offsetX = this.dom.$stage.position().left - this.options.stagePadding;
		this.drag.offsetY = this.dom.$stage.position().top;

		if (this.options.rtl) {
			this.drag.offsetX = this.dom.$stage.position().left + this.width.stage - this.width.el
				+ this.options.margin;
		}

		// catch position // ie to fix
		if (this.state.inMotion && this.support3d) {
			animatedPos = this.getTransformProperty();
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
	 * @desc touchmove/mousemove event
	 * @since 2.0.0
	 */
	Owl.prototype.onDragMove = function(event) {
		var ev, neighbourItemWidth, isTouchEvent, pageX, pageY, minValue, maxValue, pull;

		if (!this.state.isTouch) {
			return;
		}

		if (this.state.isScrolling) {
			return;
		}

		neighbourItemWidth = 0;
		ev = event.originalEvent || event || window.event;

		// if is 'touchstart'
		isTouchEvent = ev.type == 'touchmove';
		pageX = isTouchEvent ? ev.targetTouches[0].pageX : (ev.pageX || ev.clientX);
		pageY = isTouchEvent ? ev.targetTouches[0].pageY : (ev.pageY || ev.clientY);

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
			minValue = this.options.rtl ? this.pos.maxValue : this.pos.minValue;
			maxValue = this.options.rtl ? this.pos.minValue : this.pos.maxValue;
			pull = this.options.pullDrag ? this.drag.distance / 5 : 0;
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
	Owl.prototype.onDragEnd = function() {
		var compareTimes, distanceAbs, closest;

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
		compareTimes = this.drag.endTime - this.drag.startTime;
		distanceAbs = Math.abs(this.drag.distance);

		// to test
		if (distanceAbs > 3 || compareTimes > 300) {
			this.removeClick(this.drag.targetEl);
		}

		closest = this.closest(this.drag.updatedX);

		this.setSpeed(this.options.dragEndSpeed, false, true);
		this.animStage(this.pos.items[closest]);

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
	 * @desc catch stage position while animate (only css3)
	 * @since 2.0.0
	 */
	Owl.prototype.getTransformProperty = function() {
		var transform, matrix3d;

		transform = window.getComputedStyle(this.dom.stage, null).getPropertyValue(this.vendorName + 'transform');
		// var transform = this.dom.$stage.css(this.vendorName + 'transform')
		transform = transform.replace(/matrix(3d)?\(|\)/g, '').split(',');
		matrix3d = transform.length === 16;

		return matrix3d !== true ? transform[4] : transform[12];
	};

	/**
	 * closest
	 * @desc Get closest item after touchend/mouseup
	 * @since 2.0.0
	 * @param [x] -
	 *            curent position in pixels return position in pixels
	 */
	Owl.prototype.closest = function(x) {
		var newX = 0, pull = 30, i;

		if (!this.options.freeDrag) {
			// Check closest item
			for (i = 0; i < this.num.items; i++) {
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
			return x;
		}

		return newX;
	};

	/**
	 * animStage
	 * @desc animate stage position (both css3/css2) and perform onChange
	 *       functions/events
	 * @since 2.0.0
	 * @param [x] -
	 *            curent position in pixels
	 */
	Owl.prototype.animStage = function(pos, bypassEvent) {

		if (pos !== this.pos.stage && bypassEvent !== true){
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
	 * @desc Update current positions
	 * @since 2.0.0
	 * @param [pos] -
	 *            number - new position
	 */
	Owl.prototype.updatePosition = function(position) {
		if (this.num.oItems === 0 || position === undefined) {
			return false;
		}

		this.pos.prev = this.pos.currentAbs;

		if (!this.state.revert && !this.options.loop) {
			position = position > this.pos.max ? this.pos.max : (position <= 0 ? 0 : position);
		} else if (!this.state.revert) {
			position = position >= this.num.oItems ? this.num.oItems - 1 : position;
		}

		var event = this.trigger('change', { property: { name: 'position', value: position } });

		position = event.data ? event.data : position;

		if (this.state.revert) {
			this.pos.current = this.dom.$items.eq(position).data('owl-item').index;
			this.pos.currentAbs = position;
		} else {
			this.pos.current = this.dom.$oItems.eq(position).data('owl-item').index;
			this.pos.currentAbs = this.dom.$oItems.eq(position).data('owl-item').indexAbs;
		}

		this.trigger('changed', { property: { name: 'position', value: position } });
	};

	/**
	 * setSpeed
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
		var s = speed, nextPos = pos, diff, style;

		if ((s === false && s !== 0 && drag !== true) || s === undefined) {

			// Double check this
			// var nextPx = this.pos.items[nextPos];
			// var currPx = this.pos.stage
			// var diff = Math.abs(nextPx-currPx);
			// var s = diff/1
			// if(s>1000){
			// s = 1000;
			// }

			diff = Math.abs(nextPos - this.pos.prev);
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
			style = this.dom.stage.style;
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
	 * @since 2.0.0
	 * @param [pos] -
	 *            number - next position - use this param to calculate
	 *            smartSpeed
	 * @param [update] -
	 *            boolean - if drag is true then smart speed is disabled
	 */
	Owl.prototype.jumpTo = function(pos, bypassEvent) {
		this.updatePosition(pos);
		this.setSpeed(0);
		this.animStage(this.pos.items[this.pos.currentAbs], bypassEvent);
	};

	/**
	 * to
	 * @since 2.0.0
	 * @param [pos] -
	 *            number
	 * @param [speed] -
	 *            speed in ms
	 * @param [speed] -
	 *            speed in ms
	 */
	Owl.prototype.to = function(position, speed) {
		if (this.options.loop) {
			var distance = position - this.pos.current,
				revert = this.pos.currentAbs,
				before = this.pos.currentAbs,
				after = this.pos.currentAbs + distance,
				direction = before - after < 0 ? true : false;

			this.state.revert = true;

			if (after < this.options.items && direction === false) {
				this.state.bypass = true;
				revert = this.num.items - (this.options.items - before) - this.options.items;
				this.jumpTo(revert, true);
			} else if (after >= this.num.items - this.options.items && direction === true) {
				this.state.bypass = true;
				revert = before - this.num.oItems;
				this.jumpTo(revert, true);
			}
			window.clearTimeout(this.e._goToLoop);
			this.e._goToLoop = window.setTimeout($.proxy(function() {
				this.state.bypass = false;
				this.updatePosition(revert + distance);
				this.setSpeed(speed, this.pos.currentAbs);
				this.animStage(this.pos.items[this.pos.currentAbs]);
				this.state.revert = false;
			}, this), 30);
		} else {
			this.updatePosition(position);
			this.setSpeed(speed, this.pos.currentAbs);
			this.animStage(this.pos.items[this.pos.currentAbs]);
		}
	};

	/**
	 * next
	 * @since 2.0.0
	 * @param {number} [speed=false] - The time in milliseconds for the transition.
	 */
	Owl.prototype.next = function(speed) {
		speed = speed || false;
		this.to(this.pos.current + 1, speed);
	};

	/**
	 * prev
	 * @since 2.0.0
	 */
	Owl.prototype.prev = function(speed) {
		speed = speed || false;
		this.to(this.pos.current - 1, speed);
	};

	/**
	 * initPosition
	 * @since 2.0.0
	 */
	Owl.prototype.initPosition = function() {
		if (!this.dom.$oItems) {
			return false;
		}

		var position = this.options.startPosition,
			event = this.trigger('change', { property: { name: 'position', value: position } });

		position = event.data || position;

		if (typeof position !== 'number' || !this.options.center) {
			position = 0;
		}

		this.dom.oStage.scrollLeft = 0;
		this.jumpTo(position, true);

		this.trigger('changed', { property: { name: 'position', value: position } });
	};

	/**
	 * transitionEnd
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
		this.trigger('translated');
	};

	/**
	 * isElWidthChanged
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

	Owl.prototype.insertContent = function(content) {
		this.dom.$stage.empty();
		this.fetchContent(content);
		this.refresh();
	};

	/**
	 * addItem - Add an item
	 * @since 2.0.0
	 * @param [content] -
	 *            dom element / string '<div>content</div>'
	 * @param [pos] -
	 *            number - position
	 */
	Owl.prototype.addItem = function(content, position) {
		var $item = this.createItemContainer();

		position = position || 0;
		// wrap content
		this.initializeItemContainer($item, content);
		// if carousel is empty then append item
		if (this.dom.$oItems.length === 0) {
			this.dom.$stage.append($item);
		} else {
			// append item
			if (pos !== -1) {
				this.dom.$oItems.eq(position).before($item);
			} else {
				this.dom.$oItems.eq(position).after($item);
			}
		}
		// update and calculate carousel
		this.refresh();
	};

	/**
	 * removeItem - Remove an Item
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
			'to': this.to,
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
	 * @since 2.0.0
	 */
	Owl.prototype.onChange = function() {
		if (this.state.isTouch || this.state.bypass) {
			return;
		}

		this.updateActiveItems();
		this.storeInfo();
	};

	/**
	 * storeInfo store basic information about current states
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
	 * @desc still to test
	 * @since 2.0.0
	 */
	Owl.prototype.preloadAutoWidthImages = function(imgs) {
		var loaded, that, $el, img;

		loaded = 0;
		that = this;
		imgs.each(function(i, el) {
			$el = $(el);
			img = new Image();

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

		// Remove event handlers in the ".owl.carousel" namespace
		this.dom.$el.off('.owl');

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
	 * @since 2.0.0
	 * @param event -
	 *            string - event name
	 * @param data -
	 *            object - additional options - to do
	 * @param namespace
	 */
	Owl.prototype.trigger = function(name, data, namespace) {
		var status = {
			item: { count: this.num.oItems, index: this.pos.current }
		}, handler = $.camelCase(
			$.grep([ 'on', name, namespace ],
			function(v) { return v }).join('-').toLowerCase()
		), event = $.Event(
			[ name, 'owl', namespace || 'carousel' ].join('.').toLowerCase(),
			$.extend(status, data)
		);

		$.each(this.plugins, function(name, plugin) {
			if (plugin.onTrigger) {
				plugin.onTrigger(event);
			}
		});

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
