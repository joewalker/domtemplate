
var Cu = {
  import: function(module, tempScope) {
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
  if (!test) {
    console.error('Assertion fail: ' + name);
  }
}

var info = console.log.bind(console);

function executeSoon(action) {
  setTimeout(action, 1);
}

window.addEventListener('load', function() {
  test();
});

var Promise = {
  defer: window.loader.defer,
  reject: window.loader.reject,
  resolve: window.loader.resolve,
  promised: window.loader.promised,
  all: window.loader.promised(Array)
};
