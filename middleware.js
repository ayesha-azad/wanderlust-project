const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema, reviewSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = ((req, res, next) => {
    if(!req.isAuthenticated()){
        // console.log(req);
        req.session.redirectURL = req.originalUrl;
        req.flash("error", "You must login first to use this functionality!");
        return res.redirect("/login")
    }
    next();
})

module.exports.saveRedirectUrl = ((req, res, next) => {
    if(req.session.redirectURL){
        res.locals.redirectURL = req.session.redirectURL;
    }
    next();
})

module.exports.isOwner = (async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
})

module.exports.isReviewAuthor = (async (req, res, next) => {
    let {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
})

module.exports.validateListings = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    // console.log(result);
    if(error){
        throw new ExpressError(400, error);
    }else{
        next();
    }
}

module.exports.validateReviews = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400, error);
    }
    else{
        next();
    }
}
