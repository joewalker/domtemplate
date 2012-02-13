
var Cu = {
  import: function(module, tempScope) {
    if (typeof template !== 'undefined') {
      tempScope.template = template;
    }
    if (typeof Promise !== 'undefined') {
      tempScope.Promise = Promise;
    }
  }
};

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
  if (actual !== expected) {
    console.error('Assertion fail: ' + name);
    console.log('- actual  =', actual);
    console.log('- expected=', expected);
  }
}

function ok(test, name) {
  console.assert(test, name);
}

function info(message) {
  console.log(message);
}

function executeSoon(action) {
  setTimeout(action, 1);
}

window.addEventListener('load', function() {
  test();
});
