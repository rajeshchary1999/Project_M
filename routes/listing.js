const express = require("express");
const router = express.Router();
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

console.log('Listing Schema:', listingSchema); // Debugging the import

const listingControllers = require("../controllers/listing.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
.get(
   wrapAsync(listingControllers.index) 
)
.post(upload.single('listing[image]'), (req, res) => {
   res.send(req.file);
})
// New Route
router.get("/new", isLoggedIn, listingControllers.newform);


router.route("/:id")
.get( wrapAsync(listingControllers.showlis))
.put( isLoggedIn,isOwner, validateListing,  wrapAsync(listingControllers.updatelis))
.delete(isOwner, wrapAsync(listingControllers.renderDelete));


// Edit Route
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingControllers.renderEdit));

module.exports = router;
