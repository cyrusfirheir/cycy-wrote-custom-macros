## Overview

A little library to make the rock-paper-scissor logic simpler. Can be used for any number of odd elements (except 1, of course.)


## Installation

If using the Twine desktop/web app, copy contents of `rock-paper-scissors.js` to `Story JavaScript`.

If using a compiler like Tweego, drop `rock-paper-scissors.js` to your source folder.


## Example Usage

The following example uses the 'extended' version of RPS, rock-paper-scissors-lizard-spock.

```html
<<set _rps to new RPS([
	"rock", "spock", "paper", "lizard", "scissors"
])>>

<<set _player to _rps.elements.random()>>
<<set _opponent to _rps.elements.random()>>

You played <<= _player>>.
They played <<= _opponent>>.

<<set _result to _rps.compare(_player, _opponent)>>

<<if _result gt 0>>
	You win!
<<elseif _result lt 0>>
	You lose...
<<else>>
	It's a draw.
<</if>>
```

## Usage - The RPS object

The `RPS` object does the math to calculate the outcome of a match. Takes in the array of elements as an argument (see [how to arrange the elements.](#how-to-arrange-the-elements))

**NOTE:** The elements do not have to be a string. Internally, a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object is used, so the elements can be of any type.

**Example:**

```js
var rpsTest = new RPS([
	"rock", "paper", "scissors"
]);
```

---

***Object Properties:***

### `<RPS Object>.elements`

An array of the elements that was passed in as the argument while instantiating the RPS object.

**Example:**

```js
var rpsTest = new RPS([
	"rock", "paper", "scissors"
]);

rpsTest.elements; // returns ["rock", "paper", "scissors"]
```

---

***Object Methods:***

### `<RPS Object>.compare(p1, p2)`

Calculates the outcome of a match.

**Arguments:**

- `p1`: *(any)* Element (of the pre-defined elements during instantiation) that 'player 1' chooses.
- `p2`: *(any)* Element (of the pre-defined elements during instantiation) that 'player 2' chooses.

**Returns:**

- *(integer)* A single number which can be interpreted as follows:
	- If positive, player 1 wins.
	- If negative, player 1 loses.
	- If zero, it's a draw.

**Example:**

```js
var rpsTest = new RPS([
	"rock", "paper", "scissors"
]);

rpsTest.compare("rock", "scissors"); // returns 1. And that's a win.
rpsTest.compare("rock", "paper"); // returns -1. A loss.
rpsTest.compare("rock", "rock"); // returns 0. A draw.
```

---

## How to arrange the elements

The way any RPS system works is as follows:

1. There are an odd number of elements to keep the game balanced.
2. Every element wins against half of the remaining elements, and loses to the other half.

To adhere to those principles, the order of the elements has to follow one simple rule:

> No element should have its winning and losing brackets interleave.

That statement can be broken down further to these rules:

1. Each element has to occur *before* the entire bracket of elements it loses to.
2. Each element has to occur *after* the entire bracket of elements it wins against.

Of course, an array doesn't go on forever on both sides, nor does it make a closed loop, but for this implementation, arrays are cyclic and the positions can freely change given they stay in the same cyclic order. Which means, `ABC`, `BCA`, and `CAB` are all the same.

***Some examples:***

1. Classic rock-paper-scissors:  
	- The array is `["rock", "paper", "scissors"]`.
	- Each element's winning match comes before it, and the losing match comes after.

2. Rock-paper-scissors-lizard-spock:  
	- The array is `["rock", "spock", "paper", "lizard", "scissors"]`.
	- Same with this. Winning matches to the 'left', and losing matches to the 'right'.
	- Note how the two new elements took positions between the existing ones. For the system to stay balanced, this is a guaranteed side-effect.

---