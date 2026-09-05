/*
id string pk
owner OBjectId users
content String
createAt Date
updateAt Date
*/
import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema({
    owner : {
        type : Schema.Types.ObjectId,
        ref : "Users",
    },
    content : {
        type : String,
        required : true
    }
},
{timestamps: true}
)

export const Tweet = mongoose.model("Tweet",tweetSchema)