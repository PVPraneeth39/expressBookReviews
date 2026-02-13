const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

// 👉 make sure this function exists in your project
const { authenticatedUser } = require('./router/auth_users.js');

const app = express();
app.use(express.json());

/* ================= SESSION ================= */
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

/* ================= LOGIN ================= */
app.post("/customer/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    // create token
    const accessToken = jwt.sign(
      { data: password },
      "access",
      { expiresIn: 60 * 60 }
    );

    // store in session
    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

/* ================= AUTH MIDDLEWARE ================= */
app.use("/customer/auth/*", function auth(req, res, next) {
  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const token = req.session.authorization.accessToken;

  try {
    const verified = jwt.verify(token, "access");
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ message: "User not authenticated" });
  }
});

/* ================= ROUTES ================= */
app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = 5000;
app.listen(PORT, () => console.log("Server is running"));
