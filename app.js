if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require('method-override'); 
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require('express-session'); //Are not used for production environment
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");
const usersRouter = require("./routes/users.js");


let port = "8080";

app.listen(port, ()=>{
    console.log(`App is listening on port ${port}`)
});

const dbURL = process.env.ATLASDB_URL;

main().then(() => {
    console.log("Connected to Mongo!");
}).catch((err) => {
    console.log(err);
})

async function main() {
    mongoose.connect(dbURL);
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
    mongoUrl : dbURL, 
    crypto: {
        secret : process.env.SECRET
    },
    touchAfter : 24*36000
})

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err);
})

const sessionOptions = {
    store, //store : store can also be written. 
    secret : process.env.SECRET, 
    resave : false, 
    saveUninitialized : true, 
    cookie : {
        expires : Date.now() * 7 * 24 * 60 * 60 * 1000, 
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
}
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/", (req, res) => {
//     res.send("I am root!");
// })

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email : "umer@gmail.com", 
//         username : "Umer Azad"
//     })
//     let registeredUser = await User.register(fakeUser, "helloWord");
//     res.send(registeredUser);
// })

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    // console.log(res.locals.success);
    res.locals.error = req.flash("error");
    // console.log(req.user);
    res.locals.currUser = req.user; //req.user refers to the user object that has been authenticated,
    // console.log(res.locals.currUser);
    next();
})

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter) ///listings/:id/reviews is the parent route
app.use("/", usersRouter);

// app.get("/test", (req, res) => {
//     const list = new Listing({
//         title : "My New Villa", 
//         description : "Near the Beach",
//         price : "1200", 
//         location : "Manora Beach, Karachi", 
//         country : "Pakistan"
//     })
//     list.save().then((res) => {
//         console.log(res);
//     }).catch((err) => {
//         console.log(err);
//     })
//     res.send("Working!");
// })

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("listings/error.ejs", {message});
})