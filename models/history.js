const mongoose=require("mongoose")

const HistorySchema=new mongoose.Schema({

    filename:{
        type:String,
        required:true
    },

    totalRequests:{
        type:Number,
        required:true
    },

    errorCount:{
        type:Number,
        required:true
    },

    topRoute:{
        type:String,
        required:true
    },

    uploaddate:{
        type:Date,
        required:true,
    }
})

const History =
mongoose.model("History", HistorySchema);

module.exports = History;