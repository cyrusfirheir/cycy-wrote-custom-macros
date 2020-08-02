## Overview

A set of two macros to make life easier when updating a variable and its displays.


## Installation

If using the Twine web/desktop app, copy the contents of `sc-databind.js` into the `Edit Story JavaScript` section.

If using a compiler like Tweego, just include `sc-databind.js` in your source directory.


## Macros

***NOTE:*** These macros are meant to be used only when the change in value needs to be shown without a passage transition. For other uses, please fall back to the `<<print>>` macro.

### Live display macros

(`<<live>>`, `<<l>>`, or `<<lh>>`)

The `<<live>>` (aka `<<l>>`) macro is used in place of the `<<print>>` (aka `<<=>>`) macro to ensure that the expression in it gets re-evaluated and updated whenever its value is changed using the `<<update>>` macro.

`<<lh>>` (substitute for `<<->>`) is functionally identical to the `<<live>>` macro, except that it encodes special HTML characters in the output.

Syntax is exactly the same as that of the `<<print>>` macro (documentation [here](https://www.motoslave.net/sugarcube/2/docs/#macros-macro-print)).

### Display update macros

(`<<update>>` or `<<upd>>`)

The `<<update>>` (aka `<<upd>>`) macro triggers the a synthetic event `:liveupdate` to update the live displays created using the `<<live>>` macro.

Optionally takes in variable names as arguments to specify what is being updated.


## Usage

```html
<<set $testVar to 0>>
<<set $testVar2 to 0>>

Counter: <<live $testVar>>
Counter2: <<live $testVar2>>

<!-- Whenever the following button is clicked, the above display of $testVar will get updated with newer values -->
<<button "Update Counter to <<live $testVar + 1>>">>
  <<set $testVar++>>
  <<update "$testVar">>
<</button>>

<!-- Whenever the following button is clicked, both counters will get updated together -->
<<button "Update Counter to <<live $testVar + 1>> and Counter2 to <<live $testVar2 + 1>>">>
  <<set $testVar++, $testVar2++>>
  <<update>> <!-- in this example this is the same as <<update "$testVar" "$testVar2">> -->
<</button>>
```


## Triggering the update from JavaScript

Just trigger this synthetic event:

```js
$(document).trigger(":liveupdate");
```

To specify which variables to update:

```js
$(document).trigger({
  type: ":liveupdate",
  sources: [
    "globalVariableName",
    "$twineScriptVar",
    "_temporary"
  ]
});
```

---
