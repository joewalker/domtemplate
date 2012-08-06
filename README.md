About DomTemplate
=================

DomTemplate is yet another template engine.

Rather than doing templating using string manipulation, it uses the DOM
directly for several reasons:

* It allows you to register event handers as part of the template process
  without needing an extra lookup step
* It can inform you of references to created nodes to save on lookup steps
* It's more secure - it's like using a SQL query API rather than string
  manipulation
* Since the templates are as close to HTML as possible, they are manipulable
  along with other parts of your website. This makes test/preview easy.
* It allows for asynchronous templating.

This implementation is also small (around a couple of hundred lines without
comments) and it is used in Mozilla Bespin/Skywriter and in some of the Firefox
developer tools, so it should be well supported.

See below for full usage. However if all you need is a taste:

    <div id="ex1">${contents}</div>
        +
    template('ex1', { contents:'world' });
        ↓
    <div id="ex1">world</div>
[Try it...](http://jsfiddle.net/dcCK5/)  


DomTemplate can be run on the server on the server in NodeJS using [jsdom]
(https://github.com/tmpvar/jsdom).

DomTemplate engine has a number of features to help applying arbitrary data to
your page:

* Nested data and arbitrary Javascript (``${a.b.c}``)
* Registration of event handlers (``onclick="${function}"``)
* Conditional evaluation (``if="${condition}"``)
* Looping (``<loop>`` and ``foreach="page in ${pages}"``)
* Getting references to cloned nodes (``save="${element}"``)
* Hidden attributes (``_src="${...}"``)
* Asynchronous Templates
* Grabbing the current node (``${__element}``)

Things to be wary of:

* So far DomTemplate has had good exercise on modern browsers, but not much
  exposure to older browsers, particularly IE6. This will probably change if
  people find it useful.
* We're doing something technically nasty in using custom attribute names which
  could have future meaning to a browser. We could consider an alternate
  implementation that uses HTML5 data-attributes.


Using DomTemplate
-----------------

The signature of the template() function is as follows:

    var t = template(node, data, options);

Where:

* _node_ Either a string which points to an element with that id, or the
  element itself.
* _data_ A JavaScript object containing the properties to be used as the
  'global' object for ``${...}`` blocks.
* _options_ A JavaScript object containing options which customize how the
  templates are processed. Options include:
  * _allowEval_ Allow arbitrary JavaScript inside ``${...}`` blocks in addition
    to property paths. Allowing use of eval() can significantly slow down
    JavaScript processing.
  * _blankNullUndefined_ Output null or undefined values as empty strings
    rather than the values 'null' or 'undefined'.
  * _stack_ domtemplate maintains a 'stack' of the nodes it is processing which
    can help in debugging. The stack option allows you to 'pre-load' the stack.
    It can be specified either as a string for a single frame, or an array of
    strings for multiple frames. This is most useful to specify the template
    name, or usage location.

The return value is the Templater object used to process the template.


Nested data and arbitrary Javascript (``${a.b.c}``)
---------------------------------------------------

``${...}`` blocks can be in attribute values and in HTML content. When used in
an attribute value, the retrieved data is converted to a string before being
added to the DOM.
When used in element content, ``${...}`` blocks can return either strings
(which will be added to the DOM inside a TextNode (i.e. with HTML escaped) or
they can return DOM elements, in which case the DOM element will be added to
the tree.

The data passed to the template can contain nested data, which is then accessed
using a familiar property path:

    <div id="ex2">${a.b.c}</div>
        +
    template('ex2', { a: { b: { c: 42 } } } );
        ↓
    <div id="ex2">42</div>
[Try it...](http://jsfiddle.net/dcCK5/1/)  

Normally any ${} element will be processed as a property path (that is a set of
properties separated by '.') However DomTemplate also supports using arbitrary
JavaScript inside ``${}``, when the ``{ allowEval:true }`` option is used.

As an example, this is possible

    <div id="ex3">${console.log('hi'); document.createTextNode('BANG!')}</div>
        +
    template('ex3', null, { allowEval:true });
        ↓
    <div id="ex3">BANG!</div>
[Try it...](http://jsfiddle.net/dcCK5/2/)  

In the real world doing this kind of thing often leads to pain down the road,
however it can be a useful get-out-of-jail-free card.


Registration of event handlers (``onclick="${function}"``)
----------------------------------------------------------

Events are registered using event handlers in a way that is similar to normal
HTML event registration. All you need is the ${...} clause to point to a
function.

Example:

    <div id="ex4" onclick="${clickHandler}">Hello</div>​
        +
    template('ex4', {
      clickHandler:function(ev) {
        console.log('div clicked');
      }
    });
        ↓
    <div id="ex4" onclick=[the clickHandler function]>Hello</div>
[Try it...](http://jsfiddle.net/dcCK5/3/)  

Here we are registering an onClick handler for the div. Any type of event
handler can be registered.

This is particularly handy when `this` is used as the data to the template
engine. We make sure that the context of the function is the object that called 
it, so you have access to all your data:

    <div id="ex5" onclick="${clickHandler}">${name}</div>
        +
    function Person(name) {
      this.name = name;
    }
    Person.prototype = {
      display: function() {
        template('ex5', this);
      },
      clickHandler: function(ev) {
        console.log('You clicked on ' + this.name);
      }
    };
    var joe = new Person('Joe');
    joe.display();
        ↓
    <div id="ex5" onclick=[joe.clickHandler]>Joe</div>
[Try it...](http://jsfiddle.net/dcCK5/4/)

i.e. DomTemplate automatically binds function calls in the way we wish
JavaScript had done from day one.

If you wish to use the capture phase of an event, you can use the following
syntax:

    <div onclick="${clickHandler}" captureonfocus="true">...

Something to be aware of:

* Although it looks like we are using DOM level 0 event registration (i.e.
  element.onfoo = somefunc) we are actually using DOM level 2, by stripping
  off the 'on' prefix and then using addEventListener('foo', ...).


Conditional evaluation (``if="${condition}"``)
----------------------------------------------

If an element contains an 'if' attribute, then its value will be evaluated and
if the result is 'falsey', then the entire element will be removed from the
tree. This allows simple if statements.

Example:

    <div id="ex6">
      <p if="${name}">Hi, ${name}</p>
    </div>
        +
    template('ex6', { name: 'Fred' });
        ↓
    <div id="ex6">
      <p>Hi, Fred</p>
    </div>
[Try it...](http://jsfiddle.net/dcCK5/5/)

However:

    <div id="ex6">
      <p if="${name}">Hi, ${name}</p>
    </div>
        +
    template('ex6', { name: null });
        ↓
    <div id="ex6">
    </div>
[Try it...](http://jsfiddle.net/dcCK5/6/)

In the second example, the entire 'p' element has been removed by processing
the if attribute.


Looping (``<loop>`` and ``foreach="page in ${pages}"``)
-------------------------------------------------------

If an element contains a `foreach` attribute, then that element will be repeated
in the final document once for each member of the array returned by the
attribute value.

Example:

    <div id="ex7">
      <span foreach="index in ${array}">${index}</span>
    </div>
        +
    template('ex7', { array: [ 1, 2, 3 ] });
        ↓
    <div id="ex7">
      <span>1</span><span>2</span><span>3</span>
    </div>
[Try it...](http://jsfiddle.net/dcCK5/7/)

If you wish to create a number of elements for each member of the array, then
you can use a special <loop> element. This will be removed from the resulting
tree.

Or a more complex example:

    <div id="ex8">
      <loop foreach="person in ${people}">
        <h1>${person.name}</h2>
        <p>${person.address}</p>
      </loop>
    </div>
        +
    var data = {
      people: [
        { name: 'Miss Marple', address: 'St Mary Mead' },
        { name: 'Sherlock Holmes', address: '221B Baker St' },
        { name: 'Hercule Poirot', address: 'Whitehaven Mansions' }
      ]
    };
    template('ex8', data);
        ↓
    <div id="ex8">
      <h1>Miss Marple</h2>
      <p>St Mary Mead</p>
      <h1>Sherlock Holmes</h2>
      <p>221B Baker St</p>
      <h1>Hercule Poirot</h2>
      <p>Whitehaven Mansions</p>
    </div>
[Try it...](http://jsfiddle.net/dcCK5/8/)

The foreach element can be used with arrays or objects. If an object is used
then we will iterate over the enumerable property names.

2 things to be aware of when using ``foreach``, one obvious, the other not so:

* Any ``id`` attributes in the duplicated data, will be duplicated, this is
  probably not what you want. Avoid using id inside an element with a foreach.
* ``<table>`` element are very picky about what they contain, specifically,
  ``<loop>``s in places the HTML parser doesn't expect can be pushed to after
  the table.


Getting references to cloned nodes (``save="${element}"``)
----------------------------------------------------------

The save attribute is special. It takes the current node at sets it into the
pointed to structure. In this case ${} is not arbitrary Javascript but a dot
path to an element to set.

This is useful whenever you need to work with the created nodes.

    <div id="ex9">
      <div save="${element}>${name}"</div>
    </div>
        +
    var data = { name: 'Fred' };
    template('ex9', data);
    console.log(data.element.innerHTML); // "Fred"
        ↓
    <div id="ex9">
      <div>Fred</div>
    </div>
[Try it...](http://jsfiddle.net/dcCK5/9/)


Hidden attributes (``_src="${...}"``)
-------------------------------------

Since DomTemplate uses pre-existing DOM elements, there could be attributes that
the browser will try to use before templating, and will discover invalid values.

The solution is to prefix the attribute name with an underscore. The templating
process will remove the _.

For example:

    <img src="${path}/thing.png"/>

This will the processed, and (assuming 'path' is correctly set) the right image
will be displayed, however you may notice your browser giving a 404 message from
${path}/thing.png as it has attempted to retrieve the image before the template
process had a chance to substitute the correct path.

To solve the problem, and have the browser only attempt to fetch the image when
the correct path has been specified, do the following

    <img _src="${path}/thing.png"/>

Should you wish to have an attribute in the resulting document prefixed with an
underscore, simply begin your attribute name with 2 underscores. (Is this a
common scenario? If you know of another scenario where attribute names are
prefixed with _, please contact me.)


Asynchronous Templates
----------------------

What if the data for the template isn't available when the template is run?
DomTemplate checks returned data for a 'then' function, and assumes that it's
a promise which needs resolving before use.

For example:

    <div id="ex10">${name}</div>
        +
    var p = new Promise();
    template('ex10', { name: p });
        ↓
    <div id="ex10"><span/></div>
        ↓
    p.resolve("Joe");
        ↓
    <div id="ex10">Joe</div>
[Try it...](http://jsfiddle.net/dcCK5/10/)

Grabbing the current node (``${__element}``)
--------------------------------------------

During templating you may need to get access to the current element.
Sometimes there's just no nice way to describe what you need to do, so the
__element tracks the element that is under examination.

For example:

    <div id="ex11" class="bar">${console.log(__element.className);''}</div>​
        +
    template('ex11', null, { allowEval: true });
    // logs 'bar' to the console.
        ↓
    <div id="ex11" class="bar"></div>
[Try it...](http://jsfiddle.net/dcCK5/11/)

This technique had been largely superseded by asynchronous templates, and may
be removed in future. If you have a strong use for it please tell us to prevent
it from being removed.

