(function () {
  "use strict";

  window.CTP = function (config) {
    this.id = "";
    this.selector = "";
    this.stack = [];
    this.head = "";
    this.tail = "";
    this.log = {
      index: 0,
      delayed: false
    };
    Object.keys(config).forEach(function (pn) {
      this[pn] = clone(config[pn]);
    }, this);
  };

  CTP.prototype.clone = function () {
    return new CTP(this);
  };

  CTP.prototype.toJSON = function () {
    var ownData = {};
    Object.keys(this).forEach(function (pn) {
      ownData[pn] = clone(this[pn]);
    }, this);
    return JSON.reviveWrapper('new CTP($ReviveData$)', ownData);
  };

  CTP.getCTP = function (id) {
    var clone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (!id || !id.trim()) return;
    variables()["#macro-ctp-dump"] = variables()["#macro-ctp-dump"] || {};
    return clone ? variables()["#macro-ctp-dump"][id].clone() : variables()["#macro-ctp-dump"][id];
  };

  CTP.contentObject = function (content) {
    var mods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    mods = mods.split(/\s+/g);
    return {
      clear: mods.includes("clear") && !mods.includes("noClear"),
      nobr: mods.includes("nobr") && !mods.includes("br"),
      transition: mods.includesAny("t8n", "transition") && !mods.includesAny("noT8n", "noTransition"),
      delay: Util.fromCssTime(mods.find(function (el) {
        return /\d+m?s/.test(el);
      }) || "0s"),
      content: content
    };
  };

  CTP.prototype.add = function (content) {
    var mods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    var contentObj = CTP.contentObject(content, mods);
    contentObj.index = this.stack.length;
    this.stack.push(contentObj);
    return this;
  };

  CTP.item = function (item) {
    var noT8n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (!item) return "";
    var t8n = noT8n ? "" : item.transition ? "macro-ctp-entry-t8n" : "";
    var br = item.index === 0 || item.index === "head" || item.clear ? " " : item.nobr ? " " : "<br>";
    var brAfter = item.index === "head" && !item.nobr ? "<br>" : " ";
    return br + '<span class="macro-ctp-entry macro-ctp-entry-index-' + item.index + ' ' + t8n + '">' + item.content + '</span>' + brAfter;
  };

  CTP.prototype.entry = function (index) {
    var noT8n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (index < 0 || index >= this.stack.length) return "";
    var entry = this.stack[index];
    return CTP.item(entry, noT8n);
  };

  CTP.prototype.out = function () {
    var _this = this;
    var mods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var noClear = mods.includes("noClear");
    var noT8n = mods.includes("noT8n");
    var clearIndex = 0;
    if (!noClear) {
      var _clear = this.stack.filter(function (el) {
        return el.clear && el.index < _this.log.index + 1;
      });
      if (_clear.length) clearIndex = _clear[_clear.length - 1].index;
    }
    return this.stack.slice(clearIndex, this.log.index + 1).reduce(function (acc, cur) {
      return acc + _this.entry(cur.index, noT8n);
    }, "");
  };

  CTP.prototype.advance = function () {
    var _this2 = this;
    if (this.log.index === this.stack.length - 1 || this.log.delayed) return this;
    var index = ++this.log.index;
    var _el = $(this.selector).find(".ctp-body");
    if (this.stack[index].clear) _el.empty();
    this.log.delayed = true;
    function delay(ctp) {
      ctp.log.delayed = false;
      $(ctp.selector).find(".ctp-body").wiki(ctp.entry(ctp.log.index)).parent().find(".ctp-head").empty().wiki(CTP.item(ctp.head)).parent().find(".ctp-tail").empty().wiki(CTP.item(ctp.tail));
    }
    setTimeout(function () {
      return delay(_this2);
    }, this.stack[index].delay);
    return this;
  };

  CTP.prototype.back = function () {
    if (this.log.index <= 0 || this.log.delayed) return this;
    this.log.index--;
    $(this.selector).find(".ctp-body").empty().wiki(this.out("noT8n")).parent().find(".ctp-head").empty().wiki(CTP.item(this.head)).parent().find(".ctp-tail").empty().wiki(CTP.item(this.tail));
    return this;
  };

  Macro.add("ctp", {
    tags: ["ctpNext", "ctpHead", "ctpTail"],
    handler: function handler() {
      var _id = this.args[0];
      var _data = 'data-ctp="' + Util.escape(_id) + '"';
      var ctp = new CTP({
        id: _id,
        selector: '[' + _data + ']'
      });
      var _overArgs = this.payload[0].args;
      _overArgs.reverse().pop();
      _overArgs = " " + _overArgs.join(" ");
      this.payload.forEach(function (el, index) {
        var _args = el.args.join(" ");
        switch (el.name) {
          case "ctpHead":
            {
              var _head = CTP.contentObject(el.contents.trim(), _args + _overArgs);
              _head.index = "head";
              ctp.head = _head;
              break;
            }

          case "ctpTail":
            {
              var _tail = CTP.contentObject(el.contents.trim(), _args + _overArgs);
              _tail.index = "tail";
              ctp.tail = _tail;
              break;
            }

          default:
            {
              ctp.add(el.contents.trim(), (el.name === "ctp" ? "" : _args) + _overArgs);
              break;
            }
        }
      });
      variables()["#macro-ctp-dump"] = variables()["#macro-ctp-dump"] || {};
      variables()["#macro-ctp-dump"][_id] = ctp;
      $(this.output).wiki('<span ' + _data + ' class="macro-ctp-wrapper">' + '<span class="ctp-head"></span>' + '<span class="ctp-body">' + ctp.out() + '</span>' + '<span class="ctp-tail"></span>' + '</span>').find(".ctp-head").wiki(CTP.item(ctp.head)).parent().find(".ctp-tail").wiki(CTP.item(ctp.tail));
    }
  });

  Macro.add("ctpAdvance", {
    handler: function handler() {
      var ctp = CTP.getCTP(this.args[0]);
      if (ctp) ctp.advance();
    }
  });

  Macro.add("ctpBack", {
    handler: function handler() {
      var ctp = CTP.getCTP(this.args[0]);
      if (ctp) ctp.back();
    }
  });

  $(document).on(':passageinit', function () {
    delete variables()["#macro-ctp-dump"];
  });
})();
