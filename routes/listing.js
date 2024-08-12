const express = require("express");
const router = express.Router();
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

console.log('Listing Schema:', listingSchema); // Debugging the import

const listingControllers = require("../controllers/listing.js");

// Index Route
router.get("/",
   wrapAsync(listingControllers.index) 
);


// New Route
router.get("/new", isLoggedIn, listingControllers.newform);


// Show Route
router.get("/:id", wrapAsync(listingControllers.showlis));

// Create Route
router.post("/",isLoggedIn,  validateListing, wrapAsync(listingControllers.createlis));

// Edit Route
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingControllers.renderEdit));

// Update Route
router.put("/:id", isLoggedIn,isOwner, validateListing,  wrapAsync(listingControllers.updatelis));

// Delete Route
router.delete("/:id",isOwner, wrapAsync(listingControllers.renderDelete));

module.exports = router;
