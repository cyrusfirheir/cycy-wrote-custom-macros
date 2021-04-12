# Live Update

## Overview

A set of two macros to make life easier when updating a variable and its displays.

---

## Installation

If using the Twine web/desktop app, copy the contents of `live-update.js` into the `Edit Story JavaScript` section.

If using a compiler like Tweego, just include `live-update.js` in your source directory.

`live-update.twee-config.yaml` can also be added to the workspace if using the [Twee 3 Language Tools](https://marketplace.visualstudio.com/items?itemName=cyrusfirheir.twee3-language-tools) VSCode extension, for macro definitions.

---

## Macros

***NOTE:*** These macros are meant to be used only when the change in value needs to be shown without a passage transition. For other uses, please fall back to the `<<print>>` macro.

---

### Live display macros


- `<<live>>`, `<<l>>`, or `<<lh>>`

The `<<live>>` (aka `<<l>>`) macro is used in place of the `<<print>>` (aka `<<=>>`) macro to ensure that the expression in it gets re-evaluated and updated whenever its value is changed using the `<<update>>` macro.

`<<lh>>` (substitute for `<<->>`) is functionally identical to the `<<live>>` macro, except that it encodes special HTML characters in the output.

Syntax is exactly like that of the `<<print>>` macro (documentation [here](https://www.motoslave.net/sugarcube/2/docs/#macros-macro-print)).

- `<<liveblock>>` or `<<lb>>`

This is a container macro for entire sections of code. Can be used to re-render bigger chunks without having to resort to the `<<include>>` macro pulling the code from some passage.

Example:

```html
<<set $key to undefined>>

<<liveblock>>
	<<if $key is "red">>
		You picked up the red key!
	<<elseif $key is "blep">>
		The key disappears… You are unlucky. Go home.
	<<else>>
		<<button "Pick up Key">>
		<<set $key to either("red", "blep")>> <!-- 50% chance of getting the key -->
		<<update>>
		<</button>>
	<</if>>
<</liveblock>>
```

---

### Display update macros

- `<<update>>` or `<<upd>>`

The `<<update>>` (aka `<<upd>>`) macro triggers the a synthetic event `:liveupdate` to update the live displays created using the `<<live>>` macro.

---

## Usage

```html
<<set $testVar to 0, $testVar2 to 0>>

<<button "Add 1">>
	<<set $testVar++>>
	<<update>>
<</button>>

$testVar : this is potato - no updates

<<button "Add 1">>
	<<set $testVar2++>>
	<<update>>
<</button>>

<<live $testVar2>> : this is live

<!-- block level -->
<<button "Add 1 to both">>
	<<set $testVar++, $testVar2++>>
	<<update>>
<</button>>

<<liveblock>>
	$testVar, $testVar2
<</liveblock>> : both are live!
```

---

## Triggering the update from JavaScript

Just trigger this synthetic event:

```js
$(document).trigger(":liveupdate");
```

---
