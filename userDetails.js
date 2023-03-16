const mongoose = require("mongoose");

const UserDetailsScehma = new mongoose.Schema(
    {
        name:String,
        username:{type:String,unique:true},
        email:{type:String,unique:true},
        pw: String,
        configpw: String,
    },
    {
        collection: "UserInfo",
    }
);

mongoose.model("UserInfo",UserDetailsScehma);