
Template.loginFormSignUpSellerFlag.inheritsHelpersFrom(["loginFormSignUpView"]); // necessary or else helpers are missing
//Template.loginFormSignUpSellerFlag.inheritsEventsFrom(["loginFormSignUpView"]);
Template.loginFormSignUpSellerFlag.inheritsHooksFrom(["loginFormSignUpView"]); // necessary or else events don't work right

Template.loginFormSignUpViewMarketplace.inheritsHelpersFrom(["loginFormSignUpView"]); // necessary or else helpers are missing
//Template.loginFormSignUpViewMarketplace.inheritsEventsFrom(["loginFormSignUpView"]);
Template.loginFormSignUpViewMarketplace.inheritsHooksFrom(["loginFormSignUpView"]); // necessary or else events don't work right

Template.loginFormSignUpViewMarketplace.replaces("loginFormSignUpView");

Template.loginFormSignUpView.clearEventMaps(); // this is necessary to prevent the core "submit form" event from running

/**
 * Events: Login form sign up view
 */
Template.loginFormSignUpView.events({ // for some strange reason our custom event needs to be speficied on the template that we override. doesn't work with our new template name.
  /**
   * Submit sign up form
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "submit form": function (event, template) {
    console.log("Template.loginFormSignUpViewMarketplace.events(submit form)");
    event.preventDefault();

    // var usernameInput = template.$(".login-input--username");
    let emailInput = template.$(".login-input-email");
    let passwordInput = template.$(".login-input-password");
    let isSellerInput = template.$(".login-input-isSeller").prop('checked') && template.$(".login-input-isSeller").val().trim() == "on";
    let nameInput = template.$(".login-input-name");

    let email = emailInput.val().trim();
    let password = passwordInput.val().trim();
    let isSeller = isSellerInput;
    let name = nameInput.val().trim();

    let validatedEmail = LoginFormValidation.email(email);
    let validatedPassword = LoginFormValidation.password(password);
    let validatedIsSeller = LoginFormValidation.isSeller(isSeller);
    let validatedName = LoginFormValidation.name(name);

    let templateInstance = Template.instance();
    let errors = {};

    templateInstance.formMessages.set({});

    if (validatedEmail !== true) {
      errors.email = validatedEmail.reason;
    }

    if (validatedPassword !== true) {
      errors.password = validatedPassword;
    }

    if (validatedIsSeller !== true) {
      errors.isSeller = validatedIsSeller.reason;
    }

    if (validatedName !== true) {
      errors.name = validatedName.reason;
    }

    if ($.isEmptyObject(errors) === false) {
      templateInstance.formMessages.set({
        errors: errors
      });
      // prevent signup
      return;
    }

    console.log("submit form isSeller -", isSeller, "- ");

    let newUserData = {
      email: email,
      password: password,
      isSeller: isSeller,
      profile: {
        name: name,
      }
    };

    Accounts.createUser(newUserData, function (error) {
      if (error) {
        // Show some error message
        //console.log("register fail: ",error);
        error.reason = i18next.t("accountsUI.error."+error.reason.replace(".", ""));
        console.log("register fail: ",error);
        templateInstance.formMessages.set({
          alerts: [error]
        });
      } else {
        // Close dropdown or navigate to page
      }
    });
  }
});
