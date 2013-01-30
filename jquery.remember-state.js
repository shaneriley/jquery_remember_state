(function($) {
  /* jQuery form remember state plugin
     Name: rememberState
     Version: 1.3.2
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

     Added multiple form support (each form must have a different id). 2013-01-29. v1.3.1 mh
     Added an autoFill option (like automatically clicking the link to restore the stored data). 2013-01-29. v1.3.1 mh
     Added an sessionStorage option (setting this to true will use the sessionStorage object instead of localStorage object). 2013-01-30. v1.3.2 mh
  */
	if (!window.localStorage || !window.JSON) {
		if (console && console.log) {
			!window.localStorage && console.log("ERROR: you browser does not support" +
				" localStorage (use this polyfill https://gist.github.com/350433)");
			!window.JSON&& console.log("ERROR: you browser does not support" +
				" JSON (use this polyfill http://bestiejs.github.com/json3/)");
		}
		return $.fn.rememberState = function() {
			return this;
		};
	}

	var remember_state = {
		name: "rememberState",
		clearOnSubmit: true,
		noticeDialog: (function() {
			return $("<p />", {
				"class": "remember_state"
			})
			.html('Do you want to <a href="#">restore your previously entered info</a>?');
		})(),
		ignore: null,
		noticeSelector: ".remember_state",
		use_ids: false,
		objName: false,
		autoFill: false,
		sessionStorage: false,
		clickNotice: function(e) {
			var data = internals.getObject(e.data.instance.objName),
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
			if(e.data.noticeDialog)e.data.noticeDialog.remove();
			e.preventDefault();
		},
		chooseStorageProp: function() {
			if (this.$el.length > 1) {
				if (console && console.warn) {
					console.warn("WARNING: Cannot process more than one form with the same" +
						" object. Attempting to use form IDs instead.");
				}
				this.objName = this.$el.attr("id");
			}
			else if (this.$el.length == 1 && this.$el.attr("id")!== undefined) {
				this.objName = this.$el.attr("id");
			}
		},
		errorNoID: function() {
			if (console && console.log) {
				console.log("ERROR: No form ID or object name. Add an ID or pass" +
					" in an object name");
			}
		},
		saveState: function(e) {
			var instance = e.data.instance;
			var values = instance.$el.serializeArray();
			// jQuery doesn't currently support datetime-local inputs despite a
			// comment by dmethvin stating the contrary:
			// http://bugs.jquery.com/ticket/5667
			// Manually storing input type until jQuery is patched
			instance.$el.find("input[type='datetime-local']").each(function() {
				var $i = $(this);
				values.push({
					name: $i.attr("name"),
					value: $i.val()
				});
			});
			values = instance.removeIgnored(values);
			values.length && internals.setObject(instance.objName, values);
		},
		save: function() {
			var instance = this;
			if (!this.saveState) {
				instance = this.data(remember_state.objName);
			}
			instance.saveState({
				data: {
					instance: instance
				}
			});
	},
	removeIgnored: function(values) {
		if (!this.ignore) {
			return values;
		}
		$.each(this.ignore, function(i, name) {
			$.each(values, function(j, input) {
				if (name === input.name) {
					delete values[j];
				}
			});
		});
		return values;
	},
	init: function() {
		var instance = this;

		instance.chooseStorageProp();
		if (!instance.objName) {
			instance.errorNoID();
			return;
		}

		internals.sessionStorage(instance.sessionStorage);

		var noticeDialog = instance.noticeDialog.clone();
		if (!instance.autoFill && noticeDialog.length && noticeDialog.jquery) {
			noticeDialog.find("a").bind("click." + instance.objName, {
				instance: instance,
				noticeDialog: noticeDialog
			}, instance.clickNotice);
		}

		if (internals.getObject(instance.objName)) {
			if (!instance.autoFill && noticeDialog.length && typeof noticeDialog === "object") {
				noticeDialog.prependTo(instance.$el);
			}
			else {
				instance.$el.find(instance.noticeSelector).show();
			}
		}
		if (instance.clearOnSubmit) {
			instance.$el.bind("submit." + instance.objName, function() {
				instance.$el.trigger("reset_state");
				$(window).unbind("unload." + instance.objName);
			});
		}

		instance.$el.bind("reset_state." + instance.objName, function() {
			internals.removeObject(instance.objName);
		});
		$(window).bind("unload." + instance.objName, {
			instance: instance
		}, instance.saveState);
		instance.$el.find(":reset").bind("click.remember_state", function() {
			$(this).closest("form").trigger("reset_state");
		});

		if (instance.autoFill) {
			$('<a/>').bind("click." + instance.objName, {
				instance: instance
			}, instance.clickNotice)
			.prependTo(instance.$el)
			.trigger('click');
		}
	}
};

var internals = {
	ls : localStorage,
	sessionStorage : function(isSession){
		this.ls = ((isSession) ? sessionStorage : localStorage);
	},
	setObject: function(key, value) {
		this.ls[key] = JSON.stringify(value);
	},
	getObject: function(key) {
		return JSON.parse(this.ls[key] || false);
	},
	removeObject: function(key) {
		this.ls.removeItem(key)
	},
	createPlugin: function(plugin) {
		$.fn[plugin.name] = function(opts) {
			var $els = this,
			method = $.isPlainObject(opts) || !opts ? "" : opts;
			if (method && plugin[method]) {
				plugin[method].apply($els, Array.prototype.slice.call(arguments, 1));
			}
			else if (!method) {
				$els.each(function(i) {
					var plugin_instance = $.extend(true, {
						$el: $els.eq(i)
					}, plugin, opts);
					$els.eq(i).data(plugin.name, plugin_instance);
					plugin_instance.init();
				});
			}
			else {
				$.error('Method ' +  method + ' does not exist on jQuery.' + plugin.name);
			}
			return $els;
		};
	}
};

internals.createPlugin(remember_state);
})(jQuery);
