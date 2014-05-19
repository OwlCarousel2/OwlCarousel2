$(document).ready(function($) {

	function isPerspective(){
		return isStyleSupported(['perspective','webkitPerspective','MozPerspective','OPerspective','MsPerspective']);
	}

	// CSS detection;
	function isStyleSupported(array){
		var p,s,fake = document.createElement('div'),list = array;
		for(p in list){
			s = list[p]; 
			if(typeof fake.style[s] !== 'undefined'){
				fake = null;
				return true;
			}
		}
		return false;
	}

	var is3dsupport = isPerspective();
	var width = $(window).width();
	var devices = $('#devices');

	if(width >= 960 && is3dsupport){
	
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

		$('#devices-container').addClass('devices-init')

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
					nav:true
				},

				370:{
					items:2,
					dots: true,
					nav:false
				},

				960:{
					items:5
				}
			}
		});

		devices.on('transitionend', function(e){
			if(e.target.id === 'devices'){
				owl.trigger('refresh.owl');
			}
		});


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
		}

		$(window).on('resize',function(){
			width = $(window).width();
			swapDemoClasses();
		});
	
	} else {
		$('#devices-container').hide();
	}

});