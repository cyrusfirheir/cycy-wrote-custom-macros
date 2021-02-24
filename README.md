# Cycy wrote custom macros

---

## Installation

Download this repository (easiest way to grab everything, really) and cherry pick whatever you want in your project. Some might have CSS files, others won't, but everything you need is there. Along with a `README.md` for each macro which has further instructions on installation and usage.

Each macro set provides a `<macro-name>.twee-config.yaml` file which can also be added to workspace if using the [Twee 3 Language Tools](https://marketplace.visualstudio.com/items?itemName=cyrusfirheir.twee3-language-tools) VSCode extension, for macro definitions of that set. It's recommended for error diagnostics.

Besides that, there's a `cycy.twee-config.yaml` in the root of the repo, and that has definitions for *all* the macro-sets in one file. This is the better way to go about it — only one file to keep track of.

---

> ***NOTE:***  
> If you've used previous versions of the stuff from GitHub Gists, I'd recommend going through the README files again. There are some changes incompatible with those earlier versions.

---

## Macro sets

1. [Click to Proceed (CTP)](./click-to-proceed)  
    - Clean way to reveal text block-by-block in the same passage without having to nest a million `<<linkreplace>>` macros.  
    - Primarily made for VN like interfaces.

2. [Crossfade](./crossfade)  
    - Crossfade between two images with simple macros.
    - Can be used to fade-in and fade-out too.

3. [Live Update](./live-update)  
    - Make the *display* of an expression 'live' and 'update' every such display to see the changes instantly.  
    - Under the hood, it works similarly to how the `<<replace>>` and other DOM macros do, but on the surface, it's *wayyy* simpler to use.

---

## JavaScript Libraries

1. [Rock paper scissors (RPS)](./rock-paper-scissors)
	- Makes RPS logic simpler.
	- Works for more than just three elements.

---

That about it...
