/**
 * Owl carousel
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 * @todo Lazy Load Icon
 * @todo prevent animationend bubling
 * @todo itemsScaleUp
 * @todo Test Zepto
 * @todo stagePadding calculate wrong active classes
 */
;(function($, window, document, undefined) {

	var defaults, item, dom, width, num, pos, drag, speed, state, e;

	/**
	 * Default options for the carousel.
	 * @private
	 * @todo Better as public member of `Owl`
	 */
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

	/**
	 * Template for the data of each item respectively its DOM element.
	 * @private
	 */
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

	/**
	 * Template for the references to DOM elements, those with `$` sign are `jQuery` objects.
	 * @private
	 */
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
	 * Template for the widths of some elements.
	 * @private
	 */
	width = {
		el: 0,
		stage: 0,
		item: 0,
		prevWindow: 0,
		cloneLast: 0
	};

	/**
	 * Template for counting to some properties.
	 * @private
	 */
	num = {
		items: 0,
		oItems: 0,
		cItems: 0,
		active: 0,
		merged: []
	};

	/**
	 * Template for some informations about the position.
	 * @private
	 */
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

	/**
	 * Template for status information about drag and touch events.
	 * @private
	 */
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

	/**
	 * Template for some speed informations.
	 * @private
	 */
	speed = {
		onDragEnd: 300,
		css2speed: 0
	};

	/**
	 * Template for some status informations.
	 * @private
	 */
	state = {
		isTouch: false,
		isScrolling: false,
		isSwiping: false,
		direction: false,
		inMotion: false
	};

	/**
	 * Event functions references.
	 * @private
	 */
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

	/**
	 * Creates a carousel.
	 * @class The Owl Carousel.
	 * @public
	 * @param {HTMLElement|jQuery} element - The element to create the carousel for.
	 * @param {Object} [options] - The options
	 */
	function Owl(element, options) {

		// add basic Owl information to dom element
		element.owlCarousel = {
			'name': 'Owl Carousel',
			'author': 'Bartosz Wojciechowski',
			'version': '2.0.0-beta.2.1'
		};

		/**
		 * Current settings for the carousel.
		 * @protected
		 */
		this.options = $.extend({}, defaults, options);

		/**
		 * @protected
		 * @todo Must be dosumented.
		 */
		this._options = $.extend({}, defaults, this.options);

		/**
		 * Template for the data of each item.
		 * @protected
		 */
		this.itemData = $.extend({}, item);

		/**
		 * Contains references to DOM elements, those with `$` sign are `jQuery` objects.
		 * @protected
		 */
		this.dom = $.extend({}, dom);

		/**
		 * Caches the widths of some elements.
		 * @protected
		 */
		this.width = $.extend({}, width);

		/**
		 * Caches some count informations.
		 * @protected
		 */
		this.num = $.extend({}, num);

		/**
		 * Caches some position informations.
		 * @protected
		 */
		this.pos = $.extend({}, pos);

		/**
		 * Caches informations about drag and touch events.
		 */
		this.drag = $.extend({}, drag);

		/**
		 * Caches some speed settings.
		 * @protected
		 */
		this.speed = $.extend({}, speed);

		/**
		 * Caches some status informations.
		 * @protected
		 */
		this.state = $.extend({}, state);

		/**
		 * @protected
		 * @todo Must be documented
		 */
		this.e = $.extend({}, e);

		/**
		 * References to the running plugins of this carousel.
		 * @protected
		 */
		this.plugins = {};

		/**
		 * Currently suppressed events to prevent them from beeing retriggered.
		 * @protected
		 * @see `addTriggerableEvents()`
		 */
		this.suppressedEvents = {};

		this.dom.el = element;
		this.dom.$el = $(element);

		for (var plugin in Owl.Plugins) {
			this.plugins[plugin] = new Owl.Plugins[plugin](this);
		}

		this.init();
	}

	/**
	 * Contains all registered plugins.
	 * @public
	 */
	Owl.Plugins = {};

	/**
	 * Initializes the carousel.
	 * @protected
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
	 * Sorts responsive sizes.
	 * @protected
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
	 * Sets responsive options.
	 * @protected
	 */
	Owl.prototype.setResponsiveOptions = function() {
		if (this.options.responsive === false) {
			return false;
		}

		var width, i, j, k, minWidth;

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
	 * Updates option logic if necessery.
	 * @protected
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
	 * Creates stage and outer-stage elements.
	 * @protected
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
	 * Creates an item container.
	 * @protected
	 * @returns {jQuery} - The item container.
	 */
	Owl.prototype.createItemContainer = function() {
		var item = document.createElement(this.options.itemElement);
		item.className = this.options.itemClass;
		return $(item);
	};

	/**
	 * Fetches the content.
	 * @protected
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
	 * Initializes the content struture.
	 * @protected
	 */
	Owl.prototype.initStructure = function() {
		this.createNormalStructure();
	};

	/**
	 * Creates small/mid weight content structure.
	 * @protected
	 * @todo This results in a poor performance,
	 * but this is due to the approach of completely
	 * rebuild the existing DOM tree from scratch,
	 * rather to use them. The effort to implement
	 * this with a good performance, while maintaining
	 * the original approach is disproportionate.
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
	 * Creates custom content structure.
	 * @protected
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
	 * Initializes item container with provided content.
	 * @protected
	 * @param {jQuery} item - The item that has to be filled.
	 * @param {HTMLElement|jQuery|string} content - The content that fills the item.
	 */
	Owl.prototype.initializeItemContainer = function(item, content) {
		this.trigger('change', { property: { name: 'item', value: item } });

		this.createItemContainerData(item);
		item.append(content);

		this.trigger('changed', { property: { name: 'item', value: item } });
	};

	/**
	 * Creates item container data.
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
	 * Updates original items index data.
	 * @protected
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
	 * Creates clones for infinity loop.
	 * @protected
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
	 * Update cloned elements.
	 * @protected
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
	 * Updates all items index data.
	 * @protected
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
	 * Updates original items boundaries.
	 * @protected
	 */
	Owl.prototype.setMinMax = function() {

		var i, minimum, revert;

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
	 * Set sizes on elements from `collectData`.
	 * @protected
	 * @todo CRAZY FIX!!! Doublecheck this!
	 */
	Owl.prototype.setSizes = function() {

		// show neighbours
		if (this.options.stagePadding !== false) {
			this.dom.oStage.style.paddingLeft = this.options.stagePadding + 'px';
			this.dom.oStage.style.paddingRight = this.options.stagePadding + 'px';
		}

		// if(this.width.stagePrev > this.width.stage){
		if (this.options.rtl) {
			window.setTimeout($.proxy(function() {
				this.dom.stage.style.width = this.width.stage + 'px';
			}, this), 0);
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
	 * Updates all data by calling `refresh`.
	 * @protected
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
	 * Refreshes the carousel primarily for adaptive purposes.
	 * @public
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
		} else {
			this.jumpTo(this.pos.current, false); // fix that
		}

		this.state.orientation = window.orientation;

		this.watchVisibility();

		this.trigger('refreshed');
	};

	/**
	 * Updates information about current state of items (visibile, hidden, active, etc.).
	 * @protected
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
	 * Sets current state on sibilings items for center.
	 * @protected
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
	 * Save internal event references and add event based functions.
	 * @protected
	 */
	Owl.prototype.eventsCall = function() {
		// Save events references
		this.e._onDragStart = $.proxy(function(e) {
			this.onDragStart(e);
		}, this);
		this.e._onDragMove = $.proxy(function(e) {
			this.onDragMove(e);
		}, this);
		this.e._onDragEnd = $.proxy(function(e) {
			this.onDragEnd(e);
		}, this);
		this.e._transitionEnd = $.proxy(function(e) {
			this.transitionEnd(e);
		}, this);
		this.e._resizer = $.proxy(function() {
			this.responsiveTimer();
		}, this);
		this.e._responsiveCall = $.proxy(function() {
			this.responsive();
		}, this);
		this.e._preventClick = $.proxy(function(e) {
			this.preventClick(e);
		}, this);
	};

	/**
	 * Checks window `resize` event.
	 * @protected
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
	 * Checks for touch/mouse drag options and add necessery event handlers.
	 * @protected
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
	 * Triggers event handlers for drag events.
	 * @protected
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
	 * Handles touchstart/mousedown event.
	 * @protected
	 * @param {Event} event - The event arguments.
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
	 * Handles the touchmove/mousemove events.
	 * @protected
	 * @param {Event} event - The event arguments.
	 */
	Owl.prototype.onDragMove = function(event) {
		var ev, isTouchEvent, pageX, pageY, minValue, maxValue, pull;

		if (!this.state.isTouch) {
			return;
		}

		if (this.state.isScrolling) {
			return;
		}

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
	 * Handles the touchend/mouseup events.
	 * @protected
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
	 * Attaches `preventClick` to disable link while swipping.
	 * @protected
	 * @param {HTMLElement} [target] - The target of the `click` event.
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
	 * Suppresses click event.
	 * @protected
	 * @param {Event} ev - The event arguments.
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
	 * Catches stage position while animate (only CSS3).
	 * @protected
	 * @returns
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
	 * Gets closest item index for a coordinate.
	 * @protected
	 * @param {Number} x - The coordinate on the x axis in pixel.
	 * @return {Number} - The item's index.
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
	 * Animates stage position (both css3/css2).
	 * @protected
	 * @param {Number} pos - The curent position in pixels.
	 * @param {Boolean} bypassEvent - Wether the animation end event should be triggered or not.
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
			}, this.speed.css2speed, this.options.fallbackEasing, $.proxy(function() {
				if (this.state.inMotion) {
					this.transitionEnd();
				}
			}, this));
		}

		this.onChange();
	};

	/**
	 * Updates the current position.
	 * @protected
	 * @param {Number} position - The new position.
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
	 * Sets the animation speed.
	 * @protected
	 * @param {Number} speed - The animation speed in milliseconds.
	 * @param {Number} [pos] - The next position, used to calculate `smartSpeed`
	 * @param {Boolean} [drag] - Wether the `smartSpeed` should be disabled or not.
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
	 * Jumps to a specified position without animating.
	 * @protected
	 * @param {Number} pos - The position to jump to.
	 * @param {Boolean} bypassEvent - Wether the animation end event shoudl be triggered or not.
	 */
	Owl.prototype.jumpTo = function(pos, bypassEvent) {
		this.updatePosition(pos);
		this.setSpeed(0);
		this.animStage(this.pos.items[this.pos.currentAbs], bypassEvent);
	};

	/**
	 * Slides to the specified item.
	 * @public
	 * @param {Number} position - The position of the item.
	 * @param {Number} [speed] - The time in milliseconds for the transition.
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
	 * Slides to the next item.
	 * @public
	 * @param {Number} [speed=false] - The time in milliseconds for the transition.
	 */
	Owl.prototype.next = function(speed) {
		speed = speed || false;
		this.to(this.pos.current + 1, speed);
	};

	/**
	 * Slides to the previous item.
	 * @public
	 * @param {Number} [speed=false] - The time in milliseconds for the transition.
	 */
	Owl.prototype.prev = function(speed) {
		speed = speed || false;
		this.to(this.pos.current - 1, speed);
	};

	/**
	 * Initializes the current position.
	 * @protected
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
	 * Handles the end of an animation.
	 * @protected
	 * @param {Event} event - The event arguments.
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
	 * Checks if element width has changed
	 * @protected
	 * @returns {Booelan}
	 */
	Owl.prototype.isElWidthChanged = function() {
		var newElWidth = this.dom.$el.width() - this.options.stagePadding, // to
		// check
		prevElWidth = this.width.el + this.options.margin;
		return newElWidth !== prevElWidth;
	};

	/**
	 * Gets `window`/`responsiveBaseElement` width.
	 * @protected
	 * @return {Number} - The width in pixel.
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
	 * Replaces the current content.
	 * @public
	 * @param {HTMLElement|jQuery|String} content - The new content.
	 */
	Owl.prototype.insertContent = function(content) {
		this.dom.$stage.empty();
		this.fetchContent(content);
		this.refresh();
	};

	/**
	 * Adds an item.
	 * @public
	 * @param {HTMLElement|jQuery|String} content - The item content to add.
	 * @param {Number} [position=0] - The position at which to insert the item.
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
	 * Removes an item.
	 * @public
	 * @param {Number} pos - The position of the item.
	 */
	Owl.prototype.removeItem = function(pos) {
		this.dom.$oItems.eq(pos).remove();
		this.refresh();
	};

	/**
	 * Adds triggerable events.
	 * @protected
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
	 * Watches the visibility of the carousel element.
	 * @protected
	 */
	Owl.prototype.watchVisibility = function() {

		// test on zepto
		if (!isElVisible(this.dom.el)) {
			this.dom.$el.addClass('owl-hidden');
			window.clearInterval(this.e._checkVisibile);
			this.e._checkVisibile = window.setInterval($.proxy(checkVisible, this), 500);
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
	 * Handles changes of the carousel.
	 * @proteted
	 */
	Owl.prototype.onChange = function() {
		if (this.state.isTouch || this.state.bypass) {
			return;
		}

		this.updateActiveItems();
		this.storeInfo();
	};

	/**
	 * Store basic information about current states.
	 * @protected
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
	 * Preloads images with auto width.
	 * @protected
	 * @todo Still to test
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
	 * Destroys the carousel.
	 * @public
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
	 * Operators to calculate right-to-left and left-to-right.
	 * @protected
	 * @param {Number} [a] - The left side operand.
	 * @param {String} [o] - The operator.
	 * @param {Number} [b] - The right side operand.
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
	 * Attaches to an internal event.
	 * @protected
	 * @param {HTMLElement} element - The event source.
	 * @param {String} event - The event name.
	 * @param {Function} listener - The event handler to attach.
	 * @param {Boolean} capture - Wether the event should be handled at the capturing phase or not.
	 */
	Owl.prototype.on = function(element, event, listener, capture) {
		if (element.addEventListener) {
			element.addEventListener(event, listener, capture);
		} else if (element.attachEvent) {
			element.attachEvent('on' + event, listener);
		}
	};

	/**
	 * Detaches from an internal event.
	 * @protected
	 * @param {HTMLElement} element - The event source.
	 * @param {String} event - The event name.
	 * @param {Function} listener - The attached event handler to detach.
	 * @param {Boolean} capture - Wether the attached event handler was registered as a capturing listener or not.
	 */
	Owl.prototype.off = function(element, event, listener, capture) {
		if (element.removeEventListener) {
			element.removeEventListener(event, listener, capture);
		} else if (element.detachEvent) {
			element.detachEvent('on' + event, listener);
		}
	};

	/**
	 * Triggers an public event.
	 * @protected
	 * @param {String} name - The event name.
	 * @param {*} [data=null] - The event data.
	 * @param {String} [namespace=.owl.carousel] - The event namespace.
	 * @returns {Event} - The event arguments.
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
	 * Checks the availability of some browser features.
	 * @protected
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

	/**
	 * Checks for CSS support.
	 * @private
	 * @param {Array} array - The CSS properties to check for.
	 * @returns {Array} - Contains the supported CSS property name and its index or `false`.
	 */
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

	/**
	 * Checks for CSS transition support.
	 * @private
	 * @todo Realy bad design
	 * @returns {Number}
	 */
	function isTransition() {
		return isStyleSupported([ 'transition', 'WebkitTransition', 'MozTransition', 'OTransition' ])[1];
	}

	/**
	 * Checks for CSS transform support.
	 * @private
	 * @returns {String} The supported property name or false.
	 */
	function isTransform() {
		return isStyleSupported([ 'transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform' ])[0];
	}

	/**
	 * Checks for CSS perspective support.
	 * @private
	 * @returns {String} The supported property name or false.
	 */
	function isPerspective() {
		return isStyleSupported([ 'perspective', 'webkitPerspective', 'MozPerspective', 'OPerspective', 'MsPerspective' ])[0];
	}

	/**
	 * Checks wether touch is supported or not.
	 * @private
	 * @returns {Boolean}
	 */
	function isTouchSupport() {
		return 'ontouchstart' in window || !!(navigator.msMaxTouchPoints);
	}

	/**
	 * Checks wether touch is supported or not for IE.
	 * @private
	 * @returns {Boolean}
	 */
	function isTouchSupportIE() {
		return window.navigator.msPointerEnabled;
	}

	/**
	 * The jQuery Plugin for the Owl Carousel
	 * @public
	 */
	$.fn.owlCarousel = function(options) {
		return this.each(function() {
			if (!$(this).data('owlCarousel')) {
				$(this).data('owlCarousel', new Owl(this, options));
			}
		});
	};

	/**
	 * The constructor for the jQuery Plugin
	 * @public
	 */
	$.fn.owlCarousel.Constructor = Owl;

})(window.Zepto || window.jQuery, window, document);

/**
 * LazyLoad Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the lazy load plugin.
	 * @class The Lazy Load Plugin
	 * @param {Owl} scope - The Owl Carousel
	 */
	LazyLoad = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, LazyLoad.Defaults, this.owl.options);

		if (!this.owl.options.lazyLoad) {
			return;
		}

		this.handlers = {
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.property.name == 'items' && e.property.value && !e.property.value.is(':empty')) {
					this.check();
				}
			}, this)
		};

		this.owl.dom.$el.on(this.handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	LazyLoad.Defaults = {
		lazyLoad: false
	};

	/**
	 * Checks all items and if necessary, calls `preload`.
	 * @protected
	 */
	LazyLoad.prototype.check = function() {
		var attr = window.devicePixelRatio > 1 ? 'data-src-retina' : 'data-src',
			src, img, i, $item;

		for (i = 0; i < this.owl.num.items; i++) {
			$item = this.owl.dom.$items.eq(i);

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

	/**
	 * Preloads the images of an item.
	 * @protected
	 * @param {jQuery} images - The images to load.
	 * @param {jQuery} $item - The item for which the images are loaded.
	 */
	LazyLoad.prototype.preload = function(images, $item) {
		var $el, img, srcType;

		images.each($.proxy(function(i, el) {

			this.owl.trigger('load', null, 'lazy');

			$el = $(el);
			img = new Image();
			srcType = window.devicePixelRatio > 1 ? $el.attr('data-src-retina') : $el.attr('data-src');
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

	/**
	 * Destroys the plugin.
	 * @public
	 */
	LazyLoad.prototype.destroy = function() {
		var handler, property;

		for (handler in this.handlers) {
			this.owl.dom.$el.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.lazyLoad = LazyLoad;

})(window.Zepto || window.jQuery, window, document);

/**
 * AutoHeight Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the auto height plugin.
	 * @class The Auto Height Plugin
	 * @param {Owl} scope - The Owl Carousel
	 */
	AutoHeight = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, AutoHeight.Defaults, this.owl.options);

		this.handlers = {
			'refreshed.owl.carousel changed.owl.carousel': $.proxy(function() {
				if (this.owl.options.autoHeight) {
					this.setHeight();
				}
			}, this)
		};

		this.owl.dom.$el.on(this.handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	AutoHeight.Defaults = {
		autoHeight: false,
		autoHeightClass: 'owl-height'
	};

	/**
	 *
	 * @param {Boolean} callback - Whether
	 * @returns {Boolean}
	 */
	AutoHeight.prototype.setHeight = function() {
		var loaded = this.owl.dom.$items.eq(this.owl.pos.currentAbs),
			stage = this.owl.dom.$oStage,
			iterations = 0,
			isLoaded;

		if (!this.owl.dom.$oStage.hasClass(this.owl.options.autoHeightClass)) {
			this.owl.dom.$oStage.addClass(this.owl.options.autoHeightClass);
		}

		isLoaded = window.setInterval(function() {
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
		var handler, property;

		for (handler in this.handlers) {
			this.owl.dom.$el.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.autoHeight = AutoHeight;

})(window.Zepto || window.jQuery, window, document);

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
				if (this.owl.options.video && !this.isInFullScreen()) {
					e.preventDefault();
				}
			}, this),
			'refresh.owl.carousel changed.owl.carousel': $.proxy(function(e) {
				if (this.owl.state.videoPlay) {
					this.stopVideo();
				}
			}, this),
			'refresh.owl.carousel refreshed.owl.carousel': $.proxy(function(e) {
				if (!this.owl.options.video) {
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
			width = videoEl.data('width') || this.owl.options.videoWidth,
			height = videoEl.data('height') || this.owl.options.videoHeight,
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
					if (that.options.loop) {
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
			item = target.closest('.' + this.owl.options.itemClass);

		videoType = item.data('owl-item').videoType, id = item.data('owl-item').videoId, width = item
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

/**
 * Animate Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the animate plugin.
	 * @class The Navigation Plugin
	 * @param {Owl} scope - The Owl Carousel
	 */
	Animate = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, Animate.Defaults, this.owl.options);
		this.swapping = true;

		if (!this.owl.options.animateIn && !this.owl.options.animateOut) {
			return;
		}

		this.handlers = {
			'drag.owl.carousel dragged.owl.carousel translated.owl.carousel': $.proxy(function(e) {
				this.swapping = e.type == 'translated';
			}, this),
			'translate.owl.carousel': $.proxy(function(e) {
				if (this.swapping) {
					this.swap();
				}
			}, this)
		};

		this.owl.dom.$el.on(this.handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	Animate.Defaults = {
		animateOut: false,
		animateIn: false
	};

	/**
	 * Toggles the animation classes whenever an translations starts.
	 * @protected
	 * @returns {Boolean|undefined}
	 */
	Animate.prototype.swap = function() {

		if (this.owl.options.items !== 1 || !this.owl.support3d) {
			return false;
		}

		this.owl.setSpeed(0);

		var pos, tIn, tOut, that,
			prevItem = this.owl.dom.$items.eq(this.owl.pos.prev),
			prevPos = Math.abs(prevItem.data('owl-item').width) * this.owl.pos.prev,
			currentItem = this.owl.dom.$items.eq(this.owl.pos.currentAbs),
			currentPos = Math.abs(currentItem.data('owl-item').width) * this.owl.pos.currentAbs;

		if (this.owl.pos.currentAbs === this.owl.pos.prev) {
			return false;
		}

		pos = currentPos - prevPos;
		tIn = this.owl.options.animateIn;
		tOut = this.owl.options.animateOut;
		that = this.owl;

		removeStyles = function() {
			$(this).css({
				'left': ''
			}).removeClass('animated owl-animated-out owl-animated-in').removeClass(tIn).removeClass(tOut);

			that.transitionEnd();
		};

		if (tOut) {
			prevItem.css({
				'left': pos + 'px'
			}).addClass('animated owl-animated-out ' + tOut).one(
				'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', removeStyles);
		}

		if (tIn) {
			currentItem.addClass('animated owl-animated-in ' + tIn).one(
				'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', removeStyles);
		}
	};

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Animate.prototype.destroy = function() {
		var handler, property;

		for (handler in this.handlers) {
			this.owl.dom.$el.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.animate = Animate;

})(window.Zepto || window.jQuery, window, document);

/**
 * Autoplay Plugin
 * @version 2.0.0
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/**
	 * Creates the autoplay plugin.
	 * @class The Autoplay Plugin
	 * @param {Owl} scope - The Owl Carousel
	 */
	Autoplay = function(scope) {
		this.owl = scope;
		this.owl.options = $.extend({}, Autoplay.Defaults, this.owl.options);

		this.handlers = {
			'translated.owl.carousel refreshed.owl.carousel': $.proxy(function() {
				this.autoplay();
			}, this),
			'play.owl.autoplay': $.proxy(function(e, t, s) {
				this.play(t, s);
			}, this),
			'stop.owl.autoplay': $.proxy(function() {
				this.stop();
			}, this),
			'mouseover.owl.autoplay': $.proxy(function() {
				if (this.owl.options.autoplayHoverPause) {
					this.pause();
				}
			}, this),
			'mouseleave.owl.autoplay': $.proxy(function() {
				if (this.owl.options.autoplayHoverPause) {
					this.autoplay();
				}
			}, this)
		};

		this.owl.dom.$el.on(this.handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	Autoplay.Defaults = {
		autoplay: false,
		autoplayTimeout: 5000,
		autoplayHoverPause: false,
		autoplaySpeed: false
	};

	/**
	 * @protected
	 * @todo Must be documented.
	 */
	Autoplay.prototype.autoplay = function() {
		if (this.owl.options.autoplay && !this.owl.state.videoPlay) {
			window.clearInterval(this.apInterval);

			this.apInterval = window.setInterval($.proxy(function() {
				this.play();
			}, this), this.owl.options.autoplayTimeout);
		} else {
			window.clearInterval(this.apInterval);
			this.autoplayState = false;
		}
	};

	/**
	 * Starts the autoplay.
	 * @public
	 * @param {Number} [timeout] - ...
	 * @param {Number} [speed] - ...
	 * @returns {Boolean|undefined} - ...
	 * @todo Must be documented.
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
			this.owl.to(0);
		} else {
			this.owl.next(this.owl.options.autoplaySpeed);
		}
		this.autoplayState = true;
	};

	/**
	 * Stops the autoplay.
	 * @public
	 */
	Autoplay.prototype.stop = function() {
		this.owl._options.autoplay = this.owl.options.autoplay = false;
		this.autoplayState = false;
		window.clearInterval(this.apInterval);
	};

	/**
	 * Pauses the autoplay.
	 * @public
	 */
	Autoplay.prototype.pause = function() {
		window.clearInterval(this.apInterval);
	};

	/**
	 * Destroys the plugin.
	 */
	Autoplay.prototype.destroy = function() {
		var handler, property;

		window.clearInterval(this.apInterval);

		for (handler in this.handlers) {
			this.owl.dom.$el.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};

	$.fn.owlCarousel.Constructor.Plugins.autoplay = Autoplay;

})(window.Zepto || window.jQuery, window, document);

/**
 * Navigation Plugin
 * @version 2.0.0
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
	'use strict';

	/**
	 * Creates the animate plugin.
	 * @class The Navigation Plugin
	 * @param {Owl} carousel - The Owl Carousel.
	 */
	var Navigation = function(carousel) {
		// define members
		this.core = carousel;
		this.core.options = $.extend({}, Navigation.Defaults, this.core.options);
		this.refreshing = false;
		this.initialized = false;
		this.page = null;
		this.pages = [];
		this.controls = {};
		this.template = null;
		this.$element = this.core.dom.$el;

		// check plugin is enabled
		if (!this.core.options.nav && !this.core.options.dots) {
			return false;
		}

		// define the event handlers
		this.handlers = {
			'initialized.owl.carousel': $.proxy(function() {
				if (!this.initialized) {
					this.initialize();
				}
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (e.property.name == 'items' && this.initialized) {
					this.update();
				}
				if (this.filling) {
					e.property.value.data('owl-item').dot
						= $(':first-child', e.property.value).find('[data-dot]').andSelf().data('dot');
				}
			}, this),
			'change.owl.carousel': $.proxy(function(e) {
				if (e.property.name == 'position' && !this.core.state.revert
					&& !this.core.options.loop && this.core.options.navRewind) {
					var position = this.core.pos;
					e.data = e.property.value > position.max
						? position.current >= position.max ? position.min : position.max
						: e.property.value < 0 ? position.max : e.property.value;
				}
				this.filling
					= this.core.options.dotsData && e.property.name == 'item' && e.property.value && e.property.value.is(':empty');
			}, this),
			'refresh.owl.carousel refreshed.owl.carousel': $.proxy(function(e) {
				this.refreshing = e.type == 'refresh';
			}, this),
			'refreshed.owl.carousel': $.proxy(function() {
				if (this.initialized) {
					this.refresh();
				}
			}, this)
		};

		// register the event handlers
		this.$element.on(this.handlers);
	}

	/**
	 * Default options.
	 * @public
	 * @todo Rename `slideBy` to `navBy`
	 */
	Navigation.Defaults = {
		nav: false,
		navRewind: true,
		navText: [ 'prev', 'next' ],
		navSpeed: false,
		navElement: 'div',
		navContainer: false,
		navContainerClass: 'owl-nav',
		navClass: [ 'owl-prev', 'owl-next' ],
		slideBy: 1,
		dotClass: 'owl-dot',
		dotsClass: 'owl-dots',
		dots: true,
		dotsEach: false,
		dotData: false,
		dotsSpeed: false,
		dotsContainer: false,
		controlsClass: 'owl-controls'
	}

	/**
	 * Initializes the plugin.
	 * @protected
	 */
	Navigation.prototype.initialize = function() {
		var $container,
			options = this.core.options;

		// refresh internal data
		this.refresh();

		// create the indicator template
		if (!options.dotsData) {
			this.template = $('<div>')
				.addClass(options.dotClass)
				.append($('<span>'))
				.prop('outerHTML');
		}

		// create controls container if needed
		if (!options.navContainer || !options.dotsContainer) {
			this.controls.$container = $('<div>')
				.addClass(options.controlsClass)
				.appendTo(this.$element);
		}

		// create DOM structure for absolute navigation
		if (options.dots) {
			this.$indicators = options.dotsContainer ? $(options.dotsContainer)
				: $('<div>').addClass(options.dotsClass).appendTo(this.controls.$container);

			this.$indicators.on(this.core.dragType[2], 'div', $.proxy(function(e) {
				var index = $(e.target).parent().is(this.$indicators)
					? $(e.target).index() : $(e.target).parent().index();

				e.preventDefault();

				this.core.to(
					this.pages[index].start,
					options.dotsSpeed
				);
			}, this));
		}

		// create DOM structure for relative navigation
		if (options.nav) {
			$container = options.navContainer ? $(options.navContainer)
				: $('<div>').addClass(options.navContainerClass).prependTo(this.controls.$container);

			this.controls.$next = $('<' + options.navElement + '>');
			this.controls.$previous = this.controls.$next.clone();

			this.controls.$previous
				.addClass(options.navClass[0])
				.text(options.navText[0])
				.prependTo($container)
				.on(this.core.dragType[2], $.proxy(function(e) {
					this.core.to(this.core.pos.current - options.slideBy);
				}, this));
			this.controls.$next
				.addClass(options.navClass[1])
				.text(options.navText[1])
				.appendTo($container)
				.on(this.core.dragType[2], $.proxy(function(e) {
					this.core.to(this.core.pos.current + options.slideBy);
				}, this));
		}

		// update the created DOM structures
		this.update();

		this.initialized = true;
	}

	/**
	 * Destroys the plugin.
	 * @protected
	 */
	Navigation.prototype.destroy = function() {
		var handler, control, property;

		for (handler in this.handlers) {
			this.$element.off(handler, this.handlers[handler]);
		}
		for (control in this.controls) {
			this.controls[control].remove();
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	}

	/**
	 * Refreshes the internal data of the plugin.
	 * @protected
	 */
	Navigation.prototype.refresh = function() {
		var i, j, k,
			options = this.core.options,
			lower = this.core.num.cItems / 2,
			upper = this.core.num.items - lower,
			items = this.core.num.oItems,
			size = options.center || options.autoWidth || options.dotData
				? 1 : options.dotsEach || options.items;

		if (options.nav) {
			options.navRewind = items > options.items || options.center;

			if (options.slideBy && options.slideBy === 'page') {
				options.slideBy = options.items;
			} else {
				options.slideBy = Math.min(options.slideBy, options.items);
			}
		}

		if (options.dots) {
			this.pages = [];

			for (i = lower, j = 0, k = 0; i < upper; i++) {
				if (j >= size || j === 0) {
					this.pages.push({
						start: i - lower,
						end: i - lower + size - 1
					});
					j = 0, ++k;
				}
				j += this.core.num.merged[i];
			}
		}
	}

	/**
	 * Updates the DOM structures of the plugin.
	 * @protected
	 */
	Navigation.prototype.update = function() {
		var difference, i, html = '',
			options = this.core.options,
			$items = this.core.dom.$oItems,
			index = this.core.pos.current;

		if (options.nav && !options.loop && !options.navRewind) {
			this.controls.$previous.toggleClass('disabled', index <= 0);
			this.controls.$next.toggleClass('disabled', index >= this.core.pos.max);
		}

		if (options.dots) {
			difference = this.pages.length - this.$indicators.children().length;

			this.page = $.grep(this.pages, function(o) {
				return o.start <= index && o.end >= index;
			}).pop();

			if (difference > 0) {
				for (i = 0; i < Math.abs(difference); i++) {
					html += options.dotData ? $items.eq(i).data('owl-item').dot : this.template;
				}
				this.$indicators.append(html);
			} else if (difference < 0) {
				this.$indicators.children().slice(difference).remove();
			}

			this.$indicators.find('.active').removeClass('active');
			this.$indicators.children().eq(this.pages.indexOf(this.page) % $items.length).addClass('active');
		}
	}

	/**
	 * Extends event data.
	 * @protected
	 * @param {Event} event - The event object which gets thrown.
	 */
	Navigation.prototype.onTrigger = function(event) {
		var options = this.core.options;

		event.page = {
			index: this.pages.indexOf(this.page),
			count: this.pages.length,
			size: options.center || options.autoWidth || options.dotData
				? 1 : options.dotsEach || options.items
		};
	}

	$.fn.owlCarousel.Constructor.Plugins.Navigation = Navigation;

})(window.Zepto || window.jQuery, window, document);

/**
 * Hash Plugin
 * @version 2.0.0
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
	'use strict';

	/**
	 * Creates the hash plugin.
	 * @class The Hash Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var Hash = function(carousel) {
		// define members
		this.carousel = carousel;
		this.options = $.extend({}, Hash.Defaults, this.carousel.options);
		this.hashes = {};
		this.$element = this.carousel.dom.$el;

		// check plugin is enabled
		if (!this.options.URLhashListener) {
			return false;
		}

		// defines event handlers
		this.handlers = {
			'initialized.owl.carousel': $.proxy(function() {
				if (window.location.hash.substring(1)) {
					$(window).trigger('hashchange.owl.navigation');
				}
			}, this),
			'changed.owl.carousel': $.proxy(function(e) {
				if (this.filling) {
					e.property.value.data('owl-item').hash
						= $(':first-child', e.property.value).find('[data-hash]').andSelf().data('hash');
					this.hashes[e.property.value.data('owl-item').hash] = e.property.value;
				}
			}, this),
			'change.owl.carousel': $.proxy(function(e) {
				if (e.property.name == 'position' && e.property.value == 'URLHash') {
					e.data = this.hashes[window.location.hash.substring(1)];
				}
				this.filling = e.property.name == 'item' && e.property.value && e.property.value.is(':empty');
			}, this),
		};

		// register the event handlers
		this.$element.on(this.handlers);

		// register event listener for hash navigation
		$(window).on('hashchange.owl.navigation', $.proxy(function() {
			var hash = window.location.hash.substring(1),
				position = this.hashes[hash] && this.hashes[hash].index() || 0;

			if (!hash) {
				return false;
			}

			this.carousel.dom.oStage.scrollLeft = 0;
			this.carousel.to(position);
		}, this));
	}

	/**
	 * Default options.
	 * @public
	 */
	Hash.Defaults = {
		URLhashListener: false
	}

	/**
	 * Destroys the plugin.
	 * @public
	 */
	Hash.prototype.destroy = function() {
		var handler, property;

		$(window).off('hashchange.owl.navigation');

		for (handler in this.handlers) {
			this.owl.dom.$el.off(handler, this.handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	}

	$.fn.owlCarousel.Constructor.Plugins.Hash = Hash;

})(window.Zepto || window.jQuery, window, document);
