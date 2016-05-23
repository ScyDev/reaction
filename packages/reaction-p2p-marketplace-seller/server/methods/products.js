
/**
 * @function belongsToCurrentUser
 * @description checks if product belongs to current user
 * @param {String} existing product _id
 * @return {Boolean}
 */
function belongsToCurrentUser(productId) {
  if (_.isArray(productId) === true) {
    productId = productId[0];
  }

  let productBelongingToCurrUser = ReactionCore.Collections.Products.findOne({_id:productId, userId:Meteor.userId()})
  ReactionCore.Log.info("Product ",productId," belongs to ",Meteor.userId(),"?");
  //ReactionCore.Log.info("productBelongingToCurrUser ",productBelongingToCurrUser);

  return ((productBelongingToCurrUser != null) || ReactionCore.hasAdminAccess());
}

/**
 * @function setProductInvisibleAndInactive
 * @description set the product insvisible and inactive
 * @param {String} existing product _id
 * @return {Boolean}
 */
function setProductInvisibleAndInactive(productId) {
  let updateProduct = Boolean(ReactionCore.Collections.Products.update(productId,
    {
      $set: {
        isActive: false,
        isVisible: false
      }
    },
    {selector: {type: "simple"}}
  ));
  ReactionCore.Log.info("Product " + productId + " set isActive & isVisible to : false");
  return updateProduct;
}

Meteor.methods({
  "products/belongsToCurrentUser": function (productId) {
    check(productId, Match.OneOf(Array, String));

    return belongsToCurrentUser(productId);
  },
  /**
   * products/activateProduct
   * @summary owner controlled sctivation of product
   * @param {String} productId - productId
   * @return {String} return
   */
  "products/activateProduct": function (productId) {
    check(productId, String);
    if (!belongsToCurrentUser(productId)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    if (!ReactionCore.hasAdminAccess()) {
      let account =  ReactionCore.Collections.Accounts.findOne({userId: Meteor.userId()});
      if (account.profile.addressBook.length <= 0) {
        ReactionCore.Log.info("No address. throw error!");
        throw new Meteor.Error(403, "error.noProfileAddress");
        //errorMsg += "Profile address required.";
        //template.$(".title-edit-input").focus();
      }
    }

    const product = ReactionCore.Collections.Products.findOne(productId);
    const variants = ReactionCore.Collections.Products.find({
      ancestors: { $in: [productId] }
    }).fetch();
    let variantValidator = true;

    if (typeof product === "object" && product.title.length > 1) {
      if (variants.length > 0) {
        variants.map(variant => {
          if (!(typeof variant.price === "number" && variant.price > 0 &&
            typeof variant.title === "string" && variant.title.length > 1)) {
            variantValidator = false;
          }
          if (typeof optionTitle === "string" && !(optionTitle.length > 0)) {
            variantValidator = false;
          }
        });
      } else {
        ReactionCore.Log.debug("invalid product active state ", productId);
        throw new Meteor.Error(403, "Forbidden", "Variant is required");
      }

      if (!variantValidator) {
        ReactionCore.Log.debug("invalid product active state ", productId);
        throw new Meteor.Error(403, "Forbidden",
          "Some properties are missing.");
      }

      // update product visibility
      ReactionCore.Log.info("toggle product active state ", product._id, !
        product.isActive);

      let sendMail = !product.isActive;

      let updateResult = Boolean(ReactionCore.Collections.Products.update(product._id, {
        $set: {
          isActive: !product.isActive
        }
      }, { selector: { type: "simple" } }));

      if (sendMail) {
        Meteor.call("products/sendProductReviewEmail", ReactionCore.getCurrentShop()._id, Meteor.userId(), productId);
      }

      return updateResult;
    }
    ReactionCore.Log.debug("invalid product active state ", productId);
    throw new Meteor.Error(400, "Bad Request");
  },
  /**
   * accounts/sendProductReviewEmail
   * send an email to the administrator for product review/make visible
   * @param {String} shopId - shopId of new User
   * @param {String} userId - new userId to welcome
   * @param {String} productId - productId to be reviewed
   * @returns {Boolean} returns boolean
   */
  "products/sendProductReviewEmail": function (shopId, userId, productId) {
    check(shopId, String);
    check(userId, String);
    check(productId, String);
    this.unblock();
    const user = ReactionCore.Collections.Accounts.findOne(userId);
    const shop = ReactionCore.Collections.Shops.findOne(shopId);
    //const product = ReactionCore.Collections.Products.findOne(productId);
    let adminEmail = process.env.REACTION_EMAIL;
    ReactionCore.Log.info(`Wanna send product review mail to: `,adminEmail);

    if (!adminEmail || !adminEmail.length > 0) {
      return true;
    }

    // configure email
    ReactionCore.configureMailUrl();
    // don't send account emails unless email server configured
    if (!process.env.MAIL_URL) {
      ReactionCore.Log.info(`Mail not configured: suppressing welcome email output`);
      return true;
    }

    ReactionCore.i18nextInitForServer(i18next);
    ReactionCore.Log.info("sendProductReviewEmail: i18n server test:", i18next.t('accountsUI.mails.productReview.subject'));

    // fetch and send templates
    SSR.compileTemplate("products/reviewProduct", ReactionEmailTemplate("products/reviewProduct"));
    try {
      return Email.send({
        to: adminEmail,
        from: `${shop.name} <${adminEmail}>`,
        subject: i18next.t('accountsUI.mails.productReview.subject', {userName: Meteor.user().profile.name, defaultValue: `New product to be reviewed from {userName}`}),
        html: SSR.render("products/reviewProduct", {
          homepage: Meteor.absoluteUrl(),
          shop: shop,
          user: Meteor.user(),
          productId: productId,
          userEmail: Meteor.user().emails[0].address
        })
      });
    } catch (e) {
      ReactionCore.Log.warn("Unable to send email, check configuration and port.", e);
    }
  },
  "products/checkIfExpired": function (productId) {
    check(productId, String);

    var product = ReactionCore.Collections.Products.findOne({_id: productId});
    //ReactionCore.Log.info("is",moment(product.latestOrderDate).utcOffset('+0000')," < ",moment().utcOffset('+0200'),"?");
    if (product && product.soldOne && moment(product.latestOrderDate).utcOffset('+0000').isBefore(moment().utcOffset('+0200'))) {
      ReactionCore.Log.info("Method products/checkIfExpired() product expired: ",productId);
      ReactionCore.Collections.Products.update(productId,
        {
          $set: {
            soldOne: false
          }
        },
        { selector: { type: "simple" } }
      );
    }
    else {
      ReactionCore.Log.info("Method products/checkIfExpired() product not yet expired: ",productId," ",product.latestOrderDate);
    }
  },
});

/**
 * Add userId to new products
 */
ReactionCore.MethodHooks.after('products/createProduct', function(options) {
  ReactionCore.Log.info("ReactionCore.MethodHooks.after('products/createProduct') options: ", options);

  var productId = options.result;
  let product = ReactionCore.Collections.Products.findOne({_id: productId});
  ReactionCore.Log.info("setting userId on prod: %o", product);
  //product.userId = Meteor.userId();

  const type = product.type;
  const result = ReactionCore.Collections.Products.update(productId, {
    $set: {userId: Meteor.userId()}
  }, { selector: { type: type } });

  // To be safe, return the options.result in an after hook.
  return options.result;
});

ReactionCore.MethodHooks.before('products/cloneVariant', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/cloneVariant') options: ", options);
  var productId = options.arguments[0];
  var variantId = options.arguments[1];

  if (!belongsToCurrentUser(productId)) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/cloneVariant') Access Denied!");
    throw new Meteor.Error(403, "Access Denied");
  }
});

ReactionCore.MethodHooks.before('products/createVariant', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/createVariant') options: ", options);
  var productId = options.arguments[0];
  var variantId = options.arguments[1];

  if (!belongsToCurrentUser(productId)) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/createVariant') Access Denied!");
    throw new Meteor.Error(403, "Access Denied");
  }
  else {
    ReactionCore.Log.info("creating Variant");
  }
});

ReactionCore.MethodHooks.before('products/deleteProduct', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/deleteProduct') options: ", options);
  var productId = options.arguments[0];

  if (!belongsToCurrentUser(productId)) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/deleteProduct') Access Denied!");
    throw new Meteor.Error(403, "Access Denied");
  }

  var product = ReactionCore.Collections.Products.findOne({_id: productId});
  if (product.soldOne) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateProductField') Product was sold. Deny changes!");
    throw new Meteor.Error(403, "Can't change ordered product");
  }
});

ReactionCore.MethodHooks.before('products/updateProductField', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateProductField') options: ", options);
  var productId = options.arguments[0];

  if (!belongsToCurrentUser(productId)) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateProductField') Access Denied!");
    throw new Meteor.Error(403, "Access Denied");
  }

  var product = ReactionCore.Collections.Products.findOne({_id: productId});
  if (product.soldOne) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateProductField') Product was sold. Deny changes!");
    throw new Meteor.Error(403, "Can't change ordered product");
  }

/*
  unfortunately, this gives error:  Exception while invoking method 'products/updateProductField' Error: Did not check() all arguments during call to 'products/updateProductField'
  moving this to core for the time being.

  // translate date to US format for saving
  if (options.arguments.length >= 3) {
    if (options.arguments[1] == "forSaleOnDate") {
      //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateProductField') from:",options.arguments[2]);

      // this seems to provoke: Exception while invoking method 'products/updateProductField' Error: Did not check() all arguments during call to 'products/updateProductField'
      // but the value is still saved...
      options.arguments[2] = moment(options.arguments[2], "DD.MM.YYYY").format('MM/DD/YYYY');

      //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateProductField') to:",options.arguments[2]);
    }
    if (options.arguments[1] == "latestOrderDate") {
      // this seems to provoke: Exception while invoking method 'products/updateProductField' Error: Did not check() all arguments during call to 'products/updateProductField'
      // but the value is still saved...
      options.arguments[2] = moment(options.arguments[2], "DD.MM.YYYY HH:mm").format('MM/DD/YYYY HH:mm');
    }
  }
  check(options.arguments[0], String);
  check(options.arguments[1], String);
  check(options.arguments[2], Match.OneOf(String, Object, Array, Boolean, Date));
*/
});

ReactionCore.MethodHooks.before('products/updateVariant', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateVariant') options: ", options);
  var variant = options.arguments[0];
  var fullVariant = ReactionCore.Collections.Products.findOne({_id: variant._id});
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateVariant') fullVariant: ", fullVariant);

  var product = ReactionCore.Collections.Products.findOne({_id: {$in:fullVariant.ancestors} });
  if (product.soldOne) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateVariant') Product was sold. Deny changes!");
    throw new Meteor.Error(403, "Can't change ordered product");
  }
});

ReactionCore.MethodHooks.after('products/updateProductField', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.after('products/updateProductField') options: ", options);
  var productId = options.arguments[0];
  var productField = options.arguments[1];

  const product = ReactionCore.Collections.Products.findOne(productId);
  const variants = ReactionCore.Collections.Products.find({
    ancestors: { $in: [productId] }
  }).fetch();
  let variantValidator = true;

  if (typeof product === "object" && product.title.length > 1) {
    for (let variant of variants) {
      ReactionCore.Collections.Products.update(variant._id,
        {$set: {title: product.title}},
        {selector: {type: "variant"}}
      );
      ReactionCore.Log.info("ReactionCore.MethodHooks.after('products/updateProductField') set variant title to :", product.title);
    }
  }

  if (productField == "title" || productField == "description") {
    setProductInvisibleAndInactive(productId);
  }

  // To be safe, return the options.result in an after hook.
  return options.result;
});

ReactionCore.MethodHooks.after('products/updateVariant', function(options) {
  ReactionCore.Log.info("ReactionCore.MethodHooks.after('products/updateVariant') options: ", options);
  var variant = options.arguments[0];

  let fullVariant = ReactionCore.Collections.Products.findOne({_id: variant._id});
  ReactionCore.Log.info("ReactionCore.MethodHooks.after('products/updateVariant') fullVariant: ", fullVariant);

  // copy variant quantity to product for easy display
  ReactionCore.Collections.Products.update({
    _id: fullVariant.ancestors[0]
  }, {
    $set: {
      copiedInventoryQuantity: variant.inventoryQuantity
    }
  }, { selector: { type: "simple" } });

  // To be safe, return the options.result in an after hook.
  return options.result;
});

ReactionCore.MethodHooks.before('products/updateProductTags', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateProductTags') options: ", options);
  var productId = options.arguments[0];

  if (!belongsToCurrentUser(productId)) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateProductTags') Access Denied!");
    throw new Meteor.Error(403, "Access Denied");
  }

  var product = ReactionCore.Collections.Products.findOne({_id: productId});
  if (product.soldOne) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateProductTags') Product was sold. Deny changes!");
    throw new Meteor.Error(403, "Can't change ordered product");
  }
});

ReactionCore.MethodHooks.before('products/removeProductTag', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/removeProductTag') options: ", options);
  var productId = options.arguments[0];

  if (!belongsToCurrentUser(productId)) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/removeProductTag') Access Denied!");
    throw new Meteor.Error(403, "Access Denied");
  }

  var product = ReactionCore.Collections.Products.findOne({_id: productId});
  if (product.soldOne) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateProductTags') Product was sold. Deny changes!");
    throw new Meteor.Error(403, "Can't change ordered product");
  }
});

ReactionCore.MethodHooks.before('products/setHandle', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/setHandle') options: ", options);
  var productId = options.arguments[0];

  if (!belongsToCurrentUser(productId)) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/setHandle') Access Denied!");
    throw new Meteor.Error(403, "Access Denied");
  }
});

ReactionCore.MethodHooks.before('products/setHandleTag', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/setHandleTag') options: ", options);
  var productId = options.arguments[0];

  if (!belongsToCurrentUser(productId)) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/setHandleTag') Access Denied!");
    throw new Meteor.Error(403, "Access Denied");
  }
});

ReactionCore.MethodHooks.before('products/updateProductPosition', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateProductPosition') options: ", options);
  var productId = options.arguments[0];

  if (!belongsToCurrentUser(productId)) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateProductPosition') Access Denied!");
    throw new Meteor.Error(403, "Access Denied");
  }
});

ReactionCore.MethodHooks.before('products/updateMetaFields', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateMetaFields') options: ", options);
  var productId = options.arguments[0];

  if (!belongsToCurrentUser(productId)) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/updateMetaFields') Access Denied!");
    throw new Meteor.Error(403, "Access Denied");
  }
});

ReactionCore.MethodHooks.before('products/publishProduct', function(options) {
  //ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/publishProduct') options: ", options);
  var productId = options.arguments[0];

  if (!ReactionCore.hasAdminAccess()) {
    ReactionCore.Log.info("ReactionCore.MethodHooks.before('products/publishProduct') Access Denied!");
    throw new Meteor.Error(403, "Access Denied");
  }
});

ReactionCore.Collections.Media.on('uploaded', function (fileObj) {
  //ReactionCore.Log.info("ReactionCore.Collections.Media.on('uploaded') fileObj: ", fileObj);
  var productId = fileObj.metadata.productId;

  var product = ReactionCore.Collections.Products.findOne({_id: productId });
  if (product != null && product.soldOne) {
    ReactionCore.Log.info("ReactionCore.Collections.Media.on('uploaded') Product was sold. Deny changes!");
    //throw new Meteor.Error(403, "Can't change ordered product");

    ReactionCore.Collections.Media.remove({
      _id: fileObj._id
    });
  }

  if(productId != undefined) {
    setProductInvisibleAndInactive(productId);
  }
});
