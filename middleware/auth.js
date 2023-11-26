const jwt = require("jsonwebtoken");

const secret = "my-xcecret";

const authenticateJson = (req, res, next) => {
  console.log("Hi 16");
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  if (token) {
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        res.status(403).json();
      }
      req.user = user;
      next();
    });
  } else {
    console.log("Hi 17");
    res.status(401).json();
  }
};

module.exports = {
  authenticateJson,
  secret,
};
