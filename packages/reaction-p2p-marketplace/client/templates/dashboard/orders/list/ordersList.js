Template.dashboardOrdersListMarketplace.replaces("dashboardOrdersList");

/**
 * dashboardOrdersList helpers
 *
 */
Template.dashboardOrdersList.helpers({
  orderCreatedAt: function () {
    let context = this.createdAt;
    if (window.moment) {
      return moment(context).format("DD.MM.YYYY HH:mm");
    }
    return context;
  },
});
