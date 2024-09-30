const Listing = require("../models/listing");
const Review = require("../models/review");


module.exports.createReviews = async (req, res) =>{
    let listing = await Listing.findById(req.params.id);
    let review = new Review(req.body.review);
    review.author = req.user._id;
    listing.reviews.push(review);
    review.save().then(res => console.log(res)).catch(err => console.log(err));
    listing.save().then(res => console.log(res)).catch(err => console.log(err));
    // res.send("Review is saved");
    req.flash("success", "Review has been successfully added!");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReviews = async(req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("error", "Review has been successfully deleted!");
    res.redirect(`/listings/${id}`)
}