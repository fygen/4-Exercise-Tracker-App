//For getting the variable of MONGO_URI which have our username and pass for database connection
require('dotenv').config()
// express needed for req, responses
const express = require('express');
// app is the server which people GET and SET things
const app = express();
// Cross Origin Resource Sharing policy for Freecodecamp to reach out
const cors = require('cors');
// For req.body interactions we need body-parser middleware to handle requests like this req.query req.params req.body."name tag of html"
const bodyParser = require("body-parser");

// Creation of mongoosejs variable empty 
const mongoose = require("mongoose");
//We get Schema definition from mongoose Library
const Schema = mongoose.Schema;
//We need to connect the database by using this function which can also a local file like connect("mongodb://localhost:3000/test") if mongoDB installed on the device
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// For consoling out the ip and URL
app.use((req, res, next) => {
    console.log(`req ip:${req.ip} req url: ${req.url} `);
    next();
})

//When GET '/': then send index.html
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: "false" }));

//Creating a Schemas for a new Object of exr.
const exerciseSchema = new Schema({
    username: { type: String },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now() },
    _id: { type: String, required: true }
})
const userSchema = new Schema({
    username: { type: String, required: true },
})
//We create the User Model by using mongoosejs library and we can make manipulations.
let User = mongoose.model("User", userSchema);
let Exercise = mongoose.model("Exercise", exerciseSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

//When post api/users then send mongoDB servers if user available if not then create one.
app.post("/api/users", (req, res, next) => {
    console.log(`req.body.username: '${req.body.username}'`)
    let userName = req.body.username === "" ? next("Username is empty") : req.body.username;
    User.find({ username: userName }, (err, user) => {
        if (err) console.log(err);
        console.log("In the find:", user)
        if (user.length == 0) {
            let user = new User({ username: userName })
            console.log(user);
            user.save((serr, user) => {
                if (serr) {
                    console.log("Save error:", serr);
                    next(serr);
                }
                else {
                    console.log("User created:", user);
                    // res.json(user);
                    res.json({ "username": user.username, "_id": user._id });
                }
            })
        }
        else if (typeof user !== "undefined") {
            user = user[0];
            console.log("User available:", user);
            res.json({ "username": user.username, "_id": user._id });
        }
        else {
            console.log("Error on find:", err);
            next(err)
        }
    })
})

app.get("/api/users", (req, res, next) => {
    User.find({}, (err, users) => {
        if (err) console.log(err)
        console.log("users found:", users);
        if (users.length !== 0) {
            res.json(users);
        }
        else {
            res.json("Empty");
        }
    })
})

app.post("/api/users/:_id/exercises", (req, res, next) => {
    console.log(req.params._id)
    User.findById(req.params._id, (err, user) => {
        if (err) {
            console.log(err);
            next("err");
        };
        if(!user){
            next(user);
        }
        console.log("user availability:", user);
        if (typeof user !== "undefined") {
            let userName = user.username;
            const userEx = new Exercise({
                _id: req.params._id,
                username: userName,
                date: req.body.date !== "" ? req.body.date : null,
                duration: req.body.duration,
                description: req.body.description
            })
            userEx.save((err) => {
                if (err) console.log(err)
                next(err);
            })
            res.json(userEx);
        }
        else {
            next("user is not created yet")
        }
    })
})


// ADD ABOVE
//When APP launched then listen port 3000 and INFORM the user where the port is used.
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})
