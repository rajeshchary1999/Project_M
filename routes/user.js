const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

// Display the registration form
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// Handle the registration process
router.post("/signup", wrapAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            req.flash('error', 'A user with the given username is already registered');
            return res.redirect('/signup');
        }

        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

// Display the login form
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// Handle the login process
router.post("/login",saveRedirectUrl,  passport.authenticate("local", {
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {
    req.flash("success", "Welcome to Wanderlust! You are logged in.");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
});

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    })
})
module.exports = router;
