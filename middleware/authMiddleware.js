const jwt = require("jsonwebtoken");

const SECRET_KEY = "Web_log_analyzer_private_key";
function isLoggedIn(req,res,next){

   const token = req.cookies.token;

   if(!token){
return res.status(401).json({
    error: "No token provided"
});
   }

   jwt.verify(token, SECRET_KEY, (err, decoded)=>{

      if(err){
     return res.status(401).json({
    error: "Invalid Token"
});
      }

      req.user = decoded;
      next();
   });
}
module.exports = isLoggedIn;