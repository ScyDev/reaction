
Template.marketplaceUserDropdown.replaces("userDropdown");

Template.loginDropdown.events({
  "click #logout": function (event, template) {
    event.preventDefault();

    template.$(".dropdown-toggle").dropdown("toggle");
    $("#userDropdownSpinnerContainer").show();

    return event.stopPropagation();
  }
});
