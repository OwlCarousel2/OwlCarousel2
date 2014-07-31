/**
 * Browser Support Plugin
 * Contains inline copy of custom Modernizr build
 *
 * @version 2.0.0
 * @author Vivid Planet Software GmbH
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

	/* Modernizr 2.8.3 (Custom Build) | MIT & BSD
	* Build: http://modernizr.com/download/#-csstransforms3d-prefixed-teststyles-testprop-testallprops-prefixes-domprefixes
	*/

	var Modernizr = (function( window, document, undefined ) {

		var version = '2.8.3',

		Modernizr = {},


		docElement = document.documentElement,

		mod = 'modernizr',
		modElem = document.createElement(mod),
		mStyle = modElem.style,

		inputElem  ,


		toString = {}.toString,

		prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),



		omPrefixes = 'Webkit Moz O ms',

		cssomPrefixes = omPrefixes.split(' '),

		domPrefixes = omPrefixes.toLowerCase().split(' '),


		tests = {},
		inputs = {},
		attrs = {},

		classes = [],

		slice = classes.slice,

		featureName,


		injectElementWithStyles = function( rule, callback, nodes, testnames ) {

		var style, ret, node, docOverflow,
			div = document.createElement('div'),
					body = document.body,
					fakeBody = body || document.createElement('body');

		if ( parseInt(nodes, 10) ) {
						while ( nodes-- ) {
				node = document.createElement('div');
				node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
				div.appendChild(node);
			}
		}

					style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
		div.id = mod;
			(body ? div : fakeBody).innerHTML += style;
		fakeBody.appendChild(div);
		if ( !body ) {
					fakeBody.style.background = '';
					fakeBody.style.overflow = 'hidden';
			docOverflow = docElement.style.overflow;
			docElement.style.overflow = 'hidden';
			docElement.appendChild(fakeBody);
		}

		ret = callback(div, rule);
			if ( !body ) {
			fakeBody.parentNode.removeChild(fakeBody);
			docElement.style.overflow = docOverflow;
		} else {
			div.parentNode.removeChild(div);
		}

		return !!ret;

		},
		_hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

		if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
		hasOwnProp = function (object, property) {
			return _hasOwnProperty.call(object, property);
		};
		}
		else {
		hasOwnProp = function (object, property) {
			return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
		};
		}


		if (!Function.prototype.bind) {
		Function.prototype.bind = function bind(that) {

			var target = this;

			if (typeof target != "function") {
				throw new TypeError();
			}

			var args = slice.call(arguments, 1),
				bound = function () {

				if (this instanceof bound) {

				var F = function(){};
				F.prototype = target.prototype;
				var self = new F();

				var result = target.apply(
					self,
					args.concat(slice.call(arguments))
				);
				if (Object(result) === result) {
					return result;
				}
				return self;

				} else {

				return target.apply(
					that,
					args.concat(slice.call(arguments))
				);

				}

			};

			return bound;
		};
		}

		function setCss( str ) {
			mStyle.cssText = str;
		}

		function setCssAll( str1, str2 ) {
			return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
		}

		function is( obj, type ) {
			return typeof obj === type;
		}

		function contains( str, substr ) {
			return !!~('' + str).indexOf(substr);
		}

		function testProps( props, prefixed ) {
			for ( var i in props ) {
				var prop = props[i];
				if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
					return prefixed == 'pfx' ? prop : true;
				}
			}
			return false;
		}

		function testDOMProps( props, obj, elem ) {
			for ( var i in props ) {
				var item = obj[props[i]];
				if ( item !== undefined) {

								if (elem === false) return props[i];

								if (is(item, 'function')){
									return item.bind(elem || obj);
					}

								return item;
				}
			}
			return false;
		}

		function testPropsAll( prop, prefixed, elem ) {

			var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
				props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

				if(is(prefixed, "string") || is(prefixed, "undefined")) {
			return testProps(props, prefixed);

				} else {
			props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
			return testDOMProps(props, prefixed, elem);
			}
		}    tests['csstransforms3d'] = function() {

			var ret = !!testPropsAll('perspective');

							if ( ret && 'webkitPerspective' in docElement.style ) {

						injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
				ret = node.offsetLeft === 9 && node.offsetHeight === 3;
			});
			}
			return ret;
		};
		for ( var feature in tests ) {
			if ( hasOwnProp(tests, feature) ) {
										featureName  = feature.toLowerCase();
				Modernizr[featureName] = tests[feature]();

				classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
			}
		}



		Modernizr.addTest = function ( feature, test ) {
		if ( typeof feature == 'object' ) {
			for ( var key in feature ) {
			if ( hasOwnProp( feature, key ) ) {
				Modernizr.addTest( key, feature[ key ] );
			}
			}
		} else {

			feature = feature.toLowerCase();

			if ( Modernizr[feature] !== undefined ) {
												return Modernizr;
			}

			test = typeof test == 'function' ? test() : test;

			if (typeof enableClasses !== "undefined" && enableClasses) {
			docElement.className += ' ' + (test ? '' : 'no-') + feature;
			}
			Modernizr[feature] = test;

		}

		return Modernizr;
		};


		setCss('');
		modElem = inputElem = null;


		Modernizr._version      = version;

		Modernizr._prefixes     = prefixes;
		Modernizr._domPrefixes  = domPrefixes;
		Modernizr._cssomPrefixes  = cssomPrefixes;



		Modernizr.testProp      = function(prop){
			return testProps([prop]);
		};

		Modernizr.testAllProps  = testPropsAll;


		Modernizr.testStyles    = injectElementWithStyles;
		Modernizr.prefixed      = function(prop, obj, elem){
		if(!obj) {
			return testPropsAll(prop, 'pfx');
		} else {
				return testPropsAll(prop, obj, elem);
		}
		};



		return Modernizr;

	})(window, document);

	$.fn.owlCarousel.Constructor.prototype.vendorPrefixed = function(property) {
		return Modernizr.prefixed(property);
	};
	$.fn.owlCarousel.Constructor.prototype.getSupport3d = function() {
		return Modernizr.csstransforms3d;
	};

})(window.Zepto || window.jQuery, window, document);
