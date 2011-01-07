var o = "remember_state_test_data";
var setup = function() {
  return $("#qunit-fixture").find("form").rememberState(o);
};
var triggerUnload = function() {
  $(window).trigger("unload");
};

test("Requirements", 3, function() {
  ok($, "$");
  ok($.fn.rememberState, "$.fn.rememberState");
  ok((typeof window.localStorage.setItem === "function"), "localStorage supported");
});

module("rememberState", {
  setup: function() {
    delete localStorage[o];
  }
});

test("It should have no data in localStorage", function() {
  ok(!localStorage[o]);
});

test("Value in text field should save state", function() {
  var $form = setup();
  $form.find("#first_name").val("Shane");
  triggerUnload();
  ok(/Shane/.test(localStorage.getObject(o)[0].value), "First name saved");
  $form.find("#lastt_name").val("Riley");
  ok(!(/Riley/.test(localStorage.getObject(o)[0].value)), "Last name not saved");
});

test("Value in radio should save state", function() {
  var $form = setup();
  $form.find("#gender_male").attr("checked", true);
  triggerUnload();
  ok(/Male/.test(localStorage[o]), "Gender saved");
  $form.find("#gender_female").attr("checked", true);
  ok(!(/Female/.test(localStorage[o])), "Gender not saved");
});

test("Value in select box should save state", function() {
  var $form = setup();
  $form.find("#marital_status option:contains(Married)").attr("selected", true);
  triggerUnload();
  ok(/Married/.test(localStorage[o]), "Marital status saved");
  $form.find("#marital_status option:contains(Single)").attr("selected", true);
  ok(!(/Single/.test(localStorage[0])), "Marital status not saved");
});

test ("Value in checkbox should save state", function() {
  var $form = setup();
  $form.find("[name=video_games]").attr("checked", true);
  triggerUnload();
  ok(/Video/.test(localStorage[o]), "Video games saved");
  $form.find("[name=dendrophilia]").attr("checked", true);
  ok(!(/Dendro/.test(localStorage[o])), "Dendrophilia not saved");
});