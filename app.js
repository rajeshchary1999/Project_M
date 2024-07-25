const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const Expresserror = require("./utils/Expresserror.js");
const { listingSchema } = require("./schema.js");

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

//Index Route
app.get("/listings",wrapAsync(async (req, res) => {
  const allListings = await Listing.find({})
  res.render("./listings/index.ejs", {allListings});
}));

//New Route
app.get("/listings/new", async(req, res) => {
  res.render("listings/new.ejs");
});


//Show Route
app.get("/listings/:id",  wrapAsync(async (req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
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
app.post("/listings", wrapAsync (async(req, res, next) => {
  let result = listingSchema.validate(req.body);
  console.log(result);
  if(result.error) {
    throw new Expresserror(400, result.error);
  }
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
  }
));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing});
}));

//Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
  if (!req.body.listing) {
    throw new Expresserror(400, "Send valid data for listing");
  }
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  res.redirect(`/listings/${id}`);
}));

// DElete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  res.redirect("/listings");
}));

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
