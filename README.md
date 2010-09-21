
About DomTemplate
=================

Version: 0.1 - 22 September 2010
Author: Joe Walker [ joe at getahead dot org ]
License: Apache v2

DomTemplate is yet another template engine. Rather than doing templating using
string manipulation, it uses the DOM directly for several reasons:

* It allows you to register event handers as part of the template process
  without needing an extra lookup step
* It can inform you of references to created nodes to save on lookup steps
* It's more secure - it's like using a SQL query API rather than string
  manipulation
* Since the templates are as close to HTML as possible, they are manipulable
  along with other parts of your website. This makes test/preview easy.

This implementation is also small (around a couple of hundred lines without
comments) and it is used in Mozilla Bespin/Skywriter and in some of the (as yet
unreleased) Firefox developer tools, so it should be well supported.

The [full documentation](USING.md) explains the usage.
However if all you need is a taste:

    <div id="hello">${contents}</div>
                   +
    new Templater().processNode('hello', { contents:'world' });
                   |
                   V
    <div id="hello">world</div>

I have a hack that will allow you to run DomTemplate on the server in node.js
or any CommonJS environment. It works for me, but isn't properly tested or
documented etc. Contact me if you want to know more.

Things to be wary of:

* So far DomTemplate has had good exercise on modern browsers, but not much
  exposure to older browsers, particularly IE6. This will probably change if
  people find it useful.
* The API is currently object based (i.e. new Template().processNode()) rather
  than static (i.e. Template.processNode()). This is mostly for historical
  reasons. It might make sense to change it if DomTemplate gets significant
  interest.
* We're doing something technically nasty in using custom attribute names which
  could have future meaning to a browser. We could consider an alternate
  implementation that uses HTML5 data-attributes.
