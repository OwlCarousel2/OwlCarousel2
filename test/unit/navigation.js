module('Navigation tests');

/**
 * Get a random new slide index (meaning, it should be different from the
 * current one.
 */
function getRandomSlide(carousel) {
	var newIndex;
	do {
		newIndex = Math.floor(Math.random() * (carousel._items.length));
	} while (newIndex == carousel._current);

	return newIndex;
}

/**
 * Add the needed markup and init the carousel with target settings
 */
function initCarouselWCustomNav(settings) {
	var carouselElement = $('#simple');
	var dots = $('<div class="custom-dots">').insertAfter(carouselElement);
	var carousel;
	
	// Add a couple of extra items for a broader number to pick from
	carouselElement.append('<li>')
		.append('<li>')
		.append('<li>');
	// Create a custom navigation block with existing elements for dots.
	// To make it easier to navigate, we'll make a page size be 1 slide, and
	// the number of dots equal to the number of slides.
	carouselElement.children().each(function () {
		dots.append($('<div class="custom-dot">').html(
			'<div class="custom-dot-child custom-dot-child--lv1">' + 
			'	<div class="custom-dot-child custom-dot-child--lv2">' +
			'		<div class="custom-dot-child custom-dot-child--lv3"></div>' +
			'	</div>' +
			'</div>'
		));
	});
	carousel = carouselElement.owlCarousel(settings).data('owl.carousel');

	return {
		carousel: carousel,
		dots: dots
	}
}

/**
 * @brief Triggers a click on a needed element and checks if the carousel has
 * reacted in an expected way.
 * 
 * @param [Object] carouselBlock - object returned by `initCarouselWCustomNav ()`
 * should contain { carousel: ..., dots: ... }
 * @param [String] selector - a selector for picking an element to trigger a click on
 * @param [String] compareTo - whether to compare the current slide index with what was befor the click ("currentBeforeClick") or with an index of a clicked dot ("dotClicked")
 * @param [String] msg - a message to show in Qunit reports
 * @return nothing
 */
function clickDotDescendant(carouselBlock, selector, compareTo, msg) {
	var carousel = carouselBlock.carousel;
	var indices = {
		currentBeforeClick: carousel._current,
		dotClicked: getRandomSlide(carousel)
	};
	// To be able to point which element from a set we should click
	var selectorParsed = selector.replace(/\{dotClicked\}/g, indices.dotClicked + 1);

	$(selectorParsed).trigger('click');
	equal(carousel._current, indices[compareTo], msg);
}

test('`dotsContainer` is set, `dotSelector` is not; clicking everywhere inside a `dotsContainer`\s child must work', function () {
	var tempNewIndex;
	var carouselBlock = initCarouselWCustomNav({
		dots: true,
		dotsContainer: '.custom-dots',
		items: 1
	});

	expect(4);

	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked})', 'dotClicked', 'clicking `dotsContainer`\'s direct child');
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked}) .custom-dot-child--lv1', 'dotClicked', 'clicking `dotsContainer`\'s 2nd level child');
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked}) .custom-dot-child--lv2', 'dotClicked', 'clicking `dotsContainer`\'s 3rd level child');
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked}) .custom-dot-child--lv3', 'dotClicked', 'clicking `dotsContainer`\'s 4th level child');
});

test('`dotsContainer` and `dotClass` are set, `dotSelector` is not, `dotClass` doesn\'t match anything inside `dotsContainer`; so again, clicking everywhere inside a `dotsContainer`\s child must work', function () {
	var tempNewIndex;
	var carouselBlock = initCarouselWCustomNav({
		dots: true,
		dotsContainer: '.custom-dots',
		dotClass: 'some-class',
		items: 1
	});

	expect(4);

	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked})', 'dotClicked', 'clicking `dotsContainer`\'s direct child');
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked}) .custom-dot-child--lv1', 'dotClicked', 'clicking `dotsContainer`\'s 2nd level child');
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked}) .custom-dot-child--lv2', 'dotClicked', 'clicking `dotsContainer`\'s 3rd level child');
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked}) .custom-dot-child--lv3', 'dotClicked', 'clicking `dotsContainer`\'s 4th level child');
});

test('`dotsContainer` and `dotSelector` are set; only clicking inside `dotSelector` must work', function () {
	var tempNewIndex;
	var tempCurrentIndex;
	var carouselBlock = initCarouselWCustomNav({
		dots: true,
		dotsContainer: '.custom-dots',
		dotSelector: '.custom-dot-child--lv2',
		items: 1
	});
	var carousel = carouselBlock.carousel;
	var dots = carouselBlock.dots;

	expect(4);

	// these two clicks are not the element that match the `dotSelector`, nor
	// they are inside it, so clicks shouldn't do anything
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked})', 'currentBeforeClick', 'clicking `dotsContainer`\'s direct child');
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked}) .custom-dot-child--lv1', 'currentBeforeClick', 'clicking `dotsContainer`\'s 2nd level child');

	// This is the matching element
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked}) .custom-dot-child--lv2', 'dotClicked', 'clicking `dotsContainer`\'s 3rd level child');
	// This one is inside the matching element
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked}) .custom-dot-child--lv3', 'dotClicked', 'clicking `dotsContainer`\'s 4th level child');
});

test('`dotClass` is set; the plugin should generate a dots block and use it', function () {
	var tempNewIndex;
	var carouselBlock = initCarouselWCustomNav({
		dots: true,
		dotClass: 'some-class',
		items: 1
	});

	// expect(4);

	clickDotDescendant(carouselBlock, '#simple .owl-dots .some-class:nth-child({dotClicked})', 'dotClicked', 'clicking some auto-generated node (selecting by the dotClass)');
	clickDotDescendant(carouselBlock, '#simple .owl-dots .some-class:nth-child({dotClicked}) span', 'dotClicked', 'clicking auto-generated node\'s descendant (selecting by the dotClass)');
	clickDotDescendant(carouselBlock, '#simple .owl-dots > *:nth-child({dotClicked})', 'dotClicked', 'clicking some auto-generated node (selecting a direct child)');
	clickDotDescendant(carouselBlock, '#simple .owl-dots > *:nth-child({dotClicked}) span', 'dotClicked', 'clicking some auto-generated node\'s descendant (selecting a direct child)');
});

test('`dotClass` is not set; the plugin should generate a dots block and use it', function () {
	var tempNewIndex;
	var carouselBlock = initCarouselWCustomNav({
		dots: true,
		items: 1
	});

	// expect(4);

	clickDotDescendant(carouselBlock, '#simple .owl-dots .owl-dot:nth-child({dotClicked})', 'dotClicked', 'clicking some auto-generated node (selecting by the dotClass)');
	clickDotDescendant(carouselBlock, '#simple .owl-dots .owl-dot:nth-child({dotClicked}) span', 'dotClicked', 'clicking auto-generated node\'s descendant (selecting by the dotClass)');
	clickDotDescendant(carouselBlock, '#simple .owl-dots > *:nth-child({dotClicked})', 'dotClicked', 'clicking some auto-generated node (selecting a direct child)');
	clickDotDescendant(carouselBlock, '#simple .owl-dots > *:nth-child({dotClicked}) span', 'dotClicked', 'clicking some auto-generated node\'s descendant (selecting a direct child)');
});

test('`dotSelecor` is set, but `dotsContainer` is not; the plugin should generate a dots block and use it', function () {
	var tempNewIndex;
	var carouselBlock = initCarouselWCustomNav({
		dots: true,
		dotSelector: '.custom-dot-child--lv2',
		items: 1
	});

	// expect(4);

	clickDotDescendant(carouselBlock, '#simple .owl-dots .owl-dot:nth-child({dotClicked})', 'dotClicked', 'clicking some auto-generated node (selecting by the dotClass)');
	clickDotDescendant(carouselBlock, '#simple .owl-dots .owl-dot:nth-child({dotClicked}) span', 'dotClicked', 'clicking auto-generated node\'s descendant (selecting by the dotClass)');
	clickDotDescendant(carouselBlock, '#simple .owl-dots > *:nth-child({dotClicked})', 'dotClicked', 'clicking some auto-generated node (selecting a direct child)');
	clickDotDescendant(carouselBlock, '#simple .owl-dots > *:nth-child({dotClicked}) span', 'dotClicked', 'clicking some auto-generated node\'s descendant (selecting a direct child)');
	
	// Since dotsContainer is not set, clicking neither of these should trigger carousel updates
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked})', 'currentBeforeClick', 'clicking `dotsContainer`\'s direct child');
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked}) .custom-dot-child--lv1', 'currentBeforeClick', 'clicking `dotsContainer`\'s 2nd level child');
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked}) .custom-dot-child--lv2', 'currentBeforeClick', 'clicking `dotsContainer`\'s 3rd level child');
	clickDotDescendant(carouselBlock, '.custom-dots .custom-dot:nth-child({dotClicked}) .custom-dot-child--lv3', 'currentBeforeClick', 'clicking `dotsContainer`\'s 4th level child');
});
