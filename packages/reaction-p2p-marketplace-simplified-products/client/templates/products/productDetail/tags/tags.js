
Template.productTagDropdownInputForm.inheritsHelpersFrom(["productTagInputForm"]);
Template.productTagDropdownInputForm.inheritsEventsFrom(["productTagInputForm"]);
Template.productTagDropdownInputForm.inheritsHooksFrom(["productTagInputForm"]);

Template.productTagDropdownInputForm.replaces("productTagInputForm");

Template.productTagDropdownInputForm.helpers({
  tags: function () {
    const instance = this;
    return instance.tags;
  },
  currentHashTag: function () {
    let product = ReactionProduct.selectedProduct();
    if (product) {
      if (product.handle) {
        if (this.handle === product.handle.toLowerCase() || getSlug(product.handle) === this.slug) {
          return true;
        }
      }
    }
  },
  hashtagMark: function () {
    const product = ReactionProduct.selectedProduct();
    if (product) {
      if (product.handle) {
        if (this.handle === product.handle.toLowerCase() || getSlug(product.handle) === this.slug) {
          return "fa-bookmark";
        }
      }
      return "fa-bookmark-o";
    }
  },
  availableTags: function () {
    const instance = Template.instance();
    let tags = [];

    tags = ReactionCore.Collections.Tags.find({
      isTopLevel: true
    }, {
      sort: {
        position: 1
      }
    }).fetch();

    console.log("availableTags: %o", tags);

    return tags;
  }
});

/* ### !!! helpers MUST be set on originaL templates name !!! ### */
Template.productTagInputForm.events({
  "click .tag-input-hashtag": function () {
    /*
    return Meteor.call("products/setHandleTag", ReactionProduct.selectedProductId(), this._id,
      function (error, result) {
        if (result) {
          return ReactionRouter.go("product", {
            handle: result
          });
        }
      });
      */
  },
  "click .tag-input-group-remove": function () {
    return Meteor.call("products/removeProductTag", ReactionProduct.selectedProductId(),
      this._id);
  },
  "click .tags-input-dropdown-select": function (event) {
    let autocomplete = $(event.currentTarget).autocomplete({
      delay: 0,
      autoFocus: true,
      minLength: 0,
      source: function (request, response) {
        let datums = [];
        let slug = getSlug(request.term);
        ReactionCore.Collections.Tags.find({
          slug: new RegExp(".", "i")
        }).forEach(function (tag) {
          return datums.push({
            label: tag.name
          });
        });
        return response(datums);
      }
    });

    // act like a drop down
    $(event.currentTarget).autocomplete( "search", "" );

    return autocomplete;
  },
  "focusout .tags-input-dropdown-select": function (event, template) {
    let val = $(event.currentTarget).val();
    if (val) {
      return Meteor.call("products/updateProductTags", ReactionProduct.selectedProductId(),
        val, this._id,
        function (error) {
          template.$(".tags-submit-new").val("").focus();
          if (error) {
            Alerts.toast(i18next.t("productDetail.tagExists", "Tag already exists, or is empty."), "error");
            return false;
          }
        });
    }
  },
  "mousedown .tag-input-group-handle": function (event, template) {
    return template.$(".tag-edit-list").sortable("refresh");
  }
});

Template.productTagInputForm.onRendered(function () {
  return $(".tag-edit-list").sortable({
    items: "> li",
    handle: ".tag-input-group-handle",
    update: function () {
      let hashtagsList = [];
      let uiPositions = $(this).sortable("toArray", {
        attribute: "data-tag-id"
      });
      for (let tag of uiPositions) {
        if (_.isEmpty(tag) === false) {
          hashtagsList.push(tag);
        }
      }
      return Meteor.call("products/updateProductField",
        ReactionProduct.selectedProductId(), "hashtags", _.uniq(hashtagsList));
    }
  });
});
