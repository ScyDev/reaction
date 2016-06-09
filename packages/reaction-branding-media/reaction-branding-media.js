// Write your package code here!

Template.newLayoutHeader.events({
  "click #img-upload": function () {
    return $("#files").click();
  },
  "load .img-responsive": function (event, template) {
    return Session.set("variantImgSrc", template.$(".img-responsive").attr(
      "src"));
  },
  
  "change #files": uploadHandler,
  "dropped #dropzone": uploadHandler
  
});

Template.newLayoutHeader.inheritsEventsFrom("layoutHeader");
Template.newLayoutHeader.inheritsHooksFrom("layoutHeader");
Template.newLayoutHeader.inheritsHelpersFrom("layoutHeader");
Template.newLayoutHeader.replaces("layoutHeader");
