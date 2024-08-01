const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const Expresserror = require("./utils/Expresserror.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const listings = require("./routes/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("conected to db");
  })
  .catch((err) => {
    console.log(err);
});
 

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


app.get("/", (req, res) => {
    res.send("root");
});

const validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);
  if(error) {
    let  errMsg = error.details.map((el) => el.message).join(",");
    throw new Expresserror(400, errMsg);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new Expresserror(400, errMsg);
  } else {
      next();
  }
};

app.use("/listings",listings);

//Reviews
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
  console.log(req.body); // Log the entire request body
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}));

//Delete route
// Reviews
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId} = req.params;

  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
  await Review.findById(reviewId);
  res.redirect(`/listings/${id}`)
}))
app.all("*", (req, res, next) => {
  next(new Expresserror(404,"Page Not Found!"));
})

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong!"} = err;
  res.status(statusCode).render("error.ejs",{message})
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});
