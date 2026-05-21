const mongoose = require("mongoose");


// USER SCHEMA
const userSchema = new mongoose.Schema({

   username: {
      type: String,
      required: true
   },

   email: {
      type: String,
      required: true,
      unique: true
   },

   password: {
      type: String,
      required: true
   },

   createdAt: {
      type: Date,
      default: Date.now
   }

});



// MODELS
const User = mongoose.model("User", userSchema);

module.exports = User;