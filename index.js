require("dotenv").config();
const express = require("express");
const session = require("express-session");
const msal = require("@azure/msal-node");
const axios = require("axios");
const url = require("url");
const config = require("./config");
const createPublicClientApplication = require("./msalClient");

const clientApplication = createPublicClientApplication(config.clientConfig);
const app = express();
app.use(session(config.sessionConfig));
const requestConfig = config.clientConfig.request;

app.get("/", (req, res) => {
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
});

app.get("/redirect", async (req, res) => {
  const tokenRequest = {
    ...requestConfig.tokenRequest,
    code: req.query.code,
    state: req.query.state,
  };
  const authCodeResponse = {
    nonce: req.session.nonce,
    code: req.query.code,
    state: req.session.state,
  };

  const response = await clientApplication.acquireTokenByCode(
    tokenRequest,
    authCodeResponse
  );

  console.log(
    "Successfully acquired token using Authorization Code.",
    JSON.stringify(response)
  );

  const options = {
    headers: {
      Authorization: `Bearer ${response.accessToken}`,
    },
  };

  console.log("request made to web API at: " + new Date().toString());

  const graphResponse = await axios.get(
    config.clientConfig.resourceApi.endpoint,
    options
  );

  console.log("GRAPH RESPONSE", graphResponse.data);
  res.send({ userData: graphResponse.data });
});

app.listen(config.SERVER_PORT, () =>
  console.log(
    `Msal Node Auth Code Sample app listening on port ${config.SERVER_PORT}!`
  )
);
