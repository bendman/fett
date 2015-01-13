;(function(window, Prism, html_beautify, undefined){
	'use strict';

	var document = window.document;

	document.addEventListener('DOMContentLoaded', runFett);

	function runFett() {
		var codeBlocks = document.getElementsByTagName('code');
		codeBlocks = excludeExampleCode(codeBlocks);

		// Example generation for `.example` code blocks
		var exampleCode = Array.prototype.filter.call(codeBlocks, isExample);
		Array.prototype.forEach.call(exampleCode, renderExample);

		// Syntax highlighting and indentation for visible code
		var visibleCode = Array.prototype.filter.call(codeBlocks, notHidden);
		Array.prototype.forEach.call(visibleCode, presentCode);

		// Create previews for color swatches
		var colorSwatches = document.querySelectorAll('.swatch');
		Array.prototype.forEach.call(colorSwatches, renderColorSwatches);

		// Bind Page Events
		bindEvents();

		// Page navigation
		buildNavigation();
	}

	// 
	// # Events
	// 

	function bindEvents() {
		// custom debounced resize event
		window.addEventListener('resize', debounce(triggerResize, 250));

	}
	function triggerResize(e) {
		var event = new CustomEvent('resize-debounced');
		window.dispatchEvent(event);
	}

	// 
	// # Color Swatches
	//
	
	function renderColorSwatches(swatchNode) {
		// Create the color preview element
		var colorPreview = document.createElement('div');
		colorPreview.classList.add('color-preview');

		// Set the color preview to color code provided in `.color`
		colorPreview.style.backgroundColor = swatchNode.querySelector('.color').textContent;

		// Insert the color preview
		swatchNode.insertBefore(colorPreview, swatchNode.firstChild);
	}

	// 
	// # Example Iframes
	// 
	var frameExamples = [];

	// Handle 
	function renderExample(codeEl) {
		// Create the frame wrapping element
		var frameWrapper = document.createElement('div');
		frameWrapper.classList.add('frame-wrapper');

		// Create the frame itself
		var iframe = document.createElement('iframe');
		iframe.setAttribute('src', 'canvas.html');
		iframe.style.height = '0px';
		frameWrapper.appendChild(iframe);

		// Save copy of code and append to frame when loaded
		frameExamples.push({
			node: iframe,
			exampleContent: codeEl.innerHTML
		});

		// Attach the frame before the target source code, or the wrapping `<pre>`
		var tgt = isTag('pre', codeEl.parentElement) ? codeEl.parentElement : codeEl;
		tgt.parentElement.insertBefore(frameWrapper, tgt);
	}

	// Function to be called from iframe content to verify it is ready.
	window.exampleReady = function(contentWindow) {
		// Find the matching frame example to get the proper content.
		var frameExample = frameExamples.filter(function(frameExample){
			if (frameExample.node.contentWindow === contentWindow) return true;
		})[0];

		if (!frameExample) {
			return;
		}

		var frameBody = contentWindow.document.body;

		// Inject the example code
		frameBody.innerHTML = frameExample.exampleContent;
	
		// Set content height to auto, so the example will stretch
		frameBody.style.height = 'auto';
		frameBody.parentElement.style.height = 'auto';

		resize();
		window.addEventListener('resize-debounced', resize);

		function resize() {
			// Reset frame height for measuring
			frameExample.node.style.height = 'auto';
			// Set the iframe height to match body content
			frameExample.node.style.height = contentWindow.document.body.scrollHeight + 'px';
		}
	};

	// 
	// # Code Handling
	// 

	function presentCode(codeEl) {
		// Remove exterior indentation (from `pre` tag)
		if (isTag('pre', codeEl.parentNode)) {
			removeEmptyText(codeEl.previousSibling);
			removeEmptyText(codeEl.nextSibling);
		}

		// `html_beautify` indents content, while assigning to textContent
		// sanatizes HTML to entities in a text node for presentation.
		codeEl.textContent = html_beautify(codeEl.innerHTML).trim();

		// Highlight each element
		Prism.highlightElement(codeEl);
	}

	// Remove a node if it is purely whitespace text.
	function removeEmptyText(node) {
		if (node && node.nodeType == 3 && !node.textContent.trim().length) {
			node.remove();
		}
	}

	// 
	// # Navigation
	// 

	function buildNavigation() {

		// Get a list of all defined headings.
		var headings = document.getElementsByTagName('main')[0]
			.querySelectorAll('h1, h2, h3, h4, h5, h6');

		// Build objects to store the heading and the associated section.
		var navList = Array.prototype.map.call(headings, buildNavObjects);
		// Filter for unique sections.
		var sections = [];
		navList = navList.filter(function(navItem){
			if (sections.indexOf(navItem.section) !== -1) {
				// Section is already registered to a navItem, so remove.
				return false;
			}
			// Section is the first registered instance, so keep.
			sections.push(navItem.section);
			return true;
		});
		// Get parents so we can build a navigation tree.
		attachNavParent(navList);

		// Build the navigation elements for the UI.
		var navEl = document.createElement('nav');
		buildNavElements(undefined, navList, navEl);
		document.querySelector('header').appendChild(navEl);
	}

	// Build objects to store navigation information from headings
	function buildNavObjects(heading) {
		return {
			heading: heading,
			title: heading.textContent,
			// Get the nearest `section` or `article` tags above those headings.
			section: closest(isNavSection, heading),
			parent: null
		};
	}

	// Attach parent properties to each nav section.
	function attachNavParent(navList) {		
		// Store an array of the registered navigable sections to search later.
		var sections = navList.map(function(obj){
			return obj.section;
		});

		// Build a hierarchy by registering child sections with their parent.
		navList.forEach(function(obj){
			// Get the closest element which is also a nav section.
			var parentNavSection = closest(function(parent){
				return sections.indexOf(parent) !== -1;
			}, obj.section);

			// Find the matching navList object for the parent nav section.
			var parentObj = navList.filter(function(navItem){
				return navItem.section === parentNavSection;
			})[0];

			obj.parent = parentObj;
		});
	}

	// Attach a `ul` node of links to the `navEl` parent.
	function buildNavElements(parent, navList, navEl) {
		// Find children by matching the parent.
		var items = navList.filter(function(navItem){
			return navItem.parent === parent;
		});
		if (!items.length) return false;

		// Build the children navigation.
		var ulEl = document.createElement('ul');
		items.forEach(function(item){
			var liEl = document.createElement('li');
			var aEl = document.createElement('a');
			aEl.textContent = item.title;

			// Handle the item ID for links
			var id = idFromText(item.title);
			aEl.setAttribute('href', '#' + id);
			item.section.id = id;

			liEl.appendChild(aEl);

			// Recurse to build each sub-child navigation.
			buildNavElements(item, navList, liEl);
			ulEl.appendChild(liEl);
		});

		navEl.appendChild(ulEl);
	}


	// 
	// # Utlities
	//
	

	// Generate a valid ID from a string of text.
	function idFromText(text) {
		var words = text.split(/\s+/);
		words = words.map(function(word){
			return word[0].toUpperCase() + word.slice(1);
		});

		return words.join('_');
	}
	
	// Check if a node is a navigation delimiting section.
	function isNavSection(node) {
		return isTag('section', node) || isTag('article', node);
	}

	// Crawl up the tree from `node`, returning the closest element which
	// matches the `test`, or `null` if no match is found.
	function closest(test, node) {
		while ((node = node.parentElement)) {
			if (test(node)) return node;
		}
		return null;
	}

	// Verify that a `node` is not contained in a code block.
	// This is particularly useful to prevent processing of example code.
	function notExampleCode(node) {
		return !closest(function(node){
			return isTag('code', node);
		}, node);
	}

	// Verify that an element isn't hidden by crawling up the DOM
	// looking for `.hidden` elements.
	function notHidden(node) {
		return !closest(function(node){
			return node.classList.contains('hidden');
		}, node);
	}

	// Filter a list of `nodes` for only those *not* included in code blocks.
	function excludeExampleCode(nodes) {
		return Array.prototype.filter.call(nodes, notExampleCode);
	}

	// Filter a list to only include `.example` elements.
	function isExample(node) {
		return !!closest(function(node){
			return node.classList.contains('example');
		}, node);
	}

	// Test if a node is a certain tag
	function isTag(tag, node) {
		return node.tagName.toLowerCase() === tag;
	}

	// Return a debounced function that will be triggered
	// once at the end of a series of calls within `wait` milliseconds
	function debounce(fn, wait) {
		var timeout;
		return function(){
			var context = this;
			var futureArgs = arguments;

			function futureCall() {
				fn.apply(context, futureArgs);
			}

			window.clearTimeout(timeout);
			timeout = window.setTimeout(futureCall, wait);
		};
	}


}(window, Prism, html_beautify));