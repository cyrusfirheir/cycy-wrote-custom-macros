;(function () {
	"use-strict";
	var crossfade = {};

	/**
	 * Creates container element for crossfading between two images.
	 * @param {string} id UID for the crossfade container element.
	 * @param {string} image Path to first populated image.
	 * @returns {HTMLElement} The container HTMLElement.
	 */
	function crossfadeContainer(id) {
		var image = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
		if (!id) throw new Error("No ID specified!");
		var $el = $("<div />").addClass("macro-crossfade").attr("data-macro-crossfade-id", id);
		var imgBack = $("<img />").addClass("macro-crossfade-image").attr("src", image).appendTo($el);
		var imgFront = $("<img />").addClass("macro-crossfade-image").attr("src", image).appendTo($el);
		return $el.get(0);
	}
	crossfade.container = crossfadeContainer;

	/**
	 * Creates a selector string from a crossfade container ID.
	 * @param {string} id UID to make selector out of.
	 * @returns {string} Selector string.
	 */
	function crossfadeSelector(id) {
		return '.macro-crossfade[data-macro-crossfade-id="' + id + '"]';
	}
	crossfade.selector = crossfadeSelector;

	/**
	 * Fades in a new image on top of existing one. Needs target element to already have two image elements.
	 * @param {string|HTMLElement} element Selector string or HTMLElement of the crossfade container.
	 * @param {string} img Path to the image to fade to.
	 * @param {number} duration Duration of fade, in milliseconds
	 */
	function fade(element, img) {
		var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 400;
		if (!element) throw new Error("No element specified!");
		if (!$(element).length) throw new Error(_typeof(element) === "string" ? 'No elements matched selector "' + selector + '"!' : 'Specified element not found!');
		var images = $(element).children("img");
		var backBefore = images.eq(0);
		img = img || null;
		backBefore.attr("src", img).fadeOut(0).appendTo(images.parent()).fadeIn(img ? duration : 0, function () {
			var backAfter = images.eq(1);
			if (img) {
				backAfter.attr("src", img);
			} else {
				backAfter.fadeOut(duration, function () {
					backAfter.attr("src", img).fadeIn(0);
				});
			}
		});
	}
	crossfade.fade = fade;

	Macro.add("crossfadecontainer", {
		handler: function handler() {
			var id = this.args[0];
			var img = this.args[1];

			try {
				this.output.append(crossfadeContainer(id, img));
			} catch (ex) {
				return this.error(_typeof(ex) === 'object' ? ex.message : ex);
			}
		}
	});

	Macro.add("crossfade", {
		handler: function handler() {
			var _this$args$;
			if (this.args.length === 0) return this.error("No ID specified!");
			if (this.args.length === 1) return this.error("No image path specified!");
			var selector = crossfadeSelector(this.args[0]);
			if (!$(selector).length) return this.error('No "<<crossfadecontainer>>" with ID "' + this.args[0] + '" found!');
			var img = this.args[1];
			var duration = Util.fromCssTime((_this$args$ = this.args[2]) !== null && _this$args$ !== void 0 ? _this$args$ : "400ms");
			fade(selector, img, duration);
		}
	});

	setup.crossfade = crossfade;
})();