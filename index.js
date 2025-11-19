require("dotenv").config();
const express = require("express");
const session = require("express-session");
const config = require("./config");
const loginController = require("./routes/login");
const redirectController = require("./routes/redirect");
const updateUserController = require("./routes/update_user");

const app = express();
app.use(session(config.sessionConfig));
app.set("view engine", "pug");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", loginController);
app.get("/redirect", redirectController);
app.get("/update_user", updateUserController);

app.listen(config.SERVER_PORT, () =>
  console.log(
    `Msal Node Auth Code Sample app listening on port ${config.SERVER_PORT}!`
  )
);
