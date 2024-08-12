const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
    console.log(req.body); // Log the entire request body
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
        throw new Expresserror(404, "Listing not found");
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deletereview = async (req, res) => {
    let { id, reviewId } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    if (!listing) {
        throw new Expresserror(404, "Listing not found");
    }

    let review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
        throw new Expresserror(404, "Review not found");
    }
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};