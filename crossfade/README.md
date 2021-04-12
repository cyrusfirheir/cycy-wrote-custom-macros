# Crossfade

## Overview

Macros to make crossfading between two images easier.

---

## Installation

If using the Twine desktop/web app, copy contents of `crossfade.js` to `Story JavaScript`, and contents of `crossfade.css` to `Story Stylesheet`.

If using a compiler like Tweego, drop `crossfade.js` and `crossfade.css` to your source folder.

`crossfade.twee-config.yaml` can also be added to the workspace if using the [Twee 3 Language Tools](https://marketplace.visualstudio.com/items?itemName=cyrusfirheir.twee3-language-tools) VSCode extension, for macro definitions.

---

## Example Usage

```html
<<crossfadecontainer "testID">>

<<button "Fade in">>
	<<crossfade "testID" "path/to/image.png">>
<</button>>
```

```html
<<crossfadecontainer "testID" "path/to/image_1.png">>

<<button "Switch image">>
	<<crossfade "testID" "path/to/image_2.png">>
<</button>>
```

```html
<<crossfadecontainer "testID" "path/to/image.png">>

<<button "Fade out">>
	<<crossfade "testID" "">>
<</button>>
```

---

## Macros


### `<<crossfadecontainer id [initialImagePath]>>`

Creates a container to use for crossfading between images.

- `id`: *(string)* The unique ID to be used to refer to this contianer later.

- `initialImagePath`: *(optional|string)* Path to the image which should already be in the container. If unspecified, no image is present by default, and `<<crossfade>>`-ing *fades in* the new image.

**Example:**

```html
<<crossfadecontainer "testID" "path/to/fancyImage.png">>

<!-- Blank container -->
<<crossfadecontainer "anotherID">>
```

---

### `<<crossfade id imagePath [fadeDuration]>>`

Crossfades between new image and image already in a pre-defined `<<crossfadecontainer>>`.

SEE: [DOM Macros Warning](https://www.motoslave.net/sugarcube/2/docs/#macros-dom-warning)

- `id`: *(string)* ID of pre-defined `<<crossfadecontainer>>`.

- `imagePath`: *(string)* Path to the new image to crossfade to. Use empty string (`""`) — or *any* falsy value — to *fade out* the image already in the container.

- `fadeDuration`: *(optional|cssTime)* The duration of the crossfade. Has to be a valid CSS time value (`250ms`, `3.1415s`, etc.) If unspecified, defaults to `400ms`.

**Example:**

```html
<<crossfadecontainer "testID" "path/to/fancyImage.png">>

<<button "Switch">>
	<<crossfade "testID" "path/to/anotherFancyImage.png">>
<</button>>

<<button "Slowww fade out">>
	<<crossfade "testID" "" 4s>>
<</button>>
```

---

## JavaScript Usage

### `setup.crossfade.container(id, [initialImagePath])`

Generates the contaner, similar to the `<<crossfadecontainer>>` macro, optionally with an `image` already in it.

- `id`: *(string)* The unique ID to be used to refer to this contianer later.

- `initialImagePath`: *(optional|string)* Path to the image which should already be in the container. If unspecified, no image is present by default, and `<<crossfade>>`-ing *fades in* the new image.

**Returns:**

- `HTMLElement`: The container element.

---

### `setup.crossfade.fade(element, imagePath, [fadeDuration])`

Crossfades between image already in the passed `element` and new image, similar to `<<crossfade>>`.

- `element`: *(string|HTMLElement)* Selector string (see `setup.crossfade.selector` below) or HTMLElement to do the crossfade in.

- `imagePath`: *(string)* Path to the new image to crossfade to. Use empty string (`""`) — or *any* falsy value — to *fade out* the image already in the container.

- `fadeDuration`: *(optional|number)* The duration of the crossfade in milliseconds (`250`, `3141`, etc.) Defaults to `400`.

---

### `setup.crossfade.selector(id)`

Creates a selector string from a crossfade container ID.

- `id`: *(string)* Container ID to make selector string out of.

**Returns:**

- `string`: The selector string, e.g. `testID` becomes `.macro-crossfade[data-macro-crossfade-id="testID"]`.

---

### Complete example


```js
var id = "testID";

$(".some-element-selector")
	.append(setup.crossfade.container(id, "path/to/image.png"));

$(".some-interactive-element")
	.ariaClick(function () {
		var element = setup.crossfade.selector(id);
		setup.crossfade.fade(element, "path/to/anotherImage.png", 800);
	});
```

---