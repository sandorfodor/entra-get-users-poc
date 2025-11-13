const SERVER_PORT = 3000;
const scopes = [
  "user.read",
  "openid",
  "profile",
  "User.ReadWrite.All",
  "Directory.ReadWrite.All",
  "Application.ReadWrite.All",
];
const clientConfig = {
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

module.exports = {
  SERVER_PORT,
  clientConfig,
  sessionConfig,
};
