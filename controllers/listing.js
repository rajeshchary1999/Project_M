const Listing = require("../models/listing.js")

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
    .populate("owner")
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
};

module.exports.createlis = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEdit = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
};

module.exports.updatelis = async (req, res) => {
    let  { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
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