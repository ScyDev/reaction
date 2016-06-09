/*
Template.productDetailDateField.inheritsHelpersFrom(["productDetail", "productDetailEdit"]);
Template.productDetailDateField.inheritsEventsFrom(["productDetail", "productDetailEdit"]);
Template.productDetailDateField.inheritsHooksFrom(["productDetail", "productDetailEdit"]);
*/
Template.productDetail.onRendered(
  function() {
    /*
    if ($('.product-detail-map').length === 0) { // make sure its only injected once, not on every rendered event
      Meteor.setTimeout(function() { // what the?!? document doesn't seem to be ready immediately when this event is fired...
        // inject field template here
        Blaze.renderWithData(Template.productDetailLocationField, this.data, $(".pdp-right-column")[0])
        console.log('injected location field');
      }, 100);
    }
    */
  }
);
