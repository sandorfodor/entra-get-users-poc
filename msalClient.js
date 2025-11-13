const msal = require("@azure/msal-node");

function createPublicClientApplication(config) {
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

  return new msal.PublicClientApplication(clientConfig);
}

module.exports = createPublicClientApplication;
