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
	}

	// 
	// # Example Iframes
	// 

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
		iframe.addEventListener('load', injectFrameExample.bind(window, iframe, codeEl.innerHTML));

		// Attach the frame before the target source code, or the wrapping `<pre>`
		var tgt = isTag(codeEl.parentElement, 'pre') ? codeEl.parentElement : codeEl;
		tgt.parentElement.insertBefore(frameWrapper, tgt);
	}

	function injectFrameExample(iframe, exampleHTML) {
		var frameBody = iframe.contentWindow.document.body;

		// set content height to auto, so the example will stretch
		frameBody.style.height = 'auto';
		frameBody.parentElement.style.height = 'auto';

		// inject example code
		frameBody.innerHTML = exampleHTML;

		// set iframe height to match body content
		iframe.style.height = frameBody.scrollHeight + 'px';
	}

	// 
	// # Code Handling
	// 

	function presentCode(codeEl) {
		// Remove exterior indentation (from `pre` tag)
		if (isTag(codeEl.parentNode, 'pre')) {
			removeEmptyText(codeEl.previousSibling);
			removeEmptyText(codeEl.nextSibling);
		}

		// `html_beautify` indents content, while assigning to textContent
		// sanatizes HTML to entities in a text node for presentation.
		codeEl.textContent = html_beautify(codeEl.innerHTML).trim();

		// highlight each element
		Prism.highlightElement(codeEl);
	}

	// Remove a node if it is purely whitespace text.
	function removeEmptyText(node) {
		if (node && node.nodeType == 3 && !node.textContent.trim().length) {
			node.remove();
		}
	}


	// 
	// # Filters
	// 

	// Crawl up the tree from `node`, returning the closest element which
	// matches the `test`, or `null` if no match is found.
	function closest(node, test) {
		while ((node = node.parentElement)) {
			if (test(node)) return node;
		}
		return null;
	}

	// Verify that a `node` is not contained in a code block.
	// This is particularly useful to prevent processing of example code.
	function notExampleCode(node) {
		return !closest(node, function(node){
			return isTag(node, 'code');
		});
	}

	// Verify that an element isn't hidden by crawling up the DOM
	// looking for `.hidden` elements.
	function notHidden(node) {
		return !closest(node, function(node){
			return node.classList.contains('hidden');
		});
	}

	// Filter a list of `nodes` for only those *not* included in code blocks.
	function excludeExampleCode(nodes) {
		return Array.prototype.filter.call(nodes, notExampleCode);
	}

	// Filter a list to only include `.example` elements.
	function isExample(node) {
		return !!closest(node, function(node){
			return node.classList.contains('example');
		});
	}

	// Test if a node is a certain tag
	function isTag(node, tag) {
		return node.tagName.toLowerCase() === tag;
	}


}(window, Prism, html_beautify));