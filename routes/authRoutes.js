const express = require("express");
const router = express.Router();
const SECRET_KEY = "Web_log_analyzer_private_key";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");

// SIGNUP ROUTE
router.post("/signup", async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    const existingUser = await User.findOne({
        email: email
    });

    if (existingUser) {
        return res.send("Mail is already in use");
    }

    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, async function (err, hash) {

        if (err) {
            return res.send("Error hashing password");
        }

        await User.create({
            username: username,
            email: email,
            password: hash
        });

        res.send("Account created");

    });

});

//Login route
router.post("/login",async(req,res)=>{
  const email=req.body.email;
  const user = await User.findOne({ email });
 const password = req.body.password;
  
  if (!user){
    res.send("User not found")
  }
   
  else{
      const hash=user.password;
    bcrypt.compare(password, hash, function(err, result) {
    if(!result){
      res.send("email or password is incorrect")
    }
    else{

      const payload = {

   id: user._id,

   email: user.email

}

const token=jwt.sign(payload,SECRET_KEY,{expiresIn:'1h'})
res.cookie("token",token)
res.send("Login successful")
    }
});
  }
})

// TEST ROUTE
router.get("/read", (req, res) => {
    console.log(req.cookie);

    res.send("Done");

    console.log(req.cookie);
});

//Logout
router.get("logout",(req,res)=>{

    cookie.clearCookie();
    res.redirect("/login")
})

//Histor


module.exports = router;