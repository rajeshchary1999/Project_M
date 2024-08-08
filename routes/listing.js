const express = require("express");
const router = express.Router();
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

console.log('Listing Schema:', listingSchema); // Debugging the import

// Index Route
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
}));

// New Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});


// Show Route
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews").populate("owner")
  if (listing && typeof listing.price === 'number') {
    listing.formattedPrice = listing.price.toLocaleString("en-IN", {
      style: 'currency',
      currency: 'INR'
    });
  } else {
    listing.formattedPrice = "Invalid price";
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
}));

// Create Route
router.post("/",isLoggedIn,  validateListing, wrapAsync(async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
}));

// Edit Route
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

// Update Route
router.put("/:id", isLoggedIn,isOwner, validateListing,  wrapAsync(async (req, res) => {
  let  { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id",isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}));

module.exports = router;
