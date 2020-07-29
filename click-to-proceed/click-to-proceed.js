(function () {
  "use strict";
  window.CTP = function (config) {
    this.id = "";
    this.selector = "";
    this.stack = [];
    this.head = "";
    this.tail = "";
    this.log = {
      clear: 0,
      index: 0,
      seen: 0,
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
        return /[0-9\.]+m?s/.test(el);
      }) || "0s"),
      re: mods.includes("redo"),
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
    var br = item.index === 0 || item.index === "head" || item.clear ? " " : item.nobr ? " " : '<br class="macro-ctp-entry-index-' + item.index + '">';
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
      return '<span class="macro-ctp-wrapper">' + '<span class="ctp-head"></span>' + '<span class="ctp-body">' + this.entry(0) + '</span>' + '<span class="ctp-tail"></span>' + '</span>';
    };

  CTP.prototype.advance = function () {
    var _this = this;
    var seen = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    if (this.log.index === this.stack.length - 1 || this.log.delayed) return;
    var index = ++this.log.index;
    if (!seen) this.log.seen = index;
    var _el = $(this.selector).find(".ctp-body");
    if (this.stack[index].clear) {
      _el.children().hide();
      this.log.clear = index - 1;
    }
    this.log.delayed = true;
    function delay(ctp) {
      ctp.log.delayed = false;
      $(ctp.selector).find(".ctp-body").wiki(ctp.entry(ctp.log.index)).siblings(".ctp-head").empty().wiki(CTP.item(ctp.head)).siblings(".ctp-tail").empty().wiki(CTP.item(ctp.tail));
    }
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        delay(_this);
        resolve("advanced");
      }, _this.stack[index].delay);
    });
  };

  CTP.prototype.back = function () {
    var _this3 = this;
    if (this.log.index <= 0 || this.log.delayed) return this;
    if (this.log.clear >= --this.log.index) {
      var clearIndex = 0;
      var _clear = this.stack.filter(function (el) {
        return el.clear && el.index < _this3.log.index + 1;
      });
      if (_clear.length) clearIndex = _clear[_clear.length - 1].index;
      this.stack.slice(clearIndex, this.log.index + 1).forEach(function (el) {
        $(_this3.selector).find(".macro-ctp-entry-index-" + el.index).show();
      }, this);
    }
    var item = this.stack[this.log.index];
    if (item.re) $(this.selector).find(".macro-ctp-entry.macro-ctp-entry-index-" + item.index).empty().wiki(item.content);
    this.stack.slice(this.log.index + 1, this.log.seen + 1).forEach(function (el) {
      $(_this3.selector).find(".macro-ctp-entry-index-" + el.index).remove();
    }, this);
    $(this.selector).find(".ctp-head").empty().wiki(CTP.item(this.head)).siblings(".ctp-tail").empty().wiki(CTP.item(this.tail));
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
      $(this.output).wiki(ctp.out()).find(".macro-ctp-wrapper").attr("data-ctp", Util.escape(_id)).find(".ctp-head").wiki(CTP.item(ctp.head)).parent().find(".ctp-tail").wiki(CTP.item(ctp.tail));
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
