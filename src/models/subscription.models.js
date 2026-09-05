/*
id string pk
subscriber ObejctId users
channel ObejctId users 
createAt Date
updateAt Date
*/

import mongoose, { Schema } from "mongoose";
const subscriptionSchema = new Schema (
    {
        subscriber : {
            type : Schema.Types.ObjectId, // one who IS SUBSCRIBING
            ref : "Users"
        },
        channel : {
            type : Schema.Types.ObjectId, // one to whom `Subscriber is SUBSCRIBING`
            ref : "Owner"
        }
    },
    {timestamps: true}
)
export const Subscription = mongoose.model("Subscription ", subscriptionSchema)