const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
};

module.exports.newform = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showlis = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({
    path: "reviews",
    populate: {
      path: "author",
    },
  })
  .populate("owner");
  
  if (listing) {
      console.log("Listing Coordinates:", listing.geometry.coordinates); // Debugging

      if (typeof listing.price === 'number') {
          listing.formattedPrice = listing.price.toLocaleString("en-IN", {
              style: 'currency',
              currency: 'INR'
          });
      } else {
          listing.formattedPrice = "Invalid price";
      }

      res.render("listings/show.ejs", { listing });
  } else {
      req.flash("error", "Listing not found");
      res.redirect("/listings");
  }
};

// module.exports.showlis = async (req, res) => {
//     const { id } = req.params;
//     const listing = await Listing.findById(id)
//     .populate({
//       path: "reviews",
//       populate: {
//         path: "author",
//       },
//     })
//     .populate("owner")
//     if (listing && typeof listing.price === 'number') {
//       listing.formattedPrice = listing.price.toLocaleString("en-IN", {
//         style: 'currency',
//         currency: 'INR'
//       });
//     } else {
//       listing.formattedPrice = "Invalid price";
//     }
//     console.log(listing);
//     res.render("listings/show.ejs", { listing });
// };

module.exports.createlis = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEdit = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist");
      res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/,w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updatelis = async (req, res) => {
    let  { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if (typeof req.file !== "undefined")  {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename};
    await listing.save();
    };

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.renderDelete = async (req, res) => {
    const { id } = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};