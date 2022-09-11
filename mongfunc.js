
require('dotenv').config()
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date }
})

const userSchema = new Schema({
  username: { type: String, required: true },
  exercises: [{type: exerciseSchema, required: false}]
})

let User = mongoose.model("User", userSchema);