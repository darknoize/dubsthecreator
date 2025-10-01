/*

	1 - ST FRAME

*/


/*= 01. =========================================

	S T   F R A M E
	Themes frame for demo sites

===============================================*/

/*

	1 - ST FRAME

		1.1 - Common
		1.2 - Resp modes
		1.3 - Purchase button animation

*/

	$(document).ready(function() {

		/*-------------------------------------------
			1.1 - Common
		-------------------------------------------*/
	
			var
				theme_list_open = false;
	
				function fixHeight() {
				
					var
						headerHeight = $('#bar').height();
		
						$('#iframe').attr( 'height', ( ( $(window).height() - 0 ) - headerHeight ) + 'px' );
		
				}
				
				$(window).resize(function() { fixHeight(); }).resize();
				
				$('#select').click( function() {
				
					if ( theme_list_open == true ) {
						//$('#menu li ul').hide();
						$('#menu').removeClass('opened');
						theme_list_open = false;
						$('#iframe').removeClass('semi-disabled');
					}
		
					else {
						$('#iframe').addClass('semi-disabled');
						//$('#menu li ul').show();
						$('#menu').addClass('opened');
						theme_list_open = true;
					}
					
					return false;
				
				});
				
				$('#menu li ul li a').click(function() {
				
					var
						theme_data = $(this).attr('rel').split(',');
								
						$('#delete a').attr( 'href', theme_data[0] );
						$('#iframe').attr( 'src', theme_data[0] );
						$('#purchase a').attr( 'href', theme_data[1] );

						$('#select').text(theme_data[2]);
						
						//$('#menu li ul').hide();
						$('#menu').removeClass('opened');
						
						$('#iframe').removeClass('semi-disabled');

						theme_list_open = false;
						
						return false;
				
				});
	
	
			/*-------------------------------------------
				1.2 - Resp modes
			-------------------------------------------*/

				$('#icons a').click(function(){

					$('#icons a').removeClass('current');
					$(this).addClass('current');
					return false;

				})

				$('#monitor').click(function(){
					$('#iframe').css({ 'width': '100%', 'left': 0 }); })

				$('#laptop').click(function(){
					var
						left = ( $(window).width() - 1024 ) / 2;
						$('#iframe').css({ 'width': '1024px', 'left': left }); })

				$('#tablet').click(function(){
					var
						left = ( $(window).width() - 665 ) / 2;
						$('#iframe').css({ 'width': '665px', 'left': left }); })

				$('#phone-h').click(function(){
					var
						left = ( $(window).width() - 511 ) / 2;
						$('#iframe').css({ 'width': '511px', 'left': left }); })

				$('#phone-v').click(function(){
					var
						left = ( $(window).width() - 351 ) / 2;
						$('#iframe').css({ 'width': '351px', 'left': left }); })
	
	
			/*-------------------------------------------
				1.3 - Purchase button animation
			-------------------------------------------*/

				window.setInterval( function(){ st_purchase_button(); }, 10000 );

				function st_purchase_button() {

					$('#purchase')
						.animate({ 'left': '392px' }, 30, function(){ $(this)
							.animate({ 'left': '384px' }, 70, function(){ $(this)
								.animate({ 'left': '389px' }, 50, function(){ $(this)
									.animate({ 'left': '386px' }, 30, function(){ $(this)
										.animate({ 'left': '387px' }, 30, function(){ $(this)
										})
									})
								})
							})
						});

				}
	
	
			/*-------------------------------------------
				1.3 - Show details by hover
			-------------------------------------------*/

			$('.tab').hover(function(){

				$('.tab').removeClass('hover');
				$(this).addClass('hover');
				st_detalis();

			})

			function st_detalis() {

				$('.details').each(function(){
					$(this).addClass('none');
				})

				$('.hover').next().removeClass('none');

			}





	}); // $(document)