const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const { initialize } = require("passport");

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
})

async function main() {
    mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

async function init() {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "66ed028ba148c2b017dcb863"}))
    await Listing.insertMany(initData.data);
    console.log("Data initialised!");
}

init();