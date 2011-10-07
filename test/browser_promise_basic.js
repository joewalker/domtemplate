/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that our Promise implementation works properly

Cu.import("resource:///modules/devtools/Promise.jsm");

function test()
{
  waitForExplicitFinish();
  addTab("http://example.com/browser/browser/devtools/shared/test/browser_promise_basic.html");
  browser.addEventListener("load", tabLoaded, true);
}

function tabLoaded()
{
  browser.removeEventListener("load", tabLoaded, true);
  info("Starting Promise Tests");
  testBasic();
}

var p;

function testBasic() {
  p = new Promise();
  ok(p.isPromise, "We have a promise");
  ok(!p.isComplete(), "Promise is initially incomplete");
  ok(!p.isResolved(), "Promise is initially unresolved");
  ok(!p.isRejected(), "Promise is initially unrejected");

  // Test resolve() *after* then() in the same thread
  var p2 = p.then(testPostResolution, fail).resolve("postResolution");
  is(p2, p, "return this; working ok");
}

function testPostResolution(data) {
  is(data, "postResolution", "data is postResolution");
  ok(p.isComplete(), "postResolution Promise is complete");
  ok(p.isResolved(), "postResolution Promise is resolved");
  ok(!p.isRejected(), "postResolution Promise is unrejected");

  try {
    p.resolve("double resolve");
    ok(false, "double resolve");
  }
  catch (ex) {
    // Expected
  }

  // Test resolve() *before* then() in the same thread
  p = new Promise();
  var p2 = p.resolve("preResolution").then(testPreResolution, fail);
  is(p2, p, "return this; working ok");
}

function testPreResolution(data) {
  is(data, "preResolution", "data is preResolution");
  ok(p.isComplete(), "preResolution Promise is complete");
  ok(p.isResolved(), "preResolution Promise is resolved");
  ok(!p.isRejected(), "preResolution Promise is unrejected");

  // Test resolve() *before* then() in the same thread
  p = new Promise();
  var p2 = p.resolve("preResolution").then(testPreResolution, fail);
  is(p2, p, "return this; working ok (part 2)");
}

function fail() {
  gBrowser.removeCurrentTab();
  info("Failed Promise Tests");
  ok(false, "fail called");
  p = undefined;
  finish();
}

function finished() {
  gBrowser.removeCurrentTab();
  info("Finishing Promise Tests");
  p = undefined;
  finish();
}

