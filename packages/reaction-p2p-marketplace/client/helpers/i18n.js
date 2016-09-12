
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

/**
 To translate messages from packages that do not send i18n keys
 */
ReactionCore.toI18nKey = function(text) {
  return camelize(text.replace(/[0-9]/g,'').replace(/\./g,'').replace(",", "").replace("'", "").replace("\"", "").replace("!", "").replace("?", "").replace("(", "").replace(")", ""));
}


Meteor.startup(() => {
  /* Set default session language to DE */
  /* It is possible to use persistent sessions to keep the chosen setting */
  Session.setDefault("langForcedToDE", false);
  if (!Session.get("langForcedToDE")) {
    Session.set("langForcedToDE", true);
    Session.set("language", "de");
  }
})


const _toast = Alerts.toast;
Alerts.toast = (message, type, options) => _toast(i18next.t(message), type, options);
