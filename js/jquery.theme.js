/*

	1 - SIDEBAR HEIGHT

		1.1 - Full height for Homepage Sidebar a

	2 - LAYOUT OPACITY

		2.1 - Smooth fade in by page loading

*/

/* jshint -W099 */
/* global jQuery:false */

var th = jQuery.noConflict();

th(function(){

	'use strict';

/*

	stData[0] - Primary color
	stData[1] - Secondary color

*/

/*===============================================

	S I D E B A R   H E I G H T
	Full height

===============================================*/

	/*-------------------------------------------
		1.1 - Full height for Homepage Sidebar a
	-------------------------------------------*/

	function st_sidebar_a_height() {

		th('#sidebar-homepage-a').css( 'height', 'auto' );

		var
			screenH = th(window).height(),
			headerH = th('#header').height(),
			sidebarH = th('#sidebar-homepage-a').height(),
			h = screenH - headerH,
			margin = ( h - sidebarH ) / 4;

			if ( ( headerH + sidebarH ) < screenH ) {
				th('#sidebar-homepage-a').css({ 'height': h - margin, 'margin-top': margin }); }

	}
		
	//st_sidebar_a_height();
	setTimeout( st_sidebar_a_height, 1000 );

	th(window).resize( st_sidebar_a_height );


/*===============================================

	L A Y O U T   O P A C I T Y
	Smooth fade in by page loading

===============================================*/

	th('#layout').animate({ opacity: 1 }, 500);


});