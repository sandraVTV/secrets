require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
// const encrypt = require("mongoose-encryption");  // mongoose encryption
// const md5 = require("md5"); //for hash function
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

// access env keys
// console.log(process.env.API_KEY);
// console.log(process.env.SECRET);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

// object created from mongoose schema class
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// mongoose encryption
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] }); 

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    // username and password are the names form register page inputs
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash // md5(req.body.password) // only this for hash function
        });

        newUser.save((error) => {
            if (error) {
                console.log(error);
            } else {
                res.render("secrets");
            }
        });
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password; // md5(req.body.password); //for hash function

    User.findOne({ email: username }, (error, foundUser) => {
        if (error) {
            console.log(error);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if (result === true) {
                        res.render("secrets");
                    } else {

                    }
                });
            }
        }
    });
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});