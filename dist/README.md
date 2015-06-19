[![Stories in Ready](https://badge.waffle.io/smashingboxes/OwlCarousel2.png?label=ready&title=Ready)](http://waffle.io/smashingboxes/OwlCarousel2)
[![Build Status](https://travis-ci.org/smashingboxes/OwlCarousel2.svg)](https://travis-ci.org/smashingboxes/OwlCarousel2)

## Announcement.

Big announcement comming about maintainance of this project.  Stay tuned!

## Owl Carousel 2 Beta

Touch enabled [jQuery](http://jquery.com/) plugin that lets you createbeautiful responsive carousel slider. **To get started, check out http://owlcarousel.owlgraphic.com.**

Please consider that the project is still in beta. The current status of the milestones can be found [here](https://github.com/OwlFonk/OwlCarousel2/milestones). If you want to use the [latest development](https://github.com/OwlFonk/OwlCarousel2/archive/develop.zip) see [building](#building).

## Quick start

Download the [latest release](http://owlcarousel.owlgraphic.com/download/owl.carousel.zip) and put the required stylesheet at the [top](https://developer.yahoo.com/performance/rules.html#css_top) of your markup:

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

The [issue tracker](https://github.com/OwlFonk/OwlCarousel2/issues) is the preferred channel for bug reports, features requests and submitting pull requests.

**Please do not use the issue tracker for personal support requests. Stack Overflow ([`owl-carousel`](http://stackoverflow.com/questions/tagged/owl-carousel)) is a better place to get help.**

### Bug reports

A bug is a **demonstrable problem** that is caused by the code in the repository. Good bug reports are extremely helpful, so thanks!

Guidelines for bug reports:

  1. Use the GitHub issue search — check if the issue has already been reported.

  2. Check if the issue has been fixed — try to reproduce it using the latest `develop` branch in the repository.

  3. Isolate the problem — ideally create a reduced test case and a live example. This [JSFiddle](http://jsfiddle.net/eqbL6vLb/) and this [JS Bin](http://jsbin.com/xuxozu/1) are helpful templates you can fork or clone.

Example:

> Short and descriptive example bug report title
> 
> A summary of the issue and the browser/OS environment in which it occurs. If suitable, include the steps required to reproduce the bug.
> 
>   1. This is the first step
>   2. This is the second step
>   3. Further steps, etc.
> 
> `<url>` - a link to the reduced test case
> 
> Any other information you want to share that is relevant to the issue being reported. This might include the lines of code that you have identified as causing the bug, and potential solutions (and your opinions on their merits).

### Feature requests

Feature requests are welcome. But take a moment to find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Please provide as much detail and context as possible.

### Pull requests

Good pull requests are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

**Please ask first** before embarking on any significant pull request (e.g. implementing features, refactoring code, porting to a different language), otherwise you risk spending a lot of time working on something that the project's developers might not want to merge into the project.

Adhering to the following process is the best way to get your work included in the project:

  1. [Fork](http://help.github.com/fork-a-repo/) the project, clone your fork, and configure the remotes:

    ```bash
    git clone https://github.com/<your-username>/OwlCarousel2.git
    cd OwlCarousel2
    git remote add upstream https://github.com/OwlFonk/OwlCarousel2.git
    ```

  2. If you cloned a while ago, get the latest changes from upstream:

    ```bash
    git checkout develop
    git pull [--rebase] upstream develop
    ```

  3. Create a new topic branch (off the main project `develop` branch) to contain your feature, change, or fix:

    ```bash
    git checkout -b <topic-branch-name>
    ```

  4. Build the distribution before committing to ensure your changes follow the coding standards and all build files are up to date.

    ```bash
    grunt dist
    ```

  5. Commit your changes in logical chunks. Please adhere to these [guidelines](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html). Use Git's [interactive rebase](https://help.github.com/articles/interactive-rebase) feature to tidy up your commits before making them public.

  6. Locally merge (or rebase) the upstream development branch into your topic branch:

    ```bash
    git pull [--rebase] upstream develop
    ```

  7. Push your topic branch up to your fork:

    ```bash
    git push origin <topic-branch-name>
    ```

  8. [Open a Pull Request](https://help.github.com/articles/using-pull-requests/) with a clear title and description against the `develop` branch.

**By submitting a patch, you agree to allow the project owner to
license your work under the terms of the [MIT License](LICENSE).**

## License

The code and the documentation are released under the [MIT License](LICENSE).
