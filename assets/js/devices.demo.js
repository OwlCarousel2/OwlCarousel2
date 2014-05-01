$(document).ready(function($) {
	var owl = $('#devices-demo');
	owl.owlCarousel({
		loop:true,
		margin:10,
		lazyLoad:true, //in this example only applied on video thumbnails
		merge: true,
		video: true,
		responsiveBaseElement: '#devices',
		responsive:{	
			0:{
				items:1,
				dots: false,
				navigation:true,
			},

			370:{
				items:2,
				dots: true,
				navigation:false
			},

			960:{
				items:5
			}
		}
	});

	var devices = $('#devices');
	var icons = $('.devices-buttons').children();

	icons.click(function(e){
		e.preventDefault();

		var $this = $(this);
		icons.removeClass('active')

		var device = $this.data('device');
		$this.addClass('active');

		devices
		.removeClass()
		.addClass(device);

	});


	devices.on('transitionend', function(e){
		if(e.target.id === 'devices'){
			owl.trigger('refresh.owl');
		}
	});

	var width = $(window).width();
	swapDemoClasses();

	$('#devices-container').addClass('devices-init')

	function swapDemoClasses(){
		if(width >= 960){
			stayOn(0,'desktop');
		} else if(width >= 480){
			stayOn(1,'tablet')
			
		} else if(width < 480){
			stayOn(2,'mobile')
		}
	}

	function stayOn(icon,device){
		if(!icons.eq(icon).hasClass('active')){
			icons.removeClass('active');
			icons.eq(icon).addClass('active');
			devices.removeClass().addClass(device);
		}
		icons.show();

		if (icon === 1){
			icons.eq(0).hide();
		} else if (icon ===2){
			icons.hide();
		}

	}

	$(window).on('resize',function(){
		width = $(window).width();
		swapDemoClasses();
	})
});