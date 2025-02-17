const jwt = require("jsonwebtoken");
const userModel = require("../models/user.js");
require('dotenv').config();

const key = process.env.JWT_SECRET_KET;
console.log("key   ",key)

function generateTokenForUser(user)
{
    return jwt.sign({
        _id:user._id,
        email:user.email,
        aadhar:user.aadhar,
        mobile:user.mobile
    },key);
}


function getUserByToken(token)
{
    if(!token)
     return null;
    try{
        return jwt.verify(token,key);
    }
    catch(error){
        console.log("error");
        return null;
    }
}

function checkUserAuthentication(cookieValue){
    return (req,res,next) => {
        const token = req.cookies[cookieValue];  
        if(!token)
        {
            return next();
        }

         try{
            const user = getUserByToken(token);
             req.user = user;

         }catch(error)
         {
            console.log(error);
        }

         return next();
    }

}



module.exports = {
    checkUserAuthentication , generateTokenForUser , getUserByToken
                };


