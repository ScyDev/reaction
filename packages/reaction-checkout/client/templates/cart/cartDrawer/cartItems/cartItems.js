/**
 * Add swiper to cartDrawerItems
 *
 */
Template.cartDrawerItems.onRendered(function () {
  return $(function () {
      var cartSwiper = $(".cart-drawer-swiper-container").swiper({
      autoplayStopOnLast : true,
      autoplay: 2000,
      mode: "horizontal",
      loop: true,
      setWrapperSize: true,
      grabCursor: true,
      slidesPerView: 4,
      wrapperClass: "cart-drawer-swiper-wrapper",
      slideClass: "cart-drawer-swiper-slide",
      slideActiveClass: "cart-drawer-swiper-slide-active",
      pagination: ".cart-drawer-pagination",
      paginationClickable: true,
      watchSlidesVisibility: true
    });
    console.log("cartSwiper: ", cartSwiper);
    cartSwiper.startAutoplay();
  //  cartSwiper.onAutoplayStart: function(){
    //  console.log("Startet");
    //};
  });
  return true;
});

/**
 * cartDrawerItems helpers
 *
 * @provides media
 * @returns default product image
 */
Template.cartDrawerItems.helpers({
  product: function () {
    return ReactionCore.Collections.Products.findOne(this.productId);
  },
  media: function () {
    let product = ReactionCore.Collections.Products.findOne(this.productId);
    let defaultImage = ReactionCore.Collections.Media.findOne({
      "metadata.variantId": this.variants._id
    });

    if (defaultImage) {
      return defaultImage;
    } else if (product) {
      _.any(product.variants, function (variant) {
        defaultImage = ReactionCore.Collections.Media.findOne({
          "metadata.variantId": variant._id
        });
        return !!defaultImage;
      });
    }
    return defaultImage;
  }
});
