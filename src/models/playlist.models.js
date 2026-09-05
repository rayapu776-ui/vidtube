/*
id string pk
owner ObjectId users
vides ObejctId[] videos
name string
description String
createAt Date
updateAt Date
*/

import mongoose, { Schema } from "mongoose";
const playlistSchema = new Schema (
    {
        name : {
            type : String,
            required : true,
        },
        description : {
            type : String,
            required : true,
        },
        vides : [{
            type : Schema.Types.ObjectId,
            ref : "Video",
        }],
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {timestamps : true}
)

export const Playlist = mongoose.model("Playlist",playlistSchema)