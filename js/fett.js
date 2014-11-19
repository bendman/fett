/*
	Fett
	UI Pattern Library
	A lightweight styleguide renderer in Javascript
 */
/* global jQuery */
/* global Prism */
/* global css_beautify */
/* global html_beautify */
/* global js_beautify */

;(function(window, $, undefined){

'use strict';

// # Initial Setup
var $navMainUl; // navigation list
var navTargets = window.navTargets = []; // array of navigation targets, for quicker position updates

start();

// # Start it up!
function start() {
	// Format code blocks.
	cleanCode($('body'));

	// Build navigation, detached so things run quicly.
	var $navMain = $('<nav>');
	$navMainUl = $('<ul>').addClass('topnav').appendTo($navMain);

	// Start the main loop to handle articles.
	$('main').children('section, article').each(function(){
		if ($(this).closest('code').length) return;
		buildArticle($(this), $navMainUl);
	});

	// Add navigation to the document header.
	$navMain.appendTo('body > header');

	// Build color swatches.
	$('.swatch').each(colorSwatch);

	// Handle position-based navigation highlighting.
	$(window).on('scroll resize', _throttle(updateNavPosition));
}

// # Recurse over articles
// This is the workhorse function.
function buildArticle($el, $nav) {

	var $titleNav = handleTitle($el, $nav);
	handlePreview($el);

	// ## recurse over children
	// But skip if there aren't any children
	var $children = $el.children('section, article');
	if (!$children.length) return $titleNav;

	// Build a nav element to put their navigation into
	var $navUl = $('<ul>').addClass('subnav')
		.appendTo($titleNav || $nav);

	// Do the recursion, adding title navigation
	var hasSubnav = false;
	$children.each(function(){
		if (buildArticle($(this), $navUl)) {
			hasSubnav = true;
		}
	});

	if (!hasSubnav) $navUl.remove();

	return !!$titleNav;
}

// # Navigation by Title
// Titles are used for sidebar navigation and given IDs for hash navigation
function handleTitle($el, $nav) {
	var $title = $el.children(':header').first();
	var text = $title.text();
	if (!text) return null;

	// Convert the title to a **valid ID** and apply it.
	var textId = _idFromText(text);
	$el.attr('id', textId);

	// Create the **navigation element**.
	var $navEl = $('<li>');
	navTargets.push({
		section: $el.get(0),
		$nav: $navEl
	});

	// Add the **link** to the navigation element.
	$('<a>')
		.text(text)
		.attr('href', '#' + textId)
		.appendTo($navEl);

	return $navEl.appendTo($nav);
}

//
// # Previews
//
// Content is put into an iframe for an isolated preview.
// The original is removed if it is only used as an example.
function handlePreview($el) {
	var $sources = $el.children('.preview');
	if (!$sources.length) return;

	// get preview source code
	var html = $sources.filter('[data-language=html]').html();
	var js = $sources.filter('[data-language=js]').html();

	var $frame = previewIframe(html, js, $sources.first());
	if ($sources.filter('.no-bg').length) {
		$frame.addClass('no-bg');
	}
}

// ## preview frame
// Scripts and Stylesheets passed into Fett are embedded into the iframe,
// along with the preview content.
function previewIframe(html, js, $target) {
	var $frameWrapper = $('<div>')
		.addClass('frame-wrapper');
	var $frame = $('<iframe>')
		.attr('src', 'canvas.html')
		.appendTo($frameWrapper);

	$frameWrapper.insertBefore($target);

	// build the frame and access the content
	$frame.on('load', function(){
		var frameDoc = $frame.get(0).contentWindow.document;
		var $body = $(frameDoc.body);

		if (!$target.hasClass('canvas-bg')) {
			$body.css('background', closestBackground($frame));
		}

		$body.html(html)
			.height('auto')
			.parent()
			.height('auto');

		// set the frame height
		$frame.height($body.get(0).scrollHeight);
	});




	return $frame;
}

//
// # Code Examples
//
// Code blocks are syntax highlighted according to language.
// The languages supported (for code blocks) are Javascript and HTML.
function cleanCode($el) {
	var $sources = $el.find('code');
	if (!$sources.length) return;

	$sources.each(function(){
		var assignedLanguage = $(this).attr('data-language');
		var content = $(this).html().trim();
		if (assignedLanguage == 'html') {
			$(this).addClass('language-markup');
			content = html_beautify(content);
		} else if (assignedLanguage == 'js') {
			$(this).addClass('language-javascript');
			content = js_beautify(content);
		} else if (assignedLanguage == 'css') {
			$(this).addClass('language-javascript');
			content = css_beautify(content);
		}

		// create a copy to use for preview iframe content
		if ($(this).hasClass('preview')) {
			$(this).removeClass('preview');
			$('<div>')
				.attr('class', $(this).attr('class'))
				.addClass('hidden preview')
				.attr('data-language', assignedLanguage)
				.html(content).insertBefore(this);
		}
		$(this).text(content);
		$(this).wrap('<pre>');
	});

	Prism.highlightAll();
}

function colorSwatch() {
	var $this = $(this);

	// the color preview box
	var color = $this.find('.color').text();
	$('<div>')
		.addClass('preview')
		// use attr(style) to preserve color code
		// because jquery's css(property) method converts it.
		.attr('style', 'background:' + color)
		.prependTo($this);
}

function updateNavPosition() {
	$navMainUl.find('.active').removeClass('active');

	var clientY = $(window).scrollTop();
	$.each(navTargets, function(){
		var thisY = this.section.offsetTop;
		var thisHeight = this.section.clientHeight;
		if (clientY > thisY && clientY < thisY + thisHeight) {
			this.$nav.addClass('active');
		}
	});
}

//
// # Utilities
//

// ## _throttle
// Throttle a function to happen a maxumum of once per `wait` milliseconds.
function _throttle(fn, wait) {
	wait = wait || 250; // default wait time

	var scheduled, timer;

	return function() {
		var now = Date.now();
		var args = arguments;

		if (!scheduled || now >= scheduled) {
			// Fire if beyond the scheduled time.
			scheduled = now + wait;
			fn.apply(window, args);
		} else {
			// Set a time to fire after the last incomplete schedule
			timer = window.setTimeout(function(){
				scheduled = now + wait;
				fn.apply(window, args);
			}, wait);
		}

		// Reset the timer.
		window.clearTimeout(timer);
	};
}

// ## _idFromText
// Gets the current id from the text element.
function _idFromText(text) {
	var words = text.split(/\s+/);
	words = $.map(words, function(word){
		return word[0].toUpperCase() + word.slice(1);
	});

	return words.join('_');
}

// ## Closest background
// Find the closest parent with a set background color and returns it.
function closestBackground($el) {
	var tgtColor;
	$el.parents().each(function(){
		var color = $(this).css('backgroundColor');
		if (color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') {
			tgtColor = color;
			return false; // stop searching for colors
		}
		return true; // keep searching
	});
	return tgtColor || '#ffffff';
}

}(window, jQuery));
