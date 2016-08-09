/**
 * productImageGallery helpers
 */

const Media = ReactionCore.Collections.Media;

/**
 * uploadHandler method
 */
function uploadHandler(event) {
  let template = Template.instance();

  const userId = Meteor.userId();
  if (template.data.profileViewUser._id == userId) {
    let shopId = ReactionCore.getShopId();
    let count = Media.find({
      "metadata.userId": userId
    }).count();
    // TODO: we need to mark the first variant images somehow for productGrid.
    // But how do we know that this is the first, not second or other variant?
    // Question is open. For now if product has more than 1 top variant, everyone
    // will have a chance to be displayed
    const toGrid = 1;

    return FS.Utility.eachFile(event, function (file) {
      const fileObj = new FS.File(file);
      fileObj.metadata = {
        ownerId: userId,
        userId: userId,
        shopId: shopId,
        priority: count,
        toGrid: +toGrid // we need number
      };
      try { Media.insert(fileObj); }
      catch(error) {
        console.log("error:", error);
        if (error.reason == "imageTooBig") Alerts.alert({
            title: i18next.t("accountsUI.error.imageTooBig", "Image too big"),
            text: i18next.t("accountsUI.error.imageTooBigText", {defaultValue: "Please try a smaller image", maxKb: error.details.maxKb}),
            type: "error",
        });
      }
      return count++;
    });
  }
}

/**
 * updateImagePriorities method
 */
function updateImagePriorities() {
  const sortedMedias = _.map($(".gallery").sortable("toArray", {
    attribute: "data-index"
  }), function (index) {
    return {
      mediaId: index
    };
  });

  const results = [];
  for (let image of sortedMedias) {
    results.push(Media.update(image.mediaId, {
      $set: {
        "metadata.priority": _.indexOf(sortedMedias, image)
      }
    }));
  }
  return results;
}


Template.profileImageGallery.onCreated(function () {
  const userId = this.data.userId || Meteor.userId(); // something strange by the way we pass the userId from template
  this.data.userId = userId;
  // console.log( "Template.profileImageGallery.onCreated |", this.data.userId)

  ReactionCore.Subscriptions.ProfileUser = ReactionSubscriptions.subscribe("ProfileUser", userId);

  this.autorun(() => {
    if (!ReactionCore.Subscriptions.ProfileUser.ready()) return;
    const profileUser = Meteor.users.findOne({_id: userId});
    // console.log("Template.profileImageGallery.onCreated | userId:", userId, "profileUser:", profileUser);
    this.data.profileViewUser = profileUser;
  });
});

/**
 *  Product Image Gallery
 */

Template.profileImageGallery.helpers({
  media: function () {
    const template = Template.instance();
    const userId = template.data.userId;
    let mediaArray = [];
    if (ReactionCore.Subscriptions.ProfileUser.ready()) {
      if (userId) {
        mediaArray = Media.find({
          "metadata.userId": userId
        }, {
          sort: {
            "metadata.priority": 1
          }
        });
      }
      return mediaArray;
    }
  },
  profile: function () {
    let template = Template.instance();
    if (ReactionCore.Subscriptions.ProfileUser.ready()) {
      return template.data.profileViewUser.profile;
    }
  },
});

Template.registerHelper( "dropFileToUploadText", () => {
  const size = Math.trunc(ReactionCore.Collections.Media.options.filter.maxSize / 1024);
  return i18next.t("productDetail.dropFile", { size, defaultValue: "Drop file to upload" }) + ` (max ${size}KB)`;
})

const isMyProfile = () => {
  const instance = Template.instance().view.parentView.parentView.parentView.templateInstance
  return instance && ReactionCore.Subscriptions.ProfileUser.ready()
                  && instance().data.profileViewUser._id == Meteor.userId() ? true : false;
}
Template.profileImageDetail.helpers({ isMyProfile });
Template.profileImageUploader.helpers({ isMyProfile });

Template.profileImageGallery.onRendered(function () {
  return this.autorun(function () {
    let $gallery;
    $gallery = $(".gallery");
    return $gallery.sortable({
      cursor: "move",
      opacity: 0.3,
      placeholder: "sortable",
      forcePlaceholderSize: true,
      update: function () {
        let profile = Meteor.user().profile;
        profile.medias = [];
        return updateImagePriorities();
      },
      start: function (event, ui) {
        ui.placeholder.html("Drop image to reorder");
        ui.placeholder.css("padding-top", "30px");
        ui.placeholder.css("border", "1px dashed #ccc");
        return ui.placeholder.css("border-radius", "6px");
      }
    });
  });
});

/**
 * productImageGallery events
 */

Template.profileImageGallery.events({
  "click .gallery > li": function (event) {
    event.stopImmediatePropagation();
    let first = $(".gallery li:nth-child(1)");
    let target = $(event.currentTarget);
    if ($(target).data("index") !== first.data("index")) {
      return $(".gallery li:nth-child(1)").fadeOut(400, function () {
        $(this).replaceWith(target);
        first.css({
          display: "inline-block"
        }).appendTo($(".gallery"));
        return $(".gallery li:last-child").fadeIn(100);
      });
    }
  },
  "click .remove-image": function () {
    let template = Template.instance();

    if (template.data.profileViewUser._id == Meteor.userId()) {
      this.remove();
      updateImagePriorities();
    }
  },
  "dropped #galleryDropPane": uploadHandler
});

/**
 * imageUploader events
 */

Template.profileImageUploader.events({
  "click #btn-upload": function () {
    return $("#files").click();
  },
  "change #files": uploadHandler,
  "dropped #dropzone": uploadHandler
});

/**
 * productImageGallery events
 */

Template.profileImageGallery.events({
  "click #img-upload": function () {
    return $("#files").click();
  },
  "load .img-responsive": function (event, template) {
    return Session.set("variantImgSrc", template.$(".img-responsive").attr(
      "src"));
  }
});
