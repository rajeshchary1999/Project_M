const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

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
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
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
router.post("/login", passport.authenticate("local", {
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {
    req.flash("success", "Welcome to Wanderlust! You are logged in.");
    res.redirect("/listings");
});

module.exports = router;
