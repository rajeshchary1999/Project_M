const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Expresserror = require("../utils/Expresserror.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new Expresserror(400, errMsg);
    } else {
        next();
    }
};

// Reviews
router.post("/", validateReview, wrapAsync(async (req, res) => {
    console.log(req.body); // Log the entire request body
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
        throw new Expresserror(404, "Listing not found");
    }

    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

// Delete route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    if (!listing) {
        throw new Expresserror(404, "Listing not found");
    }

    let review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
        throw new Expresserror(404, "Review not found");
    }

    res.redirect(`/listings/${id}`);
}));

module.exports = router;

