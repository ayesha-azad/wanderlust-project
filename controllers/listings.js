const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res, next) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderCategory = async (req, res, next) => {
    let category = req.query.category;
    // res.send(category);
    const categoryListings = await Listing.find({category: category});
    res.render("listings/category.ejs", {categoryListings})
}

module.exports.searchListing = async (req, res, next) => {
    let { search } = req.body;
    // res.send(search);
    if(search){
        try{
            let categoryListings = await Listing.find({
                country: {$regex : new RegExp(search, "i")}
            });
            return res.render("listings/category.ejs", {categoryListings})
        }
        catch(err){
            console.log(err);
            res.redirect("/listings")
        }
    }
    else{
        req.flash("error", "Data of this country is not found!");
        res.redirect("/listings");
    }
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res, next) =>{
    let { id } = req.params;
    // console.log(id);
    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate : {path : "author"}})
    .populate("owner");
    if(!listing){
        req.flash("error", "This listing does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res, next) => {

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send()

    // const newListing = req.body.listing; 
    // res.send(newListing);
    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url, "..", filename);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash("success", "Listing has been successfully added!");
    res.redirect("/listings");

}

module.exports.renderEditForm = async (req, res, next)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    // console.log(listing);
    if(!listing){
        req.flash("error", "This listing does not exist!");
        res.redirect("/listings");
    }

    let originalImageURL = listing.image.url;
    originalImageURL = originalImageURL.replace("/upload", "/upload/w_300,h_250,e_blue:100")
    res.render("listings/edit.ejs", { listing, originalImageURL });
}

module.exports.updateListing = async(req, res, next) => {
    let { id } = req.params;
    // console.log(id);

    let updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = {url, filename};
        updatedListing.save();
    }
  
    req.flash("success", "Listing has been successfully updated!");
    res.redirect(`/listings/${id}`)
}

module.exports.destroyListing = async (req, res, next) => {
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    req.flash("error", "Listing has been successfully deleted!");
    res.redirect("/listings");
}