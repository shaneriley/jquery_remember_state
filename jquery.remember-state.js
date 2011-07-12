(function($) {
  /* jQuery form remember state plugin
     Name: rememberState
     Version: 1.1
     Description: When called on a form element, localStorage is used to
     remember the values that have been input up to the point of either
     saving or unloading. (closing window, navigating away, etc.) If
     localStorage isn't available, nothing is bound or stored.
     The plugin looks for an element with a class of remember_state to show
     a note indicating there is stored data that can be repopulated by clicking
     on the anchor within the remember_state container. If the element doesn't
     exist, it is created and prepended to the form.
     Usage: $("form").rememberState("my_object_name");
     Notes: To trigger the deletion of a form's localStorage object from
     outside the plugin, trigger the reset_state event on the form element
     by using $("form").trigger("reset_state");
  */
  $.fn.rememberState = function(defaults) {
    var opts = $.extend({
          clearOnSubmit: true,
          noticeDialog: (function() {
            var $e = $("<p />", {"class": "remember_state"})
                     .html('Do you want to <a href="#">restore your previously entered info</a>?');
            return $e;
          })(),
          noticeSelector: ".remember_state",
          objName: false }, defaults);
    var use_ids = !(!!opts.objName);
    if (opts.noticeDialog.length && typeof opts.noticeDialog === "object") {
      opts.noticeDialog.find("a").bind("click.remember_state", function() {
        var data = localStorage.getObject(opts.objName),
            $f = $(this).closest("form"),
            $e;
        for (var i in data) {
          $e = $f.find("[name=" + data[i].name + "]");
          if ($e.is(":radio,:checkbox")) {
            $e.filter("[value=" + data[i].value + "]").attr("checked", true);
          } else if ($e.is("select")) {
            $e.children("[value=" + data[i].value + "]").attr("selected", true);
          } else { $e.val(data[i].value); }
        }
        opts.noticeDialog.remove();
        return false;
      });
    }
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
          opts.objName = $form.attr("id");
        }
        else {
          if (console.log) {
            console.log("ERROR: No form ID or object name. Add an ID or pass" +
              " in an object name");
            return this;
          }
        }
      }
      if (localStorage[opts.objName]) {
        (opts.noticeDialog.length && typeof opts.noticeDialog === "object") ?
          opts.noticeDialog.prependTo($form) :
          $form.find(opts.noticeSelector).show();
      }
      $form.bind("reset_state", function() {
        delete localStorage[opts.objName];
      });
      if (opts.clearOnSubmit) {
        $form.bind("submit.remember_state", function() {
          $(this).trigger("reset_state");
        });
      }
      $(window).bind("unload.remember_state", function() {
        var personal_info = localStorage.setObject(opts.objName, $("form").serializeArray());
      });
      $form.find(":reset").bind("click.remember_state", function() {
        $(this).closest("form").trigger("reset_state");
      });
    });
  };
})(jQuery);
Storage.prototype.setObject = function(key, value) { this[key] = JSON.stringify(value); };
Storage.prototype.getObject = function(key) { return JSON.parse(this[key]); };
