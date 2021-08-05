(function () {
	"use strict";

	function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

	function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

	function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

	function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

	function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() { }; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

	function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

	function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

	var NTree = /*#__PURE__*/function () {
		function NTree(id) {
			_classCallCheck(this, NTree);
			this.handlers = new Map();
			if (!(id === null || id === void 0 ? void 0 : id.trim())) throw new Error("@NTree: No ID specified!");
			this.id = id;
			this.registerDefault(NTree.defaultOnUpdateHandler);
			NTree.Repository.set(id, this);
			NTree.StateStore.set(id, {
				id: id,
				log: {},
				delta: {}
			});
		}
		_createClass(NTree, [{
			key: "state",
			get: function get() {
				return NTree.getState(this.id);
			}
		}, {
			key: "registerHandler",
			value: function registerHandler(id, def) {
				var IDs = id instanceof Array ? id : [id];
				var _iterator = _createForOfIteratorHelper(IDs),
					_step;
				try {
					for (_iterator.s(); !(_step = _iterator.n()).done;) {
						var _id = _step.value;
						if (!(_id === null || _id === void 0 ? void 0 : _id.trim())) throw new Error("@NTree/".concat(this.id, ": Handler ID not specified!"));
						this.handlers.delete(_id);
						var errorSource = "@NTree/".concat(this.id, "/handlers/").concat(_id);
						if (!def.onUpdate) throw new Error("".concat(errorSource, ": No definition for onUpdate() found!"));
						if (!(def.onUpdate instanceof Function)) throw new Error("".concat(errorSource, ": Specified onUpdate() is not a function!"));
						if (def.onClear && !(def.onClear instanceof Function)) throw new Error("".concat(errorSource, ": Specified onClear() is not a function!"));
						this.handlers.set(_id, Object.assign(Object.create(null), def, {
							id: _id
						}));
					}
				} catch (err) {
					_iterator.e(err);
				} finally {
					_iterator.f();
				}
				return this;
			}
		}, {
			key: "registerDefault",
			value: function registerDefault(onUpdate) {
				var def = {
					onUpdate: onUpdate
				};
				return this.registerHandler(NTree.defaultHandlerID, def);
			}
		}, {
			key: "update",
			value: function update(delta, macroContext) {
				this.handlers.forEach(function (handler) {
					var id = handler.id;
					handler.delta = delta;
					function clear() {
						if (handler.onClear) handler.onClear(macroContext);
					}
					if (delta.hasOwnProperty(id)) {
						var deltaVal = delta[id];
						var clearDirective = deltaVal === NTree.clear;
						if (clearDirective) return clear();
						if (handler.skipArgs) {
							handler.onUpdate.call(handler, deltaVal, macroContext);
						} else {
							var _handler$onUpdate;
							var args = deltaVal instanceof Array ? deltaVal : [deltaVal];
							args.push(macroContext);
							(_handler$onUpdate = handler.onUpdate).call.apply(_handler$onUpdate, [handler].concat(_toConsumableArray(args)));
						}
					} else {
						if (handler.clearOnEveryLeaf) clear();
					}
				});
			}
		}], [{
			key: "Repository",
			get: function get() {
				if (!setup["@NTree/Repository"]) setup["@NTree/Repository"] = new Map();
				return setup["@NTree/Repository"];
			}
		}, {
			key: "StateStore",
			get: function get() {
				if (!variables()["@NTree/StateStore"]) variables()["@NTree/StateStore"] = new Map();
				return variables()["@NTree/StateStore"];
			}
		}, {
			key: "getNTree",
			value: function getNTree(id) {
				return NTree.Repository.get(id);
			}
		}, {
			key: "getState",
			value: function getState(id) {
				return NTree.StateStore.get(id);
			}
		}, {
			key: "defaultOnUpdateHandler",
			value: function defaultOnUpdateHandler(inString, macroContext) {
				if (macroContext) {
					$(macroContext.output).wiki(macroContext.payload.slice(1, macroContext.currentPayload + 1).map(function (load) {
						return load.contents;
					}).join(""));
				}
			}
		}, {
			key: "deleteNTree",
			value: function deleteNTree(id) {
				return NTree.Repository.delete(id) && NTree.StateStore.delete(id);
			}
		}]);
		return NTree;
	}();
	NTree.defaultHandlerID = "__default";
	NTree.clear = Symbol.for("@NTree/clear");

	window.NTree = NTree;

	var NTreeBranchRepeatConfig;
	(function (NTreeBranchRepeatConfig) {
		NTreeBranchRepeatConfig["NoRepeat"] = "norepeat";
		NTreeBranchRepeatConfig["RepeatLast"] = "repeatlast";
		NTreeBranchRepeatConfig["Repeat"] = "repeat";
	})(NTreeBranchRepeatConfig || (NTreeBranchRepeatConfig = {}));

	Macro.add("treebranch", {
		tags: ["leaf"],
		skipArgs: ["leaf"],
		handler: function handler() {
			var _a, _b;
			var _this = this;
			try {
				var treeID = _this.args[0];
				var branchID = _this.args[1];
				var repeat = (_a = _this.args[2]) !== null && _a !== void 0 ? _a : NTreeBranchRepeatConfig.RepeatLast;
				if (!(treeID === null || treeID === void 0 ? void 0 : treeID.trim())) throw new Error("@NTreeBranch: No NTree ID specified!");
				if (!(branchID === null || branchID === void 0 ? void 0 : branchID.trim())) throw new Error("@NTreeBranch: No NTreeBranch ID specified");
				var tree = NTree.getNTree(treeID);
				if (!tree) throw new Error("@NTreeBranch: No NTree with specified ID \"".concat(treeID, "\" found!"));
				var latest = (_b = tree.state.log[branchID]) !== null && _b !== void 0 ? _b : 0;
				var current = latest + 1;
				if (current === _this.payload.length) {
					switch (repeat) {
						case NTreeBranchRepeatConfig.Repeat:
							{
								current = 1;
								break;
							}
						case NTreeBranchRepeatConfig.RepeatLast:
							{
								current = latest;
								break;
							}
						case NTreeBranchRepeatConfig.NoRepeat:
							{
								return;
							}
					}
				}
				_this.currentPayload = current;
				_this.branchID = branchID;
				var chunk = _this.payload[current];
				var args = chunk.args.full.trim() || "{}";
				var delta = tree.state.delta;
				try {
					var parsedDelta = Scripting.evalJavaScript("(".concat(args, ")"));
					Object.keys(parsedDelta).forEach(function (key) {
						delta[key] = parsedDelta[key];
					});
				} catch (ex) {
					throw new Error("@NTreeLeaf/#".concat(current - 1, ": Malformed argument object:\n").concat(args, ": ").concat(ex));
				}
				tree.update(Object.assign(_defineProperty({}, NTree.defaultHandlerID, chunk.contents), delta), _this);
				tree.state.log[branchID] = current;
			} catch (ex) {
				_this.error("bad evaluation: " + (_typeof(ex) === "object" ? ex.message : ex));
			}
		}
	});
})();