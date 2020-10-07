(function () {
	"use strict";
	window.RPS = function (elements) {
		if (!(elements === null || elements === void 0 ? void 0 : elements.length)) throw new Error("No elements specified!");
		if (elements.length === 1) throw new Error("There have to be at least 3 elements!");
		if (elements.length % 2 === 0) throw new Error("There cannot be an even number of elements!");
		this.elements = elements;
		this.$els = new Map();
		elements.forEach(function (el, i) {
			this.$els.set(el, i);
		}, this);
	};

	RPS.prototype.clone = function () {
		return new RPS(this);
	};

	RPS.prototype.toJSON = function () {
		var ownData = {};
		Object.keys(this).forEach(function (pn) {
			ownData[pn] = clone(this[pn]);
		}, this);
		return JSON.reviveWrapper('new RPS($ReviveData$)', ownData);
	};

	RPS.prototype.compare = function (p, o) {
		var n = this.$els.size;
		var d = this.$els.get(p) - this.$els.get(o);
		return d + (Math.abs(d) > (n - 1) / 2) * Math.sign(d) * n * -1;
	};
})();