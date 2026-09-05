/*
id string pk
content string
createAt Date
videos ObejctId[] videos
owner Obejct users
*/

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    content :{
        type : String,
        required : true
    },
    video : {
        type : Schema.Types.ObjectId,
        ref : videos
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : Users
    }
},
{timestamps : true}
)
commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment ", commentSchema)