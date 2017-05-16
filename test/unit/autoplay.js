module('Autoplay tests');

function FakeClock() {
	var value = 1;

	this.tick = function(duration) {
		value += duration;
	}

	Date = function() {
		this.getTime = function() {
			return value;
		}
	}
}

function change_timeout(autoplay, first, second, time) {
	var clock = new FakeClock();

	autoplay.stop();

	autoplay.play(first);

	clock.tick(time);

	autoplay.pause();
	autoplay.play(second);
}

test('stopping the autoplay timer', function() {
	expect(2);

	var clock = new FakeClock();

	var carousel = $('#simple').owlCarousel().data('owl.carousel');
	var autoplay = carousel._plugins.autoplay;

	clock.tick(1);

	autoplay.stop();
	autoplay.play();

	equal(autoplay.read(), 0);

	autoplay.pause();
	autoplay.play();

	equal(autoplay.read(), 0);
});

test('changing autoplay timeout values', function() {
	expect(4);

	var carousel = $('#simple').owlCarousel().data('owl.carousel');
	var autoplay = carousel._plugins.autoplay;

	change_timeout(autoplay, 2000, 3000, 3000);
	equal(autoplay.read() % 3000, 1000);

	change_timeout(autoplay, 4000, 5000, 12000);
	equal(autoplay.read() % 5000, 0);

	change_timeout(autoplay, 5000, 4000, 12000);
	equal(autoplay.read() % 4000, 2000);

	change_timeout(autoplay, 11000, 6000, 19000);
	equal(autoplay.read() % 6000, 0);
});
