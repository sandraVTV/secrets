require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
// const encrypt = require("mongoose-encryption");  // mongoose encryption
// const md5 = require("md5"); //for hash function
// const bcrypt = require("bcrypt");  //bcrypt
// const saltRounds = 10;  //bcrypt
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

// access env keys
// console.log(process.env.API_KEY);
// console.log(process.env.SECRET);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

// object created from mongoose schema class
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose); // add a plugin

// mongoose encryption
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] }); 

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets"); //render a page
    } else {
        res.redirect("/login"); //redirect to a route
    }
});

app.get("/logout", (req, res, next) => {
    req.logout();
    res.redirect("/");
});

app.post("/register", (req, res) => {
    // username and password are the names form register page inputs
    User.register({ username: req.body.username }, req.body.password, (error, user) => {
        if (error) {
            console.log(error);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, () => {
                // redirect to secrets page wher we ckeck if the user is logged in and if yes, render page
                res.redirect("/secrets");
            });
        }
    });



    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     // Store hash in your password DB.
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash // md5(req.body.password) // only this for hash function
    //     });

    //     newUser.save((error) => {
    //         if (error) {
    //             console.log(error);
    //         } else {
    //             res.render("secrets");
    //         }
    //     });
    // });
});

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (error) => {
        if (error) {
            console.log(error);
        } else {
            passport.authenticate("local")(req, res, () => {
                // redirect to secrets page wher we ckeck if the user is logged in and if yes, render page
                res.redirect("/secrets");
            });
        }
    });

    // const username = req.body.username;
    // const password = req.body.password; // md5(req.body.password); //for hash function

    // User.findOne({ email: username }, (error, foundUser) => {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         if (foundUser) {
    //             bcrypt.compare(password, foundUser.password, function(err, result) {
    //                 if (result === true) {
    //                     res.render("secrets");
    //                 } else {

    //                 }
    //             });
    //         }
    //     }
    // });
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});