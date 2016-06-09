
//Template.productDetailWithDate.replaces("productDetail"); // not even necessary to act on the event below

// Template.productDetail.onCreated(
//   function() {
//     /*
//     Meteor.setTimeout(function() { // what the?!? document doesn't seem to be ready immediately when this event is fired...

//       if ($('#forSaleOnDate').length === 0) { // make sure its only injected once, not on every rendered event. should be obsolete with onCreated.
//         // inject date field template here
//         console.log('injecting date field into: '+$(".pdp-right-column")[0]);
//         Blaze.renderWithData(Template.productDetailDateField, this.data, $(".pdp-right-column")[0])
//         console.log('injected date field');
//       }
//     }, 100);
//     */
//   }
// );
