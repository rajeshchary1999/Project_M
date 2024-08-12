const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const usercontroller = require("../controllers/users.js");

// Display the registration form
router.get("/signup", usercontroller.renderSignup);

// Handle the registration process
router.post("/signup", wrapAsync(usercontroller.signUp));

// Display the login form
router.get("/login", usercontroller.renderlogin);

// Handle the login process
router.post("/login",saveRedirectUrl,  passport.authenticate("local", {
    failureRedirect: '/login',
    failureFlash: true
}),usercontroller.login);

router.get("/logout", usercontroller.logout)
module.exports = router;
