module('Instantiation', {
    setup : function() {
        this.test = $('#test').liteAccordion();
    },
    teardown : function() {
        this.test.liteAccordion('destroy');
    }
});

test('jQuery in page', function() {
    strictEqual(typeof jQuery, 'function');
});

test('liteAccordion.js in page', function() {
    strictEqual(typeof $.fn.liteAccordion, 'function');
});

test('liteAccordion.css in page', function() {
    ok($('link[href*="liteaccordion"]', document.head).length);
});

test('DOM element returned', function() {
    strictEqual(typeof this.test, 'object', 'elem is an object');
    strictEqual(this.test[0].nodeType, 1, 'elem is a DOM object'); // instanceof HTMLElement won't work in IE7 (doesn't support DOM L2)
    strictEqual(this.test[0].id, 'test', 'elem has ID of "test"');
});

module('Methods', {
    setup : function() {
        this.test = $('#test').liteAccordion();
        this.debug = this.test.liteAccordion('debug');
    },
    teardown : function() {
        this.test.liteAccordion('destroy');
    }
});

test('Play', function() {
    this.test.liteAccordion('play');
    strictEqual(typeof this.debug.core.playing, 'number', 'On Play, core.playing has a setInterval ID');   
});

test('Play -> Stop', function() {
    this.test.liteAccordion('play');
    this.test.liteAccordion('stop');
    strictEqual(this.debug.core.playing, 0, 'On Stop, core.playing is zero');       
});

test('Play -> Stop -> Play', function() {
    this.test.liteAccordion('play');
    this.test.liteAccordion('stop');
    this.test.liteAccordion('play');
    strictEqual(typeof this.debug.core.playing, 'number', 'On Play, core.playing has a setInterval ID');      
});

test('AutoPlay -> Stop -> Play', function() {
    // destroy instance created in setup
    this.test.liteAccordion('destroy');
    this.test = null;
    this.debug = null;

    // create new instance with autoplay option
    this.test = $('#test').liteAccordion({ autoPlay : true });
    this.debug = this.test.liteAccordion('debug');
    ok(this.debug.settings.autoPlay, 'AutoPlay enabled');
    strictEqual(typeof this.debug.core.playing, 'number', 'On AutoPlay, core.playing has a setInterval ID'); 
    
    // stop autoPlay
    this.test.liteAccordion('stop');
    strictEqual(this.debug.core.playing, 0, 'On Stop, core.playing is zero');

    // manually play
    this.test.liteAccordion('play');
    strictEqual(typeof this.debug.core.playing, 'number', 'On Play, core.playing has a setInterval ID');
});

test('Stop', function() {
    this.test.liteAccordion('stop');
    strictEqual(this.debug.core.playing, 0, 'On Stop, core.playing is zero'); 
});

test('Next', function() {
    strictEqual(this.debug.core.currentSlide, this.debug.settings.firstSlide - 1);    
    this.test.liteAccordion('prev');
    this.test.liteAccordion('next');   
});

test('Next -> Next', function() {
    strictEqual(this.debug.core.currentSlide, this.debug.settings.firstSlide - 1);    
    this.test.liteAccordion('prev');
    this.test.liteAccordion('next');   
});

test('Next -> Prev', function() {
    strictEqual(this.debug.core.currentSlide, this.debug.settings.firstSlide - 1);    
    this.test.liteAccordion('prev');
    this.test.liteAccordion('next');   
});

test('Prev', function() {
    strictEqual(this.debug.core.currentSlide, this.debug.settings.firstSlide - 1);    
    this.test.liteAccordion('prev');
    this.test.liteAccordion('next');   
});

test('Prev -> Prev', function() {
    strictEqual(this.debug.core.currentSlide, this.debug.settings.firstSlide - 1);    
    this.test.liteAccordion('prev');
    this.test.liteAccordion('next');   
});

test('Prev -> Next', function() {
    strictEqual(this.debug.core.currentSlide, this.debug.settings.firstSlide - 1);    
    this.test.liteAccordion('prev');
    this.test.liteAccordion('next');   
});

test('All methods except Debug return DOM element', function() {
    strictEqual(this.test.liteAccordion('play')[0].id, 'test', 'Original DOM element returned');
    strictEqual(this.test.liteAccordion('stop')[0].id, 'test', 'Original DOM element returned');
    strictEqual(this.test.liteAccordion('next')[0].id, 'test', 'Original DOM element returned');
    strictEqual(this.test.liteAccordion('prev')[0].id, 'test', 'Original DOM element returned');
    strictEqual(this.test.liteAccordion('destroy')[0].id, 'test', 'Original DOM element returned');
    strictEqual(this.test.liteAccordion()[0].id, 'test', 'Original DOM element returned'); // init needed for teardown                   
    strictEqual(typeof this.debug, 'object', 'Debug returns an object');   
    ok(this.debug.settings, 'Debug has a settings property');
});

module('Core', {
    setup : function() {
        this.test = $('#test').liteAccordion();
        this.debug = this.test.liteAccordion('debug');
    },
    teardown : function() {
        this.test.liteAccordion('destroy');
    }
});

test('Play counter on init', function() {
    strictEqual(this.debug.core.playing, 0, 'core.playing is zero');    
});

test('CurrentSlide set on init', function() {
    strictEqual(this.debug.core.currentSlide, this.debug.settings.firstSlide - 1); // firstSlide isn't zero indexed
});

/* TODO */
/*
methods
    play
        autoplay, stop, prev, next, play -> check index      
   
    next
        next * x -> check current index
        next -> prev -> check index
   
    prev
        prev * rand x -> check current index
        prev -> next -> prev -> check index

    destroy
        destroys all styles
        destroys events on header and window (hashchange)

core
    autoplay
        autoplay -> stop -> hashchange = correct slide
        autoplay -> pauseonhover = next slide is correct slide
        autoplay -> stop -> hashchange
        autoplay -> pause on hover -> hashchange 

    linkable
        linkable on load
        linkable on hashchange
*/