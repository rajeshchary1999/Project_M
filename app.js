const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Expresserror = require("./utils/Expresserror.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.error("Connection error", err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.send("root");
});

// Ensure the correct order of routes
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// Handle 404 errors for all other routes
app.all("*", (req, res, next) => {
  next(new Expresserror(404, "Page Not Found!"));
});

// Custom error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message, statusCode });
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
