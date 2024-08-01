const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Expresserror = require("../utils/Expresserror.js");

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
      let  errMsg = error.details.map((el) => el.message).join(",");
      throw new Expresserror(400, errMsg);
    } else {
      next();
    }
};

//Index Route
router.get("/",wrapAsync(async (req, res) => {
    const allListings = await Listing.find({})
    res.render("./listings/index.ejs", {allListings});
}));
  
//New Route
router.get("/new", async(req, res) => {
    res.render("listings/new.ejs");
});
  
  
//Show Route
  router.get("/:id",  wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (listing && typeof listing.price === 'number') {
      // Ensure the price is a number and format it
      listing.formattedPrice = listing.price.toLocaleString("en-IN", {
        style: 'currency',
        currency: 'INR'
      });
    } else {
      listing.formattedPrice = "Invalid price";
    }
    res.render("listings/show.ejs", {listing});
}));
  
//create Route
router.post("/", validateListing,  wrapAsync (async(req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    }
));
  
//Edit Route
  router.get("/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));
  
//Update Route
  router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));
  
// DElete route
  router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
}));

module.exports = router;