<img src="http://benduncan.me/experiments/fett/lib/fett-helmet.svg" alt="Fett Logo" width="300">
# Fett
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/bendman/fett?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A lightweight pattern library for HTML, CSS, and brand styles.


## Description

A site styleguide gives designers and frontend developers one central place to reference brand colors and typography, test new components, and test changes to existing component markup (HTML) and style (CSS).

Fett is meant to be a component library for ideal markup which can then be cloned throughout your own site when building new pages.


### What Fett Does

- Generates styleguide navigation
- Builds color swatches out of HTML
- Builds previews of your `<code>` blocks
- Syntax highlighting for your `<code>` blocks


## Usage

### 1. Get Fett

Check the Fett repository somewhere you can serve it.  Your styleguide's homepage will be `index.html`.

Fett itself is a website, ideally served in parallel to your own site. If you use a version control system it is recommended to your instance of Fett within your site's repository, that way Fett markup will always parallel your site's markup.

### 2. Setup your canvas

The styleguide previews work by injecting each example HTML code block onto an iframe _canvas_ which simulates your site. This provides an isolated preview to render your code into.

The canvas consists of two files:
- `canvas/frame.html`
The base iframe file into which each code block gets injected.  Edit this file to include your site's CSS, preferrably by relative URL.
- `canvas/style-extension.css`
A Fett-specific CSS file which is also loaded on the canvas.  You can use this file to alter how your examples appear within Fett.

### 3. Build your Styleguide!

A Fett styleguide is written in HTML 5 to be easily editable by everybody who might use it.  The styleguide file itself is `index.html`.

There are a few structures within the styleguide that are useful to know:
- `main > section`
These sections are the top level navigation.
- `article`
Contained within the sections, these are where your code examples go.

For details about how to show syntax highlighted code examples, swatches, or previews, look at the [Fett documentation](http://benduncan.me/experiments/fett/).


## License

Copyright (c) 2014 Ben Duncan

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
