Template.orderDetailMarketplace.replaces("orderDetail");

Template.orderDetail.helpers({
  transactionId: function () {
    return this.billing[0].paymentMethod.transactionId;
  }
});
