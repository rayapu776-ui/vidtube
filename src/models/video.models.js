/*
owner objectId string
videoFile string
thumbnail string
title string
description string
duration number
views numbers ispublished boolean
createdAt date
updateAt date
*/
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const  videoSchema = new Schema({

    videoFile : {
        type : String ,// cloudinary url
        required : true,
    },
    thumbnail : {
        type : String,
        required : true,
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true,
    },
    views : {
        type :Number ,
        default : 0
    },
    duration : {
        type :Number ,
        required : true
    },
    isPUblished : {
        type : Boolean,
        default : true
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
},
{timestamps : true}
)

videoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video", videoSchema)
