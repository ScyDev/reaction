/* ================================================================================= */
/* Global helpers */

Template.registerHelper("Session", name => Session.get(name));
Template.registerHelper("TemplateContext", varName => {
  const r = Template.instance()[varName];
  return typeof r !== "undefined" && r !== null && r.constructor.name === "ReactiveVar" ? r.get() : r;
});

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

/* Localized month names  - not needed as moment.months() */
Meteor.startup(() => Tracker.autorun(() => {
    const lng = Session.get("language");
    ReactionCore.Locale.language = lng;
    moment.locale(ReactionCore.Locale.language);
}));
// Template.wrapGlobalHelper("monthOptions", results => {
//   results.forEach(o => o.label = i18next.t("app.month" + o.label, o.label))
//   return results;
// });

/**
 * dateFormat
 * @description
 * format an ISO date using Moment.js
 * http://momentjs.com/
 * moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
 * @example {{dateFormat creation_date format="MMMM YYYY"}}
 * @param {String} context - moment context
 * @param {String} block - hash of moment options, ie: format=""
 * @return {Date} return formatted date
 */
Template.registerHelper("dateFormat", function (context, block) {
  let f;
  if (window.moment) {
    f = block.hash.format || "MMM DD, YYYY HH:mm:ss A";
    return moment(context).format(f);
  }
  return context;
});
