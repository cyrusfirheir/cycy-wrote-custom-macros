(function () {
	"use strict";

	window.CTP = class CTP {
		constructor(id) {
			this.stack = [];
			this.clears = [];
			this.options = {};
			this.log = { lastClear: -1, index: -1, seen: -1 };
			if (!id?.trim()) throw new Error(`No ID specified!`);
			this.id = id;
			CTP.Repository.set(id, this);
		}

		static get Repository() {
			if (!setup["@CTP/Repository"]) setup["@CTP/Repository"] = new Map();
			return setup["@CTP/Repository"];
		}

		static getCTP(id) {
			return CTP.Repository.get(id);
		}

		add(content, options = {}) {
			if (options.clear) this.clears.push(this.stack.length);
			this.stack.push({
				options, content,
				index: this.stack.length
			});
			return this;
		}

		print(index) {
			const { content, options: iOpts } = this.stack[index];
			const options = {
				...this.options,
				...iOpts
			};
			const element = $(document.createElement(options.element || "span"))
				.addClass("--macro-ctp-hidden")
				.attr({
					"data-macro-ctp-id": this.id,
					"data-macro-ctp-index": index,
				})
				.on("update.macro-ctp", (_, firstTime) => {
					if (index === this.log.index) {
						if (firstTime) {
							if (typeof content === "string") element.wiki(content);
							else element.append(content);
							element.addClass(options.transition ? "--macro-ctp-t8n" : "");
						}
						element.removeClass("--macro-ctp-hidden");
					}
					else {
						if (index < this.log.seen) element.removeClass("--macro-ctp-t8n");
						element.toggleClass("--macro-ctp-hidden", index > this.log.index || index < this.log.lastClear);
					}
				});
			return element;
		}
		output() {
			const wrapper = document.createDocumentFragment();
			for (let i = 0; i < this.stack.length; i++) {
				this.print(i).appendTo(wrapper);
			}
			return wrapper;
		}
		advance() {
			if (this.log.index < this.stack.length - 1) {
				this.log.index++;
				const firstTime = this.log.index > this.log.seen;
				this.log.seen = Math.max(this.log.seen, this.log.index);
				this.log.lastClear = this.clears.slice().reverse().find(el => el <= this.log.index) ?? -1;
				$(document).trigger("update.macro-ctp", ["advance", this.id, this.log.index]);
				$(`[data-macro-ctp-id="${this.id}"]`).trigger("update.macro-ctp", [firstTime]);
			}
			return this;
		}
		back() {
			if (this.log.index > 0) {
				this.log.index--;
				this.log.lastClear = this.clears.slice().reverse().find(el => el <= this.log.index) ?? -1;
				$(document).trigger("update.macro-ctp", ["back", this.id, this.log.index]);
				$(`[data-macro-ctp-id="${this.id}"]`).trigger("update.macro-ctp", [false]);
			}
			return this;
		}
	}

	Macro.add("ctp", {
		tags: ["ctpNext"],
		handler() {
			const id = this.args[0];
			const ctp = new CTP(id);
			this.payload.forEach(({ args, name, contents }) => {
				const options = {
					clear: args.includes("clear"),
					transition: args.includesAny("t8n", "transition")
				};
				const elementArg = (args.find((el) => el.startsWith("element:")) ?? "");
				if (elementArg) options.element = elementArg.replace("element:", "");
				if (name === "ctp") ctp.options = { ...options };
				ctp.add(contents, options);
			});
			$(this.output).append(ctp.output());
			$(document).on(":passagedisplay", () => ctp.advance());
		}
	});

	Macro.add("ctpAdvance", {
		handler() {
			const id = this.args[0];
			if (id) {
				const ctp = CTP.getCTP(id);
				if (ctp) ctp.advance();
				else throw new Error(`No CTP with ID '${id}' found!`);
			} else throw new Error(`No ID specified!`);
		}
	});

	Macro.add("ctpBack", {
		handler() {
			const id = this.args[0];
			if (id) {
				const ctp = CTP.getCTP(id);
				if (ctp) ctp.back();
				else throw new Error(`No CTP with ID '${id}' found!`);
			} else throw new Error(`No ID specified!`);
		}
	});
})();