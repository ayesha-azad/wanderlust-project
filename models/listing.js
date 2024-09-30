const mongoose = require("mongoose");
const { listingSchema } = require("../schema");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listSchema = new Schema({
    title: {
        type : String, 
        required : true
    }, 
    description : String,
    image : {
        url : String, 
        filename : String
    },
    price : Number, 
    location : String, 
    country : String, 
    reviews : [
        {
            type: Schema.Types.ObjectId, 
            ref : "Review"
        }
    ],
    owner : {
        type : Schema.Types.ObjectId, 
        ref : "User" 
    }, 
    geometry : { 
        type : {
            type: String, 
            enum : ["Point"], 
            required : true
        }, 
        coordinates : {
            type : [Number], 
            required : true 
        }
    }, 
    category : {
        type : String, 
        enum : ["top-cities", "amazing-views", "tropical", "beach", "camping", "mansions", "forests", 
            "countryside", "snowy-areas", "mountains"], 
        required : true
    }
})

listSchema.post("findOneAndDelete", async (listing) => {
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }
})

const Listing = mongoose.model("Listing", listSchema);
module.exports = Listing;