
window.ProfileFormValidation = {
  name: function(name) {
    // Valid
    if (name.length >= 3) {
      return true;
    }

    // Invalid
    return {
      "error": "INVALID_NAME",
      "reason": i18next.t("accountsUI.error.usernameTooShort", {defaultValue: "Name too short"})
    };
  },
  description: function(description) {
    // Valid
    if (description.length <= 1000) {
      return true;
    }

    // Invalid
    return {
      "error": "INVALID_DESCRIPTION",
      "reason": i18next.t("accountsUI.error.invalidDescription", {defaultValue: "Description too long"})
    };
  },
  email: function(email, optional) {

    email = email.trim();

    // Valid
    if (optional === true && email.length === 0) {
      return true;
    } else if (email.indexOf('@') !== -1) {
      return true;
    }

    // Invalid
    return {
      error: "INVALID_EMAIL",
      reason: i18next.t('accountsUI.error.invalidEmail')
    };

  },

};
