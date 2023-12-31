const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        min: 3,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        min:5
    },
    isAvatarImageSet:{
     type:Boolean,
     default:false
    },
    avataarImage:{
     type:String,
     default:""
    }
})

module.exports= mongoose.model("Users",userSchema);