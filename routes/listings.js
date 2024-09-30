const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListings } = require("../middleware.js");
const { index, renderNewForm, showListing, createListing, renderEditForm, updateListing, destroyListing, renderCategory, searchListing } = require("../controllers/listings.js");

const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
//const upload = multer({ dest: 'uploads/' }); files were being saved to uploads

// router.get or router.post uses the same routes so it is being replaced with router.route 

router.route("/")
.get(wrapAsync(index))
.post(
    isLoggedIn,  
    upload.single('listing[image]'), 
    validateListings, 
    wrapAsync(createListing))
// .post(upload.single('listing[image]'), (req, res) => {
//     res.send(req.file);
// }) for debugging

//if it is written below /listings/:id node thinks that new is the id
router.get("/new", 
    isLoggedIn, 
    renderNewForm)

router.route("/category")
.get(renderCategory)
.post(searchListing);

router.route("/:id")
.get(wrapAsync(showListing))
.put(isLoggedIn, isOwner, upload.single('listing[image]'), 
    validateListings,  
    wrapAsync(updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(destroyListing))

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(renderEditForm))

module.exports = router;