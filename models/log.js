const mongoose=require("mongoose")

// LOG SCHEMA
const logSchema = new mongoose.Schema({

   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
   },

   originalFileName: {
      type: String,
      required: true
   },

   uploadDate: {
      type: Date,
      default: Date.now
   },

   logType: {
      type: String
   },

   filePath: {
      type: String
   },

   totalRequests: {
      type: Number
   },

   errorCount: {
      type: Number
   },

   topRoute: {
      type: String
   }

});

const Log = mongoose.model("Log", logSchema);
module.exports = Log;