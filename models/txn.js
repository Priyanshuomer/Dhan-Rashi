const {Schema,model} = require("mongoose");


const txnSchema = new Schema ({
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

} , {timestamps:true});


const txnModel = model("transactions",txnSchema);

module.exports = txnModel;