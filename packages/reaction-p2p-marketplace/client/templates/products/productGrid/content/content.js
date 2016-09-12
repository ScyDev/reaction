Template.gridContentMarketplace.replaces("gridContent");

Template.gridContent.helpers({
  displayPrice: function () {
    return this._id && this.price && this.price.range;
  }
});
