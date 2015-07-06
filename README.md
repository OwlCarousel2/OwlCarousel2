[![Stories in Ready](https://badge.waffle.io/smashingboxes/OwlCarousel2.png?label=ready&title=Ready)](http://waffle.io/smashingboxes/OwlCarousel2)
[![Build Status](https://travis-ci.org/smashingboxes/OwlCarousel2.svg)](https://travis-ci.org/smashingboxes/OwlCarousel2)

## Announcement.

Big announcement comming about maintainance of this project.  Stay tuned!

## Owl Carousel 2 Beta

Touch enabled [jQuery](http://jquery.com/) plugin that lets you create a beautiful, responsive carousel slider. **To get started, check out http://owlcarousel.owlgraphic.com.**

Please consider that the project is still in beta. The current status of the milestones can be found [here](https://github.com/OwlFonk/OwlCarousel2/milestones). If you want to use the [latest development](https://github.com/smashingboxes/OwlCarousel2/archive/develop.zip) see [building](#building).

## Quick start

Download the [latest release](http://smashingboxes.github.io/OwlCarousel2/download/owl.carousel.2.0.0-beta.3.zip) and put the required stylesheet at the [top](https://developer.yahoo.com/performance/rules.html#css_top) of your markup:

```html
<link rel="stylesheet" href="owlcarousel/owl.carousel.min.css" />
```

Put the script at the [bottom](https://developer.yahoo.com/performance/rules.html#js_bottom) of your markup right after jQuery:

```html
<script src="jquery.min.js"></script>
<script src="owlcarousel/owl.carousel.min.js"></script>
```

Wrap your items (`div`, `a`, `img`, `span`, `li` etc.) with a container element (`div`, `ul` etc.). Only the class `owl-carousel` is mandatory to apply proper styles:

```html
<div class="owl-carousel">
  <div> Your Content </div>
  <div> Your Content </div>
  <div> Your Content </div>
  <div> Your Content </div>
  <div> Your Content </div>
  <div> Your Content </div>
  <div> Your Content </div>
</div>
```

Call the [plugin](http://learn.jquery.com/plugins/) function and your carousel is ready.

```javascript
$(document).ready(function(){
  $('.owl-carousel').owlCarousel();
});
```

## Documentation

The documentation, included in this repo in the root directory, is built with [Assemble](http://assemble.io/) and publicly available at http://owlcarousel.owlgraphic.com. The documentation may also be run locally.

## Building

This package comes with [Grunt](http://gruntjs.com/) and [Bower](http://bower.io/). The following tasks are available:

  * `default` compiles the CSS and JS into `/dist` and builds the doc.
  * `dist` compiles the CSS and JS into `/dist` only.
  * `watch` watches source files and builds them automatically whenever you save.
  * `test` runs [JSHint](http://www.jshint.com/) and [QUnit](http://qunitjs.com/) tests headlessly in [PhantomJS](http://phantomjs.org/).

To define which plugins are build into the distribution just edit `/_config.json` to fit your needs.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md).

## License

The code and the documentation are released under the [MIT License](LICENSE).
