# jQuery form remember state plugin

## Version: 1.2

When called on a form element, localStorage is used to remember the values that have been input up to the point of either saving or unloading. (closing window, navigating away, etc.) If localStorage isn't available, nothing is bound or stored.

By default, the plugin looks for an element with a class of remember_state within the form to show a note indicating there is stored data that can be repopulated by clicking on the anchor within the remember_state container. If the element doesn't exist, it is created and prepended to the form. You can override the selector and the HTML that is prepended in the options object you pass to the plugin.

### Options

    clearOnSubmit: true // Removes localStorage object when form submitted. Default is true
    noticeDialog: $("<div />").html("<a href=\"#\">Restore</a>") // A newly created HTML element to represent the notice box prepended to the form. Must include an anchor for the user to choose to restore state
    noticeSelector: ".remember_state" // If your noticeDialog already exists in the form, pass its selector here and clear out the noticeDialog option by setting it to false.
    objName: "unique_form_name" // Specify a name for the localStorage object. If none is supplied, the form's ID will be used. If no ID is available, the plugin will fail, issuing a log explaining why.

### Usage

```javascript
$("form").rememberState("my_object_name");
```


### Notes

To trigger the deletion of a form's localStorage object from outside the plugin, trigger the reset_state event on the form element by using $("form").trigger("reset_state");

