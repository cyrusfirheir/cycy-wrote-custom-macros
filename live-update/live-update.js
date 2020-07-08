(function() {
  "use strict";

  $(document).on(':liveupdate', function (ev) {
    $('[data-bind^="src:"]').each(function (index) {
      var $src = $(this).data('bind').replace('src:', "").trim();
      var $val = $('<div></div>').wiki(Scripting.evalJavaScript($src)).html();
      if ($(this).html() !== $val) $(this).empty().wiki($val);
    });
  });

  Macro.add(['update', 'upd'], {
    skipArgs: true,
    handler: function handler() {
      $(document).trigger(':liveupdate');
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
