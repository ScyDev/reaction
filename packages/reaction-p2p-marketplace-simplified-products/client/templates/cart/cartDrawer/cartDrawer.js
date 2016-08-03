Template.newOpenCartDrawer.replaces("openCartDrawer");

/* Disable cartSwiper */
Meteor.startup(() => {
  Template.cartDrawerItems._callbacks.rendered.splice(0, Template.cartDrawerItems._callbacks.rendered.length);
});
