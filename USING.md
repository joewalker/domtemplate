
Using The DomTemplate Engine
============================

DomTemplate works on nodes that already exist in your browser. It applies given
values to a set of elements.

An example template could look like this:

    <div id="hello">${contents}</div>

This would then be used as follows:

    var data = { contents:'world' };
    new Templater().processNode('hello', data);

This would convert the DOM as follows:

    <div id="hello">world</div>

DomTemplate engine has a number of features to help applying arbitrary data to
your page:

* Nested data and arbitrary Javascript (${a.b.c})
* Registration of event handlers (onClick="${function}")
* Conditional evaluation (if="${condition}")
* Looping (<loop> and foreach="page in ${pages}")
* Getting references to cloned nodes (save="${element}")
* Grabbing the current node (${__element})
* Hidden nodes (_src="${...}")


Nested data and arbitrary Javascript (${a.b.c})
-----------------------------------------------

The data used in the template does not have to be at the 'top level':

    <div>${nested.value}</div>
    
    new Templater().processNode(div, { nested:{ value:42 } }); // <div>42</div>

Any ${} element will be processed as a portion of Javascript, in the context of
the second argument passed to `processNode()` (In the example above the
context would be `{ nested:{ value:42 } }`)

`${...}` can show up in elements and in HTML content. A `${...}` block contains
arbitrary Javascript. Generally however it is recommended to stick to a dot path
from an attribute passed to the template.

It expected that `${...}` blocks will return strings when used in an attribute.
When used in HTML content, `${...}` blocks can return either strings (which will
be added to the DOM inside a TextNode (i.e. with HTML escaped) or they can
return DOM elements, in which case the DOM element will be added to the tree.

As an example, this is possible

    <div>${console.log('hi'); document.createTextNode('BANG!')}</div>

In the real world doing this kind of thing often leads to pain down the road,
however it can be a useful get-out-of-jail-free card.


Registration of event handlers (onClick="${function}")
------------------------------------------------------

Events are registered using event handlers in a way that is similar to normal
HTML event registration. All you need is the ${...} clause to point to a
function.

Example:

    <div onclick="${clickHandler}>Hello</div>

    var data = {
      clickHandler:function(ev) {
        console.log('div clicked');
      }
    };
    new Templater().processNode(div, data);

Here we are registering an onClick handler for the div. Any type of event
handler can be registered.

This is particularly handy when `this` is used as the data to the template
engine. We make sure that the context of the function is the object that called
it, so you have access to all your data:

    <div id='id' onclick="${clickHandler}>${name}</div>
    
    function Person(name) {
      this.name = name;
      new Templater().processNode('id', this);
    }
    Thing.prototype = {
      clickHandler: function(ev) {
        console.log('You clicked on ' + this.name);
      }
    };

i.e. DomTemplate automatically binds function calls in the way we wish
JavaScript had done from day one.

If you wish to use the capture phase of an event, you can use the following
syntax:

    <div onclick="${clickHandler}" captureonfocus="true">...

There are 2 things to be aware of:

* Although it looks like we are using DOM level 0 event registration (i.e.
  element.onfoo = somefunc) we are actually using DOM level 2, by stripping
  off the 'on' prefix and then using addEventListener('foo', ...). This could
  have an effect for events were case sensitivity is important like DOMFocusIn
  More testing is needed here.


Conditional evaluation (if="${condition}")
------------------------------------------

If an element contains an 'if' attribute, then its value will be evaluated and
if the result is 'falsey', then the entire element will be removed from the
tree. This allows simple if statements.

Example:

    <div><p if="${name}">Hi, ${name}</p></div>

    templater.processNode(..., { name: 'Fred' }); // <div><p>Hi, Fred</p></div>
    templater.processNode(..., { });              // <div></div>

In the second example, the entire 'p' element has been removed by processing
the if attribute.


Looping (<loop> and foreach="page in ${pages}")
-----------------------------------------------

If an element contains a `foreach` attribute, then that element will be repeated
in the final document once for each member of the array returned by the
attribute value.

Example:

    <div id="id" foreach="index in ${[ 1, 2, 3 ]}">${index}</div>
    
    templater.processNode('id'); // <div>1</div><div>2</div><div>3</div>

If you wish to create a number of elements for each member of the array, then
you can use a special <loop> element. This will be removed from the resulting
tree.

Or a more complex example:

    <table id="id" foreach="person in ${people}">
      <loop>
        <tr>
          <td>${person.firstname}
          <td>${person.surname}
        </tr>
        <tr>
          <td colspan=2>${person.address}
        </tr>
      </loop>
    </table>
    
    var data = {
      people: [
        { firstname: 'Miss', surname: 'Marple', address: 'St Mary Mead' },
        { firstname: 'Sherlock', surname: 'Holmes', address: '221B Baker St' },
        { firstname: 'Hercule', surname: 'Poirot', address: 'Apt 56B' },
      ]
    };
    
    templater.processNode('id', data);
    // Produces the predictable table with 2 rows per sleuth.

The foreach element can be used with arrays or objects. If an object is used
then we will iterate over the enumerable property names.


Getting references to cloned nodes (save="${element}")
------------------------------------------------------

The save attribute is special. It takes the current node at sets it into the
pointed to structure. In this case ${} is not arbitrary Javascript but a dot
path to an element to set.

This is useful whenever you need to work with the created nodes.

    <div foreach="person in ${people}">
      <div save="${person.nameElement}>${person.firstname}</div>
    </div>
    
    templater.processNode('id', data); // data as above
    people[0].nameElement.className = "highlight";


Grabbing the current node (${__element})
----------------------------------------

During templating you may need to get access to the current element.
Sometimes there's just no nice way to describe what you need to do, so the
__element tracks the element that is under examination.

For example:

    <div id="foo" class="bar">${console.log(__element.className)}</div>

    templater.processNode('foo'); // logs 'bar' to the console.

Slightly less contrived (but only slightly), this could be used when the data
might need to be fetched asynchronously:

    <div id="id">${loadName(__element)}</div>
    
    templater.processNode('id', {
      loadName: function(element) {
        if (data !== null) return data;
        fetchData(function(reply) {
          data = reply;
          element.innerHTML = data;
        });
      }
    });


Hidden nodes (_src="${...}")
----------------------------

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
prefixed with _, please contact me.
