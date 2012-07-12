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
  if (!window.localStorage || !window.JSON) {
    if (console && console.log) {
      !window.localStorage && console.log("ERROR: you browser does not support" +
        " localStorage (use this polyfill https://gist.github.com/350433)");
      !window.JSON&& console.log("ERROR: you browser does not support" +
        " JSON (use this polyfill http://bestiejs.github.com/json3/)");
    }
    return $.fn.rememberState = function() { return this; };
  }
  $.fn.rememberState = function(defaults) {
    var opts = $.extend({
          clearOnSubmit: true,
          noticeDialog: $("<p />", {"class": "remember_state"})
            .html('Do you want to <a href="#">restore your previously entered info</a>?'),
          noticeSelector: ".remember_state",
          objName: false }, defaults);
    var use_ids = !(!!opts.objName);
    if (!("prop" in $.fn)) { $.fn.prop = $.fn.attr; }
    if (opts.noticeDialog.length && opts.noticeDialog.jquery) {
      opts.noticeDialog.find("a").bind("click.remember_state", function(e) {
        var data = JSON.parse(localStorage.getItem(opts.objName)),
            $f = $(this).closest("form"),
            $e;
        for (var i in data) {
          $e = $f.find("[name=\"" + data[i].name + "\"]");
          if ($e.is(":radio, :checkbox")) {
            $e.filter("[value=" + data[i].value + "]").prop("checked", true);
          }
          else if ($e.is("select")) {
            $e.find("[value=" + data[i].value + "]").prop("selected", true);
          }
          else {
            $e.val(data[i].value);
          }
          $e.change();
        }
        opts.noticeDialog.remove();
        e.preventDefault();
      });
    }
    if (this.length > 1) {
      if (console && console.log) {
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
          if (console && console.log) {
            console.log("ERROR: No form ID or object name. Add an ID or pass" +
              " in an object name");
            return this;
          }
        }
      }
      if (getObject(opts.objName)) {
        (opts.noticeDialog.length && typeof opts.noticeDialog === "object") ?
          opts.noticeDialog.prependTo($form) :
          $form.find(opts.noticeSelector).show();
      }
      $form.bind("reset_state.remember_state", function() {
  	    localStorage.removeItem(opts.objName);
      });
      if (opts.clearOnSubmit) {
        $form.bind("submit.remember_state", function() {
          $form.trigger("reset_state");
          $(window).unbind("unload.remember_state");
        });
      }
      $(window).bind("unload.remember_state", function() {
        var values = $form.serializeArray();
        // jQuery doesn't currently support datetime-local inputs despite a
        // comment by dmethvin stating the contrary:
        // http://bugs.jquery.com/ticket/5667
        // Manually storing input type until jQuery is patched
        $form.find("input[type='datetime-local']").each(function() {
          var $i = $(this);
          values.push({ name: $i.attr("name"), value: $i.val() });
        });
        if ( values.length )
          localStorage.setItem(opts.objName, JSON.stringify(values));
      });
      $form.find(":reset").bind("click.remember_state", function() {
        $(this).closest("form").trigger("reset_state");
      });
    });
  };
})(jQuery);