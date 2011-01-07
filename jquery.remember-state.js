(function($) {
  /* jQuery form remember state plugin
     Name: rememberState
     Description: When called on a form element, localStorage is used to
     remember the values that have been input up to the point of either
     saving or unloading. (closing window, navigating away, etc.) If
     localStorage isn't available, nothing is bound or stored.
     The plugin looks for an element with a class of remember_state to show
     a note indicating there is stored data that can be repopulated by clicking
     on the anchor within the remember_state container. If the element doesn't
     exist, it is created and prepended to the form.
     Usage: $("form").rememberState("my_object_name");
  */
  $.fn.rememberState = function(obj_name) {
    var use_ids = !(!!obj_name);
    if (this.length > 1) {
      if (console.log) {
        console.log("WARNING: Cannot process more than one form with the same" +
          " object. Attempting to use form IDs instead.");
      }
      use_ids = true;
    }
    return this.each(function() {
      var $form = $(this);
      if (use_ids) {
        if ($form.attr("id")) {
          obj_name = $form.attr("id");
        }
        else {
          if (console.log) {
            console.log("ERROR: No form ID or object name. Add an ID or pass" +
              " in an object name");
            return this;
          }
        }
      }
      if (localStorage[obj_name]) {
        if (!$form.find(".remember_state").length) {
          $("<p />", {"class": "remember_state"})
            .html('Do you want to <a href="#">restore your previously entered info</a>?')
            .prependTo($form);
        }
        else { $(".remember_state").show(); }
        $(".remember_state a").click(function() {
          var personal_info = localStorage.getObject(obj_name);
          for (var i in personal_info) {
            var $e = $form.find("[name=" + personal_info[i].name + "]");
            if ($e.is(":radio")) {
              $e.filter("[value=" + personal_info[i].value + "]").attr("checked", true);
            }
            else if ($e.is(":checkbox")) { $e.attr("checked", true); }
            else { $e.val(personal_info[i].value); }
          }
          $(this).closest(".remember_state").remove();
          return false;
        });
      }
      $(window).unload(function() {
        var personal_info = localStorage.setObject(obj_name, $("form").serializeArray());
      });
      $("form").find(":reset").click(function() {
        delete localStorage[obj_name];
      });
    });
  };
})(jQuery);
Storage.prototype.setObject = function(key, value) { this[key] = JSON.stringify(value); };
Storage.prototype.getObject = function(key) { return JSON.parse(this[key]); };