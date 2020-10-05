## Overview

This set of macros/functions aims to provide an easy way to set up content that is revealed bit-by-bit via user interaction.

Using nested `<<linkreplace>>` and `<<linkappend>>` works, but gets tedious and is often prone to errors. The CTP (Click To Proceed: original-est name ever) macros make it a bit easier by turning them into blocks instead of nests.


## Installation

If using the Twine desktop/web app, copy contents of `click-to-proceed.js` to `Story JavaScript`, and contents of `click-to-proceed.css` to `Story Stylesheet`.

If using a compiler like Tweego, drop `click-to-proceed.js` and `click-to-proceed.css` to your source folder.

`click-to-proceed.twee-config.yaml` can also be added to the workspace if using the [Twee 3 Language Tools](https://marketplace.visualstudio.com/items?itemName=cyrusfirheir.twee3-language-tools) VSCode extension, for macro definitions.


## Example Usage

See [more examples](#examples).

```html
<<ctp "testID">>
  This is the first string.
<<ctpNext clear>>
  Second! It cleared the first one out!
<<ctpNext nobr>>
  Third, but with nobr...
<<ctpNext 2s>>
  The fourth shows up 2 seconds late.
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


## Macros

#### Keywords

Keywords for controlling behavior:  
- `clear`: Clears the content of the previous block. Use for replacing.
- `nobr`: Appends content to the same line as the last block instead of going to a new line.
- `t8n` or `transition`: Custom CSS animation based transition (400ms fade-in by default).
- (delay): A valid CSS time value (e.g. `3s` or `250ms`) to delay the display of the block by.

Additional keywords for individual blocks (`<<ctpNext>>`, `<<ctpHead>>`, `<<ctpTail>>`) in a chain (these are used to break out of behavior set by the `<<ctp>>` macro):
- `noClear`: Overrides `clear` and keeps previous blocks in place instead of replacing.
- `br`: Overrides `nobr` and adds a line break before the current block.
- `noT8n` or `noTransition`: Overrides `t8n` or `transition` and removes the transition for the current block.
- (delay): Overrides the delay set by `<<ctp>>` for the current block.
- `redo`: When going back up the chain, re-render this block.

---

### `<<ctp "id" [keywords]>>`

- `id`: *(string)* Unique ID to be used to identify the chain of content. The naming rule follows the same as those of SugarCube variable names (learn more [here](https://www.motoslave.net/sugarcube/2/docs/#twinescript-variables)).

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
<<ctpNext nobr>>
  Three on the same line.
<<ctpNext 500ms>>
  Delayed four.
<<ctpNext t8n>>
  Fading five.
<</ctp>>
```

---

### `<<ctpHead [keywords]>>`

To be used inside `<<ctp>>` as a block *prepended* to the chain which is re-evaluated at every `<<ctpAdvace>>` and `<<ctpBack>>`. As long as it is inside `<<ctp>>`, the position does not matter.

The main body of the CTP chain is always rendered first, before `<<ctpHead>>` or `<<ctpTail>>`.

- `keywords`: *(optional|string)* Keywords (full list [here](#keywords)) can be used to alter the behavior of the macro for the current block.

**Example:**

```html
<<ctp "fancyCTP">>
  <<set _ctp to CTP.getCTP("fancyCTP")>>
  This is the first block. Declare any variables to be used by ctpHead in here.
<<ctpHead>>
  <<if _ctp.log.index is 1>>
	<!-- do stuff if this is the second block -->
  <</if>>
<<ctpNext>>
  This is the second!
<</ctp>>
```

---

### `<<ctpTail [keywords]>>`

To be used inside `<<ctp>>` as a block *appended* to the chain which is re-evaluated at every `<<ctpAdvace>>` and `<<ctpBack>>`. As long as it is inside `<<ctp>>`, the position does not matter.

The main body of the CTP chain is always rendered first, before `<<ctpHead>>` or `<<ctpTail>>`.

- `keywords`: *(optional|string)* Keywords (full list [here](#keywords)) can be used to alter the behavior of the macro for the current block.

**Example:**

```html
<<ctp "fancyCTP">>
  <<set _ctp to CTP.getCTP("fancyCTP")>>
  This is the first block. Declare any variables to be used by ctpHead in here.
<<ctpNext>>
  This is the second!
<<ctpTail>>
  <<if _ctp.log.index is 1>>
	<!-- do stuff if this is the second block -->
  <</if>>
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

## JavaScript usage - Functions

### `CTP.getCTP(id [, clone])`

Returns a `CTP` object created with the `<<ctp>>` macro.

- `id`: *(string)* ID of the `CTP` object.
- `clone`: *(optional|boolean)* Whether to return a deep clone. False by default, making the function return a reference to the original object.

**Example:**

```js
CTP.getCTP("testID");
```

---

## JavaScript usage - The `CTP` object

***The `CTP` custom object is set up as follows:***

`id`: *(string)* Unique ID.  
`selector`: *(string)* CSS selector to target to output to. When used by the macro, this is the slugified form of `id`.  
`stack`: *(array)* An array of [content](#the-content-object) objects.  
`head` and `tail`: *(object)* Contain the `<<ctpHead>>` and `<<ctpTail>>` respectively. Structured as [content](#the-content-object) objects.  
`log`: *(object)* Keeps track of blocks and their behaviors:  
- `index`: *(whole number)* Current index of block (zero-based).  
- `delayed`: *(boolean)* Whether the current block is delayed or not.

**Example:**

```js
var ctpTest = new CTP({
  id: "ctpTest",
  selector: "#ctp-test-id"
});
```

#### The content object

Each entry in the stack of content (plus the `head` and `tail`) is stored in an object structured as follows:

```js
var content = {
  index: 0, // whole number [string for "head" and "tail"]
  clear: false, // boolean
  nobr: false, // boolean
  transition: false, // boolean
  delay: 0, // time in milliseconds
  content: "Actual content to be put out to DOM" // string
}
```

---

***Object methods:***

### `<CTP Object>.add(content [, keywords])`

Adds content to the end of the stack and returns the `CTP` object for chaining.

- `content`: *(string)* The actual content in the block.
- `keywords`: *(optional|string)* Space-separated list of keywords (clear, nobr, t8n, transition) to modify the behavior of the blocks.

**Example:**

```js
ctpTest
  .add("This is the first string.")
  .add("Second! It cleared the first one out!", "clear")
  .add("Third, but with nobr...", "nobr")
  .add("And the final one. With a transition!", "t8n");
```

---

### `<CTP Object>.advance()`

Does the same as `<<ctpAdvance>>`, moving to the next block. Returns a promise if advanced successfully, `undefined` otherwise.

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

### `<CTP Object>.entry(index [, noT8n])`

Returns the HTML output for a single block at the index passed into it.

- `index`: *(whole number)* Index of block to return.
- `noT8n`: *(optional|boolean)* If true, all transitions are removed. False by default.

**Example:**

```js
ctpTest.entry(2);

// Assuming ctpTest is the same as in the previous examples, this returns:
// <span class="macro-ctp-entry macro-ctp-entry-index-2">Third, but with nobr...</span>
```

---

### `<CTP Object>.out()`

Returns the HTML output for setting up the chain with the structure and the first block.

**Example:**

```js
ctpTest.out();

/* Returns:
 *
 * <span class="macro-ctp-wrapper">
 *  <span class="ctp-head"></span>
 *  <span class="ctp-body">
 *    <span class="macro-ctp-entry macro-ctp-entry-index-0">
 *      Content
 *    </span>
 *  </span>
 *  <span class="ctp-tail"></span>
 * </span>
 */
```

---


***Complete usage:***

JavaScript:
```js
State.variables.ctpTest = new CTP({
  id: "ctpTest",
  selector: "#ctp-test-id"
});

State.variables.ctpTest
  .add("This is the first string.")
  .add("Second! It cleared the first one out!", "clear")
  .add("Third, but with nobr...", "nobr")
  .add("And the final one. With a transition!", "t8n");
```

In Passage:
```html
<div id="#ctp-test-id">
  <<= $ctpTest.out()>>
</div>

<<link "Advance">>
  <<run $ctpTest.advance()>>
  <!-- Because $ctpTest was created manually, using the <<ctpAdvance>> macro won't work. To be able to use <<ctpAdvance>>, the CTP object needs to be set as a property of State.variables["#macro-ctp-dump"] as that is what is used internally to store CTP objects created via the macros. -->
<</link>>
```

---

## Examples

### A chain where the `Back` and `Next` buttons hide themselves when they're not needed.

```html
<<ctp "testID">>
  <<set _ctp to CTP.getCTP("testID")>>
  This is the first string.
<<ctpHead>>
  <<if _ctp.log.index gt 0>>
	<<button "Back">>
	  <<ctpBack "testID">>
	<</button>>
  <</if>>
<<ctpNext clear>>
  Second! It cleared the first one out!
<<ctpNext nobr>>
  Third, but with nobr..
<<ctpNext 500ms>>
  The fourth shows up half a second late.
<<ctpNext t8n>>
  And the final one. With a transition!
<<ctpTail>>
  <<if _ctp.log.index lt _ctp.stack.length - 1>>
	<<button "Next">>
	  <<ctpAdvance "testID">>
	<</button>>
  <</if>>
<</ctp>>
```
