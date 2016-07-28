// inherit helpers from template productDetail so we can use fieldComponent in this here template
Template.productDetailLocationField.inheritsHelpersFrom("productDetail");
Template.productDetailLocationField.inheritsEventsFrom("productDetail");
Template.productDetailLocationField.inheritsHooksFrom("productDetail");

Template.productDetailLocationField.onRendered(function() {
  Meteor.setTimeout(function() { // what the?!? document doesn't seem to be ready immediately when this event is fired...
    // always show the map on product detail
    $(".map-container").css({ opacity: 1.0 });
  }, 100);
});

Template.productDetailLocationField.helpers({
  product: () => Template.instance().data,
});
