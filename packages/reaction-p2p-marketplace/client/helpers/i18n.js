
/**
 To translate messages from packages that do not send i18n keys
 */
ReactionCore.toI18nKey = function(text) {
  return text.replace(/[^A-Z a-z]/g,'').replace(/\s+(.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (_, c) => c.toLowerCase())
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
