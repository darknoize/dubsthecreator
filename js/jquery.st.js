/*

	01. - Dinamic styles holder
	02. - Drop-Down menu
	03. - Quick reply form
	04. - Textarea
	05. - Sticked div
	06. - Tag cloud
	07. - Archives & Categories
	08. - OnBlur/OnFocus for input fields
	09. - Dummy Search
	10. - Dummy Subscribe
	11. - Original size of images
	12. - Max size for YouTube & Vimeo video
	13. - ST Gallery
	14. - Scroll to
	15. - Background size
	16. - Background image of container
	17. - AJAX projects

*/

/* jshint -W099 */
/* global jQuery:false, st_prettyPhoto, st_video_resize */

var p = jQuery.noConflict();

p(function(){

	'use strict';



/*==01.==========================================

 	D I N A M I C   S T Y L E S
	Holder for dinamic styles

===============================================*/

	if ( !p('#st-dynamic-css').length ) {

		p('head').append('<style id="st-dynamic-css" type="text/css"></style>');

	}



/*==02.==========================================

	D R O P - D O W N   M E N U
	Main menu on responsive mode

===============================================*/

/*

	1 - DROP-DOWN MENU

		1.1 - Default
		1.2 - Custom

*/

	/*-------------------------------------------
		1.1 - Default
	-------------------------------------------*/

	p('#menu-1-box #page_id').change(function() {

		var
			val = p(this).val();

			if ( val ) {
				p(this).parent().submit(); }

	});


	/*-------------------------------------------
		1.2 - Custom
	-------------------------------------------*/

	p('#selectElement').change(function() {

		if ( p(this).val() ) {
			window.open( p(this).val(), '_parent' ); }

	});



/*==03.==========================================

	Q U I C K   R E P L Y   F O R M
	Append and remove quick form

===============================================*/

/*

	1 - QUICK REPLY FORM

		1.1 - Open form
		1.2 - Cancel reply
		1.3 - Remove dummy before submiting
		1.4 - Return dummy after unsuccess submiting

*/

	/*-------------------------------------------
		1.1 - Open form
	-------------------------------------------*/

	p('a.quick-reply').click(function(){


		/*--- First of all -----------------------------*/

		// Make previous Reply link visible
		p('.quick-reply').removeClass('none');

		// Make previous Cancel Reply link hidden
		p('.quick-reply-cancel').addClass('none');

		// Erase all quick holders
		p('.quick-holder').html('');

		// Make comment form visible
		p('#commentform').removeClass('none');


		/*--- Append new form -----------------------------*/

		var
			id = p(this).attr('title'),
			form = p('#respond').html();

			// Make this Reply link hidden
			p(this).addClass('none');

			// Make this Cancel Reply link visible
			p(this).next().removeClass('none');

			// Hide major form
			p('#commentform, #reply-title').addClass('none');

			// Put the form to the holder
			p('#quick-holder-' + id).append(form).find('h3').remove();

			// Set an ID for hidden field
			p('#quick-holder-' + id + ' input[name="comment_parent"]').val(id);

			// Fix placeholders for IE8,9
			if ( p('#ie-version').hasClass('ie-version-8') || p('#ie-version').hasClass('ie-version-9') ) {
				
				p('.input-text-box input[type="text"], .input-text-box input[type="email"], .input-text-box input[type="url"]', '#quick-holder-' + id).each( function(){ p(this).val( p(this).attr('placeholder') ); } );

			}

		return false;

	});


	/*-------------------------------------------
		1.2 - Cancel reply
	-------------------------------------------*/

	p('.quick-reply-cancel').click(function(){

		// Make previous Reply link visible
		p('.quick-reply').removeClass('none');

		// Make this Cancel Reply link hidden
		p(this).addClass('none');

		// Erase all quick holders
		p('.quick-holder').html('');

		// Make comment form visible
		p('#commentform, #reply-title').removeClass('none');

		return false;

	});


	/*-------------------------------------------
		1.3 - Remove a dummy before submitting
	-------------------------------------------*/

	p('#layout')

		.on('mousedown touchstart', '.form-submit input[type="submit"]', function(){

			p(this).parent().parent().find('input[type="text"]')
				.each(function(){

					var
						dummy = p(this).attr('data-dummy'),
						val = p(this).val();
		
						if ( dummy === val ) {
							p(this).val(''); }

				});

		});


	/*-------------------------------------------
		1.4 - Return a dummy after unsuccess submitting
	-------------------------------------------*/

	p('body').on('mouseenter touchstart', '#layout', function(){

		p('input[type="text"]',this).each(function(){

			var
				dummy = p(this).attr('data-dummy'),
				val = p(this).val();

				if ( !val ) {
					p(this).val(dummy); }

		});

	});



/*==04.==========================================

 	T E X T A R E A
	Animation by focus

===============================================*/

	p('#layout').on('focus', 'textarea', function() {

		if ( p(this).height() < 151 && ! p(this).hasClass( 'height-ready' ) ) {

			p(this)
				.css({ height: 70 })
				.animate({ height: 150 }, 300, function(){ p(this).addClass( 'height-ready' ); });

		}

	});



/*==05.==========================================

 	S T I C K E D   D I V
	Sticked container

===============================================*/


	var st_get_sickyDiv = function(){

		var
			sickyDiv = p('#stickyDiv'),
			sickyDivPrev = sickyDiv.prev(),
			sickyDivPrevHeight = sickyDivPrev.outerHeight(true),
			stickyTop = sickyDivPrev.offset().top + sickyDivPrevHeight;

			sickyDiv.attr({ 'data-stickyTop': stickyTop, 'data-stickyHeight': sickyDiv.height() });

	};

	if ( p('#stickyDiv').length ) {

		st_get_sickyDiv();

		p(window).scroll(function(){

			if ( p('body').width() > 984 ) {

				var
					stickyDiv = p('#stickyDiv'),
					stickyTop = stickyDiv.attr('data-stickyTop'),
					stickyHeight = stickyDiv.attr('data-stickyHeight'),
					limit = p('#footer').offset().top - stickyHeight - 100,
					windowTop = p(window).scrollTop();


				/*--- by top -----------------------------*/

				if ( stickyTop < windowTop ) {

					stickyDiv.css({ position: 'fixed', top: 20 });

				}

				else {

					if ( stickyDiv.css('position') != 'static') {
						stickyDiv.css({ 'position': 'static' }); }

				}


				/*--- by footer -----------------------------*/

				if ( limit < windowTop ) {
					
					var
						diff = limit - windowTop;
						stickyDiv.css({ top: diff });

				}

			}

		});

	}



/*==06.==========================================

 	T A G   C L O U D
	Add number of posts for each tag

===============================================*/

	p('.tagcloud a').each(function(){

		var
			number = p(this).attr('title').split(' ');

			number = '<span>' + number[0] + '</span>';

			p(this).append(number).attr('title','');

	});


/*==07.==========================================

 	A R C H I V E S & C A T E G O R I E S
	Replace count wrapper on widgets,
	e.g. from (7) to <span>7</span>

===============================================*/

	p('.widget_archive li, .widget_categories li').each(function(){

		var
			str = p(this).html();

			str = str.replace(/\(/g,"<span>");
			str = str.replace(/\)/g,"</span>");
			
			p(this).html(str);

	});



/*==08.==========================================

 	O N B L U R / O N F O C U S
	For input fields

===============================================*/

	p('#layout')

		.on('focus', 'input[type="text"]', function(){

			var
				dummy = p(this).attr('data-dummy'),
				val = p(this).val();

				if ( dummy === val ) {
					p(this).val(''); }

			})

		.on('blur', 'input[type="text"]', function(){

			var
				dummy = p(this).attr('data-dummy'),
				val = p(this).val();

				if ( !val ) {
					p(this).val(dummy); }

			});



/*==09.==========================================

 	D U M M Y   S E A R C H
	Dummy data for search input field

===============================================*/

	p('.searchform').each(function(){

		var
			dummy = p('input[type="submit"]',this).val();

			p('input[name="s"]',this).val(dummy).attr('data-dummy', dummy);

	});



/*==10.==========================================

 	D U M M Y   S U B S C R I B E
	Dummy data for subscribe form

===============================================*/

	p('.feedemail-input').each(function(){

		var
			dummy = p(this).attr('data-dummy');

			p(this).val(dummy);

	});



/*==11.==========================================

 	O R I G I N A L   S I Z E
	For images and others

===============================================*/

	p('.size-original').removeAttr('width').removeAttr('height');



/*==12.==========================================

 	V I D E O   R E S I Z E
	Max size for YouTube & Vimeo video

===============================================*/

	window.st_video_resize = function(){

		p('iframe').each(function(){

			var
				src = p(this).attr('src');

				if ( src ) {

					var
						check_youtube = src.split('youtube.com'),
						check_vimeo = src.split('vimeo.com'),
						check_ted = src.split('ted.com'),
						check_ustream = src.split('ustream.tv'),
						check_metacafe = src.split('metacafe.com'),
						check_rutube = src.split('rutube.ru'),
						check_mailru = src.split('video.mail.ru'),
						check_vk = src.split('vk.com'),
						check_yandex = src.split('video.yandex'),
						check_dailymotion = src.split('dailymotion.com');
		
						if (
							check_youtube[1] ||
							check_vimeo[1] ||
							check_ted[1] ||
							check_ustream[1] ||
							check_metacafe[1] ||
							check_rutube[1] ||
							check_mailru[1] ||
							check_vk[1] ||
							check_yandex[1] ||
							check_dailymotion[1]
							) {
		
								var
									parentWidth = p(this).parent().width(),
									w = p(this).attr('width') ? p(this).attr('width') : 0,
									h = p(this).attr('height') ? p(this).attr('height') : 0,
									ratio = h / w,
									height = parentWidth * ratio;
			
									if ( w > 1 ) {
										p(this).css({ 'width': parentWidth, 'height': height }); }
		
						}

				}

		});

	};

	st_video_resize();

	p(window).resize( st_video_resize );



/*==13.==========================================

 	S T   G A L L E R Y
	ST Gallery script

===============================================*/

	stG_init();
	
	function stG_init() {

		p('.st-gallery').each(function(){

			p('img',this).addClass('st-gallery-pending').last().addClass('st-gallery-last');

			var
				slides = p(this).html(),
				check = slides.split('img'),
				controls = '<ol>';

				for ( var i = 1; i < check.length; i++ ) {
					if ( i === 1 ) {
						controls += '<li class="st-gallery-tab-current"></li>'; }
					else {
						controls += '<li></li>'; }
				}

				controls += '</ol>';

				p(this).html( '<div>' + slides + '</div>' + controls );

				p('div img:first-child',this).removeClass('st-gallery-pending').addClass('st-gallery-current');

		});

	}

	p('.st-gallery div img').on( 'click touchstart', function(){

		if ( ! p(this).parent().hasClass('st-gallery-locked') ) {

			var
				img = p(this),
				gallery = p(this).parent(),
				current = gallery.find('.st-gallery-current'),
				hCurrent = gallery.height(),
				imgIndex = img.prevAll().length,
				tabs = img.parent().next( 'ol' );

				gallery.addClass('st-gallery-locked');

				var
					nextImage = ( current.hasClass('st-gallery-last') ? gallery.find('img').first() : gallery.children().eq( imgIndex + 1 ) );

					current
						.removeClass('st-gallery-current').addClass('st-gallery-flushed').stop(true,false)
						.animate({ 'opacity': 0 }, 300,
							function(){
								p(this).removeAttr('style').removeClass('st-gallery-flushed').addClass('st-gallery-pending');
								gallery.removeClass('st-gallery-locked');
							});

					nextImage.removeClass('st-gallery-pending').addClass('st-gallery-current');

					var
						hNext = nextImage.height();

						if ( hNext !== 0 ) {
							gallery.css( 'height', hCurrent ).stop(true,false).animate({ 'height': hNext }, 700 ); }
						else {
							gallery.css( 'height', 'auto' ); }

					var
						currentTab = nextImage.prevAll().length;
	
						tabs.children( '.st-gallery-tab-current' ).removeClass( 'st-gallery-tab-current' );
						tabs.children().eq( currentTab ).addClass( 'st-gallery-tab-current' );

		}

	});

	p('.st-gallery ol li').click(function(){

		p(this).each(function(){

			var
				no = p(this).prevAll().length,
				gallery = p(this).parent().parent().find('div'),
				current = gallery.find('.st-gallery-current'),
				h = gallery.children().eq( no ).height();

				p(this).parent().find('.st-gallery-tab-current').removeClass('st-gallery-tab-current');
				p(this).addClass('st-gallery-tab-current');

				current.removeClass('st-gallery-current').addClass('st-gallery-pending');

				gallery.css( 'height', h );

				gallery.children().eq( no )
					.removeClass('st-gallery-pending')
					.addClass('st-gallery-flushed')
					.css({ opacity: 0 })
					.animate({ opacity: 1 }, 300, 
						function(){
							p(this).removeClass('st-gallery-flushed').addClass('st-gallery-current').removeAttr('style');
							gallery.removeAttr('style');
						});

		});

	});



/*==14.==========================================

 	S C R O L L   T O
	Scroll page to element

===============================================*/

	p('.button-scroll').click(function(){

		var
			id = p(this).attr('href');

			p('html, body').animate({ scrollTop: p(id).offset().top }, 1000 );

			return false;

	});



/*==15.==========================================

 	B A C K G R O U N D   S I Z E
	Size of bg image depends of screen size

===============================================*/

	function st_screen_bg() {

		if ( p('body').hasClass('custom-background') ) {

			var
				screenW = p(window).width(),
				screenH = p(window).height(),
				imageURL = p('body').css('background-image'),
				image,
				imageRatio;

				// Remove url() or in case of Chrome url("")
				imageURL = imageURL.match(/^url\("?(.+?)"?\)$/);
				
				if ( imageURL && imageURL[1] ) {
					
					imageURL = imageURL[1];
					image = new Image();
	
					image.src = imageURL;
	
					// just in case it is not already loaded
					p(image).load(function() {
	
						imageRatio = image.width / image.height;
	
						if ( ( screenW / imageRatio ) < screenH ) {
							p('body').css( 'background-size', 'auto 100%' ); }

						else {
							p('body').css( 'background-size', '100% auto' ); }
	
					});

				}

		}

	}

	st_screen_bg();

	p(window).resize( st_screen_bg );



/*==16.==========================================

 	B A C K G R O U N D   I M A G E
	Size of bg image depends of container size

===============================================*/


	function st_container_bg() {

		p('.st-container-bg').each(function(){

			var
				container = p(this),
				screenW = container.innerWidth(),
				screenH = container.innerHeight(),
				imageURL = container.css('background-image'),
				image,
				imageRatio;

				// Remove url() or in case of Chrome url("")
				imageURL = imageURL.match(/^url\("?(.+?)"?\)$/);
				
				if ( imageURL && imageURL[1] ) {
					
					imageURL = imageURL[1];
					image = new Image();

					image.src = imageURL;

					// just in case it is not already loaded
					p(image).load(function() {

						imageRatio = image.width / image.height;

						if ( ( screenW / imageRatio ) < screenH ) {
							container.css( 'background-size', 'auto 100%' ); }
	
						else {
							container.css( 'background-size', '100% auto' ); }

					});

				}
	
		});
	
	}

	st_container_bg();

	p(window).resize( st_container_bg );

	// Especial for Safari
	if ( p('body').hasClass('safari') ) {
		window.setInterval( function(){ st_container_bg(); }, 3000 ); }



/*==17.==========================================

	A J A X   P R O J E C T S
	Smooth loading of projects

===============================================*/

/*

	1 - AJAX PROJECTS

		1.1 - Fix custom colors
		1.2 - Load posts
			- Define a Load More button
			- Load posts function

*/

	/*-------------------------------------------
		1.1 - Fix custom colors
	-------------------------------------------*/

	function st_mediaelementplayer_colors(){

		p('.projects-format-audio-holder, .projects-format-video-holder').each(function(){

			if ( !p(this).is('[id]') && p(this).parent().is('[data-bg-color]') ) {

				var
					id = 'id' + Math.floor( ( Math.random() * 10000 ) + 1 ),
					style = '#layout #' + id + ' .mejs-time-loaded { background-color: #' + p(this).parent().attr('data-bg-color') + '; }' + "\n";

					p(this).attr( 'id', id );

					p('#st-dynamic-css').append( style );

			}

		});

	}


	/*-------------------------------------------
		1.2 - Load posts
	-------------------------------------------*/

	if ( p('#projects-ajax').length ) {

		var
			page = 1,
			$loading = true,
			$finished = false,
			// $window = p(window), // needed for loading by scroll
			$el = p('#projects-ajax'),
			$content = p('#projects-ajax > div'),			
			$path = $content.attr('data-path'),
			$button = $content.attr('data-button-text') ? $content.attr('data-button-text') : '',
			$button_progress = $content.attr('data-button-text-progress') ? $content.attr('data-button-text-progress') : '',
			$done = $content.attr('data-done') ? '<span style="display: none;">' + $content.attr('data-done') + '</span>' : '',
			$data;


			/*--- Define a Load More button -----------------------------*/

			if ( $button ) {
				$el.append('<div id="projects-load-more"><a href="#!" class="button button-with-icon button-with-icon-16">' + $button + '</a>' + $done + '</div>'); }


			/*--- Load posts function -----------------------------*/

			var
				st_projects_ajax = function() {
				
					p('#projects-load-more').addClass('loading');
					p('#projects-load-more span.text').text($button_progress);
					p.ajax({
						type : 'GET',
						data : {
							id				: $content.attr('data-post-id'),
							postType		: $content.attr('data-post-type'),
							category		: $content.attr('data-category'),
							author			: $content.attr('data-author'),
							taxonomy		: $content.attr('data-taxonomy'),
							taxonomyValue	: $content.attr('data-taxonomy-value'),
							tag				: $content.attr('data-tag'),
							postNotIn		: $content.attr('data-post-not-in'),
							numPosts		: $content.attr('data-display-posts'),
							pageNumber		: page,
						},
						dataType : 'html',
						url : $path + '/includes/projects/project-ajax.php',
						beforeSend : function(){
							if ( page != 1 ){
								p('#projects-load-more').addClass('loading');
								p('#projects-load-more a').text($button_progress);
								p('#projects-load-more a').addClass('button-in-progress');
							}
						},
						success	: function(data) {
							$data = p(data);
							if ( data.length > 1 ) {
								$data.hide();
								$content.append($data);
								st_video_resize(); // fix video size
								st_container_bg(); // fix bg image size
	
								if ( typeof st_prettyPhoto != 'undefined' ) {
									st_prettyPhoto(); } // apply prettyPhoto
	
								setTimeout(function() {
									$data.find('audio,video').mediaelementplayer({ startVolume: 0.5, audioHeight: 70 });
								}, 10);

								// Begin of mediaelement fix
								p('video').each(function() {
							
									var
										factor = 9 / 16,
										wp_video = p(this).parents('.wp-video'),
										wp_video_W = wp_video.width(),
										wp_video_H = Math.round( wp_video.width() * factor );
							
										p(this).attr( 'data-width', wp_video_W + 'px' ).attr( 'data-height', wp_video_H + 'px' );
							
								});
							
								p('.wp-video').css({ 'width': '100%', 'height': '100%' });
	
								p('video').width('100%').height( p(this).attr('data-height') ).css({ 'width': '100%', 'height': p(this).attr('data-height') });
								// End of mediaelement fix

								setTimeout(function() {
									st_mediaelementplayer_colors();
								}, 100);
	
								$data.fadeIn( 500, function(){
									st_container_bg();
									p('#projects-load-more').removeClass('loading');
									p('#projects-load-more a').text($button);
									$loading = false;
	
									if ( p('#stickyDiv').length ) { // update sticky div top value
										st_get_sickyDiv(); }
	
								});
							}
							else {
								p('#projects-load-more').removeClass('loading').addClass('done');
								p('#projects-load-more a').remove();
								p('#projects-load-more span').show();
								$loading = false;
								$finished = true;
							}
						},
						error : function() {
							p('#projects-load-more').removeClass('loading');
							p('#projects-load-more a').text($button);
						}
					});

				};
	
				// by click
				p('#projects-load-more a').click(function(){
					if ( !$loading && !$finished && !p(this).hasClass('done') ) {
						$loading = true;
						page++;
						st_projects_ajax();
					}
					return false;
				});
		
				// by scroll
				/*
				$window.scroll(function(){
					var
						content_offset = p('#projects-load-more').offset();
	
						if ( !$loading && !$finished && $window.scrollTop() >= Math.round( content_offset.top - ( $window.height() - 50 ) ) && page < 5 ) {
							$loading = true;
							page++;
							st_projects_ajax();
						}
				});
				*/

				st_projects_ajax();

	}


});