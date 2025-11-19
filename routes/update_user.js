const axios = require("axios");
const config = require("../config");

module.exports = async (req, res) => {
  try {
    const options = {
      headers: {
        Authorization: `Bearer ${req.query.accessToken}`,
      },
    };

    console.log("request made to web API at: " + new Date().toString());

    const patchResponse = await axios.patch(
      `${config.clientConfig.resourceApi.endpoint}/${req.query.userId}`,
      {
        displayName:
          "Test user - " +
          Math.floor(Math.random() * (100 - 0 + 1) + 0).toString(),
      },
      options
    );

    console.log("PATCH RESPONSE", patchResponse.data);

    const graphResponse = await axios.get(
      config.clientConfig.resourceApi.endpoint,
      options
    );
    res.render("users", {
      users: graphResponse.data.value,
      accessToken: req.query.accessToken,
    });
  } catch (err) {
    console.log("redirect error", err);
    res.render("redirect_error", {
      error: JSON.stringify(err, undefined, 2),
      accessToken: req.query.accessToken,
    });
  }
};
