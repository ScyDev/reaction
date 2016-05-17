
ReactionCore.Schemas.SellerSettlement = new SimpleSchema(
  {
    sellerId: {
      type: String,
      index: 1,
      optional: true
    },
    shopId: {
      type: String,
      autoValue: ReactionCore.shopIdAutoValue,
      index: 1,
      optional: true
    },
    orders: {
      type: [ReactionCore.Schemas.Order],
      optional: true
    },
    createdAt: {
      type: Date,
      autoValue: function () {
        if (this.isUpdate && !this.isSet) {
          return new Date;
        }
        this.unset();
      },
      denyUpdate: true
    },
    ordersTotal: {
      label: "Orders total",
      type: Number,
      decimal: true,
      min: 0,
      optional: true,
      defaultValue: 0
    },
    snaxterFee: {
      label: "Our fee",
      type: Number,
      decimal: true,
      min: 0,
      optional: true,
      defaultValue: 0
    },
    sellersEarnings: {
      label: "Sellers earnings",
      type: Number,
      decimal: true,
      min: 0,
      optional: true,
      defaultValue: 0
    }
  }
);
