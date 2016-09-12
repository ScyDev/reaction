const { Log } = ReactionCore;


replaceMethod("orders/sendNotification", function (order) {
  check(order, Object);
  this.unblock();
  if (order) {
    let shop = ReactionCore.Collections.Shops.findOne(order.shopId);
    let user = ReactionCore.Collections.Accounts.findOne(order.userId);
    let shipment = order.shipping[0];

    ReactionCore.configureMailUrl();
    Log.info("orders/sendNotification", order.workflow.status);
    // handle missing root shop email
    if (!shop.emails[0].address) {
      shop.emails[0].address = "no-reply@reactioncommerce.com";
      Log.warn("No shop email configured. Using no-reply to send mail");
    }
    // anonymous users without emails.
    if (!order.email) {
      Log.warn("No shop email configured. Using anonymous order.");
      return true;
    }

    ReactionCore.i18nextInitForServer(i18next);

    Log.info(`orders/sendNotification: transactionId ${order.billing[0].paymentMethod.transactionId}, userName ${user.userName}, buyer address ${order.billing[0].address}`);
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
    // Log.info("orders/sendNotification compiledItemList", compiledItemList);

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
    // Log.info("orders/sendNotification sellerSortedItemList1", sellerSortedItemList);

    const commonHtmlFields = {
      homepage: Meteor.absoluteUrl(),
      shop,
      order,
      shipment,
      transactionId: order.billing[0].paymentMethod.transactionId,
      buyerAddress: order.billing[0].address,
    };
    const from = `${shop.name} <${shop.emails[0].address}>`;
    /* TODO: (Meteor 1.3+) remove this hack and use the 'import' to load the proper ReactionEmailTemplate */
    const ReactionEmailTemplate = global.ReactionEmailTemplate

    // email templates can be customized in Templates collection
    // loads defaults from reaction-email-templates/templates
    let tpl = `orders/${order.workflow.status}`;
    Log.info("Buyer HTML template:", tpl);
    SSR.compileTemplate(tpl, ReactionEmailTemplate(tpl));
    Log.info("orders/sendNotification to buyer:", order.email);
    const html = SSR.render(tpl, {
      ...commonHtmlFields,
      items: compiledItemList,
      userName: user.userName
    })
    // Log.info("HTML to buyer", order.email, html);
    try {
      Email.send({
        to: order.email,
        from,
        subject: i18next.t('accountsUI.mails.orderUpdate.subject', {shopName: shop.name, defaultValue: `Order from ${shop.name}`}),
        html
      });
    } catch (error) {
      Log.warn(error)
      throw new Meteor.Error(403, "Unable to send order notification email to buyer.", error);
    }

    // change template to seller
    tpl = `orders/${order.workflow.status}SellerNotification`;
    Log.info("Seller HTML template:", tpl);
    SSR.compileTemplate(tpl, ReactionEmailTemplate(tpl));
    // send out order notification for each seller
    sellerSortedItemList.forEach( data => {
      Log.info("orders/sendNotification to seller:", data.items[0].account.emails[0].address);
      const html = SSR.render(tpl, {
        ...commonHtmlFields,
        items: data.items,
        userName: data.items[0].account.userName
      });
      // Log.info("HTML to seller", data.items[0].account.emails[0].address, html)
      try {
        Email.send({
          to: data.items[0].account.emails[0].address,
          from,
          subject: i18next.t('accountsUI.mails.orderUpdate.subjectSeller', {shopName: shop.name, defaultValue: `Order from ${shop.name}`}),
          html
        });
      } catch (error) {
        Log.warn(error)
        throw new Meteor.Error(403, "Unable to send order notification email to seller.", error);
      }
    })
  }
});


/* Set soldOut status on inventory adjust */
ReactionCore.MethodHooks.after("orders/inventoryAdjust", function(options) {
  const [ orderId ] = options.arguments;
  const result = options.result;

  const order = ReactionCore.Collections.Orders.findOne(orderId);
  Log.info("AFTER orders/inventoryAdjust orderId", orderId);
  if (!order) return result;

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

  return result;
});
