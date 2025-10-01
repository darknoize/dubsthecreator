/*

	1 - HOVERS: PROJECTS

		1.1 - Append a common hover

*/

/* jshint -W099 */
/* global jQuery:false, stData:false */

var t = jQuery.noConflict();

t(function(){

	'use strict';

/*

	stData[0] - Primary color
	stData[1] - Secondary color

*/

/*===============================================

	H O V E R S :   P R O J E C T S
	Animated hovers for projects

===============================================*/

	/*-------------------------------------------
		1.1 - Append a common hover
	-------------------------------------------*/

	t('#layout').on( 'mouseenter', '.project-thumb',

		function(){

			if ( !t(this).hasClass('inProgress') ) {

				t(this).addClass('inProgress');

				var
					wrapper = t(this).parent().parent().parent(),
					color = wrapper.is('[data-bg-color]') ? wrapper.attr('data-bg-color') : stData[1], // bg color of project wrapper
					width = t(this).outerWidth(true),
					height = t(this).outerHeight(true),
					hover = '<div class="st-hover" style="width: ' + width + 'px; height: ' + height + 'px; margin-bottom: -' + height + 'px;"><div class="st-hover-bg" style="background: #' + color + ';"><!-- bg --></div><div class="st-hover-data div-as-table"><div><div><!-- data --></div></div></div></div>';

					t(this).html( hover );


					if ( t(this).parent().parent().hasClass('projects-format-gallery-holder') ) {

						var
							title = t(this).attr('title');

							t('.st-hover-data div div',this).html( '<i><!-- --></i><p>' + title + '</p>' );

							t(this).removeAttr('title');

							t('.st-hover-data div div p').animate({ 'margin-top': 5 }, 250 );

					}


					t('.st-hover',this).stop(true, false).animate({ opacity: 1 }, 125 );

			}

		});


	t('#layout').on( 'mouseleave', '.project-thumb',

		function(){

			if ( t(this).hasClass('inProgress') ) {

				var
					title = t('.st-hover-data p',this).html();

					t('.st-hover',this).stop(true, false).animate({ opacity: 0}, 125, function(){ t(this).parent().removeClass('inProgress'); t(this).remove(); } );

					t(this).attr('title', title);

			}

		});


	t('#layout').on( 'mousedown', '.project-thumb',

		function(){

			if ( t(this).hasClass('inProgress') ) {

				var
					title = t('.st-hover-data p',this).html();

					t(this).attr('title', title);

			}

		});


});