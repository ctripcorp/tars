##[liteAccordion](http://nicolahibbert.com/demo/liteAccordion/)

liteAccordion is a horizontal accordion plugin for jQuery.

Please post any support or feature requests [here](http://nicolahibbert.com/liteaccordion-v2/).
**Please do not post support requests on the issue tracker!**

Follow me on Twitter [@nicolahibbert](http://twitter.com/nicolahibbert) for liteAccordion development news.

***
###Options

These are the default settings for the liteAccordion plugin:

    containerWidth : 960,                   // fixed (px)
    containerHeight : 320,                  // fixed (px)
    headerWidth: 48,                        // fixed (px)

    activateOn : 'click',                   // click or mouseover
    firstSlide : 1,                         // displays slide (n) on page load
    slideSpeed : 800,                       // slide animation speed
    onTriggerSlide : function() {},         // callback on slide activate
    onSlideAnimComplete : function() {},    // callback on slide anim complete

    autoPlay : false,                       // automatically cycle through slides
    pauseOnHover : false,                   // pause on hover
    cycleSpeed : 6000,                      // time between slide cycles
    easing : 'swing',                       // custom easing function

    theme : 'basic',                        // basic, dark, light, or stitch
    rounded : false,                        // square or rounded corners
    enumerateSlides : false,                // put numbers on slides
    linkable : false                        // link slides via hash

***
###Methods

These are the methods for the liteAccordion plugin:

	play									// trigger autoPlay on a stopped accordion
	stop									// stop an accordion playing
	next									// trigger the next slide
	prev									// trigger the previous slide
	destroy									// remove the accordion, destroying all event handlers and styles (unstyled html content will remain)
	debug									// returns a debug object

All of these methods are chainable (i.e. they return the original DOM object) with the exception of the debug method.  To call a method, use:

$('#yourdiv').liteAccordion('play');

To chain methods:

$('#yourdiv').liteAccordion('next').liteAccordion('next');

***
###Changelog

**v2.2** - 21/01/2013

 - removed responsive option
 - removed autoScale images option
 - fixed issue #66
 - fixed minor css bugs (ie10)

**v2.1.1** - 10/09/2012

- fixed issue #58

**v2.1** - 19/08/2012

- added responsive layout option
- added minContainerWidth and maxContainerWidth properties for use with responsive option
- added autoScale images option
- click or hover on selected header now triggers slide
- linkable now uses 'data-slide-name' instead of 'name'
- $.browser no longer used

**v2.0.3** - 18/08/2012

- Chrome residual animation artifacts bug fix

**v2.0.2** - 23/01/2012

- slide width fix for IE
- added documentation for methods

**v2.0.1** - 23/11/2011

- added css hook on each slide for ie7 & ie8
- css fixes for ie7 & ie8
- css improvements for other browsers

**v2.0** - 16/11/2011

- new methods:
    - play
    - stop
    - next
    - prev
    - destroy
    - debug
- rewrote plugin to expose methods
- refactored core
- refactored css, styles no longer cascade into slide content divs
- mouseover activation
- easing support
- linkable slides via hashchange
- two new themes:
    - light
    - stitch
- demo suite available

**v1.1.3** - 06/04/2011

- IE bug fixes

**v1.1.1, v1.1.2** - 27/03/2011

- IE bug fixes

**v1.1** - 21/03/2011

- Added a pause on hover feature

**v1.0** - 02/03/2011

- First release

###Not Supported/Won't Fix

- IE6
- IE7 & hashchange - if you need this, please use Ben Alman's [jQuery BBQ](http://benalman.com/projects/jquery-bbq-plugin/) plugin.
- the 'stitch' theme has been stripped back for IE depending on the level of CSS support available.