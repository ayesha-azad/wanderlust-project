const express = require("express");
const router = express.Router({mergeParams : true}); //This will give id of the listings which is in app.js
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReviews, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const { createReviews, destroyReviews } = require("../controllers/reviews.js");
const { destroyListing } = require("../controllers/listings.js");

router.post("/", isLoggedIn, validateReviews, wrapAsync(createReviews));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(destroyReviews))

module.exports = router;