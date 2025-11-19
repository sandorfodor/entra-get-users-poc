const msal = require("@azure/msal-node");
const url = require("url");
const config = require("../config");
const createConfidentialClientApplication = require("../msalClient");

const clientApplication = createConfidentialClientApplication(
  config.clientConfig
);
const requestConfig = config.clientConfig.request;

module.exports = (req, res) => {
  if (req.query.code)
    return res.redirect(
      url.format({ pathname: "/redirect", query: req.query })
    );

  const { authCodeUrlParameters } = requestConfig;

  const cryptoProvider = new msal.CryptoProvider();

  if (req.query) {
    authCodeUrlParameters.state = req.query.state
      ? req.query.state
      : cryptoProvider.createNewGuid();

    authCodeUrlParameters.nonce = req.query.nonce
      ? req.query.nonce
      : cryptoProvider.createNewGuid();

    // Check for the prompt parameter
    if (req.query.prompt) authCodeUrlParameters.prompt = req.query.prompt;

    // Check for the loginHint parameter
    if (req.query.loginHint)
      authCodeUrlParameters.loginHint = req.query.loginHint;

    // Check for the domainHint parameter
    if (req.query.domainHint)
      authCodeUrlParameters.domainHint = req.query.domainHint;
  }

  req.session.nonce = authCodeUrlParameters.nonce; //switch to a more persistent storage method.
  req.session.state = authCodeUrlParameters.state;

  clientApplication
    .getAuthCodeUrl(authCodeUrlParameters)
    .then((authCodeUrl) => {
      res.redirect(authCodeUrl);
    });
};
