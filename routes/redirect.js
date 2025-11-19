const axios = require("axios");
const config = require("../config");
const createConfidentialClientApplication = require("../msalClient");

const clientApplication = createConfidentialClientApplication(
  config.clientConfig
);
const requestConfig = config.clientConfig.request;

module.exports = async (req, res) => {
  try {
    let accessToken = "";
    if (req.query.code) {
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
      accessToken = response.accessToken;
    } else if (req.query.accessToken) {
      accessToken = req.query.accessToken;
    }

    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    console.log("request made to web API at: " + new Date().toString());

    const graphResponse = await axios.get(
      config.clientConfig.resourceApi.endpoint,
      options
    );

    console.log("GRAPH RESPONSE", graphResponse.data);
    res.render("users", {
      users: graphResponse.data.value,
      accessToken: accessToken,
    });
  } catch (err) {
    console.log("redirect error", err);
    if (
      (err.errorCode && err.errorCode === "request_cannot_be_made") ||
      (err.code && err.code === "ERR_BAD_REQUEST")
    ) {
      res.redirect("/");
    } else {
      res.render("redirect_error", {
        error: JSON.stringify(err),
        accessToken: req.query.accessToken,
      });
    }
  }
};
