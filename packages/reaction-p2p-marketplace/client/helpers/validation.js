
window.LoginFormValidation.isSeller = function(isSeller) {
  //ReactionCore.Log.error("validate isSeller ", isSeller);

  if (isSeller == null || isSeller == "" || isSeller == true || isSeller == false || isSeller == "on" || isSeller == "off") {
    return true;
  }

  // Invalid
  return {
    error: "INVALID_ISSELLER",
    reason: i18next.t('accountsUI.error.invalidIsSeller')
  };
};

window.LoginFormValidation.name = function(name) {
  // Valid
  if (name.length >= 3) {
    return true;
  }

  // Invalid
  return {
    "error": "INVALID_NAME",
    "reason": i18next.t('accountsUI.error.usernameTooShort')
  };
};
