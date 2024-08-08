const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema, reviewSchema } = require("./schema.js");
const Expresserror = require("./utils/Expresserror.js");
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a listing");
        return res.redirect("/login");
    };
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    };
    next();
};


module.exports.isOwner = async (req, res, next) => {
    let  { id } = req.params;
    let listing = await Listing.findById(id);
    if( !listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permisson to edit");
    return res.redirect(`/listings/${id}`);
  };
  next();
};

 module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
      const errMsg = error.details.map(el => el.message).join(',');
      throw new Expresserror(400, errMsg);
    } else {
      next();
    }
  };

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new Expresserror(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let  { id,reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if( !review.author.equals(res.locals.currUser._id)) {
  req.flash("error", "You did not create this review");
  return res.redirect(`/listings/${id}`);
};
next();
};