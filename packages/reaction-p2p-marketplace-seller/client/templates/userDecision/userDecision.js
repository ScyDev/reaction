
function checkTermsAndConditions() {
  if ($('.login-input-acceptedTerms').prop('checked') == true) {
    console.log("terms accepted");
    return true;
  }
  else {
    console.log("terms not accepted!");
    Alerts.inline(i18next.t('accountsUI.error.mustAcceptTerms', {defaultValue: "You must accept the terms and conditions"}), "error", {
      placement: "terms",
      autoHide: 10000
    });
  }

}

Template.marketplaceUserDecision.events(
{
    "click .login-input-acceptedTerms": function (event, template)
    {
      if ($('.login-input-acceptedTerms').prop('checked') == true) {
        let isSeller = $('.login-input-isSeller').prop('checked');
        let acceptedTerms = $('.login-input-acceptedTerms').prop('checked');

        Meteor.call("accounts/userDecide", isSeller, acceptedTerms, function(error, result) {
          console.log("result: ",result);
          if (result && !error) {
            if (result.isSeller) {
              $('#main').css("visibility", "hidden");
              // this is necessary to ensure users new permissions are in effect
              //window.location.reload(true);
              window.location.href = "/snaxter/account/profile";

              //ReactionRouter.reload(); // doesn't help
              //ReactionRouter.go("/");

              /* // this doesn't work, even with timeout
              Meteor.setTimeout(function(){
                ReactionRouter.go("/");
              }, 500);*/
            }
            else {
              ReactionRouter.go("/");
            }
          }
          else if (error) {
            Alerts.inline(i18next.t('accountsUI.error.mustAcceptTerms', {defaultValue: "You must accept the terms and conditions"}), "error", {
              placement: "terms",
              autoHide: 10000
            });
          }
        });
      }
    },
    "click .login-input-isSeller": function (event, template)
    {
      console.log("seller desu!");

      $('#agb-link-seller').show();
      $('.decision-block').hide();
      $('.terms-block').fadeIn();

      $('.login-input-isBuyer').prop('checked', false);
    },
    "click .login-input-isBuyer": function (event, template)
    {
      console.log("buyer desu!");

      $('#agb-link-buyer').show();
      $('.decision-block').hide();
      $('.terms-block').fadeIn();

      $('.login-input-isSeller').prop('checked', false);
    },
  }
);
