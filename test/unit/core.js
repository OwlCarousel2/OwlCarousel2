module('Core tests');

test('replace with loop', function() {
	expect(1);
	before_and_after_replace({loop: true});
});

test('replace without loop', function() {
	expect(1);
	before_and_after_replace({loop: false});
});

function before_and_after_replace(options) {
	var simple = $('#simple'),
		replacement = simple.html(),
		expected = null;
	
	simple.owlCarousel(options);
	
	expected = simple.html();
	
	simple.trigger('replace.owl.carousel', [ replacement ]);
	simple.trigger('refresh.owl.carousel');
	
	equal(simple.html(), expected, 'Inner HTML before and after replace equals.');
}