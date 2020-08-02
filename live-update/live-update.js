(function () {
  "use strict";

  $(document).on(':liveupdate', function (ev) {
    if (ev.sources && ev.sources.length) {
      ev.sources.forEach(function (el) {
        $('[data-bind~="' + Scripting.parse(el) + '"]').each(function () {
          var $src = $(this).data('bind').replace('src:', "").trim();
          $(this).empty().wiki(Scripting.evalJavaScript($src));
        });
      });
    } else {
      $('[data-bind^="src:"]').each(function () {
        var $src = $(this).data('bind').replace('src:', "").trim();
        $(this).empty().wiki(Scripting.evalJavaScript($src));
      });
    }
  });

  Macro.add(['update', 'upd'], {
    handler: function handler() {
      $(document).trigger({
        type: ':liveupdate',
        sources: this.args
      });
    }
  });

  Macro.add(['live', 'l', 'lh'], {
    skipArgs: true,
    handler: function handler() {
      if (this.args.full.length === 0) {
        return this.error('no expression specified');
      }
      try {
        var result = toStringOrDefault(Scripting.evalJavaScript(this.args.full), null);
        if (result !== null) {
          new Wikifier(this.output, '<span data-bind="src: ' + Util.escape(this.args.full) + '">' + (this.name === 'lh' ? Util.escape(result) : result) + "</span>");
        }
      } catch (ex) {
        return this.error("bad evaluation: " + (_typeof(ex) === 'object' ? ex.message : ex));
      }
    }
  });
})();
