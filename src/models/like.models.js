/*
id string pk
vides objectId vides
comment ObjectId comments
tweet objectId tweets
likedBy ObejctId users
crearteAt Date
updateAt Date
*/

import mongoose, { Schema } from "mongoose";
const likeSchema = new Schema(
    {
// either of `videos` , `comments`, or `tweet` will be assigned others are null
        vides : {
            types : Schema.Types.ObjectId,
            ref : "Vides"
        },
        comment : {
            types : Schema.Types.ObjectId,
            ref : "Comment"
        },
        tweet : {
            types : Schema.Types.ObjectId,
            ref : "tweet"
        },
        likedBy : {
            types : Schema.Types.ObjectId,
            ref : "users"
        },
    },
    {timestamps : true}
)

export const like = mongoose.model("Like", likeSchema)