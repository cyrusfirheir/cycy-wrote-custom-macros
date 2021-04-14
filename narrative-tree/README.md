# Narrative Tree (NTree)

## **NOTE:** THIS DOCUMENT IS STILL A DRAFT!

---
---
---

## Overview

> Tl;dr: This is multi-passage [CTPs](../click-to-proceed), basically.

The biggest challenge when trying to split up big chunks of text into smaller parts to be shown to the player is making it stateful without using a large number of passages.

This library aims to help with that.

And although this was initially written for a stateful visual-novel interface, its potential still remains unexplored.

---

## Installation

If using the Twine desktop/web app, copy contents of `narrative-tree.min.js` to `Story JavaScript`.

If using a compiler like Tweego, drop `narrative-tree.min.js` to your source folder.

`narrative-tree.twee-config.yaml` can also be added to the workspace if using the [Twee 3 Language Tools](https://marketplace.visualstudio.com/items?itemName=cyrusfirheir.twee3-language-tools) VSCode extension, for macro definitions.

> ***NOTE:*** This library is written in [TypeScript](https://www.typescriptlang.org/) using modern features of the language, and when transpiled down to the JavaScript that SugarCube 2 aims to support, the result is already pretty unreadable to allow for changes. That is why the minified form is recommended. The unminified JavaScript can be found in `narrative-tree.js`. The original TypeScript source can be found [here](https://github.com/cyrusfirheir/ntree).

---

## Concept

In this section:
- *tree:* Refers to the `NTree` controller object. 
- *branch:* Refers to the `<<treebranch>>` macro.
- *leaf:* Refers to the `<<leaf>>` child macro.

A **leaf** is where the content goes. It sends data to handlers.

A **handler** decides what to do with said data. It runs user-defined functions with the data it gets.

A **branch** has leaves, and can lead to other branches. Each leaf in the branch runs serially, a branch visit at a time (which is usually the same as a passage visit.) Once a branch is over, it can either end there, or repeat the last leaf, or roll back to the start.

Branches refer to a **tree**, to connect leaves to their corresponding handlers. The tree is the main controller object which governs how every part works.

Every tree has a **state**. This is a record of what leaf of a branch was last visited.

All of these parts make up the library, and juggling data back and forth across multiple trees, branches, and leaves, is what makes the system work.

---

## Reference

<i id="a-handler"></i>

### Handler

Handlers make up one of the most important parts of an `NTree`. They decide how to process the data that leaves send through a branch. A handler is an object with the following properties:

- `id`: *(string)* The ID of the handler unique to its parent `<NTree instance>`.

- `onUpdate`: *(function)* Runs whenever the handler is updated through a `<<leaf>>`. [Read more](#a-handler-fn-onupdate).

- `onClear`: *(optional, function)* Runs whenever the handler is passed `NTree.clear` as the data. [Read more](#a-handler-fn-onclear).

- `clearOnEveryLeaf`: *(optional, boolean)* If a `<<leaf>>` doesn't provide an update for the `onUpdate` to process, run the `onClear` instead? Is falsy by default.

- `skipArgs`: *(optional, boolean)* When a `<<leaf>>` passes an array as the update, parse it as a normal array, instead of an array of arguments? Is falsy by default.

- `delta`: *(optional, object)* Key-value pairs of handler IDs and values to update each handler with. Is passed by the `<NTree instance>.update()` method, which in turn is called by a `<<leaf>>`.

**Example:**

```js
{
	id: "mood",

	onUpdate(moodName) {
		if (moodName === "angry") {
			// do angry FX on screen
		}
	},

	onClear() {
		// remove mood FX from screen
	}
}
```

---

<i id="a-handler-fn-onupdate"></i>

### Handler function: `onUpdate(...argumentsFromLeaf [, macroContext])`

- `argumentsFromLeaf`: *(any)* At least one argument, obtained as follows:

	- Discrete arguments, as provided by a `<<leaf>>`:

		```html
		<<leaf {
			handlerID: singleArgument
		}>>
		```
		```html
		<<leaf {
			handlerID: [argument1, argument2, argument3, ...]
		}>>
		```
		```html
		<<leaf {
			handlerID: [
				[0, 1, 2, 3, ...]
			]
		}>> <!-- to pass an array as the argument -->
		```

	- Or one array, if `skipArgs` is turned on:

		```html
		<<leaf {
			handlerID: [0, 1, 2, 3, ...]
		}>> <!-- these will not be parsed as discrete arguments, rather as a single array -->
		```

<i id="a-one-based-index"></i>

- `macroContext`: *(optional)* [*MacroContext*](https://www.motoslave.net/sugarcube/2/docs/#macrocontext-api) of the `<<treebranch>>` the update providing `<<leaf>>` is a part of. Apart from the core properties listed in the SugarCube documentation, a `<<leaf>>` adds:

	- `currentPayload`: *(number)* The current `<<leaf>>`'s [payload](https://www.motoslave.net/sugarcube/2/docs/#macrocontext-api-prototype-property-payload) index in the `<<treebranch>>`.

		> ***NOTE:*** This index appears to be 1-based, but considering that the 0th index belongs to the parent macro, it is not by choice. It just is the default behavior. And because of this, the leaf index recorded in the `NTree` state also appears to be 1-based, when in fact, index 0 is just reserved.

	- `branchID`: *(string)* ID of the `<<treebranch>>` the leaf is from.

---

<i id="a-handler-fn-onclear"></i>

### Handler function: `onClear([macroContext])`

- `macroContext`: *(optional)* *MacroContext* of the `<<treebranch>>` the calling `<<leaf>>` is a part of. Apart from the core properties listed in the SugarCube documentation, a `<<leaf>>` adds:

	- `currentPayload`: *(number)* The current `<<leaf>>`'s payload index in the `<<treebranch>>`.

		> ***NOTE:*** As [described before](#a-one-based-index), this appears 1-based, but is not.

	- `branchID`: *(string)* ID of the `<<treebranch>>` the leaf is from.

---

<i id="a-ntree-state"></i>

### NTree State

The State of an NTree is an object with the following properties:

> ***Note:*** Accessing the state of an `NTree` directly should not be required for most usecases.

- `id`: The unique ID of its parent `NTree`.

- `log`: Key-value pairs of branch IDs and last visited leaf positions.

**Example:**

```js
{
	id: "Cherry Blossom",

	log: {
		"My favorite Branch": 1,
		"A nice branch": 3
	}
}
```

---

## Macros

<i id="a-macro-treebranch"></i>

### `<<treebranch treeID branchID [repeatBehavior]>>`

Defines a branch on a registered NTree.

- `treeID`: *(string)* The unique ID of the registered NTree this branch is connected to.

- `branchID`: *(string)* Unique ID for this branch, within the NTree.

- `repeatBehavior`: *(optional, norepeat | repeatlast | repeat)* This determines the behavior of the branch after the last leaf is reached. The three possible values are:

	- `norepeat`: Do not run the branch at all on subsequent visits.

	- `repeatlast`: *(default)* Keep repeating the last leaf on every susbequent branch visit.

	- `repeat`: Roll back over to the start on next branch visit.

**Example:**

```html
<<treebranch "Cherry Blossom" "My favorite branch">>
	…
<</treebranch>>
```
```html
<<treebranch "Cherry Blossom" "A nice branch" repeat>>
	…
<</treebranch>>
```

---

<i id="a-macro-leaf"></i>

### `<<leaf [handlerDelta]>>`

Child macro to `<<treebranch>>`. Defines a leaf on an NTree branch.

- `handlerDelta`: *(optional, object)* Key-value pairs of handler IDs and values to update each handler (run the `onUpdate`) with. If a value is `NTree.clear`, the `onClear` runs instead.

**Example:**

```html
<<treebranch "Cherry Blossom" "My favorite branch">>
	<<leaf {
		speaker: "The dragonfly"
	}>>
		Hello!
	<<leaf>>
		Nice to meet you!
<</treebranch>>
```

---

## JavaScript API

<i id="a-new-ntree"></i>

### `new NTree(id)`

Creates an `NTree` controller object, adds it to the [`NTree.Repository`](#a-ntree-repository). Then, initializes NTree State and adds the State object to [`NTree.StateStore`](#a-ntree-statestore).

- `id`: *(string)* The unique ID to register the `NTree` with.

**Example:**

```js
const myTree = new NTree("Cherry Blossom");
```

---

<i id="a-ntree-repository"></i>

### `NTree.Repository`

As the name suggests, this is a [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) which holds all the created `NTree` objects, at `setup["@NTree/Repository"]`.

> ***NOTE:*** Usage of this shouldn't be required directly in code. See the [`NTree.getNTree(id)`](#a-ntree-getntree) method instead.

---

<i id="a-ntree-statestore"></i>

### `NTree.StateStore`

A Map of NTree State data at `State.variables["@NTree/StateStore"]`.

> ***NOTE:*** Usage of this shouldn't be required directly in code. See the [`NTree.getState(id)`](#a-ntree-getstate) method, or the [`<NTree Instance>.state`](#a-ntree-i-state) property instead.

---

<i id="a-ntree-getntree"></i>

### `NTree.getNTree(id)`

Fetches the `NTree` of the specified ID from `NTree.Repository`.

- `id`: *(string)* The unique ID of the registered `NTree`.

**Returns:** `NTree` object if found, `undefined` otherwise.

**Example:**

```js
const myTreeAgain = NTree.getNTree("Cherry Blossom");
```

---

<i id="a-ntree-getstate"></i>

### `NTree.getState(id)`

Fetches the State of an `NTree` of the specified ID from `NTree.StateStore`.

- `id`: *(string)* The unique ID of the registered `NTree`.

**Returns:** State of the `NTree` if found, `undefined` otherwise.

**Example:**

```js
const stateOfMyTree = NTree.getState("Cherry Blossom");
```

---

<i id="a-ntree-i-state"></i>

### `<NTree instance>.state`

The state of the `<NTree instance>`.

**Example:**

```js
const stateOfMyTree = myTree.state;
```

---

<i id="a-ntree-i-register-handler"></i>

### `<NTree instance>.registerHandler(id, handlerConfig)`

Registers a handler for the `<NTree instance>`.

> ***NOTE:*** Registering multiple handlers for the same ID will only cause the newer ones to overwrite the older ones. There can only be one handler per ID.

> ***NOTE:*** Handlers run in the order they are registered.

- `id`: *(string | string array)* The ID of the handler unique to this `<NTree instance>`. An array is used to define multiple handlers with the same definition.

- `handlerConfig`: *(object)* The properties of the handler:

	- `onUpdate`: *(function)* Runs whenever a handler is updated through a `<<leaf>>`.

	- `onClear`: *(optional, function)* Runs whenever a handler is passed `NTree.clear` as the data.

	- `clearOnEveryLeaf`: *(optional, boolean)* If a `<<leaf>>` doesn't provide an update for the `onUpdate` to process, run the `onClear` instead? Is falsy by default.

	- `skipArgs`: *(optional, boolean)* When a `<<leaf>>` passes an array as the update, parse it as a normal array instead of an array of arguments? Is falsy by default.

**Returns:** A reference to the `<NTree instance>` for chaining.

**Example:**

```js
myTree.registerHandler("speaker", {
	onUpdate(speakerName) {
		console.log(speaker + " spoke to Cherry Blossom!");
	}
});
```

---

<i id="a-ntree-i-register-default"></i>

### `<NTree instance>.registerDefault(onUpdate)`

Registers a default handler for the `<NTree instance>`.

> ***NOTE:*** Registering multiple default handlers will only cause the newer one to overwrite the older. Similar to how there can only be one handler per ID, there can only be one default handler.

> ***NOTE:*** By default, the default handler is registered first, so runs first.

- `onUpdate`: *(function)* Runs on each `<<leaf>>`, and the data passed to the handler is the contents of the leaf.

**Returns:** A reference to the `<NTree instance>` for chaining.

**Example:**

```js
myTree.registerDefault(function (leafContents) {
	console.log("Cherry Blossom said: " + leafContents);
});
```

---

<i id="a-ntree-i-update"></i>

### `<NTree instance>.update(delta [, macroContext])`

Loops through registered handlers and runs their `onUpdate` and `onClear` according to the delta object and handler definitions.

> ***NOTE:*** Using this method directly should never be needed. Providing updates via the `<<leaf>>` macro is recommended, as updating and maintaining the state is closely tied to passage transitions.

- `delta`: *(object)* Key-value pairs of handler IDs and values to update each handler (run the `onUpdate`) with. If a value is `NTree.clear`, the `onClear` runs instead.

- `macroContext`: *(optional)* *MacroContext* of the macro its called from a macro. Usually, the `<<treebranch>>` macro.

**Returns:** A reference to the `<NTree instance>` for chaining.

**Example:**

```js
myTree.update({
	speaker: "The dragonfly"
});
```

---

<i id="a-ntree-clear"></i>

### `NTree.clear`

Symbol, which when passed as the update to a handler, triggers `onClear` if defined, instead of `onUpdate`.

**Example:**

```html
<<leaf {
	speaker: NTree.clear
}>>
```

---

<i id="a-ntree-deletentree"></i>

### `NTree.deleteNTree(id)`

Deletes an NTree and its State data from `NTree.Repository` and `NTree.StateStore` respectively.

> ***NOTE:*** When deleting an `NTree`, one should be sure of never visiting its branches afterwards.

- `id`: *(string)* The unique ID of the registered `NTree` to delete.

**Returns:** `true` if both the `NTree` and its State existed, and were deleted successfully, `false` otherwise.

**Example:**

```js
NTree.deleteNTree("Cherry Blossom"); // ;-;
```

---

## Examples

COMING SOON!