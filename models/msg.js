const {Schema,model} = require("mongoose");


const msgSchema = new Schema ({
    from:{
        type: Schema.Types.ObjectId,
        ref:"users"
    } ,

    to:{
        type: Schema.Types.ObjectId,
        ref:"users"
    } ,

    message:{
        type: String ,
        required:true
    } 

}, {timestamps:true});


const msgModel = model("messages",msgSchema);

module.exports = msgModel;