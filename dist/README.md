### Owl Carousel 2
version 2.0.0-beta.2.4

Touch enabled jQuery plugin that lets you create beautiful responsive carousel slider.

####[Visit Owl Carousel landing page for full documentation and demos ](http://owlcarousel.owlgraphic.com)


## Installation


### Include CSS
First include two CSS files into your HTML head:
```
<link rel="stylesheet" href="owlcarousel/owl.carousel.min.css">
<link rel="stylesheet" href="owlcarousel/owl.theme.default.min.css">
```
> `owl.carousel.css` file is required and its good when inculded in head before *.js


### Include JS

Yep, include jQuery and `owl.carousel.min.js` into footer.
```
<script src="jquery.min.js"></script>
<script src="owlcarousel/owl.carousel.min.js"></script>
```


### Set HTML

You don't need any special markup. All you need is to wrap your divs(owl works with any type element a/img/span..) inside the container element `<div class="owl-carousel">`.
Class "owl-carousel" is mandatory to apply proper styles that come from owl.carousel.css file.

```
<!-- Set up your HTML -->
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

### Call the plugin

Now call the Owl initializer function and your carousel is ready.

```
$(document).ready(function(){
  $(".owl-carousel").owlCarousel();
});
```
> See [demos](http://owlcarousel.owlgraphic.com/demos/demos.html) for customisation and options usage.
