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
