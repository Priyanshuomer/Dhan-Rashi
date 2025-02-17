const {Schema,model} = require("mongoose");
const {createHmac,randomBytes} = require("crypto");
const {generateTokenForUser} = require("../middlewares/token.js");


const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    } ,

    full_name:{
        type:String,
        required:true,
    } ,

    dob:{
        type:String,
        required:true
    } ,

    aadhar:{
        type:String,
        required:true,
        unique:true
    } ,

    mobile:{
        type:String,
        required:true,
        unique:true
    } ,

    password:{
        type:String,
        required:true
    } ,

    salt:{
        type:String,
    } ,

    profilePhoto:{
        type:String,
        default:"https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-1024.png"
    } ,

    money : {
        type:Number , 
        default : 100
    } , 

    pin : {
        type:String , 
        required:true
    }

},
 {timestamps:true}
);


userSchema.pre("save",function(next) {
    const user = this;
    if(!user.isModified("password"))  return ;
    if(!user.isModified("pin"))  return ;

    const salt = randomBytes(16).toString();

    const hashedPassword = createHmac("sha256",salt)
    .update(user.password)
    .digest("hex");

    const hashedPin = createHmac("sha256",salt)
    .update(user.pin)
    .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;
    this.pin = hashedPin;
    next();

});




userSchema.static("matchPasswordAndGenerateToken" , async function(mobile,password) {
       
    if(!mobile || !password)    
    {
        console.log("Please fill all fields for login");
        return null;
    }

    const user = await this.findOne({mobile});

          if(!user) 
        {
            console.log("User Not Exist");
            return null;
        }

    const salt = user.salt;

    const hashedPassword = user.password;

    const userGivenHashedPassword = createHmac("sha256",salt)
    .update(password)
    .digest("hex");

     if(userGivenHashedPassword !== hashedPassword)
        {
            console.log("Wrong Credentials for login");
            return null;
        }

     return generateTokenForUser(user);


});





const userModel = model("users",userSchema);

module.exports = userModel;