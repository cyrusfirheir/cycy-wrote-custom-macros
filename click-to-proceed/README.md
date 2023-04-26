# Click to Proceed (CTP) v2

**NOTE:** Version 2 is not entirely backwards compatible with version 1! See [what's changed](#changelog).

_Version 1 of this library can be found [here](https://github.com/cyrusfirheir/cycy-wrote-custom-macros/tree/56872f8fb0548e751224338d5d3b642c5e84a476/click-to-proceed)._

---

## Overview

This set of macros/functions aims to provide an easy way to set up content that is revealed bit-by-bit via user interaction.

Using nested `<<linkreplace>>` and `<<linkappend>>` works, but gets tedious and is often prone to errors. The CTP (Click To Proceed: original-est name ever) macros make it a bit easier by turning them into blocks instead of nests.

---

## Installation

If using the Twine desktop/web app, copy contents of `click-to-proceed.js` to `Story JavaScript`, and contents of `click-to-proceed.css` to `Story Stylesheet`.

If using a compiler like Tweego, drop `click-to-proceed.js` and `click-to-proceed.css` to your source folder.

`click-to-proceed.twee-config.yaml` can also be added to the workspace if using the [Twee 3 Language Tools](https://marketplace.visualstudio.com/items?itemName=cyrusfirheir.twee3-language-tools) VSCode extension, for macro definitions.

---

## Example Usage

```html
<<ctp "testID">>
	This is the first string.
<<ctpNext clear>>
	Second! It cleared the first one out!
<<ctpNext>>
	Third...
<<ctpNext>>
	The fourth!
<<ctpNext t8n>>
	And the final one. With a transition!
<</ctp>>

<<link "Next">>
	<<ctpAdvance "testID">>
<</link>>

<<link "Back">>
	<<ctpBack "testID">>
<</link>>
```

---

## Macros

### Keywords

Keywords for controlling behavior:  
- `clear`: Clears the content up until this block. Use for replacing.
- `t8n` or `transition`: Custom CSS animation based transition (400ms fade-in by default).
- `element:name`: Name of element to wrap the block in, (`<span>` by default). e.g. `element:div`, `element:p`, etc.
- `persist`: Makes this CTP persistent, i.e., the progress is remembered when you transition out of the passage and restored accordingly when you return to it.

---

### `<<ctp "id" [keywords]>>`

- `id`: *(string)* Unique ID to be used to identify the chain of content.

- `keywords`: *(optional|string)* Keywords (full list [here](#keywords)) can be used to alter the behavior of the macro throughout the entire chain. Keywords on `<<ctp>>` apply to all blocks.

**Example:**

```html
<<ctp "ID_of_the_year">>
	Bare minimum...
<</ctp>>
```

---

### `<<ctpNext [keywords]>>`

To be used inside `<<ctp>>` to separate the content into blocks.

- `keywords`: *(optional|string)* Keywords (full list [here](#keywords)) can be used to alter the behavior of the macro for the current block.

**Example:**

```html
<<ctp "fancyCTP">>
	One.
<<ctpNext clear>>
	Two with clear.
<<ctpNext>>
	Three.
<<ctpNext element:p>>
	Four but it's in a paragraph tag.
<<ctpNext t8n>>
	Fading five.
<</ctp>>
```

---

### `<<ctpAdvance "id">>`

The 'proceed' part of Click To Proceed... Used to move the train forward and show the next blocks.

- `id`: *(string)* Unique ID which was set up in `<<ctp>>`.

**NOTE:** Use with user interaction (inside a `<<link>>` or `<<button>>`) or inside a `<<timed>>` macro to ensure the DOM is loaded and has the element on the page for the macro to target.

**Example:**

```html
<<ctp "ID_of_the_year_once_again">>
	<!-- stuff -->
<</ctp>>

<<link "Next">>
	<<ctpAdvance "ID_of_the_year_once_again">>
<</link>>
```

---

### `<<ctpBack "id">>`

Turns back time and goes back one block.

- `id`: *(string)* Unique ID which was set up in `<<ctp>>`.

**NOTE:** Use with user interaction (inside a `<<link>>` or `<<button>>`) or inside a `<<timed>>` macro to ensure the DOM is loaded and has the element on the page for the macro to target.

**Example:**

```html
<<ctp "ID_of_the_year_yet_again">>
	<!-- stuff -->
<</ctp>>

<<link "Back">>
	<<ctpBack "ID_of_the_year_yet_again">>
<</link>>
```

---

## JavaScript usage

### The CTP Class properties

```ts
class CTP {
	id: string; // Unique ID
	stack: CTPContent[]; // Array of CTPContent objects
	options: CTPContent["options"]; // CTPContent Options object
	log: {
		index: number; // Zero-based index of current block
	};
	persist: boolean; // Whether to remember progress of the CTP instance across passage transitions. `false` by default.
}
```

---

### `new CTP(id, [persist])`

Creates a new `CTP` instance.

- `id`: *(string)* ID of the `CTP` object.
- `persist`: *(boolean)* Whether to makes this `CTP` persistent, i.e., the progress is remembered when you transition out of the passage and restored accordingly when you return to it (`false` by default).

**Example:**

```js
const ctpTest = new CTP("ctpTest");
```

---

### The content object

Each entry in the stack of content is stored in an object structured as follows:

```ts
interface CTPContent {
	index: number; // Zero-based index of current block
	options: {
		clear?: boolean; // Clear up till current block? `false` by default.
		transition?: boolean; // Add transition to current block? `false` by default.
		element?: string; // Name of HTML element to render content into. `span` by default.
	};
	content: string | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>; // content to be put out to the DOM. String or JQuery or HTMLElement
}
```

### `CTP.getCTP(id)`

Returns a `CTP` object created with the `<<ctp>>` macro.

- `id`: *(string)* ID of the `CTP` object.

**Example:**

```js
CTP.getCTP("testID");
```

---

### `<CTP>.add(content [, options])`

Adds content to the end of the stack. Returns the `CTP` object for chaining.

- `content`: *(string | JQuery | HTMLElement)* The actual content in the block.
- `options`: *(optional|content options object)* Options for the block. See: [the content object](#the-content-object).

**Example:**

```js
ctpTest
	.add("This is the first string.")
	.add("Second! It cleared the first one out!", { clear: true })
	.add("Third...")
	.add("And the final one. With a transition!", { transition: true });
```

---

### `<CTP Object>.advance()`

Does the same as `<<ctpAdvance>>`, moving to the next block. Returns the `CTP` object for chaining.

**Example:**

```js
ctpTest.advance();
```

---

### `<CTP Object>.back()`

Does the same as `<<ctpBack>>`, reverting to the previous blocks. Returns the `CTP` object for chaining.

**Example:**

```js
ctpTest.back();
```

---

### `<CTP Object>.output()`

Returns the document fragment which includes output for the CTP.

**NOTE:** This does NOT perform the very first advance needed to show the first block like the `<<ctp>>` macro does automatically.

**Example:**

```js
$(someElement).append(ctpTest.output());
```

---

***Complete usage:***

JavaScript:
```js
setup.ctpTest = new CTP("ctpTest");

setup.ctpTest
	.add("This is the first string.")
	.add("Second! It cleared the first one out!", { clear: true })
	.add("Third...")
	.add("And the final one. With a transition!", { transition: true });
```

In Passage:
```html
<div id="#ctp-test-id">
	<<script>>
		$(output).append(setup.ctpTest.output());
	<</script>>
</div>

<<link "Advance">>
	<<run setup.ctpTest.advance()>>
	<!-- OR -->
	<<ctpAdvance "ctpTest">>
<</link>>
```

---

### `update.macro-ctp` Event

Whenever the advance or back functions (or macros) are called, the `update.macro-ctp` synthetic event is triggered on `document`.  

It comes with the following extra data:  
- `type`: *("advance" | "back")* String which specifies whether the update is result of an advance or a back operation.  
- `id`: *(string)* ID of the CTP object on which the update is called.  
- `index`: *(number)* Index of the current block of the CTP object.

**Example:**

```js
$(document).on("update.macro-ctp", (event, type, id, index) => {
	// do something
});
```

---

### `update-internal.macro-ctp` Event

Whenever the advance or back functions (or macros) are called, the `update-internal.macro-ctp` synthetic event is triggered on all of the CTP blocks with the target ID.  

It comes with the following extra data:  
- `firstTime`: *(boolean)* Whether this is the first time the content is being rendered into the block element.  
- `type`: *("advance" | "back")* String which specifies whether the update is result of an advance or a back operation.  
- `id`: *(string)* ID of the CTP object on which the update is called.  
- `index`: *(number)* Index of the current block of the CTP object.

**Example:**

```js
$(document).on("update-internal.macro-ctp", (event, firstTime type, id, index) => {
	if (id === "ctpTest" && $(event.target).data("macro-ctp-index") === index) {
		console.log(event.target); // the current ctp block element
		// do something
	}
});
```

---

## Examples

### Appends each new segment and scrolls to the bottom
```js
setup.scrollToBottom = function() {
    $("html").stop(true); // clears queue, if player rapidly presses continue button and executes last
    $("html").animate({
        scrollTop: $("html").prop('scrollHeight')
    }, 2000);
}
```

```html
:: DiscordPlug

<<ctp 'chatLog'>>
    Cyrus Firheir: Join discord.
<<ctpNext>>
    SleepyFool: Why?
<<ctpNext>>
    Cyrus Firheir: Peeple be nice there. Much knowledge, very helpful.
<<ctpNext>>
    SleepyFool: I'm not sure it's a good idea to advertise it here...
<<ctpNext>>
    Cyrus Firheir: ?
<<ctpNext>>
    SleepyFool: Cuz then we'll get people who will blindly shout 'code for me!' and expect answers without even trying to solve their own problems or looking at the docs.
<<ctpNext>>
    Cyrus Firheir: Nooo, they be reading if they see dis!
<<ctpNext>>
    SleepyFool: That's... a fair point. Well if nothing else, we have friends with big hammers.
<<ctpNext>>
    Cyrus Firheir: :3
<</ctp>>

<<link 'Click to continue'>>
    <<ctpAdvance 'chatLog'>>
    <<run setup.scrollToBottom()>> /* if you need a widget or script to run every <<ctpNext>>, can tie to <<ctpAdvance>> instead */
<</link>>
```

---

## Changelog

### Changes since v1:

_Link to v1 [here](https://github.com/cyrusfirheir/cycy-wrote-custom-macros/tree/56872f8fb0548e751224338d5d3b642c5e84a476/click-to-proceed)._

- **Cleaner output**: No unnecessary classes and wrappers. Now it uses just one wrapping element per block of content, and blocks are put out to the DOM as is, not wrapped by another element containing all of them.  
- **Uses events**: Synthetic events make handling everything easier. And now allow the author to hook into them as needed.  
- **Simpler code**: Source code is cleaner, easier to modify. Dropped support for Internet Explorer, so the source is in modern JS.  
- **Lighter libray**: Functions (`go`, `goTo`), macros (`ctpHead`, `ctpTail`), and keywords (`nobr`, `redo`) were cut down. Some of them do not need to be in the base library and contribute towards bloat. The others, can be achieved by using other libraries alongside this. And if required, author can easily extend.  
- **Lighter State**: CTPs are now stored in a single repository in the `setup` object (vs `State.variables` in v1), and only the log is stored in story state (`State.variables`) and also, only for persistent instances. This repository does not need to persist across sessions, and does not need to be serialized into saves, so management is kept to a minimum.  
