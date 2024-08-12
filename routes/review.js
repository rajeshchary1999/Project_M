const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Expresserror = require("../utils/Expresserror.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewControllers = require("../controllers/review.js");

// Reviews
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewControllers.createReview));

// Delete route
router.delete("/:reviewId", isLoggedIn,isReviewAuthor, wrapAsync(reviewControllers.deletereview));

module.exports = router;

