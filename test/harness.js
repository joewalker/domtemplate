
var Cu = { import: function() {} };

function addTab(ignored, callback) {
  callback();
}

var content = window;

var browser = {
  addEventListener: function(name, func, capture) {
    func();
  },
  removeEventListener: function(name, func, capture) {}
};

var gBrowser = { removeCurrentTab: function() {} };

function finish() {
}

function is(actual, expected, name) {
  console.assert(actual === expected, name + ': actual=', actual, ' expected=', expected);
}

function ok(test, name) {
  console.assert(test, name);
}

function info() {
  console.debug.apply(console, arguments);
}

function executeSoon(action) {
  setTimeout(action, 1);
}

window.addEventListener('load', function() {
  test();
});

function executeSoon(func) {
  setTimeout(func, 200);
}
