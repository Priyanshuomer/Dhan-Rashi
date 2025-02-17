const {Schema,model} = require("mongoose");


const requestSchema = new Schema ({
    from:{
        type: Schema.Types.ObjectId,
        ref:"users"
    } ,

    to:{
        type: Schema.Types.ObjectId,
        ref:"users"
    } ,

    amount:{
        type: Number ,
        required:true
    } ,

    remarks:{
        type: String
    } , 

     pendingStatus:{
        type:Number , 
        default:0 
     }

} , {timestamps:true});


const requestModel = model("requestedamounts",requestSchema);

module.exports = requestModel;