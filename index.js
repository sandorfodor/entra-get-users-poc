const express = require("express");
const session = require("express-session");
const msal = require("@azure/msal-node");
const axios = require("axios");
const url = require("url");
require("dotenv").config();

const SERVER_PORT = 3000;
const scopes = [
  "user.read",
  "openid",
  "profile",
  "User.ReadWrite.All",
  "Directory.ReadWrite.All",
  "Application.ReadWrite.All",
];
const config = {
  authOptions: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: "https://login.microsoftonline.com/common/",
    knownAuthorities: ["login.microsoftonline.com"],
  },
  request: {
    authCodeUrlParameters: {
      scopes,
      redirectUri: "http://localhost:3000/redirect",
    },
    tokenRequest: {
      redirectUri: "http://localhost:3000/redirect",
      scopes,
    },
  },
  resourceApi: {
    endpoint: "https://graph.microsoft.com/v1.0/users",
  },
};

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set this to true on production
  },
};

const getTokenAuthCode = function (scenarioConfig, clientApplication, port) {
  const serverPort = port || SERVER_PORT;
  const app = express();

  app.use(session(sessionConfig));

  const requestConfig = scenarioConfig.request;

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

    const graphResponse = await axios.get(config.resourceApi.endpoint, options);

    console.log("GRAPH RESPONSE", graphResponse.data);
    res.send({ userData: graphResponse.data });
  });

  return app.listen(serverPort, () =>
    console.log(
      `Msal Node Auth Code Sample app listening on port ${serverPort}!`
    )
  );
};

if (true) {
  const loggerOptions = {
    loggerCallback(loglevel, message, containsPii) {
      console.log(message);
    },
    piiLoggingEnabled: true,
    logLevel: msal.LogLevel.Trace,
  };

  const clientConfig = {
    auth: {
      clientId: config.authOptions.clientId,
      authority: config.authOptions.authority,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      knownAuthorities: config.authOptions.knownAuthorities,
    },
    system: {
      loggerOptions: loggerOptions,
    },
  };

  const publicClientApplication = new msal.PublicClientApplication(
    clientConfig
  );

  return getTokenAuthCode(config, publicClientApplication, null);
}
