const { Log } = ReactionCore;


/* Replace method preserving the hooks */
const replaceMethod = (methodName, f) => {
  // Meteor.isClient ? Meteor.connection._methodHandlers : Meteor.server.method_handlers;
  const hooks = ReactionCore.MethodHooks;
  const methodHandlers = hooks._originalMethodHandlers[methodName] ? hooks._originalMethodHandlers : hooks._handlers;
  methodHandlers[methodName] = f;
}


replaceMethod("orders/sendNotification", function (order) {
  check(order, Object);
  this.unblock();
  if (order) {
    let shop = ReactionCore.Collections.Shops.findOne(order.shopId);
    let user = ReactionCore.Collections.Accounts.findOne(order.userId);
    let shipment = order.shipping[0];

    ReactionCore.configureMailUrl();
    ReactionCore.Log.info("orders/sendNotification", order.workflow.status);
    // handle missing root shop email
    if (!shop.emails[0].address) {
      shop.emails[0].address = "no-reply@reactioncommerce.com";
      ReactionCore.Log.warn("No shop email configured. Using no-reply to send mail");
    }
    // anonymous users without emails.
    if (!order.email) {
      ReactionCore.Log.warn("No shop email configured. Using anonymous order.");
      return true;
    }
    // email templates can be customized in Templates collection
    // loads defaults from reaction-email-templates/templates
    let tpl = `orders/${order.workflow.status}`;

    ReactionCore.i18nextInitForServer(i18next);

    ReactionCore.Log.info(`orders/sendNotification: transactionId ${order.billing[0].paymentMethod.transactionId}, userName ${user.userName}, buyer address ${order.billing[0].address}`);
    const compiledItemList = order.items.map(item => {
      const product = ReactionCore.Collections.Products.findOne(item.productId);
      const account = ReactionCore.Collections.Accounts.findOne(product.userId);
      return {
        product,
        account,
        address: account.profile.addressBook[0],
        forSaleOnDate: moment(product.forSaleOnDate).format("DD.MM.YYYY"),
      };
    })

    /* Group items by sellerId (product.userId) */
    const sellerSortedItemList = [];
    compiledItemList.forEach(item => {
      let isNewSeller = true;
      sellerSortedItemList.forEach(sortedItem => {
        if (item.product.userId == sortedItem.sellerId) {
          sortedItem.items.push(item);
          isNewSeller = false;
        }
      });
      if (isNewSeller) sellerSortedItemList.push({
        sellerId: item.product.userId,
        items: [item],
      });
    });
    //ReactionCore.Log.info("orders/sendNotification sellerSortedItemList1", sellerSortedItemList);

    // ReactionCore.Log.info("orders/sendNotification to buyer:", order.email);
    SSR.compileTemplate(tpl, ReactionEmailTemplate(tpl));
    try {
      Email.send({
        to: order.email,
        from: `${shop.name} <${shop.emails[0].address}>`,
        subject: i18next.t('accountsUI.mails.orderUpdate.subject', {shopName: shop.name, defaultValue: `Order from ${shop.name}`}),
        html: SSR.render(tpl, {
          homepage: Meteor.absoluteUrl(),
          shop: shop,
          order: order,
          shipment: shipment,
          items: compiledItemList,
          transactionId: order.billing[0].paymentMethod.transactionId,
          buyerAddress: order.billing[0].address,
          userName: user.userName
        })
      });
    } catch (error) {
      throw new Meteor.Error(403, "Unable to send order notification email to buyer.", error);
    }

    // change template to seller
    tpl = `orders/${order.workflow.status}SellerNotification`;

    // send out order notification for each seller
    for (index = 0; index < sellerSortedItemList.length; ++index) {
      ReactionCore.Log.info("orders/sendNotification to seller:", sellerSortedItemList[index].items[0].account.emails[0].address);
      SSR.compileTemplate(tpl, ReactionEmailTemplate(tpl));
      try {
        Email.send({
          to: sellerSortedItemList[index].items[0].account.emails[0].address,
          from: `${shop.name} <${shop.emails[0].address}>`,
          subject: i18next.t('accountsUI.mails.orderUpdate.subjectSeller', {shopName: shop.name, defaultValue: `Order from ${shop.name}`}),
          html: SSR.render(tpl, {
            homepage: Meteor.absoluteUrl(),
            shop: shop,
            order: order,
            shipment: shipment,
            items: sellerSortedItemList[index].items,
            transactionId: order.billing[0].paymentMethod.transactionId,
            buyerAddress: order.billing[0].address,
            userName: sellerSortedItemList[index].items[0].account.userName
          })
        });
      } catch (error) {
        throw new Meteor.Error(403, "Unable to send order notification email to seller.", error);
      }
    }
  }
});


/* Set soldOut status on inventory adjust */
ReactionCore.MethodHooks.after("orders/inventoryAdjust", function(options) {
  const [ orderId ] = options.arguments;
  const order = ReactionCore.Collections.Orders.findOne(orderId);
  Log.info("AFTER orders/inventoryAdjust orderId", orderId);
  if (!order) return;

  order.items.forEach(item => {
    Log.info("AFTER orders/inventoryAdjust item.variants._id", item.variants._id, "by", -item.quantity, "item.inventoryQuantity", item.variants.inventoryQuantity);
    let currVariant = ReactionCore.Collections.Products.findOne({ _id: item.variants._id, type: "variant" });
    if (currVariant) {
      ReactionCore.Collections.Products.update(item.productId, {
        $set: {
          isSoldOut: currVariant.inventoryQuantity < 1,
          copiedInventoryQuantity: currVariant.inventoryQuantity,
          soldOne: true,
        }
      }, { selector: { type: "simple" } });
    }
  });
});
