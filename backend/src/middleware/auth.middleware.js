const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const userServ = require("../service/user.service");

const authCheck = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers["authorization"]) {
      token = req.headers["authorization"];
    }
    // console.log(token)
    if (req.headers["x-xsrf-token"]) {
      token = req.headers["x-xsrf-token"];
    }

    if (req.query["token"]) {
      token = req.query["token"];
    }
    if (!token || token === "" || token === null) {
      next({ status: 401, msg: "Please login first!!" });
    } else {
      // token => ["token"]
      token = token.split(" ").pop();
      if (!token) {
        next({ status: 401, msg: "Token not set" });
      }

      let data = jwt.verify(token, process.env.JWT_SECRET);
      // data
      let user = await userServ.getUserById(data.userId);
      if (!user) {
        next({ status: 403, msg: "User does not exists." });
      }
      req.authUser = user;
      req.user = user;
      req.userId = user._id;
      // console.log(req.user)
      next();
    }
  } catch (exception) {
    //console.log("AuthException: ", exception)
    next({ status: 401, msg: exception?.message });
  }
};

module.exports = authCheck;
