const mongoose = require("mongoose");

mongoose.set('strictQuery', false);

mongoose.connect(
"mongodb+srv://Niraj:niraj123@web-log-db.dainkvm.mongodb.net/web-log-db?retryWrites=true&w=majority"
)
.then(()=> console.log("DB Connected"))
.catch((err)=> console.log(err));