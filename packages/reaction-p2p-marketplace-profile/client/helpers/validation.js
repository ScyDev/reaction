
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
      "reason": i18next.t("accountsUI.error.invalidDescription", {defaultValue: "Dscription too long"})
    };
  },
};
